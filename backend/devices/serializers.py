from rest_framework import serializers

from .models import Device


class DeviceSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    owner_name = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Device
        fields = [
            "id",
            "owner",
            "owner_email",
            "owner_name",
            "device_name",
            "device_type",
            "ip_address",
            "mac_address",
            "operating_system",
            "status",
            "is_registered",
            "registration_notes",
            "blocked_at",
            "last_seen",
            "created_at",
        ]
        read_only_fields = ["status", "blocked_at", "last_seen", "created_at"]


class DeviceStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ["status", "is_registered", "registration_notes"]
