#!/bin/bash

echo "Setting up Capacitor for Ermajean..."

# Install dependencies first
echo "Installing dependencies..."
npm install

# Initialize Capacitor (skip if already exists)
echo "Initializing Capacitor..."
if [ ! -d "ios" ] && [ ! -d "android" ]; then
    npx @capacitor/cli init "Ermajean" "com.ermajean.app" --web-dir=out
fi

# Build the app for mobile first
echo "Building mobile version..."
npm run build:mobile

# Add iOS platform
echo "Adding iOS platform..."
npx @capacitor/cli add ios

# Add Android platform  
echo "Adding Android platform..."
npx @capacitor/cli add android

# Sync the built app
echo "Syncing app to platforms..."
npx @capacitor/cli sync

echo "Capacitor setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npx cap open ios' to open in Xcode"
echo "2. Run 'npx cap open android' to open in Android Studio"
echo "3. Or run 'npx cap run ios' or 'npx cap run android' to run directly"