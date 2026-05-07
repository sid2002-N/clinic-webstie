import uuid
from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings


def get_fernet():
    key = getattr(settings, 'FERNET_KEY', Fernet.generate_key())
    return Fernet(key)


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    whatsapp_number = models.CharField(max_length=20, unique=True)
    phone_encrypted = models.BinaryField(null=True, blank=True)
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    location = models.CharField(max_length=255, blank=True)

    lang = models.CharField(max_length=10, default='ml', blank=True)
    consent_given = models.BooleanField(default=False)
    consent_timestamp = models.DateTimeField(null=True, blank=True)
    consent_channel = models.CharField(max_length=50, blank=True)
    consent_ip = models.GenericIPAddressField(null=True, blank=True)

    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'

    def __str__(self):
        return f"{self.full_name or self.whatsapp_number}"

    def set_phone(self, phone_number: str):
        f = get_fernet()
        self.phone_encrypted = f.encrypt(phone_number.encode())

    def get_phone(self) -> str:
        if not self.phone_encrypted:
            return self.whatsapp_number
        try:
            f = get_fernet()
            return f.decrypt(bytes(self.phone_encrypted)).decode()
        except Exception:
            return self.whatsapp_number
