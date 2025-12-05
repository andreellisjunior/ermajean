import { useState } from "react";
import { View, Text, Alert, Image, ScrollView, TouchableOpacity } from "react-native";
import { supabase } from "@/libs/supabase";
import { Stack, useRouter } from "expo-router";
import { AuthError } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { User, Mail, Lock, ArrowRight, ChefHat } from "lucide-react-native";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

WebBrowser.maybeCompleteAuthSession();

// Theme Constants derived from global config/mockup
const THEME = {
    colors: {
        background: 'bg-[#FDFBF7]',
        primary: 'bg-emerald-800',
    }
};

export default function AuthScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState(""); // For sign up

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function getErrorMessage(error: AuthError): string {
        if (error.message.includes("Invalid login credentials")) return "Invalid email or password.";
        if (error.message.includes("User not found")) return "No account found.";
        if (error.message.includes("User already registered")) return "Account already exists.";
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
                console.log('Sign in successful');
                router.replace('/(tabs)');
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
                    }
                }
            });

            if (error) {
                setErrorMessage(getErrorMessage(error));
            } else if (data.user && !data.session) {
                Alert.alert("Success!", "Check your email for verification.");
            } else if (data.session) {
                // Auto sign-in after sign-up
                console.log('Sign up successful');
                router.replace('/(tabs)');
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
                scheme: undefined,
                path: 'auth/callback'
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                }
            });

            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (result.type === 'success' && result.url) {
                    const url = new URL(result.url);
                    const access_token = url.searchParams.get('access_token');
                    const refresh_token = url.searchParams.get('refresh_token');

                    if (access_token && refresh_token) {
                        await supabase.auth.setSession({ access_token, refresh_token });
                    }
                }
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Google sign in failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className={`flex-1 flex-col justify-center p-6 ${THEME.colors.background}`}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View className="flex-1 flex-col justify-center max-w-md mx-auto w-full">
                    {/* Branding */}
                    <View className="items-center mb-10">
                        <View className="w-full h-24 mb-6 items-center justify-center">
                            <Image
                                source={require('@/assets/images/logo-color.png')}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>

                        <Text className="text-xl font-bold text-stone-800 mb-6 text-center">
                            Your personal recipe management and creation tool</Text>

                    </View>

                    {/* Form Card */}
                    <View className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border border-stone-100">
                        <Text className="text-2xl font-bold text-stone-800 mb-6">
                            {isLogin ? "Welcome Back!" : "Create Account"}
                        </Text>

                        {errorMessage ? (
                            <View className="bg-red-50 p-3 rounded-xl mb-4">
                                <Text className="text-red-600 text-center text-sm font-medium">
                                    {errorMessage}
                                </Text>
                            </View>
                        ) : null}

                        <View>
                            {!isLogin && (
                                <Input
                                    icon={User}
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            )}
                            <Input
                                icon={Mail}
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <Input
                                icon={Lock}
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                            />

                            {isLogin && (
                                <View className="flex-row justify-end mb-6">
                                    <TouchableOpacity>
                                        <Text className="text-sm font-medium text-emerald-700">
                                            Forgot Password?
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Button fullWidth onClick={handleAuth} disabled={loading}>
                                <Text className="text-white font-semibold">
                                    {isLogin ? "Sign In" : "Sign Up"}
                                </Text>
                                <ArrowRight size={18} color="white" />
                            </Button>

                            <View className="mt-4">
                                <Button fullWidth variant="secondary" onClick={signInWithGoogle} disabled={loading}>
                                    <Text className="text-stone-800 font-semibold">Sign in with Google</Text>
                                </Button>
                            </View>
                        </View>

                        <View className="mt-6">
                            <Text className="text-stone-500 text-center">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <Text
                                    onPress={() => {
                                        setIsLogin(!isLogin);
                                        setErrorMessage("");
                                    }}
                                    className="font-bold text-emerald-800"
                                >
                                    {isLogin ? "Sign Up" : "Log In"}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
