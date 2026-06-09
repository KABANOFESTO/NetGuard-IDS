from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from devices.models import Device
from security.services import block_entity


class NetworkAccessApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="StrongPass123!",
            role="Student",
        )
        self.admin = user_model.objects.create_user(
            username="admin1",
            email="admin1@example.com",
            password="StrongPass123!",
            role="Admin",
        )

    def test_login_registers_browser_device_and_returns_network_access(self):
        response = self.client.post(
            reverse("login"),
            {
                "email": self.user.email,
                "password": "StrongPass123!",
                "mac_address": "AA:BB:CC:DD:EE:FF",
                "device_name": "Student Laptop",
                "device_type": "laptop",
                "operating_system": "Windows",
                "registration_notes": "Browser fingerprint",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("network_access", response.data)
        self.assertEqual(response.data["network_access"]["access_status"], "granted_with_attention")
        self.assertEqual(Device.objects.count(), 1)
        device = Device.objects.first()
        self.assertEqual(device.owner, self.user)
        self.assertFalse(device.is_registered)

    def test_access_context_returns_device_status_for_authenticated_user(self):
        login = self.client.post(
            reverse("login"),
            {
                "email": self.user.email,
                "password": "StrongPass123!",
                "mac_address": "11:22:33:44:55:66",
                "device_name": "Student Tablet",
                "device_type": "tablet",
                "operating_system": "Android",
            },
            format="json",
        )

        token = login.data["access"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_DEVICE_MAC="11:22:33:44:55:66",
        )

        response = self.client.get(reverse("network-access-context"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_status", response.data)
        self.assertIn(response.data["access_status"], ["granted", "granted_with_attention"])
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_blocked_device_returns_auth_error(self):
        device = Device.objects.create(
            owner=self.admin,
            device_name="Admin Laptop",
            device_type="laptop",
            ip_address="127.0.0.1",
            mac_address="FF:EE:DD:CC:BB:AA",
            operating_system="Windows",
            is_registered=True,
            status="blocked",
        )

        login = self.client.post(
            reverse("login"),
            {
                "email": self.admin.email,
                "password": "StrongPass123!",
                "device_id": device.id,
                "mac_address": device.mac_address,
                "device_name": device.device_name,
                "device_type": device.device_type,
                "operating_system": device.operating_system,
            },
            format="json",
        )

        self.assertEqual(login.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("blocked", str(login.data).lower())

    def test_security_block_table_also_prevents_login(self):
        device = Device.objects.create(
            owner=self.user,
            device_name="Student Laptop",
            device_type="laptop",
            ip_address="127.0.0.1",
            mac_address="00:11:22:33:44:55",
            operating_system="Windows",
            is_registered=True,
            status="active",
        )
        block_entity(
            request=None,
            device=device,
            reason="manual_block",
            notes="Security block for testing.",
        )

        login = self.client.post(
            reverse("login"),
            {
                "email": self.user.email,
                "password": "StrongPass123!",
                "device_id": device.id,
                "mac_address": device.mac_address,
                "device_name": device.device_name,
                "device_type": device.device_type,
                "operating_system": device.operating_system,
            },
            format="json",
        )

        self.assertEqual(login.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("blocked", str(login.data).lower())
