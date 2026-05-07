from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import Subscription, QuotaHistory
from .serializers import SubscriptionSerializer, QuotaHistorySerializer
from services.billing.razorpay_service import RazorpayService
from apps.leads.permissions import IsSuperAdmin

PLAN_PRICES = {'basic': 2999, 'pro': 6999, 'premium': 14999}
PLAN_QUOTA = {'basic': 10, 'pro': 30, 'premium': 100}

PLAN_CATALOGUE = [
    {
        'id': 'basic',
        'name': 'Basic',
        'price_inr': 2999,
        'quota': 10,
        'features': [
            'Up to 10 leads/month',
            'In-app chat with students',
            'Lead name & course info',
            'Score & intent data',
            'Lead status tracking',
        ],
        'restrictions': [
            'No location or budget data',
            'No masked calling',
            'No phone number reveal',
            'No CSV export',
        ],
    },
    {
        'id': 'pro',
        'name': 'Pro',
        'price_inr': 6999,
        'quota': 30,
        'features': [
            'Up to 30 leads/month',
            'Everything in Basic',
            'Full lead profile (location, budget, timeline)',
            'Advanced filters',
            'Masked calling from dashboard',
            'Shared leads (max 3 colleges/lead)',
        ],
        'restrictions': [
            'No real phone number',
            'No CSV export',
            'No exclusive leads',
        ],
    },
    {
        'id': 'premium',
        'name': 'Premium',
        'price_inr': 14999,
        'quota': 100,
        'features': [
            'Up to 100 leads/month',
            'Everything in Pro',
            'Real phone number reveal',
            'Exclusive leads (1 college/lead)',
            'CSV export',
            'Priority lead allocation',
            'Quota rollover',
        ],
        'restrictions': [],
    },
]


class PlansView(APIView):
    """GET /api/subscriptions/plans/ — public plan catalogue."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'plans': PLAN_CATALOGUE})


class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant associated.'}, status=404)
        subscription = Subscription.objects.filter(tenant=tenant).order_by('-created_at').first()
        if not subscription:
            return Response({
                'plan': tenant.plan,
                'status': 'active',
                'monthly_quota': tenant.monthly_quota,
                'used_quota': tenant.used_quota,
                'rollover_quota': tenant.rollover_quota,
                'remaining_quota': tenant.remaining_quota,
            })
        return Response(SubscriptionSerializer(subscription).data)


class UsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant associated.'}, status=404)
        from apps.leads.models import LeadAllocation
        from apps.communications.models import CallRecord
        from django.utils import timezone
        now = timezone.now()
        allocations_this_month = LeadAllocation.objects.filter(
            tenant=tenant,
            allocated_at__year=now.year,
            allocated_at__month=now.month,
        ).count()
        calls_this_month = CallRecord.objects.filter(
            tenant=tenant,
            initiated_at__year=now.year,
            initiated_at__month=now.month,
        ).count()
        return Response({
            'plan': tenant.plan,
            'monthly_quota': tenant.monthly_quota,
            'used_quota': tenant.used_quota,
            'rollover_quota': tenant.rollover_quota,
            'remaining_quota': tenant.remaining_quota,
            'allocations_this_month': allocations_this_month,
            'calls_this_month': calls_this_month,
        })


class CreateSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant associated.'}, status=404)
        plan = request.data.get('plan')
        if plan not in ('basic', 'pro', 'premium'):
            return Response({'detail': 'Invalid plan. Choose basic, pro, or premium.'}, status=400)
        try:
            result = RazorpayService().create_subscription(
                tenant_id=str(tenant.id),
                plan=plan,
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)


class CreatePaymentLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant associated.'}, status=404)
        plan = request.data.get('plan')
        if plan not in ('basic', 'pro', 'premium'):
            return Response({'detail': 'Invalid plan. Choose basic, pro, or premium.'}, status=400)
        try:
            result = RazorpayService().create_payment_link(
                tenant_id=str(tenant.id),
                plan=plan,
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)


class QuotaHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant associated.'}, status=404)
        history = QuotaHistory.objects.filter(tenant=tenant).order_by('-month')[:12]
        return Response(QuotaHistorySerializer(history, many=True).data)


class AdminPaymentsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        subscriptions = Subscription.objects.select_related('tenant').order_by('-created_at')
        results = [{
            'id': str(s.id),
            'tenant_name': s.tenant.name,
            'plan': s.plan,
            'amount': PLAN_PRICES.get(s.plan, 0),
            'status': s.status,
            'created_at': s.created_at.isoformat(),
            'razorpay_payment_id': s.razorpay_subscription_id or '',
        } for s in subscriptions]
        return Response({'results': results})
