from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from AuditLog.audit_log_utils import log_action
from authapi.permissions import IsAdmin

from .models import IntrusionAlert
from .serializers import IntrusionAlertSerializer
from .services import create_alert


class IntrusionAlertListCreateView(generics.ListCreateAPIView):
    serializer_class = IntrusionAlertSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = IntrusionAlert.objects.all().select_related("user", "device")

    def get_queryset(self):
        queryset = super().get_queryset().order_by("-detected_at")
        status_filter = self.request.query_params.get("status")
        severity_filter = self.request.query_params.get("severity")
        alert_type_filter = self.request.query_params.get("alert_type")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if severity_filter:
            queryset = queryset.filter(severity=severity_filter)
        if alert_type_filter:
            queryset = queryset.filter(alert_type=alert_type_filter)
        assigned_to = self.request.query_params.get("assigned_to")
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        return queryset

    def perform_create(self, serializer):
        alert, _created = create_alert(
            alert_type=serializer.validated_data["alert_type"],
            message=serializer.validated_data["message"],
            severity=serializer.validated_data.get("severity", "medium"),
            user=serializer.validated_data.get("user"),
            device=serializer.validated_data.get("device"),
            source_activity=serializer.validated_data.get("source_activity"),
            assigned_to=serializer.validated_data.get("assigned_to"),
            metadata=serializer.validated_data.get("metadata", {}),
            request=self.request,
        )
        serializer.instance = alert


class IntrusionAlertDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = IntrusionAlertSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = IntrusionAlert.objects.all().select_related("user", "device")

    def perform_update(self, serializer):
        previous_status = self.get_object().status
        updated_alert = serializer.save()

        if (
            updated_alert.status == "resolved"
            and previous_status != "resolved"
            and updated_alert.resolved_at is None
        ):
            updated_alert.resolved_at = timezone.now()
            updated_alert.save(update_fields=["resolved_at"])
        elif updated_alert.status != "resolved" and updated_alert.resolved_at is not None:
            updated_alert.resolved_at = None
            updated_alert.save(update_fields=["resolved_at"])

        log_action(
            self.request,
            "ALERT_UPDATE",
            target_user=updated_alert.user,
            additional_data={
                "alert_id": updated_alert.id,
                "previous_status": previous_status,
                "new_status": updated_alert.status,
                "severity": updated_alert.severity,
            },
        )


class IntrusionAlertSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        queryset = IntrusionAlert.objects.all()
        return Response(
            {
                "total_alerts": queryset.count(),
                "pending_alerts": queryset.filter(status="pending").count(),
                "critical_alerts": queryset.filter(severity="critical").count(),
                "unknown_device_alerts": queryset.filter(alert_type="unknown_device").count(),
            },
            status=status.HTTP_200_OK,
        )
