import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Recipe, Profile } from '@/types/config';

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="px-6 py-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-gray-500 text-lg">Welcome back,</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {profile?.name?.split(' ')[0] || 'Chef'}!
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-white p-2 rounded-full shadow-sm"
            >
              <Text className="text-primary font-bold px-2">Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Featured Recipes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
              {recipes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white p-4 rounded-2xl shadow-lg w-72 mr-4"
                  onPress={() => {
                    router.push(`/recipe/${item.id}`);
                  }}
                >
                  <View className="h-40 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                    {/* Placeholder for recipe image if available, or gradient */}
                    <LinearGradient
                      colors={['#4ade80', '#22c55e']}
                      className="flex-1 justify-center items-center"
                    >
                      <Text className="text-4xl">🍳</Text>
                    </LinearGradient>
                  </View>
                  <Text className="text-lg font-bold mb-1" numberOfLines={1}>{item.recipe_name}</Text>
                  <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>{item.description}</Text>
                  <View className="flex-row items-center space-x-2">
                    <View className="bg-blue-100 px-2 py-1 rounded-md">
                      <Text className="text-blue-700 text-xs font-bold">{item.total_time}</Text>
                    </View>
                    <View className="bg-orange-100 px-2 py-1 rounded-md">
                      <Text className="text-orange-700 text-xs font-bold">{item.difficulty_level}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View>
            <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
            {/* Placeholder for activity - could be real if we had an activity table */}
            <View className="bg-white p-4 rounded-xl shadow-sm mb-4 flex-row items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full mr-4 items-center justify-center">
                <Text className="text-blue-500 font-bold">R</Text>
              </View>
              <View>
                <Text className="font-bold text-gray-900">Checked out new recipes</Text>
                <Text className="text-gray-500 text-sm">Just now</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
