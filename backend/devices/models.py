from django.db import models
from authapi.models import User


class Device(models.Model):
    DEVICE_TYPE_CHOICES = (
        ('laptop', 'Laptop'),
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
        ('iot', 'IoT'),
        ('other', 'Other'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('blocked', 'Blocked'),
        ('suspicious', 'Suspicious'),
        ('unknown', 'Unknown'),
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='devices'
    )

    device_name = models.CharField(max_length=255)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES, default='other')

    ip_address = models.GenericIPAddressField()

    mac_address = models.CharField(max_length=100, unique=True)

    operating_system = models.CharField(max_length=100, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    is_registered = models.BooleanField(default=True)
    registration_notes = models.TextField(blank=True)
    blocked_at = models.DateTimeField(blank=True, null=True)

    last_seen = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_seen']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['is_registered']),
            models.Index(fields=['owner']),
        ]

    def __str__(self):
        return f"{self.device_name} - {self.ip_address}"
