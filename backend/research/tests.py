from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from .scoring import calculate_overall, decide_verdict
from .services import run_research
from .models import ResearchReport, InvestmentScore


class ScoringTests(TestCase):
    def test_high_business_and_growth_low_risk_recommends_invest(self):
        overall = calculate_overall(business_score=85, growth_score=80, risk_score=20)
        self.assertGreaterEqual(overall, 60)
        self.assertEqual(decide_verdict(overall), "INVEST")

    def test_high_risk_drags_score_down_to_pass(self):
        overall = calculate_overall(business_score=55, growth_score=50, risk_score=95)
        self.assertEqual(decide_verdict(overall), "PASS")

    def test_scores_are_clamped(self):
        overall = calculate_overall(business_score=200, growth_score=-50, risk_score=0)
        self.assertLessEqual(overall, 100)
        self.assertGreaterEqual(overall, 0)


class ResearchPipelineTests(TestCase):
    """Runs against the offline fallback (no GEMINI_API_KEY in CI)."""

    def setUp(self):
        self.user = User.objects.create_user("carol", "carol@example.com", "strongpass1")

    def test_run_research_creates_report_and_score(self):
        report = run_research(self.user, "Acme Corp")
        self.assertIsInstance(report, ResearchReport)
        self.assertIn(report.verdict, ["INVEST", "PASS"])
        self.assertTrue(InvestmentScore.objects.filter(report=report).exists())

    def test_blank_company_name_is_rejected(self):
        with self.assertRaises(ValueError):
            run_research(self.user, "   ")


class ResearchEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user("dave", "dave@example.com", "strongpass1")
        self.client.post(
            "/api/v1/login/",
            {"username": "dave", "password": "strongpass1"},
            format="json",
        )

    def test_research_endpoint_returns_report(self):
        response = self.client.post(
            "/api/v1/research/", {"company_name": "Globex"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("verdict", response.data)
        self.assertIn("score", response.data)
