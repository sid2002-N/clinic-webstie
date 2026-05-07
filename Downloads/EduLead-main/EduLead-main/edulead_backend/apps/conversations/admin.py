from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'channel', 'status', 'created_at']
    list_filter = ['channel', 'status']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'role', 'created_at']
    list_filter = ['role']
    readonly_fields = ['id', 'created_at']
