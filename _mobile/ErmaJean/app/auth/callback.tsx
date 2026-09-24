import { useEffect, useState } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/libs/supabase";
import { Page, Title, S, Status, Action } from "@/components/redesign/ui";
export default function AuthCallback() {
  const {
    access_token,
    refresh_token,
    error: errorCode,
    error_description,
  } = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function complete() {
      try {
        if (errorCode)
          throw Error(
            error_description || "Sign-in was not completed. Please try again.",
          );
        if (!access_token || !refresh_token)
          throw Error("This sign-in link is incomplete. Please sign in again.");
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;
        if (active) router.replace("/(tabs)");
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : "Could not complete sign-in.",
          );
      }
    }
    void complete();
    return () => {
      active = false;
    };
  }, [access_token, refresh_token, errorCode, error_description]);
  return (
    <Page header={false}>
      <Title>Come on in.</Title>
      <Text style={S.body}>Finishing your sign-in.</Text>
      <Status
        loading={!error}
        error={error}
        onRetry={() => router.replace("/(auth)/sign-in")}
      />
      {!error && (
        <Action
          secondary
          label="Back to sign in"
          onPress={() => router.replace("/(auth)/sign-in")}
        />
      )}
    </Page>
  );
}
