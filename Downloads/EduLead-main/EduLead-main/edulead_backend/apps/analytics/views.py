from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta, date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.leads.models import Lead, LeadAllocation
from apps.leads.permissions import IsSuperAdmin
from apps.tenants.models import Tenant
from apps.communications.models import CallRecord
from apps.subscriptions.models import QuotaHistory

PLAN_PRICES = {'basic': 2999, 'pro': 6999, 'premium': 14999}


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)

        allocated_ids = LeadAllocation.objects.filter(tenant=tenant).values_list('lead_id', flat=True)
        leads = Lead.objects.filter(id__in=allocated_ids)

        hot = leads.filter(category='hot').count()
        warm = leads.filter(category='warm').count()
        cold = leads.filter(category='cold').count()

        recent_leads = list(leads.order_by('-created_at')[:5])
        recent_data = [{
            'id': str(lead.id),
            'student_name': lead.full_name or 'Unknown',
            'course_interest': lead.course_interest,
            'score': lead.score,
            'category': lead.category,
            'status': lead.status,
            'created_at': lead.created_at.isoformat(),
        } for lead in recent_leads]

        return Response({
            'quota_used': tenant.used_quota,
            'quota_total': tenant.monthly_quota,
            'rollover_balance': tenant.rollover_quota,
            'hot_leads': hot,
            'warm_leads': warm,
            'cold_leads': cold,
            'total_leads': hot + warm + cold,
            'recent_leads': recent_data,
        })


class DashboardQuotaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)

        history_qs = QuotaHistory.objects.filter(tenant=tenant).order_by('-month')[:12]
        allocated_ids = LeadAllocation.objects.filter(tenant=tenant).values_list('lead_id', flat=True)

        monthly_history = []
        for h in history_qs:
            m = h.month
            month_start = date(m.year, m.month, 1)
            if m.month == 12:
                month_end = date(m.year + 1, 1, 1)
            else:
                month_end = date(m.year, m.month + 1, 1)

            converted = Lead.objects.filter(
                id__in=allocated_ids,
                status='converted',
                created_at__date__gte=month_start,
                created_at__date__lt=month_end,
            ).count()
            received = h.used_quota
            rate = round(converted / received * 100, 1) if received else 0.0
            monthly_history.append({
                'month': h.month.strftime('%b %Y'),
                'leads_received': received,
                'converted': converted,
                'conversion_rate': rate,
            })

        return Response({
            'quota_used': tenant.used_quota,
            'quota_total': tenant.monthly_quota,
            'rollover_balance': tenant.rollover_quota,
            'remaining': tenant.remaining_quota,
            'monthly_history': monthly_history,
        })


class LeadFunnelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)

        allocated_ids = LeadAllocation.objects.filter(tenant=tenant).values_list('lead_id', flat=True)
        leads = Lead.objects.filter(id__in=allocated_ids)
        funnel = leads.values('status').annotate(count=Count('id'))
        by_course = leads.values('course_interest').annotate(count=Count('id')).order_by('-count')[:10]
        by_location = leads.values('location').annotate(count=Count('id')).order_by('-count')[:10]
        avg_score = leads.aggregate(avg=Avg('score'))['avg'] or 0

        return Response({
            'by_status': list(funnel),
            'by_course': list(by_course),
            'by_location': list(by_location),
            'average_score': round(avg_score, 1),
        })


class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_tenants = Tenant.objects.filter(status='active').count()
        total_leads = Lead.objects.count()
        leads_this_month = Lead.objects.filter(created_at__gte=month_start).count()
        active_subscriptions = Tenant.objects.filter(status='active').count()
        total_calls = CallRecord.objects.count()

        plan_qs = Tenant.objects.filter(status='active').values('plan').annotate(count=Count('id'))
        plan_counts = {'basic': 0, 'pro': 0, 'premium': 0}
        for row in plan_qs:
            plan_counts[row['plan']] = row['count']

        recent_tenants = Tenant.objects.order_by('-created_at')[:8]
        recent_signups = [{
            'id': str(t.id),
            'name': t.name,
            'type': t.tenant_type,
            'plan': t.plan,
            'joined': t.created_at.isoformat(),
        } for t in recent_tenants]

        cat_qs = Lead.objects.values('category').annotate(count=Count('id'))
        category_counts = {'hot': 0, 'warm': 0, 'cold': 0}
        for row in cat_qs:
            category_counts[row['category']] = row['count']

        leads_by_month = (
            Lead.objects
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        leads_over_time = [
            {'month': row['month'].strftime('%b %Y'), 'count': row['count']}
            for row in leads_by_month if row['month']
        ]

        current_revenue = sum(PLAN_PRICES.get(p, 0) * c for p, c in plan_counts.items())
        revenue_over_time = [
            {'month': (now - timedelta(days=30 * i)).strftime('%b %Y'), 'amount': current_revenue}
            for i in range(11, -1, -1)
        ]

        return Response({
            'total_tenants': total_tenants,
            'total_leads': total_leads,
            'leads_this_month': leads_this_month,
            'active_subscriptions': active_subscriptions,
            'total_calls': total_calls,
            'plan_counts': plan_counts,
            'recent_signups': recent_signups,
            'category_counts': category_counts,
            'leads_over_time': leads_over_time,
            'revenue_over_time': revenue_over_time,
        })
