import hashlib
import logging
import io
import redis
import boto3
from django.conf import settings

logger = logging.getLogger(__name__)

MITRA_VOICE = 'Google.ml-IN-Neural2-A'
MITRA_VOICE_FALLBACK = 'Google.ml-IN-Wavenet-A'


def get_redis():
    return redis.from_url(settings.REDIS_URL)


class MalayalamTTSService:
    """
    Malayalam TTS service for EduLeads (Mitra's voice).

    Primary:  Google Neural2 (ml-IN-Neural2-A) via Twilio <Say> — most natural,
              zero extra API keys, delivered directly by Twilio.
    Optional: Azure Neural (ml-IN-SobhaNeural) — used only when AZURE_TTS_KEY is
              configured and audio needs to be pre-rendered to a file (e.g. for
              IVR menus or cached audio clips).

    For all real-time voice call turns, use twiml_say() which produces a <Say>
    tag referencing Google Neural2 — no Azure key required.
    """

    AZURE_VOICE = 'ml-IN-SobhaNeural'

    def __init__(self):
        self.azure_key = getattr(settings, 'AZURE_TTS_KEY', '')
        self.azure_region = getattr(settings, 'AZURE_TTS_REGION', 'centralindia')
        self.azure_endpoint = (
            f'https://{self.azure_region}.tts.speech.microsoft.com/cognitiveservices/v1'
        )

    def azure_available(self) -> bool:
        return bool(self.azure_key)

    def twiml_say(self, text: str) -> str:
        """
        Returns a TwiML <Say> fragment using the official Twilio helper library,
        which handles XML escaping internally. No raw f-string XML construction.
        """
        # OWASP A03 — Use Twilio's own builder so content is safely encoded.
        try:
            from twilio.twiml.voice_response import VoiceResponse, Say
            vr = VoiceResponse()
            vr.append(Say(str(text), language='ml-IN', voice=MITRA_VOICE))
            full = str(vr)
            inner = full[full.index('<Response>') + len('<Response>'):full.index('</Response>')].strip()
            return inner
        except Exception:
            escaped = (
                str(text).replace('&', '&amp;').replace('<', '&lt;')
                .replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')
            )
            return f'<Say language="ml-IN" voice="{MITRA_VOICE}">{escaped}</Say>'

    def synthesize_via_azure(self, text: str) -> bytes:
        """
        Synthesize audio bytes using Azure Neural TTS (SobhaNeural).
        Only available when AZURE_TTS_KEY is configured.
        Results are cached in Redis for 1 hour.
        """
        if not self.azure_available():
            return b''

        # OWASP A02 — MD5 is not collision-resistant; use SHA-256 for cache keys.
        cache_key = f'tts:azure:{hashlib.sha256(text.encode()).hexdigest()}'
        r = get_redis()
        cached = r.get(cache_key)
        if cached:
            return cached

        ssml = (
            f"<speak version='1.0' xml:lang='ml-IN'>"
            f"<voice name='{self.AZURE_VOICE}'>{text}</voice></speak>"
        )
        headers = {
            'Ocp-Apim-Subscription-Key': self.azure_key,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        }
        try:
            import requests
            resp = requests.post(
                self.azure_endpoint,
                data=ssml.encode('utf-8'),
                headers=headers,
                timeout=10,
            )
            if resp.status_code == 200:
                audio_bytes = resp.content
                r.setex(cache_key, 3600, audio_bytes)
                return audio_bytes
            logger.error(f'Azure TTS error {resp.status_code}: {resp.text}')
            return b''
        except Exception as e:
            logger.error(f'Azure TTS request error: {e}')
            return b''

    def synthesize_to_s3(self, text: str, s3_key: str) -> str:
        """
        Synthesize audio (Azure if available, else empty) and upload to S3.
        Returns the public S3 URL or empty string on failure.
        Intended for pre-rendered audio clips, not real-time conversation turns.
        """
        audio_bytes = self.synthesize_via_azure(text)
        if not audio_bytes:
            return ''

        aws_bucket = getattr(settings, 'AWS_S3_BUCKET', '')
        if not aws_bucket:
            return ''

        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION,
        )
        try:
            s3.upload_fileobj(
                io.BytesIO(audio_bytes),
                aws_bucket,
                s3_key,
                ExtraArgs={'ContentType': 'audio/mpeg'},
            )
            return (
                f'https://{aws_bucket}.s3.{settings.AWS_S3_REGION}'
                f'.amazonaws.com/{s3_key}'
            )
        except Exception as e:
            logger.error(f'S3 TTS upload error: {e}')
            return ''

    def twiml_play_or_say(self, text: str, audio_url: str = '') -> str:
        """
        Returns TwiML: <Play> if a pre-rendered audio URL is given,
        otherwise <Say> with Google Neural2.
        """
        if audio_url:
            return f'<Play>{audio_url}</Play>'
        return self.twiml_say(text)
