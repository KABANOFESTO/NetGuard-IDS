from rest_framework import serializers

from .models import BlockedEntity, NetworkEdgeActionLog, NetworkEdgeProfile


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
            "mac_address",
            "network_scope",
            "reason",
            "blocked_by",
            "blocked_by_email",
            "blocked_at",
            "unblocked_at",
            "expires_at",
            "notes",
            "is_active",
        ]
        read_only_fields = ["blocked_by", "blocked_at", "unblocked_at", "network_scope"]

    def validate(self, attrs):
        if not attrs.get("user") and not attrs.get("device") and not attrs.get("mac_address"):
            raise serializers.ValidationError("A block must target a user, a device, or a MAC address.")
        return attrs


class NetworkEdgeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkEdgeProfile
        fields = [
            "id",
            "name",
            "provider_type",
            "base_url",
            "api_token",
            "shared_secret",
            "authorize_path",
            "revoke_path",
            "ban_path",
            "unban_path",
            "disconnect_path",
            "health_path",
            "timeout_seconds",
            "enabled",
            "is_default",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        extra_kwargs = {
            "api_token": {"write_only": True, "required": False, "allow_blank": True},
            "shared_secret": {"write_only": True, "required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        if attrs.get("is_default"):
            attrs["enabled"] = True
        return attrs

    def update(self, instance, validated_data):
        # Preserve stored secrets when the admin leaves the field blank in the UI.
        if validated_data.get("api_token", None) == "":
            validated_data.pop("api_token", None)
        if validated_data.get("shared_secret", None) == "":
            validated_data.pop("shared_secret", None)
        return super().update(instance, validated_data)


class NetworkEdgeActionSerializer(serializers.Serializer):
    profile_id = serializers.IntegerField(required=False, allow_null=True)
    action = serializers.ChoiceField(choices=[choice[0] for choice in NetworkEdgeActionLog.ACTION_CHOICES])
    user_id = serializers.IntegerField(required=False, allow_null=True)
    device_id = serializers.IntegerField(required=False, allow_null=True)
    mac_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ip_address = serializers.IPAddressField(required=False, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    session_id = serializers.CharField(required=False, allow_blank=True, default="")
    disconnect_all_sessions = serializers.BooleanField(required=False, default=False)


class NetworkEdgeActionLogSerializer(serializers.ModelSerializer):
    profile_name = serializers.CharField(source="profile.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    device_name = serializers.CharField(source="device.device_name", read_only=True)
    performed_by_email = serializers.EmailField(source="performed_by.email", read_only=True)

    class Meta:
        model = NetworkEdgeActionLog
        fields = [
            "id",
            "profile",
            "profile_name",
            "action",
            "user",
            "user_email",
            "device",
            "device_name",
            "mac_address",
            "ip_address",
            "success",
            "status_code",
            "message",
            "response_payload",
            "performed_by",
            "performed_by_email",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "profile",
            "profile_name",
            "action",
            "user",
            "user_email",
            "device",
            "device_name",
            "mac_address",
            "ip_address",
            "success",
            "status_code",
            "message",
            "response_payload",
            "performed_by",
            "performed_by_email",
            "created_at",
        ]
