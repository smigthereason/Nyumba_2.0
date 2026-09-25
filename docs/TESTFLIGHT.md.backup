# Nyumba → TestFlight (checklist)

## What you need

1. **Expo account** — logged in as the project owner (`npx expo whoami`)
2. **Apple Developer Program** — paid membership (~$99/year) at [developer.apple.com](https://developer.apple.com)
3. Same Apple ID access to **App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com))

Expo Go is **not** used for TestFlight. EAS builds a real `.ipa` and uploads it to App Store Connect.

## One-time setup

### 1. Confirm project config

- Bundle ID: `com.nyumba.app` (must match App Store Connect)
- EAS project already linked in `app.json`

### 2. Create the app in App Store Connect (if missing)

1. Open [App Store Connect → My Apps → +](https://appstoreconnect.apple.com)
2. **New App**
3. Platform: iOS  
4. Name: Nyumba  
5. Bundle ID: register `com.nyumba.app` in [Certificates, IDs & Profiles](https://developer.apple.com/account/resources/identifiers/list) if needed, then select it  
6. SKU: e.g. `nyumba-ios-001`  
7. User Access: Full Access  

### 3. Build for the App Store (must be interactive once)

Apple signing **cannot** be set up non-interactively the first time. Run this **in your own Terminal** (not a headless agent):

```bash
cd /Users/faridali/Nyumba
npx eas build --platform ios --profile production
```

When prompted:

1. **Generate a new Apple Distribution Certificate?** → Yes (or use existing if you have one)
2. **Generate a new Provisioning Profile?** → Yes  
3. Log in with your **Apple ID** that is on the paid Developer Program  
4. Complete **2FA** if asked  
5. Select your **Team** if you have more than one  

Build runs in the cloud (~10–20 minutes). Track it at [expo.dev](https://expo.dev) → `@farid_ali7/Nyumba` → Builds.

Or build **and** submit in one go (after credentials exist):

```bash
npm run build:ios:submit
```

### 4. Submit to App Store Connect (if you didn’t use auto-submit)

```bash
npm run submit:ios
```

### 5. Finish TestFlight in App Store Connect

1. [App Store Connect](https://appstoreconnect.apple.com) → **Nyumba** → **TestFlight**
2. Wait for processing (often 5–30 minutes after upload)
3. Answer **Export Compliance** if asked (encryption: **No** — already set in app config)
4. Add **Internal Testing** group (your team with App Store Connect access) — usually no Beta App Review
5. Or **External Testing** — needs Beta App Review (can take a day+)
6. Testers install **TestFlight** from the App Store and accept the invite

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run build:ios` | Production iOS build (store / TestFlight) |
| `npm run submit:ios` | Upload latest iOS build to App Store Connect |
| `npm run build:ios:submit` | Build + submit automatically |
| `eas build:list --platform ios` | See recent builds |
| `eas credentials -p ios` | Manage signing credentials |

## Version bumps

- **User-facing version** (`1.0.0`): change `version` in `app.json` when you ship a meaningful release
- **Build number**: `eas.json` has `"autoIncrement": true` on production so each EAS build bumps the build number remotely

## Common failures

| Error | Fix |
|-------|-----|
| No Apple Developer membership | Enroll and wait until active |
| Bundle ID not available | Change `ios.bundleIdentifier` to something unique (e.g. `com.yourname.nyumba`) **before** first successful build, then match App Store Connect |
| Login session expired | Re-run build/submit; complete Apple 2FA |
| Missing compliance | Set encryption to No (already in `app.json`) |
| “Invalid binary” / maps | Usually fine with Expo; check build logs on expo.dev |

## Notes for Nyumba specifically

- Current app is still **demo/mock data** — fine for internal TestFlight
- Location permission string is set for the map
- After Supabase is wired, ship a new build (bump version if you want testers to notice)

## Privacy (when you go external / App Store)

Before public App Store release you’ll need Privacy Policy URL and App Privacy answers. Internal TestFlight can proceed without a full store listing.
