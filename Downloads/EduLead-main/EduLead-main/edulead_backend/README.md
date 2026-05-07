# EduLeads Kerala — Backend

Multi-tenant SaaS platform connecting Kerala students with colleges via an AI Malayalam counsellor.

## Stack
- **Python 3.11** / Django 4.2 + Django REST Framework
- **PostgreSQL** (Supabase)
- **Redis** — caching, rate limiting, conversation history, Celery broker
- **Celery + Celery Beat** — async task queue and scheduled jobs
- **OpenAI GPT-4** — AI counsellor (Mitra)
- **OpenAI Whisper** — Malayalam speech-to-text
- **Azure Cognitive Services** — Malayalam TTS (`ml-IN-MidhunNeural`)
- **Twilio** — WhatsApp Business API + voice calls
- **Razorpay** — subscription billing + payment links
- **AWS S3** — call recordings and file exports
- **JWT** — djangorestframework-simplejwt

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env .env.local
# Edit .env with your real credentials

# 3. First-time setup (migrations + superadmin + Razorpay instructions)
python manage.py setup_platform

# 4. Run dev server
python manage.py runserver

# 5. Start Celery worker (separate terminal)
celery -A config.celery worker --loglevel=info

# 6. Start Celery beat (separate terminal)
celery -A config.celery beat --loglevel=info
```

## Project Structure

```
edulead_backend/
├── config/           Django settings, URLs, Celery config
├── apps/
│   ├── tenants/      Tenant and audit log models
│   ├── users/        Custom user model, JWT auth views
│   ├── students/     Student model with encrypted phone, consent/GDPR
│   ├── leads/        Lead model, scoring, allocation, permissions
│   ├── conversations/ Conversation and message models
│   ├── communications/ Call records
│   ├── subscriptions/ Razorpay subscription and quota history
│   ├── webhooks/     Twilio + Razorpay webhook handlers
│   └── analytics/    Dashboard and funnel analytics
├── services/
│   ├── ai/           GPT-4 counsellor, Whisper STT, Azure TTS, intent extractor
│   ├── leads/        Scoring and allocation logic
│   ├── communications/ WhatsApp handler, masked calling
│   ├── billing/      RazorpayService
│   └── compliance/   Consent + GDPR + data retention
├── tasks/            Celery tasks (lead, AI, billing pipelines)
├── middleware/       Rate limiting, Twilio signature validation
└── management/       setup_platform management command
```

## API Endpoints

Run `python manage.py setup_platform` to print the full endpoint list, or visit `/api/docs/` for Swagger UI.

## Plans & Pricing

| Plan    | Price (INR/month) | Leads/month | Exclusivity | Masked Calling | Phone Reveal | CSV Export |
|---------|------------------|------------|-------------|----------------|--------------|------------|
| Basic   | ₹2,999           | 10         | 5 tenants   | ✗              | ✗            | ✗          |
| Pro     | ₹6,999           | 30         | 3 tenants   | ✓              | ✗            | ✗          |
| Premium | ₹14,999          | 100        | 1 tenant    | ✓              | ✓            | ✓          |

## Razorpay Setup

1. Create 3 subscription plans in the Razorpay dashboard
2. Copy plan IDs to `.env` as `RAZORPAY_BASIC_PLAN_ID`, `RAZORPAY_PRO_PLAN_ID`, `RAZORPAY_PREMIUM_PLAN_ID`
3. Register webhook at `POST /api/webhooks/razorpay/` for events:
   - `payment.captured`
   - `subscription.charged`
   - `subscription.cancelled`
   - `payment.failed`

## JWT Token Payload

Every access token includes `tenant_id`, `plan`, and `role` so the frontend can gate UI without extra API calls.

## Celery Beat Schedule

| Task                  | Schedule                    |
|-----------------------|-----------------------------|
| Decay lead scores     | Daily at 2:00 AM IST        |
| Expire old leads      | Daily at 3:00 AM IST        |
| Rollover quotas       | 1st of each month, midnight |
| Data retention        | 1st of each month, 1:00 AM  |
