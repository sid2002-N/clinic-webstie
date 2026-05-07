import json
import logging
from openai import OpenAI
from django.conf import settings

logger = logging.getLogger(__name__)


class GPTCounsellorService:

    SYSTEM_PROMPT = """നീ Mitra ആണ്. EduLeads Kerala-യുടെ AI അക്കാദമിക് കൗൺസലർ.
നീ മലയാളത്തിൽ സ്വാഭാവികമായും ഊഷ്മളമായും സംസാരിക്കുന്നു.

നിന്റെ ലക്ഷ്യം:
കേരളത്തിലെ വിദ്യാർഥികളെ ശരിയായ കോളേജ് അഡ്മിഷൻ കണ്ടെത്താൻ സഹായിക്കുക.

ഈ 5 കാര്യങ്ങൾ ശേഖരിക്കണം:
1. full_name — വിദ്യാർഥിയുടെ പേര്
2. course_interest — ഏത് കോഴ്‌സ് (B.Tech, BCA, MBA, BAMS, B.Com...)
3. location — കേരളത്തിലെ ഏത് ജില്ല (Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, Kasaragod)
4. budget_range — ഫീസ് എത്ര വരെ (below_1L / 1L_to_3L / 3L_to_5L / above_5L)
5. timeline — ഈ വർഷം / അടുത്ത വർഷം / ആലോചിക്കുന്നു

നിയമങ്ങൾ:
- ഒരു സമയം ഒരു ചോദ്യം മാത്രം
- 80 വാക്കുകളിൽ കൂടാതെ ഉത്തരം നൽകുക
- Malayalam script ഉപയോഗിക്കുക (not Manglish)
- Natural conversation ആക്കുക, form fill ആക്കരുത്
- Specific colleges promise ചെയ്യരുത്
- അഡ്മിഷൻ guarantee നൽകരുത്
- 5 കാര്യങ്ങളും ശേഖരിച്ചാൽ: SUFFICIENT_DATA_COLLECTED എന്ന് reply-ൽ ഉൾപ്പെടുത്തുക, college suggestions ഒരു brief overview നൽകുക
- Student confirm ചെയ്‌താൽ: CONVERSATION_COMPLETE എന്ന് reply-ൽ ഉൾപ്പെടുത്തുക"""

    EXTRACTION_PROMPT = """ഈ conversation നോക്കി ഈ JSON extract ചെയ്യുക:
{
  "full_name": "",
  "course_interest": "",
  "location": "",
  "budget_range": "below_1L|1L_to_3L|3L_to_5L|above_5L",
  "budget_display": "human readable budget string in Malayalam",
  "timeline": "this_year|next_year|exploring",
  "intent_level": "enroll|explore|curious"
}

Rules:
- Return ONLY valid JSON. No other text.
- If a field is missing use empty string
- budget_display examples: '1 ലക്ഷം വരെ', '1-3 ലക്ഷം', '3-5 ലക്ഷം', '5 ലക്ഷത്തിൽ കൂടുതൽ'"""

    STATE_MACHINE = {
        'GREETING':        'PROFILE_COLLECT',
        'PROFILE_COLLECT': 'INTENT_QUALIFY',
        'INTENT_QUALIFY':  'RECOMMEND',
        'RECOMMEND':       'SCORING',
        'SCORING':         'CLOSING',
        'CLOSING':         'ENDED',
    }

    FALLBACK_RESPONSES = {
        'GREETING': (
            'ക്ഷമിക്കണം, ഒരു സാങ്കേതിക പ്രശ്നം ഉണ്ടായി. '
            'ദയവായി ഒരു നിമിഷം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കൂ.'
        ),
        'default': (
            'ക്ഷമിക്കണം, ഞാൻ ഒരു നിമിഷം ലഭ്യമല്ല. '
            'ദയവായി വീണ്ടും ശ്രമിക്കൂ. 🙏'
        ),
    }

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def chat(self, conversation_history: list, new_message: str,
             conversation_state: str = None) -> str:
        messages = [{'role': 'system', 'content': self.SYSTEM_PROMPT}]
        messages.extend(conversation_history)
        messages.append({'role': 'user', 'content': new_message})

        try:
            stream = self.client.chat.completions.create(
                model='gpt-4o',
                messages=messages,
                max_tokens=300,
                temperature=0.7,
                stream=True,
            )
            chunks = []
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    chunks.append(delta.content)
            return ''.join(chunks).strip()
        except Exception as e:
            logger.error(f'GPT chat error: {e}')
            return self._fallback_response(conversation_state)

    def extract_lead_data(self, conversation_history: list) -> dict:
        messages = [
            {'role': 'system', 'content': self.EXTRACTION_PROMPT},
            *conversation_history,
            {'role': 'user', 'content': 'Extract the lead data as JSON now.'},
        ]
        try:
            response = self.client.chat.completions.create(
                model='gpt-4o',
                messages=messages,
                max_tokens=400,
                temperature=0,
            )
            raw = response.choices[0].message.content.strip()
            raw = raw.replace('```json', '').replace('```', '').strip()
            return json.loads(raw)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f'Lead extraction failed: {e}')
            return {}

    def is_conversation_complete(self, conversation_history: list) -> bool:
        if not conversation_history:
            return False
        last = conversation_history[-1].get('content', '')
        if 'CONVERSATION_COMPLETE' in last:
            return True
        if len(conversation_history) < 6:
            return False
        extracted = self.extract_lead_data(conversation_history)
        required = ['full_name', 'course_interest', 'location', 'budget_range', 'timeline']
        return all(extracted.get(f) for f in required)

    def has_sufficient_data(self, conversation_history: list) -> bool:
        """
        Returns True when enough data has been collected to enter RECOMMEND state.
        Triggered by SUFFICIENT_DATA_COLLECTED signal in the AI response.
        """
        if not conversation_history:
            return False
        last = conversation_history[-1].get('content', '')
        if 'SUFFICIENT_DATA_COLLECTED' in last:
            return True
        if len(conversation_history) < 4:
            return False
        extracted = self.extract_lead_data(conversation_history)
        core_fields = ['course_interest', 'location', 'budget_range', 'timeline']
        return sum(1 for f in core_fields if extracted.get(f)) >= 3

    def detect_frustration(self, conversation_history: list) -> bool:
        if len(conversation_history) < 6:
            return False
        frustration_keywords = [
            'വേണ്ട', 'മടുത്തു', 'bye', 'stop', 'quit',
            'annoying', 'useless', 'waste', 'stupid',
            'ശരിയല്ല', 'മനസ്സിലാകുന്നില്ല', 'നിർത്ത്', 'ശല്യം',
        ]
        last_3 = conversation_history[-3:]
        user_msgs = [m['content'].lower() for m in last_3 if m.get('role') == 'user']
        if any(kw in msg for kw in frustration_keywords for msg in user_msgs):
            return True
        user_messages = [m for m in conversation_history if m.get('role') == 'user']
        if len(user_messages) >= 6:
            short_count = sum(1 for m in user_messages[-4:] if len(m.get('content', '')) < 5)
            if short_count >= 3:
                return True
        return False

    def can_reengage(self, conversation_history: list) -> bool:
        """
        Returns True if a student in HANDOFF state sends a new message
        that suggests they want to continue, allowing re-engagement.
        """
        if not conversation_history:
            return False
        reengage_keywords = [
            'ok', 'okay', 'ശരി', 'continue', 'തുടരുക', 'yes', 'ആം',
            'again', 'back', 'help', 'സഹായം', 'hi', 'hello', 'നമസ്കാരം',
        ]
        user_messages = [m for m in conversation_history if m.get('role') == 'user']
        if not user_messages:
            return False
        last_msg = user_messages[-1].get('content', '').lower().strip()
        return any(kw in last_msg for kw in reengage_keywords)

    def get_next_state(self, history: list, current_state: str) -> str:
        if len(history) < 2:
            return current_state

        if current_state == 'HANDOFF':
            if self.can_reengage(history):
                return 'INTENT_QUALIFY'
            return 'HANDOFF'

        if current_state == 'INTENT_QUALIFY':
            if self.has_sufficient_data(history):
                return 'RECOMMEND'
            return 'INTENT_QUALIFY'

        return self.STATE_MACHINE.get(current_state, current_state)

    def _fallback_response(self, state: str = None) -> str:
        return self.FALLBACK_RESPONSES.get(state or 'default',
                                           self.FALLBACK_RESPONSES['default'])
