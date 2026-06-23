# AI Investment Research Agent

A small web app that does first-pass investment research on a company. You type a
company name, it looks at the business, growth, and risk side of things, scores it
out of 100, and tells you whether it's worth a closer look (Invest) or not (Pass).
Every report is saved and can be downloaded as a PDF.

I built this as a focused, explainable project rather than a kitchen-sink one. The
goal was a clean end-to-end flow: auth, research, a score I can actually justify,
and a verdict.

## What it does

- Sign up / log in (JWT kept in HTTP-only cookies, refreshed automatically)
- Search a company and run a research pass
- Get three short writeups: business, growth, and risk
- A 0-100 score and an Invest / Pass verdict
- History of everything you've researched
- Export any report to PDF

## How to run it

You need Python 3.12+, Node 20+, and (optionally) a Gemini API key.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # fill in the values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Runs on http://localhost:8000

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Runs on http://localhost:5173

### Environment variables

Backend (`backend/.env`):

| Key | What it's for |
|-----|----------------|
| `SECRET_KEY` | Django secret |
| `DEBUG` | `True` locally, `False` in production |
| `DATABASE_URL` | `sqlite:///db.sqlite3` for dev, a Postgres URL in prod |
| `FRONTEND_URL` | the frontend origin, for CORS |
| `GEMINI_API_KEY` | your Gemini key. Leave it blank and the app still runs (see below) |
| `GEMINI_MODEL` | defaults to `gemini-2.5-flash` |

Frontend (`frontend/.env`):

| Key | What it's for |
|-----|----------------|
| `VITE_API_URL` | base URL of the backend |

One thing I did on purpose: if there's no Gemini key, the app doesn't crash. It
falls back to a deterministic offline analysis so the whole flow still works for
local dev and tests. With a key set, you get the real model output.

## How it works

The backend is Django REST Framework, the frontend is React (Vite). They talk over
JSON, and auth tokens live in HTTP-only cookies so the frontend JS never touches
them.

The layering is intentionally boring so it's easy to follow:

- views stay thin (read the request, call a service, return the result)
- services hold the actual logic and orchestrate a research run
- the scoring math is its own small module
- anything to do with the model lives in one `ai/` package and nothing else imports it

A research run goes:

```
company name -> ai layer (LangChain + Gemini) -> score -> verdict -> save -> show
```

The AI layer asks Gemini for a structured JSON response (sector, three analyses,
and three sub-scores), and a parser pulls that apart. If the call fails for any
reason the offline fallback kicks in.

More detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and the endpoint list
is in [docs/API.md](docs/API.md).

### How the score is calculated

```
overall = business * 0.40 + growth * 0.35 + (100 - risk) * 0.25
verdict = Invest if overall >= 60, else Pass
```

Risk is flipped because a riskier company should score lower. Everything is clamped
to 0-100. I kept this as a plain rule rather than something learned so I can explain
exactly why any company got the verdict it did.

## Key decisions & trade-offs

- **One model call, not an agent loop.** A single structured prompt returns all
  three analyses and the sub-scores. It's cheaper, faster, and much easier to reason
  about than a multi-step agent.
- **The score is a rule, not a model.** Transparent and tweakable. I'd rather defend
  a clear weighting than a black box.
- **Fallback instead of failure.** A missing or rate-limited key shouldn't take the
  app down, so it degrades to offline output.
- **No market data / vector search / portfolio features.** Out of scope for what
  this is meant to show, and they'd add a lot of surface area for little gain here.

## Example runs

With a live key:

- Infosys -> sector: IT Services, verdict Invest, score 69
- Spotify -> sector: Digital Audio Streaming, verdict Invest

Without a key (offline fallback, deterministic from the name):

- Acme Corp -> Invest, score 64
- Globex -> Pass, score 52

## What I'd improve with more time

- Pull in real financials (revenue, margins) to ground the scores instead of relying
  only on the model's read
- Let the user adjust the weighting and watch the verdict change
- Cache recent reports per company so I'm not re-calling the model for the same name
- Alerts when a re-run flips a saved company's verdict

## Tech

React (Vite), Django REST Framework, PostgreSQL, LangChain + Gemini, JWT cookies,
Docker, GitHub Actions, deployed on Vercel (frontend) and Render (backend + db).
