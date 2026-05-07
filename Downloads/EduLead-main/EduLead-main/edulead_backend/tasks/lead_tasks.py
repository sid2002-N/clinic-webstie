import logging
from config.celery import app as celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def score_and_allocate_lead(self, lead_id: str):
    try:
        from apps.leads.models import Lead
        from services.leads.scoring import LeadScoringService
        from services.leads.allocation import LeadAllocationService

        lead = Lead.objects.select_related('student').get(id=lead_id)
        lead_data = {
            'full_name': lead.full_name,
            'course_interest': lead.course_interest,
            'location': lead.location,
            'budget_range': lead.budget_range,
            'timeline': lead.timeline,
            'intent_level': lead.intent_level,
        }

        scoring_service = LeadScoringService()
        result = scoring_service.compute(lead_data)

        lead.score = result['score']
        lead.category = result['category']
        lead.dimension_scores = result['dimension_scores']
        lead.save(update_fields=['score', 'category', 'dimension_scores'])

        allocation_service = LeadAllocationService()
        tenant_ids = allocation_service.allocate(lead_id)

        if not tenant_ids and lead.category == 'hot':
            allocation_service.handle_low_supply(lead_id)

        logger.info(
            f'Lead {lead_id} scored: {result["score"]} ({result["category"]}), '
            f'allocated to {len(tenant_ids)} tenants'
        )
        return {'score': result['score'], 'category': result['category'],
                'allocated_to': tenant_ids}
    except Exception as exc:
        logger.error(f'Error in score_and_allocate_lead for {lead_id}: {exc}')
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@celery_app.task(bind=True, max_retries=3)
def create_score_and_allocate_lead(self, lead_data: dict,
                                   conversation_id: str = None):
    """
    Create a Lead from raw counsellor-extracted data dict,
    then score and allocate it.
    Used by voice pipeline and direct API intake.
    """
    try:
        from apps.leads.models import Lead
        from apps.conversations.models import Conversation

        conversation = None
        if conversation_id:
            try:
                conversation = Conversation.objects.select_related(
                    'student'
                ).get(id=conversation_id)
            except Conversation.DoesNotExist:
                logger.warning(f'Conversation {conversation_id} not found')

        student = None
        if conversation:
            student = conversation.student
        else:
            phone = lead_data.get('phone', '')
            if phone:
                from apps.students.models import Student
                student, _ = Student.objects.get_or_create(
                    whatsapp_number=phone,
                    defaults={'whatsapp_number': phone},
                )

        if not student:
            logger.error('create_score_and_allocate_lead: no student found')
            return None

        lead = Lead.objects.create(
            student=student,
            conversation=conversation,
            full_name=lead_data.get('full_name', ''),
            course_interest=lead_data.get('course_interest', ''),
            location=lead_data.get('location', ''),
            budget_range=lead_data.get('budget_range', ''),
            timeline=lead_data.get('timeline', ''),
            intent_level=lead_data.get('intent_level', ''),
        )

        score_and_allocate_lead.delay(str(lead.id))
        logger.info(f'Lead {lead.id} created and queued for scoring')
        return str(lead.id)

    except Exception as exc:
        logger.error(f'Error in create_score_and_allocate_lead: {exc}')
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@celery_app.task
def decay_lead_scores():
    from apps.leads.models import Lead
    from services.leads.scoring import LeadScoringService
    from django.utils import timezone
    import datetime

    service = LeadScoringService()
    cutoff = timezone.now() - datetime.timedelta(hours=24)
    stale_leads = Lead.objects.exclude(
        status__in=('expired', 'converted')
    ).filter(last_activity_at__lt=cutoff)
    updated = 0
    for lead in stale_leads:
        days_inactive = (timezone.now() - lead.last_activity_at).days
        if days_inactive < 1:
            continue
        new_score = service.decay_score(lead, days_inactive)
        if new_score != lead.score:
            lead.score = new_score
            lead.category = service.categorise(new_score)
            lead.save(update_fields=['score', 'category'])
            updated += 1
    logger.info(f'Decayed scores for {updated} leads')
    return updated


@celery_app.task
def rescore_cold_leads():
    """
    Re-score leads that have been cold for exactly 7 days and attempt
    fresh allocation. Per the lead scoring diagram: Cold <40 → Held ·
    re-score after 7 days.
    """
    from apps.leads.models import Lead
    from services.leads.scoring import LeadScoringService
    from services.leads.allocation import LeadAllocationService
    from django.utils import timezone
    import datetime

    seven_days_ago = timezone.now() - datetime.timedelta(days=7)
    six_days_ago = timezone.now() - datetime.timedelta(days=6)

    cold_leads = Lead.objects.filter(
        category='cold',
        status='new',
        created_at__gte=seven_days_ago,
        created_at__lt=six_days_ago,
    )

    scoring_service = LeadScoringService()
    allocation_service = LeadAllocationService()
    rescored = 0

    for lead in cold_leads:
        lead_data = {
            'full_name': lead.full_name,
            'course_interest': lead.course_interest,
            'location': lead.location,
            'budget_range': lead.budget_range,
            'timeline': lead.timeline,
            'intent_level': lead.intent_level,
        }
        result = scoring_service.compute(lead_data)
        lead.score = result['score']
        lead.category = result['category']
        lead.dimension_scores = result['dimension_scores']
        lead.save(update_fields=['score', 'category', 'dimension_scores'])

        if result['category'] in ('hot', 'warm'):
            allocation_service.allocate(str(lead.id))

        rescored += 1

    logger.info(f'Re-scored {rescored} cold leads at 7-day checkpoint')
    return rescored


@celery_app.task
def expire_old_leads():
    from apps.leads.models import Lead
    from django.utils import timezone
    import datetime

    cutoff = timezone.now() - datetime.timedelta(days=90)
    updated = Lead.objects.filter(
        created_at__lt=cutoff
    ).exclude(
        status__in=('expired', 'converted')
    ).update(status='expired')
    logger.info(f'Expired {updated} old leads')
    return updated


@celery_app.task
def rollover_monthly_quotas():
    from apps.tenants.models import Tenant
    from services.leads.allocation import LeadAllocationService

    service = LeadAllocationService()
    tenants = Tenant.objects.filter(status='active')
    count = 0
    for tenant in tenants:
        try:
            service.rollover_unused_quota(str(tenant.id))
            count += 1
        except Exception as e:
            logger.error(f'Error rolling over quota for tenant {tenant.id}: {e}')
    logger.info(f'Rolled over quotas for {count} tenants')
    return count


@celery_app.task
def send_quota_warning(tenant_id: str, percentage: int):
    from apps.tenants.models import Tenant
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        logger.warning(
            f'Quota warning for tenant {tenant.name} ({tenant_id}): '
            f'{percentage}% used — {tenant.remaining_quota} remaining'
        )
    except Tenant.DoesNotExist:
        logger.error(f'Tenant {tenant_id} not found for quota warning')


@celery_app.task(bind=True, max_retries=3)
def retry_masked_call(self, call_sid: str, attempt: int):
    from services.communications.masked_calling import MaskedCallingService
    from apps.communications.models import CallRecord
    from django.conf import settings

    try:
        record = CallRecord.objects.get(call_sid=call_sid)
    except CallRecord.DoesNotExist:
        logger.error(f'CallRecord {call_sid} not found for retry')
        return

    try:
        service = MaskedCallingService()
        college_phone = (
            record.tenant.users.filter(id=record.initiated_by_id)
            .values_list('phone', flat=True).first() or ''
        )
        call = service.client.calls.create(
            to=college_phone,
            from_=record.virtual_number or service._get_virtual_number(),
            url=(
                f'{settings.FRONTEND_URL}'
                f'/api/webhooks/twilio/voice/'
            ),
        )
        record.call_sid = call.sid
        record.retry_count = attempt
        record.status = 'initiated'
        record.save(update_fields=['call_sid', 'retry_count', 'status'])
        logger.info(f'Retry {attempt} for call successful: new SID {call.sid}')
    except Exception as exc:
        logger.error(f'Retry attempt {attempt} failed for call {call_sid}: {exc}')
        countdown = 60 * (2 ** self.request.retries)
        raise self.retry(exc=exc, countdown=countdown)


@celery_app.task
def run_data_retention():
    from services.compliance.gdpr import DataRetentionService
    DataRetentionService().run()
    logger.info('Data retention job completed')
