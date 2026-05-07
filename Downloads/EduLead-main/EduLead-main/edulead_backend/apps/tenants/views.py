from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import Tenant, AuditLog
from .serializers import TenantSerializer, TenantPlanUpdateSerializer, AuditLogSerializer
from apps.leads.permissions import IsSuperAdmin


class AdminTenantViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

    def get_serializer_class(self):
        if self.action in ('partial_update', 'update'):
            return TenantPlanUpdateSerializer
        return TenantSerializer


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        from apps.users.models import User
        users = User.objects.select_related('tenant').order_by('-created_at')
        results = [{
            'id': str(u.id),
            'full_name': u.full_name,
            'email': u.email,
            'role': u.role,
            'tenant_name': u.tenant.name if u.tenant else None,
            'is_active': u.is_active,
            'totp_enabled': u.totp_enabled,
            'date_joined': u.created_at.isoformat(),
        } for u in users]
        return Response({'count': len(results), 'results': results})


class AdminAuditLogView(APIView):
    """GET /api/admin/audit-logs/?tenant_id=&action=&resource_type=&page=1"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        qs = AuditLog.objects.select_related('tenant', 'user').order_by('-created_at')

        tenant_id = request.query_params.get('tenant_id')
        action = request.query_params.get('action')
        resource_type = request.query_params.get('resource_type')

        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if action:
            qs = qs.filter(action__icontains=action)
        if resource_type:
            qs = qs.filter(resource_type=resource_type)

        page = max(1, int(request.query_params.get('page', 1)))
        page_size = 50
        total = qs.count()
        logs = qs[(page - 1) * page_size: page * page_size]

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': AuditLogSerializer(logs, many=True).data,
        })
