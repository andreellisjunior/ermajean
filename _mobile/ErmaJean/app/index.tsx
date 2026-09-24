import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { Redirect } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/libs/supabase";
import { Page, Title, S, Status } from "@/components/redesign/ui";
import { designPreview } from "@/utils/design-preview";
export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(data.session);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not open your kitchen. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
      setError("");
    });
    return () => subscription.unsubscribe();
  }, [load]);
  if (designPreview) return <Redirect href="/(tabs)" />;
  if (loading || error)
    return (
      <Page header={false}>
        <Title>ermajean.</Title>
        <Text style={S.body}>Getting your kitchen ready.</Text>
        <Status loading={loading} error={error} onRetry={load} />
      </Page>
    );
  return <Redirect href={session ? "/(tabs)" : "/(auth)/sign-in"} />;
}
