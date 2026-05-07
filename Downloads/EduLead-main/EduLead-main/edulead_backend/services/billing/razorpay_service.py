import razorpay
import hmac
import hashlib
import logging
from django.conf import settings
from apps.tenants.models import Tenant
from apps.subscriptions.models import Subscription

logger = logging.getLogger(__name__)

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

QUOTA_MAP = {
    'basic': 10,
    'pro': 30,
    'premium': 100,
}

PRIORITY_MAP = {
    'basic': 1,
    'pro': 2,
    'premium': 3,
}


class RazorpayService:

    def create_subscription(self, tenant_id: str, plan: str) -> dict:
        tenant = Tenant.objects.get(id=tenant_id)
        plan_id = {
            'basic': settings.RAZORPAY_BASIC_PLAN_ID,
            'pro': settings.RAZORPAY_PRO_PLAN_ID,
            'premium': settings.RAZORPAY_PREMIUM_PLAN_ID,
        }[plan]

        subscription = client.subscription.create({
            'plan_id': plan_id,
            'customer_notify': 1,
            'total_count': 12,
            'notes': {
                'tenant_id': str(tenant_id),
                'tenant_name': tenant.name,
                'plan': plan,
            }
        })

        tenant.razorpay_subscription_id = subscription['id']
        tenant.save(update_fields=['razorpay_subscription_id'])

        logger.info(f"Created Razorpay subscription {subscription['id']} for tenant {tenant_id} ({plan})")
        return {
            'subscription_id': subscription['id'],
            'short_url': subscription.get('short_url', ''),
            'payment_link': f"https://rzp.io/l/{subscription['id']}",
        }

    def create_payment_link(self, tenant_id: str, plan: str) -> dict:
        amount_map = {
            'basic': 299900,
            'pro': 699900,
            'premium': 1499900,
        }
        tenant = Tenant.objects.get(id=tenant_id)
        payment_link = client.payment_link.create({
            'amount': amount_map[plan],
            'currency': 'INR',
            'description': f'EduLeads Kerala — {plan.title()} Plan',
            'customer': {
                'name': tenant.name,
                'email': tenant.billing_email or tenant.contact_email,
            },
            'notify': {'sms': True, 'email': True},
            'reminder_enable': True,
            'notes': {
                'tenant_id': str(tenant_id),
                'plan': plan,
            },
            'callback_url': f"{settings.FRONTEND_URL}/dashboard/billing/success",
            'callback_method': 'get',
        })
        logger.info(f"Created Razorpay payment link for tenant {tenant_id} ({plan})")
        return {
            'payment_link_id': payment_link['id'],
            'short_url': payment_link['short_url'],
        }

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        expected = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    def handle_payment_captured(self, payload: dict):
        payment = payload['payload']['payment']['entity']
        tenant_id = payment['notes'].get('tenant_id')
        plan = payment['notes'].get('plan')
        if tenant_id and plan:
            self._activate_plan(tenant_id, plan)
            logger.info(f"Payment captured — activated {plan} for tenant {tenant_id}")

    def handle_subscription_charged(self, payload: dict):
        subscription = payload['payload']['subscription']['entity']
        sub_id = subscription['id']
        try:
            tenant = Tenant.objects.get(razorpay_subscription_id=sub_id)
            self._reset_monthly_quota(tenant)
            logger.info(f"Subscription recharged for tenant {tenant.id}")
        except Tenant.DoesNotExist:
            logger.error(f"No tenant found for Razorpay subscription {sub_id}")

    def handle_subscription_cancelled(self, payload: dict):
        subscription = payload['payload']['subscription']['entity']
        sub_id = subscription['id']
        try:
            tenant = Tenant.objects.get(razorpay_subscription_id=sub_id)
            self._downgrade_to_basic(tenant)
            logger.info(f"Subscription cancelled — downgraded tenant {tenant.id} to basic")
        except Tenant.DoesNotExist:
            logger.error(f"No tenant found for cancelled subscription {sub_id}")

    def handle_payment_failed(self, payload: dict):
        payment = payload['payload']['payment']['entity']
        tenant_id = payment['notes'].get('tenant_id')
        if tenant_id:
            self._schedule_grace_period_downgrade(tenant_id)
            logger.warning(f"Payment failed for tenant {tenant_id} — grace period started")

    def _activate_plan(self, tenant_id: str, plan: str):
        tenant = Tenant.objects.get(id=tenant_id)
        tenant.plan = plan
        tenant.monthly_quota = QUOTA_MAP[plan]
        tenant.save(update_fields=['plan', 'monthly_quota'])
        Subscription.objects.update_or_create(
            tenant=tenant,
            defaults={
                'plan': plan,
                'status': 'active',
                'razorpay_subscription_id': tenant.razorpay_subscription_id or '',
            }
        )

    def _reset_monthly_quota(self, tenant: Tenant):
        unused = max(0, tenant.monthly_quota - tenant.used_quota)
        rollover = min(unused, tenant.monthly_quota // 2)
        tenant.used_quota = 0
        tenant.rollover_quota = rollover
        tenant.save(update_fields=['used_quota', 'rollover_quota'])

    def _downgrade_to_basic(self, tenant: Tenant):
        tenant.plan = 'basic'
        tenant.monthly_quota = QUOTA_MAP['basic']
        tenant.razorpay_subscription_id = None
        tenant.save(update_fields=['plan', 'monthly_quota', 'razorpay_subscription_id'])

    def _schedule_grace_period_downgrade(self, tenant_id: str):
        from tasks.billing_tasks import downgrade_after_grace_period
        downgrade_after_grace_period.apply_async(
            args=[tenant_id],
            countdown=60 * 60 * 24 * 3,
        )
