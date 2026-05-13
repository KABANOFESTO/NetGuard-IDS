from rest_framework import serializers

from .models import NetworkActivity


class NetworkActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    device_name = serializers.CharField(source="device.device_name", read_only=True)

    class Meta:
        model = NetworkActivity
        fields = [
            "id",
            "user",
            "user_email",
            "device",
            "device_name",
            "activity_type",
            "description",
            "ip_address",
            "outcome",
            "destination",
            "metadata",
            "data_usage_mb",
            "is_suspicious",
            "timestamp",
        ]
        read_only_fields = ["is_suspicious", "timestamp"]
