from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from alerts.models import IntrusionAlert
from alerts.services import create_alert
from security.services import block_entity

from .models import NetworkActivity

FAILED_LOGIN_THRESHOLD = 5
FAILED_LOGIN_BLOCK_THRESHOLD = 8
ABNORMAL_USAGE_THRESHOLD_MB = 1024
ALERT_DEDUPLICATION_WINDOW_MINUTES = 30


def create_network_activity(
    *,
    request=None,
    user=None,
    device=None,
    activity_type,
    description,
    ip_address,
    outcome="success",
    data_usage_mb=0,
    destination="",
    metadata=None,
    is_suspicious=False,
):
    activity = NetworkActivity.objects.create(
        user=user,
        device=device,
        activity_type=activity_type,
        description=description,
        ip_address=ip_address,
        outcome=outcome,
        destination=destination,
        metadata=metadata or {},
        data_usage_mb=data_usage_mb,
        is_suspicious=is_suspicious,
    )

    generated_alerts = analyze_network_activity(activity, request=request)
    return activity, generated_alerts


def analyze_network_activity(activity, request=None):
    alerts = []
    suspicious = activity.is_suspicious
    dedupe_since = timezone.now() - timedelta(minutes=ALERT_DEDUPLICATION_WINDOW_MINUTES)

    if activity.device and (not activity.device.is_registered or activity.device.status == "unknown"):
        suspicious = True
        if activity.device.status != "blocked":
            activity.device.status = "suspicious"
            activity.device.save(update_fields=["status"])
        queryset = IntrusionAlert.objects.filter(
            alert_type="unknown_device",
            device=activity.device,
            status__in=["pending", "investigating"],
            detected_at__gte=dedupe_since,
        )
        alert, created = create_alert(
            alert_type="unknown_device",
            message=f"Unknown or unregistered device detected: {activity.device.device_name}",
            severity="high",
            user=activity.user,
            device=activity.device,
            source_activity=activity,
            metadata={"ip_address": activity.ip_address},
            request=request,
            dedupe_window_queryset=queryset,
        )
        if created:
            alerts.append(alert)

    if activity.activity_type in {"login", "login_attempt"} and activity.outcome == "failed":
        suspicious = True
        window_start = timezone.now() - timedelta(minutes=15)
        recent_failures = NetworkActivity.objects.filter(
            ip_address=activity.ip_address,
            activity_type__in=["login", "login_attempt"],
            outcome="failed",
            timestamp__gte=window_start,
        )
        if activity.user_id:
            recent_failures = recent_failures.filter(Q(user=activity.user) | Q(user__isnull=True))
        failure_count = recent_failures.count()
        if failure_count >= FAILED_LOGIN_THRESHOLD:
            queryset = IntrusionAlert.objects.filter(
                alert_type="multiple_login_attempts",
                user=activity.user,
                device=activity.device,
                status__in=["pending", "investigating"],
                detected_at__gte=dedupe_since,
            )
            alert, created = create_alert(
                alert_type="multiple_login_attempts",
                message=f"Multiple failed login attempts detected from IP {activity.ip_address}.",
                severity="critical" if failure_count >= FAILED_LOGIN_BLOCK_THRESHOLD else "high",
                user=activity.user,
                device=activity.device,
                source_activity=activity,
                metadata={"failed_attempts": failure_count, "ip_address": activity.ip_address},
                request=request,
                dedupe_window_queryset=queryset,
            )
            if created:
                alerts.append(alert)
            if failure_count >= FAILED_LOGIN_BLOCK_THRESHOLD and (activity.user or activity.device):
                block_entity(
                    request=request,
                    user=activity.user,
                    device=activity.device,
                    reason="intrusion",
                    notes=f"Automatically blocked after {failure_count} failed login attempts.",
                )

    if activity.activity_type == "restricted_access" or activity.outcome == "restricted":
        suspicious = True
        queryset = IntrusionAlert.objects.filter(
            alert_type="unauthorized_access",
            user=activity.user,
            device=activity.device,
            status__in=["pending", "investigating"],
            detected_at__gte=dedupe_since,
        )
        alert, created = create_alert(
            alert_type="unauthorized_access",
            message=f"Restricted resource access attempt detected for {activity.ip_address}.",
            severity="high",
            user=activity.user,
            device=activity.device,
            source_activity=activity,
            metadata={"destination": activity.destination},
            request=request,
            dedupe_window_queryset=queryset,
        )
        if created:
            alerts.append(alert)

    if activity.data_usage_mb >= ABNORMAL_USAGE_THRESHOLD_MB:
        suspicious = True
        queryset = IntrusionAlert.objects.filter(
            alert_type="abnormal_activity",
            user=activity.user,
            device=activity.device,
            status__in=["pending", "investigating"],
            detected_at__gte=dedupe_since,
        )
        alert, created = create_alert(
            alert_type="abnormal_activity",
            message=f"Abnormal data usage detected: {activity.data_usage_mb} MB from {activity.ip_address}.",
            severity="medium" if activity.data_usage_mb < ABNORMAL_USAGE_THRESHOLD_MB * 2 else "high",
            user=activity.user,
            device=activity.device,
            source_activity=activity,
            metadata={"data_usage_mb": activity.data_usage_mb},
            request=request,
            dedupe_window_queryset=queryset,
        )
        if created:
            alerts.append(alert)

    if suspicious and not activity.is_suspicious:
        activity.is_suspicious = True
        activity.save(update_fields=["is_suspicious"])

    return alerts
