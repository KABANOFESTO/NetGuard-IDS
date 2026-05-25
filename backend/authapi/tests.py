from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AdminUserManagementTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            username="admin1",
            email="admin1@example.com",
            password="StrongPass123!",
            role="Admin",
        )
        self.other_admin = user_model.objects.create_user(
            username="admin2",
            email="admin2@example.com",
            password="StrongPass123!",
            role="Admin",
        )
        self.student = user_model.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="StrongPass123!",
            role="Student",
        )

    def test_admin_can_delete_non_admin_user(self):
        self.client.force_authenticate(self.admin)

        response = self.client.delete(reverse("user-detail", kwargs={"pk": self.student.pk}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["deleted_user_id"], self.student.pk)

    def test_admin_cannot_delete_self(self):
        self.client.force_authenticate(self.admin)

        response = self.client.delete(reverse("user-detail", kwargs={"pk": self.admin.pk}))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot delete your own account", response.data["error"])

    def test_admin_cannot_delete_last_active_admin(self):
        self.client.force_authenticate(self.other_admin)
        self.other_admin.delete()

        response = self.client.delete(reverse("user-detail", kwargs={"pk": self.admin.pk}))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("last active admin", response.data["error"])
