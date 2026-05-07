from django.urls import path
from .views import (
    CurrentSubscriptionView,
    UsageView,
    CreateSubscriptionView,
    CreatePaymentLinkView,
    QuotaHistoryView,
    PlansView,
)

urlpatterns = [
    path('plans/', PlansView.as_view(), name='subscription-plans'),
    path('current/', CurrentSubscriptionView.as_view(), name='subscription-current'),
    path('usage/', UsageView.as_view(), name='subscription-usage'),
    path('create-subscription/', CreateSubscriptionView.as_view(), name='subscription-create'),
    path('create-payment-link/', CreatePaymentLinkView.as_view(), name='subscription-payment-link'),
    path('quota-history/', QuotaHistoryView.as_view(), name='quota-history'),
]
