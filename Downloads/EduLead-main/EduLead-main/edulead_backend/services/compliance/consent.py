import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


class ConsentService:

    def record_consent(self, student_id: str, channel: str, ip_address: str = None):
        from apps.students.models import Student
        try:
            student = Student.objects.get(id=student_id)
            student.consent_given = True
            student.consent_timestamp = timezone.now()
            student.consent_channel = channel
            student.consent_ip = ip_address
            student.save(update_fields=['consent_given', 'consent_timestamp', 'consent_channel', 'consent_ip'])
            logger.info(f"Consent recorded for student {student_id} via {channel}")
        except Student.DoesNotExist:
            logger.error(f"Student {student_id} not found for consent recording")

    def check_consent(self, student_id: str) -> bool:
        from apps.students.models import Student
        try:
            student = Student.objects.get(id=student_id)
            return student.consent_given
        except Student.DoesNotExist:
            return False
