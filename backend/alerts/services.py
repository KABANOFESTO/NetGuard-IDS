import logging
import threading

from django.conf import settings
from django.core.mail import send_mail
from django.db import close_old_connections, transaction

from AuditLog.audit_log_utils import log_action

from .models import IntrusionAlert

logger = logging.getLogger(__name__)


def _log_alert_email_failure(alert, error):
    logger.warning("Failed to send intrusion alert email for alert %s: %s", alert.id, error)
    log_action(
        None,
        "EMAIL_SEND_FAILURE",
        target_user=alert.user,
        additional_data={
            "email_type": "intrusion_alert",
            "alert_id": alert.id,
            "error": str(error),
        },
    )


def _send_alert_email(alert, admin_emails):
    try:
        sent_count = send_mail(
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
        if sent_count == 0:
            _log_alert_email_failure(alert, "Email backend accepted the request but sent zero messages.")
        return sent_count > 0
    except Exception as exc:
        _log_alert_email_failure(alert, exc)
        return False
    finally:
        close_old_connections()


def notify_admins_of_alert(alert):
    if not getattr(settings, "ALERT_EMAIL_NOTIFICATIONS_ENABLED", False):
        return False

    if not settings.DEFAULT_FROM_EMAIL:
        return False

    admin_emails = list(
        alert.__class__._meta.apps.get_model("authapi", "User")
        .objects.filter(role="Admin", status="Active")
        .exclude(email="")
        .values_list("email", flat=True)
    )
    if not admin_emails:
        return False

    if not getattr(settings, "ALERT_EMAIL_ASYNC", True):
        return _send_alert_email(alert, admin_emails)

    def send_after_commit():
        thread = threading.Thread(
            target=_send_alert_email,
            args=(alert, admin_emails),
            name=f"netguard-alert-email-{alert.id}",
            daemon=True,
        )
        thread.start()

    transaction.on_commit(send_after_commit)
    return True


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
