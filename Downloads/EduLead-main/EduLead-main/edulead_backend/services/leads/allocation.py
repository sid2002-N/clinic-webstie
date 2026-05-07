import logging
import json
import redis
import random
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

BUDGET_ORDER = ['below_1L', '1L_to_3L', '3L_to_5L', 'above_5L']

COLD_LEAD_HOLD_DAYS = 7


def get_redis():
    return redis.from_url(settings.REDIS_URL)


def _budget_index(budget_str: str) -> int:
    s = (budget_str or '').lower().strip()
    for i, tier in enumerate(BUDGET_ORDER):
        if tier in s or tier.replace('_', ' ') in s:
            return i
    return -1


class LeadAllocationService:

    EXCLUSIVITY_CAPS = {'premium': 1, 'pro': 3, 'basic': 5}
    PLAN_PRIORITY = {'premium': 3, 'pro': 2, 'basic': 1}
    TYPE_PRIORITY = {'college': 2, 'agency': 1}

    def allocate(self, lead_id: str) -> list:
        from apps.leads.models import Lead, LeadAllocation
        from apps.tenants.models import Tenant
        import datetime

        try:
            lead = Lead.objects.select_related('student').get(id=lead_id)
        except Lead.DoesNotExist:
            logger.error(f"Lead {lead_id} not found for allocation")
            return []

        if lead.category == 'cold':
            age_days = (timezone.now() - lead.created_at).days
            if age_days < COLD_LEAD_HOLD_DAYS:
                logger.info(
                    f"Lead {lead_id} is cold and only {age_days}d old — "
                    f"holding until {COLD_LEAD_HOLD_DAYS}d before allocation"
                )
                return []

        cap = lead.exclusivity_cap

        tenants = Tenant.objects.filter(status='active')

        lead_budget_idx = _budget_index(lead.budget_range)

        eligible = []
        for tenant in tenants:
            quota = self.check_quota(str(tenant.id))
            if quota['remaining'] <= 0:
                continue

            if tenant.course_interests and lead.course_interest:
                if not any(c.lower() in lead.course_interest.lower() for c in tenant.course_interests):
                    continue

            if tenant.location_preferences and lead.location:
                if not any(loc.lower() in lead.location.lower() for loc in tenant.location_preferences):
                    continue

            if (
                lead_budget_idx >= 0
                and hasattr(tenant, 'budget_preferences')
                and tenant.budget_preferences
            ):
                tenant_budget_idx = max(
                    (_budget_index(b) for b in tenant.budget_preferences),
                    default=-1,
                )
                if tenant_budget_idx >= 0 and lead_budget_idx > tenant_budget_idx:
                    continue

            eligible.append(tenant)

        eligible = self._sort_with_round_robin(eligible)

        allocated_tenant_ids = []
        already_allocated = set(
            str(tid) for tid in
            LeadAllocation.objects.filter(lead=lead).values_list('tenant_id', flat=True)
        )

        for tenant in eligible:
            if len(allocated_tenant_ids) >= cap:
                break
            if str(tenant.id) in already_allocated:
                continue
            LeadAllocation.objects.create(
                lead=lead,
                tenant=tenant,
                quota_used=1,
                status='delivered',
            )
            tenant.used_quota += 1
            tenant.save(update_fields=['used_quota'])
            r = get_redis()
            r.incr(f'quota:used:{tenant.id}')
            self._send_allocation_notification(tenant, lead)
            allocated_tenant_ids.append(str(tenant.id))

        if allocated_tenant_ids:
            lead.status = 'allocated'
            lead.save(update_fields=['status'])

        logger.info(f"Lead {lead_id} allocated to {len(allocated_tenant_ids)} tenants")
        return allocated_tenant_ids

    def _sort_with_round_robin(self, tenants: list) -> list:
        from itertools import groupby

        sorted_tenants = sorted(tenants, key=lambda t: (
            self.TYPE_PRIORITY.get(t.tenant_type, 0),
            self.PLAN_PRIORITY.get(t.plan, 0),
            t.priority,
        ), reverse=True)

        result = []
        key_fn = lambda t: (
            self.TYPE_PRIORITY.get(t.tenant_type, 0),
            self.PLAN_PRIORITY.get(t.plan, 0),
        )
        for _key, group in groupby(sorted_tenants, key=key_fn):
            tier_members = list(group)
            random.shuffle(tier_members)
            result.extend(tier_members)
        return result

    def check_quota(self, tenant_id: str) -> dict:
        r = get_redis()
        cache_key = f'quota:{tenant_id}'
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)

        from apps.tenants.models import Tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return {'remaining': 0, 'used': 0, 'monthly': 0, 'rollover': 0}

        result = {
            'remaining': tenant.remaining_quota,
            'used': tenant.used_quota,
            'monthly': tenant.monthly_quota,
            'rollover': tenant.rollover_quota,
        }
        r.setex(cache_key, 300, json.dumps(result))
        return result

    def get_exclusivity_cap(self, plan: str) -> int:
        return self.EXCLUSIVITY_CAPS.get(plan, 5)

    def rollover_unused_quota(self, tenant_id: str):
        from apps.tenants.models import Tenant
        from apps.subscriptions.models import QuotaHistory
        import datetime

        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            return

        unused = max(0, tenant.monthly_quota + tenant.rollover_quota - tenant.used_quota)
        max_rollover = tenant.monthly_quota // 2
        new_rollover = min(unused, max_rollover)

        today = timezone.now().date()
        last_month = (today.replace(day=1) - datetime.timedelta(days=1))
        QuotaHistory.objects.update_or_create(
            tenant=tenant,
            month=last_month.replace(day=1),
            defaults={
                'monthly_quota': tenant.monthly_quota,
                'used_quota': tenant.used_quota,
                'rollover_in': tenant.rollover_quota,
                'rollover_out': new_rollover,
            }
        )

        tenant.used_quota = 0
        tenant.rollover_quota = new_rollover
        tenant.save(update_fields=['used_quota', 'rollover_quota'])

        r = get_redis()
        r.delete(f'quota:{tenant_id}')
        logger.info(f"Quota rolled over for tenant {tenant_id}: {new_rollover} carried forward")

    def handle_low_supply(self, lead_id: str):
        from apps.leads.models import Lead, LeadAllocation
        from apps.tenants.models import Tenant

        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return

        premium_tenants = Tenant.objects.filter(status='active', plan='premium')
        other_tenants = Tenant.objects.filter(status='active', plan__in=('pro', 'basic'))

        allocated_ids = set(
            str(tid) for tid in
            LeadAllocation.objects.filter(lead=lead).values_list('tenant_id', flat=True)
        )

        for tenant in premium_tenants:
            if str(tenant.id) not in allocated_ids:
                quota = self.check_quota(str(tenant.id))
                if quota['remaining'] > 0:
                    LeadAllocation.objects.create(
                        lead=lead, tenant=tenant, quota_used=1, status='delivered'
                    )
                    tenant.used_quota += 1
                    tenant.save(update_fields=['used_quota'])

        if lead.category in ('warm', 'cold'):
            for tenant in other_tenants:
                quota = self.check_quota(str(tenant.id))
                if quota['remaining'] > 0:
                    self._send_reduced_availability_notification(tenant)

    def _send_allocation_notification(self, tenant, lead):
        from tasks.lead_tasks import send_quota_warning
        quota = self.check_quota(str(tenant.id))
        if tenant.monthly_quota > 0:
            pct_used = (tenant.used_quota / tenant.monthly_quota) * 100
            if pct_used >= 100:
                send_quota_warning.delay(str(tenant.id), 100)
            elif pct_used >= 80:
                send_quota_warning.delay(str(tenant.id), 80)

    def _send_reduced_availability_notification(self, tenant):
        logger.info(f"Notifying tenant {tenant.id} about reduced lead availability")
