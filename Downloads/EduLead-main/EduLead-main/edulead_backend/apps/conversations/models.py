import uuid
from django.db import models


class Conversation(models.Model):
    CHANNEL_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('voice', 'Voice Call'),
        ('web', 'Web Chat'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
        ('human_handoff', 'Human Handoff'),
    ]
    STATE_CHOICES = [
        ('INIT', 'Initialised'),
        ('GREETING', 'Greeting'),
        ('PROFILE_COLLECT', 'Profile Collection'),
        ('INTENT_QUALIFY', 'Intent Qualification'),
        ('RECOMMEND', 'Recommend Colleges'),
        ('SCORING', 'Scoring'),
        ('CLOSING', 'Closing'),
        ('ENDED', 'Ended'),
        ('HANDOFF', 'Human Handoff'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE,
        related_name='conversations'
    )
    channel = models.CharField(
        max_length=20, choices=CHANNEL_CHOICES, default='whatsapp'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='active'
    )
    state = models.CharField(
        max_length=30, choices=STATE_CHOICES, default='GREETING'
    )
    handoff_reason = models.CharField(max_length=255, blank=True)
    transcript_s3_key = models.CharField(max_length=500, blank=True)
    recording_s3_key = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-created_at']

    def __str__(self):
        return f'Conversation {self.id} ({self.channel}/{self.status}/{self.state})'


class Message(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('ai', 'AI'),
        ('human_agent', 'Human Agent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE,
        related_name='messages', null=True, blank=True
    )
    lead = models.ForeignKey(
        'leads.Lead', on_delete=models.CASCADE,
        related_name='direct_messages', null=True, blank=True
    )
    sender_tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sent_messages'
    )
    sender_user = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sent_messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    media_url = models.URLField(blank=True)
    channel = models.CharField(max_length=20, default='whatsapp')
    twilio_message_sid = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f'[{self.role}] {self.content[:60]}'

    @property
    def is_from_student(self) -> bool:
        return self.role == 'student'
