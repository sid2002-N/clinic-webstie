import hashlib
import json
import logging

logger = logging.getLogger(__name__)


def _compute_payload_hash(action: str, resource_type: str, resource_id: str, metadata: dict) -> str:
    payload = json.dumps({
        'action': action,
        'resource_type': resource_type,
        'resource_id': resource_id,
        'metadata': metadata,
    }, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


class AuditLogger:
    """
    Thin wrapper around AuditLog model for consistent audit logging.
    Computes a SHA-256 payload_hash for tamper detection.
    Silently swallows errors so it never breaks business logic.
    """

    @staticmethod
    def log(
        action: str,
        resource_type: str = '',
        resource_id: str = '',
        tenant=None,
        user=None,
        ip_address: str = None,
        metadata: dict = None,
    ):
        try:
            from apps.tenants.models import AuditLog
            meta = metadata or {}
            payload_hash = _compute_payload_hash(action, resource_type, resource_id or '', meta)
            AuditLog.objects.create(
                tenant=tenant,
                user=user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id or '',
                ip_address=ip_address,
                metadata=meta,
                payload_hash=payload_hash,
            )
        except Exception as e:
            logger.error(f'AuditLogger.log failed for action={action}: {e}')
