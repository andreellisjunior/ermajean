import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';
import { Recipe } from '@/types/config';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/libs/api';
import config from '@/config';
import { ArrowLeft, Share2, Clock, Flame, BarChart2, Users, Receipt, List, PlayCircle, Info } from 'lucide-react-native';
import { Colors } from '@/constants/design';
import { Haptic } from '@/utils/haptics';

export default function RecipeDetails() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingNutrition, setGeneratingNutrition] = useState(false);
    const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

    useEffect(() => {
        if (id) fetchRecipe();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const { data } = await supabase
                .from('recipes')
                .select('*')
                .eq('id', id)
                .single();
            setRecipe(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNutrition = async () => {
        if (!recipe) return;

        setGeneratingNutrition(true);
        await Haptic.buttonPress();
        try {
            const response = await apiClient.post('/recipes/macros', {
                recipeId: recipe.id,
                servings: recipe.servings,
            });

            setRecipe({
                ...recipe,
                calories: response.data.calories,
                protein: response.data.protein,
                carbs: response.data.carbs,
                fat: response.data.fat,
                fiber: response.data.fiber,
                sugar: response.data.sugar,
                sodium: response.data.sodium,
            });

            await Haptic.success();
            Alert.alert('Success', 'Nutrition information generated successfully!');
        } catch (error) {
            console.error('Error generating nutrition:', error);
            await Haptic.error();
            Alert.alert('Error', 'Failed to generate nutrition information. Please try again.');
        } finally {
            setGeneratingNutrition(false);
        }
    };

    const handleShare = async () => {
        if (!recipe) return;

        await Haptic.light();
        try {
            const shareUrl = `https://${config.domainName}/recipe/${recipe.id}`;
            const message = `Check out this recipe: ${recipe.recipe_name}\n\n${shareUrl}`;

            await Share.share({
                message,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Error sharing recipe:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#FDFBF7]">
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View className="flex-1 justify-center items-center bg-[#FDFBF7]">
                <Text className="text-stone-500 font-medium">Recipe not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-emerald-800 px-6 py-2 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const ingredientsList = recipe.ingredients ? recipe.ingredients.split('\n').filter(i => i.trim()) : [];
    const instructionsList = recipe.instructions ? recipe.instructions.split('\n').filter(i => i.trim()) : [];
    const hasNutrition = recipe.calories !== null && recipe.calories !== undefined;

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Image Section */}
                <View className="h-96 relative bg-stone-900">
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']} // Gradient overlay should be stronger: from-transparent to-black/80
                        className="absolute bottom-0 left-0 right-0 h-48 z-10"
                    />

                    {/* Placeholder for Image (Using Gradient + Emoji/Icon for now as no image in DB) */}
                    <View className="w-full h-full justify-center items-center opacity-80">
                        {/* We can use a pattern or just a gradient */}
                        <LinearGradient colors={['#064e3b', '#065f46']} className="absolute inset-0" />
                        <Text className="text-8xl">🍳</Text>
                    </View>

                    {/* Navigation Bar */}
                    <View
                        className="absolute left-0 right-0 z-20 px-6 flex-row justify-between items-center"
                        style={{ top: insets.top + 10 }}
                    >
                        <TouchableOpacity
                            onPress={async () => {
                                await Haptic.light();
                                router.back();
                            }}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10"
                        >
                            <View>
                                <ArrowLeft size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10"
                        >
                            <View>
                                <Share2 size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Title & Key Stats */}
                    <View className="absolute bottom-8 left-6 right-6 z-20">
                        <View className="bg-emerald-500/20 self-start px-3 py-1 rounded-lg border border-emerald-500/30 mb-3">
                            <Text className="text-emerald-50 font-bold text-xs uppercase tracking-wider">{recipe.course}</Text>
                        </View>
                        <Text 
                            className="text-white text-4xl font-bold font-serif leading-tight mb-4" 
                            style={{ textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}
                        >
                            {recipe.recipe_name}
                        </Text>
                        <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center gap-1.5">
                                <Clock size={16} color="#d1fae5" />
                                <Text className="text-emerald-50 font-medium text-sm">{recipe.total_time}</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <Flame size={16} color="#d1fae5" />
                                <Text className="text-emerald-50 font-medium text-sm">{recipe.calories || '-'} kcal</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <BarChart2 size={16} color="#d1fae5" />
                                <Text className="text-emerald-50 font-medium text-sm">{recipe.difficulty_level}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Container */}
                <View className="px-6 py-6 -mt-6 bg-[#FDFBF7] rounded-t-[32px] min-h-screen">
                    <View className="items-center mb-2">
                        <View className="w-12 h-1 bg-stone-200 rounded-full" />
                    </View>

                    {/* Description */}
                    <Text className="text-stone-600 leading-relaxed mb-8 mt-2 text-base">
                        {recipe.description}
                    </Text>

                    {/* Metadata Grid */}
                    <View className="flex-row justify-between mb-8 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                        <MetaItem label="Prep" value={recipe.prep_time} />
                        <View className="w-[1px] bg-stone-100 h-8 self-center" />
                        <MetaItem label="Cook" value={recipe.cook_time} />
                        <View className="w-[1px] bg-stone-100 h-8 self-center" />
                        <MetaItem label="Serves" value={recipe.servings} />
                    </View>

                    {/* Tabs */}
                    <View className="flex-row bg-stone-100 h-12 rounded-xl p-1 mb-8 relative">
                        <TouchableOpacity
                            onPress={() => setActiveTab('ingredients')}
                            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg ${activeTab === 'ingredients' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Receipt size={16} color={activeTab === 'ingredients' ? '#059669' : '#78716c'} />
                            <Text className={`font-bold ${activeTab === 'ingredients' ? 'text-emerald-700' : 'text-stone-500'}`}>Ingredients</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('instructions')}
                            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg ${activeTab === 'instructions' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <List size={16} color={activeTab === 'instructions' ? '#059669' : '#78716c'} />
                            <Text className={`font-bold ${activeTab === 'instructions' ? 'text-emerald-700' : 'text-stone-500'}`}>Method</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        {activeTab === 'ingredients' ? (
                            <View className="gap-3">
                                {ingredientsList.map((ingredient, index) => (
                                    <View key={`ingredient-${index}`} className="flex-row items-center p-3 bg-white border border-stone-100 rounded-xl shadow-sm">
                                        <View className="w-2 h-2 bg-emerald-400 rounded-full mr-3" />
                                        <Text className="text-stone-700 font-medium flex-1 text-base">{ingredient}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="gap-4">
                                {instructionsList.map((step, index) => (
                                    <View key={`step-${index}`} className="flex-row gap-4">
                                        <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center shrink-0 mt-0.5">
                                            <Text className="text-emerald-800 font-bold">{index + 1}</Text>
                                        </View>
                                        <Text className="text-stone-700 leading-7 text-base flex-1 pt-0.5">{step}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Nutrition Section */}
                    <View className="mt-10">
                        <Text className="text-xl font-bold text-stone-800 mb-4 font-serif">Nutrition Facts</Text>
                        {hasNutrition ? (
                            <View className="bg-emerald-900 rounded-2xl p-5 shadow-lg shadow-emerald-900/20">
                                <Text className="text-emerald-100 text-xs mb-4 text-center tracking-widest uppercase">Per Serving</Text>
                                <View className="flex-row flex-wrap justify-between gap-y-6">
                                    <NutritionBit label="Calories" value={recipe.calories || 0} unit="" />
                                    <NutritionBit label="Protein" value={recipe.protein || 0} unit="g" />
                                    <NutritionBit label="Carbs" value={recipe.carbs || 0} unit="g" />
                                    <NutritionBit label="Fat" value={recipe.fat || 0} unit="g" />
                                </View>
                                <View className="h-[1px] bg-emerald-800 my-4" />
                                <View className="flex-row justify-between px-4">
                                    <Text className="text-emerald-300 text-xs">Fiber: {recipe.fiber || 0}g</Text>
                                    <Text className="text-emerald-300 text-xs">Sugar: {recipe.sugar || 0}g</Text>
                                    <Text className="text-emerald-300 text-xs">Sodium: {recipe.sodium || 0}mg</Text>
                                </View>
                            </View>
                        ) : (
                            <View className="bg-stone-100 rounded-2xl p-6 items-center border-2 border-dashed border-stone-200">
                                <View className="mb-3">
                                    <Info size={32} color="#a8a29e" />
                                </View>
                                <Text className="text-stone-500 text-center mb-4">
                                    Detailed nutrition information is not available.
                                </Text>
                                <TouchableOpacity
                                    onPress={handleGenerateNutrition}
                                    disabled={generatingNutrition}
                                    className="bg-emerald-800 px-6 py-3 rounded-xl active:bg-emerald-900"
                                >
                                    {generatingNutrition ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold">Calculate Nutrition</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button for Cooking Mode (Optional) */}
            <View className="absolute bottom-8 right-6">
                <TouchableOpacity 
                    className="bg-emerald-600 w-16 h-16 rounded-full items-center justify-center flex-row active:scale-95" 
                    style={{ shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
                >
                    <PlayCircle size={28} color="white" fill="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function MetaItem({ label, value }: { label: string, value: string }) {
    return (
        <View className="items-center flex-1">
            <Text className="text-stone-400 text-xs mb-1 font-medium">{label}</Text>
            <Text className="text-stone-800 font-bold">{value}</Text>
        </View>
    );
}

function NutritionBit({ label, value, unit }: { label: string, value: number, unit: string }) {
    return (
        <View className="items-center w-[22%]">
            <Text className="text-emerald-200 text-xs mb-1 font-medium">{label}</Text>
            <Text className="text-white font-bold text-lg">{value}<Text className="text-xs font-normal text-emerald-300">{unit}</Text></Text>
        </View>
    );
}
