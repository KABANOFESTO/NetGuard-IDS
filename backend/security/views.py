from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapi.models import User
from authapi.permissions import IsAdmin

from devices.models import Device

from .models import BlockedEntity, NetworkEdgeActionLog, NetworkEdgeProfile
from .serializers import (
    BlockedEntitySerializer,
    NetworkEdgeActionLogSerializer,
    NetworkEdgeActionSerializer,
    NetworkEdgeProfileSerializer,
)
from .services import block_entity, get_default_edge_profile, perform_network_edge_action, unblock_entity


class BlockedEntityListCreateView(generics.ListCreateAPIView):
    serializer_class = BlockedEntitySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = BlockedEntity.objects.all().select_related("user", "device", "blocked_by")

    def get_queryset(self):
        queryset = super().get_queryset()
        active_only = self.request.query_params.get("active")
        if active_only == "true":
            queryset = queryset.filter(is_active=True)
        if active_only == "false":
            queryset = queryset.filter(is_active=False)
        return queryset

    def perform_create(self, serializer):
        block, _created = block_entity(
            request=self.request,
            user=serializer.validated_data.get("user"),
            device=serializer.validated_data.get("device"),
            mac_address=serializer.validated_data.get("mac_address", ""),
            reason=serializer.validated_data["reason"],
            notes=serializer.validated_data.get("notes", ""),
            expires_at=serializer.validated_data.get("expires_at"),
        )
        serializer.instance = block


class BlockedEntityDetailView(generics.RetrieveAPIView):
    serializer_class = BlockedEntitySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = BlockedEntity.objects.all().select_related("user", "device", "blocked_by")


class UnblockEntityView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            block = BlockedEntity.objects.select_related("user", "device").get(pk=pk)
        except BlockedEntity.DoesNotExist:
            return Response({"error": "Blocked entity not found."}, status=status.HTTP_404_NOT_FOUND)

        if not block.is_active:
            return Response(
                {"message": "This block has already been removed.", "unblocked_at": block.unblocked_at},
                status=status.HTTP_200_OK,
            )

        unblock_entity(block, request=request)
        return Response(
            {"message": "Block removed successfully.", "unblocked_at": timezone.now()},
            status=status.HTTP_200_OK,
        )


class NetworkEdgeProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = NetworkEdgeProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = NetworkEdgeProfile.objects.all()

    def perform_create(self, serializer):
        profile = serializer.save()
        if profile.is_default:
            NetworkEdgeProfile.objects.exclude(pk=profile.pk).update(is_default=False)


class NetworkEdgeProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NetworkEdgeProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = NetworkEdgeProfile.objects.all()

    def perform_update(self, serializer):
        profile = serializer.save()
        if profile.is_default:
            NetworkEdgeProfile.objects.exclude(pk=profile.pk).update(is_default=False)


class NetworkEdgeActionLogListView(generics.ListAPIView):
    serializer_class = NetworkEdgeActionLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = NetworkEdgeActionLog.objects.all().select_related("profile", "user", "device", "performed_by")

    def get_queryset(self):
        queryset = super().get_queryset()
        profile_id = self.request.query_params.get("profile_id")
        action = self.request.query_params.get("action")
        success = self.request.query_params.get("success")
        if profile_id:
            queryset = queryset.filter(profile_id=profile_id)
        if action:
            queryset = queryset.filter(action=action)
        if success in {"true", "false"}:
            queryset = queryset.filter(success=(success == "true"))
        return queryset


class NetworkEdgeActionExecuteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = NetworkEdgeActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        profile = None
        if data.get("profile_id"):
            profile = NetworkEdgeProfile.objects.filter(pk=data["profile_id"]).first()
            if profile is None:
                return Response(
                    {"detail": "The selected network-edge profile does not exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not profile.enabled:
                return Response(
                    {"detail": "The selected network-edge profile is disabled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        if profile is None:
            profile = get_default_edge_profile()

        user = User.objects.filter(pk=data.get("user_id")).first() if data.get("user_id") else None
        device = Device.objects.filter(pk=data.get("device_id")).first() if data.get("device_id") else None
        if data.get("user_id") and user is None:
            return Response(
                {"detail": "The selected user does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if data.get("device_id") and device is None:
            return Response(
                {"detail": "The selected device does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        mac_address = data.get("mac_address") or getattr(device, "mac_address", "")
        ip_address = data.get("ip_address") or getattr(device, "ip_address", None)

        action_name = data["action"]
        result = perform_network_edge_action(
            action=action_name,
            request=request,
            profile=profile,
            user=user,
            device=device,
            mac_address=mac_address,
            ip_address=ip_address,
            reason=data.get("reason", ""),
            notes=data.get("notes", ""),
            session_id=data.get("session_id", ""),
            disconnect_all_sessions=data.get("disconnect_all_sessions", False),
        )

        return Response(
            {
                "success": result.success,
                "status_code": result.status_code,
                "message": result.message,
                "payload": result.payload,
            },
            status=status.HTTP_200_OK if result.success else status.HTTP_400_BAD_REQUEST,
        )


class NetworkEdgeHealthView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        profile = get_default_edge_profile()
        if profile is None:
            return Response(
                {"enabled": False, "message": "No network-edge profile configured.", "profile": None},
                status=status.HTTP_200_OK,
            )

        result = perform_network_edge_action(
            action="health_check",
            request=request,
            profile=profile,
        )
        return Response(
            {
                "enabled": True,
                "profile": NetworkEdgeProfileSerializer(profile).data,
                "success": result.success,
                "status_code": result.status_code,
                "message": result.message,
                "payload": result.payload,
            },
            status=status.HTTP_200_OK,
        )
