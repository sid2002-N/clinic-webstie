import uuid
from django.db import models


class Tenant(models.Model):
    TENANT_TYPE_CHOICES = [
        ('college', 'College'),
        ('agency', 'Agency'),
    ]
    PLAN_CHOICES = [
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('premium', 'Premium'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    tenant_type = models.CharField(max_length=20, choices=TENANT_TYPE_CHOICES)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='basic')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    priority = models.IntegerField(default=0)
    razorpay_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    billing_email = models.EmailField(null=True, blank=True)

    monthly_quota = models.IntegerField(default=10)
    used_quota = models.IntegerField(default=0)
    rollover_quota = models.IntegerField(default=0)
    quota_reset_date = models.DateField(null=True, blank=True)

    course_interests = models.JSONField(default=list, blank=True)
    location_preferences = models.JSONField(default=list, blank=True)

    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.plan})"

    @property
    def remaining_quota(self):
        return max(0, self.monthly_quota + self.rollover_quota - self.used_quota)

    @property
    def is_quota_exhausted(self):
        return self.remaining_quota <= 0


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    payload_hash = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} by {self.user} at {self.created_at}"
