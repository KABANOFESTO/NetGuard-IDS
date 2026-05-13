from django.db import models
from authapi.models import User
from devices.models import Device


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
