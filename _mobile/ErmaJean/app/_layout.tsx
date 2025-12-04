import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/libs/notifications';
import { supabase } from '@/libs/supabase';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Deep linking configuration for ErmaJean mobile app
 * 
 * This configuration enables the app to handle deep links from:
 * 1. Custom URL scheme: ermajean://recipe/[id]
 * 2. Universal links (iOS): https://ermajean.com/recipe/[id]
 * 3. App links (Android): https://ermajean.com/recipe/[id]
 * 
 * When a user taps a recipe link (e.g., from a shared message), the app will:
 * - Open automatically if installed
 * - Navigate directly to the recipe detail screen
 * - Fall back to the website if the app is not installed
 * 
 * Configuration in app.json:
 * - iOS: associatedDomains for universal links
 * - Android: intentFilters for app links with autoVerify
 * - scheme: "ermajean" for custom URL scheme
 */
export const linking = {
  prefixes: [
    Linking.createURL('/'),
    'ermajean://',
    'https://ermajean.com',
    'https://www.ermajean.com',
  ],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: '',
          recipes: 'recipes',
          generate: 'generate',
          'meal-plans': 'meal-plans',
          profile: 'profile',
        },
      },
      'recipe/[id]': 'recipe/:id',
      '(auth)/sign-in': 'sign-in',
      modal: 'modal',
    },
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>(undefined);
  const responseListener = useRef<Notifications.Subscription>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: true, title: 'Recipe' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
