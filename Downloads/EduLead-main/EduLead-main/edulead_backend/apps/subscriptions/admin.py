from django.contrib import admin
from .models import Subscription, QuotaHistory


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'plan', 'status', 'current_period_end', 'created_at']
    list_filter = ['plan', 'status']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(QuotaHistory)
class QuotaHistoryAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'month', 'monthly_quota', 'used_quota', 'rollover_in', 'rollover_out']
    list_filter = ['month']
    readonly_fields = ['id', 'created_at']
