# EduLeads Kerala — Hosting & Deployment Guide

## Overview

EduLeads Kerala is a multi-tenant SaaS platform with three components:

| Component | Technology | Purpose |
|---|---|---|
| **Django Backend** | Python 3.11, Daphne (ASGI), Celery | REST API, WebSocket, background tasks |
| **React Frontend** | React 18, Vite, Tailwind CSS 4 | Tenant dashboard SPA |
| **AI Counsellor "Mitra"** | OpenAI GPT-4o, Google Neural2 TTS, Twilio | WhatsApp + voice bot in Malayalam |

---

## Prerequisites

### Accounts and services you must have before deploying

| Service | What it is used for | Free tier? |
|---|---|---|
| **PostgreSQL** (v14+) | Primary database | Replit DB or any managed PG |
| **Redis** (v6+) | Celery broker, Django channels, rate limiting | Upstash free / Redis Cloud |
| **Twilio** | WhatsApp messaging + voice calls | Pay-as-you-go |
| **OpenAI** | GPT-4o for Mitra conversation engine | Pay-as-you-go |
| **Google Cloud** | Neural2 Malayalam TTS (via Twilio `<Say>`) | First 1M chars/month free |
| **Razorpay** | Subscription billing | No monthly fee |
| **AWS S3** | Recording and media storage | Free tier 5 GB |
| **Azure Cognitive Services** (optional) | Fallback TTS if Google unavailable | Pay-as-you-go |

---

## Environment Variables

Create a `.env` file in `edulead_backend/` (never commit this file).

```env
# ── Django core ──────────────────────────────────────────────────────────────
DEBUG=False
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_urlsafe(64))">
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com

# ── JWT ───────────────────────────────────────────────────────────────────────
# Must be different from SECRET_KEY
JWT_SIGNING_KEY=<generate: python -c "import secrets; print(secrets.token_urlsafe(64))">

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/edulead

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://:PASSWORD@HOST:6379/0

# ── Phone encryption (Fernet AES-128) ─────────────────────────────────────────
# Generate: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
FERNET_KEY=<your-generated-fernet-key>

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# ── Admin account ─────────────────────────────────────────────────────────────
SUPERADMIN_PASSWORD=<strong-password-min-10-chars>

# ── Twilio ────────────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1415xxxxxxx
TWILIO_VOICE_NUMBER=+1415xxxxxxx

# ── OpenAI ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── Razorpay ──────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_BASIC_PLAN_ID=plan_xxxxxxxxxxxx
RAZORPAY_PREMIUM_PLAN_ID=plan_xxxxxxxxxxxx
RAZORPAY_PRO_PLAN_ID=plan_xxxxxxxxxxxx

# ── AWS S3 (call recordings + media) ─────────────────────────────────────────
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=edulead-media
AWS_S3_REGION=ap-south-1

# ── Azure TTS (optional fallback) ────────────────────────────────────────────
AZURE_TTS_KEY=xxxxxxxxxxxxxxxxxxxx
AZURE_TTS_REGION=centralindia
AZURE_TTS_VOICE=ml-IN-SobhanaNeural

# ── Proxy trust (set to the number of load balancers in front of Django) ──────
TRUSTED_PROXY_COUNT=1
```

### Google Cloud Neural2 TTS

Google Neural2 is used via Twilio's `<Say verb>` — Twilio calls Google directly; no credentials needed on your server. However, if you add direct Google TTS API calls later:

1. Create a service account in Google Cloud Console with the **Cloud Text-to-Speech API** role.
2. Download the JSON key file.
3. Set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json` in your environment.

---

## Local Development (Replit)

Everything runs via Replit workflows — no manual commands needed.

1. Open the project in Replit.
2. Create `edulead_backend/.env` with the variables above (use `DEBUG=True` for local).
3. Click **Run** — this starts the Django backend automatically.
4. The frontend dev server starts on its own workflow.
5. Access the app at your Replit dev URL.

To restart the backend after config changes, click the restart button next to **edulead-backend: Django API** in the workflow panel.

### First-time setup

```bash
# Inside the Replit shell, run once:
cd edulead_backend
python manage.py migrate
python manage.py create_superadmin   # uses SUPERADMIN_PASSWORD env var
python manage.py collectstatic --noinput
```

---

## Production Deployment on Replit (Autoscale)

Replit Autoscale is the recommended path — it handles TLS, CDN, health checks, and zero-downtime deploys automatically.

### Step 1 — Set secrets

In Replit → **Secrets** (the lock icon), add every variable from the Environment Variables section above. Do **not** use a `.env` file in production; Replit Secrets are injected automatically.

Set `DEBUG=False`.

### Step 2 — Deploy

Click **Deploy** in the top-right of the Replit editor, choose **Autoscale**, and confirm. Replit will:

1. Build the React frontend (`pnpm --filter @workspace/edulead-frontend run build`).
2. Collect Django static files.
3. Run database migrations.
4. Start Daphne ASGI on the assigned port.
5. Serve the React SPA as static files from `/`.
6. Route `/api/*` to Django.

Your app will be live at `https://<your-replit-app>.replit.app`.

### Step 3 — Custom domain (optional)

In Replit → **Deployments** → **Custom domain**, enter your domain (e.g. `edulead.in`). Add the CNAME record shown to your DNS provider. TLS is provisioned automatically.

Update secrets:
```
ALLOWED_HOSTS=edulead.in,www.edulead.in
CORS_ALLOWED_ORIGINS=https://edulead.in
```

---

## Self-Hosted / VPS Deployment

Use this section if deploying to a Linux server (Ubuntu 22.04 recommended) outside Replit.

### System dependencies

```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm redis-server postgresql
npm install -g pnpm
```

### Clone and install

```bash
git clone <your-repo-url> edulead
cd edulead

# Python deps
cd edulead_backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Node deps
cd ..
pnpm install
```

### Build the frontend

```bash
pnpm --filter @workspace/edulead-frontend run build
# Output: artifacts/edulead-frontend/dist/
```

### Database setup

```bash
sudo -u postgres psql -c "CREATE USER edulead WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "CREATE DATABASE edulead OWNER edulead;"
```

### Run migrations and collect static files

```bash
cd edulead_backend
source venv/bin/activate
python manage.py migrate
python manage.py create_superadmin
python manage.py collectstatic --noinput
```

### Process manager (systemd)

Create three systemd unit files:

**`/etc/systemd/system/edulead-web.service`**
```ini
[Unit]
Description=EduLeads Django ASGI
After=network.target postgresql.service redis.service

[Service]
User=www-data
WorkingDirectory=/srv/edulead/edulead_backend
EnvironmentFile=/srv/edulead/edulead_backend/.env
ExecStart=/srv/edulead/edulead_backend/venv/bin/daphne \
    -b 0.0.0.0 -p 8000 config.routing:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**`/etc/systemd/system/edulead-worker.service`**
```ini
[Unit]
Description=EduLeads Celery Worker
After=network.target redis.service

[Service]
User=www-data
WorkingDirectory=/srv/edulead/edulead_backend
EnvironmentFile=/srv/edulead/edulead_backend/.env
ExecStart=/srv/edulead/edulead_backend/venv/bin/celery \
    -A config.celery worker --loglevel=info --concurrency=4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**`/etc/systemd/system/edulead-beat.service`**
```ini
[Unit]
Description=EduLeads Celery Beat Scheduler
After=network.target redis.service

[Service]
User=www-data
WorkingDirectory=/srv/edulead/edulead_backend
EnvironmentFile=/srv/edulead/edulead_backend/.env
ExecStart=/srv/edulead/edulead_backend/venv/bin/celery \
    -A config.celery beat --loglevel=info \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable edulead-web edulead-worker edulead-beat
sudo systemctl start edulead-web edulead-worker edulead-beat
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name edulead.in www.edulead.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name edulead.in www.edulead.in;

    ssl_certificate /etc/letsencrypt/live/edulead.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/edulead.in/privkey.pem;

    # React SPA
    root /srv/edulead/artifacts/edulead-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Django API + WebSocket
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Django static + media
    location /static/ {
        alias /srv/edulead/edulead_backend/staticfiles/;
    }
}
```

Get a free TLS certificate:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d edulead.in -d www.edulead.in
```

---

## Twilio Configuration

After deploying, register your webhook URLs in the Twilio Console:

| Setting | URL |
|---|---|
| WhatsApp incoming message | `https://yourdomain.com/api/webhooks/whatsapp/` |
| Voice — a call comes in | `https://yourdomain.com/api/webhooks/voice/` |
| Voice — call status callback | `https://yourdomain.com/api/webhooks/voice/status/` |
| Voice — recording complete | `https://yourdomain.com/api/webhooks/voice/recording/` |

For Razorpay, set the webhook URL in the Razorpay Dashboard → Webhooks to:
```
https://yourdomain.com/api/webhooks/razorpay/
```

---

## Security Checklist Before Going Live

- [ ] `DEBUG=False` in production secrets
- [ ] `SECRET_KEY` is at least 50 characters, randomly generated, not shared
- [ ] `JWT_SIGNING_KEY` is different from `SECRET_KEY`
- [ ] `FERNET_KEY` is stored securely and backed up — losing it makes all encrypted phone numbers unrecoverable
- [ ] `SUPERADMIN_PASSWORD` is strong (min 10 chars, not a dictionary word)
- [ ] `ALLOWED_HOSTS` lists only your real domains — no wildcards
- [ ] `CORS_ALLOWED_ORIGINS` lists only your frontend origin
- [ ] `TRUSTED_PROXY_COUNT` matches the number of load balancers / proxies in front of Django
- [ ] Database and Redis are not publicly accessible (firewall rules)
- [ ] S3 bucket has no public-read ACL; recordings are served via signed URLs only
- [ ] Razorpay and Twilio webhook secrets are set and verified

---

## Upgrading

```bash
# Pull latest code
git pull origin main

# Install any new Python packages
pip install -r edulead_backend/requirements.txt

# Install any new Node packages
pnpm install

# Apply new database migrations
cd edulead_backend && python manage.py migrate

# Rebuild frontend
pnpm --filter @workspace/edulead-frontend run build

# Restart services
sudo systemctl restart edulead-web edulead-worker edulead-beat
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `502 Bad Gateway` | Django not running | `sudo systemctl status edulead-web` → check logs |
| WhatsApp messages not received | Webhook URL not registered or wrong | Re-enter URL in Twilio Console; ensure no trailing slash mismatch |
| Mitra not speaking (TTS silent) | Google Neural2 used via Twilio — no key needed; check Twilio call logs | Check `TWILIO_VOICE_NUMBER` env var is set correctly |
| Celery tasks not running | Redis unreachable or worker not started | `redis-cli ping` → `PONG`; `systemctl status edulead-worker` |
| `invalid key` on phone decryption | `FERNET_KEY` changed after data was written | Restore the original `FERNET_KEY`; never rotate without a migration script |
| `CORS error` in browser | `CORS_ALLOWED_ORIGINS` missing your frontend URL | Add `https://yourdomain.com` to the secret |
| Migrations fail on deploy | DB not reachable at startup | Confirm `DATABASE_URL` is correct; check firewall allows the app server IP |
