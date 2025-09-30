# Capacitor Mobile App Setup

This project now supports mobile app development using Capacitor with a web view approach.

## Quick Start

1. **Install dependencies and setup Capacitor:**

   ```bash
   ./scripts/setup-capacitor.sh
   ```

2. **Or manually:**
   ```bash
   npm install
   npm run build:mobile
   npm run cap:add:ios
   npm run cap:add:android
   ```

## Development Workflow

### Web Development (SSR)

- Use `npm run dev` for regular web development with server-side rendering
- All your existing features work as normal

### Mobile Development

- Use `npm run build:mobile` to build the static version for mobile
- Use `npm run cap:sync` to sync changes to mobile platforms
- Use `npm run cap:open:ios` to open in Xcode
- Use `npm run cap:open:android` to open in Android Studio

## Key Features

- **Hybrid Approach**: Keep SSR for web, static export for mobile
- **Platform Detection**: Use `isCapacitor()`, `isIOS()`, `isAndroid()` utilities
- **Safe Area Support**: Automatic handling of device safe areas
- **Mobile Optimizations**: Touch-friendly targets, proper font sizes

## File Structure

```
├── capacitor.config.ts          # Capacitor configuration
├── next.config.js              # Web build (SSR)
├── next.config.mobile.js       # Mobile build (static)
├── utils/capacitor.ts          # Platform detection utilities
├── components/CapacitorLayout.tsx # Mobile-aware layout
└── scripts/setup-capacitor.sh  # Setup script
```

## Platform-Specific Code

```typescript
import { isCapacitor, isIOS, isAndroid } from '../utils/capacitor';

if (isCapacitor()) {
  // Mobile-specific code
}

if (isIOS()) {
  // iOS-specific code
}

if (isAndroid()) {
  // Android-specific code
}
```

## Building for Production

1. **Web**: `npm run build` (keeps SSR)
2. **Mobile**: `npm run build:mobile` (static export)
3. **Sync to mobile**: `npm run cap:sync`

## Notes

- The mobile version uses static export, so server-side features won't work in the app
- API routes will need to point to your deployed web server
- Consider environment variables for different API endpoints (web vs mobile)
