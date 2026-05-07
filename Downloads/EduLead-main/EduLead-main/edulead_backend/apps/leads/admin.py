from django.contrib import admin
from .models import Lead, LeadAllocation, LeadNote


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'course_interest', 'category', 'score', 'status', 'created_at']
    list_filter = ['category', 'status']
    search_fields = ['full_name', 'course_interest', 'location']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_activity_at']


@admin.register(LeadAllocation)
class LeadAllocationAdmin(admin.ModelAdmin):
    list_display = ['lead', 'tenant', 'allocated_at', 'phone_reveal_count']
    list_filter = ['tenant']
    readonly_fields = ['allocated_at']


@admin.register(LeadNote)
class LeadNoteAdmin(admin.ModelAdmin):
    list_display = ['lead', 'tenant', 'user', 'created_at']
    readonly_fields = ['id', 'created_at']
