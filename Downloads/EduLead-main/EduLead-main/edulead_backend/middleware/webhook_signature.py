import hmac
import hashlib
import logging
from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class WebhookSignatureMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        if path.startswith('/api/webhooks/twilio/'):
            if not self._validate_twilio_signature(request):
                logger.warning(f"Invalid Twilio signature on {path}")
                return JsonResponse({'detail': 'Invalid Twilio signature'}, status=403)

        return self.get_response(request)

    def _validate_twilio_signature(self, request) -> bool:
        if not settings.TWILIO_AUTH_TOKEN:
            return True

        try:
            from twilio.request_validator import RequestValidator
            validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)

            proto = request.META.get('HTTP_X_FORWARDED_PROTO', 'https')
            host = request.META.get('HTTP_HOST', '')
            url = f'{proto}://{host}{request.path}'

            signature = request.META.get('HTTP_X_TWILIO_SIGNATURE', '')
            if not signature:
                logger.debug('No Twilio signature header — skipping validation in dev')
                return True

            post_data = request.POST.dict()
            return validator.validate(url, post_data, signature)
        except Exception as e:
            logger.error(f"Twilio signature validation error: {e}")
            return False
