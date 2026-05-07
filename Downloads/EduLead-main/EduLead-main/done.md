# EduLeads Kerala — What Has Been Built & Implemented

## Project Overview

Multi-tenant SaaS platform connecting Kerala students with colleges via an AI WhatsApp and voice counsellor called **Mitra** (powered by GPT-4o, speaks Malayalam). Colleges subscribe to receive AI-qualified student leads with 0–100 scoring.

**Stack:** Django 4.2 ASGI (Daphne) + DRF · Celery + Redis · React 18 + Vite + Tailwind CSS 4 · pnpm monorepo

---

## Backend — Django API (`edulead_backend/`)

### Apps

| App | What it does |
|---|---|
| `users` | Custom user model, JWT auth (SimpleJWT), 2FA (TOTP), team management, tenant-scoped registration |
| `tenants` | Multi-tenant model — each college is a tenant; audit log; admin CRUD |
| `leads` | Lead model with 0–100 AI score, hot/warm/cold classification, CSV export, per-tenant quota enforcement |
| `students` | Student profiles with Fernet-encrypted phone numbers (AES-128-CBC) |
| `conversations` | WhatsApp and voice conversation thread storage, real-time WebSocket via Django Channels |
| `communications` | Masked calling via Twilio; call status and recording webhooks |
| `subscriptions` | Razorpay subscription plans (Basic / Pro / Premium), quota tracking, payment link creation |
| `analytics` | Dashboard metrics, lead funnel, quota history |
| `webhooks` | Twilio voice + WhatsApp inbound, Razorpay payment webhooks |

### Services

| Service | What it does |
|---|---|
| `services/ai/gpt_counsellor.py` | GPT-4o conversation engine for Mitra; Malayalam prompt engineering |
| `services/ai/malayalam_tts.py` | Google Neural2 (`ml-IN-Neural2-A`) primary TTS; Azure Neural fallback; SHA-256 cache keys |
| `services/ai/whisper_stt.py` | OpenAI Whisper speech-to-text for voice calls; SSRF-safe URL validation |
| `services/ai/lead_scorer.py` | 0–100 lead scoring on intent, budget, course preference, timeline |

### Infrastructure

- **ASGI server** — Daphne 4; WebSocket support via Django Channels + channels-redis
- **Task queue** — Celery 5 with Redis broker; django-celery-beat for scheduled tasks
- **Database** — PostgreSQL via psycopg2; Django ORM with full migrations across all apps
- **Static files** — Whitenoise serving from `staticfiles/`
- **API docs** — drf-spectacular OpenAPI schema auto-generation

---

## Frontend — React SPA (`artifacts/edulead-frontend/`)

### Public pages

| Route | Page |
|---|---|
| `/` | Landing — hero, Mitra demo animation, lead scoring preview, pricing, trust section |
| `/how-it-works` | Interactive 3-step walkthrough with live Mitra conversation simulation |
| `/about` | Company mission, Kerala market stats, team values |
| `/blog` | Founder article with structured layout |
| `/careers` | Open roles (Engineering, AI/ML, Analytics, Growth, Partnerships) |
| `/privacy-policy` | Full GDPR-aligned privacy policy |
| `/terms-of-use` | Full terms of use |

### Authenticated pages

| Route | Page |
|---|---|
| `/login` | JWT login with remember-me |
| `/register` | Tenant registration with plan selection |
| `/onboarding` | Post-registration setup flow |
| `/dashboard/overview` | Lead stats, quota usage, activity feed |
| `/dashboard/leads` | Lead list with filters, scoring badges |
| `/dashboard/leads/:id` | Lead detail — conversation history, contact reveal |
| `/dashboard/messages` | Real-time WhatsApp chat interface |
| `/dashboard/quota` | Quota usage and top-up |
| `/dashboard/team` | Invite and manage team members |
| `/dashboard/settings` | Tenant settings — AI tone, language, callback number |
| `/dashboard/billing` | Subscription management via Razorpay |

### Admin pages (superadmin only)

| Route | Page |
|---|---|
| `/admin/overview` | Platform-wide stats |
| `/admin/tenants` | All colleges — list, search, status |
| `/admin/tenants/:id` | Tenant detail with audit log |
| `/admin/leads` | All leads across all tenants |
| `/admin/analytics` | Revenue, funnel, conversion analytics |
| `/admin/users` | All user accounts |
| `/admin/payments` | All Razorpay transactions |

### Component library

- Full shadcn/ui component set (Radix UI primitives + Tailwind)
- `EduLeadsLogo` — SVG brand component
- `SiteFooter` — shared across all public pages
- `PlanGate` — feature-gates UI behind subscription tier
- `RealTimeChat` — WebSocket-backed live chat component
- `MaskedCallButton` — initiates masked Twilio call from dashboard
- Route guards: `PublicRoute`, `PrivateRoute`, `AdminRoute`
- Layouts: `DashboardLayout`, `AdminLayout`

---

## Security — OWASP Audit & Remediation

All scanner findings reviewed; 14 real vulnerabilities fixed across 9 files.

| OWASP Category | Vulnerability Fixed | File |
|---|---|---|
| A05 Misconfiguration | `ALLOWED_HOSTS = ['*']` hardcoded | `config/settings.py` |
| A05 Misconfiguration | `CORS_ALLOW_ALL_ORIGINS + credentials` combo | `config/settings.py` |
| A05 Misconfiguration | Missing HTTP security headers | new `middleware/security_headers.py` |
| A05 Misconfiguration | No DRF throttle configured | `config/settings.py` |
| A05 Misconfiguration | Hardcoded `SUPERADMIN_PASSWORD = 'admin123'` | `config/settings.py` |
| A05 Info Disclosure | Internal exceptions leaked via `str(e)` to API callers | `apps/leads/views.py` |
| A07 Auth Failures | `set_password()` called without `validate_password()` | `apps/users/models.py` + `serializers.py` |
| A02 Cryptographic | MD5 used for TTS audio cache keys | `services/ai/malayalam_tts.py` |
| A02 Cryptographic | JWT signing key shared with Django `SECRET_KEY` | `config/settings.py` |
| A03 Injection — TwiML | f-string XML construction for Twilio responses | `apps/webhooks/views.py` |
| A03 Injection — CSV | No sanitisation on CSV export cells | `apps/leads/views.py` |
| A10 SSRF | Whisper STT fetched any URL from Twilio POST data | `services/ai/whisper_stt.py` |
| Privacy / GDPR | Raw IP addresses written to logs | `middleware/rate_limit.py` |
| A05 X-Forwarded-For | Rate limiter trusted full XFF chain — spoofable | `middleware/rate_limit.py` |

### New security files created

- `middleware/security_headers.py` — CSP, `X-Frame-Options: DENY`, `Permissions-Policy`, `Referrer-Policy`, HSTS (production only)
- `config/exceptions.py` — Custom DRF exception handler; full detail logged server-side, generic message to client
- `defusedxml==0.7.1` added to `requirements.txt`

### Security environment variables (required in production)

```env
SECRET_KEY=<random 64 chars>
JWT_SIGNING_KEY=<different random 64 chars>
FERNET_KEY=<Fernet.generate_key()>
SUPERADMIN_PASSWORD=<strong, min 10 chars>
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
TRUSTED_PROXY_COUNT=1
DEBUG=False
```

---

## SEO Optimisation (`artifacts/edulead-frontend/`)

### Infrastructure

| File | What was added |
|---|---|
| `index.html` | `lang="en-IN"`, fixed viewport (removed `maximum-scale=1`), real title, meta description, keywords, theme-color `#FF3C00`, full Open Graph tags, Twitter Card tags, apple-touch-icon, font preload |
| `public/robots.txt` | Allows all public pages; blocks `/admin/`, `/dashboard/`, `/login`, `/register`, `/api/`; declares sitemap |
| `public/sitemap.xml` | All 7 public URLs with `lastmod`, `changefreq`, `priority` |

### Per-page dynamic meta

`src/components/SEOHead.tsx` — reusable Helmet component wrapping `react-helmet-async`. Each render updates `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (6 tags), and Twitter Card (4 tags) for the active route.

Added to all 7 public pages with unique, keyword-targeted titles and descriptions.

### Structured data (JSON-LD) on homepage

Three schemas on `/`:
- **Organization** — name, Kochi/Kerala address, logo, support email
- **WebSite** — canonical URL + publisher reference
- **SoftwareApplication** — with all three pricing offers (INR)

---

## Hosting & Deployment

`instructions.md` at the project root covers:

- All required environment variables (22 vars across Django, JWT, DB, Redis, Twilio, OpenAI, Razorpay, AWS S3, Azure TTS, Fernet)
- Google Cloud Neural2 TTS setup note
- Local development on Replit (workflow-based, no manual commands)
- One-click Replit Autoscale deployment with custom domain
- Self-hosted VPS path — systemd unit files for web + Celery worker + Celery beat, Nginx reverse proxy config, Let's Encrypt TLS
- Twilio and Razorpay webhook URL registration table
- Pre-launch security checklist (11 items)
- Upgrade runbook
- Troubleshooting table for the 8 most common failure modes

---

## Third-party Integrations

| Service | Purpose | Config key(s) |
|---|---|---|
| **OpenAI GPT-4o** | Mitra conversation engine | `OPENAI_API_KEY` |
| **Twilio** | WhatsApp messaging + voice calls + masked calling | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `TWILIO_VOICE_NUMBER` |
| **Google Neural2** | Malayalam TTS via Twilio `<Say>` — no key needed on server | n/a |
| **Azure Cognitive Services** | Optional TTS fallback | `AZURE_TTS_KEY`, `AZURE_TTS_REGION`, `AZURE_TTS_VOICE` |
| **Razorpay** | Subscription billing | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, 3× plan IDs |
| **AWS S3** | Call recordings + media | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_REGION` |
| **Redis** | Celery broker, Django Channels, rate limiting, TTS cache | `REDIS_URL` |
| **PostgreSQL** | Primary database | `DATABASE_URL` |
