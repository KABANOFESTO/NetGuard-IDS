from django.db import models
from authapi.models import User
from devices.models import Device


class NetworkEdgeProfile(models.Model):
    PROVIDER_CHOICES = (
        ("radius_captive_portal", "RADIUS / Captive Portal"),
        ("firewall_router", "Firewall / Router API"),
        ("access_point_controller", "Access Point Controller"),
    )

    name = models.CharField(max_length=150, unique=True)
    provider_type = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    base_url = models.URLField(blank=True)
    api_token = models.CharField(max_length=255, blank=True)
    shared_secret = models.CharField(max_length=255, blank=True)
    authorize_path = models.CharField(max_length=255, blank=True, default="/authorize")
    revoke_path = models.CharField(max_length=255, blank=True, default="/revoke")
    ban_path = models.CharField(max_length=255, blank=True, default="/ban")
    unban_path = models.CharField(max_length=255, blank=True, default="/unban")
    disconnect_path = models.CharField(max_length=255, blank=True, default="/disconnect")
    health_path = models.CharField(max_length=255, blank=True, default="/health")
    timeout_seconds = models.PositiveIntegerField(default=10)
    enabled = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "name"]

    def __str__(self):
        return f"{self.name} ({self.provider_type})"


class NetworkEdgeActionLog(models.Model):
    ACTION_CHOICES = (
        ("authorize", "Authorize Session"),
        ("revoke", "Revoke Session"),
        ("ban_mac", "Ban MAC"),
        ("unban_mac", "Unban MAC"),
        ("terminate_sessions", "Terminate Sessions"),
        ("health_check", "Health Check"),
    )

    profile = models.ForeignKey(
        NetworkEdgeProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="action_logs",
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="network_edge_actions",
    )
    device = models.ForeignKey(
        Device,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="network_edge_actions",
    )
    mac_address = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    success = models.BooleanField(default=False)
    status_code = models.CharField(max_length=50, blank=True)
    message = models.TextField(blank=True)
    response_payload = models.JSONField(default=dict, blank=True)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="performed_network_edge_actions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action"]),
            models.Index(fields=["success"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.get_action_display()} - {self.created_at:%Y-%m-%d %H:%M}"


class BlockedEntity(models.Model):
    BLOCK_REASON_CHOICES = (
        ('intrusion', 'Intrusion Attempt'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('manual_block', 'Manual Block'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    mac_address = models.CharField(max_length=100, blank=True, db_index=True)

    reason = models.CharField(max_length=100, choices=BLOCK_REASON_CHOICES)

    blocked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='blocked_entities'
    )

    blocked_at = models.DateTimeField(auto_now_add=True)
    unblocked_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-blocked_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['reason']),
        ]

    def __str__(self):
        return f"Blocked Entity - {self.reason}"
