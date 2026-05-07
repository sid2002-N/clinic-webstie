from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView as SpectacularSwaggerUIView

from apps.analytics.views import DashboardOverviewView, DashboardQuotaView
from apps.users.views import TeamView, TenantSettingsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerUIView.as_view(url_name='schema'), name='swagger-ui'),

    path('api/auth/', include('apps.users.urls')),
    path('api/leads/', include('apps.leads.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/admin/', include('apps.tenants.urls')),
    path('api/webhooks/', include('apps.webhooks.urls')),
    path('api/conversations/', include('apps.conversations.urls')),

    path('api/dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('api/dashboard/quota/', DashboardQuotaView.as_view(), name='dashboard-quota'),
    path('api/team/', TeamView.as_view(), name='team'),
    path('api/settings/', TenantSettingsView.as_view(), name='settings'),
]
