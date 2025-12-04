import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { supabase } from "@/libs/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        else Alert.alert("Check your inbox for email verification!");
        setLoading(false);
    }

    return (
        <View className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                className="flex-1 justify-center px-8"
            >
                <Text className="text-4xl font-bold text-white mb-8 text-center">ErmaJean</Text>

                <View className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
                    <TextInput
                        className="bg-white/20 text-white p-4 rounded-xl mb-4 placeholder:text-gray-300"
                        placeholder="Email"
                        placeholderTextColor="#ccc"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <TextInput
                        className="bg-white/20 text-white p-4 rounded-xl mb-6 placeholder:text-gray-300"
                        placeholder="Password"
                        placeholderTextColor="#ccc"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        onPress={signInWithEmail}
                        disabled={loading}
                        className="bg-white p-4 rounded-xl mb-4"
                    >
                        <Text className="text-center font-bold text-primary text-lg">
                            {loading ? "Loading..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={signUpWithEmail}
                        disabled={loading}
                    >
                        <Text className="text-center text-white font-medium">
                            Don't have an account? Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}
