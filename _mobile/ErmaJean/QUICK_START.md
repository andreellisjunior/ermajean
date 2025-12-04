# Quick Start - Mobile App Google Auth

Since Google OAuth is already working in your web app, here's what you need to do:

## ✅ Already Done (by me)
- [x] Enhanced auth screen UI with logo and brand colors
- [x] Added "Continue with Google" button
- [x] Implemented OAuth flow with expo-web-browser
- [x] Created callback handler at `app/auth/callback.tsx`
- [x] Configured deep linking in `app.json`
- [x] Installed `expo-auth-session` package

## 🔧 You Need to Do

### 1. Add Expo Go Redirect URL to Supabase (2 minutes)

Since you're using Expo Go for development, you need to add the Expo Go redirect URL:

1. Go to https://app.supabase.com
2. Select your ErmaJean project
3. Go to **Authentication** → **URL Configuration**
4. Add these redirect URLs:
   ```
   exp://localhost:8081/--/auth/callback
   exp://192.168.*.*/--/auth/callback
   https://*.exp.direct/--/auth/callback
   ```
   
   **Note:** The wildcard patterns allow Expo Go to work on different network configurations.

5. For production builds (later), also add:
   ```
   ermajean://auth/callback
   ```
6. Click **Save**

### 2. Verify Environment Variables (1 minute)
Check that `_mobile/ErmaJean/.env.local` has the same Supabase credentials as your web app:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Test on a Real Device (5 minutes)
OAuth doesn't work well in simulators, so test on a physical device:

```bash
# Start the dev server
npm start

# Run on your device
npm run ios
# or
npm run android
```

Then:
1. Tap "Continue with Google"
2. Sign in with Google
3. You should be redirected back to the app and signed in ✅

## That's It!

Your existing Google OAuth setup will work for mobile. The web OAuth client credentials you're already using in Supabase will handle mobile authentication too.

## Optional: Native OAuth Clients

For a better native experience (optional), you can add iOS/Android OAuth clients in Google Cloud Console. See `GOOGLE_AUTH_SETUP.md` for details. But this is NOT required - the web client works fine.

## Troubleshooting

**Issue: "Redirect URL mismatch"**
- Make sure you added the Expo Go redirect URLs to Supabase
- Check the console log for the actual redirect URL being used
- Add that specific URL to Supabase if needed

**Issue: Browser doesn't redirect back / stays on web**
- This is the Expo Go redirect URL issue
- Make sure you added the wildcard patterns to Supabase
- Try adding the specific URL shown in the console log
- Restart the Expo dev server after adding URLs

**Issue: "Invalid client"**
- Your existing Google OAuth credentials should work
- Verify they're correctly entered in Supabase (same as web app)

## Files Modified

```
_mobile/ErmaJean/
├── app/(auth)/sign-in.tsx       # Enhanced with Google Sign-In
├── app/auth/callback.tsx        # NEW - OAuth callback handler
├── app.json                     # Updated deep linking config
└── package.json                 # Added expo-auth-session
```
