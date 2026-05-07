from rest_framework import serializers
from .models import Lead, LeadAllocation, LeadNote
from apps.conversations.models import Message


class LeadNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadNote
        fields = ['id', 'content', 'user_id', 'created_at']
        read_only_fields = ['id', 'user_id', 'created_at']


class LeadListBasicSerializer(serializers.ModelSerializer):
    """Basic plan list: name, course, score only — no location/budget/timeline."""
    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'course_interest',
            'score', 'category', 'status',
            'created_at', 'last_activity_at',
        ]


class LeadListSerializer(serializers.ModelSerializer):
    """Pro/Premium plan list: adds location, budget_range, timeline."""
    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'course_interest', 'location',
            'budget_range', 'timeline',
            'score', 'category', 'status',
            'created_at', 'last_activity_at',
        ]


class LeadDetailBasicSerializer(serializers.ModelSerializer):
    """Basic plan detail: no location, budget, timeline, or phone."""
    notes = LeadNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'course_interest',
            'score', 'category', 'dimension_scores', 'status',
            'notes', 'created_at', 'last_activity_at',
        ]


class LeadDetailSerializer(serializers.ModelSerializer):
    """Pro plan detail: full profile minus phone number."""
    notes = LeadNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'course_interest', 'location',
            'budget_range', 'timeline', 'intent_level',
            'score', 'category', 'dimension_scores', 'status',
            'notes', 'created_at', 'last_activity_at',
        ]


class LeadDetailPremiumSerializer(LeadDetailSerializer):
    """Premium plan detail: everything including decrypted phone number."""
    phone = serializers.SerializerMethodField()

    class Meta(LeadDetailSerializer.Meta):
        fields = LeadDetailSerializer.Meta.fields + ['phone']

    def get_phone(self, obj):
        return obj.student.get_phone()


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'media_url', 'created_at']
        read_only_fields = ['id', 'created_at']


class LeadStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['status']


class LeadAllocationStatusSerializer(serializers.ModelSerializer):
    """Tenant updates delivery/conversion status on their allocation."""
    class Meta:
        model = LeadAllocation
        fields = ['status', 'conversion_status']


class AdminLeadCreateSerializer(serializers.Serializer):
    """
    Flat serializer for manual lead creation from the admin panel.
    Accepts student identity fields alongside lead qualification fields.
    The view handles Student get_or_create before saving the Lead.
    """
    student_name      = serializers.CharField(max_length=255)
    whatsapp_number   = serializers.CharField(max_length=20)
    course_interest   = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    location          = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    budget_range      = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    timeline          = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    intent_level      = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    notes             = serializers.CharField(required=False, allow_blank=True, default='')
