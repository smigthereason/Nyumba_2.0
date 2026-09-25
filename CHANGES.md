# Client Update — Nyumba App + Agency Dashboard

The agency dashboard now lives at `agency-dashboard/` in this repo (Next.js).
Demo login: `hello@safarihomes.co.ke` / `nyumba-demo`. See that folder’s README.

This delivery covers every item requested, split across the existing **Nyumba
mobile app** (Expo/React Native) and a brand-new **Nyumba Agency Dashboard**
(Next.js web app) added at `agency-dashboard/`.

Both projects were installed, type-checked, and built successfully in this
environment before delivery (see verification notes below).

## Nyumba mobile app

| # | Request | Where |
|---|---|---|
| 1 | Login/signup screen | `app/(auth)/index.tsx`, `app/(auth)/signup.tsx` — wired into `AppContext` (`login`/`signup`/`logout`), gates access after onboarding |
| 2 | Short splash screen on loading | `src/components/AppSplash.tsx` — branded, animated, shown after the native splash hides |
| 3 | Search field on map + live location | `app/(tabs)/map.tsx` — search bar filters pins; "locate me" button uses `expo-location` |
| 4 | Rent + Buy filter on Discovery | `src/components/TransactionToggle.tsx`, wired into `app/(tabs)/index.tsx` |
| 5 | "Upcoming projects" in header, before the rent bar | `src/components/ProjectCard.tsx` + `app/project/[id].tsx`, positioned just above the Rent/Buy toggle on Discovery |
| 6 | Broken page | `app/+not-found.tsx` — rebuilt with full Nyumba branding |
| 7 | Confirmed page (request received) | `app/confirmed.tsx` — shown after both viewing requests and purchase invoices |
| 8 | Buy a House + invoice to agency bank account | `app/property/buy/[id].tsx` + `src/components/BankDetailsCard.tsx`; every mock agency now has real-shaped bank details (bank, account name/number, branch, paybill) |

Also added along the way (needed to support the above cleanly):
- `AuthUser`, `BankAccount`, `UpcomingProject` types
- `expo-location` (`~19.0.8`) and `expo-clipboard` (`~8.0.8`) — versions confirmed against Expo SDK 54's own bundled-module manifest
- Two pre-existing repo gaps fixed so `tsc --noEmit` passes cleanly: missing `expo-env.d.ts` and missing ambient type declarations for image imports (`src/types/assets.d.ts`)
- Logout wired into the Profile tab

## Nyumba Agency Dashboard (new — `agency-dashboard/`)

Next.js 16 (App Router, TypeScript, Tailwind v4), using the **exact same
color tokens** as the mobile app (`#0B6E4F` primary, `#C45C26` accent,
`#D4A017` gold, `#F7F8F6` background).

- Agency onboarding + login (`/onboarding`, `/login`) — scrypt-hashed passwords, httpOnly cookie session
- Dashboard overview with stats (`/dashboard`)
- Listings CRUD — add, edit, delete (`/dashboard/listings`, `/new`, `/[id]/edit`)
- Requests inbox for viewing & purchase leads (`/dashboard/leads`) — the `POST /api/leads` route is ready for the mobile app to call once it has a real backend
- Agency profile + **bank account settings** (`/dashboard/settings`) — this is what buyers see on the mobile app's Buy-a-House invoice screen
- Branded broken page (`not-found.tsx`)

Data persists to `agency-dashboard/data/db.json` (auto-seeded on first run) —
a prototype persistence layer consistent with the mobile app's existing
"mock data, Supabase-ready" approach. See `agency-dashboard/README.md` for
setup and demo credentials.

## Verification performed in this environment

- Mobile app: `npm install` + `npx tsc --noEmit` → **0 errors**
- Dashboard: `npm install` + `npx tsc --noEmit` → **0 errors**; `npm run build` → **succeeds, all 18 routes compile**
- Dashboard: live smoke-tested with the production server — signup, login (correct/incorrect credentials), protected-route redirects, listings CRUD, lead submission, and the 404 page all verified working end-to-end via curl

## Note on delivery

I don't have push access to `github.com/Faridsunkar777/Nyumba`, so this is
delivered as a zip rather than a PR/branch. To apply it: unzip over your
existing local clone (or push it as a new branch) — file paths match the
original repo structure, with `agency-dashboard/` as a new top-level folder.

`node_modules/` was removed from both projects before zipping to keep the
download small — run `npm install` in each folder before running them.
