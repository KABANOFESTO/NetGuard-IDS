from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from AuditLog.audit_log_utils import log_action
from authapi.permissions import IsAdmin
from security.services import block_entity

from .models import Device
from .serializers import DeviceSerializer, DeviceStatusSerializer


class DeviceListCreateView(generics.ListCreateAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Device.objects.all().select_related("owner")

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role != "Admin":
            queryset = queryset.filter(owner=user)

        status_filter = self.request.query_params.get("status")
        registered = self.request.query_params.get("is_registered")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if registered in {"true", "false"}:
            queryset = queryset.filter(is_registered=(registered == "true"))
        return queryset

    def perform_create(self, serializer):
        owner = serializer.validated_data.get("owner") if self.request.user.role == "Admin" else self.request.user
        device = serializer.save(owner=owner)
        log_action(
            self.request,
            "DEVICE_REGISTER",
            target_user=owner,
            additional_data={"device_id": device.id, "mac_address": device.mac_address},
        )


class DeviceDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Device.objects.all().select_related("owner")

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role != "Admin":
            queryset = queryset.filter(owner=self.request.user)
        return queryset

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        device = self.get_object()
        log_action(
            request,
            "DEVICE_UPDATE",
            target_user=device.owner,
            additional_data={"device_id": device.id, "status": device.status},
        )
        return response


class DeviceStatusUpdateView(generics.UpdateAPIView):
    serializer_class = DeviceStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Device.objects.all()

    def patch(self, request, *args, **kwargs):
        response = self.partial_update(request, *args, **kwargs)
        device = self.get_object()
        if device.status == "blocked" and device.blocked_at is None:
            device.blocked_at = timezone.now()
            device.save(update_fields=["blocked_at"])
        elif device.status != "blocked" and device.blocked_at is not None:
            device.blocked_at = None
            device.save(update_fields=["blocked_at"])
        log_action(
            request,
            "DEVICE_STATUS_CHANGE",
            target_user=device.owner,
            additional_data={"device_id": device.id, "status": device.status},
        )
        return response


class DeviceBlockView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            device = Device.objects.select_related("owner").get(pk=pk)
        except Device.DoesNotExist:
            return Response({"error": "Device not found."}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get("notes", "")
        block, _ = block_entity(
            request=request,
            user=None,
            device=device,
            reason=request.data.get("reason", "manual_block"),
            notes=notes,
        )
        return Response({"message": "Device blocked successfully.", "block_id": block.id}, status=status.HTTP_200_OK)


class DeviceSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        queryset = Device.objects.all()
        return Response(
            {
                "total_devices": queryset.count(),
                "active_devices": queryset.filter(status="active").count(),
                "blocked_devices": queryset.filter(status="blocked").count(),
                "suspicious_devices": queryset.filter(status="suspicious").count(),
                "unknown_devices": queryset.filter(status="unknown").count(),
                "unregistered_devices": queryset.filter(is_registered=False).count(),
            },
            status=status.HTTP_200_OK,
        )
