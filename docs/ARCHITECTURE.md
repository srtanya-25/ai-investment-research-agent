# Architecture

## Overview

The app is split into a React frontend and a Django REST Framework backend, talking over JSON. Authentication uses JWT stored in HTTP-only cookies so tokens are never exposed to JavaScript. This is the same pattern used in the MindTraits project; only the domain layer is new.

## Backend layout

```
backend/
  invagent/        Django project config (settings, urls, wsgi/asgi)
  accounts/        Cookie-based JWT auth (register, login, refresh, logout, me)
  api/             URL aggregation + thin views + pagination
  research/        Domain: models, serializers, services, scoring
  ai/              LangChain + Gemini client, prompts, parsers, offline fallback
```

The layering rule is the one carried over from MindTraits:

- **Views** (`api/views.py`) are thin. They read the request, call a service, and serialize the result.
- **Services** (`research/services.py`) hold the business logic and orchestrate the steps.
- **Scoring** (`research/scoring.py`) is a small pure module - easy to unit test and explain.
- **AI** (`ai/`) is isolated. Services call `ai.analyze_company()`; nothing else imports LangChain.

## The research pipeline

`research/services.run_research(user, company_name)`:

1. Validate the company name.
2. Call `ai.analyze_company()` for the structured analysis and sub-scores.
3. Reuse or create the `Company` row.
4. Compute the overall score (`scoring.calculate_overall`) and verdict (`scoring.decide_verdict`).
5. Save a `ResearchReport` and its `InvestmentScore` in one transaction.
6. Return the report.

## The AI layer

`ai/client.analyze_company()` builds a LangChain `ChatGoogleGenerativeAI` model, sends a system prompt plus a request that asks for strict JSON, then parses it with `ai/parsers.py`. If `GEMINI_API_KEY` is missing or the call fails for any reason, it returns `ai/fallback.py` output instead. This keeps the request path from ever crashing on an AI problem.

## Scoring rule

```
overall = business * 0.40 + growth * 0.35 + (100 - risk) * 0.25
verdict = INVEST if overall >= 60 else PASS
```

Risk is inverted because a higher risk score should lower the overall result. All inputs are clamped to 0-100.

## Data model

```
User (Django built-in)
 └── ResearchReport (user, company, three analyses, summary, verdict)
       └── InvestmentScore (business, growth, risk, overall)
Company (name, sector, description)   <- reused across reports
SavedCompany (user, company)          <- bookmarks
```

## Auth flow

1. `POST /login/` verifies credentials and sets `access_token` + `refresh_token` cookies.
2. Every request includes the cookies automatically (`withCredentials`).
3. On a 401, the Axios interceptor calls `POST /refresh/` once and replays the request.
4. `CookieJWTAuthentication` reads the access token from the cookie instead of a header.
