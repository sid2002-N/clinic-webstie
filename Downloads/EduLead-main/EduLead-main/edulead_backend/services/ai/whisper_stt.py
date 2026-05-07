import io
import logging
import tempfile
import os
from openai import OpenAI
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

SILENCE_THRESHOLD = 500
BUFFER_DURATION_MS = 300


class WhisperSTTService:

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self._audio_buffer = bytearray()

    # OWASP A10 — SSRF: only fetch media from trusted Twilio/CDN hostnames.
    _TRUSTED_MEDIA_HOSTS = {
        'api.twilio.com',
        'media.twiliocdn.com',
        'storage.googleapis.com',
    }

    @staticmethod
    def _is_trusted_media_url(url: str) -> bool:
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            if parsed.scheme != 'https':
                return False
            hostname = (parsed.hostname or '').lower()
            return (
                hostname in WhisperSTTService._TRUSTED_MEDIA_HOSTS
                or hostname.endswith('.twilio.com')
                or hostname.endswith('.twiliocdn.com')
            )
        except Exception:
            return False

    def transcribe_from_url(self, media_url: str, language: str = 'ml') -> str:
        """
        Download audio from Twilio URL and transcribe with Whisper.
        Twilio requires auth to download media.
        """
        if not self._is_trusted_media_url(media_url):
            logger.error(f'STT: rejected untrusted media URL: {media_url[:80]}')
            return ''

        cache_key = f'stt:{media_url[-40:]}'
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            import httpx
            auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            response = httpx.get(media_url, auth=auth, timeout=30,
                                 follow_redirects=False)
            response.raise_for_status()

            suffix = '.ogg'
            if 'mp3' in media_url.lower():
                suffix = '.mp3'
            elif 'wav' in media_url.lower():
                suffix = '.wav'

            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(response.content)
                tmp_path = tmp.name

            result = self.transcribe_audio(tmp_path, language)
            os.unlink(tmp_path)

            if result:
                cache.set(cache_key, result, timeout=3600)
            return result

        except Exception as e:
            logger.error(f'Whisper STT from URL failed: {e}')
            return ''

    def transcribe_audio(self, audio_file_path: str, language: str = 'ml') -> str:
        try:
            with open(audio_file_path, 'rb') as audio_file:
                response = self.client.audio.transcriptions.create(
                    model='whisper-1',
                    file=audio_file,
                    language=language,
                    response_format='text',
                )
            return response.strip()
        except Exception as e:
            logger.error(f'Whisper transcription error: {e}')
            return ''

    def transcribe_bytes(self, audio_bytes: bytes, filename: str = 'audio.mp3',
                         language: str = 'ml') -> str:
        try:
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = filename
            response = self.client.audio.transcriptions.create(
                model='whisper-1',
                file=audio_file,
                language=language,
                response_format='text',
            )
            return response.strip()
        except Exception as e:
            logger.error(f'Whisper bytes transcription error: {e}')
            return ''

    def transcribe_stream(self, audio_chunk: bytes) -> str:
        self._audio_buffer.extend(audio_chunk)
        if len(self._audio_buffer) < BUFFER_DURATION_MS * 8:
            return ''
        silence_detected = self._detect_silence(audio_chunk)
        if not silence_detected and len(self._audio_buffer) < 40000:
            return ''
        buffer_copy = bytes(self._audio_buffer)
        self._audio_buffer.clear()
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            f.write(buffer_copy)
            tmp_path = f.name
        try:
            return self.transcribe_audio(tmp_path, language='ml')
        finally:
            os.unlink(tmp_path)

    def _detect_silence(self, chunk: bytes) -> bool:
        if not chunk:
            return True
        amplitude = sum(abs(b - 128) for b in chunk) / len(chunk)
        return amplitude < 5
