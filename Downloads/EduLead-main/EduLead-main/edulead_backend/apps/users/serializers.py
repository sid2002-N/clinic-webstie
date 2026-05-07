from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        if user.tenant_id and user.tenant:
            token['tenant_id'] = str(user.tenant_id)
            token['tenant_name'] = user.tenant.name
            token['plan'] = user.tenant.plan
        else:
            token['tenant_id'] = None
            token['tenant_name'] = None
            token['plan'] = None
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'tenant_id', 'phone', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    # OWASP A07 — min_length is a first gate; full Django validators run in create()
    password = serializers.CharField(write_only=True, min_length=10)
    tenant_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'role', 'tenant_id', 'phone', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        tenant_id = validated_data.pop('tenant_id', None)

        user = User(**validated_data)
        if tenant_id:
            user.tenant_id = tenant_id

        # OWASP A07 — Identification and Authentication Failures
        # Run the full Django password validation suite (common passwords, similarity, etc.)
        try:
            validate_password(password, user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})

        user.set_password(password)
        user.save()
        return user
