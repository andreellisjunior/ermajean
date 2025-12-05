import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { supabase } from "@/libs/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { AuthError } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function getErrorMessage(error: AuthError): string {
        if (error.message.includes("Invalid login credentials")) {
            return "Invalid email or password. Please try again.";
        }
        if (error.message.includes("Email not confirmed")) {
            return "Please verify your email address before signing in.";
        }
        if (error.message.includes("User not found")) {
            return "No account found with this email address.";
        }
        if (error.message.includes("network")) {
            return "Network error. Please check your connection and try again.";
        }
        if (error.message.includes("rate limit")) {
            return "Too many attempts. Please wait a moment and try again.";
        }
        if (error.message.includes("Password should be at least")) {
            return "Password must be at least 6 characters long.";
        }
        if (error.message.includes("Unable to validate email address")) {
            return "Please enter a valid email address.";
        }
        if (error.message.includes("User already registered")) {
            return "An account with this email already exists. Please sign in instead.";
        }
        
        return error.message || "An unexpected error occurred. Please try again.";
    }

    async function signUpWithEmail() {
        setErrorMessage("");
        
        // Validate inputs
        if (!email.trim()) {
            setErrorMessage("Please enter your email address.");
            return;
        }
        if (!password) {
            setErrorMessage("Please enter your password.");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            });

            if (error) {
                setErrorMessage(getErrorMessage(error));
            } else {
                Alert.alert(
                    "Success!",
                    "Check your inbox for email verification!",
                    [{ 
                        text: "OK",
                        onPress: () => router.replace("/sign-in")
                    }]
                );
            }
        } catch (err) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            console.error("Sign up error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function signInWithGoogle() {
        setLoading(true);
        setErrorMessage("");
        
        try {
            const redirectUrl = makeRedirectUri({
                scheme: undefined,
                path: 'auth/callback'
            });

            console.log('Redirect URL:', redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                }
            });

            if (error) {
                setErrorMessage(getErrorMessage(error));
                setLoading(false);
                return;
            }

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl
                );

                if (result.type === 'success' && result.url) {
                    const url = new URL(result.url);
                    const access_token = url.searchParams.get('access_token');
                    const refresh_token = url.searchParams.get('refresh_token');

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });

                        if (sessionError) {
                            setErrorMessage("Failed to establish session. Please try again.");
                            console.error("Session error:", sessionError);
                        }
                    } else {
                        setErrorMessage("Authentication failed. Please try again.");
                    }
                } else if (result.type === 'cancel') {
                    setErrorMessage("Sign in was cancelled.");
                }
            }
        } catch (err) {
            setErrorMessage("An error occurred with Google sign in. Please try again.");
            console.error("Google sign in error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#4A5D7C', '#5B7396', '#6B8AAF']}
                style={{ flex: 1 }}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView 
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 48 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            {/* Logo Section */}
                            <View style={{ alignItems: 'center', marginBottom: 40 }}>
                                <Image 
                                    source={require('@/assets/images/logo-color.png')}
                                    style={{ width: 200, height: 200 }}
                                    resizeMode="contain"
                                />
                                <Text style={{ 
                                    color: 'rgba(255, 255, 255, 0.9)', 
                                    fontSize: 14, 
                                    fontWeight: '300',
                                    textAlign: 'center',
                                    marginTop: 8,
                                    letterSpacing: 0.5
                                }}>
                                    Your personal recipe management and creation tool
                                </Text>
                            </View>

                            {/* Auth Card */}
                            <View style={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: 24, 
                                padding: 32,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 8
                            }}>
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={{ fontSize: 24, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
                                        Create your account
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6b7280' }}>
                                        Start managing your recipes today
                                    </Text>
                                </View>

                                {errorMessage ? (
                                    <View style={{ 
                                        backgroundColor: 'rgba(239, 68, 68, 0.9)', 
                                        padding: 12, 
                                        borderRadius: 12, 
                                        marginBottom: 16 
                                    }}>
                                        <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '500', fontSize: 14 }}>
                                            {errorMessage}
                                        </Text>
                                    </View>
                                ) : null}

                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 8 }}>Email</Text>
                                    <TextInput
                                        style={{ 
                                            backgroundColor: '#f9fafb', 
                                            color: '#111827', 
                                            padding: 16, 
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#d1d5db',
                                            fontSize: 16
                                        }}
                                        placeholder="you@example.com"
                                        placeholderTextColor="#9ca3af"
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            setErrorMessage("");
                                        }}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        editable={!loading}
                                    />
                                </View>

                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 8 }}>Password</Text>
                                    <TextInput
                                        style={{ 
                                            backgroundColor: '#f9fafb', 
                                            color: '#111827', 
                                            padding: 16, 
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#d1d5db',
                                            fontSize: 16
                                        }}
                                        placeholder="At least 6 characters"
                                        placeholderTextColor="#9ca3af"
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            setErrorMessage("");
                                        }}
                                        secureTextEntry
                                        editable={!loading}
                                    />
                                </View>

                                <View style={{ marginBottom: 24 }}>
                                    <Text style={{ color: '#374151', fontWeight: '500', marginBottom: 8 }}>Confirm Password</Text>
                                    <TextInput
                                        style={{ 
                                            backgroundColor: '#f9fafb', 
                                            color: '#111827', 
                                            padding: 16, 
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#d1d5db',
                                            fontSize: 16
                                        }}
                                        placeholder="Re-enter your password"
                                        placeholderTextColor="#9ca3af"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            setErrorMessage("");
                                        }}
                                        secureTextEntry
                                        editable={!loading}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={signUpWithEmail}
                                    disabled={loading}
                                    style={{ 
                                        borderRadius: 12, 
                                        marginBottom: 16, 
                                        overflow: 'hidden',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#4A5D7C', '#5B7396']}
                                        style={{ padding: 16 }}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <Text style={{ 
                                                textAlign: 'center', 
                                                fontWeight: '600', 
                                                color: '#ffffff', 
                                                fontSize: 16 
                                            }}>
                                                Sign Up
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    marginVertical: 24 
                                }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                                    <Text style={{ 
                                        marginHorizontal: 16, 
                                        color: '#6b7280', 
                                        fontSize: 14 
                                    }}>
                                        or continue with
                                    </Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                                </View>

                                <TouchableOpacity
                                    onPress={signInWithGoogle}
                                    disabled={loading}
                                    style={{ 
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#ffffff',
                                        borderWidth: 2,
                                        borderColor: '#d1d5db',
                                        borderRadius: 12,
                                        padding: 12,
                                        marginBottom: 24,
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                    <Image 
                                        source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjIuNTYgMTIuMjVjMC0uNzgtLjA3LTEuNTMtLjItMi4yNUgxMnY0LjI2aDUuOTJjLS4yNiAxLjM3LTEuMDQgMi41My0yLjIxIDMuMzF2Mi43N2gzLjU3YzIuMDgtMS45MiAzLjI4LTQuNzQgMy4yOC04LjA5eiIgZmlsbD0iIzQyODVGNCIvPjxwYXRoIGQ9Ik0xMiAyM2M0LjI1IDAgNy44MS0xLjQxIDEwLjQxLTMuODFsLTMuNTctMi43N2MtLjk4LjY2LTIuMjMgMS4wNi0zLjg0IDEuMDYtMi45NSAwLTUuNDUtMS45OS02LjM1LTQuNjZINC4zNHYyLjg0QzYuOTQgMjAuMzQgOS4zNCAyMyAxMiAyM3oiIGZpbGw9IiMzNEE4NTMiLz48cGF0aCBkPSJNNS42NSAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdINC4zNEMzLjQ5IDguNTUgMyAxMC4yMiAzIDEyczAuNDkgMy40NSAxLjM0IDQuOTNsMi4zMS0yLjg0eiIgZmlsbD0iI0ZCQkMwNSIvPjxwYXRoIGQ9Ik0xMiA1LjM4YzEuNjIgMCAzLjA2LjU2IDQuMjEgMS42NGwzLjE1LTMuMTVDMTcuNDUgMi4wOSAxNC45NyAxIDEyIDEgOS4zNCAxIDYuOTQgMy42NiA0LjM0IDguMDdsMS4zMSAyLjg0Yy45LTIuNjcgMy40LTQuNjYgNi4zNS00LjY2eiIgZmlsbD0iI0VBNDMzNSIvPjwvc3ZnPg==' }}
                                        style={{ width: 20, height: 20, marginRight: 12 }}
                                    />
                                    <Text style={{ 
                                        color: '#374151', 
                                        fontWeight: '500', 
                                        fontSize: 16 
                                    }}>
                                        Continue with Google
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => router.push('/sign-in')}
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.5 : 1 }}
                                >
                                    <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                                        Already have an account?{' '}
                                        <Text style={{ color: '#5B7396', fontWeight: '600' }}>
                                            Sign In
                                        </Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}
