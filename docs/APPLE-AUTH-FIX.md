# Fix: Apple “authentication failure” with EAS / TestFlight

Expo login can work while **Apple** login still fails. EAS needs Apple to create a Distribution Certificate and Provisioning Profile.

Your Expo user: `farid_ali7`  
Apple Development identity on this Mac: `alifarid5@gmail.com`

---

## Path A (recommended): App Store Connect API key

Avoids password + 2FA prompts that often fail.

### 1. Create an API key

1. Open [App Store Connect → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api)
2. Click **Generate API Key** (or **+**)
3. Name: `EAS Nyumba`
4. Access: **Admin** (or **App Manager** + enough rights for certs/profiles)
5. Download the `.p8` file **once** (you can’t download it again)
6. Note:
   - **Issuer ID** (top of the page, UUID)
   - **Key ID**
   - Path to the `.p8` file (e.g. `~/Downloads/AuthKey_XXXXXXXX.p8`)

You must be on a **paid Apple Developer Program** team for this page to work fully.

### 2. Store the key for EAS (run in Terminal)

```bash
cd /Users/faridali/Nyumba

eas credentials --platform ios
```

Then choose roughly:

1. Production profile / distribution: **App Store**
2. **Set up / manage credentials**
3. Prefer options that use **App Store Connect API Key** when offered  
   Or set env vars before build (see below).

**Or** put secrets in the environment for one build:

```bash
export EXPO_ASC_API_KEY_PATH="$HOME/Downloads/AuthKey_XXXXXXXX.p8"
export EXPO_ASC_KEY_ID="YOUR_KEY_ID"
export EXPO_ASC_ISSUER_ID="YOUR_ISSUER_ID"

cd /Users/faridali/Nyumba
eas build --platform ios --profile production
```

(Exact env var names may show in the EAS prompt; if the CLI asks for path / key id / issuer, paste them interactively.)

### 3. Build

```bash
cd /Users/faridali/Nyumba
eas build --platform ios --profile production
```

---

## Path B: Fresh Apple ID login (password + 2FA)

Use this if you prefer not to create an API key.

### 1. Clear bad session (already done once; run again if it fails)

```bash
rm -rf ~/.app-store/auth
```

### 2. Use the same Apple ID as your Developer Program

- Prefer the account that owns the team (here likely **alifarid5@gmail.com**)
- Confirm membership is **Active**: https://developer.apple.com/account

### 3. Interactive build (not via automation)

```bash
cd /Users/faridali/Nyumba
eas build --platform ios --profile production
```

When prompted:

1. Log in to Apple → use correct email/password  
2. **2FA**: enter the code from a trusted device quickly  
3. If asked for an **app-specific password**:  
   - https://appleid.apple.com → Sign-In and Security → App-Specific Passwords  
   - Generate one named `EAS`  
   - Paste that (not your normal Apple password) if the CLI asks  

### 4. If 2FA keeps failing

- Don’t use SMS if possible; use the code on a logged-in Apple device  
- Disable VPN temporarily  
- Retry on a normal Terminal.app window (not a remote/headless session)

---

## Checklist if it still fails

| Check | How |
|-------|-----|
| Paid Apple Developer Program | developer.apple.com → membership Active |
| Same team as bundle ID | Bundle ID `com.nyumba.app` must exist under **that** team |
| Expo logged in | `eas whoami` → `farid_ali7` |
| Apple session cleared | `rm -rf ~/.app-store/auth` |
| Not using free personal team only | TestFlight needs paid program |
| App Store Connect access | Can open appstoreconnect.apple.com without errors |

---

## After credentials work

```bash
# Build
eas build --platform ios --profile production

# When build finishes
eas submit --platform ios --latest
```

Then: App Store Connect → TestFlight → Internal testing.

---

## Paste this if you need more help

Copy the **full error block** from Terminal (from “Failed” / “Authentication” down ~20 lines).  
Common strings:

- `Apple Authentication Error`
- `Your account information was entered incorrectly`
- `This request is forbidden for security reasons`
- `Unable to authenticate`
- `session expired`
