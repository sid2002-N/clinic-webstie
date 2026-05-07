import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class LeadChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time in-app messaging on a lead.

    URL pattern: /ws/leads/{lead_id}/

    Authentication: JWT token as query param ?token=<access_token>

    Groups:
      lead_{lead_id}     — all watchers of this lead
      tenant_{tenant_id} — all users of the tenant (for broadcast)
    """

    async def connect(self):
        self.lead_id = self.scope['url_route']['kwargs']['lead_id']
        self.lead_group = f'lead_{self.lead_id}'
        self.user = None

        token = self._get_token_from_scope()
        if not token:
            logger.warning('WS: no token — rejecting')
            await self.close(code=4001)
            return

        user = await self._authenticate(token)
        if not user:
            logger.warning('WS: invalid token — rejecting')
            await self.close(code=4003)
            return

        has_access = await self._check_lead_access(user, self.lead_id)
        if not has_access:
            logger.warning(f'WS: user {user.id} has no access to lead {self.lead_id}')
            await self.close(code=4004)
            return

        self.user = user
        await self.channel_layer.group_add(self.lead_group, self.channel_name)

        if hasattr(user, 'tenant') and user.tenant:
            tenant_group = f'tenant_{user.tenant_id}'
            await self.channel_layer.group_add(tenant_group, self.channel_name)

        await self.accept()
        logger.info(f'WS: user {user.id} connected to lead {self.lead_id}')

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.lead_group, self.channel_name)
        if self.user and hasattr(self.user, 'tenant') and self.user.tenant:
            await self.channel_layer.group_discard(
                f'tenant_{self.user.tenant_id}', self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(json.dumps({'error': 'Invalid JSON'}))
            return

        msg_type = data.get('type', 'message')

        if msg_type == 'message':
            content = data.get('content', '').strip()
            if not content:
                return

            message = await self._save_message(content)
            await self._forward_to_whatsapp(content)

            await self.channel_layer.group_send(
                self.lead_group,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message.id),
                        'role': 'human_agent',
                        'content': content,
                        'created_at': message.created_at.isoformat(),
                        'sender': str(self.user.id),
                        'sender_name': getattr(self.user, 'name',
                                               self.user.email),
                    },
                }
            )

        elif msg_type == 'ping':
            await self.send(json.dumps({'type': 'pong'}))

    async def chat_message(self, event):
        """Handler for group_send events of type 'chat_message'."""
        await self.send(json.dumps({
            'type': 'message',
            'message': event['message'],
        }))

    async def student_message(self, event):
        """Handler for inbound student messages broadcast from Celery."""
        await self.send(json.dumps({
            'type': 'student_message',
            'message': event['message'],
        }))

    def _get_token_from_scope(self) -> str:
        query_string = self.scope.get('query_string', b'').decode()
        for part in query_string.split('&'):
            if part.startswith('token='):
                return part.split('=', 1)[1]
        return ''

    @database_sync_to_async
    def _authenticate(self, token: str):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from apps.users.models import User
            access = AccessToken(token)
            user_id = access.get('user_id')
            return User.objects.select_related('tenant').get(id=user_id)
        except Exception as e:
            logger.warning(f'WS auth failed: {e}')
            return None

    @database_sync_to_async
    def _check_lead_access(self, user, lead_id: str) -> bool:
        if user.is_superuser:
            return True
        from apps.leads.models import LeadAllocation
        return LeadAllocation.objects.filter(
            lead_id=lead_id,
            tenant=user.tenant,
        ).exists()

    @database_sync_to_async
    def _save_message(self, content: str):
        from apps.conversations.models import Message
        from apps.leads.models import Lead
        lead = Lead.objects.get(id=self.lead_id)
        return Message.objects.create(
            lead=lead,
            sender_tenant=self.user.tenant,
            sender_user=self.user,
            role='human_agent',
            content=content,
            channel='web',
        )

    @database_sync_to_async
    def _forward_to_whatsapp(self, content: str):
        try:
            from apps.leads.models import Lead
            lead = Lead.objects.select_related('student').get(id=self.lead_id)
            student_phone = lead.student.get_phone()
            if student_phone:
                from services.communications.whatsapp import WhatsAppHandler
                WhatsAppHandler().send_message(student_phone, content)
        except Exception as e:
            logger.warning(f'WS WhatsApp forward failed: {e}')
