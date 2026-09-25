# Nyumba

House hunting for Kenya — **Uber Eats for real estate agencies**.

Browse trusted agencies, open their storefront, and explore sale & rent listings with prices, locations, and amenities. Built with **Expo / React Native**, Supabase/Postgres, and a Next.js agency dashboard/API. Mock data remains available for local demos.

## Features

- **Discover agencies** by county (Nairobi, Mombasa, Kisumu, Machakos, and more)
- **Agency storefronts** with rent / sale / featured tabs
- **Property detail** with gallery, amenities, viewing requests
- **Search & filters** (transaction type, property type, estate, beds, KES price)
- **Map explore** (native pins; web list + coords)
- **Auth** — optional login / signup (Supabase)
- **Favorites** — local + cloud when logged in
- **Call & WhatsApp** deep links
- **Onboarding** on first launch
- **Web** — same app in the browser (`npm run web`)

## Run (phone or web)

**Expo SDK 54** (works with App Store Expo Go).

```bash
cd Nyumba
npm install
npx expo start
```

- **iPhone:** Expo Go → scan QR (same Wi‑Fi). Tunnel: `npx expo start --tunnel`
- **Browser:** press `w` or `npm run web`
- **Export static web:** `npm run web:export`

### Live backend (Supabase/Postgres)

Without client keys, local development uses **demo mock data**. Production should use the live backend and fail-closed dashboard configuration described below.

1. Follow [`docs/SUPABASE-SETUP.md`](docs/SUPABASE-SETUP.md) and apply both database migrations.
2. Copy `.env.example` → `.env` and add your project URL, anon key, and API URL.
3. Configure `agency-dashboard/.env.local` from `agency-dashboard/.env.example`.
4. Restart Expo with cache clear: `npx expo start -c`.

### Agency dashboard (optional)

Agencies manage listings, leads, and bank details at `agency-dashboard/`:

```bash
cd agency-dashboard
npm install
npm run dev
```

Demo: `hello@safarihomes.co.ke` / `nyumba-demo`. See [`agency-dashboard/README.md`](agency-dashboard/README.md).

For viewing/purchase requests, set `EXPO_PUBLIC_API_URL=http://localhost:3000` locally (and the deployed API URL in production).

## Project structure

```
app/                 # Expo Router screens
agency-dashboard/    # Next.js agency back-office
src/
  components/        # UI building blocks
  context/           # App state (county, favorites, filters)
  data/
    mock/            # Kenya agencies, properties, locations
    repositories/    # Async APIs (swap for Supabase later)
    types.ts
  theme/             # Colors, spacing, typography
  utils/
```

## Production readiness

See [`docs/PRODUCTION-READINESS.md`](docs/PRODUCTION-READINESS.md) for deployment, security, scaling, load tests and the one-million-user capacity caveat. See [`docs/FRONTEND-AUDIT.md`](docs/FRONTEND-AUDIT.md) for the next UI/UX hardening pass.

## Demo pitch

Each real estate company is a “store.” Buyers and renters discover agencies, browse inventory, and contact agents instantly. Agencies use `agency-dashboard/` for listings and leads. Phase 2: shared Supabase backend.

## Note

The repository includes fictional seed data for demonstrations. Do not use that seed in a real production marketplace.
