from django.urls import path
from .views import LeadFunnelView
from apps.subscriptions.views import QuotaHistoryView

urlpatterns = [
    path('leads/', LeadFunnelView.as_view(), name='analytics-leads'),
    path('quota-history/', QuotaHistoryView.as_view(), name='analytics-quota-history'),
]
