# Architecture

## Overview

The app has two halves: a React (Vite) frontend and a Django REST Framework backend
that talk to each other over JSON. Login tokens are kept in HTTP-only cookies, so the
frontend JavaScript never reads or stores them directly.

## Backend layout

```
backend/
  invagent/        Django project config (settings, urls, wsgi/asgi)
  accounts/        cookie-based JWT auth (register, login, refresh, logout, me)
  api/             URL wiring, thin views, pagination
  research/        the domain: models, serializers, services, scoring
  ai/              LangChain + Gemini client, prompts, parsers, offline fallback
```

I tried to keep the responsibilities boring and separate:

- views (`api/views.py`) stay thin: read the request, call a service, return the result
- services (`research/services.py`) hold the logic and walk through a research run
- scoring (`research/scoring.py`) is its own little module, so it's easy to test and explain
- the model code (`ai/`) is walled off; services call `ai.analyze_company()` and nothing
  else touches LangChain

## The research pipeline

`research/services.run_research(user, company_name)` does this in order:

1. check the company name isn't empty
2. call `ai.analyze_company()` to get the analysis and the three sub-scores
3. reuse an existing `Company` row or create one
4. work out the overall score and the verdict from the scoring module
5. save the `ResearchReport` and its `InvestmentScore` together in one transaction
6. hand back the report

## The AI layer

`ai/client.analyze_company()` builds a `ChatGoogleGenerativeAI` model through LangChain,
sends a system prompt plus a request that asks for strict JSON, and parses the reply in
`ai/parsers.py`. If there's no `GEMINI_API_KEY`, or the call fails for any reason, it
returns the offline output from `ai/fallback.py` instead. That's what stops a model
hiccup from taking down the request.

## Scoring rule

```
overall = business * 0.40 + growth * 0.35 + (100 - risk) * 0.25
verdict = INVEST if overall >= 60 else PASS
```

Risk is flipped because a higher risk number should pull the score down. Everything is
clamped to the 0-100 range.

## Data model

```
User (Django built-in)
 └── ResearchReport (user, company, three analyses, summary, verdict)
       └── InvestmentScore (business, growth, risk, overall)
Company (name, sector, description)   reused across reports
SavedCompany (user, company)          bookmarks
```

## Auth flow

1. `POST /login/` checks the credentials and sets the `access_token` and `refresh_token`
   cookies.
2. Every later request carries the cookies on its own (`withCredentials`).
3. If a request comes back 401, the Axios interceptor calls `POST /refresh/` once and
   retries the original request.
4. `CookieJWTAuthentication` reads the access token from the cookie rather than from an
   Authorization header.
