import csv
import io
import logging
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Lead, LeadAllocation, LeadNote
from .serializers import (
    LeadListBasicSerializer, LeadListSerializer,
    LeadDetailBasicSerializer, LeadDetailSerializer,
    LeadDetailPremiumSerializer, MessageSerializer,
    LeadStatusUpdateSerializer, LeadNoteSerializer,
    LeadAllocationStatusSerializer, AdminLeadCreateSerializer,
)
from .permissions import (
    IsSuperAdmin, SameTenantPermission,
    PhoneRevealPermission, ExportPermission, MaskedCallPermission,
)
from apps.tenants.models import AuditLog
from apps.conversations.models import Message

logger = logging.getLogger(__name__)


def _csv_safe(value) -> str:
    """
    OWASP A03 — CSV Injection: prefix any cell whose first character is a
    spreadsheet formula trigger (=, +, -, @, tab, CR) with a tab so that
    Excel/Sheets/LibreOffice treats it as plain text, not a formula.
    """
    s = str(value) if value is not None else ''
    if s and s[0] in ('=', '+', '-', '@', '\t', '\r'):
        return '\t' + s
    return s


class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'course_interest', 'location']
    search_fields = ['full_name', 'course_interest', 'location']
    ordering_fields = ['score', 'created_at', 'last_activity_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return Lead.objects.select_related('student').prefetch_related('notes')
        if not user.tenant:
            return Lead.objects.none()
        allocated_lead_ids = LeadAllocation.objects.filter(
            tenant=user.tenant
        ).values_list('lead_id', flat=True)
        return Lead.objects.filter(
            id__in=allocated_lead_ids
        ).select_related('student').prefetch_related('notes')

    def get_serializer_class(self):
        user = self.request.user
        plan = user.tenant.plan if user.tenant else 'basic'
        is_superadmin = user.role == 'superadmin'

        if self.action == 'list':
            if is_superadmin or plan in ('pro', 'premium'):
                return LeadListSerializer
            return LeadListBasicSerializer

        if is_superadmin or plan == 'premium':
            return LeadDetailPremiumSerializer
        if plan == 'pro':
            return LeadDetailSerializer
        return LeadDetailBasicSerializer

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadStatusUpdateSerializer(lead, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='note')
    def add_note(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(lead=lead, tenant=request.user.tenant, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='reveal-phone',
            permission_classes=[IsAuthenticated, PhoneRevealPermission])
    def reveal_phone(self, request, pk=None):
        lead = self.get_object()
        allocation = LeadAllocation.objects.filter(
            lead=lead, tenant=request.user.tenant
        ).first()
        if not allocation:
            return Response({'detail': 'Not allocated to your tenant.'}, status=403)
        phone = lead.student.get_phone()
        allocation.phone_revealed_at = timezone.now()
        allocation.phone_reveal_count += 1
        allocation.save(update_fields=['phone_revealed_at', 'phone_reveal_count'])
        AuditLog.objects.create(
            tenant=request.user.tenant,
            user=request.user,
            action='phone_revealed',
            resource_type='lead',
            resource_id=str(lead.id),
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response({'phone': phone})

    @action(detail=True, methods=['post'], url_path='call',
            permission_classes=[IsAuthenticated, MaskedCallPermission])
    def initiate_call(self, request, pk=None):
        from services.communications.masked_calling import MaskedCallingService
        lead = self.get_object()
        try:
            result = MaskedCallingService().create_call_bridge(
                college_user_id=str(request.user.id),
                lead_id=str(lead.id),
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except PermissionError:
            # OWASP A05 — never expose internal exception details to the client
            return Response({'detail': 'Your plan does not support this feature.'}, status=403)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=400)
        except Exception:
            logger.error('Failed to initiate call for lead %s', lead.id, exc_info=True)
            return Response({'detail': 'Failed to initiate call. Please try again.'}, status=500)

    @action(detail=False, methods=['get'], url_path='export',
            permission_classes=[IsAuthenticated, ExportPermission])
    def export_csv(self, request):
        leads = self.get_queryset()
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(['ID', 'Name', 'Course', 'Location', 'Budget', 'Timeline',
                         'Intent', 'Score', 'Category', 'Status', 'Created'])
        for lead in leads:
            # OWASP A03 — sanitise every cell against CSV injection
            writer.writerow([
                _csv_safe(lead.id), _csv_safe(lead.full_name),
                _csv_safe(lead.course_interest), _csv_safe(lead.location),
                _csv_safe(lead.budget_range), _csv_safe(lead.timeline),
                _csv_safe(lead.intent_level), _csv_safe(lead.score),
                _csv_safe(lead.category), _csv_safe(lead.status),
                _csv_safe(lead.created_at.isoformat()),
            ])
        AuditLog.objects.create(
            tenant=request.user.tenant,
            user=request.user,
            action='leads_exported',
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leads.csv"'
        return response

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        lead = self.get_object()
        conversation = getattr(lead, 'conversation', None)
        if not conversation:
            return Response({'detail': 'No conversation found.'}, status=404)
        if request.method == 'GET':
            msgs = conversation.messages.all()
            return Response(MessageSerializer(msgs, many=True).data)
        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(conversation=conversation, role='human_agent')
        return Response(serializer.data, status=201)


class AdminLeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = LeadDetailPremiumSerializer

    def get_queryset(self):
        return Lead.objects.select_related('student').prefetch_related('notes', 'allocations')

    def create(self, request, *args, **kwargs):
        from apps.students.models import Student
        from services.leads.scoring import LeadScoringService

        ser = AdminLeadCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        student, _ = Student.objects.get_or_create(
            whatsapp_number=data['whatsapp_number'],
            defaults={'full_name': data['student_name']},
        )
        if not student.full_name:
            student.full_name = data['student_name']
        student.save(update_fields=['full_name'])

        scoring_input = {
            'full_name':       data['student_name'],
            'course_interest': data['course_interest'],
            'location':        data['location'],
            'budget_range':    data['budget_range'],
            'timeline':        data['timeline'],
            'intent_level':    data['intent_level'],
        }
        score_result = LeadScoringService().compute(scoring_input)

        lead = Lead.objects.create(
            student=student,
            full_name=data['student_name'],
            course_interest=data['course_interest'],
            location=data['location'],
            budget_range=data['budget_range'],
            timeline=data['timeline'],
            intent_level=data['intent_level'],
            score=score_result['score'],
            category=score_result['category'],
            dimension_scores=score_result['dimension_scores'],
        )

        try:
            from services.leads.allocation import LeadAllocationService
            allocated_to = LeadAllocationService().allocate(str(lead.id))
        except Exception:
            allocated_to = []

        out = LeadDetailPremiumSerializer(lead, context={'request': request})
        return Response(
            {**out.data, 'allocated_to': allocated_to},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='allocate')
    def allocate(self, request, pk=None):
        from services.leads.allocation import LeadAllocationService
        lead = self.get_object()
        tenant_ids = LeadAllocationService().allocate(str(lead.id))
        return Response({'allocated_to': tenant_ids})
