from rest_framework import serializers

from .models import BlockedEntity


class BlockedEntitySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    device_name = serializers.CharField(source="device.device_name", read_only=True)
    blocked_by_email = serializers.EmailField(source="blocked_by.email", read_only=True)

    class Meta:
        model = BlockedEntity
        fields = [
            "id",
            "user",
            "user_email",
            "device",
            "device_name",
            "reason",
            "blocked_by",
            "blocked_by_email",
            "blocked_at",
            "unblocked_at",
            "expires_at",
            "notes",
            "is_active",
        ]
        read_only_fields = ["blocked_by", "blocked_at", "unblocked_at"]

    def validate(self, attrs):
        if not attrs.get("user") and not attrs.get("device"):
            raise serializers.ValidationError("A block must target a user, a device, or both.")
        return attrs
