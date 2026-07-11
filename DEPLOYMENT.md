# Deployment Guide

NoteSync ships as two containers (Express API + nginx-served React build) plus MongoDB,
wired together with docker-compose and built/tested/published by GitHub Actions.

## What's here

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Multi-stage Node 20 alpine image, prod deps only, non-root user, healthcheck on `/api/health` |
| `frontend/Dockerfile` | CRA build stage → unprivileged nginx runtime (port 8080), SPA fallback + `/api` reverse proxy |
| `frontend/nginx.conf` | nginx config: security headers, static asset caching, `/api` → `backend:5000` proxy |
| `docker-compose.yml` | mongo + backend + frontend with healthchecks, resource limits, named volume; MongoDB is **not** exposed to the host |
| `.env.example` | Compose env template (`JWT_SECRET`, optional `GEMINI_API_KEY`, `FRONTEND_URL`) |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline (see below) |

## Run locally

```bash
cp .env.example .env      # then set a real JWT_SECRET
docker compose up --build
```

- App: http://localhost:3000 (nginx serves the React build and proxies `/api` to the backend)
- MongoDB data persists in the `mongo_data` named volume.
- The Gemini key is optional — without it the classical NLP pipeline still generates all notes.

## CI/CD pipeline

Triggers on pushes and PRs to `main`:

1. **backend-test** — Node 20, `npm ci`, `npm test` (Jest + Supertest + mongodb-memory-server;
   the mongod binary is cached between runs, no external DB needed).
2. **frontend-test** — Node 20, `npm ci`, `npm test`, `npm run build` (CI mode: warnings are errors).
3. **security-scan** — Trivy filesystem scan for CRITICAL/HIGH CVEs. **Non-blocking to start**;
   flip `continue-on-error` to `false` once the baseline is triaged.
4. **build-and-push** — only on push to `main`, after tests pass: builds both images and pushes to
   GHCR as `ghcr.io/<owner>/<repo>-backend` and `...-frontend`, tagged `latest` + commit SHA.
   Uses the built-in `GITHUB_TOKEN` — **no extra secrets needed**.

## Manual follow-ups (not automated on purpose)

- [ ] **Set a strong `JWT_SECRET`** everywhere the backend runs (compose `.env`, Vercel env, etc.).
      The code has a hardcoded fallback (`'your-secret-key-change-this'`) that must never be relied on in production.
- [ ] **Rotate the Gemini API key** — the previously committed key was suspended by Google after leaking.
      Generate a fresh one and set it only via env vars.
- [ ] **Rate limiting** — the public API has none. Consider `express-rate-limit` on `/api/auth/*`
      and `/api/summarize` before a real public launch (not added automatically since it changes runtime behavior).
- [ ] **GHCR visibility** — first push creates the packages as private; make them public or grant
      your deploy target pull access.
- [ ] **Vercel deployment** still works independently of Docker (`backend/vercel.json` untouched);
      decide whether to keep both paths or consolidate.
- [ ] If you put the containers behind a reverse proxy/CDN with TLS, set `FRONTEND_URL` to the real
      public origin so backend CORS stays locked down.
