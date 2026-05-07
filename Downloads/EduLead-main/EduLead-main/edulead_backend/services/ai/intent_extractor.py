import json
import logging
from openai import OpenAI
from django.conf import settings

logger = logging.getLogger(__name__)


class IntentExtractorService:

    INTENT_PROMPT = """
    Analyse this Malayalam student message and classify the intent.
    Return JSON: {
        "primary_intent": "enroll|explore|curious|complaint|offtopic",
        "confidence": 0.0-1.0,
        "entities": {
            "course": "",
            "location": "",
            "budget": "",
            "timeline": ""
        },
        "sentiment": "positive|neutral|negative",
        "language": "ml|en|mixed"
    }
    Return only valid JSON, nothing else.
    """

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def extract(self, message: str) -> dict:
        try:
            response = self.client.chat.completions.create(
                model='gpt-4',
                messages=[
                    {'role': 'system', 'content': self.INTENT_PROMPT},
                    {'role': 'user', 'content': message},
                ],
                max_tokens=200,
                temperature=0,
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Intent extraction error: {e}")
            return {
                'primary_intent': 'curious',
                'confidence': 0.5,
                'entities': {},
                'sentiment': 'neutral',
                'language': 'mixed',
            }
