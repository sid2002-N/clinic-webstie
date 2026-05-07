import time
import hashlib
import json
import logging
import redis
from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def get_redis():
    return redis.from_url(settings.REDIS_URL)


def _hash_ip(ip: str) -> str:
    """
    OWASP / GDPR — never log raw IP addresses.
    Log a short SHA-256 digest instead so the log is useful but not PII.
    """
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


class RateLimitMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        result = self._check_rate_limit(request)
        if result is not None:
            return result
        return self.get_response(request)

    def _check_rate_limit(self, request):
        path = request.path
        ip = self._get_client_ip(request)

        if path.startswith('/api/webhooks/'):
            phone = request.POST.get('From', '') or request.GET.get('From', '')
            key = f'ratelimit:webhook:{phone or ip}'
            if self._is_limited(key, settings.RATE_LIMIT_WEBHOOK_PER_MINUTE, 60):
                return self._too_many_requests(60)

        elif path.startswith('/api/auth/login'):
            blocked_key = f'ratelimit:auth_blocked:{ip}'
            try:
                r = get_redis()
                if r.exists(blocked_key):
                    ttl = r.ttl(blocked_key)
                    return self._too_many_requests(ttl)
            except Exception:
                pass

            key = f'ratelimit:auth:{ip}'
            if self._is_limited(key, settings.RATE_LIMIT_AUTH_PER_MINUTE, 60):
                return self._too_many_requests(60)

        elif '/reveal-phone' in path:
            tenant_id = self._get_tenant_id(request)
            if tenant_id:
                key = f'ratelimit:reveal:{tenant_id}'
                if self._is_limited(key, settings.RATE_LIMIT_PHONE_REVEAL_PER_HOUR, 3600):
                    return self._too_many_requests(3600)

        elif '/call' in path and request.method == 'POST':
            tenant_id = self._get_tenant_id(request)
            if tenant_id:
                key = f'ratelimit:call:{tenant_id}'
                if self._is_limited(key, settings.RATE_LIMIT_MASKED_CALL_PER_HOUR, 3600):
                    return self._too_many_requests(3600)

        elif path.startswith('/api/'):
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token_prefix = auth_header[7:27]
                key = f'ratelimit:api:{token_prefix}'
                if self._is_limited(key, settings.RATE_LIMIT_API_PER_MINUTE, 60):
                    return self._too_many_requests(60)

        return None

    def _is_limited(self, key: str, limit: int, window: int) -> bool:
        try:
            r = get_redis()
            now = time.time()
            window_start = now - window

            pipe = r.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window)
            results = pipe.execute()

            count = results[2]
            return count > limit
        except Exception as e:
            logger.warning(f"Rate limit check error: {e}")
            return False

    def _too_many_requests(self, retry_after: int) -> JsonResponse:
        response = JsonResponse(
            {'detail': 'Too many requests. Please slow down.'},
            status=429,
        )
        response['Retry-After'] = str(retry_after)
        return response

    def _get_client_ip(self, request) -> str:
        """
        OWASP A05 — X-Forwarded-For spoofing protection.
        Only trust the last N IPs appended by our known proxies, where N
        is configured by TRUSTED_PROXY_COUNT (default 1).
        An attacker can prepend fake IPs to X-Forwarded-For; we always
        take from the RIGHT side of the chain so only our proxy's additions
        are trusted.
        """
        trusted = getattr(settings, 'TRUSTED_PROXY_COUNT', 1)
        xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if xff:
            ips = [ip.strip() for ip in xff.split(',')]
            # Take the IP that is `trusted` hops from the right.
            # If there are fewer entries than trusted hops, use the leftmost.
            idx = max(len(ips) - trusted, 0)
            return ips[idx]
        return request.META.get('REMOTE_ADDR', '')

    def _get_tenant_id(self, request) -> str:
        auth = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth.startswith('Bearer '):
            return ''
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(auth[7:])
            return str(token.get('tenant_id', ''))
        except Exception:
            return ''

    def record_auth_failure(self, ip: str):
        try:
            r = get_redis()
            fail_key = f'ratelimit:auth_fail:{ip}'
            failures = r.incr(fail_key)
            r.expire(fail_key, 1800)
            if failures >= settings.RATE_LIMIT_AUTH_MAX_FAILURES:
                block_key = f'ratelimit:auth_blocked:{ip}'
                r.setex(block_key, settings.RATE_LIMIT_AUTH_BLOCK_MINUTES * 60, '1')
                # GDPR — log hashed IP, not the raw address
                logger.warning(
                    f"IP [{_hash_ip(ip)}] blocked after {failures} failed auth attempts"
                )
        except Exception as e:
            logger.warning(f"Error recording auth failure: {e}")
