import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { supabase } from "@/libs/supabase";
import { Session } from "@supabase/supabase-js";

export default function Index() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    if (session === undefined) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!session) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return <Redirect href="/(tabs)" />;
}
