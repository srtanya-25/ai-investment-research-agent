"""
ai/fallback.py
A deterministic stand-in used when no Gemini key is configured or the live call
fails. It keeps the app usable for local development and CI without depending on
a network call. The scores are derived from the company name so the same input
always produces the same output - handy for demos and tests.
"""


def _stable_number(text, low, high):
    """Map a string to a stable number in [low, high] using its character sum."""
    total = sum(ord(c) for c in text.lower() if c.isalnum())
    span = high - low + 1
    return low + (total % span)


def fallback_research(company_name):
    business = _stable_number(company_name + "b", 45, 85)
    growth = _stable_number(company_name + "g", 40, 90)
    risk = _stable_number(company_name + "r", 25, 70)

    return {
        "sector": "Unspecified",
        "description": (
            f"{company_name} is the company under review. This summary was generated "
            "offline because no live AI key was configured."
        ),
        "business_analysis": (
            f"{company_name} shows a reasonable competitive position based on the "
            "available signals. Without live data this is a placeholder fundamentals read."
        ),
        "growth_analysis": (
            f"Growth prospects for {company_name} look moderate. Replace this with the "
            "live model output once a Gemini key is set."
        ),
        "risk_analysis": (
            f"The main risks for {company_name} are the usual sector and execution risks. "
            "This is a conservative placeholder assessment."
        ),
        "business_score": business,
        "growth_score": growth,
        "risk_score": risk,
    }
