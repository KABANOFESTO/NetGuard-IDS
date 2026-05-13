from django.conf import settings
from django.core.mail import send_mail

from AuditLog.audit_log_utils import log_action

from .models import IntrusionAlert


def notify_admins_of_alert(alert):
    admin_emails = list(
        alert.__class__._meta.apps.get_model("authapi", "User")
        .objects.filter(role="Admin", status="Active")
        .exclude(email="")
        .values_list("email", flat=True)
    )
    if not admin_emails:
        return False

    try:
        send_mail(
            subject=f"[NetGuard] {alert.get_severity_display()} intrusion alert",
            message=(
                f"Alert type: {alert.get_alert_type_display()}\n"
                f"Severity: {alert.get_severity_display()}\n"
                f"Status: {alert.get_status_display()}\n"
                f"Message: {alert.message}\n"
                f"Detected at: {alert.detected_at}\n"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=False,
        )
        return True
    except Exception as exc:
        log_action(
            None,
            "EMAIL_SEND_FAILURE",
            target_user=alert.user,
            additional_data={
                "email_type": "intrusion_alert",
                "alert_id": alert.id,
                "error": str(exc),
            },
        )
        return False


def create_alert(
    *,
    alert_type,
    message,
    severity="medium",
    user=None,
    device=None,
    source_activity=None,
    assigned_to=None,
    metadata=None,
    request=None,
    dedupe_window_queryset=None,
):
    queryset = dedupe_window_queryset
    if queryset is not None and queryset.exists():
        return queryset.first(), False

    alert = IntrusionAlert.objects.create(
        user=user,
        device=device,
        source_activity=source_activity,
        assigned_to=assigned_to,
        alert_type=alert_type,
        message=message,
        severity=severity,
        metadata=metadata or {},
    )
    notify_admins_of_alert(alert)
    log_action(
        request,
        "ALERT_CREATE",
        target_user=user,
        additional_data={
            "alert_id": alert.id,
            "alert_type": alert_type,
            "severity": severity,
            "device_id": getattr(device, "id", None),
        },
    )
    return alert, True
