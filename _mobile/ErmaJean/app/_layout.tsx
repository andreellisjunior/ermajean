import { DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import * as Linking from "expo-linking";

import { useFonts } from "expo-font";

export const unstable_settings = {
  anchor: "(tabs)",
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
    Linking.createURL("/"),
    "ermajean://",
    "https://ermajean.com",
    "https://www.ermajean.com",
  ],
  config: {
    screens: {
      "(tabs)": {
        screens: {
          index: "",
          recipes: "recipes",
          generate: "generate",
          "meal-plans": "meal-plans",
          profile: "profile",
        },
      },
      "recipe/[id]": "recipe/:id",
      "(auth)/sign-in": "sign-in",
      modal: "modal",
    },
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces: require("../assets/fonts/Fraunces.ttf"),
    DMSans: require("../assets/fonts/DMSans.ttf"),
  });

  if (!fontsLoaded && !fontError) return null;
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipe/[id]"
          options={{ headerShown: false, title: "Recipe" }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="generate-modal"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
