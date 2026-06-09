from django.utils import timezone
from django.db.models import Q

from AuditLog.audit_log_utils import log_action
from devices.models import Device
from monitoring.models import NetworkActivity

from .models import BlockedEntity, NetworkEdgeActionLog, NetworkEdgeProfile
from .network_edge import NetworkEdgeError, NetworkEdgeResult, get_edge_client


def get_default_edge_profile():
    return NetworkEdgeProfile.objects.filter(enabled=True, is_default=True).first() or NetworkEdgeProfile.objects.filter(enabled=True).first()


def _resolve_target_data(user=None, device=None, mac_address=None, ip_address=None):
    resolved_mac = mac_address or getattr(device, "mac_address", "") or ""
    resolved_ip = ip_address or getattr(device, "ip_address", None)
    if resolved_ip is None and user is not None:
        resolved_ip = "127.0.0.1"
    return resolved_mac, resolved_ip


def perform_network_edge_action(
    *,
    action,
    request=None,
    profile=None,
    user=None,
    device=None,
    mac_address="",
    ip_address=None,
    reason="",
    notes="",
    session_id="",
    disconnect_all_sessions=False,
):
    profile = profile or get_default_edge_profile()
    resolved_mac, resolved_ip = _resolve_target_data(user=user, device=device, mac_address=mac_address, ip_address=ip_address)
    actor = getattr(request, "user", None) if request and getattr(request, "user", None) and request.user.is_authenticated else None

    if profile is None:
        log_entry = NetworkEdgeActionLog.objects.create(
            profile=None,
            action=action,
            user=user,
            device=device,
            mac_address=resolved_mac,
            ip_address=resolved_ip,
            success=False,
            status_code="not_configured",
            message="No network-edge profile is configured.",
            response_payload={"reason": "provider_not_configured"},
            performed_by=actor,
        )
        return NetworkEdgeResult(
            success=False,
            status_code="not_configured",
            message=log_entry.message,
            payload={"log_id": log_entry.id},
        )

    client = get_edge_client(profile)
    payload = {
        "user_id": getattr(user, "id", None),
        "device_id": getattr(device, "id", None),
        "mac_address": resolved_mac,
        "ip_address": resolved_ip,
        "reason": reason,
        "notes": notes,
        "session_id": session_id,
        "disconnect_all_sessions": disconnect_all_sessions,
        "profile": profile.name,
        "provider_type": profile.provider_type,
    }

    endpoint_map = {
        "authorize": client.authorize_session,
        "revoke": client.revoke_session,
        "ban_mac": client.ban_mac,
        "unban_mac": client.unban_mac,
        "terminate_sessions": client.disconnect_sessions,
        "health_check": client.health_check,
    }

    try:
        status_code, response_payload = endpoint_map[action](payload if action != "health_check" else None)
        success = status_code < 400
        message = response_payload.get("message") if isinstance(response_payload, dict) else str(response_payload)
        log_entry = NetworkEdgeActionLog.objects.create(
            profile=profile,
            action=action,
            user=user,
            device=device,
            mac_address=resolved_mac,
            ip_address=resolved_ip,
            success=success,
            status_code=str(status_code),
            message=message or "Network-edge action completed.",
            response_payload=response_payload if isinstance(response_payload, dict) else {"raw": response_payload},
            performed_by=actor,
        )
        return NetworkEdgeResult(
            success=success,
            status_code=str(status_code),
            message=log_entry.message,
            payload={"log_id": log_entry.id, "response": response_payload},
        )
    except NetworkEdgeError as exc:
        log_entry = NetworkEdgeActionLog.objects.create(
            profile=profile,
            action=action,
            user=user,
            device=device,
            mac_address=resolved_mac,
            ip_address=resolved_ip,
            success=False,
            status_code="error",
            message=str(exc),
            response_payload={"error": str(exc)},
            performed_by=actor,
        )
        return NetworkEdgeResult(
            success=False,
            status_code="error",
            message=log_entry.message,
            payload={"log_id": log_entry.id, "error": str(exc)},
        )


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

    edge_result = perform_network_edge_action(
        action="ban_mac",
        request=request,
        user=user,
        device=device,
        reason=reason,
        notes=notes or "Access has been blocked by an administrator.",
    )
    if device is not None and edge_result.success:
        perform_network_edge_action(
            action="terminate_sessions",
            request=request,
            user=user,
            device=device,
            reason=reason,
            notes=notes or "Terminate active sessions after block.",
            disconnect_all_sessions=True,
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

    perform_network_edge_action(
        action="unban_mac",
        request=request,
        user=block.user,
        device=block.device,
        reason=block.reason,
        notes="Block removed by administrator.",
    )
    perform_network_edge_action(
        action="revoke",
        request=request,
        user=block.user,
        device=block.device,
        reason=block.reason,
        notes="Revoke captive portal restriction.",
    )

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
