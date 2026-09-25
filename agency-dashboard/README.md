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

Demo local login:

- Email: `hello@safarihomes.co.ke`
- Password: `nyumba-demo`

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
