from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['whatsapp_number', 'full_name', 'consent_given', 'is_deleted', 'created_at']
    list_filter = ['consent_given', 'is_deleted']
    search_fields = ['whatsapp_number', 'full_name', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']
