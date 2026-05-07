import json
import logging
import boto3
import io
import redis
import datetime
from django.conf import settings
from django.utils import timezone
from twilio.rest import Client

logger = logging.getLogger(__name__)

BRIDGE_TTL = 60 * 60 * 24
MAX_RETRIES = 3
RETRY_DELAYS = [300, 900, 3600]


def get_redis():
    return redis.from_url(settings.REDIS_URL)


def get_backend_url() -> str:
    return getattr(settings, 'BACKEND_URL', settings.FRONTEND_URL)


class MaskedCallingService:

    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    def initiate_masked_call(self, college_user_id: str, lead_id: str) -> dict:
        """Public API: initiate a masked call from college user to student."""
        return self.create_call_bridge(college_user_id, lead_id)

    def create_call_bridge(self, college_user_id: str, lead_id: str) -> dict:
        from apps.users.models import User
        from apps.leads.models import Lead
        from apps.communications.models import CallRecord
        from apps.tenants.models import AuditLog

        user = User.objects.select_related('tenant').get(id=college_user_id)
        tenant = user.tenant
        if not tenant or tenant.plan not in ('pro', 'premium'):
            raise PermissionError('Masked calling requires Pro or Premium plan.')

        lead = Lead.objects.select_related('student').get(id=lead_id)
        student_phone = lead.student.get_phone()
        college_phone = user.phone
        if not college_phone:
            raise ValueError('College user has no phone number configured.')

        r = get_redis()
        bridge_key = f'call_bridge:{college_user_id}:{lead_id}'
        existing = r.get(bridge_key)
        if existing:
            bridge_data = json.loads(existing)
        else:
            virtual_number = self._get_virtual_number()
            bridge_data = {
                'virtual_number': virtual_number,
                'college_phone': college_phone,
                'student_phone': student_phone,
                'tenant_id': str(tenant.id),
                'lead_id': lead_id,
                'user_id': college_user_id,
            }
            r.setex(bridge_key, BRIDGE_TTL, json.dumps(bridge_data))
            r.setex(f'bridge_number:{virtual_number}', BRIDGE_TTL,
                    json.dumps(bridge_data))

        base = get_backend_url()
        callback_url = f'{base}/api/webhooks/twilio/call-status/'
        twiml_url = (
            f'{base}/api/webhooks/twilio/voice-bridge/'
            f'?lead={lead_id}&user={college_user_id}'
        )
        recording_cb = f'{base}/api/webhooks/twilio/recording/'

        try:
            call = self.client.calls.create(
                to=college_phone,
                from_=bridge_data['virtual_number'],
                url=twiml_url,
                status_callback=callback_url,
                status_callback_method='POST',
                record=True,
                recording_status_callback=recording_cb,
            )

            CallRecord.objects.create(
                lead=lead,
                tenant=tenant,
                initiated_by=user,
                call_sid=call.sid,
                virtual_number=bridge_data['virtual_number'],
                status='initiated',
            )

            AuditLog.objects.create(
                tenant=tenant,
                user=user,
                action='initiated_masked_call',
                resource_type='lead',
                resource_id=lead_id,
                metadata={'call_sid': call.sid},
            )

            return {'virtual_number': bridge_data['virtual_number'],
                    'call_sid': call.sid}
        except Exception as e:
            logger.error(f'Failed to create call bridge: {e}')
            raise

    def handle_college_answers(self, call_sid: str, lead_id: str,
                               user_id: str) -> str:
        """Return TwiML that bridges college user to student."""
        r = get_redis()
        bridge_key = f'call_bridge:{user_id}:{lead_id}'
        data_raw = r.get(bridge_key)

        if not data_raw:
            logger.warning(f'No bridge data for {bridge_key}')
            return (
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<Response>'
                '<Say language="ml-IN" voice="Google.ml-IN-Neural2-A">ബന്ധപ്പെടൽ '
                'സാധ്യമല്ല.</Say><Hangup/></Response>'
            )

        bridge = json.loads(data_raw)
        student_phone = bridge.get('student_phone', '')

        twiml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Response>'
            '<Say language="ml-IN" voice="Google.ml-IN-Neural2-A">ബന്ധപ്പെടുന്നു. ദയവായി കാത്തിരിക്കൂ.</Say>'
            f'<Dial callerId="{bridge["virtual_number"]}">'
            f'<Number>{student_phone}</Number>'
            '</Dial>'
            '</Response>'
        )
        return twiml

    def handle_recording_complete(self, call_sid: str, recording_url: str,
                                  recording_duration: int = 0):
        """Save completed call recording to S3 and update CallRecord."""
        from apps.communications.models import CallRecord
        try:
            record = CallRecord.objects.get(call_sid=call_sid)
        except CallRecord.DoesNotExist:
            logger.warning(f'CallRecord not found for recording {call_sid}')
            return

        record.recording_url = recording_url
        record.duration_seconds = recording_duration or 0

        s3_key = self._upload_recording_to_s3(
            recording_url, call_sid, record.tenant_id
        )
        if s3_key:
            record.recording_s3_key = s3_key

        record.save(update_fields=['recording_url', 'duration_seconds',
                                   'recording_s3_key'])
        logger.info(f'Recording saved for call {call_sid}')

    def _upload_recording_to_s3(self, recording_url: str, call_sid: str,
                                 tenant_id) -> str:
        aws_bucket = getattr(settings, 'AWS_S3_BUCKET', '')
        if not aws_bucket or not recording_url:
            return ''
        try:
            import requests
            auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            resp = requests.get(recording_url + '.mp3', auth=auth, timeout=30)
            resp.raise_for_status()

            s3_key = f'recordings/{tenant_id}/{call_sid}.mp3'
            s3 = boto3.client('s3',
                              aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                              aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                              region_name=settings.AWS_S3_REGION)
            s3.upload_fileobj(
                io.BytesIO(resp.content),
                aws_bucket,
                s3_key,
                ExtraArgs={'ContentType': 'audio/mpeg'},
            )
            return s3_key
        except Exception as e:
            logger.error(f'S3 recording upload failed for {call_sid}: {e}')
            return ''

    def handle_call_status_webhook(self, call_sid: str, call_status: str):
        from apps.communications.models import CallRecord

        try:
            record = CallRecord.objects.get(call_sid=call_sid)
        except CallRecord.DoesNotExist:
            logger.warning(f'CallRecord not found for SID {call_sid}')
            return

        status_map = {
            'initiated': 'initiated',
            'ringing': 'ringing',
            'in-progress': 'in_progress',
            'completed': 'completed',
            'failed': 'failed',
            'no-answer': 'no_answer',
            'busy': 'busy',
        }
        record.status = status_map.get(call_status, call_status)

        if call_status == 'in-progress':
            record.answered_at = timezone.now()
        elif call_status in ('completed', 'failed', 'no-answer', 'busy'):
            record.ended_at = timezone.now()

        record.save()

        if call_status in ('failed', 'no-answer', 'busy'):
            if record.retry_count < MAX_RETRIES:
                self.retry_call(call_sid, record.retry_count + 1)

    def retry_call(self, call_sid: str, attempt: int = 1):
        from apps.communications.models import CallRecord
        from tasks.lead_tasks import retry_masked_call

        if attempt > MAX_RETRIES:
            self._notify_call_failed(call_sid)
            return

        delay = RETRY_DELAYS[attempt - 1]
        retry_masked_call.apply_async(args=[call_sid, attempt], countdown=delay)

        try:
            record = CallRecord.objects.get(call_sid=call_sid)
            record.retry_count = attempt
            record.next_retry_at = timezone.now() + datetime.timedelta(
                seconds=delay
            )
            record.save(update_fields=['retry_count', 'next_retry_at'])
        except CallRecord.DoesNotExist:
            pass

    def _get_virtual_number(self) -> str:
        if settings.TWILIO_VOICE_NUMBER:
            return settings.TWILIO_VOICE_NUMBER
        numbers = self.client.incoming_phone_numbers.list(limit=1)
        if numbers:
            return numbers[0].phone_number
        raise RuntimeError('No Twilio voice number available.')

    def _notify_call_failed(self, call_sid: str):
        from apps.communications.models import CallRecord
        try:
            record = CallRecord.objects.get(call_sid=call_sid)
            logger.warning(
                f'Call {call_sid} failed after {MAX_RETRIES} retries. '
                f'Tenant: {record.tenant_id}, Lead: {record.lead_id}'
            )
        except CallRecord.DoesNotExist:
            pass
