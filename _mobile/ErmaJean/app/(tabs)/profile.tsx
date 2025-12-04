import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { useEffect, useState } from 'react';
import { Profile, MacroGoals } from '@/types/config';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { GoalsFormModal } from '@/components/GoalsFormModal';
import { updateMacroGoals } from '@/services/profileService';
import { Haptic } from '@/utils/haptics';
import { Colors } from '@/constants/design';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [goalsModalVisible, setGoalsModalVisible] = useState(false);

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

    const handleEditGoals = async () => {
        await Haptic.buttonPress();
        setGoalsModalVisible(true);
    };

    const handleSaveGoals = async (goals: MacroGoals) => {
        try {
            const updatedProfile = await updateMacroGoals(goals);
            setProfile(updatedProfile);
            await Haptic.success();
        } catch (error) {
            console.error('Error saving goals:', error);
            await Haptic.error();
            Alert.alert('Error', 'Failed to save goals. Please try again.');
            throw error;
        }
    };

    const currentGoals: MacroGoals = {
        calories: profile?.calorie_goal || 2000,
        protein: profile?.protein_goal || 150,
        carbs: profile?.carb_goal || 200,
        fat: profile?.fat_goal || 65,
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#10b981" />
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
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-2xl font-bold text-white">{profile?.name || 'User'}</Text>
                        {profile?.has_access && (
                            <View className="bg-amber-400 px-3 py-1 rounded-full flex-row items-center gap-1">
                                <FontAwesome name="star" size={12} color="#fff" />
                                <Text className="text-white text-xs font-bold">Premium</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-white/80 mt-1">{profile?.email}</Text>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6 -mt-6" showsVerticalScrollIndicator={false}>
                {/* Macro Goals Card */}
                <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">My Goals</Text>
                        <TouchableOpacity
                            onPress={handleEditGoals}
                            className="bg-emerald-50 px-4 py-2 rounded-lg flex-row items-center gap-2"
                        >
                            <Ionicons name="pencil" size={16} color="#10b981" />
                            <Text className="text-emerald-600 font-semibold text-sm">Edit</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {profile?.calorie_goal || profile?.protein_goal || profile?.carb_goal || profile?.fat_goal ? (
                        <View className="space-y-4">
                            <GoalRow 
                                label="Calories" 
                                value={profile?.calorie_goal} 
                                unit="" 
                                icon="flame-outline"
                                color="#10b981"
                            />
                            <GoalRow 
                                label="Protein" 
                                value={profile?.protein_goal} 
                                unit="g" 
                                icon="fitness-outline"
                                color="#3b82f6"
                            />
                            <GoalRow 
                                label="Carbs" 
                                value={profile?.carb_goal} 
                                unit="g" 
                                icon="nutrition-outline"
                                color="#f59e0b"
                            />
                            <GoalRow 
                                label="Fat" 
                                value={profile?.fat_goal} 
                                unit="g" 
                                icon="water-outline"
                                color="#8b5cf6"
                            />
                        </View>
                    ) : (
                        <View className="py-6 items-center">
                            <Ionicons name="target-outline" size={48} color="#d1d5db" />
                            <Text className="text-gray-500 mt-2 text-center">No goals set yet</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                Tap Edit to set your daily macro targets
                            </Text>
                        </View>
                    )}
                </View>

                {/* Account Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Account</Text>
                    <View className="flex-row items-center py-3 border-b border-gray-100">
                        <View className="w-10 h-10 bg-amber-50 rounded-full justify-center items-center">
                            <FontAwesome name="star" size={18} color="#f59e0b" />
                        </View>
                        <View className="flex-1 ml-3">
                            <Text className="text-gray-900 font-medium">Subscription Plan</Text>
                            <Text className="text-gray-500 text-sm mt-0.5">
                                {profile?.has_access ? 'Premium Member' : 'Free Plan'}
                            </Text>
                        </View>
                        {profile?.has_access && (
                            <View className="bg-emerald-100 px-3 py-1 rounded-full">
                                <Text className="text-emerald-700 text-xs font-semibold">Active</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity className="flex-row items-center py-3">
                        <View className="w-10 h-10 bg-gray-50 rounded-full justify-center items-center">
                            <FontAwesome name="gear" size={18} color="#6b7280" />
                        </View>
                        <Text className="flex-1 ml-3 text-gray-900 font-medium">Settings</Text>
                        <FontAwesome name="chevron-right" size={14} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-red-50 p-4 rounded-xl flex-row justify-center items-center mb-8"
                >
                    <FontAwesome name="sign-out" size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold ml-2">Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Goals Form Modal */}
            <GoalsFormModal
                visible={goalsModalVisible}
                onClose={() => setGoalsModalVisible(false)}
                currentGoals={currentGoals}
                onSave={handleSaveGoals}
            />
        </View>
    );
}

interface GoalRowProps {
    label: string;
    value?: number;
    unit: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

function GoalRow({ label, value, unit, icon, color }: GoalRowProps) {
    return (
        <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: `${color}20` }}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text className="text-gray-700 font-medium">{label}</Text>
            </View>
            <Text className="font-bold text-gray-900 text-lg">
                {value || '-'}{value ? ` ${unit}` : ''}
            </Text>
        </View>
    );
}
