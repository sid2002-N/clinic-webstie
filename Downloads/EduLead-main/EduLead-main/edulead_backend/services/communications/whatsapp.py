import json
import logging
import redis
from django.conf import settings
from django.core.cache import cache
from twilio.rest import Client
from twilio.request_validator import RequestValidator

logger = logging.getLogger(__name__)

CONSENT_MESSAGE = (
    'നമസ്കാരം! ഞാൻ Mitra — EduLeads Kerala-യുടെ AI കൗൺസലർ. '
    'കേരളത്തിലെ മികച്ച കോളേജ് കണ്ടെത്താൻ ഞാൻ നിങ്ങളെ സഹായിക്കും. '
    'തുടരുന്നതിന് മുൻപ്, നിങ്ങളുടെ വിവരങ്ങൾ യോഗ്യരായ കോളേജുകൾക്ക് '
    'കൈമാറുന്നതിന് സമ്മതമുണ്ടോ? *YES* അല്ലെങ്കിൽ *NO* എന്ന് മറുപടി നൽകൂ.'
)

CONSENT_GRANTED_MESSAGE = (
    'നന്ദി! ഞാൻ Mitra. 😊 നിങ്ങൾക്ക് ഏത് കോഴ്‌സ് '
    'പഠിക്കണമെന്ന് ആഗ്രഹമുണ്ട്?'
)

CONSENT_DECLINED_MESSAGE = (
    'ശരി, മനസ്സിലായി. നിങ്ങൾ ആഗ്രഹിക്കുമ്പോൾ വീണ്ടും ബന്ധപ്പെടൂ. 🙏'
)

HANDOFF_MESSAGE = (
    'ഒരു നിമിഷം — ഒരു മനുഷ്യ കൗൺസലർ ഉടൻ ബന്ധപ്പെടും. '
    'ദയവായി കാത്തിരിക്കൂ. 🙏'
)

HISTORY_TTL = 60 * 60 * 24 * 7
MAX_HISTORY_MESSAGES = 20
DEDUP_TTL = 60 * 5


def get_redis_client():
    return redis.from_url(settings.REDIS_URL)


class WhatsAppHandler:

    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
        self.from_number = settings.TWILIO_WHATSAPP_NUMBER

    def handle_incoming(
        self,
        from_number: str,
        message_body: str,
        media_url: str = None,
        message_sid: str = '',
        request_url: str = '',
        twilio_signature: str = '',
        post_data: dict = None,
    ):
        if settings.TWILIO_AUTH_TOKEN and twilio_signature and post_data:
            valid = self.validator.validate(request_url, post_data or {}, twilio_signature)
            if not valid:
                logger.warning(f'Invalid Twilio signature from {from_number}')
                return

        if message_sid and self._is_duplicate(message_sid):
            logger.info(f'Duplicate WhatsApp message {message_sid} — skipped')
            return
        if message_sid:
            self._mark_seen(message_sid)

        if media_url and not message_body.strip():
            transcription = self._transcribe_audio(media_url)
            if transcription:
                message_body = transcription
                logger.info(f'Audio transcribed: {transcription[:60]}')
            else:
                message_body = '[voice message]'

        student = self._get_or_create_student(from_number)

        if not student.consent_given:
            self._handle_consent(student, from_number, message_body)
            return

        conversation = self._get_or_create_conversation(student)
        history = self._load_history(str(conversation.id))

        from services.ai.gpt_counsellor import GPTCounsellorService
        counsellor = GPTCounsellorService()

        incoming_history = history + [{'role': 'user', 'content': message_body}]

        if conversation.state == 'HANDOFF':
            if counsellor.can_reengage(incoming_history):
                conversation.state = 'INTENT_QUALIFY'
                conversation.status = 'active'
                conversation.save(update_fields=['state', 'status'])
                logger.info(f'Re-engaged conversation {conversation.id} from HANDOFF')
            else:
                self.send_message(
                    from_number,
                    'ഒരു കൗൺസലർ ഉടൻ ബന്ധപ്പെടും. '
                    'തുടരണമെങ്കിൽ "OK" അല്ലെങ്കിൽ "തുടരുക" എന്ന് Reply ചെയ്യൂ. 🙏'
                )
                return

        elif counsellor.detect_frustration(history):
            from tasks.ai_tasks import trigger_human_handoff
            trigger_human_handoff.delay(str(conversation.id), 'frustration_detected')
            self.send_message(from_number, HANDOFF_MESSAGE)
            return

        ai_response = counsellor.chat(history, message_body,
                                      conversation_state=conversation.state)

        history.append({'role': 'user', 'content': message_body})
        history.append({'role': 'assistant', 'content': ai_response})
        if len(history) > MAX_HISTORY_MESSAGES:
            history = history[-MAX_HISTORY_MESSAGES:]

        self._save_history(str(conversation.id), history)
        self._save_message(conversation, 'student', message_body, media_url, message_sid)
        self._save_message(conversation, 'ai', ai_response, None, '')
        self.send_message(from_number, ai_response)

        next_state = counsellor.get_next_state(history, conversation.state)
        if next_state != conversation.state:
            conversation.state = next_state
            conversation.save(update_fields=['state'])
            logger.info(f'Conversation {conversation.id} → state {next_state}')

        if counsellor.is_conversation_complete(history):
            from tasks.ai_tasks import process_completed_conversation
            process_completed_conversation.delay(str(conversation.id))

    def _handle_consent(self, student, from_number: str, message_body: str):
        normalised = message_body.strip().upper()
        if normalised in ('YES', 'ഹ', 'ആണ്', 'OKAY', 'OK', 'Y'):
            from services.compliance.consent import ConsentService
            ConsentService().record_consent(str(student.id), 'whatsapp', None)
            student.refresh_from_db()
            self.send_message(from_number, CONSENT_GRANTED_MESSAGE)
        elif normalised in ('NO', 'ഇല്ല', 'N', 'STOP'):
            self.send_message(from_number, CONSENT_DECLINED_MESSAGE)
        else:
            self.send_message(from_number, CONSENT_MESSAGE)

    def send_message(self, to_number: str, message: str):
        try:
            msg = self.client.messages.create(
                from_=self.from_number,
                to=to_number,
                body=message,
            )
            logger.info(f'WhatsApp sent to {to_number}: {msg.sid}')
            return msg.sid
        except Exception as e:
            logger.error(f'Failed to send WhatsApp to {to_number}: {e}')
            return None

    def _transcribe_audio(self, media_url: str) -> str:
        try:
            from services.ai.whisper_stt import WhisperSTTService
            return WhisperSTTService().transcribe_from_url(media_url)
        except Exception as e:
            logger.error(f'Audio transcription failed: {e}')
            return ''

    def _is_duplicate(self, message_sid: str) -> bool:
        return bool(cache.get(f'wa_msg:{message_sid}'))

    def _mark_seen(self, message_sid: str):
        cache.set(f'wa_msg:{message_sid}', 1, timeout=DEDUP_TTL)

    def _get_or_create_student(self, whatsapp_number: str):
        from apps.students.models import Student
        student, _ = Student.objects.get_or_create(
            whatsapp_number=whatsapp_number,
            defaults={'whatsapp_number': whatsapp_number},
        )
        return student

    def _get_or_create_conversation(self, student):
        from apps.conversations.models import Conversation
        conversation = Conversation.objects.filter(
            student=student,
            status='active',
            channel='whatsapp',
        ).first()
        if not conversation:
            conversation = Conversation.objects.create(
                student=student,
                channel='whatsapp',
                status='active',
                state='GREETING',
            )
        return conversation

    def _load_history(self, conversation_id: str) -> list:
        r = get_redis_client()
        key = f'conv_history:{conversation_id}'
        data = r.get(key)
        if data:
            return json.loads(data)
        from apps.conversations.models import Message
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).order_by('created_at').values('role', 'content')
        history = [
            {'role': 'user' if m['role'] == 'student' else 'assistant',
             'content': m['content']}
            for m in messages
        ]
        return history[-MAX_HISTORY_MESSAGES:]

    def _save_history(self, conversation_id: str, history: list):
        r = get_redis_client()
        key = f'conv_history:{conversation_id}'
        r.setex(key, HISTORY_TTL, json.dumps(history))

    def _save_message(self, conversation, role: str, content: str,
                      media_url: str = None, message_sid: str = ''):
        from apps.conversations.models import Message
        Message.objects.create(
            conversation=conversation,
            role=role,
            content=content,
            media_url=media_url or '',
            twilio_message_sid=message_sid or '',
        )
