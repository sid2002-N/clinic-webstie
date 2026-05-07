from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Initial platform setup: run migrations, create superadmin, print API endpoints'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE('Running migrations...'))
        from django.core.management import call_command
        call_command('migrate', verbosity=1)
        self.stdout.write(self.style.SUCCESS('Migrations complete.'))

        self.stdout.write(self.style.MIGRATE('Creating superadmin...'))
        self._create_superadmin()

        self.stdout.write(self.style.MIGRATE('\nRazorpay setup instructions:'))
        self._print_razorpay_instructions()

        self.stdout.write(self.style.MIGRATE('\nAPI Endpoints:'))
        self._print_endpoints()

    def _create_superadmin(self):
        from apps.users.models import User
        email = 'admin@edulead.in'
        password = settings.SUPERADMIN_PASSWORD

        if User.objects.filter(email=email).exists():
            self.stdout.write(f'  Superadmin {email} already exists.')
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            full_name='Platform Admin',
            role='superadmin',
        )
        self.stdout.write(self.style.SUCCESS(f'  Superadmin created: {email}'))

    def _print_razorpay_instructions(self):
        self.stdout.write('  1. Log in to your Razorpay dashboard at https://dashboard.razorpay.com')
        self.stdout.write('  2. Create 3 subscription plans (Products → Subscriptions → Plans):')
        self.stdout.write('     - EduLeads Basic  — ₹2,999/month → copy plan ID to RAZORPAY_BASIC_PLAN_ID')
        self.stdout.write('     - EduLeads Pro     — ₹6,999/month → copy plan ID to RAZORPAY_PRO_PLAN_ID')
        self.stdout.write('     - EduLeads Premium — ₹14,999/month → copy plan ID to RAZORPAY_PREMIUM_PLAN_ID')
        self.stdout.write('  3. Set up webhook at Settings → Webhooks:')
        self.stdout.write(f'     URL: {settings.FRONTEND_URL}/api/webhooks/razorpay/')
        self.stdout.write('     Events: payment.captured, subscription.charged, subscription.cancelled, payment.failed')
        self.stdout.write('  4. Copy the webhook secret to RAZORPAY_WEBHOOK_SECRET in .env')

    def _print_endpoints(self):
        endpoints = [
            ('POST', '/api/auth/login/', 'JWT login'),
            ('POST', '/api/auth/refresh/', 'Refresh token'),
            ('POST', '/api/auth/logout/', 'Logout + blacklist token'),
            ('GET',  '/api/auth/me/', 'Current user info'),
            ('GET',  '/api/leads/', 'List leads (tenant-scoped)'),
            ('GET',  '/api/leads/{id}/', 'Lead detail'),
            ('PATCH','/api/leads/{id}/status/', 'Update lead status'),
            ('POST', '/api/leads/{id}/note/', 'Add note to lead'),
            ('GET',  '/api/leads/{id}/reveal-phone/', 'Reveal phone (Premium only)'),
            ('POST', '/api/leads/{id}/call/', 'Initiate masked call (Pro/Premium only)'),
            ('GET',  '/api/leads/export/', 'CSV export (Premium only)'),
            ('GET',  '/api/leads/{id}/messages/', 'Message history'),
            ('POST', '/api/leads/{id}/messages/', 'Send message'),
            ('GET',  '/api/subscriptions/current/', 'Current plan + quota'),
            ('GET',  '/api/subscriptions/usage/', 'Usage stats'),
            ('POST', '/api/subscriptions/create-subscription/', 'Create Razorpay subscription'),
            ('POST', '/api/subscriptions/create-payment-link/', 'Create one-time Razorpay payment link'),
            ('GET',  '/api/subscriptions/quota-history/', 'Quota history'),
            ('GET',  '/api/analytics/dashboard/', 'Dashboard overview'),
            ('GET',  '/api/analytics/leads/', 'Lead funnel stats'),
            ('GET',  '/api/analytics/quota-history/', 'Quota history'),
            ('GET',  '/api/admin/tenants/', 'All tenants (superadmin)'),
            ('PATCH','/api/admin/tenants/{id}/', 'Update tenant plan (superadmin)'),
            ('GET',  '/api/admin/leads/', 'All leads (superadmin)'),
            ('POST', '/api/admin/leads/', 'Create lead manually (superadmin)'),
            ('POST', '/api/admin/leads/{id}/allocate/', 'Allocate lead (superadmin)'),
            ('GET',  '/api/admin/analytics/', 'Platform analytics (superadmin)'),
            ('POST', '/api/webhooks/twilio/whatsapp/', 'Twilio WhatsApp webhook'),
            ('POST', '/api/webhooks/twilio/voice/', 'Twilio voice webhook'),
            ('POST', '/api/webhooks/twilio/call-status/', 'Twilio call status webhook'),
            ('POST', '/api/webhooks/razorpay/', 'Razorpay webhook'),
            ('GET',  '/api/docs/', 'Swagger UI'),
        ]
        for method, path, desc in endpoints:
            self.stdout.write(f'  {method:6} {path:55} {desc}')
