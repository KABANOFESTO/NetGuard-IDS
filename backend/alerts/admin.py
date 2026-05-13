from django.contrib import admin
from .models import IntrusionAlert


@admin.register(IntrusionAlert)
class IntrusionAlertAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "alert_type",
        "severity",
        "status",
        "user",
        "device",
        "detected_at",
    )
    list_filter = ("alert_type", "severity", "status", "detected_at")
    search_fields = ("message", "user__email", "device__device_name", "device__mac_address")
    readonly_fields = ("detected_at", "resolved_at")
