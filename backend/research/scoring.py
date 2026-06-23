"""
research/scoring.py
Turns the AI's three sub-scores into one overall score and a verdict.

The weighting is deliberately simple so it can be explained in one breath:
business fundamentals and growth pull the score up, risk pulls it down.
"""

# How much each factor counts toward the overall score.
WEIGHTS = {
    "business": 0.40,
    "growth": 0.35,
    "risk": 0.25,
}

# At or above this overall score we recommend investing.
INVEST_THRESHOLD = 60


def clamp(value):
    """Keep a score inside the 0-100 range."""
    return max(0, min(100, int(round(value))))


def calculate_overall(business_score, growth_score, risk_score):
    """
    Risk is "higher is worse", so we invert it before averaging.
    A company with strong business and growth but high risk still loses points.
    """
    business = clamp(business_score)
    growth = clamp(growth_score)
    risk = clamp(risk_score)

    risk_safety = 100 - risk

    overall = (
        business * WEIGHTS["business"]
        + growth * WEIGHTS["growth"]
        + risk_safety * WEIGHTS["risk"]
    )
    return clamp(overall)


def decide_verdict(overall_score):
    return "INVEST" if overall_score >= INVEST_THRESHOLD else "PASS"
