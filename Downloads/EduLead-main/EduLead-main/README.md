# EduLeads Kerala — Complete Project Documentation

## Table of Contents

1. [What is EduLeads Kerala?](#1-what-is-edulead-kerala)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Project Structure](#3-project-structure)
4. [Backend — Django API](#4-backend--django-api)
   - [Database Models](#41-database-models)
   - [Authentication System](#42-authentication-system)
   - [Lead Lifecycle](#43-lead-lifecycle)
   - [AI Counsellor — Mitra](#44-ai-counsellor--mitra)
   - [WhatsApp & Voice Integration](#45-whatsapp--voice-integration)
   - [Subscription & Billing](#46-subscription--billing)
   - [Analytics](#47-analytics)
   - [WebSocket Real-Time Chat](#48-websocket-real-time-chat)
   - [Celery Background Tasks](#49-celery-background-tasks)
   - [Middleware & Security](#410-middleware--security)
   - [API Reference](#411-api-reference)
5. [Frontend — React App](#5-frontend--react-app)
   - [Routing & Guards](#51-routing--guards)
   - [Authentication Store](#52-authentication-store)
   - [HTTP Client](#53-http-client)
   - [Pages — Public](#54-pages--public)
   - [Pages — College Dashboard](#55-pages--college-dashboard)
   - [Pages — Super Admin Panel](#56-pages--super-admin-panel)
   - [UI Components](#57-ui-components)
   - [Animations](#58-animations)
   - [Plan Gating](#59-plan-gating)
6. [Subscription Plans & Feature Matrix](#6-subscription-plans--feature-matrix)
7. [External Services](#7-external-services)
8. [Environment Variables](#8-environment-variables)
9. [Running the Project](#9-running-the-project)
10. [Known Limitations & What Needs Real Infrastructure](#10-known-limitations--what-needs-real-infrastructure)
11. [Test Accounts](#11-test-accounts)

---

## 1. What is EduLeads Kerala?

EduLeads Kerala is a **multi-tenant SaaS platform** that connects Kerala students with colleges through an AI-powered WhatsApp and voice counsellor named **Mitra** (Malayalam for "friend").

### The full flow

1. A college runs Instagram or Facebook ads targeting Kerala students interested in admissions.
2. The ad directs students to WhatsApp Mitra or call the platform number.
3. **Mitra** — powered by GPT-4o — chats in natural Malayalam, gathering five key data points: name, course interest, location, budget, and timeline.
4. Every response is processed in real time to compute a **lead score (0–100)** and classify the student as Hot / Warm / Cold.
5. Qualified leads are **automatically distributed to subscribed colleges** based on their plan tier, course preferences, location preferences, budget match, and available monthly quota.
6. College administrators log in to a dashboard to view their leads, make masked calls to students, and track conversions.
7. A **Super Admin** manages all colleges, the lead inventory, billing, and platform-wide analytics from a separate panel.

---

## 2. High-Level Architecture

```
                      Student
                        │
               WhatsApp message / Phone call
                        │
                   Twilio Gateway
                        │
                        ▼
             ┌──────────────────────────┐
             │   Django ASGI Backend    │  ← Daphne server
             │   (edulead_backend/)     │
             │                          │
             │  ┌────────────────────┐  │
             │  │  GPT-4o (Mitra)    │  │  ← OpenAI API (streaming)
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  Whisper STT       │  │  ← OpenAI Whisper (voice→text)
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  Google Neural2    │  │  ← via Twilio <Say> (no extra key)
             │  │  TTS (Mitra voice) │  │
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  Lead Scoring      │  │  ← Deterministic 5-dimension algorithm
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  Lead Allocation   │  │  ← Round-robin + plan priority + budget
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  PostgreSQL        │  │  ← Primary database
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  Redis             │  │  ← Conversation cache + Celery + WS
             │  └────────────────────┘  │
             │  ┌────────────────────┐  │
             │  │  Celery + Beat     │  │  ← Background & scheduled tasks
             │  └────────────────────┘  │
             └──────────────────────────┘
                        │
               REST API (HTTP) + WebSocket
                        │
                        ▼
             ┌──────────────────────────┐
             │   React Frontend         │  ← Vite + Tailwind CSS 4
             │   (artifacts/            │
             │   edulead-frontend/)     │
             │                          │
             │  Landing Page            │
             │  College Dashboard       │
             │  Super Admin Panel       │
             └──────────────────────────┘
```

All traffic goes through a single shared proxy. The frontend is served at `/` and the backend API is served at `/api/`.

---

## 3. Project Structure

```
workspace/
├── edulead_backend/               # Django backend (Python)
│   ├── apps/
│   │   ├── tenants/               # Tenant (college/agency) management
│   │   ├── users/                 # Authentication and user accounts
│   │   ├── students/              # Student records (phone encrypted at rest)
│   │   ├── leads/                 # Lead model, scoring views, allocation
│   │   ├── conversations/         # WhatsApp conversation threads + WebSocket
│   │   ├── communications/        # Call records
│   │   ├── subscriptions/         # Plans, billing, quota tracking
│   │   ├── webhooks/              # Twilio + Razorpay webhook handlers
│   │   └── analytics/             # Dashboard + admin analytics views
│   ├── config/
│   │   ├── settings.py            # All configuration (env-driven)
│   │   ├── celery.py              # Celery app + beat schedule
│   │   ├── urls.py                # Root URL routing
│   │   └── routing.py             # ASGI + WebSocket routing
│   ├── middleware/
│   │   ├── rate_limit.py          # Redis sliding-window rate limiter
│   │   └── webhook_signature.py   # Twilio HMAC signature validation
│   ├── services/
│   │   ├── ai/
│   │   │   ├── gpt_counsellor.py  # GPT-4o conversation FSM + data extraction
│   │   │   ├── intent_extractor.py
│   │   │   ├── whisper_stt.py     # Audio → text (voice messages)
│   │   │   └── malayalam_tts.py   # Text → Malayalam audio (Google Neural2)
│   │   ├── communications/
│   │   │   ├── whatsapp.py        # WhatsApp message handling
│   │   │   └── masked_calling.py  # Masked call bridge (Twilio)
│   │   ├── leads/
│   │   │   ├── scoring.py         # Lead score computation (5 dimensions)
│   │   │   └── allocation.py      # Lead distribution to colleges
│   │   └── billing/
│   │       └── razorpay_service.py # Subscription & payment links
│   ├── tasks/
│   │   ├── ai_tasks.py            # Celery tasks: WhatsApp + voice processing
│   │   └── lead_tasks.py          # Celery tasks: scoring, allocation, cold rescore
│   └── scripts/
│       └── start_django.sh        # Startup: migrate → collectstatic → daphne
│
├── artifacts/
│   └── edulead-frontend/          # React + Vite frontend (TypeScript)
│       └── src/
│           ├── App.tsx            # Router definition
│           ├── main.tsx           # React entry point
│           ├── store/
│           │   └── authStore.ts   # Zustand auth state (persisted to localStorage)
│           ├── lib/
│           │   ├── axios.ts       # Axios instance + JWT auto-refresh interceptor
│           │   └── scoring.ts     # Frontend lead score/category display utils
│           ├── utils/
│           │   └── animations.ts  # Anime.js v4 animation helpers
│           ├── components/
│           │   ├── guards/        # PrivateRoute, PublicRoute, AdminRoute
│           │   ├── layouts/       # DashboardLayout, AdminLayout
│           │   ├── ui/            # Shadcn/ui + custom animated components
│           │   ├── PlanGate.tsx   # Lock any UI block behind a required plan
│           │   ├── MaskedCallButton.tsx
│           │   └── RealTimeChat.tsx
│           └── pages/
│               ├── Landing.tsx    # Public marketing homepage
│               ├── Login.tsx      # Login form
│               ├── Register.tsx   # College registration
│               ├── Onboarding.tsx # Post-registration setup wizard
│               ├── dashboard/     # College user pages
│               └── admin/         # Superadmin pages
│
├── scripts/                       # Shared utility scripts (@workspace/scripts)
├── pnpm-workspace.yaml            # Workspace package definitions
└── README.md                      # This file
```

---

## 4. Backend — Django API

The backend is a **Django 4** application running as an **ASGI server** via Daphne. It handles both HTTP REST (standard API calls) and WebSocket (real-time chat). All API endpoints are under `/api/`.

---

### 4.1 Database Models

#### `Tenant` — `apps/tenants/models.py`

Represents a college or agency that subscribes to the platform.

| Field | Description |
|---|---|
| `id` | UUID primary key |
| `name` | College or agency name |
| `slug` | URL-safe unique identifier |
| `tenant_type` | `college` or `agency` |
| `plan` | `basic`, `pro`, or `premium` |
| `status` | `active`, `suspended`, or `cancelled` |
| `monthly_quota` | Leads allocated per month by plan |
| `used_quota` | Leads used in the current billing month |
| `rollover_quota` | Unused leads carried over from last month |
| `course_interests` | JSON list of courses the tenant wants leads for |
| `location_preferences` | JSON list of Kerala districts they prefer |
| `budget_preferences` | JSON object describing their student budget range (used in allocation filtering) |
| `priority` | Integer; higher priority tenants get leads first within the same tier |

Computed properties:
- `remaining_quota` = `monthly_quota + rollover_quota − used_quota`
- `is_quota_exhausted` = True when `remaining_quota ≤ 0`

---

#### `User` — `apps/users/models.py`

Custom Django user model. Identified by email (not username). Every user except `superadmin` belongs to exactly one `Tenant`.

| Role | Who it is |
|---|---|
| `superadmin` | Platform owner — full access across all tenants |
| `college_admin` | Admin of a specific college (can invite team members) |
| `college_user` | Staff member at a college (view/contact leads) |
| `agency_admin` | Admin of an agency tenant |
| `agency_user` | Staff at an agency |

---

#### `Student` — `apps/students/models.py`

A student who messaged Mitra on WhatsApp or called the voice line.

- Phone numbers are **Fernet-encrypted at rest** (AES-128-CBC internally). `get_phone()` decrypts, `set_phone()` encrypts.
- `consent_given` must be `True` before Mitra processes any message data.
- `is_deleted` / `deleted_at` support soft-delete for GDPR-style data privacy requests.

---

#### `Lead` — `apps/leads/models.py`

The core data record — one lead = one qualified student conversation.

| Field | Description |
|---|---|
| `student` | FK → Student |
| `conversation` | OneToOne FK → the originating Conversation |
| `full_name` | Extracted by Mitra |
| `course_interest` | Desired course (B.Tech, MBA, BAMS, etc.) |
| `location` | District in Kerala |
| `budget_range` | `below_1L`, `1L_to_3L`, `3L_to_5L`, or `above_5L` |
| `timeline` | `this_year`, `next_year`, or `exploring` |
| `intent_level` | `enroll`, `explore`, or `curious` |
| `score` | 0–100 integer |
| `category` | `hot` (≥70), `warm` (40–69), `cold` (<40) |
| `dimension_scores` | JSON: individual scores for intent, course clarity, budget, timeline, completeness |
| `status` | `new → allocated → contacted → interested → converted / not_interested / expired` |
| `exclusivity_cap` | Max colleges this lead can be shared with (default: 5) |
| `last_activity` | Updated whenever new conversation activity occurs; used by the score decay function |

---

#### `LeadAllocation` — `apps/leads/models.py`

Maps a Lead to a Tenant. One lead can be allocated to multiple tenants (up to `exclusivity_cap`).

- Tracks: `viewed`, `phone_revealed`, `phone_reveal_count`, `conversion_outcome`.
- `phone_reveal_count` is incremented every time a Premium user reveals the phone number — appears in the audit log.

---

#### `Conversation` & `Message` — `apps/conversations/models.py`

The WhatsApp/voice conversation thread.

- `Conversation` state machine: `GREETING → PROFILE_COLLECT → INTENT_QUALIFY → RECOMMEND → SCORING → CLOSING → ENDED`
- `HANDOFF` is a special interrupt state triggered by frustration detection or manual handoff.
- `Message` stores individual messages with `role`: `student`, `ai`, or `human_agent`.
- Conversation transcripts can be archived to S3.

---

#### `Subscription` & `QuotaHistory` — `apps/subscriptions/models.py`

- `Subscription` tracks the Razorpay subscription ID, status, and billing period for each tenant.
- `QuotaHistory` records monthly lead usage and conversion rates per tenant (used on the Quota analytics page).

---

#### `CallRecord` — `apps/communications/models.py`

Logs every masked call made through the platform: call SID, virtual number used, status, duration, retry count, and the S3 key for the recording.

---

#### `AuditLog` — `apps/tenants/models.py`

Security and compliance log. Captures important actions: phone reveals, CSV exports, plan changes, login attempts. Stored per-tenant with IP address and a SHA-256 hash of the action payload.

---

### 4.2 Authentication System

**Files:** `apps/users/views.py`, `apps/users/serializers.py`

Uses **JWT authentication** via `djangorestframework-simplejwt`.

#### Token flow

1. `POST /api/auth/login/` — returns `access` token (60-minute lifetime) + `refresh` token (30-day lifetime).
2. The access token is a signed JWT with embedded claims: `email`, `role`, `full_name`, `tenant_id`, `tenant_name`, `plan`.
3. When the access token expires, the frontend automatically calls `POST /api/auth/refresh/`.
4. `POST /api/auth/logout/` blacklists the refresh token server-side so it cannot be reused.

#### Registration

`POST /api/auth/register/` creates a `Tenant` and its first `User` (as `college_admin`) inside a single database transaction. If user creation fails, the tenant is rolled back — no orphaned records.

#### Two-Factor Authentication (TOTP)

| Endpoint | Method | What it does |
|---|---|---|
| `/api/auth/2fa/setup/` | GET | Generates a TOTP secret, returns QR code as base64 PNG |
| `/api/auth/2fa/setup/` | POST | Confirms setup with a valid 6-digit code |
| `/api/auth/2fa/setup/` | DELETE | Disables 2FA (requires a valid code to confirm) |
| `/api/auth/2fa/verify/` | POST | Second step of login when 2FA is active; returns JWT pair |

---

### 4.3 Lead Lifecycle

#### Step 1 — Scoring (`services/leads/scoring.py`)

`LeadScoringService.compute_score()` produces a 0–100 score from five weighted dimensions:

| Dimension | Max Points | How it is measured |
|---|---|---|
| Intent | 30 | `enroll` = 30, `explore` = 15, `curious` = 5 |
| Course Clarity | 20 | Specific course = 20, vague = 10, empty = 0 |
| Budget | 20 | Confirmed amount = 20, range = 10, unknown = 0 |
| Timeline | 15 | This year = 15, next year = 8, exploring = 2 |
| Completeness | 15 | All 5 fields filled = 15, partial = 8, minimal = 2 |

Category thresholds: **Hot** ≥ 70 · **Warm** 40–69 · **Cold** < 40

A daily decay task (`decay-lead-scores-daily`) reduces each lead's score by 2 points per day of inactivity, reflecting reduced admission probability as time passes.

**Cold lead hold rule:** Leads scoring below 40 are not allocated immediately. They are held for 7 days. A daily beat task (`rescore-cold-leads-daily`, runs at 02:30 IST) re-scores them. If they have moved to Warm or Hot after 7 days, allocation runs automatically.

---

#### Step 2 — Allocation (`services/leads/allocation.py`)

`LeadAllocationService.allocate()` distributes each scored lead to eligible tenants:

1. **Filter** tenants by: active status, remaining quota > 0, matching `course_interests`, matching `location_preferences`, and compatible `budget_preferences`.
2. **Sort** by priority: colleges before agencies, then `premium → pro → basic`, then by explicit `priority` field.
3. **Round-robin shuffle** within the same tier to distribute load evenly.
4. **Create** `LeadAllocation` records — up to `exclusivity_cap` per lead (default 5; Premium tenants get 1 = exclusive).
5. **Increment** `used_quota` on each selected tenant and update the Redis cache.
6. **Trigger** quota warning Celery tasks at 80% and 100% usage.

Rollover logic: on the 1st of each month, unused quota up to 50% of monthly quota carries forward.

---

#### Plan-based data access

The data visible to a college user depends on their subscription plan:

| Serializer | Plan | What they see |
|---|---|---|
| `LeadListBasicSerializer` | Basic | Name, course, score, status |
| `LeadListSerializer` | Pro / Premium | + location, budget, timeline |
| `LeadDetailBasicSerializer` | Basic | Above + dimension scores + notes |
| `LeadDetailSerializer` | Pro | Full profile, no phone number |
| `LeadDetailPremiumSerializer` | Premium | Everything including decrypted phone |

Phone reveal is a separate gated action (`GET /api/leads/{id}/reveal-phone/`) that requires the `PhoneRevealPermission` class (Premium only) and is rate-limited to 50 reveals/hour per tenant.

---

### 4.4 AI Counsellor — Mitra

**File:** `services/ai/gpt_counsellor.py`

Mitra is a GPT-4o powered conversational agent that operates over WhatsApp and phone voice calls.

#### Personality & language rules

- Speaks natural Malayalam in the Malayalam script — never romanised "Manglish".
- Warm, patient, and non-pressurising tone.
- Asks one question at a time.
- Maximum 80 words per response.
- Never promises specific college admission or placement.

#### Conversation state machine

```
GREETING
   │
   ▼
PROFILE_COLLECT  ←─────────────────────────┐
   │                                        │
   ▼                                        │
INTENT_QUALIFY                              │
   │                                        │
   ├─── has_sufficient_data() == True ──▶  RECOMMEND
   │                                        │
   ▼                                        │
SCORING ◀───────────────────────────────────┘
   │
   ▼
CLOSING
   │
   ▼
ENDED

Any state ──▶ HANDOFF  (frustration detected or manual)
                │
                └──▶ re-engage on "OK / ശരി / Hi / continue"
                     resumes at INTENT_QUALIFY
```

- `RECOMMEND` state activates when `has_sufficient_data()` is True (≥ 3 of 5 profile fields collected). Mitra presents personalised college suggestions before moving to scoring.
- `HANDOFF` is a special interrupt state. When re-engaged (student sends any affirmative message), the conversation resumes at `INTENT_QUALIFY` and Mitra continues normally.

#### What Mitra collects

| Field | Description |
|---|---|
| `full_name` | Student's name |
| `course_interest` | Desired course (B.Tech, MBA, BAMS, MBBS, Nursing, etc.) |
| `location` | District in Kerala |
| `budget_range` | `below_1L`, `1L_to_3L`, `3L_to_5L`, or `above_5L` |
| `timeline` | `this_year`, `next_year`, or `exploring` |

#### Data extraction

After each student message, GPT-4o is called a second time with a structured extraction prompt. It returns a JSON object with all 5 profile fields plus `intent_level`. This populates the Lead record directly.

#### Completion detection

A conversation is marked complete when:
- The AI's response contains the literal token `CONVERSATION_COMPLETE`, OR
- All 5 required profile fields have been extracted.

On completion, `score_and_allocate_lead` is queued as a Celery task.

#### Frustration detection

Mitra monitors for frustration signals: keywords like "stop", "useless", "waste", "മടുത്തു" (I'm fed up), or 3+ consecutive responses shorter than 5 characters. On detection, Mitra sends a wait message and triggers a human handoff task that notifies college admins.

#### GPT model & streaming

- Model: `gpt-4o`
- Streaming: enabled (`stream=True`) — chunks are yielded and aggregated server-side before sending the response via Twilio. This reduces total latency versus waiting for the full response.

---

### 4.5 WhatsApp & Voice Integration

**Files:** `services/communications/whatsapp.py`, `apps/webhooks/views.py`

#### WhatsApp flow

1. Student sends a WhatsApp message to the Twilio number.
2. Twilio POSTs to `/api/webhooks/twilio/whatsapp/`.
3. The webhook view validates the Twilio HMAC signature and queues `process_whatsapp_message` as a Celery task.
4. The task calls `WhatsAppHandler.handle_incoming()` which:
   - Deduplicates messages using Redis + MessageSid (5-minute window).
   - If the message is a voice note, transcribes it with OpenAI Whisper first.
   - Creates the Student record if it is the first contact.
   - If the student has not given consent yet, sends the consent message and waits for YES.
   - Once consent is given, loads conversation history from Redis, calls GPT-4o (streaming), saves the AI reply, and sends it back via Twilio.

#### Consent flow

Before Mitra processes any personal data, the student must reply **YES** to a one-time consent message. This is stored on `Student.consent_given` with a timestamp, channel, and IP address.

#### Voice call flow (Mitra on phone)

1. Student calls the Twilio voice number.
2. Twilio POSTs to `/api/webhooks/twilio/voice-inbound/`.
3. Mitra greets the student using a `<Say>` TwiML tag with **Google Neural2** voice (`Google.ml-IN-Neural2-A`).
4. A `<Record>` tag captures the student's speech (max 20 seconds).
5. The recording URL is sent to `/api/webhooks/twilio/voice-answer/`.
6. The backend transcribes the recording with Whisper, processes it through GPT-4o, and polls Redis for the AI response (up to 12 seconds).
7. The response is spoken back using another `<Say>` + `<Record>` loop until the conversation completes or the student hangs up.

#### Malayalam TTS — Mitra's voice

**Primary:** `Google.ml-IN-Neural2-A` (female, native-speaker trained) — delivered directly through Twilio's `<Say>` tag with **no extra API key or setup required**. This is the voice students hear on every call turn.

**Why not Azure?** Google Neural2 and Azure Neural (`ml-IN-SobhaNeural`) are both excellent for Malayalam. However, Azure requires a separate Azure account, an API key, a REST call to synthesise the audio, an S3 upload, and then a `<Play>` tag — adding latency and complexity with no perceptible quality gain in a casual counselling conversation. Google Neural2 wins on every practical dimension.

**Optional Azure:** `MalayalamTTSService.synthesize_via_azure()` is available when `AZURE_TTS_KEY` is configured. It uses `ml-IN-SobhaNeural` (female) and is intended only for pre-rendering static audio clips to S3 for IVR menus or cached prompts.

#### Masked calling flow

Pro and Premium colleges can call students through the platform without their real phone number being revealed.

1. College user clicks "Call" → `POST /api/leads/{id}/call/`
2. `MaskedCallingService.create_call_bridge()` creates a bridge entry in Redis and dials the college user's phone from the virtual Twilio number.
3. When the college answers, Twilio calls `/api/webhooks/twilio/voice-bridge/`.
4. The bridge webhook reads the Redis entry and dials the student via `<Dial>`.
5. Neither party ever sees the other's real number.
6. Call recordings are saved to AWS S3 via a `/api/webhooks/twilio/recording/` callback.
7. If the call fails, `retry_masked_call` retries up to 3 times with delays of 5 min, 15 min, and 60 min.

Voice webhooks summary:

| Webhook URL | Purpose |
|---|---|
| `/api/webhooks/twilio/voice-inbound/` | Student calls inbound — greeting + first record |
| `/api/webhooks/twilio/voice-answer/` | Receives recording, returns AI response as TwiML |
| `/api/webhooks/twilio/voice-bridge/` | Bridges college user to student for masked calls |
| `/api/webhooks/twilio/call-status/` | Tracks call status changes (ringing, answered, completed) |
| `/api/webhooks/twilio/recording/` | Saves completed recording to S3 |

---

### 4.6 Subscription & Billing

**Files:** `services/billing/razorpay_service.py`, `apps/subscriptions/`

#### Plans

| Plan | Price | Leads/month | Key features |
|---|---|---|---|
| Basic | ₹2,999/mo | 10 | AI counsellor, basic lead data, basic analytics |
| Pro | ₹6,999/mo | 30 | + Masked calling, full lead profile, advanced analytics |
| Premium | ₹14,999/mo | 100 | + Phone reveal, CSV export, exclusive leads, quota rollover |

#### Razorpay integration

`RazorpayService` handles:
- Creating a recurring monthly subscription (12-cycle contract) via Razorpay Subscriptions API.
- Creating one-time payment links for manual upgrades.
- Verifying webhook HMAC signatures before processing any event.

Note: The architecture diagrams refer to `stripe_sub_id` — in the actual code this field is `razorpay_subscription_id`. Razorpay is the payment processor throughout.

#### Razorpay webhook events (`/api/webhooks/razorpay/`)

| Event | Action |
|---|---|
| `subscription.activated` | Upgrades tenant plan, sets monthly quota |
| `subscription.charged` | Records payment, resets monthly quota counter |
| `payment.failed` | Marks subscription as `past_due` |
| `subscription.cancelled` | Downgrades tenant to Basic |

---

### 4.7 Analytics

**File:** `apps/analytics/views.py`

#### College dashboard (`GET /api/dashboard/overview/`)

Returns for the authenticated tenant:
- `quota_used`, `quota_total`, `rollover_balance`
- Counts of hot / warm / cold leads
- 5 most recent leads

#### Quota history (`GET /api/dashboard/quota/`)

Returns 12-month quota usage history with conversion rates per month.

#### Lead funnel (`GET /api/analytics/leads/`)

Returns leads broken down by status, course interest, location, and average score.

#### Super admin analytics (`GET /api/admin/analytics/`)

Platform-wide view:
- Total active tenants, total leads, leads created this month
- Plan distribution breakdown (basic / pro / premium counts)
- Recent college signups
- Lead category counts (hot / warm / cold)
- Leads created per month (time-series for charts)
- Estimated monthly recurring revenue over time

---

### 4.8 WebSocket Real-Time Chat

**Files:** `apps/conversations/consumers.py`, `config/routing.py`

**URL pattern:** `ws/leads/{lead_id}/`

A college user can open a WebSocket connection to a specific lead for real-time in-app messaging. A human agent can send messages directly to the student through WhatsApp from the dashboard without leaving the browser.

Authentication uses a JWT access token passed as a `?token=` query parameter on the WebSocket URL.

The consumer joins two channel groups:
- `lead_{lead_id}` — messages specific to this lead
- `tenant_{tenant_id}` — broadcast notifications to all users at the same college

Requires Django Channels with a Redis channel layer (configured via `REDIS_URL`).

---

### 4.9 Celery Background Tasks

**Files:** `tasks/ai_tasks.py`, `tasks/lead_tasks.py`, `config/celery.py`

All Celery task retries use **exponential backoff**: `countdown = base_seconds × 2^retry_count`.

#### Queued tasks (triggered by events)

| Task | Triggered by | What it does |
|---|---|---|
| `process_whatsapp_message` | Twilio WhatsApp webhook | Transcribes voice if needed, calls Mitra, replies via WhatsApp |
| `process_voice_turn` | Twilio voice-answer webhook | Transcribes recording, calls Mitra, stores reply in Redis |
| `score_and_allocate_lead` | Conversation complete | Scores lead, allocates to eligible colleges |
| `create_score_and_allocate_lead` | Superadmin manual lead creation | Same as above for manually created leads |
| `trigger_human_handoff` | Frustration detection | Notifies college admins, sends student a wait message |
| `send_quota_warning` | 80% or 100% quota usage | Emails the college admin |
| `retry_masked_call` | Failed/busy/no-answer call | Retries the call after a delay |

#### Scheduled tasks (Celery beat, Asia/Kolkata timezone)

| Task | Schedule | What it does |
|---|---|---|
| `decay-lead-scores-daily` | Daily at 02:00 | Reduces all lead scores by 2 points per day of inactivity |
| `rescore-cold-leads-daily` | Daily at 02:30 | Re-scores cold leads older than 7 days; allocates those that moved to warm/hot |
| `expire-old-leads-daily` | Daily at 03:00 | Marks leads as `expired` if they have been untouched for 90 days |
| `rollover-monthly-quotas` | 1st of month at 00:05 | Carries forward up to 50% of unused quota |
| `data-retention-cleanup` | 1st of month at 01:00 | Hard-deletes soft-deleted student records older than 180 days |
| `check-subscription-statuses-daily` | Daily at 06:00 | Syncs subscription status from Razorpay |
| `sync-razorpay-customers-weekly` | Sundays at 04:00 | Reconciles customer records with Razorpay |

---

### 4.10 Middleware & Security

#### Rate limiting (`middleware/rate_limit.py`)

Redis-based sliding window rate limiter applied to every incoming request.

| Endpoint | Limit |
|---|---|
| `/api/webhooks/*` | 1,000 requests/minute per IP or phone number |
| `/api/auth/login/` | 10 requests/minute per IP |
| After 5 consecutive login failures | IP blocked for 30 minutes |
| `/reveal-phone` actions | 50 per hour per tenant |
| Masked calls | 20 per hour per tenant |
| All other `/api/*` | 300 requests/minute per JWT token prefix |

When Redis is unavailable, rate limiting fails open (silently skipped) and a warning is logged — requests are never blocked due to a missing Redis connection.

#### Webhook signature validation (`middleware/webhook_signature.py`)

All requests to `/api/webhooks/twilio/*` are validated using Twilio's `RequestValidator` (HMAC-SHA1). If no Twilio signature is present — e.g. in local development — validation is skipped with a debug log entry.

#### Permission classes (`apps/leads/permissions.py`)

| Permission Class | Who it allows |
|---|---|
| `IsSuperAdmin` | Only `role == 'superadmin'` |
| `IsTenantAdmin` | `college_admin` or `agency_admin` |
| `PlanPermission.require('pro')` | Tenants on Pro or Premium plan |
| `PhoneRevealPermission` | Premium tenants only |
| `ExportPermission` | Premium tenants only |
| `MaskedCallPermission` | Pro and Premium tenants |
| `SameTenantPermission` | Object-level: user and the object must belong to the same tenant |

#### Phone number encryption

Student phone numbers are encrypted at rest using the **Fernet** symmetric encryption scheme (AES-128-CBC + HMAC-SHA256). The encryption key is derived from `SECRET_KEY`. Numbers are only decrypted in memory on explicit `get_phone()` calls (which require Premium permission for the API caller).

---

### 4.11 API Reference

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | None | Register a new college + admin user |
| POST | `/api/auth/login/` | None | Obtain JWT access + refresh token pair |
| POST | `/api/auth/refresh/` | None | Refresh an access token |
| POST | `/api/auth/logout/` | JWT | Blacklist the refresh token |
| GET | `/api/auth/me/` | JWT | Get current user profile |
| GET / POST | `/api/auth/2fa/setup/` | JWT | Enable TOTP two-factor authentication |
| DELETE | `/api/auth/2fa/setup/` | JWT | Disable TOTP |
| POST | `/api/auth/2fa/verify/` | None | Verify TOTP code (second login step) |
| GET | `/api/leads/` | JWT | List leads for the authenticated tenant |
| GET | `/api/leads/{id}/` | JWT | Lead detail (plan-gated fields) |
| PATCH | `/api/leads/{id}/status/` | JWT | Update lead status |
| POST | `/api/leads/{id}/note/` | JWT | Append a note to a lead |
| GET | `/api/leads/{id}/reveal-phone/` | JWT + Premium | Reveal and log decrypted phone number |
| POST | `/api/leads/{id}/call/` | JWT + Pro | Initiate masked call to student |
| GET | `/api/leads/export/` | JWT + Premium | Download all leads as CSV |
| GET | `/api/dashboard/overview/` | JWT | Dashboard summary stats |
| GET | `/api/dashboard/quota/` | JWT | Quota usage + 12-month history |
| GET | `/api/team/` | JWT | List team members at the tenant |
| POST | `/api/team/` | JWT + Admin | Invite a new team member by email |
| GET / PATCH | `/api/settings/` | JWT | Read or update tenant profile settings |
| GET | `/api/subscriptions/plans/` | JWT | List available subscription plans |
| GET | `/api/subscriptions/current/` | JWT | Current subscription details |
| POST | `/api/subscriptions/create-subscription/` | JWT | Create a Razorpay subscription |
| GET | `/api/analytics/leads/` | JWT | Lead funnel and breakdown analytics |
| GET | `/api/admin/analytics/` | Superadmin | Platform-wide analytics |
| GET / POST | `/api/admin/tenants/` | Superadmin | List all tenants / create manually |
| GET / PATCH | `/api/admin/tenants/{id}/` | Superadmin | View or edit a specific tenant |
| GET | `/api/admin/leads/` | Superadmin | All leads on the platform |
| POST | `/api/admin/leads/` | Superadmin | Manually create a lead |
| GET | `/api/admin/users/` | Superadmin | All users on the platform |
| GET | `/api/admin/payments/` | Superadmin | All payment and subscription records |
| GET | `/api/admin/audit-logs/` | Superadmin | Full audit trail |
| POST | `/api/webhooks/twilio/whatsapp/` | None (sig validated) | Twilio WhatsApp message webhook |
| POST | `/api/webhooks/twilio/voice-inbound/` | None | Student calls in |
| POST | `/api/webhooks/twilio/voice-answer/` | None | Recording received, AI responds |
| POST | `/api/webhooks/twilio/voice-bridge/` | None | Bridge college → student |
| POST | `/api/webhooks/twilio/call-status/` | None | Call status update |
| POST | `/api/webhooks/twilio/recording/` | None | Recording ready, save to S3 |
| POST | `/api/webhooks/razorpay/` | None (sig validated) | Razorpay billing webhook |
| GET | `/api/docs/` | None | Swagger UI (auto-generated) |

---

## 5. Frontend — React App

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS 4 + Shadcn/ui

**Location:** `artifacts/edulead-frontend/src/`

---

### 5.1 Routing & Guards

**File:** `App.tsx`

All routes are defined in a single `BrowserRouter`. Three route guard types:

#### `PublicRoute`
Wraps pages that should only be visible to logged-out users (landing page, login, register). Authenticated users are automatically redirected to their dashboard.

#### `PrivateRoute`
Wraps pages that require login. Unauthenticated users are redirected to `/login`, with the original URL saved so the user is returned there after logging in.

#### `AdminRoute`
Extends PrivateRoute — also requires `role === 'superadmin'`. Non-superadmin users are redirected to `/dashboard/overview`.

#### Route map

| Path | Guard | Page |
|---|---|---|
| `/` | Public | Landing |
| `/how-it-works` | None | How It Works |
| `/about` | None | About Us |
| `/blog` | None | Blog |
| `/login` | Public | Login |
| `/register` | Public | College Registration |
| `/onboarding` | Private | Post-registration setup |
| `/dashboard/*` | Private | College Dashboard |
| `/admin/*` | Admin | Super Admin Panel |
| `*` | None | 404 Not Found |

---

### 5.2 Authentication Store

**File:** `store/authStore.ts`

Uses **Zustand** with the `persist` middleware, saving state to `localStorage` under `edulead-auth`. Users remain logged in across page refreshes and browser restarts.

The store holds:

| Field | Description |
|---|---|
| `accessToken` | JWT access token — sent with every API request |
| `refreshToken` | Used to silently renew the access token |
| `userId` | Decoded from JWT |
| `tenantId`, `tenantName` | Decoded from JWT |
| `plan` | `basic`, `pro`, or `premium` |
| `role` | User's role string |
| `isAuthenticated` | Boolean — used by route guards |

Key actions:
- `setAuth(data)` — called after successful login/register
- `setAccessToken(token)` — called after token refresh
- `clearAuth()` — called on logout; resets everything to null

---

### 5.3 HTTP Client

**File:** `lib/axios.ts`

A configured Axios instance with two interceptors:

**Request interceptor** — automatically attaches the JWT access token as `Authorization: Bearer <token>` to every outgoing request.

**Response interceptor (silent token refresh)** — when any request returns HTTP 401:
1. If not already refreshing, calls `/api/auth/refresh/` with the stored refresh token.
2. Any other requests that fail with 401 while a refresh is in progress are queued in memory.
3. Once the new token arrives, all queued requests are retried automatically with the new token.
4. If the refresh itself fails (expired or blacklisted token), `clearAuth()` is called and the user is redirected to `/login`.

Users are never disrupted by token expiry unless their refresh token has also expired.

---

### 5.4 Pages — Public

#### `Landing.tsx`
The marketing homepage. Sections: navbar, hero, how-it-works steps, stats bar, pricing cards, trust badges, contact section, footer.

#### `Login.tsx`
Split-panel layout: left panel is a dark branded area with an animated feature list, right panel has the login form. On submit, calls `POST /api/auth/login/`, decodes the JWT, stores auth state, and navigates to the appropriate dashboard. Invalid credentials trigger a shake animation on the form.

#### `Register.tsx`
Standalone registration form on a gradient background. Creates a new college account and navigates to `/onboarding` on success.

#### `HowItWorks.tsx`
Detailed explanation of the platform with an animated Mitra conversation simulation and an interactive lead scoring visualiser.

#### `not-found.tsx`
404 page with a "← Back to Home" link.

---

### 5.5 Pages — College Dashboard

All protected by `PrivateRoute`. Served under `/dashboard/`.

#### `DashboardOverview.tsx`
Quota usage ring, hot/warm/cold lead counts (numbers animate up from zero on load using `countUp()`), and a table of the 5 most recent leads.

#### `DashboardLeads.tsx`
Full lead list with filtering by category, status, location, and keyword search. Lead rows stagger in on load. Clicking a row opens the lead detail page.

#### `LeadDetail.tsx`
Full lead profile page showing all available data (plan-gated), the score ring animation, notes section, conversation history, and the masked call button. The page fades in using `pageEnter()`.

#### `Messages.tsx`
In-app messaging page. Lists conversations with students. A human agent can send follow-up WhatsApp messages from here.

#### `Quota.tsx`
Current month's quota usage with a progress bar and a 12-month usage history table.

#### `Team.tsx`
Lists all users at the tenant. Admins can invite new team members by email.

#### `Settings.tsx`
Form for updating the tenant profile: college name, contact email, WhatsApp number, address, website.

#### `Billing.tsx`
Shows the current plan, usage summary, and upgrade options. Initiates Razorpay subscription flows.

---

### 5.6 Pages — Super Admin Panel

All protected by `AdminRoute`. Served under `/admin/`.

#### `Overview.tsx`
Platform-wide stats: total tenants, total leads, plan breakdown, revenue estimates, recent signups.

#### `Tenants.tsx`
Full list of all colleges and agencies with their plan, status, and quota. Clicking a row opens TenantDetail.

#### `TenantDetail.tsx`
Detailed tenant view. The superadmin can change the tenant's plan, suspend or reactivate them, and inspect their lead allocations.

#### `AdminLeads.tsx`
All leads on the platform. Superadmin bypasses all plan-based field restrictions.

#### `LeadsNew.tsx`
Form to manually create a lead. Runs the scoring algorithm and triggers allocation immediately on save.

#### `Analytics.tsx`
Charts: leads over time, revenue over time, category breakdown, top conversion colleges.

#### `Users.tsx`
All user accounts across every tenant on the platform.

#### `Payments.tsx`
Subscription and payment records from Razorpay.

---

### 5.7 UI Components

**Location:** `components/ui/`

Standard components from **Shadcn/ui** (button, card, table, badge, dialog, etc.) plus custom animated components:

| Component | What it does |
|---|---|
| `ButtonAnimated.tsx` | Button with a scale press animation |
| `CardAnimated.tsx` | Card that fades in and slides up on mount |
| `InputAnimated.tsx` | Input field with a focus glow animation |
| `ModalAnimated.tsx` | Modal with scale-in entrance animation |
| `TableAnimated.tsx` | Table where rows stagger-fade in on load |
| `BadgeAnimated.tsx` | Badge that pops in with a scale bounce |
| `ProgressBarAnimated.tsx` | Bar that animates from 0 to value |
| `ScoreRingAnimated.tsx` | Circular score indicator with pulse animation |

#### `PlanGate.tsx`
Wraps any UI section that requires a specific plan. Shows a locked "Upgrade Required" placeholder if the user's plan is too low.

#### `MaskedCallButton.tsx`
State machine button for masked calling. States: `idle → confirming → calling → connected / failed`. Each state shows different UI: a confirmation dialog, an animated pulsing ring while connecting, the call SID when live.

#### `RealTimeChat.tsx`
WebSocket-based messaging component on the lead detail page for human agents to message students directly.

---

### 5.8 Animations

**File:** `utils/animations.ts`

All animations use **Anime.js v4** (imported as named exports `{ animate, stagger }` from `'animejs'`).

| Function | Effect |
|---|---|
| `pageEnter(target)` | Fades in + slides up a page or container |
| `staggerIn(targets, delay)` | Sequentially fades in a list of elements (60ms apart) |
| `countUp(start, end, onUpdate, duration)` | Counts from start to end (used for stats cards) |
| `animateBar(el, percent)` | Animates a progress bar width from 0 to the given percentage |
| `shakeEl(el)` | Horizontal shake (used when login fails) |
| `popIn(el)` | Scale + fade in from small to normal (used for badges) |
| `openSidebar(el)` / `closeSidebar(el)` | Slides the dashboard sidebar in/out |
| `modalIn(el)` | Scale + fade in for modals |
| `heroEnter(containerEl)` | Staggers all `[data-hero-item]` children (login left panel) |
| `scoreRingPulse(el)` | Scales in the score ring circle |

> **Note for developers:** Anime.js v4 uses `ease` (not `easing`) for the easing option. Import as named exports — there is no default export in v4.

---

### 5.9 Plan Gating

Plan gating exists at two independent levels:

**Backend** — Serializers return different fields depending on the tenant's plan. Permission classes block actions (phone reveal, export, masked call) at the API layer regardless of what the frontend sends.

**Frontend** — `PlanGate` wraps UI blocks and shows a locked placeholder if the user's plan is too low. `lib/scoring.ts` provides `getCategory()` and `getCategoryLabel()` utilities for displaying lead quality badges consistently across all pages.

---

## 6. Subscription Plans & Feature Matrix

| Feature | Basic (₹2,999/mo) | Pro (₹6,999/mo) | Premium (₹14,999/mo) |
|---|---|---|---|
| Leads per month | 10 | 30 | 100 |
| AI WhatsApp counsellor (Mitra) | ✅ | ✅ | ✅ |
| Voice call counselling | ✅ | ✅ | ✅ |
| Lead name + course | ✅ | ✅ | ✅ |
| Lead location + budget | ❌ | ✅ | ✅ |
| Lead timeline + intent | ❌ | ✅ | ✅ |
| Phone number reveal | ❌ | ❌ | ✅ |
| Masked calling | ❌ | ✅ | ✅ |
| CSV export | ❌ | ❌ | ✅ |
| Exclusive leads (1 college only) | ❌ | ❌ | ✅ |
| Advanced analytics | ❌ | ✅ | ✅ |
| Quota rollover (max) | 5 leads | 15 leads | 50 leads |
| Lead exclusivity cap | Shared with 5 | Shared with 3 | Exclusive (1) |

---

## 7. External Services

| Service | Purpose | Setup status |
|---|---|---|
| **OpenAI GPT-4o** | Mitra's conversation brain + structured data extraction (streaming) | Needs `OPENAI_API_KEY` |
| **OpenAI Whisper** | Transcribes student voice notes and phone recordings to text | Same `OPENAI_API_KEY` |
| **Twilio** | WhatsApp gateway, masked calling, voice call handling | Needs `TWILIO_*` keys |
| **Google Neural2 TTS** | Mitra's speaking voice (`ml-IN-Neural2-A`, female) via Twilio `<Say>` | **No setup needed** — built into Twilio |
| **Azure Neural TTS** | Optional: `ml-IN-SobhaNeural` for pre-rendered audio clips | Optional — `AZURE_TTS_KEY` |
| **Razorpay** | Monthly subscription billing and payment processing | Needs `RAZORPAY_*` keys |
| **AWS S3** | Stores masked call recordings | Needs `AWS_*` keys |
| **Redis** | Conversation cache, Celery task broker, rate limiting, channel layer | Needs `REDIS_URL` |
| **PostgreSQL** | Primary relational database | Connected via `DATABASE_URL` |

---

## 8. Environment Variables

Set all secrets as **Replit Secrets** (the Secrets tool in the sidebar). Never hardcode them in source files.

### Required — basic operation

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key (used for JWT signing + phone encryption) |
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPERADMIN_PASSWORD` | Password for the `superadmin@edulead.in` account |

### Required — AI counsellor (Mitra)

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key — used for GPT-4o and Whisper |
| `REDIS_URL` | Redis connection URL, e.g. `redis://default:pass@host:port` |

### Required — WhatsApp & voice calls

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token |
| `TWILIO_WHATSAPP_NUMBER` | Format: `whatsapp:+1415XXXXXXX` |
| `TWILIO_VOICE_NUMBER` | Virtual number for masked calling and inbound voice |

### Required — billing

| Variable | Description |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | For webhook HMAC signature validation |
| `RAZORPAY_BASIC_PLAN_ID` | Razorpay plan ID for the Basic plan |
| `RAZORPAY_PRO_PLAN_ID` | Razorpay plan ID for the Pro plan |
| `RAZORPAY_PREMIUM_PLAN_ID` | Razorpay plan ID for the Premium plan |

### Optional

| Variable | Default | Description |
|---|---|---|
| `AZURE_TTS_KEY` | (empty) | Azure Neural TTS key — only needed for pre-rendered audio clips (`ml-IN-SobhaNeural`) |
| `AZURE_TTS_REGION` | `centralindia` | Azure region — `centralindia` is lowest latency from Kerala |
| `AWS_ACCESS_KEY_ID` | (empty) | AWS key for S3 call recording storage |
| `AWS_SECRET_ACCESS_KEY` | (empty) | AWS secret |
| `AWS_S3_BUCKET` | `edulead-recordings` | S3 bucket name |
| `AWS_S3_REGION` | `ap-south-1` | AWS region |
| `FRONTEND_URL` | (auto) | Full URL of the frontend — used to build webhook callback URLs |
| `BACKEND_URL` | (auto) | Full URL of the backend — used to build Twilio callback URLs |

---

## 9. Running the Project

The project runs as three services managed by Replit Workflows. All ports are assigned automatically via the `$PORT` environment variable — do not hardcode port numbers.

| Workflow | Command | What it serves |
|---|---|---|
| `edulead-backend: Django API` | `bash scripts/start_django.sh` | REST API + WebSocket at `/api/` |
| `artifacts/edulead-frontend: web` | `pnpm --filter @workspace/edulead-frontend run dev` | React frontend at `/` |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | Node.js API server |

### What the Django startup script does

1. `python manage.py migrate` — applies any pending database migrations.
2. `python manage.py collectstatic --noinput` — gathers static files.
3. `daphne -b 0.0.0.0 -p $PORT config.asgi:application` — starts the ASGI server handling both HTTP and WebSocket connections.

### Running Celery (background tasks)

Once Redis is connected, start the Celery worker in a separate terminal:

```bash
cd edulead_backend
celery -A config worker --loglevel=info
```

To run scheduled beat tasks as well:

```bash
cd edulead_backend
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

Background tasks handle: WhatsApp message processing, voice call turns, lead scoring and allocation, cold lead re-scoring, human handoff notifications, quota warnings, score decay, monthly rollover, and data retention cleanup.

---

## 10. Known Limitations & What Needs Real Infrastructure

### Services requiring credentials (fully implemented — just need keys)

| Feature | Status | What is needed |
|---|---|---|
| AI counsellor — Mitra (WhatsApp) | Needs credentials | `OPENAI_API_KEY` + `REDIS_URL` |
| AI counsellor — Mitra (Voice calls) | Needs credentials | Above + `TWILIO_*` keys |
| Masked calling | Needs credentials | `TWILIO_VOICE_NUMBER` |
| Malayalam TTS (Google Neural2) | **Works automatically** | No extra setup — Twilio built-in |
| Subscription billing | Needs credentials | `RAZORPAY_*` keys |
| Call recordings | Needs credentials | `AWS_*` keys |
| Celery background tasks | Needs Redis | `REDIS_URL` + separate worker process |
| Rate limiting | Soft-fail without Redis | Logs warning but does not block requests |
| Real-time WebSocket chat | Degraded without Redis | Works for single-process; cross-process pub/sub needs Redis channel layer |

### Infrastructure items (production-scale only)

These are correct in the architecture diagrams but cannot be provisioned on Replit — they apply when deploying to AWS:

| Item | Notes |
|---|---|
| ALB + WAF, CloudFront + Route53 | Replace the Replit proxy at production scale |
| RDS Multi-AZ + read replicas | Replace the Replit database at production scale |
| ElastiCache Redis Cluster | Replace Upstash/single Redis at scale |
| ECS Fargate + ECR + GitHub Actions CI/CD | Container-based deployment pipeline |
| GPU inference server (A10G / T4) for Whisper | Currently using OpenAI Whisper API (~400ms added latency — acceptable) |
| Prometheus + Grafana + Sentry + ELK + PagerDuty | Observability stack for production ops |
| PostgreSQL row-level security (RLS) policies | Multi-tenancy is enforced at the DRF layer today; add DB-level RLS at scale |

### Features not yet built

| Feature | Notes |
|---|---|
| Student portal | Students currently interact only via WhatsApp and phone — no web portal |
| Separate agency dashboard | Agencies use the same `/dashboard` as colleges |
| Web chat widget | No embeddable chat widget — WhatsApp and phone are the only entry points |

### What works without any credentials

| Feature | Status |
|---|---|
| Dashboard and admin panel UI | ✅ Fully functional |
| Lead scoring (manual via admin panel) | ✅ Fully functional |
| 2FA setup and verification | ✅ Fully functional |
| JWT auth, RBAC, plan gating | ✅ Fully functional |
| All database models and migrations | ✅ Fully functional |
| Razorpay webhook handler (signature validation) | ✅ Fully functional |

---

## 11. Test Accounts

| Account | Email | Password | Role |
|---|---|---|---|
| Super Admin | `superadmin@edulead.in` | (ask project owner) | Full platform access |
| Pro College | `pro@test.edulead.in` | `EduLeads@2026` | College dashboard — Pro plan |
| Premium College | `premium@test.edulead.in` | `EduLeads@2026` | College dashboard — Premium plan |

To access the Super Admin panel: log in with the superadmin account and navigate to `/admin/overview`.

---

*Last updated: May 2026 — reflects all architecture audit fixes including RECOMMEND FSM state, HANDOFF re-engage, GPT-4o streaming, exponential Celery backoff, cold lead 7-day hold, rescore beat task, budget allocation filter, and Google Neural2 TTS.*



EduLead — Run, Host & Ship to Production
What You're Working With
Layer	Tech	Folder
Backend API	Django 4.2 + Daphne (ASGI)	edulead_backend/
Task Worker	Celery + Celery Beat	edulead_backend/
Frontend	React 19 + Vite	artifacts/edulead-frontend/
API Proxy	Express.js (stub)	artifacts/api-server/
Database	PostgreSQL	external service
Cache/Broker	Redis	external service
Part 1 — Running Locally
Prerequisites
Install these first:

Python 3.11
Node.js 20+
pnpm (npm install -g pnpm)
PostgreSQL 16
Redis
Step 1 — Backend Setup

cd edulead_backend

# Install Python deps
pip install -r requirements.txt

# Create your .env file
cp .env.example .env   # or create manually (see env vars below)
Minimum .env for local dev:


SECRET_KEY=any-long-random-string-here
DEBUG=True
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/edulead_db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000

# Create the database (in psql or pgAdmin)
createdb edulead_db

# Run migrations
python manage.py migrate

# Create a superadmin user
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Start Django (ASGI server for WebSocket support)
daphne -b 0.0.0.0 -p 8000 config.asgi:application
Step 2 — Start Celery (in separate terminals)

# Terminal 2 — Task worker
cd edulead_backend
celery -A config.celery worker --loglevel=info --concurrency=4

# Terminal 3 — Scheduler (cron jobs)
cd edulead_backend
celery -A config.celery beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
Step 3 — Frontend Setup

cd artifacts/edulead-frontend

# Create .env
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Install deps
pnpm install

# Start dev server
pnpm dev
Frontend runs at http://localhost:3000
Backend API runs at http://localhost:8000
API docs (Swagger) at http://localhost:8000/api/docs/

Part 2 — Where to Host
Here's the recommended split for production:

Recommended Stack (cost-effective, scalable)
Service	What to Host	Provider
Frontend	React static build	Vercel (free tier works)
Backend (Django + Daphne)	Django API + WebSockets	Railway or Render
Celery Worker + Beat	Background tasks	Railway (same project)
PostgreSQL	Database	Railway or Supabase
Redis	Cache + broker	Railway or Upstash
File Storage	Call recordings, exports	AWS S3 (already wired in)
Why this split:

Vercel handles CDN, SSL, and auto-deploys for the frontend for free
Railway lets you run Django + Celery + Postgres + Redis all in one project with one-click deploys — it natively supports Procfiles so your 3 processes (web, worker, beat) just work
Total cost: ~$20–50/month to start, scales as needed
Part 3 — Shipping to Production
Step 1 — Prepare Environment Variables
On your hosting provider, set ALL of these:


# Core
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/edulead_db
REDIS_URL=redis://...

# Auth
JWT_SIGNING_KEY=<another long random key, separate from SECRET_KEY>

# AI / Voice
OPENAI_API_KEY=sk-...
AZURE_TTS_KEY=...
AZURE_TTS_REGION=centralindia
AZURE_TTS_VOICE=ml-IN-SobhaNeural

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+91...
TWILIO_VOICE_NUMBER=+91...

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_BASIC_PLAN_ID=plan_...
RAZORPAY_PRO_PLAN_ID=plan_...
RAZORPAY_PREMIUM_PLAN_ID=plan_...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=edulead-recordings
AWS_S3_REGION=ap-south-1

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
TRUSTED_PROXY_COUNT=1
Step 2 — Deploy Frontend to Vercel

cd artifacts/edulead-frontend

# Build locally to verify it works
pnpm build

# Then in Vercel dashboard:
# - Connect your GitHub repo
# - Set root directory to: artifacts/edulead-frontend
# - Build command: pnpm build
# - Output directory: dist
# - Add env var: VITE_API_BASE_URL=https://api.yourdomain.com
Or via Vercel CLI:


npm install -g vercel
cd artifacts/edulead-frontend
vercel --prod
Step 3 — Deploy Backend to Railway
Go to railway.app → New Project → Deploy from GitHub
Point to your repo
Railway auto-detects the Procfile in edulead_backend/ and runs all 3 processes:
web — Django (Gunicorn)
worker — Celery worker
beat — Celery Beat scheduler
Add PostgreSQL and Redis from the Railway plugin marketplace
Paste all your environment variables in the Variables tab
Set the root directory to edulead_backend
Railway will auto-assign a domain like edulead-api.up.railway.app — use that as your BACKEND_URL and in VITE_API_BASE_URL.

Step 4 — Run Migrations on Deploy
In Railway, add a Deploy Command (one-time before start):


python manage.py migrate && python manage.py collectstatic --noinput
Or run it manually from the Railway shell after first deploy.

Step 5 — Configure Webhooks
After deploying, update these in external services to point to your live API:

Service	Webhook URL
Twilio (WhatsApp)	https://api.yourdomain.com/api/webhooks/twilio/whatsapp/
Twilio (Voice)	https://api.yourdomain.com/api/webhooks/twilio/voice/
Razorpay	https://api.yourdomain.com/api/webhooks/razorpay/
Step 6 — Custom Domain (Optional)
Frontend: In Vercel, go to Settings → Domains → add yourdomain.com
Backend: In Railway, go to Settings → Networking → add api.yourdomain.com → point your DNS CNAME there
Production Checklist
DEBUG=False in production env
ALLOWED_HOSTS includes your API domain
SECRET_KEY and JWT_SIGNING_KEY are unique and secret (never committed to git)
Migrations ran before first request
Celery worker AND beat are running (check Railway process list)
Twilio/Razorpay webhooks updated to prod URLs
S3 bucket exists and IAM credentials have write access
Frontend VITE_API_BASE_URL points to prod API domain
HTTPS working on both frontend and backend
Quick Reference — Ports & Processes
Process	Port	Command
Django API	8000	daphne -p 8000 config.asgi:application
Frontend dev	3000	pnpm dev
Celery worker	—	celery -A config.celery worker
Celery beat	—	celery -A config.celery beat
Redis	6379	redis-server
PostgreSQL	5432	system service
The biggest thing to get right: Railway handles the 3-process Procfile automatically — that's the hardest part of self-hosting Django with Celery. Vercel for the frontend is essentially zero-config. Your biggest tasks before going live are filling in all the external API keys (OpenAI, Twilio, Razorpay, Azure, AWS) and pointing webhooks to your production URL.