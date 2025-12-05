import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Pressable } from 'react-native';
import { supabase } from '@/libs/supabase';
import { Colors } from '@/constants/design';
import { Recipe, MealSlot, MacroGoals } from '@/types/config';
import { RecipeSelectionModal } from '@/components/RecipeSelectionModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { getWeekStart, getWeekEnd, getDaysInWeek, formatDate, isToday } from '@/utils/dateUtils';
import { calculateDayMacros } from '@/utils/macroCalculations';
import { getMealPlans, addMealToPlan, removeMealFromPlan, MealType } from '@/services/mealPlanService';
import { ChevronLeft, ChevronRight, Calendar, ShoppingCart, Plus, Trash2, Flame, Clock, Utensils, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Haptic } from '@/utils/haptics';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

// Meal type icon colors
const MEAL_COLORS = {
  Breakfast: { icon: '#f97316', bg: '#ffedd5' }, // orange
  Lunch: { icon: '#059669', bg: '#d1fae5' }, // emerald
  Dinner: { icon: '#9333ea', bg: '#f3e8ff' }, // purple
};

export default function MealPlansScreen() {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<MealSlot[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [shoppingListVisible, setShoppingListVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: MealType } | null>(null);

  // Computed values
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => getWeekEnd(currentDate), [currentDate]);
  const daysInWeek = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  const recipesMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach(recipe => map.set(recipe.id, recipe));
    return map;
  }, [recipes]);

  const weekRangeText = useMemo(() => {
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    return `${startMonth} ${startDay} - ${endMonth !== startMonth ? endMonth : ''} ${endDay}`;
  }, [weekStart, weekEnd]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const mealPlans = await getMealPlans(weekStart, weekEnd);
      setMeals(mealPlans);

      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .order('recipe_name', { ascending: true });

      if (recipesData) setRecipes(recipesData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync selected date when week changes if selected date is out of range
  useEffect(() => {
    // If we switch weeks, default to the first day of the week or today if in range
    const isSelectedInRange = selectedDate >= weekStart && selectedDate <= weekEnd;
    if (!isSelectedInRange) {
      // If today is in this week, select today, else select start of week
      const today = new Date();
      const isTodayInWeek = today >= weekStart && today <= weekEnd;
      setSelectedDate(isTodayInWeek ? today : weekStart);
    }
  }, [weekStart, weekEnd]);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptic.refresh();
    fetchData();
  }, [fetchData]);

  const handleSlotPress = async (mealType: MealType) => {
    await Haptic.light();
    setSelectedSlot({ date: formatDate(selectedDate), mealType });
    setRecipeModalVisible(true);
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!selectedSlot) return;
    try {
      await addMealToPlan(selectedSlot.date, selectedSlot.mealType, recipe.id);
      await Haptic.success();
      setMeals(prev => {
        const filtered = prev.filter(m => !(m.date === selectedSlot.date && m.mealType === selectedSlot.mealType));
        return [...filtered, {
          date: selectedSlot.date,
          mealType: selectedSlot.mealType,
          recipeId: recipe.id,
          recipeName: recipe.recipe_name,
        }];
      });
      setRecipeModalVisible(false);
      setSelectedSlot(null);
    } catch (error) {
      await Haptic.error();
      Alert.alert('Error', 'Failed to add meal.');
    }
  };

  const handleDeleteMeal = async (mealType: MealType) => {
    const dateStr = formatDate(selectedDate);
    await Haptic.delete();
    try {
      await removeMealFromPlan(dateStr, mealType);
      await Haptic.success();
      setMeals(prev => prev.filter(m => !(m.date === dateStr && m.mealType === mealType)));
    } catch (error) {
      await Haptic.error();
      Alert.alert('Error', 'Failed to remove meal.');
    }
  };

  const getMealForSlot = (mealType: MealType) => {
    return meals.find(m => m.date === formatDate(selectedDate) && m.mealType === mealType);
  };

  const dayMacros = useMemo(() => {
    return calculateDayMacros(formatDate(selectedDate), meals, recipesMap);
  }, [selectedDate, meals, recipesMap]);

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#065f46" />}
      >
        <View className="flex-row justify-between items-center mb-2 mt-4">
          <View>
            <Text className="text-3xl font-bold text-stone-800 font-serif">Weekly Planner</Text>
            <Text className="text-stone-500">Plan your meals for a healthier week</Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await Haptic.light();
              setShoppingListVisible(true);
            }}
            className="w-10 h-10 bg-emerald-100 items-center justify-center rounded-full"
          >
            <ShoppingCart size={20} color="#065f46" />
          </TouchableOpacity>
        </View>

        {/* Week Navigator - Enhanced */}
        <View 
          className="bg-white p-4 rounded-2xl border border-stone-100 mb-6 mt-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1, // Changed to shadow-md
            shadowRadius: 8, // Changed to shadow-md
            elevation: 4,
          }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity 
              onPress={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} 
              className="p-2 bg-stone-100 rounded-full" // Changed from bg-stone-50 to bg-stone-100
            >
              <ChevronLeft size={20} color="#57534e" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Calendar size={18} color="#059669" />
              <Text className="font-bold text-stone-800">{weekRangeText}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} 
              className="p-2 bg-stone-100 rounded-full"
            >
              <ChevronRight size={20} color="#57534e" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between">
            {daysInWeek.map((day, idx) => {
              const isSelected = formatDate(day) === formatDate(selectedDate);
              const isTodayDay = isToday(day);
              return (
                <Pressable
                  key={idx}
                  onPress={async () => {
                    await Haptic.selection();
                    setSelectedDate(day);
                  }}
                  className={`flex-col items-center p-2 rounded-xl min-w-[44px] ${isSelected ? 'bg-emerald-800' : 'bg-transparent'}`}
                  style={isSelected ? {
                    shadowColor: '#064e3b',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 8,
                    transform: [{ scale: 1.1 }],
                  } : {}}
                >
                  <Text className={`text-xs font-medium mb-1 ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text className={`font-bold ${isSelected ? 'text-white' : 'text-stone-700'}`}>
                    {day.getDate()}
                  </Text>
                  {isTodayDay && !isSelected && <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1" />} {/* Today indicator is now w-1.5 h-1.5 */}
                </Pressable>
              );
            })}
          </View>
        </View>

          {/* Daily View */}
          <View className="flex-1 space-y-4">
            {MEAL_TYPES.map(type => {
              const meal = getMealForSlot(type);
              const recipe = meal?.recipeId ? recipesMap.get(meal.recipeId) : null;
              const mealColor = MEAL_COLORS[type];
              const MealIcon = type === 'Breakfast' ? Clock : type === 'Lunch' ? Utensils : Moon;

              return (
                <Pressable 
                  key={type} 
                  className="bg-white p-4 rounded-2xl border border-stone-100 mb-4"
                  style={({ pressed }) => [
                    {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 2,
                      transform: [{ scale: pressed ? 0.98 : 1 }], // active:scale-98
                    }
                  ]}
                  onPress={() => {}} // Empty onPress to enable press state
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-2">
                      <MealIcon size={18} color={mealColor.icon} />
                      <Text className="font-bold text-stone-700 text-lg">{type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleSlotPress(type)}>
                      <Plus size={20} color="#059669" />
                    </TouchableOpacity>
                  </View>

                  {recipe ? (
                    <View className="bg-stone-50 p-3 rounded-xl flex-row items-center justify-between"> {/* Filled slots have bg-stone-50 */}
                      <View className="flex-1">
                        <Text className="font-bold text-stone-800 text-base mb-1">{recipe.recipe_name}</Text>
                        <View className="flex-row items-center gap-3">
                          <View className="flex-row items-center gap-1">
                            <Flame size={12} color="#f97316" />
                            <Text className="text-xs text-stone-500">{recipe.calories || 0} kcal</Text>
                          </View>
                          <Text className="text-xs text-stone-400">|</Text>
                          <Text className="text-xs text-stone-500">{recipe.total_time}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteMeal(type)}
                        className="p-2 bg-red-50 rounded-lg border border-red-200" // Delete button has bg-red-50 border-red-200
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleSlotPress(type)}
                      className="border-2 border-stone-200 rounded-xl p-6 items-center justify-center" // Changed from border-dashed to border-2 border-stone-200
                      style={{ backgroundColor: 'rgba(236, 253, 245, 0.3)' }} // Changed to bg-emerald-50/30
                    >
                      <Text className="text-stone-400 font-medium text-sm">Add {type}</Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
              );
            })}

            {/* Macro Summary for Selected Day - Enhanced */}
            <View 
              className="bg-emerald-900 p-5 rounded-2xl mt-4 relative overflow-hidden"
              style={{
                shadowColor: '#064e3b',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2, // shadow-xl shadow-emerald-900/20
                shadowRadius: 16, // shadow-xl
                elevation: 12,
              }}
            >
              {/* Decorative gradient overlay - subtle pattern */}
              <View className="absolute inset-0 opacity-10">
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0"
                />
              </View>
              <View className="relative z-10">
                <Text className="text-white font-bold text-lg mb-4">Daily Nutrition</Text>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-emerald-100 text-xs mb-1">Calories</Text>
                    <Text className="text-white font-bold text-2xl">{Math.round(dayMacros.calories)}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-emerald-100 text-xs mb-1">Protein</Text>
                    <Text className="text-white font-bold text-2xl">{Math.round(dayMacros.protein)}g</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-emerald-100 text-xs mb-1">Carbs</Text>
                    <Text className="text-white font-bold text-2xl">{Math.round(dayMacros.carbs)}g</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-emerald-100 text-xs mb-1">Fat</Text>
                    <Text className="text-white font-bold text-2xl">{Math.round(dayMacros.fat)}g</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>

      {/* Shopping List Button - Fixed at bottom with gradient fade */}
      <View 
        className="absolute bottom-0 left-0 right-0"
        style={{ 
          paddingBottom: 100, // Account for tab bar height + spacing
          zIndex: 10,
        }}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={['rgba(253, 251, 247, 0)', 'rgba(253, 251, 247, 1)', 'rgba(253, 251, 247, 1)']}
          className="pt-8 px-5"
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={async () => {
              await Haptic.buttonPress();
              setShoppingListVisible(true);
            }}
            className="bg-emerald-800 py-4 rounded-xl items-center flex-row justify-center gap-2"
            style={{
              shadowColor: '#064e3b',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <ShoppingCart size={18} color="white" />
            <Text className="text-white font-bold">Generate Shopping List</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <RecipeSelectionModal
        visible={recipeModalVisible}
        onClose={() => {
          setRecipeModalVisible(false);
          setSelectedSlot(null);
        }}
        onSelect={handleRecipeSelect}
        recipes={recipes}
        mealType={selectedSlot?.mealType || 'Breakfast'}
        date={selectedSlot?.date || formatDate(new Date())}
      />

      <ShoppingListModal
        visible={shoppingListVisible}
        onClose={() => setShoppingListVisible(false)}
        meals={meals}
        recipes={recipesMap}
      />
    </View>
  );
}
