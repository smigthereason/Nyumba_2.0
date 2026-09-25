# Nyumba Backend — Presentation Runbook

## What is ready

The repository now supports a production backend path built on Supabase/Postgres and a Next.js agency API. The former local JSON database remains only as a development/demo fallback.

Production backend capabilities include:

- agency signup/login with server-side password hashing and signed httpOnly sessions
- agency profile CRUD
- listing CRUD
- upcoming-project CRUD
- lead creation/inbox/status updates
- Supabase Auth-backed consumer profiles/favorites
- active-only public property access through RLS
- bounded/paginated catalogue queries
- database-side agency listing counts
- database indexes, including trigram indexes for text search
- structured API errors and request IDs
- payload limits, input validation and restricted browser CORS
- cross-instance database-backed rate limiting for public/sensitive endpoints
- health endpoint
- k6 catalogue/API smoke-load scripts

## Production setup

### 1. Supabase

Run these SQL files in order in the target Supabase project:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_production_hardening.sql`

For a demo environment only, then run:

3. `supabase/seed.sql`

Do not seed sample data into a real production database unless that is intentional.

### 2. Consumer app environment

Copy `.env.example` to `.env` and provide:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
EXPO_PUBLIC_API_URL=https://YOUR_AGENCY_API_HOST
```

### 3. Agency dashboard/API environment

Copy `agency-dashboard/.env.example` to `agency-dashboard/.env.local` and provide:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SESSION_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
ALLOWED_ORIGINS=https://YOUR_WEB_APP_HOST
```

Generate a session secret locally, for example:

```bash
openssl rand -hex 32
```

Never expose the service-role key in an `EXPO_PUBLIC_*` variable.

## Install and run

From the repository root:

```bash
npm ci
npm run start
```

In a second terminal:

```bash
cd agency-dashboard
npm ci
npm run dev
```

Use the actual script appropriate for your Expo target if `npm run start` opens the Expo launcher.

## Health check

After the dashboard/API is deployed or running:

```bash
curl -i https://YOUR_AGENCY_API_HOST/api/health
```

For a real production setup, confirm the body reports:

```json
{
  "ok": true,
  "mode": "supabase",
  "database": "ok"
}
```

If production reports local mode, stop the release and fix the server environment variables.

## Minimum presentation smoke test

1. Create an agency account.
2. Sign in and edit the agency profile.
3. Create an active listing.
4. Confirm the listing appears in the consumer app.
5. Submit a viewing request from the consumer app.
6. Confirm the lead appears in the agency inbox.
7. Change the lead to `contacted`.
8. Create an upcoming project and confirm it appears in the consumer app.
9. Call `/api/health` and show `mode: supabase`.
10. Explain that production capacity is demonstrated through measured load testing, not a code-review promise.

## Load-test commands

Install k6 on the machine used for testing, then run the public catalogue test:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_ANON_KEY=YOUR_ANON_KEY \
k6 run load-tests/catalog.js
```

Run the API health smoke test:

```bash
API_BASE_URL=https://YOUR_AGENCY_API_HOST \
k6 run load-tests/api-smoke.js
```

The scripts include latency/error thresholds. Run them against a non-production or production-like environment with the same infrastructure tier intended for launch.

## What to say about 1,000,000 users

Use this wording:

> The backend no longer relies on local files or unbounded catalogue reads. It is designed for horizontal API scaling, bounded database access, indexed search, RLS, database-backed rate limiting and production health monitoring. One million registered users is technically different from one million simultaneous requests, so final capacity is established by load testing the intended Supabase and hosting tiers. The repository includes the load-test gates needed to make that capacity decision from measured evidence.

Do not state that the system has already passed a one-million-concurrent-user test; that test has not been run against deployed infrastructure.

## Verification performed on this delivery

- TypeScript parser check across the repository: **125 TS/TSX files, 0 syntax errors**.
- Isolated semantic TypeScript check of the dashboard backend libraries and API routes: **passed**.
- Dashboard `package.json` and lockfile dependency maps: **matched**.
- SQL seed file checked for the previously broken literal `\\n` separators: **none remain**.
- A full `npm ci` / Next.js / Expo build could not be executed in the delivery sandbox because npm registry packages were not reachable. Run the install/build commands above on your connected development machine before presenting/deploying.

## Frontend

The backend has been kept separate from the frontend remediation. Read `docs/FRONTEND-AUDIT.md` before treating the purchase flow as production-ready. The payment/purchase path has P0 issues and must remain a demo/enquiry flow until payment and reservation are verified server-side.
