import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';
import { Recipe } from '@/types/config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function RecipeDetails() {
    const { id } = useLocalSearchParams();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

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

                    <View className="absolute bottom-6 left-6 right-6 z-20">
                        <Text className="text-white text-3xl font-bold mb-2 shadow-sm">{recipe.recipe_name}</Text>
                        <View className="flex-row space-x-3">
                            <Badge icon="clock-o" text={recipe.total_time} />
                            <Badge icon="fire" text={`${recipe.calories || '-'} cal`} />
                            <Badge icon="signal" text={recipe.difficulty_level} />
                        </View>
                    </View>
                </View>

                <View className="p-6 rounded-t-3xl -mt-6 bg-white">
                    <Text className="text-gray-600 leading-6 mb-8">{recipe.description}</Text>

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
                    <View className="flex-row flex-wrap justify-between bg-gray-50 rounded-2xl p-4 mb-8">
                        <NutritionItem label="Protein" value={`${recipe.protein || '-'}g`} />
                        <NutritionItem label="Carbs" value={`${recipe.carbs || '-'}g`} />
                        <NutritionItem label="Fat" value={`${recipe.fat || '-'}g`} />
                        <NutritionItem label="Fiber" value={`${recipe.fiber || '-'}g`} />
                    </View>
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

function NutritionItem({ label, value }: { label: string, value: string }) {
    return (
        <View className="items-center w-1/4 mb-2">
            <Text className="text-gray-500 text-xs mb-1">{label}</Text>
            <Text className="text-gray-900 font-bold">{value}</Text>
        </View>
    );
}
