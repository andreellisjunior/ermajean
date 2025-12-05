# Expo Go Development Setup

## The Issue You're Experiencing

When using Expo Go, the OAuth redirect URL is different from a standalone app. Instead of `ermajean://`, Expo Go uses URLs like:
- `exp://192.168.x.x:8081/--/auth/callback` (local network)
- `exp://localhost:8081/--/auth/callback` (localhost)
- `https://[random].exp.direct/--/auth/callback` (tunneling)

This is why the browser is staying on the web instead of redirecting back to your app.

## Quick Fix

### Step 1: Find Your Actual Redirect URL

1. Start your Expo dev server:
   ```bash
   npm start
   ```

2. Open the app in Expo Go on your device

3. Tap "Continue with Google"

4. Check the Metro bundler console - you should see a log like:
   ```
   Redirect URL: exp://192.168.1.100:8081/--/auth/callback
   ```

### Step 2: Add the URL to Supabase

1. Go to https://app.supabase.com
2. Select your ErmaJean project
3. Navigate to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add these patterns:

   ```
   exp://localhost:8081/--/auth/callback
   exp://192.168.*.*:8081/--/auth/callback
   https://*.exp.direct/--/auth/callback
   ```

   **Or** add the specific URL you saw in the console:
   ```
   exp://192.168.1.100:8081/--/auth/callback
   ```

5. Click **Save**

### Step 3: Test Again

1. Close and restart your Expo dev server
2. Reload the app in Expo Go
3. Try "Continue with Google" again
4. It should now redirect back to the app! ✅

## Understanding Expo Go URLs

### Development (Expo Go):
- Uses `exp://` scheme
- URL changes based on your network
- Includes the Metro bundler port (8081)
- Path is `/--/auth/callback`

### Production (Standalone Build):
- Uses your custom scheme: `ermajean://`
- Consistent URL: `ermajean://auth/callback`
- No port number needed

## Alternative: Use Expo Tunneling

If wildcard URLs don't work, you can use Expo's tunneling feature for a consistent URL:

```bash
npx expo start --tunnel
```

This gives you a URL like: `https://abc123.exp.direct/--/auth/callback`

Add this specific URL to Supabase and it will work consistently.

## For Production Builds

When you build a standalone app (not using Expo Go), you'll need to:

1. Add the production redirect URL to Supabase:
   ```
   ermajean://auth/callback
   ```

2. The code will automatically use the correct scheme based on whether you're in Expo Go or a standalone build.

## Debugging Tips

### Check the Console
The app logs the redirect URL being used. Look for:
```
Redirect URL: exp://...
```

### Test the URL
After adding the URL to Supabase:
1. Wait a few seconds for Supabase to update
2. Restart your Expo dev server
3. Reload the app in Expo Go
4. Try signing in again

### Still Not Working?

1. **Check Supabase Dashboard**
   - Make sure the URL is saved correctly
   - No typos in the URL
   - Wildcards are properly formatted

2. **Check Console for Errors**
   - Look for "Redirect URL mismatch" errors
   - Check if the URL in the error matches what you added

3. **Try Specific URL Instead of Wildcard**
   - Copy the exact URL from the console log
   - Add that specific URL to Supabase
   - This is more reliable than wildcards

4. **Restart Everything**
   - Stop Expo dev server
   - Close Expo Go app completely
   - Start Expo dev server again
   - Open app in Expo Go

## Common Expo Go Redirect URLs

Depending on your setup, you might see:

```
# Local network (most common)
exp://192.168.1.100:8081/--/auth/callback

# Localhost
exp://localhost:8081/--/auth/callback

# Tunneling
https://abc123.exp.direct/--/auth/callback

# LAN with different port
exp://10.0.0.5:8081/--/auth/callback
```

Add all the patterns you might use, or just add the specific one you see in your console.

## Summary

**For Expo Go Development:**
- Add `exp://` redirect URLs to Supabase
- Use wildcards or specific URLs
- Check console for the actual URL being used

**For Production:**
- Add `ermajean://auth/callback` to Supabase
- Build standalone app (not Expo Go)
- Test on real devices

The code is already set up to handle both cases automatically!
