from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from devices.models import Device
from security.models import BlockedEntity


class DeviceAwareJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, token = result
        device_id = request.headers.get("X-Device-Id")
        mac_address = request.headers.get("X-Device-Mac")

        device = None
        if device_id:
            device = Device.objects.filter(pk=device_id, owner=user).first()
        elif mac_address:
            device = Device.objects.filter(mac_address=mac_address, owner=user).first()

        if device is not None:
            request.current_device = device
            is_blocked = (
                device.status == "blocked"
                or BlockedEntity.objects.filter(device=device, is_active=True).exists()
            )
            if is_blocked:
                raise AuthenticationFailed(
                    detail={
                        "error": "This device has been blocked by the administrator.",
                        "code": "device_blocked",
                        "device_id": device.id,
                        "device_name": device.device_name,
                    }
                )

        return (user, token)
