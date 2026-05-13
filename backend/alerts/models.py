from django.db import models
from authapi.models import User
from devices.models import Device


class IntrusionAlert(models.Model):
    ALERT_TYPES = (
        ('unauthorized_access', 'Unauthorized Access'),
        ('multiple_login_attempts', 'Multiple Login Attempts'),
        ('unknown_device', 'Unknown Device'),
        ('abnormal_activity', 'Abnormal Activity'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('ignored', 'Ignored'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    device = models.ForeignKey(
        Device,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    source_activity = models.ForeignKey(
        'monitoring.NetworkActivity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_alerts'
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_alerts'
    )

    alert_type = models.CharField(max_length=100, choices=ALERT_TYPES)

    message = models.TextField()

    severity = models.CharField(
        max_length=20,
        choices=(
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ),
        default='medium'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    detected_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['status', 'severity']),
            models.Index(fields=['alert_type']),
            models.Index(fields=['detected_at']),
        ]

    def __str__(self):
        return f"{self.alert_type} - {self.severity}"
