import { useEffect, useState } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { exchangeAuthCode } from "@/libs/auth-callback";
import { supabase } from "@/libs/supabase";
import {
  Page,
  Title,
  S,
  C,
  Field,
  Action,
  Status,
} from "@/components/redesign/ui";
export default function ResetPassword() {
  const { code, error_description } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function verify() {
      try {
        if (error_description) throw Error(error_description);
        if (!code)
          throw Error(
            "This reset link is incomplete. Request a fresh link from sign in.",
          );
        await exchangeAuthCode(code);
        if (active) setReady(true);
      } catch (e) {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "This reset link could not be verified.",
          );
      }
    }
    void verify();
    return () => {
      active = false;
    };
  }, [code, error_description]);
  async function save() {
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords don’t match yet.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      router.replace("/(auth)/sign-in");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not update your password. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page header={false}>
      <Title>A fresh start.</Title>
      <Text style={S.body}>Choose a new password for your kitchen.</Text>
      {!ready ? (
        <Status
          loading={!error}
          error={error}
          onRetry={() => router.replace("/(auth)/sign-in")}
        />
      ) : (
        <>
          <Field
            accessibilityLabel="New password"
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
          <Field
            accessibilityLabel="Confirm new password"
            placeholder="Confirm new password"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            autoComplete="new-password"
          />
          {!!error && (
            <Text
              accessibilityRole="alert"
              style={[S.body, { color: C.tomato }]}
            >
              {error}
            </Text>
          )}
          <Action
            label={busy ? "Updating…" : "Update password"}
            disabled={busy}
            onPress={() => void save()}
          />
        </>
      )}
      <Action
        secondary
        label="Back to sign in"
        onPress={() => router.replace("/(auth)/sign-in")}
      />
    </Page>
  );
}
