import uuid
from django.db import models


class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('allocated', 'Allocated'),
        ('contacted', 'Contacted'),
        ('interested', 'Interested'),
        ('converted', 'Converted'),
        ('not_interested', 'Not Interested'),
        ('expired', 'Expired'),
    ]
    CATEGORY_CHOICES = [
        ('hot', 'Hot'),
        ('warm', 'Warm'),
        ('cold', 'Cold'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('students.Student', on_delete=models.PROTECT, related_name='leads')
    conversation = models.OneToOneField(
        'conversations.Conversation', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='lead'
    )

    full_name = models.CharField(max_length=255, blank=True)
    course_interest = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    budget_range = models.CharField(max_length=100, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    intent_level = models.CharField(max_length=50, blank=True)

    score = models.IntegerField(default=0)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='cold')
    dimension_scores = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new')
    exclusivity_cap = models.IntegerField(default=5)

    last_activity_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'leads'
        ordering = ['-created_at']

    def __str__(self):
        return f"Lead {self.id} — {self.full_name} ({self.category})"


class LeadAllocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    DELIVERY_STATUS = [
        ('delivered', 'Delivered'),
        ('viewed', 'Viewed'),
        ('contacted', 'Contacted'),
    ]
    CONVERSION_STATUS = [
        ('pending', 'Pending'),
        ('converted', 'Converted'),
        ('not_converted', 'Not Converted'),
    ]

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='allocations')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='lead_allocations')
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS, default='delivered')
    conversion_status = models.CharField(max_length=20, choices=CONVERSION_STATUS, default='pending')
    quota_used = models.IntegerField(default=1)
    allocated_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    phone_revealed_at = models.DateTimeField(null=True, blank=True)
    phone_reveal_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'lead_allocations'
        unique_together = ('lead', 'tenant')

    def __str__(self):
        return f"Lead {self.lead_id} → Tenant {self.tenant_id}"


class LeadNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='notes')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lead_notes'
        ordering = ['-created_at']
