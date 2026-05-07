from django.contrib import admin
from .models import Tenant, AuditLog


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant_type', 'plan', 'status', 'monthly_quota', 'used_quota', 'created_at']
    list_filter = ['tenant_type', 'plan', 'status']
    search_fields = ['name', 'contact_email']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'tenant', 'user', 'resource_type', 'resource_id', 'created_at']
    list_filter = ['action', 'resource_type']
    readonly_fields = ['id', 'created_at']
