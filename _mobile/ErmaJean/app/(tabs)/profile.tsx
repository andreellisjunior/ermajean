import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/libs/supabase';
import { useEffect, useState } from 'react';
import { Profile, MacroGoals } from '@/types/config';
import { router } from 'expo-router';
import { GoalsFormModal } from '@/components/GoalsFormModal';
import { updateMacroGoals } from '@/services/profileService';
import { Haptic } from '@/utils/haptics';
import { Settings, CreditCard, Bell, LogOut, ChevronRight, User, Crown, Flame, Activity, Wheat, Droplet, ChefHat } from 'lucide-react-native';

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
            <View className="flex-1 justify-center items-center bg-[#FDFBF7]">
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <ScrollView 
                className="flex-1 px-5"
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-3xl font-bold text-stone-800 font-serif mb-6">My Profile</Text>

               
                <View className="flex-row items-center gap-4 mb-8">
                    <View 
                        className="w-24 h-24 bg-emerald-200 rounded-full items-center justify-center border-4 border-white" // w-24 h-24 with border-4 border-white shadow-lg
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15, // shadow-lg
                            shadowRadius: 12, // shadow-lg
                            elevation: 8,
                        }}
                    >
                        <Text className="text-4xl font-bold text-emerald-800">
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-stone-800">{profile?.name || 'User'}</Text>
                        <Text className="text-stone-500 mb-2">{profile?.email}</Text>
                        {profile?.has_access && (
                            <View className="bg-amber-100 self-start px-2 py-0.5 rounded-md border border-amber-200 flex-row items-center gap-1">
                                <Crown size={12} color="#b45309" fill="#b45309" />
                                <Text className="text-amber-700 text-xs font-bold">Premium Plan</Text>
                            </View>
                        )}
                    </View>
                </View>

               
                <View className="mb-8">
                    <View className="flex-row justify-between items-end mb-4 px-1">
                        <Text className="font-bold text-stone-800 text-lg">Macro Goals</Text>
                        <TouchableOpacity onPress={handleEditGoals}>
                            <Text className="text-emerald-700 font-bold text-sm">Edit Goals</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap gap-3">
                        <GoalCard label="Calories" value={currentGoals.calories} unit="kcal" icon={Flame} color="text-orange-500" bg="bg-orange-50" />
                        <GoalCard label="Protein" value={currentGoals.protein} unit="g" icon={Activity} color="text-blue-500" bg="bg-blue-50" />
                        <GoalCard label="Carbs" value={currentGoals.carbs} unit="g" icon={Wheat} color="text-yellow-600" bg="bg-yellow-50" />
                        <GoalCard label="Fat" value={currentGoals.fat} unit="g" icon={Droplet} color="text-purple-500" bg="bg-purple-50" />
                    </View>
                </View>

               
                <View className="mb-8">
                    <Text className="font-bold text-stone-800 text-lg mb-4 px-1">Account Settings</Text>
                    <View 
                        className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1, // shadow-md
                            shadowRadius: 8, // shadow-md (changed from 4)
                            elevation: 4,
                        }}
                    >
                        <SettingItem icon={User} label="Personal Information" />
                        <SettingItem icon={Settings} label="Diet Preferences" />
                        <SettingItem icon={CreditCard} label="Subscription" value={profile?.has_access ? "Active" : "Free"} />
                        <SettingItem icon={Bell} label="Notifications" border={false} />
                    </View>
                </View>

               
                {!profile?.has_access && (
                    <View 
                        className="bg-emerald-900 p-5 rounded-2xl mb-8 relative overflow-hidden" // bg-emerald-900 with decorative elements
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15, // shadow-lg
                            shadowRadius: 12, // shadow-lg
                            elevation: 8,
                        }}
                    >
                        <View className="relative z-10">
                            <Text className="text-white font-bold text-lg mb-1">Upgrade to Premium</Text>
                            <Text className="text-emerald-200 text-sm mb-4">Get unlimited AI recipes and detailed analytics.</Text>
                            <TouchableOpacity className="bg-white py-2 px-4 rounded-lg self-start">
                                <Text className="text-emerald-900 font-bold">View Plans</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="absolute right-0 bottom-0 opacity-10" style={{ transform: [{ translateX: 16 }, { translateY: 16 }] }}>
                            <ChefHat size={120} color="white" />
                        </View>
                    </View>
                )}

               
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center gap-2 active:scale-95"
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold">Log Out</Text>
                </TouchableOpacity>

                <Text className="text-center text-stone-300 text-xs mt-8">Version 1.0.0</Text>
            </ScrollView>

            <GoalsFormModal
                visible={goalsModalVisible}
                onClose={() => setGoalsModalVisible(false)}
                currentGoals={currentGoals}
                onSave={handleSaveGoals}
            />
        </View>
    );
}

function GoalCard({ label, value, unit, icon: Icon, color, bg }: { label: string, value: number, unit: string, icon: any, color: string, bg: string }) {
    // Map Tailwind color classes to actual hex colors
    const colorMap: Record<string, string> = {
        'text-orange-500': '#f97316',
        'text-blue-500': '#3b82f6',
        'text-yellow-600': '#ca8a04',
        'text-purple-500': '#a855f7',
    };
    
    const iconColor = colorMap[color] || '#000000';
    
    return (
        <View 
            className={`${bg} p-4 rounded-2xl w-[48%] mb-1 grow`} // w-[48%] with grow for flexibility
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05, // shadow-sm
                shadowRadius: 2, // shadow-sm
                elevation: 2,
            }}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Icon size={20} color={iconColor} />
                <Text className={`font-bold text-xl ${color}`}>{value}</Text>
            </View>
            <Text className="text-stone-500 text-xs font-medium">{label}</Text>
        </View>
    )
}

function SettingItem({ icon: Icon, label, value, border = true }: { icon: any, label: string, value?: string, border?: boolean }) {
    return (
        <TouchableOpacity className={`p-4 flex-row items-center justify-between active:bg-stone-50 ${border ? 'border-b border-stone-100' : ''}`}>
            <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-stone-100 items-center justify-center">
                    <Icon size={16} color="#57534e" />
                </View>
                <Text className="text-stone-700 font-medium">{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                {value && <Text className="text-emerald-600 font-medium text-sm">{value}</Text>}
                <ChevronRight size={16} color="#d6d3d1" />
            </View>
        </TouchableOpacity>
    )
}
