from django.urls import path
from .views import ConversationPlaceholderView, LeadMessagesView

urlpatterns = [
    path('', ConversationPlaceholderView.as_view(), name='conversations'),
    path('leads/<uuid:lead_id>/messages/', LeadMessagesView.as_view(), name='lead-messages'),
]
