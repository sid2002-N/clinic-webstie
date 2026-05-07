import hashlib
import secrets
import pyotp
import qrcode
import io
import base64
from django.utils.text import slugify
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from apps.tenants.models import Tenant
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, UserCreateSerializer
from .models import User


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        college_name = request.data.get('college_name', '').strip()
        tenant_type = request.data.get('tenant_type', 'college')
        full_name = request.data.get('full_name', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not all([college_name, full_name, email, password]):
            return Response(
                {'detail': 'college_name, full_name, email, and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        base_slug = slugify(college_name)
        slug = base_slug
        counter = 1
        while Tenant.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        tenant = Tenant.objects.create(
            name=college_name,
            slug=slug,
            tenant_type=tenant_type if tenant_type in ('college', 'agency') else 'college',
            contact_email=email,
        )

        role = 'college_admin' if tenant.tenant_type == 'college' else 'agency_admin'
        serializer = UserCreateSerializer(data={
            'email': email,
            'full_name': full_name,
            'role': role,
            'tenant_id': str(tenant.id),
            'phone': '',
            'password': password,
        })
        if not serializer.is_valid():
            tenant.delete()
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        user.refresh_from_db()
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class TeamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)
        members = User.objects.filter(tenant=tenant).order_by('created_at')
        return Response([{
            'id': str(m.id),
            'full_name': m.full_name,
            'email': m.email,
            'role': m.role,
            'is_active': m.is_active,
            'date_joined': m.created_at.isoformat(),
        } for m in members])

    def post(self, request):
        if request.user.role not in ('superadmin', 'college_admin', 'agency_admin'):
            return Response({'detail': 'Only admins can invite team members.'}, status=403)
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)

        email = request.data.get('email', '').strip().lower()
        full_name = request.data.get('full_name', '').strip()
        role = request.data.get('role', 'college_staff')

        if not email:
            return Response({'detail': 'Email is required.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'A user with this email already exists.'}, status=400)

        allowed_roles = ('college_admin', 'college_staff', 'college_user', 'agency_admin', 'agency_user')
        if role not in allowed_roles:
            role = 'college_staff'

        temp_password = secrets.token_urlsafe(12)
        user = User.objects.create_user(
            email=email,
            full_name=full_name or email,
            role=role,
            tenant=tenant,
            password=temp_password,
        )
        return Response({
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
            'temp_password': temp_password,
        }, status=201)


class TenantSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)
        return Response({
            'college_name': tenant.name,
            'contact_email': tenant.contact_email,
            'whatsapp_number': tenant.contact_phone,
            'address': tenant.address,
            'website': tenant.website,
            'tenant_type': tenant.tenant_type,
            'plan': tenant.plan,
        })

    def patch(self, request):
        tenant = request.user.tenant
        if not tenant:
            return Response({'detail': 'No tenant.'}, status=404)
        if request.user.role not in ('superadmin', 'college_admin', 'agency_admin'):
            return Response({'detail': 'Only admins can update settings.'}, status=403)

        if 'college_name' in request.data and request.data['college_name']:
            tenant.name = request.data['college_name'].strip()
        if 'contact_email' in request.data and request.data['contact_email']:
            tenant.contact_email = request.data['contact_email'].strip()
        if 'whatsapp_number' in request.data:
            tenant.contact_phone = request.data['whatsapp_number']
        if 'address' in request.data:
            tenant.address = request.data['address']
        if 'website' in request.data:
            tenant.website = request.data['website']
        tenant.save()

        return Response({
            'college_name': tenant.name,
            'contact_email': tenant.contact_email,
            'whatsapp_number': tenant.contact_phone,
            'address': tenant.address,
            'website': tenant.website,
        })


class TwoFactorSetupView(APIView):
    """
    GET  /api/auth/2fa/setup/  — generate a TOTP secret + QR code PNG (base64)
    POST /api/auth/2fa/setup/  — confirm setup with a valid TOTP code
    DELETE /api/auth/2fa/setup/ — disable 2FA
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name='EduLeads Kerala',
        )
        img = qrcode.make(provisioning_uri)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_b64 = base64.b64encode(buffer.getvalue()).decode()

        request.session['pending_totp_secret'] = secret
        return Response({
            'secret': secret,
            'qr_code': f'data:image/png;base64,{qr_b64}',
            'provisioning_uri': provisioning_uri,
        })

    def post(self, request):
        user = request.user
        code = request.data.get('code', '').strip()
        secret = request.session.get('pending_totp_secret') or request.data.get('secret', '')

        if not secret or not code:
            return Response({'detail': 'secret and code are required.'}, status=400)

        totp = pyotp.TOTP(secret)
        if not totp.verify(code, valid_window=1):
            return Response({'detail': 'Invalid TOTP code. Please try again.'}, status=400)

        user.totp_secret = secret
        user.totp_enabled = True
        user.save(update_fields=['totp_secret', 'totp_enabled'])
        request.session.pop('pending_totp_secret', None)
        return Response({'detail': '2FA enabled successfully.'})

    def delete(self, request):
        user = request.user
        code = request.data.get('code', '').strip()
        if not user.totp_enabled:
            return Response({'detail': '2FA is not enabled.'}, status=400)
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code, valid_window=1):
            return Response({'detail': 'Invalid TOTP code.'}, status=400)
        user.totp_secret = ''
        user.totp_enabled = False
        user.save(update_fields=['totp_secret', 'totp_enabled'])
        return Response({'detail': '2FA disabled.'})


class TwoFactorVerifyView(APIView):
    """
    POST /api/auth/2fa/verify/
    Body: {"user_id": "...", "code": "123456"}
    Returns fresh JWT pair after successful TOTP verification.
    Used in two-step login flow when user has 2FA enabled.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id', '')
        code = request.data.get('code', '').strip()

        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid request.'}, status=400)

        if not user.totp_enabled:
            return Response({'detail': '2FA is not enabled for this account.'}, status=400)

        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code, valid_window=1):
            return Response({'detail': 'Invalid or expired code.'}, status=400)

        refresh = CustomTokenObtainPairSerializer.get_token(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })
