"""
ai/parsers.py
Pulls the JSON object out of the model's reply and checks it has what we need.
"""
import json
import re

REQUIRED_KEYS = [
    "sector", "description",
    "business_analysis", "growth_analysis", "risk_analysis",
    "business_score", "growth_score", "risk_score",
]


def parse_research_json(raw_text):
    """
    Models sometimes wrap JSON in prose or code fences. Grab the first {...}
    block and parse it. Raises ValueError if the result is unusable.
    """
    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in model output")

    data = json.loads(match.group(0))

    missing = [key for key in REQUIRED_KEYS if key not in data]
    if missing:
        raise ValueError(f"Model output missing keys: {missing}")

    for key in ("business_score", "growth_score", "risk_score"):
        data[key] = int(data[key])

    return data
