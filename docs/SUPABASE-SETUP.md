# Supabase setup (Nyumba)

Nyumba supports mock/local data for development, but production is designed to use Supabase/Postgres plus the agency dashboard API.

## 1. Create the Supabase project

Create a project in a region appropriate for the target market and save the database credentials securely.

## 2. Apply database migrations

Run these in order through Supabase SQL Editor or the Supabase CLI:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_production_hardening.sql`

For a demo environment you may then run `supabase/seed.sql`. Do not seed fictional sample data into a real production marketplace.

## 3. Client configuration

Copy the root `.env.example` to `.env` and configure:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
EXPO_PUBLIC_API_URL=http://localhost:3000
```

The anon key is expected in the client. Never expose a service-role key in an `EXPO_PUBLIC_*` variable.

## 4. Agency dashboard / API configuration

Copy `agency-dashboard/.env.example` to `agency-dashboard/.env.local` and configure:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SESSION_SECRET=<random secret of at least 32 characters>
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000
```

For production, `ALLOWED_ORIGINS` should contain only real web origins. Native app requests normally do not include an `Origin` header.

## 5. Auth

Enable Email/Password under Supabase Authentication for consumer accounts. Consumer sign-up creates a `profiles` row through the database trigger.

Agency dashboard accounts use the dashboard's signed session cookie and server-only `agency_accounts` table. Create an agency through the dashboard signup flow in live mode.

## 6. Verify

- `GET <dashboard-api>/api/health` returns `ok: true`, `mode: "supabase"`.
- Consumer signup creates `auth.users` + `profiles`.
- Favorites persist to `favorites` and are isolated by RLS.
- Active catalogue data loads from Supabase.
- Guest viewing/purchase requests go through `EXPO_PUBLIC_API_URL/api/leads` and appear in the correct agency dashboard.
- Agency listing/project CRUD persists after dashboard restarts and across multiple app instances.

See `docs/PRODUCTION-READINESS.md` for scaling, security, deployment and load-test requirements.
