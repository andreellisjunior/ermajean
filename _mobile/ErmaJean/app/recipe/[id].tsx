import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';
import { Recipe } from '@/types/config';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import apiClient from '@/libs/api';
import config from '@/config';

export default function RecipeDetails() {
    const { id } = useLocalSearchParams();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingNutrition, setGeneratingNutrition] = useState(false);

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
        try {
            const response = await apiClient.post('/recipes/macros', {
                recipeId: recipe.id,
                servings: recipe.servings,
            });

            // Update the recipe with the new nutrition data
            setRecipe({
                ...recipe,
                calories: response.calories,
                protein: response.protein,
                carbs: response.carbs,
                fat: response.fat,
                fiber: response.fiber,
                sugar: response.sugar,
                sodium: response.sodium,
            });

            Alert.alert('Success', 'Nutrition information generated successfully!');
        } catch (error) {
            console.error('Error generating nutrition:', error);
            Alert.alert('Error', 'Failed to generate nutrition information. Please try again.');
        } finally {
            setGeneratingNutrition(false);
        }
    };

    const handleShare = async () => {
        if (!recipe) return;

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
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Recipe not found</Text>
            </View>
        );
    }

    const ingredientsList = recipe.ingredients.split('\n').filter(i => i.trim());
    const instructionsList = recipe.instructions.split('\n').filter(i => i.trim());
    const hasNutrition = recipe.calories !== null && recipe.calories !== undefined;

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="h-72 relative">
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        className="absolute bottom-0 left-0 right-0 h-32 z-10"
                    />
                    <View className="w-full h-full bg-gray-200 justify-center items-center">
                        <Text className="text-6xl">🍲</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 z-20 bg-white/20 backdrop-blur-md p-2 rounded-full"
                    >
                        <FontAwesome name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleShare}
                        className="absolute top-12 right-6 z-20 bg-white/20 backdrop-blur-md p-2 rounded-full"
                    >
                        <FontAwesome name="share-alt" size={24} color="white" />
                    </TouchableOpacity>

                    <View className="absolute bottom-6 left-6 right-6 z-20">
                        <Text className="text-white text-3xl font-bold mb-2 shadow-sm">{recipe.recipe_name}</Text>
                        <View className="flex-row flex-wrap gap-2">
                            <Badge icon="clock-o" text={recipe.total_time} />
                            <Badge icon="fire" text={`${recipe.calories || '-'} cal`} />
                            <Badge icon="signal" text={recipe.difficulty_level} />
                        </View>
                    </View>
                </View>

                <View className="p-6 rounded-t-3xl -mt-6 bg-white">
                    <Text className="text-gray-600 leading-6 mb-8">{recipe.description}</Text>

                    {/* Recipe Details Section */}
                    <SectionTitle title="Recipe Details" />
                    <View className="bg-gray-50 rounded-2xl p-4 mb-8">
                        <DetailRow label="Prep Time" value={recipe.prep_time} icon="clock-o" />
                        <DetailRow label="Cook Time" value={recipe.cook_time} icon="fire" />
                        <DetailRow label="Total Time" value={recipe.total_time} icon="hourglass-half" />
                        <DetailRow label="Servings" value={recipe.servings} icon="users" />
                        <DetailRow label="Difficulty" value={recipe.difficulty_level} icon="signal" />
                        <DetailRow label="Course" value={recipe.course} icon="cutlery" last />
                    </View>

                    <SectionTitle title="Ingredients" />
                    <View className="bg-gray-50 rounded-2xl p-4 mb-8">
                        {ingredientsList.map((ingredient, index) => (
                            <View key={index} className="flex-row items-center mb-3 last:mb-0">
                                <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                                <Text className="text-gray-700 flex-1">{ingredient}</Text>
                            </View>
                        ))}
                    </View>

                    <SectionTitle title="Instructions" />
                    <View className="space-y-6 mb-8">
                        {instructionsList.map((step, index) => (
                            <View key={index} className="flex-row">
                                <View className="w-8 h-8 bg-primary/10 rounded-full justify-center items-center mr-4 mt-1">
                                    <Text className="text-primary font-bold">{index + 1}</Text>
                                </View>
                                <Text className="text-gray-700 flex-1 leading-6 pt-1">{step}</Text>
                            </View>
                        ))}
                    </View>

                    <SectionTitle title="Nutrition (per serving)" />
                    {hasNutrition ? (
                        <View className="bg-gray-50 rounded-2xl p-4 mb-8">
                            <View className="flex-row flex-wrap justify-between mb-4">
                                <NutritionItem label="Calories" value={`${recipe.calories || 0}`} unit="kcal" />
                                <NutritionItem label="Protein" value={`${recipe.protein || 0}`} unit="g" />
                                <NutritionItem label="Carbs" value={`${recipe.carbs || 0}`} unit="g" />
                                <NutritionItem label="Fat" value={`${recipe.fat || 0}`} unit="g" />
                            </View>
                            <View className="flex-row flex-wrap justify-between">
                                <NutritionItem label="Fiber" value={`${recipe.fiber || 0}`} unit="g" />
                                <NutritionItem label="Sugar" value={`${recipe.sugar || 0}`} unit="g" />
                                <NutritionItem label="Sodium" value={`${recipe.sodium || 0}`} unit="mg" />
                            </View>
                        </View>
                    ) : (
                        <View className="bg-gray-50 rounded-2xl p-6 mb-8 items-center">
                            <FontAwesome name="info-circle" size={32} color="#10b981" style={{ marginBottom: 12 }} />
                            <Text className="text-gray-600 text-center mb-4">
                                Nutrition information is not available for this recipe.
                            </Text>
                            <TouchableOpacity
                                onPress={handleGenerateNutrition}
                                disabled={generatingNutrition}
                                className="bg-primary px-6 py-3 rounded-full"
                            >
                                {generatingNutrition ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Generate Nutrition Info</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function Badge({ icon, text }: { icon: any, text: string }) {
    return (
        <View className="flex-row items-center bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            <FontAwesome name={icon} size={12} color="white" />
            <Text className="text-white text-xs font-bold ml-2">{text}</Text>
        </View>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <Text className="text-xl font-bold text-gray-900 mb-4">{title}</Text>
    );
}

function NutritionItem({ label, value, unit }: { label: string, value: string, unit?: string }) {
    return (
        <View className="items-center w-1/4 mb-2">
            <Text className="text-gray-500 text-xs mb-1">{label}</Text>
            <Text className="text-gray-900 font-bold">
                {value}
                {unit && <Text className="text-gray-500 text-xs font-normal"> {unit}</Text>}
            </Text>
        </View>
    );
}

function DetailRow({ label, value, icon, last = false }: { label: string, value: string, icon: any, last?: boolean }) {
    return (
        <View className={`flex-row items-center py-3 ${!last ? 'border-b border-gray-200' : ''}`}>
            <View className="w-8 items-center mr-3">
                <FontAwesome name={icon} size={16} color="#10b981" />
            </View>
            <Text className="text-gray-500 flex-1">{label}</Text>
            <Text className="text-gray-900 font-semibold">{value}</Text>
        </View>
    );
}
