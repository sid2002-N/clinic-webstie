import logging
from config.celery import app as celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def process_whatsapp_message(
    self,
    from_number: str,
    message: str,
    media_url: str = None,
    message_sid: str = '',
    request_url: str = '',
    twilio_signature: str = '',
    post_data: dict = None,
):
    try:
        from services.communications.whatsapp import WhatsAppHandler
        handler = WhatsAppHandler()
        handler.handle_incoming(
            from_number=from_number,
            message_body=message,
            media_url=media_url,
            message_sid=message_sid,
            request_url=request_url,
            twilio_signature=twilio_signature,
            post_data=post_data,
        )
    except Exception as exc:
        logger.error(f'Error processing WhatsApp message from {from_number}: {exc}')
        raise self.retry(exc=exc, countdown=30 * (2 ** self.request.retries))


@celery_app.task(bind=True, max_retries=3)
def process_voice_turn(
    self,
    call_sid: str,
    from_number: str,
    recording_url: str,
):
    """
    Process a single turn in a voice call:
    1. Download & transcribe recording with Whisper
    2. Run GPT counsellor (streaming)
    3. Advance FSM state (including RECOMMEND and HANDOFF re-engage)
    4. Store AI response text in Redis (keyed by call_sid)
    The voice-answer webhook polls this key and plays TTS.
    """
    import redis as redis_lib
    from django.conf import settings

    r = redis_lib.from_url(settings.REDIS_URL)
    response_key = f'voice_response:{call_sid}'

    try:
        from services.ai.whisper_stt import WhisperSTTService
        stt = WhisperSTTService()
        transcript = stt.transcribe_from_url(recording_url)

        if not transcript:
            logger.warning(f'Empty transcript for call {call_sid}')
            r.setex(
                response_key, 300,
                'ക്ഷമിക്കണം, നിങ്ങളുടെ ശബ്ദം ശരിയായി കേൾക്കാൻ കഴിഞ്ഞില്ല. '
                'ദയവായി വീണ്ടും ശ്രമിക്കൂ.'
            )
            return

        student = _get_or_create_student_by_phone(from_number)
        conversation = _get_or_create_voice_conversation(student)
        history = _load_history(str(conversation.id))

        from services.ai.gpt_counsellor import GPTCounsellorService
        counsellor = GPTCounsellorService()

        if conversation.state == 'HANDOFF' and counsellor.can_reengage(history + [{'role': 'user', 'content': transcript}]):
            conversation.state = 'INTENT_QUALIFY'
            conversation.status = 'active'
            conversation.save(update_fields=['state', 'status'])
            logger.info(f'Re-engaged conversation {conversation.id} from HANDOFF')

        elif counsellor.detect_frustration(history):
            trigger_human_handoff.delay(str(conversation.id), 'frustration_detected')
            r.setex(
                response_key, 300,
                'ഒരു കൗൺസലർ ഉടൻ നിങ്ങളെ ബന്ധപ്പെടും. നന്ദി!'
            )
            return

        ai_response = counsellor.chat(history, transcript,
                                      conversation_state=conversation.state)

        history.append({'role': 'user', 'content': transcript})
        history.append({'role': 'assistant', 'content': ai_response})
        _save_history(str(conversation.id), history)

        from apps.conversations.models import Message
        Message.objects.create(
            conversation=conversation,
            role='student',
            content=transcript,
        )
        Message.objects.create(
            conversation=conversation,
            role='ai',
            content=ai_response,
        )

        next_state = counsellor.get_next_state(history, conversation.state)
        if next_state != conversation.state:
            conversation.state = next_state
            conversation.save(update_fields=['state'])
            logger.info(f'Conversation {conversation.id} → state {next_state}')

        r.setex(response_key, 300, ai_response)

        if counsellor.is_conversation_complete(history):
            conversation.status = 'completed'
            from django.utils import timezone
            conversation.completed_at = timezone.now()
            conversation.save(update_fields=['status', 'completed_at'])
            process_completed_conversation.delay(str(conversation.id))

        logger.info(f'Voice turn processed for {call_sid}: {transcript[:40]}')

    except Exception as exc:
        logger.error(f'Error processing voice turn for {call_sid}: {exc}')
        r.setex(
            response_key, 300,
            'ക്ഷമിക്കണം, ഒരു സാങ്കേതിക പ്രശ്നം ഉണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കൂ.'
        )
        raise self.retry(exc=exc, countdown=30 * (2 ** self.request.retries))


@celery_app.task
def trigger_human_handoff(conversation_id: str, reason: str):
    from apps.conversations.models import Conversation

    try:
        conversation = Conversation.objects.get(id=conversation_id)
        conversation.status = 'human_handoff'
        conversation.state = 'HANDOFF'
        conversation.handoff_reason = reason
        conversation.save(update_fields=['status', 'state', 'handoff_reason'])
        logger.warning(
            f'Human handoff triggered for conversation {conversation_id}: {reason}'
        )
    except Conversation.DoesNotExist:
        logger.error(f'Conversation {conversation_id} not found for handoff')


@celery_app.task
def process_completed_conversation(conversation_id: str):
    try:
        from apps.conversations.models import Conversation, Message
        from apps.leads.models import Lead
        from services.ai.gpt_counsellor import GPTCounsellorService

        conversation = Conversation.objects.select_related('student').get(
            id=conversation_id
        )

        messages = Message.objects.filter(
            conversation=conversation
        ).order_by('created_at')
        history = [
            {'role': 'user' if m.role == 'student' else 'assistant',
             'content': m.content}
            for m in messages
        ]

        counsellor = GPTCounsellorService()
        lead_data = counsellor.extract_lead_data(history)

        if not lead_data:
            logger.warning(
                f'Could not extract lead data from conversation {conversation_id}'
            )
            return

        lead = Lead.objects.create(
            student=conversation.student,
            conversation=conversation,
            full_name=lead_data.get('full_name', ''),
            course_interest=lead_data.get('course_interest', ''),
            location=lead_data.get('location', ''),
            budget_range=lead_data.get('budget_range', ''),
            timeline=lead_data.get('timeline', ''),
            intent_level=lead_data.get('intent_level', ''),
        )

        conversation.status = 'completed'
        conversation.state = 'ENDED'
        from django.utils import timezone
        conversation.completed_at = timezone.now()
        conversation.save(update_fields=['status', 'state', 'completed_at'])

        from tasks.lead_tasks import score_and_allocate_lead
        score_and_allocate_lead.delay(str(lead.id))

        logger.info(
            f'Lead created from conversation {conversation_id}: {lead.id}'
        )
        return str(lead.id)

    except Exception as exc:
        logger.error(
            f'Error processing completed conversation {conversation_id}: {exc}'
        )


def _get_or_create_student_by_phone(phone: str):
    from apps.students.models import Student
    student, _ = Student.objects.get_or_create(
        whatsapp_number=phone,
        defaults={'whatsapp_number': phone},
    )
    return student


def _get_or_create_voice_conversation(student):
    from apps.conversations.models import Conversation
    conv = Conversation.objects.filter(
        student=student, status='active', channel='voice'
    ).first()
    if not conv:
        conv = Conversation.objects.create(
            student=student, channel='voice', status='active', state='GREETING'
        )
    return conv


def _load_history(conversation_id: str) -> list:
    import json
    import redis as redis_lib
    from django.conf import settings
    r = redis_lib.from_url(settings.REDIS_URL)
    key = f'conv_history:{conversation_id}'
    data = r.get(key)
    if data:
        return json.loads(data)
    from apps.conversations.models import Message
    messages = Message.objects.filter(
        conversation_id=conversation_id
    ).order_by('created_at').values('role', 'content')
    return [
        {'role': 'user' if m['role'] == 'student' else 'assistant',
         'content': m['content']}
        for m in messages
    ][-20:]


def _save_history(conversation_id: str, history: list):
    import json
    import redis as redis_lib
    from django.conf import settings
    r = redis_lib.from_url(settings.REDIS_URL)
    r.setex(f'conv_history:{conversation_id}', 60 * 60 * 24 * 7,
            json.dumps(history[-20:]))
