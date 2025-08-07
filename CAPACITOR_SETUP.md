# Capacitor Setup Guide for Ermajean

This guide will help you set up and run your Ermajean app as a native mobile application using Capacitor.

## Prerequisites

### Node.js Version
Capacitor requires Node.js version 20.0.0 or higher. You're currently using Node.js v18.17.0.

**To upgrade Node.js:**
1. Install Node Version Manager (nvm): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
2. Restart your terminal
3. Install Node.js 20: `nvm install 20`
4. Use Node.js 20: `nvm use 20`

### iOS Development (macOS only)
- Xcode 15.0 or later
- iOS 13.0 or later
- CocoaPods

### Android Development
- Android Studio
- Android SDK
- Java Development Kit (JDK) 17 or later

## Installation

1. **Install Capacitor CLI globally:**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run cap:build
   ```

## Platform Setup

### iOS Setup

1. **Add iOS platform:**
   ```bash
   npm run cap:add:ios
   ```

2. **Open in Xcode:**
   ```bash
   npm run cap:open:ios
   ```

3. **Run on iOS Simulator:**
   ```bash
   npm run cap:run:ios
   ```

### Android Setup

1. **Add Android platform:**
   ```bash
   npm run cap:add:android
   ```

2. **Open in Android Studio:**
   ```bash
   npm run cap:open:android
   ```

3. **Run on Android Emulator:**
   ```bash
   npm run cap:run:android
   ```

## Development Workflow

### Making Changes

1. **Develop your app** using the standard Next.js workflow:
   ```bash
   npm run dev
   ```

2. **Build and sync changes** to native platforms:
   ```bash
   npm run cap:build
   ```

3. **Open in native IDE** to test:
   ```bash
   npm run cap:open:ios    # or cap:open:android
   ```

### Live Reload (Development)

For live reload during development:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run with live reload:**
   ```bash
   npx cap run ios --livereload --external
   # or
   npx cap run android --livereload --external
   ```

## Available Scripts

- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:add:android` - Add Android platform
- `npm run cap:sync` - Sync web code to native platforms
- `npm run cap:open:ios` - Open iOS project in Xcode
- `npm run cap:open:android` - Open Android project in Android Studio
- `npm run cap:build` - Build web app and sync to native platforms
- `npm run cap:run:ios` - Run on iOS simulator/device
- `npm run cap:run:android` - Run on Android emulator/device

## Configuration

### Capacitor Config (`capacitor.config.ts`)

The main configuration file contains:
- App ID and name
- Web directory location
- Plugin configurations
- Platform-specific settings

### Platform-Specific Configurations

#### iOS (`ios/App/App/Info.plist`)
- App permissions
- URL schemes
- Device capabilities

#### Android (`android/app/src/main/AndroidManifest.xml`)
- App permissions
- Intent filters
- Activity configurations

## Troubleshooting

### Common Issues

1. **Node.js Version Error:**
   - Upgrade to Node.js 20+ using nvm

2. **Build Errors:**
   - Clear build cache: `npm run build -- --clean`
   - Delete `out` directory and rebuild

3. **iOS Build Issues:**
   - Update Xcode to latest version
   - Run `pod install` in `ios/App` directory
   - Clean build folder in Xcode

4. **Android Build Issues:**
   - Update Android Studio and SDK
   - Sync project with Gradle files
   - Clean and rebuild project

### Getting Help

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Community](https://github.com/ionic-team/capacitor/discussions)
- [Next.js Documentation](https://nextjs.org/docs)

## Deployment

### iOS App Store
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Submit for review

### Google Play Store
1. Generate signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Submit for review

## Notes

- The app is configured for static export (`output: 'export'` in `next.config.js`)
- Server-side features are disabled for mobile compatibility
- Images are set to `unoptimized: true` for better mobile performance
- Mobile-specific meta tags are included in the root layout
- Capacitor service provides device detection and native functionality 