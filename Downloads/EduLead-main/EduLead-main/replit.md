# Workspace

## Overview

pnpm workspace monorepo (TypeScript) plus a standalone Python/Django backend for EduLeads Kerala.

---

## EduLeads Kerala Backend (`edulead_backend/`)

Python 3.11 / Django 5.2 backend for a multi-tenant SaaS platform connecting Kerala students with colleges via an AI Malayalam counsellor.

### Stack
- **Framework**: Django 5.2 + Django REST Framework
- **Database**: PostgreSQL (Replit built-in, via `DATABASE_URL` env var)
- **Cache/Queue**: Redis (falls back to LocMemCache if unavailable)
- **Async tasks**: Celery + Celery Beat
- **AI**: OpenAI GPT-4 (counsellor), OpenAI Whisper (STT)
- **TTS**: Azure Cognitive Services (`ml-IN-MidhunNeural`)
- **Telephony**: Twilio (WhatsApp Business + voice calls)
- **Payments**: Razorpay
- **Proxy**: Express API server (`artifacts/api-server`) proxies all `/api`, `/ws`, `/static` to Django on port 8000

### Auth Endpoints
- `POST /api/auth/register/` — creates Tenant + User, returns JWT
- `POST /api/auth/login/` — returns JWT
- `POST /api/auth/refresh/` — refreshes JWT
- `POST /api/auth/logout/` — blacklists refresh token
- `GET /api/auth/me/` — returns current user

### Apps
- `apps.tenants` — Tenant, AuditLog
- `apps.users` — User (custom AUTH_USER_MODEL)
- `apps.students` — Student
- `apps.leads` — Lead, LeadAllocation, LeadNote
- `apps.conversations` — Conversation, Message
- `apps.communications` — CallRecord
- `apps.subscriptions` — Subscription, QuotaHistory
- `apps.webhooks` — webhooks handler
- `apps.analytics` — analytics views

### Configuration
- Env file: `edulead_backend/.env` (overridden by system env vars from Replit)
- Migrations: proper Django migrations exist in each app's `migrations/` directory
- CORS: `CORS_ALLOW_ALL_ORIGINS = True` (dev)

### Startup
- Script: `scripts/start_django.sh`
- Workflow: `edulead-backend: Django API` (port 8000)

---

## EduLeads Kerala Frontend (`artifacts/edulead-frontend/`)

React + Vite + TypeScript SPA.

### Stack
- **Routing**: React Router v6
- **State**: Zustand (auth store)
- **API**: Axios with JWT interceptor + TanStack Query
- **Charts**: Recharts
- **Brand colours**: `#1E3A5F` (navy) / `#2D7D46` (green)

### Pages
- Landing, Register, Login, Onboarding
- Admin suite: Overview, Tenants, Leads, Analytics, Users, Payments
- Dashboard suite: Overview, Leads, LeadDetail, Quota, Team, Settings, Billing

### Proxy routing
- `previewPath = "/"` → served at root by shared Replit proxy
- API calls: `axios` base URL = `${BASE_URL}/api` → shared proxy routes `/api` → Express (port 8080) → Django (port 8000)

---

## Express API Server (`artifacts/api-server/`)

Acts purely as a **reverse proxy** to Django. All `/api`, `/ws`, `/static` requests are forwarded to `http://localhost:8000` using `http-proxy-middleware`. Returns a 502 if Django is down.

---

## Workflows
| Name | Command | Port |
|---|---|---|
| `edulead-backend: Django API` | `bash scripts/start_django.sh` | 8000 |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |
| `artifacts/edulead-frontend: web` | `pnpm --filter @workspace/edulead-frontend run dev` | 21594 |
