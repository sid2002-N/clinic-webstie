from django.urls import path
from .views import (
    TwilioWhatsAppWebhookView,
    TwilioVoiceInboundView,
    TwilioVoiceAnswerView,
    TwilioVoiceWebhookView,
    TwilioCallStatusWebhookView,
    TwilioRecordingCompleteView,
    MaskedCallBridgeView,
    InitiateMaskedCallView,
    RazorpayWebhookView,
)

urlpatterns = [
    path('twilio/whatsapp/', TwilioWhatsAppWebhookView.as_view(), name='webhook-whatsapp'),
    path('twilio/voice/', TwilioVoiceWebhookView.as_view(), name='webhook-voice'),
    path('twilio/voice-inbound/', TwilioVoiceInboundView.as_view(), name='webhook-voice-inbound'),
    path('twilio/voice-answer/', TwilioVoiceAnswerView.as_view(), name='webhook-voice-answer'),
    path('twilio/voice-bridge/', MaskedCallBridgeView.as_view(), name='webhook-voice-bridge'),
    path('twilio/call-status/', TwilioCallStatusWebhookView.as_view(), name='webhook-call-status'),
    path('twilio/recording/', TwilioRecordingCompleteView.as_view(), name='webhook-recording'),
    path('razorpay/', RazorpayWebhookView.as_view(), name='webhook-razorpay'),
    path('leads/<uuid:lead_id>/call/', InitiateMaskedCallView.as_view(), name='initiate-masked-call'),
]
