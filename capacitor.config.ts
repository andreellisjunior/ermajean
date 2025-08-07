import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ermajean.app',
  appName: 'Ermajean',
  webDir: 'out',
  // For development, point to your local Next.js server
  server: {
    url: 'http://localhost:3000', // Change to your production server URL for production
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#999999"
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config; 