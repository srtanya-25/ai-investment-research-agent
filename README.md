# AI Investment Research Agent

You type in a company name. The agent researches it, writes up the business, growth, and risk picture, scores it out of 100, and gives you a clear **Invest** or **Pass** verdict. Every report is saved to your history and can be exported as a PDF.

The architecture follows my earlier project [MindTraits](https://github.com/srtanya-25/mindtraits): a React (Vite) frontend, a Django REST Framework backend, JWT stored in HTTP-only cookies, PostgreSQL in production, and Docker for local orchestration. This project keeps that shape and adds an AI layer for the actual research.

## Features

- Register / login with JWT in HTTP-only cookies (refresh handled automatically by an Axios interceptor)
- Search any company by name and run a research pass
- AI-generated business, growth, and risk analysis (LangChain + Gemini)
- A transparent investment score (business + growth + risk, weighted) and an Invest/Pass verdict
- Report history per user
- One-click PDF export of any report
- Works without an AI key too, using a deterministic offline analysis, so the app never hard-crashes on a missing or rate-limited key

## Architecture

```
Browser (React + Vite)
   |  axios, withCredentials (cookies)
   v
Django REST Framework  (/api/v1/*)
   - accounts/   cookie JWT auth
   - api/        thin views + URL aggregation
   - research/   models, serializers, services, scoring (business logic)
   - ai/         LangChain + Gemini client, prompts, parsers
   |
   v
PostgreSQL
```

The request flow for one research run:

```
login -> search company -> POST /research/
      -> ai.analyze_company()  (LangChain + Gemini, or offline fallback)
      -> scoring.calculate_overall() + decide_verdict()
      -> save ResearchReport + InvestmentScore
      -> return report -> display scorecard -> export PDF
```

Business logic lives in `research/services.py` and `research/scoring.py`. Controllers (`api/views.py`) stay thin. AI logic is isolated in the `ai/` package so it never leaks into views.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full breakdown and [docs/API.md](docs/API.md) for the endpoint reference.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Bootstrap 5 (CDN), Axios, React Query, Recharts, jsPDF |
| Auth | JWT in HTTP-only cookies, Axios interceptor for auto-refresh |
| Backend | Django 5, Django REST Framework |
| AI | LangChain, Google Gemini 2.5 Flash |
| Database | SQLite (dev), PostgreSQL (production) |
| DevOps | Docker, Docker Compose, DockerHub, GitHub Actions, Nginx |
| Deploy | Vercel (frontend), Render (backend + PostgreSQL) |

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # then edit values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at http://localhost:8000

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at http://localhost:5173

## Environment Variables

Backend (`backend/.env`):

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for local dev, `False` in production |
| `DATABASE_URL` | `sqlite:///db.sqlite3` locally, `postgresql://...` in production |
| `FRONTEND_URL` | Allowed CORS origin for the frontend |
| `GEMINI_API_KEY` | Google Gemini key. Leave blank to use the offline fallback |
| `GEMINI_MODEL` | Defaults to `gemini-2.5-flash` |

Frontend (`frontend/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend (e.g. `http://localhost:8000`) |

## Database Setup

`DATABASE_URL` drives the database choice. Locally it defaults to SQLite, so no setup is needed beyond `migrate`. In production it points at Render PostgreSQL. The schema is created from migrations:

```bash
python manage.py migrate
```

Tables added on top of the reused `auth_user`:

- `companies` - one row per researched company
- `research_reports` - one research run, owned by a user
- `investment_scores` - the numeric scorecard for a report
- `saved_companies` - bookmarked companies

## Docker Setup

```bash
docker compose up --build              # backend + frontend + postgres
docker compose down -v                 # stop and wipe the DB volume
```

- Frontend: http://localhost:5173 (nginx serving the built React app)
- Backend: http://localhost:8000
- Postgres: localhost:5433

To run with a live AI key, export it before bringing the stack up:

```bash
export GEMINI_API_KEY=your-key
docker compose up --build
```

## Deployment

- **Frontend** deploys to Vercel as a static Vite build. Set `VITE_API_URL` to the deployed backend URL.
- **Backend** deploys to Render as a Python web service, using `backend/build.sh` for the build and gunicorn at runtime.
- **PostgreSQL** is a managed Render instance; its connection string goes into `DATABASE_URL`.
- **CI/CD**: pushing to `main` runs `.github/workflows/ci.yml`, which tests both apps, builds and pushes Docker images to DockerHub, then calls the Render deploy hooks.

## API Documentation

Full reference in [docs/API.md](docs/API.md). All endpoints are under `/api/v1/`.

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/register/` | Create account | Public |
| POST | `/login/` | Sets HTTP-only cookies | Public |
| POST | `/logout/` | Clears cookies | Yes |
| POST | `/refresh/` | Refresh access token | Yes |
| GET | `/me/` | Current user | Yes |
| POST | `/research/` | Run research for a company | Yes |
| GET | `/reports/` | Report history | Yes |
| GET | `/reports/<id>/` | One full report | Yes |
| GET | `/companies/?q=` | Search researched companies | Yes |
| GET, POST, DELETE | `/saved/` | Saved companies | Yes |

## Example Runs

With the offline fallback (no key), scores are derived deterministically from the company name, so these are reproducible:

- **Acme Corp** -> Business 71, Growth 64, Risk 48 -> Overall 64 -> **Invest**
- **Globex** -> Business 58, Growth 49, Risk 61 -> Overall 52 -> **Pass**

With a live Gemini key the analysis text and scores reflect the model's actual read of the company.

## Trade-offs

- **Single LLM call, not an agent loop.** One structured prompt returns all three analyses and the sub-scores. It is cheaper, faster, and far easier to explain than a multi-step agent. The assignment allowed LangGraph; I deliberately kept to a single LangChain call.
- **Scoring is rule-based, not learned.** The weighting (business 40%, growth 35%, risk 25%) is a transparent business rule. It is easy to defend in an interview and easy to tweak.
- **Offline fallback over hard failure.** A missing or rate-limited key falls back to deterministic output instead of erroring, so demos and CI never break.
- **No vector DB / RAG / real-time market data.** Out of scope for a 7-day build and not needed for the verdict logic.

## Future Improvements

- Pull in real financial data (revenue, margins) to ground the scores
- Let users adjust the score weighting and see the verdict change live
- Cache recent reports per company to avoid duplicate AI calls
- Add saved-company alerts when a re-run changes the verdict
