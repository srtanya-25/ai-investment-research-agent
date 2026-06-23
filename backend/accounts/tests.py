from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient


class AuthFlowTests(TestCase):
    """Register, login (cookies set), and the auth-check endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_register_and_login_sets_cookies(self):
        register = self.client.post(
            "/api/v1/register/",
            {"username": "alice", "email": "alice@example.com", "password": "strongpass1"},
            format="json",
        )
        self.assertEqual(register.status_code, 201)

        login = self.client.post(
            "/api/v1/login/",
            {"username": "alice", "password": "strongpass1"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access_token", login.cookies)
        self.assertIn("refresh_token", login.cookies)

    def test_protected_endpoint_requires_auth(self):
        response = self.client.get("/api/v1/dashboard-protected/")
        self.assertEqual(response.status_code, 401)

    def test_me_returns_user_when_logged_in(self):
        User.objects.create_user("bob", "bob@example.com", "strongpass1")
        self.client.post(
            "/api/v1/login/",
            {"username": "bob", "password": "strongpass1"},
            format="json",
        )
        response = self.client.get("/api/v1/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "bob")
