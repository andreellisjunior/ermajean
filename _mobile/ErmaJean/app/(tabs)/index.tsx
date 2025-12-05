import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Animated } from 'react-native';
import { supabase } from '@/libs/supabase';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Recipe, Profile } from '@/types/config';
import { User, Search, BookOpen, Flame, Settings, Plus, Sparkles, ArrowRight, Leaf } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Haptic } from '@/utils/haptics';

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    
    // Start pulse animation for Sparkles icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptic.refresh();
    await fetchData();
  };

  const filteredRecipes = recipes.filter(r =>
    r.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFABPress = async () => {
    await Haptic.buttonPress();
    // Rotate animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
      router.push('/generate-modal');
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#065f46" />
        }
      >
        {/* Header Section - Enhanced shadow and spacing */}
        <View className="bg-emerald-900 p-7 rounded-3xl mb-6 shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
          {/* Decorative circles with subtle gradient overlay */}
          <View 
            className="absolute w-32 h-32 rounded-full overflow-hidden"
            style={{ top: -40, right: -40 }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full h-full"
            />
          </View>
          <View 
            className="absolute w-24 h-24 rounded-full overflow-hidden"
            style={{ bottom: -32, left: -32 }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full h-full"
            />
          </View>
          {/* Additional decorative circle for depth with subtle gradient */}
          <View 
            className="absolute w-20 h-20 rounded-full overflow-hidden"
            style={{ top: 60, right: 20 }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-full h-full"
            />
          </View>

          <View className="relative z-10">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-3xl font-serif italic mb-1 text-white">
                  Hi, {profile?.name?.split(' ')[0] || 'Boss'}!
                </Text>
                <Text className="text-emerald-100 text-sm">What would you like to make today?</Text>
              </View>
              {/* User avatar circle with backdrop blur effect */}
              <View className="w-10 h-10 rounded-full overflow-hidden">
                <BlurView intensity={20} tint="light" className="w-full h-full items-center justify-center bg-white/20">
                  <User size={20} color="white" />
                </BlurView>
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
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 text-stone-900"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  borderWidth: searchFocused ? 2 : 0,
                  borderColor: searchFocused ? '#34d399' : 'transparent',
                }}
              />
            </View>
          </View>
        </View>

        {/* AI Chef / Generator Action Card - Enhanced with gradient */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={async () => {
            await Haptic.cardTap();
            router.push('/generate-modal');
          }}
          className="rounded-2xl border border-emerald-300 shadow-sm mb-8 overflow-hidden"
          style={{ position: 'relative' }}
        >
          <LinearGradient
            colors={['#ecfdf5', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View className="p-4 flex-row items-center justify-between">
          <View className="relative z-10">
            <View className="flex-row items-center gap-2 mb-1">
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Sparkles size={18} color="#059669" fill="#d1fae5" />
              </Animated.View>
              <Text className="text-emerald-900 font-bold">Generate Recipe</Text>
            </View>
            <View className="bg-emerald-100/50 px-2 py-0.5 rounded-md self-start">
              <Text className="text-xs text-emerald-700 font-medium">
                {profile?.has_access ? 'Unlimited generations' : '3 free generations left'}
              </Text>
            </View>
          </View>
          <View 
            className="bg-emerald-800 px-5 py-2.5 rounded-xl flex-row items-center gap-2 relative z-10"
            style={{
              shadowColor: '#064e3b',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-semibold text-sm">Create</Text>
            <ArrowRight size={16} color="white" />
          </View>
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
              onPress={async () => {
                await Haptic.cardTap();
                router.push(`/recipe/${recipe.id}`);
              }}
              className="bg-white rounded-2xl overflow-hidden border border-stone-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1, // shadow-md
                shadowRadius: 8, // shadow-md
                elevation: 4,
              }}
            >
              {/* Image Placeholder Area - Enhanced gradient */}
              <View className="h-48 relative overflow-hidden items-center justify-center">
                <LinearGradient
                  colors={['#d6d3d1', '#a8a29e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0"
                />
                <View className="absolute inset-0 opacity-10">
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    className="absolute inset-0"
                  />
                </View>
                <Leaf size={48} color="#78716c" />
                <Text className="text-sm font-medium text-stone-500 mt-2">Delicious Food Image</Text>

                {/* Time Badge - Enhanced with backdrop blur effect */}
                <View 
                  className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <Text className="text-xs font-bold text-stone-800">{recipe.total_time}</Text>
                </View>
              </View>

              <View className="p-5">
                <Text className="text-xl font-bold text-stone-800 mb-2" numberOfLines={1}>{recipe.recipe_name}</Text>
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
                <Text className="text-stone-600 text-sm" style={{ lineHeight: 21 }} numberOfLines={2}>
                  {recipe.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Floating Action Button - Enhanced size and shadow */}
      <TouchableOpacity
        onPress={handleFABPress}
        className="absolute bottom-24 right-6 w-16 h-16 bg-emerald-800 rounded-full items-center justify-center z-20"
        activeOpacity={0.8}
        style={{
          shadowColor: '#064e3b',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Plus size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
