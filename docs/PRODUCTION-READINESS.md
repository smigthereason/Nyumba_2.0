# Nyumba Production Readiness

## Status

Nyumba now has two explicit operating modes:

- **Development/demo:** local mock data and the dashboard's local JSON store.
- **Production:** Supabase/Postgres for persistent data plus the Next.js agency API for public lead submission and agency administration.

Production fails closed if the dashboard is missing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or a sufficiently strong `SESSION_SECRET`. The local JSON store is not used when the production database is configured.

## Backend architecture

```text
Expo / Web app
  |-- public catalogue reads --> Supabase REST/RPC (anon key + RLS)
  |-- auth/favorites ----------> Supabase Auth/Postgres (RLS)
  `-- viewing/purchase leads --> Next.js API
                                  |-- validation / origin policy
                                  |-- request IDs / structured errors
                                  |-- cross-instance rate limiting
                                  `-- service-role --> Supabase/Postgres

Agency dashboard
  `-- authenticated Next.js server/API
       |-- signed httpOnly session
       `-- scoped CRUD --> Supabase/Postgres service role
```

## What was hardened

- Replaced production dashboard dependence on `data/db.json` with persistent Supabase/Postgres operations.
- Bounded list queries to a maximum of 100 rows per request and added pagination parameters.
- Moved agency listing counts to a database RPC instead of downloading every property row to each client.
- Added composite indexes for common property, lead, favorites, county, agency, status and price access patterns.
- Added `upcoming_projects` as a real persisted table instead of a mock-only feature.
- Added agency credential storage behind server-only RLS and atomic RPCs for registration/profile changes.
- Restricted property RLS to active inventory for consumer reads.
- Removed anonymous direct lead inserts; guest lead creation goes through the API where validation and abuse controls run.
- Added a cross-instance database rate-limit primitive for login, signup and public lead endpoints.
- Replaced wildcard CORS with an allow-list (`ALLOWED_ORIGINS`).
- Added request body limits, structured API errors, request IDs, no-store headers and production security headers.
- Production session secrets must be at least 32 characters.
- Added `GET /api/health` for deployment/readiness checks.
- Fixed the previous double-write path that could create the same lead once through the dashboard API and again through Supabase.
- Fixed `supabase/seed.sql` where literal `\n` separators could make SQL execution invalid.

## Deployment checklist

1. Create/choose the Supabase production project in a region appropriate for the target audience.
2. Run, in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_production_hardening.sql`
   - `supabase/seed.sql` only for demo/non-production sample data.
3. Configure Expo/web client:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_API_URL=https://<agency-api-host>`
4. Configure the agency dashboard server:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` (random, >= 32 chars)
   - `ALLOWED_ORIGINS`
5. Deploy the dashboard/API on a horizontally scalable platform (for example Vercel, Fly, Render or a container platform).
6. Put CDN/WAF/rate limiting in front of public production traffic. The database limiter is a backstop, not a substitute for edge protection at very high traffic.
7. Verify `GET /api/health` returns `ok: true` and `mode: "supabase"`.
8. Run smoke, load, spike and soak tests against the production-like environment before a public launch.
9. Enable database backups/PITR appropriate to the Supabase plan and create alerts for database CPU, connections, latency, 5xx rate and rate-limit events.

## One-million-user statement

A code review cannot truthfully guarantee that **1,000,000 users joining at once** will never break a system. That depends on concurrency, request mix, database plan/connection limits, network/CDN capacity, image delivery, external services and deployment sizing.

The code has been changed so it can scale horizontally and avoids obvious O(N) catalogue scans, unbounded reads and local-file persistence. Before claiming a one-million-user capacity, run measured load tests on the intended production infrastructure and size the Supabase/API tiers from the results.

A useful capacity model is:

- **1,000,000 registered users** is not the same as 1,000,000 simultaneous requests.
- If 1% are concurrently active, design/load-test for ~10,000 active users plus spike headroom.
- Catalogue reads should be CDN/cache friendly and paginated.
- Writes (favorites, leads, signups) should be rate limited and measured separately.
- Images should be served from an image CDN/object store, not from the application server.

Suggested release gates:

- read API error rate `< 1%`
- write API error rate `< 0.5%`
- catalogue p95 `< 500 ms` from the target region under expected peak load
- lead creation p95 `< 800 ms`
- no sustained database connection saturation
- no 5xx burst during a 2x expected-peak spike

## Data and security notes

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never place it in an Expo `EXPO_PUBLIC_*` variable.
- Agency dashboard sessions use signed, httpOnly, Secure cookies in production.
- Public lead endpoints accept native requests without `Origin`; browser origins must be allow-listed.
- Business bank details are currently part of an agency's public storefront data because the current purchase UX displays them on an invoice. If bank instructions should only be visible after identity/payment checks, move them to a private table and serve them through an authenticated payment endpoint.

## Product viability notes

The marketplace model is viable as an MVP if Nyumba validates supply first: enough agencies with fresh inventory and a reliable lead-response loop. Straightforward monetisation options are agency subscriptions, promoted/featured inventory, and qualified-lead packages.

Do **not** treat the current "I've made payment" screen as a real payment system. For commercial launch, integrate a verifiable payment provider, create server-side invoices/idempotency keys, confirm payment by webhook, and handle reservation/availability atomically. Until then, keep the payment flow as a demo or enquiry flow.
