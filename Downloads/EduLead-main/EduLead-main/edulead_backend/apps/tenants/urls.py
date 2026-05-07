from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminTenantViewSet, AdminUsersView, AdminAuditLogView
from apps.leads.views import AdminLeadViewSet
from apps.analytics.views import AdminAnalyticsView
from apps.subscriptions.views import AdminPaymentsView

router = DefaultRouter()
router.register('tenants', AdminTenantViewSet, basename='admin-tenants')
router.register('leads', AdminLeadViewSet, basename='admin-leads')

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('payments/', AdminPaymentsView.as_view(), name='admin-payments'),
    path('audit-logs/', AdminAuditLogView.as_view(), name='admin-audit-logs'),
]
