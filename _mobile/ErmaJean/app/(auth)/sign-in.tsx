import { completeAuthUrl } from "@/libs/auth-callback";
import { Page, Title, S, C, Action, Field } from "@/components/redesign/ui";
import { useState } from "react";
import { View, Text, Alert, Image } from "react-native";
import { supabase } from "@/libs/supabase";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthError } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [isLogin, setIsLogin] = useState(mode !== "signup");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // For sign up

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function getErrorMessage(error: AuthError): string {
    if (error.message.includes("Invalid login credentials"))
      return "Invalid email or password.";
    if (error.message.includes("User not found")) return "No account found.";
    if (error.message.includes("User already registered"))
      return "Account already exists.";
    return error.message || "An unexpected error occurred.";
  }

  async function handleAuth() {
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (isLogin) {
      await signInWithEmail();
    } else {
      await signUpWithEmail();
    }
  }

  async function signInWithEmail() {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMessage(getErrorMessage(error));
      } else if (data.session) {
        // Successfully signed in - navigation will happen via onAuthStateChange
        console.log("Sign in successful");
        router.replace("/(tabs)");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMessage(getErrorMessage(error));
      } else if (data.user && !data.session) {
        Alert.alert("Success!", "Check your email for verification.");
      } else if (data.session) {
        // Auto sign-in after sign-up
        console.log("Sign up successful");
        router.replace("/(tabs)");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: makeRedirectUri({
            scheme: "ermajean",
            path: "reset-password",
          }),
        },
      );
      if (error) {
        setErrorMessage(error.message);
      } else {
        Alert.alert(
          "Check Your Email",
          "If an account exists with that email, you'll receive a password reset link.",
        );
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setErrorMessage("");

    try {
      const redirectUrl = makeRedirectUri({
        scheme: "ermajean",
        path: "auth/callback",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );
        if (result.type === "success" && result.url) {
          await completeAuthUrl(result.url);
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page header={false}>
      <Text style={[S.heading, { fontSize: 34 }]}>
        ermajean<Text style={{ color: C.tomato }}>●</Text>
      </Text>
      <Title>We got food{"\n"}at home.</Title>
      <Text style={S.body}>Turn what’s in your fridge into dinner.</Text>
      <View
        style={{
          backgroundColor: C.sage,
          borderRadius: 24,
          height: 210,
          overflow: "hidden",
        }}
      >
        <Image
          source={require("@/assets/redesign/ermajean.png")}
          style={{
            height: 240,
            width: 210,
            position: "absolute",
            right: 0,
            bottom: -10,
          }}
          resizeMode="contain"
        />
        <Text style={[S.heading, { width: "50%", padding: 22, fontSize: 24 }]}>
          Your AI kitchen helper.
        </Text>
      </View>
      <Text style={S.heading}>
        {isLogin ? "Welcome back, boss." : "Let’s get dinner handled."}
      </Text>
      {!!errorMessage && (
        <Text accessibilityRole="alert" style={[S.body, { color: C.tomato }]}>
          {errorMessage}
        </Text>
      )}
      {!isLogin && (
        <Field
          accessibilityLabel="Full name"
          placeholder="Full name"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
        />
      )}
      <Field
        accessibilityLabel="Email"
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        accessibilityLabel="Password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={isLogin ? "current-password" : "new-password"}
      />
      {isLogin && (
        <Action
          secondary
          label="Forgot password?"
          disabled={loading}
          onPress={() => void handleForgotPassword()}
        />
      )}
      <Action
        label={
          loading ? "One moment…" : isLogin ? "Sign in →" : "Create account →"
        }
        disabled={loading}
        onPress={() => void handleAuth()}
      />
      <Action
        secondary
        label="Continue with Google"
        disabled={loading}
        onPress={() => void signInWithGoogle()}
      />
      <Action
        secondary
        label={
          isLogin ? "New here? Create an account" : "I already have an account"
        }
        onPress={() => {
          setIsLogin(!isLogin);
          setErrorMessage("");
        }}
      />
    </Page>
  );
}
