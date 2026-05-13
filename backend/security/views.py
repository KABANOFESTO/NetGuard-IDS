from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapi.permissions import IsAdmin

from .models import BlockedEntity
from .serializers import BlockedEntitySerializer
from .services import block_entity, unblock_entity


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
