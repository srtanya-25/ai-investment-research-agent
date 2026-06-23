# API Reference

Base path: `/api/v1/`. Authenticated endpoints rely on the HTTP-only cookies set at login.

## Auth

### POST /register/
Body: `{ "username", "email", "password" }` -> `201` with the new user.

### POST /login/
Body: `{ "username", "password" }` -> `200`, sets `access_token` and `refresh_token` cookies.

### POST /refresh/
Reads the `refresh_token` cookie -> `200`, sets a fresh `access_token` cookie.

### POST /logout/
Clears both cookies.

### GET /me/
Returns the current user. Requires auth.

## Research

### POST /research/
Run the full pipeline for a company.

Request:
```json
{ "company_name": "Tesla" }
```

Response (`201`):
```json
{
  "id": 1,
  "company": { "id": 1, "name": "Tesla", "sector": "...", "description": "..." },
  "business_analysis": "...",
  "growth_analysis": "...",
  "risk_analysis": "...",
  "summary": "...",
  "verdict": "INVEST",
  "verdict_label": "Invest",
  "score": { "business_score": 78, "growth_score": 72, "risk_score": 55, "overall_score": 69 },
  "created_at": "2026-06-22T10:00:00Z"
}
```

Errors: `400` if `company_name` is blank.

### GET /reports/
Paginated history for the current user. Supports `?verdict=INVEST` and `?sort_by=created_at`.

### GET /reports/<id>/
One full report owned by the user. `404` if not found or not owned.

### GET /companies/?q=<term>
Search previously researched companies by name or sector.

## Saved companies

### GET /saved/
List the user's bookmarks.

### POST /saved/
Body: `{ "company_id": 1 }` -> bookmark a company.

### DELETE /saved/<id>/
Remove a bookmark.
