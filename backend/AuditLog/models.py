from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'User login'),
        ('LOGOUT', 'User logout'),
        ('USER_CREATE', 'User created'),
        ('USER_UPDATE', 'User updated'),
        ('USER_DELETE', 'User deleted'),
        ('USER_ACTIVATE', 'User activated'),
        ('USER_DEACTIVATE', 'User deactivated'),
        ('PASSWORD_RESET_REQUEST', 'Password reset requested'),
        ('PASSWORD_RESET_COMPLETE', 'Password reset completed'),
        ('PROFILE_UPDATE', 'Profile updated'),
        ('PERMISSION_CHANGE', 'User permissions changed'),
        ('EMAIL_SEND_FAILURE', 'Email delivery failed'),
        ('DEVICE_REGISTER', 'Device registered'),
        ('DEVICE_UPDATE', 'Device updated'),
        ('DEVICE_STATUS_CHANGE', 'Device status changed'),
        ('NETWORK_ACTIVITY_RECORDED', 'Network activity recorded'),
        ('ALERT_CREATE', 'Alert created'),
        ('ALERT_UPDATE', 'Alert updated'),
        ('SECURITY_BLOCK', 'Security block applied'),
        ('SECURITY_UNBLOCK', 'Security block removed'),
        ('REPORT_VIEW', 'Report viewed'),
        ('DASHBOARD_VIEW', 'Dashboard viewed'),
        ('USER_LIST_ACCESS', 'User list accessed'),
        ('USER_DETAIL_ACCESS', 'User detail accessed'),
    ]

    user = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='actions')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    target_user = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_actions')
    additional_data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return f"{self.get_action_display()} by {self.user} at {self.timestamp}"
