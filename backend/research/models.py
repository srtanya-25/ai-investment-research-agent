from django.contrib.auth.models import User
from django.db import models


class Company(models.Model):
    """A company the agent has researched at least once. Reused across reports."""
    name = models.CharField(max_length=200, unique=True)
    sector = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ResearchReport(models.Model):
    """One investment research run for a company, owned by the user who ran it."""

    VERDICT_CHOICES = [
        ("INVEST", "Invest"),
        ("PASS", "Pass"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="reports")

    # The three analysis sections the agent writes
    business_analysis = models.TextField()
    growth_analysis = models.TextField()
    risk_analysis = models.TextField()

    summary = models.TextField(blank=True)
    verdict = models.CharField(max_length=10, choices=VERDICT_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company.name} - {self.verdict} ({self.created_at.date()})"


class InvestmentScore(models.Model):
    """The numeric scorecard behind a report's verdict."""
    report = models.OneToOneField(
        ResearchReport, on_delete=models.CASCADE, related_name="score"
    )

    # Each sub-score is 0-100. Risk is "lower is safer".
    business_score = models.IntegerField()
    growth_score = models.IntegerField()
    risk_score = models.IntegerField()
    overall_score = models.IntegerField()

    def __str__(self):
        return f"{self.report.company.name}: {self.overall_score}/100"


class SavedCompany(models.Model):
    """A company a user bookmarked from their history."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_companies")
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "company")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} saved {self.company.name}"
