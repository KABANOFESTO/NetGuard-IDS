from rest_framework import serializers

from .models import IntrusionAlert


class IntrusionAlertSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    device_name = serializers.CharField(source="device.device_name", read_only=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)

    class Meta:
        model = IntrusionAlert
        fields = [
            "id",
            "user",
            "user_email",
            "device",
            "device_name",
            "source_activity",
            "assigned_to",
            "assigned_to_email",
            "alert_type",
            "message",
            "severity",
            "status",
            "detected_at",
            "resolved_at",
            "metadata",
        ]
        read_only_fields = ["detected_at", "resolved_at"]

    def validate(self, attrs):
        user = attrs.get("user") or getattr(self.instance, "user", None)
        device = attrs.get("device") or getattr(self.instance, "device", None)
        source_activity = attrs.get("source_activity") or getattr(self.instance, "source_activity", None)
        metadata = attrs.get("metadata", getattr(self.instance, "metadata", {}))

        if (
            not user
            and not device
            and not source_activity
            and not metadata.get("ip_address")
        ):
            raise serializers.ValidationError(
                "An intrusion alert must be linked to a user, a device, a source activity, or an IP address."
            )
        return attrs
