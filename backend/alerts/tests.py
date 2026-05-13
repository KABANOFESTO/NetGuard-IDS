from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from devices.models import Device

from .models import IntrusionAlert


class IntrusionAlertApiTests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.admin = self.user_model.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="StrongPass123!",
            role="Admin",
        )
        self.student = self.user_model.objects.create_user(
            username="student",
            email="student@example.com",
            password="StrongPass123!",
            role="Student",
        )
        self.device = Device.objects.create(
            owner=self.student,
            device_name="Lab Laptop",
            ip_address="192.168.1.20",
            mac_address="AA:BB:CC:DD:EE:FF",
            status="unknown",
            is_registered=False,
        )

    def test_admin_can_create_intrusion_alert(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("intrusion-alert-list"),
            {
                "user": self.student.id,
                "device": self.device.id,
                "alert_type": "unknown_device",
                "message": "An unknown device was detected on the network.",
                "severity": "high",
                "status": "pending",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(IntrusionAlert.objects.count(), 1)

    def test_alert_requires_user_or_device(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("intrusion-alert-list"),
            {
                "alert_type": "abnormal_activity",
                "message": "Suspicious traffic pattern detected.",
                "severity": "medium",
                "status": "pending",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resolving_alert_sets_resolved_timestamp(self):
        self.client.force_authenticate(user=self.admin)
        alert = IntrusionAlert.objects.create(
            user=self.student,
            device=self.device,
            alert_type="multiple_login_attempts",
            message="Repeated invalid logins detected.",
            severity="critical",
            status="pending",
        )

        response = self.client.patch(
            reverse("intrusion-alert-detail", kwargs={"pk": alert.pk}),
            {"status": "resolved"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertIsNotNone(alert.resolved_at)
