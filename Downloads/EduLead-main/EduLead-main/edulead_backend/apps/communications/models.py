import uuid
from django.db import models


class CallRecord(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('ringing', 'Ringing'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('no_answer', 'No Answer'),
        ('busy', 'Busy'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey('leads.Lead', on_delete=models.CASCADE, related_name='calls')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='calls')
    initiated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)

    call_sid = models.CharField(max_length=100, unique=True)
    virtual_number = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    duration_seconds = models.IntegerField(null=True, blank=True)
    recording_url = models.URLField(blank=True)
    recording_s3_key = models.CharField(max_length=500, blank=True)

    retry_count = models.IntegerField(default=0)
    next_retry_at = models.DateTimeField(null=True, blank=True)

    initiated_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'call_records'
        ordering = ['-initiated_at']

    def __str__(self):
        return f"Call {self.call_sid} ({self.status})"
