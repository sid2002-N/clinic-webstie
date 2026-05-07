import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('edulead_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(['tasks'])

app.conf.beat_schedule = {
    'decay-lead-scores-daily': {
        'task': 'tasks.lead_tasks.decay_lead_scores',
        'schedule': crontab(hour=2, minute=0),
    },
    'rescore-cold-leads-daily': {
        'task': 'tasks.lead_tasks.rescore_cold_leads',
        'schedule': crontab(hour=2, minute=30),
    },
    'expire-old-leads-daily': {
        'task': 'tasks.lead_tasks.expire_old_leads',
        'schedule': crontab(hour=3, minute=0),
    },
    'rollover-monthly-quotas': {
        'task': 'tasks.lead_tasks.rollover_monthly_quotas',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),
    },
    'data-retention-cleanup': {
        'task': 'tasks.lead_tasks.run_data_retention',
        'schedule': crontab(day_of_month=1, hour=1, minute=0),
    },
    'check-subscription-statuses-daily': {
        'task': 'tasks.billing_tasks.check_subscription_statuses',
        'schedule': crontab(hour=4, minute=0),
    },
    'sync-razorpay-customers-weekly': {
        'task': 'tasks.billing_tasks.sync_razorpay_customers',
        'schedule': crontab(day_of_week=1, hour=5, minute=0),
    },
}

app.conf.task_routes = {
    'tasks.ai_tasks.process_voice_turn': {'queue': 'voice'},
    'tasks.ai_tasks.process_whatsapp_message': {'queue': 'whatsapp'},
    'tasks.lead_tasks.*': {'queue': 'leads'},
    'tasks.billing_tasks.*': {'queue': 'billing'},
}

app.conf.task_queues_max_priority = 10
app.conf.task_default_priority = 5
