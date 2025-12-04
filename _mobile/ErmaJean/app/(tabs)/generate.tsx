import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/libs/api';
import { Recipe } from '@/types/config';
import { router } from 'expo-router';

export default function GenerateScreen() {
    const [ingredients, setIngredients] = useState('');
    const [taste, setTaste] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!ingredients) {
            Alert.alert('Missing Ingredients', 'Please enter some ingredients to get started.');
            return;
        }

        setLoading(true);
        try {
            // Call the API
            const response = await apiClient.post('/generate-recipe', {
                ingredients: ingredients.split(',').map(i => i.trim()),
                taste,
                total_time: time,
                serving: 2, // Default
                course: 'Main Course', // Default
                restrictions: [], // Default
            });

            // Navigate to a results screen or show modal (for now, just log and alert)
            // In a real app, we'd pass this data to a "Results" screen
            // For this elite MVP, let's just show the first one or save it?
            // The web app likely saves it or shows a list.
            // The API returns a list of recipes.

            if (Array.isArray(response) && response.length > 0) {
                // We could navigate to a "Recipe Preview" screen with the data
                // For now, let's just alert success
                Alert.alert('Success', `Generated ${response.length} recipes!`);
                console.log(response);
            } else {
                Alert.alert('No recipes generated', 'Try different ingredients.');
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to generate recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="px-6 py-8">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">AI Chef</Text>
                        <Text className="text-gray-500 mb-8">Tell us what you have, and we'll cook up something magic.</Text>

                        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                            <Text className="font-bold text-gray-700 mb-2">Ingredients</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4 h-32"
                                placeholder="Chicken, rice, broccoli..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                textAlignVertical="top"
                                value={ingredients}
                                onChangeText={setIngredients}
                            />

                            <Text className="font-bold text-gray-700 mb-2">Taste / Mood</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-4"
                                placeholder="Spicy, Comforting, Asian..."
                                placeholderTextColor="#9ca3af"
                                value={taste}
                                onChangeText={setTaste}
                            />

                            <Text className="font-bold text-gray-700 mb-2">Time Available</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl text-gray-900 mb-6"
                                placeholder="30 minutes"
                                placeholderTextColor="#9ca3af"
                                value={time}
                                onChangeText={setTime}
                            />

                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={loading}
                                className="bg-primary py-4 rounded-xl shadow-lg active:opacity-90"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-bold text-lg">Generate Recipes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}
