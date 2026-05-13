from datetime import timedelta

from django.db.models import Count, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from AuditLog.audit_log_utils import log_action
from alerts.models import IntrusionAlert
from authapi.permissions import IsAdmin
from devices.models import Device

from .models import NetworkActivity
from .serializers import NetworkActivitySerializer
from .services import create_network_activity


class NetworkActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = NetworkActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NetworkActivity.objects.all().select_related("user", "device")

    def _get_request_ip(self):
        x_forwarded_for = self.request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return self.request.META.get("REMOTE_ADDR") or "127.0.0.1"

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role != "Admin":
            queryset = queryset.filter(user=user)

        suspicious = self.request.query_params.get("is_suspicious")
        activity_type = self.request.query_params.get("activity_type")
        outcome = self.request.query_params.get("outcome")
        if suspicious in {"true", "false"}:
            queryset = queryset.filter(is_suspicious=(suspicious == "true"))
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        if outcome:
            queryset = queryset.filter(outcome=outcome)
        return queryset

    def perform_create(self, serializer):
        activity, _alerts = create_network_activity(
            request=self.request,
            user=serializer.validated_data.get("user") or self.request.user,
            device=serializer.validated_data.get("device"),
            activity_type=serializer.validated_data["activity_type"],
            description=serializer.validated_data["description"],
            ip_address=serializer.validated_data.get("ip_address") or self._get_request_ip(),
            outcome=serializer.validated_data.get("outcome", "success"),
            data_usage_mb=serializer.validated_data.get("data_usage_mb", 0),
            destination=serializer.validated_data.get("destination", ""),
            metadata=serializer.validated_data.get("metadata", {}),
        )
        serializer.instance = activity
        log_action(
            self.request,
            "NETWORK_ACTIVITY_RECORDED",
            target_user=activity.user,
            additional_data={"activity_id": activity.id, "activity_type": activity.activity_type},
        )


class MonitoringDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        last_24h = timezone.now() - timedelta(hours=24)
        activities = NetworkActivity.objects.filter(timestamp__gte=last_24h)
        alerts = IntrusionAlert.objects.filter(detected_at__gte=last_24h)
        devices = Device.objects.all()

        log_action(request, "DASHBOARD_VIEW", additional_data={"scope": "monitoring_dashboard"})

        return Response(
            {
                "time_window": "24h",
                "activities": {
                    "total": activities.count(),
                    "suspicious": activities.filter(is_suspicious=True).count(),
                    "failed_logins": activities.filter(
                        activity_type__in=["login", "login_attempt"], outcome="failed"
                    ).count(),
                    "data_usage_mb": activities.aggregate(total=Coalesce(Sum("data_usage_mb"), 0.0))["total"],
                },
                "alerts": {
                    "total": alerts.count(),
                    "critical": alerts.filter(severity="critical").count(),
                    "pending": alerts.filter(status="pending").count(),
                    "investigating": alerts.filter(status="investigating").count(),
                },
                "devices": {
                    "total": devices.count(),
                    "blocked": devices.filter(status="blocked").count(),
                    "unknown": devices.filter(status="unknown").count(),
                },
                "top_activity_types": list(
                    activities.values("activity_type").annotate(total=Count("id")).order_by("-total")[:5]
                ),
            },
            status=status.HTTP_200_OK,
        )


class MonitoringReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        days = int(request.query_params.get("days", 7))
        since = timezone.now() - timedelta(days=days)
        activities = NetworkActivity.objects.filter(timestamp__gte=since)
        alerts = IntrusionAlert.objects.filter(detected_at__gte=since)

        log_action(request, "REPORT_VIEW", additional_data={"scope": "monitoring_report", "days": days})

        return Response(
            {
                "period_days": days,
                "activity_summary": {
                    "total_activities": activities.count(),
                    "suspicious_activities": activities.filter(is_suspicious=True).count(),
                    "total_data_usage_mb": activities.aggregate(total=Coalesce(Sum("data_usage_mb"), 0.0))["total"],
                },
                "alert_summary": {
                    "total_alerts": alerts.count(),
                    "resolved_alerts": alerts.filter(status="resolved").count(),
                    "unresolved_alerts": alerts.exclude(status__in=["resolved", "ignored"]).count(),
                },
                "top_users": list(
                    activities.exclude(user__isnull=True)
                    .values("user__id", "user__email")
                    .annotate(total=Count("id"))
                    .order_by("-total")[:10]
                ),
                "top_devices": list(
                    activities.exclude(device__isnull=True)
                    .values("device__id", "device__device_name")
                    .annotate(total=Count("id"))
                    .order_by("-total")[:10]
                ),
            },
            status=status.HTTP_200_OK,
        )
