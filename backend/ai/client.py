"""
ai/client.py
The single entry point the services layer calls to analyse a company.

It uses LangChain with Google's Gemini model. If the key is missing or the call
fails for any reason, it falls back to a deterministic offline analysis so the
rest of the app keeps working.
"""
import logging

from django.conf import settings

from .parsers import parse_research_json
from .fallback import fallback_research
from .prompts.research_prompt import SYSTEM_PROMPT, RESEARCH_TEMPLATE

logger = logging.getLogger(__name__)


def _run_gemini(company_name):
    """Call Gemini through LangChain and return the parsed dict."""
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import SystemMessage, HumanMessage

    model = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=RESEARCH_TEMPLATE.format(company=company_name)),
    ]

    response = model.invoke(messages)
    return parse_research_json(response.content)


def analyze_company(company_name):
    """
    Return the structured analysis for a company. Tries the live model first,
    falls back to the offline analysis on any missing key or error.
    """
    if not settings.GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY not set - using offline fallback analysis.")
        return fallback_research(company_name)

    try:
        return _run_gemini(company_name)
    except Exception as exc:  # network, quota, parse - never break the request
        logger.warning("Gemini call failed (%s) - using offline fallback.", exc, exc_info=True)
        return fallback_research(company_name)
