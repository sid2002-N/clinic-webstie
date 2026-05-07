import logging
from config.celery import app as celery_app

logger = logging.getLogger(__name__)


@celery_app.task
def downgrade_after_grace_period(tenant_id: str):
    """Called 3 days after payment failure. Downgrades tenant to basic if still unpaid."""
    from apps.tenants.models import Tenant
    from services.billing.razorpay_service import RazorpayService

    try:
        tenant = Tenant.objects.get(id=tenant_id)
    except Tenant.DoesNotExist:
        logger.error(f"Tenant {tenant_id} not found for grace period downgrade")
        return

    if tenant.plan == 'basic':
        logger.info(f"Tenant {tenant_id} already on basic — skipping downgrade")
        return

    if tenant.razorpay_subscription_id:
        try:
            import razorpay
            from django.conf import settings
            rp_client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            sub = rp_client.subscription.fetch(tenant.razorpay_subscription_id)
            if sub.get('status') == 'active':
                logger.info(f"Tenant {tenant_id} subscription is active — not downgrading")
                return
        except Exception as e:
            logger.warning(f"Could not verify subscription status for tenant {tenant_id}: {e}")

    RazorpayService()._downgrade_to_basic(tenant)
    logger.warning(f"Tenant {tenant_id} downgraded to basic after grace period")


@celery_app.task
def check_subscription_statuses():
    import razorpay
    from django.conf import settings
    from apps.subscriptions.models import Subscription

    rp_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )
    active_subs = Subscription.objects.filter(status='active').select_related('tenant')

    for sub in active_subs:
        rzp_sub_id = sub.tenant.razorpay_subscription_id
        if not rzp_sub_id:
            continue
        try:
            rzp_sub = rp_client.subscription.fetch(rzp_sub_id)
            rzp_status = rzp_sub.get('status', '')
            if rzp_status in ('cancelled', 'expired', 'halted') and sub.status == 'active':
                sub.status = rzp_status
                sub.save(update_fields=['status'])
                logger.info(f"Subscription {sub.id} status updated to {rzp_status}")
        except Exception as e:
            logger.error(f"Error checking subscription {sub.id}: {e}")


@celery_app.task
def sync_razorpay_customers():
    from apps.tenants.models import Tenant
    tenants_without_sub = Tenant.objects.filter(
        status='active',
        razorpay_subscription_id__isnull=True,
    )
    for tenant in tenants_without_sub:
        logger.info(f"Tenant {tenant.id} ({tenant.name}) has no Razorpay subscription")
