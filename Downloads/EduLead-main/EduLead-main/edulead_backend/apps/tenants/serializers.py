from rest_framework import serializers
from .models import Tenant, AuditLog


class TenantSerializer(serializers.ModelSerializer):
    remaining_quota = serializers.ReadOnlyField()

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'tenant_type', 'plan', 'status',
            'priority', 'monthly_quota', 'used_quota', 'rollover_quota',
            'remaining_quota', 'course_interests', 'location_preferences',
            'contact_email', 'contact_phone', 'website', 'address',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'remaining_quota']


class TenantPlanUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['plan', 'monthly_quota', 'status', 'priority']


class AuditLogSerializer(serializers.ModelSerializer):
    tenant_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id', 'tenant_name', 'user_email', 'action',
            'resource_type', 'resource_id', 'metadata',
            'ip_address', 'payload_hash', 'created_at',
        ]

    def get_tenant_name(self, obj):
        return obj.tenant.name if obj.tenant else None

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
