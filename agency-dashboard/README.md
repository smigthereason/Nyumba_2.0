# Nyumba Agency Dashboard + API

Next.js back-office and server API for real-estate agencies on Nyumba.

Agencies can:

- create/sign in to a storefront account
- publish and update rent/sale listings
- manage upcoming projects
- receive and update viewing/purchase leads
- maintain storefront and bank/payment instructions

## Development

```bash
npm install
npm run dev
```

Without Supabase server credentials, development uses the local seeded `data/db.json` store. This mode is for demos only.

### Guest preview (local and production)

Both `/login` and `/onboarding` have a **Continue as guest** action.
It sets a signed HTTP-only guest cookie and displays self-contained sample agency,
listings, projects and leads — it never creates a Supabase user or reads actual
agency/customer records. Guest mode is **read-only**. Mutation APIs return HTTP 403;
server-side data functions also reject guest writes. Use **Exit preview** to return
to sign-in, or **Create an agency** in the preview banner to register a real account.

To run the guest preview security regression tests:

```bash
npm run test:guest
```

When Supabase credentials are absent, local development also seeds a demo account:
`hello@safarihomes.co.ke` / `nyumba-demo`. **These credentials do not automatically
exist in Supabase/production** and are no longer prefilled on the login form.

The authentication hero uses an Unsplash property photograph, which requires an
internet connection; the dark green background remains as the fallback. The logo
splash appears once per browser tab session and respects reduced-motion settings.

## Production

Copy `.env.example` to `.env.local` and set:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SECRET=...
ALLOWED_ORIGINS=https://nyumba.example
```

When Supabase server credentials are present, all dashboard CRUD uses persistent Postgres storage. `readDb()`/whole-file mutations are disabled on the production path.

### Health endpoint

```text
GET /api/health
```

A healthy production response includes `"ok": true` and `"mode": "supabase"`.

### Public lead endpoint

```text
POST /api/leads
```

The endpoint validates payloads and listing ownership/status, applies origin restrictions for browsers, applies rate limits, generates request IDs, and writes through the service-role backend. Configure the Expo app with `EXPO_PUBLIC_API_URL` so guest requests use this route rather than direct anonymous database inserts.

## Database

Apply both migrations:

1. `../supabase/migrations/001_init.sql`
2. `../supabase/migrations/002_production_hardening.sql`

The second migration adds production indexes, agency credentials, upcoming projects, atomic agency RPCs, rate-limit storage, stricter RLS and lead type support.

See `../docs/PRODUCTION-READINESS.md` for deployment and scaling guidance.
