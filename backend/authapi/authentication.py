from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from devices.models import Device
from security.models import BlockedEntity
from security.network_scope import get_request_network_scope


class DeviceAwareJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, token = result
        device_id = request.headers.get("X-Device-Id")
        mac_address = request.headers.get("X-Device-Mac")
        network_scope = get_request_network_scope(request)

        device = None
        if device_id:
            device = Device.objects.filter(pk=device_id, owner=user).first()
        elif mac_address:
            device = Device.objects.filter(mac_address=mac_address, owner=user).first()

        blocked_by_mac = False
        if mac_address and network_scope:
            blocked_by_mac = BlockedEntity.objects.filter(
                mac_address=mac_address,
                network_scope=network_scope,
                is_active=True,
            ).exists()

        if device is not None:
            request.current_device = device
            blocked_by_device = (
                network_scope
                and BlockedEntity.objects.filter(
                    device=device,
                    network_scope=network_scope,
                    is_active=True,
                ).exists()
            )
            is_blocked = (
                blocked_by_device or blocked_by_mac
            )
            if is_blocked:
                raise AuthenticationFailed(
                    detail={
                        "error": "This device is blocked on the current network.",
                        "code": "device_blocked",
                        "device_id": device.id,
                        "device_name": device.device_name,
                    }
                )
        elif blocked_by_mac:
            raise AuthenticationFailed(
                detail={
                    "error": "This device is blocked on the current network.",
                    "code": "device_blocked",
                }
            )

        return (user, token)
