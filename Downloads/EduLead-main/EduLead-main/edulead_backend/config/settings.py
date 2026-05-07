import os
from pathlib import Path
from datetime import timedelta
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

# OWASP A05 — Security Misconfiguration
# Production: set ALLOWED_HOSTS to your actual domain(s) via environment variable.
# Example: ALLOWED_HOSTS=edulead.in,api.edulead.in
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'django_celery_beat',
    'drf_spectacular',
    'apps.tenants',
    'apps.users',
    'apps.students',
    'apps.leads',
    'apps.conversations',
    'apps.communications',
    'apps.subscriptions',
    'apps.webhooks',
    'apps.analytics',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'middleware.security_headers.SecurityHeadersMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'middleware.webhook_signature.WebhookSignatureMiddleware',
    'middleware.rate_limit.RateLimitMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.routing.application'

_db_url = env('DATABASE_URL', default='')
if _db_url and _db_url != 'postgresql://user:password@host:5432/edulead_db':
    DATABASES = {'default': env.db('DATABASE_URL')}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

_redis_url = env('REDIS_URL', default='redis://localhost:6379')
try:
    import redis as _r
    _r.Redis.from_url(_redis_url).ping()
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': _redis_url,
        }
    }
except Exception:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }

# OWASP A07 — Password policy
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 10},
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'users.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# OWASP A05 — Security headers (browser-level)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# OWASP A05 — Transport security (enforce HTTPS in production only)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # OWASP A05 — DRF-level fallback throttling (custom Redis throttle in middleware is primary)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '1000/hour',
    },
    'EXCEPTION_HANDLER': 'config.exceptions.custom_exception_handler',
}

# OWASP A02 — Use a dedicated signing key for JWT, separate from Django's SECRET_KEY.
# Production: set JWT_SIGNING_KEY to a long random string independent of SECRET_KEY.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('JWT_SIGNING_KEY', default=SECRET_KEY),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_OBTAIN_SERIALIZER': 'apps.users.serializers.CustomTokenObtainPairSerializer',
}

# OWASP A05 — CORS: never allow all origins when credentials are also allowed.
# In development (DEBUG=True) we relax CORS for convenience.
# In production: set CORS_ALLOWED_ORIGINS=https://yourdomain.com
CORS_ALLOW_CREDENTIALS = True
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    _frontend = env('FRONTEND_URL', default='')
    CORS_ALLOWED_ORIGINS = env.list(
        'CORS_ALLOWED_ORIGINS',
        default=[o for o in [_frontend] if o],
    )

CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379')
CELERY_RESULT_BACKEND = env('REDIS_URL', default='redis://localhost:6379')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Kolkata'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

OPENAI_API_KEY = env('OPENAI_API_KEY', default='')
AZURE_TTS_KEY = env('AZURE_TTS_KEY', default='')
AZURE_TTS_REGION = env('AZURE_TTS_REGION', default='centralindia')
AZURE_TTS_VOICE = env('AZURE_TTS_VOICE', default='ml-IN-SobhaNeural')

TWILIO_ACCOUNT_SID = env('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = env('TWILIO_AUTH_TOKEN', default='')
TWILIO_WHATSAPP_NUMBER = env('TWILIO_WHATSAPP_NUMBER', default='')
TWILIO_VOICE_NUMBER = env('TWILIO_VOICE_NUMBER', default='')

RAZORPAY_KEY_ID = env('RAZORPAY_KEY_ID', default='')
RAZORPAY_KEY_SECRET = env('RAZORPAY_KEY_SECRET', default='')
RAZORPAY_WEBHOOK_SECRET = env('RAZORPAY_WEBHOOK_SECRET', default='')
RAZORPAY_BASIC_PLAN_ID = env('RAZORPAY_BASIC_PLAN_ID', default='')
RAZORPAY_PRO_PLAN_ID = env('RAZORPAY_PRO_PLAN_ID', default='')
RAZORPAY_PREMIUM_PLAN_ID = env('RAZORPAY_PREMIUM_PLAN_ID', default='')

AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY', default='')
AWS_S3_BUCKET = env('AWS_S3_BUCKET', default='edulead-recordings')
AWS_S3_REGION = env('AWS_S3_REGION', default='ap-south-1')

FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')
BACKEND_URL = env('BACKEND_URL', default=env('FRONTEND_URL', default='http://localhost:3000'))

# OWASP A05 — No weak default password. Must be set via environment variable.
SUPERADMIN_PASSWORD = env('SUPERADMIN_PASSWORD', default='')

REDIS_URL = env('REDIS_URL', default='redis://localhost:6379')

# Number of trusted reverse proxies in front of Django.
# Set to 1 when behind Replit proxy / one load balancer.
# Used by RateLimitMiddleware to prevent X-Forwarded-For spoofing.
TRUSTED_PROXY_COUNT = env.int('TRUSTED_PROXY_COUNT', default=1)

SPECTACULAR_SETTINGS = {
    'TITLE': 'EduLeads Kerala API',
    'DESCRIPTION': 'Multi-tenant SaaS platform connecting Kerala students with colleges via AI Malayalam counsellor',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Silence drf-spectacular schema-generation warnings — these are OpenAPI doc hints
# only, they have no effect on runtime behaviour or security.
SILENCED_SYSTEM_CHECKS = [
    'drf_spectacular.W001',
    'drf_spectacular.W002',
]

_redis_channel_url = env('REDIS_URL', default='redis://localhost:6379')

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [_redis_channel_url],
        },
    },
}

RATE_LIMIT_WEBHOOK_PER_MINUTE = 1000
RATE_LIMIT_AUTH_PER_MINUTE = 10
RATE_LIMIT_PHONE_REVEAL_PER_HOUR = 50
RATE_LIMIT_MASKED_CALL_PER_HOUR = 20
RATE_LIMIT_API_PER_MINUTE = 300
RATE_LIMIT_AUTH_BLOCK_MINUTES = 30
RATE_LIMIT_AUTH_MAX_FAILURES = 5
