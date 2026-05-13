from django.db import models
from authapi.models import User
from devices.models import Device


class NetworkActivity(models.Model):
    ACTIVITY_CHOICES = (
        ('login', 'Login'),
        ('login_attempt', 'Login Attempt'),
        ('logout', 'Logout'),
        ('session_start', 'Session Start'),
        ('session_end', 'Session End'),
        ('file_access', 'File Access'),
        ('restricted_access', 'Restricted Access'),
        ('download', 'Download'),
        ('upload', 'Upload'),
        ('network_scan', 'Network Scan'),
        ('configuration_change', 'Configuration Change'),
    )

    OUTCOME_CHOICES = (
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('blocked', 'Blocked'),
        ('restricted', 'Restricted'),
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

    activity_type = models.CharField(max_length=50, choices=ACTIVITY_CHOICES)

    description = models.TextField()

    ip_address = models.GenericIPAddressField()
    outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES, default='success')
    destination = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    data_usage_mb = models.FloatField(default=0)

    is_suspicious = models.BooleanField(default=False)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['activity_type', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
            models.Index(fields=['is_suspicious']),
            models.Index(fields=['outcome']),
        ]

    def __str__(self):
        return f"{self.activity_type} - {self.ip_address}"
