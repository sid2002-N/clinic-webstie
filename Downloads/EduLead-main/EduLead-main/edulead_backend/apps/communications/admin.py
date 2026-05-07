from django.contrib import admin
from .models import CallRecord


@admin.register(CallRecord)
class CallRecordAdmin(admin.ModelAdmin):
    list_display = ['call_sid', 'lead', 'tenant', 'status', 'retry_count', 'initiated_at']
    list_filter = ['status']
    readonly_fields = ['id', 'initiated_at']
