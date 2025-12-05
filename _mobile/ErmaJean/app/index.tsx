import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Redirect } from "expo-router";
import { supabase } from "@/libs/supabase";
import { Session } from "@supabase/supabase-js";

export default function Index() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    // Dev bypass for auth - allows UI development without authentication
    const devBypassAuth = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';

    useEffect(() => {
        // Skip auth check if dev bypass is enabled
        if (devBypassAuth) {
            setSession({} as Session); // Mock session
            setIsLoading(false);
            return;
        }

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error);
            }
            setSession(session);
            setIsLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [devBypassAuth]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10b981" />
                <Text className="mt-4 text-gray-600">Loading...</Text>
            </View>
        );
    }

    // Redirect based on auth state
    if (!session) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return <Redirect href="/(tabs)" />;
}
