import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { useEffect, useState } from 'react';
import { Profile } from '@/types/config';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace('/(auth)/sign-in');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <LinearGradient
                colors={['#10b981', '#059669']}
                className="pt-20 pb-10 px-6 rounded-b-[40px] shadow-lg"
            >
                <View className="items-center">
                    <View className="w-24 h-24 bg-white rounded-full justify-center items-center mb-4 shadow-md">
                        <Text className="text-4xl text-primary font-bold">
                            {profile?.name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-white mb-1">{profile?.name || 'User'}</Text>
                    <Text className="text-white/80">{profile?.email}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 -mt-6">
                <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">My Goals</Text>
                    <View className="space-y-4">
                        <GoalRow label="Calories" value={profile?.calorie_goal} unit="kcal" />
                        <GoalRow label="Protein" value={profile?.protein_goal} unit="g" />
                        <GoalRow label="Carbs" value={profile?.carb_goal} unit="g" />
                        <GoalRow label="Fat" value={profile?.fat_goal} unit="g" />
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Account</Text>
                    <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                        <FontAwesome name="star" size={20} color="#f59e0b" />
                        <Text className="flex-1 ml-3 text-gray-700">Subscription Plan</Text>
                        <Text className="text-gray-400">{profile?.has_access ? 'Premium' : 'Free'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                        <FontAwesome name="gear" size={20} color="#6b7280" />
                        <Text className="flex-1 ml-3 text-gray-700">Settings</Text>
                        <FontAwesome name="chevron-right" size={14} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-red-50 p-4 rounded-xl flex-row justify-center items-center mb-8"
                >
                    <FontAwesome name="sign-out" size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold ml-2">Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function GoalRow({ label, value, unit }: { label: string, value?: number, unit: string }) {
    return (
        <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">{label}</Text>
            <Text className="font-bold text-gray-900">{value || '-'} {unit}</Text>
        </View>
    );
}
