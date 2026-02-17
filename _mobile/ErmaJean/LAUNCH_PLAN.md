# ErmaJean Mobile App — Launch Plan

## What's Done

Everything below has been completed and merged into `mobile-rn`:

- [x] AGENTS.md files (root + mobile) with atomic commit rules
- [x] `eas.json` with development/preview/production build profiles
- [x] `app.json` updated — notifications plugin, runtimeVersion, EAS Update URL (placeholder project ID)
- [x] `package.json` — EAS build scripts, Jest + Testing Library configured
- [x] Push notifications enabled in `_layout.tsx`
- [x] Dev auth bypass removed from `index.tsx`
- [x] Forgot password wired with Supabase `resetPasswordForEmail`
- [x] Profile settings linked (Subscription → web dashboard, Upgrade → web pricing)
- [x] `explore.tsx` template placeholder deleted
- [x] 35 service-layer unit tests passing (recipe, meal plan, profile)

---

## What's Left

### Step 1 — Initialize EAS Project

**Why**: The `app.json` has a placeholder `your-project-id`. EAS needs a real project ID for builds and OTA updates to work.

```bash
cd _mobile/ErmaJean
eas init
```

This will:
- Create the project on Expo servers under the `bootstrapdev` account
- Output a project ID (UUID)
- May create/update `app.json` with `extra.eas.projectId` automatically

**After running**, verify `app.json` has:
```json
{
  "expo": {
    "owner": "bootstrapdev",
    "extra": {
      "eas": {
        "projectId": "<the-real-uuid>"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/<the-real-uuid>"
    }
  }
}
```

If `eas init` doesn't update the `updates.url`, manually replace `your-project-id` with the real UUID.

---

### Step 2 — Environment Variables

The app needs Supabase credentials. These should NOT be committed.

**Option A — `.env.local` file** (local dev):
```bash
# _mobile/ErmaJean/.env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Option B — EAS Secrets** (for cloud builds):
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

> **Important**: Do NOT set `EXPO_PUBLIC_DEV_BYPASS_AUTH` in production. That bypass has been removed from the code.

---

### Step 3 — Development Build (Test on Device)

A development build is required to test:
- Push notifications (don't work in Expo Go with SDK 54)
- Deep links (`ermajean://` scheme)
- Secure store (auth token persistence)
- Native modules (haptics, web browser for OAuth)

**iOS Simulator build**:
```bash
eas build --profile development --platform ios
```

**Physical device build** (change `eas.json` temporarily):
```json
// In eas.json, under development profile, change:
"ios": { "simulator": true }
// to:
"ios": { "simulator": false }
```
Then build and install via QR code or `eas build --profile development --platform ios`.

**Android emulator/device**:
```bash
eas build --profile development --platform android
```

**After installing the dev build**, start the dev server:
```bash
npx expo start --dev-client
```

---

### Step 4 — Manual QA Checklist

Test everything on the dev build before going to production. Use a real device for at least iOS.

#### Auth
- [ ] Fresh sign-up with email/password
- [ ] Sign in with existing email/password
- [ ] Google OAuth sign-in (opens web browser, returns to app)
- [ ] Forgot password sends reset email
- [ ] Sign out and redirect to sign-in screen
- [ ] App remembers session across cold starts (SecureStore)

#### Recipes
- [ ] Recipe list loads on home screen
- [ ] Pull-to-refresh works
- [ ] Search/filter recipes
- [ ] Tap recipe → detail view loads with ingredients + instructions
- [ ] Create manual recipe via RecipeFormModal
- [ ] AI recipe generation (requires premium or free credits)
- [ ] Delete a recipe (swipe or detail screen)

#### Meal Plans
- [ ] Weekly view loads with correct dates
- [ ] Add recipe to a meal slot (Breakfast/Lunch/Dinner)
- [ ] Remove recipe from slot
- [ ] Navigate between weeks
- [ ] Shopping list generates from planned meals
- [ ] Clear week function works

#### Profile
- [ ] Profile loads with user info and macro goals
- [ ] Edit macro goals via GoalsFormModal
- [ ] "View Plans" opens `ermajean.com/pricing` in browser
- [ ] "Subscription" opens `ermajean.com/dashboard` in browser
- [ ] Sign out works

#### Platform
- [ ] Push notification permission prompt appears on first launch
- [ ] Deep link `ermajean://recipe/<id>` opens correct recipe
- [ ] Dark mode respects system setting
- [ ] No crashes on any screen
- [ ] Haptic feedback fires on button taps
- [ ] Keyboard dismisses properly on all forms

---

### Step 5 — Clean Up Expo Template Assets

The `assets/images/` folder still has Expo template files that should be removed:
- `partial-react-logo.png` — Expo template leftover
- `react-logo.png` / `react-logo@2x.png` / `react-logo@3x.png` — Expo template leftover

Verify these aren't imported anywhere first, then delete them.

---

### Step 6 — App Icon & Splash Screen Audit

**Current state**:
- `icon.png` — exists (used for iOS app icon + notification icon)
- `splash-icon.png` — exists (splash screen)
- `android-icon-foreground.png` / `android-icon-background.png` / `android-icon-monochrome.png` — exists
- `favicon.png` — exists (web)

**Verify**:
- [ ] `icon.png` is 1024×1024, no transparency, no rounded corners (iOS adds them)
- [ ] Android adaptive icon foreground fits within the safe zone (66% of canvas)
- [ ] Splash screen looks good on small (iPhone SE) and large (iPhone 15 Pro Max) devices
- [ ] `android-icon-background.png` background color is `#E6F4FE` (matches `app.json`)

---

### Step 7 — Store Listing Preparation

#### Apple App Store (App Store Connect)

1. **Create App Store Connect record**:
   - Bundle ID: `com.ermajean.app`
   - Primary language: English (U.S.)
   - Category: Food & Drink

2. **Required metadata**:
   - App name: `ErmaJean` (max 30 chars)
   - Subtitle: e.g., "AI Recipes & Meal Planning" (max 30 chars)
   - Description: Full description (up to 4000 chars)
   - Keywords: comma-separated, max 100 chars total
   - Support URL: `https://ermajean.com` or `mailto:support@ermajean.com`
   - Privacy Policy URL: `https://ermajean.com/privacy`
   - Marketing URL (optional): `https://ermajean.com`

3. **Screenshots** (required):
   - 6.7" display (iPhone 15 Pro Max): 1290×2796 — minimum 3, recommend 5-8
   - 6.5" display (iPhone 14 Plus): 1284×2778 — optional but recommended
   - iPad Pro 12.9" 6th gen: 2048×2732 — only if `supportsTablet: true` (currently yes in `app.json`)

4. **Privacy Nutrition Labels**:
   - Data collected: Email address (for account), name (optional in profile)
   - Data linked to user: Email, usage data (recipe generation tracking)
   - Data not linked to user: Diagnostics
   - Tracking: No (unless analytics added later)

5. **Age rating**: 4+ (no objectionable content)

6. **Review notes**: Provide a test account (email + password) for Apple reviewers

#### Google Play Store (Play Console)

1. **Create app record**:
   - Package name: `com.ermajean.app`
   - Default language: English (United States)
   - App category: Food & Drink

2. **Required metadata**:
   - App name: `ErmaJean`
   - Short description: max 80 chars
   - Full description: max 4000 chars
   - Feature graphic: 1024×500 (required)
   - Screenshots: minimum 2, recommend 5-8 per device type
   - Phone screenshots: 16:9 or 9:16, min 320px, max 3840px

3. **Data safety section**:
   - Data collected: Email address, name
   - Data shared: None (no third-party sharing)
   - Security practices: Data encrypted in transit, data can be deleted (user can delete account)

4. **Content rating**: Complete the IARC questionnaire

5. **Start with internal testing track** before production release

---

### Step 8 — Subscription Strategy Notes

**v1.0 approach: Web-based subscriptions (no native IAP)**

The app currently routes users to the website for subscription management:
- "View Plans" → `https://ermajean.com/pricing`
- "Subscription" → `https://ermajean.com/dashboard`
- Subscription status is read from `profiles.has_access` in Supabase (already implemented)

**Language to avoid in the app and store listing**:
- Don't say "Subscribe", "Purchase", "Buy" inside the app
- Use "Manage account", "View plans on web", "Upgrade on ermajean.com"
- This reduces the chance Apple/Google flags the app for bypassing IAP

**If Apple/Google rejects** for not using native IAP:
- Implement RevenueCat as a follow-up (1-2 week effort)
- RevenueCat handles both Apple IAP and Google Play Billing
- Keep the web-based subscription as an alternative (reader rule allows this for content apps)

---

### Step 9 — Fill in EAS Submit Configuration

After creating App Store Connect and Play Console records, update `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "123456789",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

**For iOS**:
- `ascAppId`: Found in App Store Connect → App Information → Apple ID
- `appleTeamId`: Found in Apple Developer portal → Membership

**For Android**:
- Create a Google Cloud service account with Play Console API access
- Download the JSON key file
- Place it at `_mobile/ErmaJean/google-service-account.json`
- Add `google-service-account.json` to `.gitignore`

---

### Step 10 — Production Build & Submit

**Build**:
```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

Production builds will auto-increment build numbers (configured in `eas.json`).

**Submit**:
```bash
# iOS — submits to App Store Connect (then submit for review manually)
eas submit --platform ios --latest

# Android — submits to Play Console (start with internal testing track)
eas submit --platform android --latest
```

**Post-submit**:
1. Fill in all store metadata, screenshots, privacy info in App Store Connect / Play Console
2. Submit for App Review (iOS) / submit to internal testing → production (Android)
3. Apple review typically takes 24-48 hours; Google internal review is faster

---

### Step 11 — Post-Launch (OTA Updates)

For JavaScript-only changes after launch, use EAS Update instead of rebuilding:

```bash
eas update --branch production --message "fix: recipe card layout issue"
```

This pushes an OTA update to all users on the production channel. No store review needed.

> **Important**: Native changes (new native modules, `app.json` plugin changes, SDK upgrades) require a full rebuild and store submission.

---

## Quick Reference — Command Cheat Sheet

| Task | Command |
|------|---------|
| Initialize EAS project | `eas init` |
| Set EAS secret | `eas secret:create --scope project --name KEY --value "val"` |
| Dev build (iOS simulator) | `eas build --profile development --platform ios` |
| Dev build (Android) | `eas build --profile development --platform android` |
| Start dev client | `npx expo start --dev-client` |
| Preview build | `eas build --profile preview --platform all` |
| Production build | `eas build --profile production --platform all` |
| Submit iOS | `eas submit --platform ios --latest` |
| Submit Android | `eas submit --platform android --latest` |
| OTA update | `eas update --branch production --message "description"` |
| Run tests | `npm test` |
| Check build status | `eas build:list` |

---

## Estimated Timeline

| Step | Time | Notes |
|------|------|-------|
| 1. EAS Init | 5 min | Just run the command |
| 2. Env vars | 10 min | Set up `.env.local` + EAS secrets |
| 3. Dev build | 15-30 min | Build time on EAS servers |
| 4. Manual QA | 1-2 hours | Test everything on device |
| 5-6. Asset cleanup | 30 min | Remove template files, verify icons |
| 7. Store listings | 2-4 hours | Screenshots, descriptions, privacy labels |
| 8. Subscription review | 15 min | Verify language is store-safe |
| 9. Submit config | 15 min | Fill in ASC App ID, team ID, service account |
| 10. Production build + submit | 30-60 min | Build + upload + fill store metadata |
| 11. App review | 1-3 days | Waiting on Apple/Google |

**Total active work**: ~5-8 hours spread over 1-2 days, plus review wait time.
