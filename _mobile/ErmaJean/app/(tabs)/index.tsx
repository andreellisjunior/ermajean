import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Recipe, Profile } from '@/types/config';
import { User, Search, BookOpen, Flame, Settings, Plus, Sparkles, ArrowRight, Leaf, Clock, ChefHat } from 'lucide-react-native';

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      // Fetch recent recipes
      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (recipesData) {
        setRecipes(recipesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const filteredRecipes = recipes.filter(r =>
    r.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#065f46" />
        }
      >
        {/* Header Section */}
        <View className="bg-emerald-900	p-6 rounded-3xl mb-6 shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          {/* Decorative circles */}
          <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></View>
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></View>

          <View className="relative z-10">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-3xl font-serif italic mb-1 text-white">
                  Hi, {profile?.name?.split(' ')[0] || 'Boss'}!
                </Text>
                <Text className="text-emerald-100 text-sm">What would you like to make today?</Text>
              </View>
              <View className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User size={20} color="white" />
              </View>
            </View>

            <View className="relative mt-6">
              <View className="absolute left-4 top-3.5 z-10">
                <Search size={20} color="#065f46" />
              </View>
              <TextInput
                placeholder="Search Saved Recipes..."
                placeholderTextColor="rgba(6, 95, 70, 0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 text-stone-900 focus:bg-white border-transparent focus:border-emerald-400"
              />
            </View>
          </View>
        </View>

        {/* AI Chef / Generator Action Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/generate-modal')}
          className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm mb-8 flex-row items-center justify-between"
        >
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Sparkles size={18} color="#059669" className="text-emerald-600" />
              <Text className="text-emerald-900 font-bold">Generate Recipe</Text>
            </View>
            <View className="bg-emerald-100 px-2 py-0.5 rounded-md self-start">
              <Text className="text-xs text-emerald-700 font-medium">
                {profile?.has_access ? 'Unlimited generations' : '3 free generations left'}
              </Text>
            </View>
          </View>
          <View className="bg-emerald-800 px-5 py-2.5 rounded-xl flex-row items-center gap-2 shadow-lg shadow-emerald-900/10">
            <Text className="text-white font-semibold text-sm">Create</Text>
            <ArrowRight size={16} color="white" />
          </View>
        </TouchableOpacity>

        {/* Recipe Feed Title */}
        <View className="flex-row items-center gap-2 mb-4 px-1">
          <BookOpen size={18} color="#a8a29e" />
          <Text className="font-bold text-stone-800 text-lg">Saved Recipes</Text>
        </View>

        {/* Recipe Feed */}
        <View className="gap-6">
          {filteredRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-stone-100"
            >
              {/* Image Placeholder Area */}
              <View className="h-48 bg-stone-200 relative overflow-hidden items-center justify-center">
                <View className="absolute inset-0 bg-stone-300 opacity-20" />
                <Leaf size={48} color="#a8a29e" className="mb-2" />
                <Text className="text-sm font-medium text-stone-400">Delicious Food Image</Text>

                {/* Badges */}
                <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                  <Text className="text-xs font-bold text-stone-800">{recipe.total_time}</Text>
                </View>
              </View>

              <View className="p-5">
                <Text className="text-xl font-bold text-stone-800 mb-2">{recipe.recipe_name}</Text>
                <View className="flex-row gap-4 mb-4">
                  {recipe.calories && (
                    <View className="flex-row items-center gap-1">
                      <Flame size={14} color="#f97316" />
                      <Text className="text-sm text-stone-500">{recipe.calories} kcal</Text>
                    </View>
                  )}
                  <View className="flex-row items-center gap-1">
                    <Settings size={14} color="#3b82f6" />
                    <Text className="text-sm text-stone-500">{recipe.difficulty_level}</Text>
                  </View>
                </View>
                <Text className="text-stone-600 text-sm leading-relaxed" numberOfLines={2}>
                  {recipe.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push('/generate-modal')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-800 rounded-full shadow-xl items-center justify-center z-20"
        activeOpacity={0.8}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
