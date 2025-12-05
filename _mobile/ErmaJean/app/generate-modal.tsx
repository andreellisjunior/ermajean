import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { X, Sparkles, Clock, ChefHat, Leaf, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/libs/api';

export default function GenerateRecipeModal() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [selectedTime, setSelectedTime] = useState<'< 30m' | '30-60m' | '60m+'>('30-60m');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            Alert.alert('Input Required', 'Please tell the chef what you want to cook!');
            return;
        }

        setLoading(true);
        try {
            // Call API to generate recipe
            // For now, we simulate a delay and mock success or use real API if available
            // Assuming apiClient.post('/recipes/generate', { prompt, ... }) exists or we mock it

            // Mocking for UI demonstration as per instruction to focus on UI
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app, this would return a recipe ID or data
            // router.replace(`/recipe/${newRecipeId}`);
            Alert.alert('Coming Soon', 'AI Generation logic is connected but waiting for backend endpoint integration.', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error) {
            console.error('Generation failed:', error);
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
                            onPress={() => router.back()}
                            className="w-8 h-8 bg-stone-100 rounded-full items-center justify-center"
                        >
                            <X size={18} color="#57534e" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">

                        <Text className="text-stone-500 mb-6 leading-6">
                            Describe what you have in your fridge or what you're craving, and let our AI create the perfect recipe for you.
                        </Text>

                        {/* Input Area */}
                        <View className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6">
                            <TextInput
                                placeholder="e.g. I have chicken breast, spinach, and heavy cream. Make something keto-friendly."
                                placeholderTextColor="#a8a29e"
                                multiline
                                numberOfLines={4}
                                className="text-stone-800 text-lg h-32 leading-6"
                                textAlignVertical="top"
                                value={prompt}
                                onChangeText={setPrompt}
                                autoFocus
                            />
                        </View>

                        {/* Options Grid */}
                        <Text className="font-bold text-stone-800 mb-4 px-1">Customize</Text>

                        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
                            {/* Time Selection */}
                            <View className="w-[48%]">
                                <Text className="text-xs text-stone-500 font-bold mb-2 uppercase tracking-wide">Time</Text>
                                <View className="gap-2">
                                    {(['< 30m', '30-60m', '60m+'] as const).map((time) => (
                                        <OptionButton
                                            key={time}
                                            label={time}
                                            icon={Clock}
                                            selected={selectedTime === time}
                                            onPress={() => setSelectedTime(time)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Skill Level Selection */}
                            <View className="w-[48%]">
                                <Text className="text-xs text-stone-500 font-bold mb-2 uppercase tracking-wide">Skill Level</Text>
                                <View className="gap-2">
                                    {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                                        <OptionButton
                                            key={level}
                                            label={level}
                                            icon={ChefHat}
                                            selected={selectedLevel === level}
                                            onPress={() => setSelectedLevel(level)}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>

                    </ScrollView>

                    {/* Footer Action */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                        className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-stone-100"
                    >
                        <TouchableOpacity
                            onPress={handleGenerate}
                            disabled={loading}
                            className="w-full"
                        >
                            <LinearGradient
                                colors={['#059669', '#047857']}
                                className="rounded-xl p-4 flex-row items-center justify-center gap-3 shadow-lg shadow-emerald-500/30"
                            >
                                {loading ? (
                                    <>
                                        <ActivityIndicator color="white" />
                                        <Text className="text-white font-bold text-lg">Thinking...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-white font-bold text-lg">Generate Recipe</Text>
                                        <ArrowRight size={20} color="white" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </View>
    );
}

function OptionButton({ label, icon: Icon, selected, onPress }: { label: string, icon: any, selected: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center gap-2 p-3 rounded-xl border ${selected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-stone-200'} transition-all`}
        >
            <Icon size={16} color={selected ? '#059669' : '#a8a29e'} />
            <Text className={`font-medium ${selected ? 'text-emerald-800' : 'text-stone-500'}`}>{label}</Text>
        </TouchableOpacity>
    )
}
