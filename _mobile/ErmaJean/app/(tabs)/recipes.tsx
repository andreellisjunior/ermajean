import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { useEffect, useState } from 'react';
import { Recipe } from '@/types/config';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

export default function RecipesScreen() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecipes();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = recipes.filter(r =>
                r.recipe_name.toLowerCase().includes(search.toLowerCase()) ||
                r.description.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredRecipes(filtered);
        } else {
            setFilteredRecipes(recipes);
        }
    }, [search, recipes]);

    const fetchRecipes = async () => {
        try {
            const { data } = await supabase
                .from('recipes')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setRecipes(data);
                setFilteredRecipes(data);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            className="bg-white mb-4 rounded-xl shadow-sm overflow-hidden flex-row"
            onPress={() => router.push(`/recipe/${item.id}`)}
        >
            <View className="w-24 h-full bg-gray-200 justify-center items-center">
                <Text className="text-2xl">🥘</Text>
            </View>
            <View className="flex-1 p-4">
                <Text className="text-lg font-bold text-gray-900 mb-1">{item.recipe_name}</Text>
                <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>{item.description}</Text>
                <View className="flex-row space-x-2">
                    <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-xs text-gray-600">{item.total_time}</Text>
                    </View>
                    <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-xs text-gray-600">{item.calories} cal</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 bg-white shadow-sm z-10">
                <Text className="text-3xl font-bold text-gray-900 mb-4">Recipes</Text>
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                    <FontAwesome name="search" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-900"
                        placeholder="Search recipes..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <FlatList
                    data={filteredRecipes}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
