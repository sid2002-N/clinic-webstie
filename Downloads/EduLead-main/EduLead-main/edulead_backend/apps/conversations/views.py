import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)


class ConversationPlaceholderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {'detail': 'Conversations are accessed via /api/leads/{id}/messages/'}
        )


class LeadMessagesView(APIView):
    """
    GET  /api/conversations/leads/{lead_id}/messages/
         Returns message history for a lead (college side).
    POST /api/conversations/leads/{lead_id}/messages/
         Sends a message from college user to student via WhatsApp.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, lead_id):
        from apps.leads.models import Lead, LeadAllocation
        from apps.conversations.models import Message

        try:
            Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=404)

        if not request.user.is_superuser:
            has_allocation = LeadAllocation.objects.filter(
                lead_id=lead_id, tenant=request.user.tenant
            ).exists()
            if not has_allocation:
                return Response({'error': 'Access denied'}, status=403)

        messages = Message.objects.filter(
            lead_id=lead_id
        ).order_by('created_at').values(
            'id', 'role', 'content', 'created_at', 'channel', 'media_url'
        )

        conv_messages = Message.objects.filter(
            conversation__lead__id=lead_id
        ).order_by('created_at').values(
            'id', 'role', 'content', 'created_at', 'channel', 'media_url'
        )

        combined = list(messages) + list(conv_messages)
        combined.sort(key=lambda m: m['created_at'])

        return Response({'results': combined})

    def post(self, request, lead_id):
        from apps.leads.models import Lead, LeadAllocation
        from apps.conversations.models import Message

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'content is required'}, status=400)

        try:
            lead = Lead.objects.select_related('student').get(id=lead_id)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=404)

        if not request.user.is_superuser:
            has_allocation = LeadAllocation.objects.filter(
                lead_id=lead_id, tenant=request.user.tenant
            ).exists()
            if not has_allocation:
                return Response({'error': 'Access denied'}, status=403)

        message = Message.objects.create(
            lead=lead,
            sender_tenant=request.user.tenant,
            sender_user=request.user,
            role='human_agent',
            content=content,
            channel='whatsapp',
        )

        student_phone = None
        try:
            student_phone = lead.student.get_phone()
        except Exception:
            pass

        if student_phone:
            try:
                from services.communications.whatsapp import WhatsAppHandler
                WhatsAppHandler().send_message(student_phone, content)
            except Exception as e:
                logger.warning(f'WhatsApp forward failed for lead {lead_id}: {e}')

        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            group_name = f'lead_{lead_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message.id),
                        'role': 'human_agent',
                        'content': content,
                        'created_at': message.created_at.isoformat(),
                        'sender': str(request.user.id),
                    },
                }
            )
        except Exception as e:
            logger.warning(f'WebSocket broadcast failed for lead {lead_id}: {e}')

        return Response({
            'id': str(message.id),
            'role': 'human_agent',
            'content': content,
            'created_at': message.created_at.isoformat(),
        }, status=201)
