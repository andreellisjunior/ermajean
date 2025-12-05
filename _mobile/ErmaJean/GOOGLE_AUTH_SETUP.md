# Google Authentication Setup for ErmaJean Mobile App

## Overview
Since Google OAuth is already configured and working in your web app, you only need to add the mobile redirect URL to your existing Supabase configuration.

## Quick Setup (Since OAuth is Already Configured)

### Step 1: Add Mobile Redirect URL to Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your ErmaJean project
3. Navigate to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add:
   ```
   ermajean://auth/callback
   ```
5. Click **Save**

That's it! Your existing Google OAuth credentials will work for the mobile app.

### Step 2: Update Google Cloud Console (Optional but Recommended)

To ensure the best experience on mobile, you may want to add native OAuth clients:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your existing ErmaJean project
3. Navigate to **APIs & Services** → **Credentials**

#### Add iOS Client (Optional):
- Click **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **iOS**
- Bundle ID: `com.ermajean.app`
- This provides a better native experience on iOS

#### Add Android Client (Optional):
- Click **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **Android**
- Package name: `com.ermajean.app`
- Get your SHA-1 certificate fingerprint:
  ```bash
  # For debug builds
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

**Note:** The web OAuth client you're already using will work for mobile, but native clients provide a better UX.

## Step 3: Verify Environment Variables

Make sure your `.env.local` file in `_mobile/ErmaJean/` has the same Supabase credentials as your web app:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These should match the values in your web app's `.env.local` file.

## Step 4: Test the Integration

### Development Testing:
1. Start the Expo development server:
   ```bash
   npm start
   ```

2. Run on a device (not simulator for OAuth):
   ```bash
   npm run ios
   # or
   npm run android
   ```

3. Tap "Continue with Google" button
4. Complete the Google sign-in flow
5. You should be redirected back to the app and signed in

## Troubleshooting

### Issue: "Redirect URL mismatch"
- Verify the redirect URL in Supabase matches: `ermajean://auth/callback`
- Check that the scheme in `app.json` is set to `"scheme": "ermajean"`

### Issue: "Invalid client" error
- Verify your Google OAuth credentials are correctly entered in Supabase
- Make sure you're using the Web application credentials (not iOS/Android)

### Issue: App doesn't redirect back after Google sign-in
- Check that `expo-web-browser` is installed
- Verify the deep link configuration in `app.json`
- Make sure `WebBrowser.maybeCompleteAuthSession()` is called

### Issue: Session not persisting
- Verify `expo-secure-store` is properly configured in `libs/supabase.ts`
- Check that `autoRefreshToken` and `persistSession` are set to `true`

## Deep Linking Configuration

The app is configured to handle these deep links:
- `ermajean://auth/callback` - OAuth callback
- `ermajean://recipe/[id]` - Recipe sharing (existing)

## Code Implementation

### Sign-In Flow:
1. User taps "Continue with Google"
2. `signInWithGoogle()` function is called
3. Supabase generates OAuth URL
4. `expo-web-browser` opens the URL
5. User completes Google sign-in
6. Google redirects to `ermajean://auth/callback`
7. `app/auth/callback.tsx` handles the redirect
8. Session is established with Supabase
9. User is redirected to main app

## Security Notes

- Never commit your `.env.local` file
- Use different OAuth credentials for development and production
- Regularly rotate your Supabase anon key if exposed
- Enable Row Level Security (RLS) on all Supabase tables

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
