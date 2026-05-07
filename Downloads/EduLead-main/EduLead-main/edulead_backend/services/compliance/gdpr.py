import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


class GDPRService:

    def delete_student_data(self, student_id: str):
        from apps.students.models import Student
        from apps.conversations.models import Conversation, Message
        from apps.tenants.models import AuditLog

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            logger.error(f"Student {student_id} not found for deletion")
            return

        student.phone_encrypted = None
        student.full_name = 'Deleted User'
        student.email = ''
        student.consent_ip = None
        student.is_deleted = True
        student.deleted_at = timezone.now()
        student.save()

        message_ids = Message.objects.filter(
            conversation__student=student
        ).values_list('id', flat=True)
        Message.objects.filter(id__in=message_ids).delete()

        Conversation.objects.filter(student=student).update(status='abandoned')

        AuditLog.objects.create(
            action='gdpr_student_deleted',
            resource_type='student',
            resource_id=student_id,
            metadata={'deleted_at': timezone.now().isoformat()},
        )
        logger.info(f"GDPR deletion completed for student {student_id}")

    def export_student_data(self, student_id: str) -> dict:
        from apps.students.models import Student
        from apps.leads.models import Lead
        from apps.conversations.models import Conversation, Message

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return {}

        leads = list(Lead.objects.filter(student=student).values(
            'id', 'course_interest', 'location', 'budget_range',
            'timeline', 'score', 'category', 'status', 'created_at',
        ))
        for lead in leads:
            lead['id'] = str(lead['id'])

        conversations = []
        for conv in Conversation.objects.filter(student=student):
            messages = list(Message.objects.filter(conversation=conv).values(
                'role', 'content', 'created_at'
            ))
            conversations.append({
                'id': str(conv.id),
                'channel': conv.channel,
                'status': conv.status,
                'created_at': conv.created_at.isoformat(),
                'messages': messages,
            })

        return {
            'student_id': str(student.id),
            'whatsapp_number': student.whatsapp_number,
            'full_name': student.full_name,
            'email': student.email,
            'location': student.location,
            'consent_given': student.consent_given,
            'consent_timestamp': student.consent_timestamp.isoformat() if student.consent_timestamp else None,
            'consent_channel': student.consent_channel,
            'created_at': student.created_at.isoformat(),
            'leads': leads,
            'conversations': conversations,
        }


class DataRetentionService:

    def run(self):
        self.delete_old_transcripts()
        self.delete_old_recordings()
        self.anonymise_old_leads()

    def delete_old_transcripts(self):
        from apps.conversations.models import Message
        from django.utils import timezone
        import datetime
        cutoff = timezone.now() - datetime.timedelta(days=365)
        deleted, _ = Message.objects.filter(created_at__lt=cutoff).delete()
        logger.info(f"Deleted {deleted} transcript messages older than 12 months")

    def delete_old_recordings(self):
        from apps.communications.models import CallRecord
        from django.utils import timezone
        import datetime
        import boto3
        cutoff = timezone.now() - datetime.timedelta(days=180)
        old_calls = CallRecord.objects.filter(
            initiated_at__lt=cutoff,
            recording_s3_key__gt='',
        )
        from django.conf import settings
        s3 = boto3.client('s3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        deleted_count = 0
        for call in old_calls:
            try:
                s3.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=call.recording_s3_key)
                call.recording_url = ''
                call.recording_s3_key = ''
                call.save(update_fields=['recording_url', 'recording_s3_key'])
                deleted_count += 1
            except Exception as e:
                logger.error(f"Error deleting recording {call.recording_s3_key}: {e}")
        logger.info(f"Deleted {deleted_count} call recordings older than 6 months")

    def anonymise_old_leads(self):
        from apps.leads.models import Lead
        from django.utils import timezone
        import datetime
        cutoff = timezone.now() - datetime.timedelta(days=730)
        old_leads = Lead.objects.filter(created_at__lt=cutoff).exclude(full_name='Anonymised')
        count = old_leads.update(
            full_name='Anonymised',
            budget_range='',
            intent_level='',
        )
        logger.info(f"Anonymised {count} leads older than 24 months")
