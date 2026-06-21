# Testing Strategy

Mindora is tested at three layers of the test pyramid, with continuous
integration running the backend suite on every push.

```
        E2E (Cypress)          few, slow  — real browser, whole stack
      Integration (Supertest)  many       — HTTP against the Express app
   Unit + model (Jest)         most, fast  — isolated logic
```

## Backend — Jest + Supertest + in-memory MongoDB

- **188 tests** covering every REST resource (users, videos, comments, likes,
  playlists, subscriptions, tweets, notifications, dashboard, healthcheck).
- Each test runs against an **in-memory MongoDB** (`mongodb-memory-server`), so
  the suite is fully isolated, needs no external database, and runs anywhere
  (including CI). Collections are wiped between tests for deterministic runs.
- Cases include happy paths plus negative/authorization scenarios: missing or
  expired tokens, invalid ObjectIds, and cross-user access (e.g. deleting a
  resource you don't own returns 403).
- Coverage: routes, models, and middleware at 100%; overall ~79% line / ~64%
  branch. Business logic is the priority; infra glue (`index.js`, db connector)
  is excluded from coverage.

Run it:

```bash
cd Backend
npm install
npm test              # run the suite
npm run test:coverage # suite + coverage report (Backend/coverage/index.html)
```

No environment variables are required — safe test defaults are set in
`tests/setup.js`.

## Continuous Integration — GitHub Actions

`.github/workflows/ci.yml` runs on every push and pull request to `main`:
installs dependencies with `npm ci`, runs the backend suite with coverage, and
uploads the coverage report as a build artifact. Because the tests use an
in-memory database, no services need to be provisioned in CI.

## End-to-end — Cypress

`frontend/cypress/e2e/auth.cy.js` drives a real browser through full user
journeys (register → login, and a wrong-credentials rejection).

E2E needs the **whole stack running**: backend on `:3000` and frontend on
`:5173`. To avoid cross-origin/CORS issues the frontend must reach the API
through the Vite dev-server proxy (`/api` → `:3000`) rather than calling
`http://localhost:3000` directly. Point the app at the proxy by creating
`frontend/.env.development.local` (git-ignored, dev-only):

```
VITE_API_URL=/api/v1
```

Run it:

```bash
# 1. Backend (needs its own .env: MONGODB_URI, Cloudinary keys, JWT secrets)
cd Backend && npm run dev

# 2. Frontend + Cypress (in another terminal)
cd frontend && npm install
npm run dev            # leave running (uses the proxy via .env.development.local)
npm run cy:open        # interactive runner
# or headless:
npm run cy:run
```

> Note: the E2E register flow performs a **real** Cloudinary avatar upload and
> creates a real user (with a unique `cypress_<id>` name each run), so it needs
> the backend's live credentials. Making E2E fully self-contained (seeded data,
> no Cloudinary) is a planned follow-up.
