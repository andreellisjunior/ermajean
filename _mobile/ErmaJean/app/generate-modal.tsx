import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { X, Sparkles, Clock, ChefHat, Leaf, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/libs/api';
import { Haptic } from '@/utils/haptics';

export default function GenerateRecipeModal() {
    const [craving, setCraving] = useState('');
    const [time, setTime] = useState('30');
    const [servings, setServings] = useState('2');
    const [ingredients, setIngredients] = useState('');
    const [dietary, setDietary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!craving.trim()) {
            await Haptic.warning();
            Alert.alert('Input Required', 'Please tell us what you\'re craving!');
            return;
        }

        setLoading(true);
        await Haptic.buttonPress();
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await Haptic.success();
            Alert.alert('Coming Soon', 'AI Generation is being integrated with the backend.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Generation failed:', error);
            await Haptic.error();
            Alert.alert('Error', 'Failed to generate recipe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                        <View className="flex-row items-center gap-2">
                            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                                <Sparkles size={18} color="#059669" />
                            </View>
                            <Text className="text-xl font-bold text-stone-800 font-serif">AI Chef</Text>
                        </View>
                        <TouchableOpacity
                            onPress={async () => {
                                await Haptic.light();
                                router.back();
                            }}
                            className="w-8 h-8 bg-stone-100 rounded-full items-center justify-center"
                        >
                            <View className="items-center justify-center">
                                <X size={18} color="#57534e" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
                        <Text className="text-stone-500 mb-6 leading-6">
                            Describe what you have in your fridge or what you're craving, and let our AI create the perfect recipe for you.
                        </Text>
                        {/* What are you craving? */}
                        <View className="mb-6">
                            <Text className="font-bold text-stone-800 mb-3">What are you craving?</Text>
                            <View className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                                <View className="flex-row items-start gap-3">
                                    <ChefHat size={20} color="#a8a29e" style={{ marginTop: 2 }} />
                                    <TextInput
                                        placeholder="e.g. A spicy pasta dish with chicken and lots of veggies..."
                                        placeholderTextColor="#a8a29e"
                                        multiline
                                        className="flex-1 text-stone-800 text-base"
                                        value={craving}
                                        onChangeText={setCraving}
                                        autoFocus
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Time and Servings */}
                        <View className="flex-row gap-4 mb-6">
                            <View className="flex-1">
                                <Text className="font-bold text-stone-800 mb-3">Time (min)</Text>
                                <View className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex-row items-center gap-3">
                                    <Clock size={20} color="#a8a29e" />
                                    <TextInput
                                        placeholder="30"
                                        placeholderTextColor="#a8a29e"
                                        keyboardType="number-pad"
                                        className="flex-1 text-stone-800 text-base"
                                        value={time}
                                        onChangeText={setTime}
                                    />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-stone-800 mb-3">Servings</Text>
                                <View className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex-row items-center gap-3">
                                    <ChefHat size={20} color="#a8a29e" />
                                    <TextInput
                                        placeholder="2"
                                        placeholderTextColor="#a8a29e"
                                        keyboardType="number-pad"
                                        className="flex-1 text-stone-800 text-base"
                                        value={servings}
                                        onChangeText={setServings}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* What's in your fridge? */}
                        <View className="mb-6">
                            <Text className="font-bold text-stone-800 mb-3">What's in your fridge?</Text>
                            <View className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                                <View className="flex-row items-start gap-3">
                                    <Leaf size={20} color="#a8a29e" style={{ marginTop: 2 }} />
                                    <TextInput
                                        placeholder="Chicken, broccoli, rice, garlic..."
                                        placeholderTextColor="#a8a29e"
                                        multiline
                                        className="flex-1 text-stone-800 text-base"
                                        value={ingredients}
                                        onChangeText={setIngredients}
                                    />
                                </View>
                            </View>
                            <Text className="text-stone-400 text-xs mt-2 ml-1">Optional: Leave blank if you want us to decide.</Text>
                        </View>

                        {/* Dietary Restrictions */}
                        <View className="mb-6">
                            <Text className="font-bold text-stone-800 mb-3">Dietary Restrictions</Text>
                            <View className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                                <TextInput
                                    placeholder="e.g. Vegetarian, Gluten-free, Keto..."
                                    placeholderTextColor="#a8a29e"
                                    className="text-stone-800 text-base"
                                    value={dietary}
                                    onChangeText={setDietary}
                                />
                            </View>
                        </View>

                    </ScrollView>

                    {/* Footer Action */}
                    <View
                        className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-100"
                        style={{ paddingBottom: 20, paddingTop: 16, paddingHorizontal: 24 }}
                    >
                        <TouchableOpacity
                            onPress={handleGenerate}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#059669', '#14b8a6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 12,
                                    paddingVertical: 16,
                                    paddingHorizontal: 24,
                                    shadowColor: '#059669',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    elevation: 8,
                                }}
                            >
                                <View className="flex-row items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="white" />
                                            <Text className="text-white font-bold text-lg">Thinking...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} color="white" />
                                            <Text className="text-white font-bold text-lg">Generate Recipe</Text>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}


