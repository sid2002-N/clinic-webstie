from rest_framework import serializers
from .models import Subscription, QuotaHistory
from apps.tenants.models import Tenant


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = serializers.SerializerMethodField()
    remaining_quota = serializers.SerializerMethodField()
    used_quota = serializers.SerializerMethodField()
    monthly_quota = serializers.SerializerMethodField()
    rollover_quota = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status',
            'monthly_quota', 'used_quota', 'rollover_quota', 'remaining_quota',
            'current_period_start', 'current_period_end',
            'cancel_at_period_end',
        ]

    def get_plan(self, obj):
        return obj.plan

    def get_remaining_quota(self, obj):
        return obj.tenant.remaining_quota

    def get_used_quota(self, obj):
        return obj.tenant.used_quota

    def get_monthly_quota(self, obj):
        return obj.tenant.monthly_quota

    def get_rollover_quota(self, obj):
        return obj.tenant.rollover_quota


class QuotaHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotaHistory
        fields = ['id', 'month', 'monthly_quota', 'used_quota', 'rollover_in', 'rollover_out', 'created_at']
