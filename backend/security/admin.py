from django.contrib import admin
from .models import BlockedEntity, NetworkEdgeActionLog, NetworkEdgeProfile


@admin.register(BlockedEntity)
class BlockedEntityAdmin(admin.ModelAdmin):
    list_display = ("id", "reason", "user", "device", "network_scope", "is_active", "blocked_at", "unblocked_at")
    list_filter = ("reason", "is_active", "network_scope", "blocked_at")
    search_fields = ("user__email", "device__device_name", "device__mac_address", "mac_address", "network_scope", "notes")


@admin.register(NetworkEdgeProfile)
class NetworkEdgeProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "provider_type", "enabled", "is_default", "base_url", "updated_at")
    list_filter = ("provider_type", "enabled", "is_default")
    search_fields = ("name", "base_url", "notes")


@admin.register(NetworkEdgeActionLog)
class NetworkEdgeActionLogAdmin(admin.ModelAdmin):
    list_display = ("id", "action", "profile", "user", "device", "success", "status_code", "created_at")
    list_filter = ("action", "success", "profile", "created_at")
    search_fields = ("message", "mac_address", "ip_address", "user__email", "device__device_name")
    readonly_fields = (
        "profile",
        "action",
        "user",
        "device",
        "mac_address",
        "ip_address",
        "success",
        "status_code",
        "message",
        "response_payload",
        "performed_by",
        "created_at",
    )
