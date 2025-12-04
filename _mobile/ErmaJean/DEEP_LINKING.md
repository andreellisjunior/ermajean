# Deep Linking Configuration

This document explains the deep linking setup for the ErmaJean mobile app.

## Overview

The app supports deep linking to recipe detail pages through multiple URL formats:

1. **Custom URL Scheme**: `ermajean://recipe/[id]`
2. **Universal Links (iOS)**: `https://ermajean.com/recipe/[id]`
3. **App Links (Android)**: `https://ermajean.com/recipe/[id]`

## Configuration

### app.json

The deep linking configuration is set up in `app.json`:

- **scheme**: `ermajean` - Custom URL scheme for the app
- **iOS associatedDomains**: Enables universal links for `ermajean.com`
- **Android intentFilters**: Enables app links with auto-verification
- **Bundle identifiers**: `com.ermajean.app` for both iOS and Android

### Linking Configuration

The linking configuration is defined in `app/_layout.tsx` and maps URLs to screens:

```typescript
{
  prefixes: [
    'ermajean://',
    'https://ermajean.com',
    'https://www.ermajean.com',
  ],
  config: {
    screens: {
      'recipe/[id]': 'recipe/:id',
      // ... other screens
    },
  },
}
```

## How It Works

1. **User shares a recipe**: The share button in the recipe detail screen generates a URL like `https://ermajean.com/recipe/abc123`

2. **Recipient taps the link**:
   - If the app is installed: Opens directly to the recipe detail screen
   - If the app is not installed: Opens the web version in the browser

3. **Navigation**: Expo Router automatically parses the URL and navigates to `app/recipe/[id].tsx` with the recipe ID as a parameter

## Testing Deep Links

### Development Testing

#### iOS Simulator
```bash
xcrun simctl openurl booted "ermajean://recipe/test-recipe-id"
xcrun simctl openurl booted "https://ermajean.com/recipe/test-recipe-id"
```

#### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "ermajean://recipe/test-recipe-id"
adb shell am start -W -a android.intent.action.VIEW -d "https://ermajean.com/recipe/test-recipe-id"
```

#### Expo Go
```bash
npx uri-scheme open "ermajean://recipe/test-recipe-id" --ios
npx uri-scheme open "ermajean://recipe/test-recipe-id" --android
```

### Production Testing

1. **Build the app** with EAS Build or standalone build
2. **Install on a device**
3. **Send yourself a test link** via Messages, Email, or Notes
4. **Tap the link** and verify the app opens to the correct recipe

## Universal Links Setup (iOS)

For universal links to work in production, you need to:

1. **Host an apple-app-site-association file** at `https://ermajean.com/.well-known/apple-app-site-association`

Example file:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.ermajean.app",
        "paths": ["/recipe/*"]
      }
    ]
  }
}
```

2. **Replace TEAM_ID** with your Apple Developer Team ID
3. **Ensure the file is served** with `Content-Type: application/json`

## App Links Setup (Android)

For app links to work in production, you need to:

1. **Host an assetlinks.json file** at `https://ermajean.com/.well-known/assetlinks.json`

Example file:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ermajean.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

2. **Get your SHA256 fingerprint** from your keystore
3. **Ensure the file is served** with `Content-Type: application/json`

## Troubleshooting

### Links open in browser instead of app

- **iOS**: Verify the apple-app-site-association file is accessible and properly formatted
- **Android**: Verify the assetlinks.json file is accessible and contains the correct SHA256 fingerprint
- **Both**: Ensure the app is installed and the bundle/package identifier matches

### Deep link doesn't navigate to the correct screen

- Check the linking configuration in `app/_layout.tsx`
- Verify the URL pattern matches the screen path
- Check the console for navigation errors

### Custom scheme works but universal/app links don't

- This is expected in development with Expo Go
- Universal and app links require a production build and proper domain verification files

## Related Files

- `app.json` - App configuration with deep linking setup
- `app/_layout.tsx` - Linking configuration and screen mapping
- `app/recipe/[id].tsx` - Recipe detail screen that handles the deep link
- `components/ui/RecipeModal.tsx` - Contains the share functionality

## Requirements Validation

This implementation satisfies:
- **Requirement 10.2**: Share button generates deep link with correct format
- **Requirement 10.3**: Opening a shared recipe link navigates to recipe detail view
