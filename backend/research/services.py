"""
research/services.py
Orchestrates one research run:
  resolve company -> AI analysis -> score -> verdict -> save report
"""
from django.db import transaction

from ai.client import analyze_company
from .models import Company, ResearchReport, InvestmentScore
from .scoring import calculate_overall, decide_verdict


def _build_summary(company_name, verdict, overall_score):
    decision = "worth investing in" if verdict == "INVEST" else "better to pass on for now"
    return (
        f"Based on its business fundamentals, growth outlook, and risk profile, "
        f"{company_name} scores {overall_score}/100 and looks {decision}."
    )


@transaction.atomic
def run_research(user, company_name):
    """
    Run the full pipeline for one company and return the saved ResearchReport.
    Raises ValueError on bad input.
    """
    company_name = (company_name or "").strip()
    if not company_name:
        raise ValueError("Company name is required.")

    analysis = analyze_company(company_name)

    # Reuse the company row across reports; update sector/description if we learned more.
    company, _ = Company.objects.get_or_create(
        name__iexact=company_name,
        defaults={
            "name": company_name,
            "sector": analysis["sector"],
            "description": analysis["description"],
        },
    )
    if not company.sector and analysis["sector"]:
        company.sector = analysis["sector"]
        company.description = analysis["description"]
        company.save()

    overall = calculate_overall(
        analysis["business_score"],
        analysis["growth_score"],
        analysis["risk_score"],
    )
    verdict = decide_verdict(overall)

    report = ResearchReport.objects.create(
        user=user,
        company=company,
        business_analysis=analysis["business_analysis"],
        growth_analysis=analysis["growth_analysis"],
        risk_analysis=analysis["risk_analysis"],
        summary=_build_summary(company.name, verdict, overall),
        verdict=verdict,
    )

    InvestmentScore.objects.create(
        report=report,
        business_score=analysis["business_score"],
        growth_score=analysis["growth_score"],
        risk_score=analysis["risk_score"],
        overall_score=overall,
    )

    return report
