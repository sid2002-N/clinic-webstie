import json
import logging
import time

import redis as redis_lib
from django.conf import settings
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.ai_tasks import process_whatsapp_message, process_voice_turn
from services.communications.masked_calling import MaskedCallingService
from services.billing.razorpay_service import RazorpayService

logger = logging.getLogger(__name__)

VOICE_GREETING = (
    'നമസ്കാരം! ഞാൻ Mitra — EduLeads Kerala-യുടെ AI കൗൺസലർ. '
    'ഇപ്പോൾ ബീപ് ശബ്ദം കഴിഞ്ഞ് നിങ്ങളുടെ ചോദ്യം പറയൂ.'
)
VOICE_THINKING = (
    'ഒരു നിമിഷം. ഞാൻ ഉത്തരം ആലോചിക്കുന്നു.'
)
VOICE_GOODBYE = (
    'നന്ദി! ഉടൻ ഒരു കൗൺസലർ നിങ്ങളെ ബന്ധപ്പെടും. ഒരു നല്ല ദിവസം ആശംസിക്കുന്നു!'
)
VOICE_POLL_MAX_WAIT = 12
VOICE_POLL_INTERVAL = 1


def _get_backend_url() -> str:
    return getattr(settings, 'BACKEND_URL', settings.FRONTEND_URL)


MITRA_VOICE = 'Google.ml-IN-Neural2-A'


def _xml_escape(text: str) -> str:
    """
    OWASP A03 — Injection: escape all XML special characters via pure string
    replacement. No stdlib xml imports — avoids any parser XXE exposure.
    """
    return (
        str(text)
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('"', '&quot;')
        .replace("'", '&apos;')
    )


def _twiml_say(text: str) -> str:
    """
    Build a TwiML <Say> element using the official Twilio helper library
    so that content is safely encoded — no raw f-string XML construction.
    Falls back to manual escaping if the library is unavailable.
    """
    try:
        from twilio.twiml.voice_response import VoiceResponse, Say
        vr = VoiceResponse()
        vr.append(Say(text, language='ml-IN', voice=MITRA_VOICE))
        full = str(vr)
        inner_start = full.index('<Response>') + len('<Response>')
        inner_end = full.index('</Response>')
        return full[inner_start:inner_end].strip()
    except Exception:
        return f'<Say language="ml-IN" voice="{MITRA_VOICE}">{_xml_escape(text)}</Say>'


def _build_twiml(*fragments: str) -> str:
    """Wrap TwiML fragments in a Response envelope."""
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Response>'
        + ''.join(fragments)
        + '</Response>'
    )


def _record_tag(action_url: str) -> str:
    """
    Build a <Record> tag. action_url comes exclusively from Django settings
    (BACKEND_URL), not from user input.
    """
    from twilio.twiml.voice_response import Record, VoiceResponse
    try:
        vr = VoiceResponse()
        vr.record(action=action_url, max_length=20, timeout=5, play_beep=True)
        full = str(vr)
        inner_start = full.index('<Response>') + len('<Response>')
        inner_end = full.index('</Response>')
        return full[inner_start:inner_end].strip()
    except Exception:
        escaped_url = _xml_escape(action_url)
        return (
            f'<Record action="{escaped_url}" maxLength="20" '
            f'timeout="5" playBeep="true"/>'
        )


@method_decorator(csrf_exempt, name='dispatch')
class TwilioWhatsAppWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from_number = request.data.get('From', '')
        body = request.data.get('Body', '')
        media_url = request.data.get('MediaUrl0', None)
        message_sid = request.data.get('MessageSid', '')

        twilio_sig = request.headers.get('X-Twilio-Signature', '')
        request_url = request.build_absolute_uri()

        process_whatsapp_message.delay(
            from_number=from_number,
            message=body,
            media_url=media_url,
            message_sid=message_sid,
            request_url=request_url,
            twilio_signature=twilio_sig,
            post_data=dict(request.data),
        )
        return Response({'status': 'queued'}, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class TwilioVoiceInboundView(APIView):
    """
    Called when a student dials the Twilio voice number.
    Greets them and records their speech.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        call_sid = request.data.get('CallSid', '')
        logger.info('Voice inbound: %s', call_sid)

        base = _get_backend_url()
        action_url = f'{base}/api/webhooks/twilio/voice-answer/'

        twiml = _build_twiml(
            _twiml_say(VOICE_GREETING),
            _record_tag(action_url),
        )
        return HttpResponse(twiml, content_type='application/xml')


@method_decorator(csrf_exempt, name='dispatch')
class TwilioVoiceAnswerView(APIView):
    """
    Receives a recording from Twilio, processes it synchronously,
    and returns the AI response as TwiML.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        call_sid = request.data.get('CallSid', '')
        from_number = request.data.get('From', '')
        recording_url = request.data.get('RecordingUrl', '')
        recording_status = request.data.get('RecordingStatus', '')

        logger.info('Voice answer: %s, has_recording=%s', call_sid, bool(recording_url))

        base = _get_backend_url()
        action_url = f'{base}/api/webhooks/twilio/voice-answer/'

        if not recording_url or recording_status == 'failed':
            twiml = _build_twiml(
                _twiml_say('ക്ഷമിക്കണം, ശബ്ദം ശരിയായി ലഭിച്ചില്ല. ഒരിക്കൽ കൂടി ശ്രമിക്കൂ.'),
                _record_tag(action_url),
            )
            return HttpResponse(twiml, content_type='application/xml')

        r = redis_lib.from_url(settings.REDIS_URL)
        response_key = f'voice_response:{call_sid}'
        r.delete(response_key)

        process_voice_turn.delay(
            call_sid=call_sid,
            from_number=from_number,
            recording_url=recording_url,
        )

        ai_text = None
        for _ in range(VOICE_POLL_MAX_WAIT):
            time.sleep(VOICE_POLL_INTERVAL)
            ai_text = r.get(response_key)
            if ai_text:
                break

        if ai_text:
            if isinstance(ai_text, bytes):
                ai_text = ai_text.decode('utf-8')

            if 'CONVERSATION_COMPLETE' in ai_text:
                ai_text = ai_text.replace('CONVERSATION_COMPLETE', '').strip()
                twiml = _build_twiml(
                    _twiml_say(ai_text),
                    _twiml_say(VOICE_GOODBYE),
                    '<Hangup/>',
                )
                return HttpResponse(twiml, content_type='application/xml')

            twiml = _build_twiml(
                _twiml_say(ai_text),
                _record_tag(action_url),
            )
        else:
            twiml = _build_twiml(
                _twiml_say(VOICE_THINKING),
                _record_tag(action_url),
            )

        return HttpResponse(twiml, content_type='application/xml')


@method_decorator(csrf_exempt, name='dispatch')
class TwilioVoiceWebhookView(APIView):
    """Legacy voice webhook kept for backward compatibility."""
    permission_classes = [AllowAny]

    def post(self, request):
        return TwilioVoiceInboundView.as_view()(request._request)


@method_decorator(csrf_exempt, name='dispatch')
class MaskedCallBridgeView(APIView):
    """
    College user answered. Bridge the call to the student.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        call_sid = request.data.get('CallSid', '')
        lead_id = request.GET.get('lead', '')
        user_id = request.GET.get('user', '')

        try:
            twiml = MaskedCallingService().handle_college_answers(
                call_sid, lead_id, user_id
            )
        except Exception as e:
            logger.error('MaskedCallBridge error for %s: %s', call_sid, e)
            twiml = _build_twiml(
                _twiml_say('ഒരു technical error ഉണ്ടായി.'),
                '<Hangup/>',
            )
        return HttpResponse(twiml, content_type='application/xml')


@method_decorator(csrf_exempt, name='dispatch')
class TwilioCallStatusWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        call_sid = request.data.get('CallSid', '')
        call_status = request.data.get('CallStatus', '')
        try:
            MaskedCallingService().handle_call_status_webhook(
                call_sid, call_status
            )
        except Exception as e:
            logger.error('Error handling call status for %s: %s', call_sid, e)
        return Response({'status': 'ok'})


@method_decorator(csrf_exempt, name='dispatch')
class TwilioRecordingCompleteView(APIView):
    """Called by Twilio when a masked-call recording is ready."""
    permission_classes = [AllowAny]

    def post(self, request):
        call_sid = request.data.get('CallSid', '')
        recording_url = request.data.get('RecordingUrl', '')
        duration = int(request.data.get('RecordingDuration', 0) or 0)
        try:
            MaskedCallingService().handle_recording_complete(
                call_sid, recording_url, duration
            )
        except Exception as e:
            logger.error('Recording complete error for %s: %s', call_sid, e)
        return Response({'status': 'ok'})


@method_decorator(csrf_exempt, name='dispatch')
class InitiateMaskedCallView(APIView):
    """REST endpoint for college user to start a masked call."""
    permission_classes = [IsAuthenticated]

    def post(self, request, lead_id):
        try:
            from apps.leads.models import LeadAllocation
            allocation = LeadAllocation.objects.filter(
                lead_id=lead_id, tenant=request.user.tenant
            ).first()
            if not allocation:
                return Response(
                    {'error': 'Lead not allocated to your account'}, status=403
                )

            result = MaskedCallingService().initiate_masked_call(
                str(request.user.id), str(lead_id)
            )
            return Response(result, status=200)
        except PermissionError as e:
            return Response({'error': str(e)}, status=403)
        except Exception as e:
            logger.error('Masked call initiation failed: %s', e)
            return Response({'error': 'Failed to initiate call'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        service = RazorpayService()
        signature = request.headers.get('X-Razorpay-Signature', '')
        if not service.verify_webhook_signature(request.body, signature):
            logger.warning('Invalid Razorpay webhook signature')
            return Response({'error': 'Invalid signature'}, status=403)

        payload = json.loads(request.body)
        event = payload.get('event')

        handlers = {
            'payment.captured': service.handle_payment_captured,
            'subscription.charged': service.handle_subscription_charged,
            'subscription.cancelled': service.handle_subscription_cancelled,
            'payment.failed': service.handle_payment_failed,
        }

        handler = handlers.get(event)
        if handler:
            try:
                handler(payload)
            except Exception as e:
                logger.error('Error handling Razorpay event %s: %s', event, e)
                return Response({'detail': 'Processing error'}, status=500)

        return Response({'status': 'ok'})
