from django.utils import timezone

from AuditLog.audit_log_utils import log_action
from devices.models import Device
from monitoring.models import NetworkActivity

from .models import BlockedEntity


def block_entity(*, request=None, user=None, device=None, reason, notes="", expires_at=None):
    block, created = BlockedEntity.objects.update_or_create(
        user=user,
        device=device,
        is_active=True,
        defaults={
            "reason": reason,
            "blocked_by": getattr(request, "user", None) if request and request.user.is_authenticated else None,
            "notes": notes,
            "expires_at": expires_at,
            "unblocked_at": None,
        },
    )

    if device is not None:
        Device.objects.filter(pk=device.pk).update(status="blocked", blocked_at=timezone.now())

    if user is not None and user.status == "Active":
        user.deactivate()

    if user is not None or device is not None:
        NetworkActivity.objects.create(
            user=user,
            device=device,
            activity_type="restricted_access",
            description=notes or "Access has been blocked by an administrator.",
            ip_address=getattr(device, "ip_address", None) or "127.0.0.1",
            outcome="blocked",
            destination="security:block",
            metadata={
                "reason": reason,
                "block_id": block.id,
                "source": "admin_action",
            },
            data_usage_mb=0,
            is_suspicious=True,
        )

    log_action(
        request,
        "SECURITY_BLOCK",
        target_user=user,
        additional_data={
            "block_id": block.id,
            "created": created,
            "device_id": getattr(device, "id", None),
            "reason": reason,
        },
    )
    return block, created


def unblock_entity(block, request=None):
    block.is_active = False
    block.unblocked_at = timezone.now()
    block.save(update_fields=["is_active", "unblocked_at"])

    if block.device_id:
        Device.objects.filter(pk=block.device_id).update(status="active", blocked_at=None)

    if block.user_id and block.user.status != "Active":
        block.user.activate()

    log_action(
        request,
        "SECURITY_UNBLOCK",
        target_user=block.user,
        additional_data={
            "block_id": block.id,
            "device_id": block.device_id,
        },
    )
    return block
