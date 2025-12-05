import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { Colors } from '@/constants/design';
import { Recipe, MealSlot, MacroGoals } from '@/types/config';
import { RecipeSelectionModal } from '@/components/RecipeSelectionModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { getWeekStart, getWeekEnd, getDaysInWeek, formatDate, isToday } from '@/utils/dateUtils';
import { calculateDayMacros } from '@/utils/macroCalculations';
import { getMealPlans, addMealToPlan, removeMealFromPlan, MealType } from '@/services/mealPlanService';
import { ChevronLeft, ChevronRight, Calendar, ShoppingCart, Plus, Trash2, Flame, RefreshCw } from 'lucide-react-native';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

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


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleSlotPress = (mealType: MealType) => {
    setSelectedSlot({ date: formatDate(selectedDate), mealType });
    setRecipeModalVisible(true);
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!selectedSlot) return;
    try {
      await addMealToPlan(selectedSlot.date, selectedSlot.mealType, recipe.id);
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
      Alert.alert('Error', 'Failed to add meal.');
    }
  };

  const handleDeleteMeal = async (mealType: MealType) => {
    const dateStr = formatDate(selectedDate);
    try {
      await removeMealFromPlan(dateStr, mealType);
      setMeals(prev => prev.filter(m => !(m.date === dateStr && m.mealType === mealType)));
    } catch (error) {
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
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#065f46" />}
        >
          <View className="flex-row justify-between items-center mb-2 mt-4">
            <View>
              <Text className="text-3xl font-bold text-stone-800 font-serif">Weekly Planner</Text>
              <Text className="text-stone-500">Plan your meals for a healthier week</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShoppingListVisible(true)}
              className="w-10 h-10 bg-emerald-100 items-center justify-center rounded-full"
            >
              <ShoppingCart size={20} color="#065f46" />
            </TouchableOpacity>
          </View>

          {/* Week Navigator */}
          <View className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 mb-6 mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} className="p-2 bg-stone-50 rounded-full">
                <ChevronLeft size={20} color="#57534e" />
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Calendar size={18} color="#059669" />
                <Text className="font-bold text-stone-800">{weekRangeText}</Text>
              </View>
              <TouchableOpacity onPress={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} className="p-2 bg-stone-50 rounded-full">
                <ChevronRight size={20} color="#57534e" />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between">
              {daysInWeek.map((day, idx) => {
                const isSelected = formatDate(day) === formatDate(selectedDate);
                const isTodayDay = isToday(day);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedDate(day)}
                    className={`flex-col items-center p-2 rounded-xl min-w-[44px] ${isSelected ? 'bg-emerald-800 shadow-md' : 'bg-transparent'}`}
                  >
                    <Text className={`text-xs font-medium mb-1 ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text className={`font-bold ${isSelected ? 'text-white' : 'text-stone-700'}`}>
                      {day.getDate()}
                    </Text>
                    {isTodayDay && !isSelected && <View className="w-1 h-1 bg-emerald-500 rounded-full mt-1" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Daily View */}
          <View className="flex-1 space-y-4">
            {MEAL_TYPES.map(type => {
              const meal = getMealForSlot(type);
              const recipe = meal?.recipeId ? recipesMap.get(meal.recipeId) : null;

              return (
                <View key={type} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-bold text-stone-700 text-lg">{type}</Text>
                    <TouchableOpacity onPress={() => handleSlotPress(type)}>
                      <Plus size={20} color="#059669" />
                    </TouchableOpacity>
                  </View>

                  {recipe ? (
                    <View className="bg-stone-50 p-3 rounded-xl flex-row items-center justify-between">
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
                        className="p-2 bg-white rounded-lg border border-stone-200"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleSlotPress(type)}
                      className="border-2 border-dashed border-stone-200 rounded-xl p-6 items-center justify-center bg-stone-50/50"
                    >
                      <Text className="text-stone-400 font-medium text-sm">Add {type}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* Macro Summary for Selected Day */}
            <View className="bg-emerald-900	p-5 rounded-2xl mt-4 relative overflow-hidden">
              <Text className="text-white font-bold text-lg mb-4">Daily Nutrition</Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-emerald-200 text-xs mb-1">Calories</Text>
                  <Text className="text-white font-bold text-xl">{Math.round(dayMacros.calories)}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-emerald-200 text-xs mb-1">Protein</Text>
                  <Text className="text-white font-bold text-xl">{Math.round(dayMacros.protein)}g</Text>
                </View>
                <View className="items-center">
                  <Text className="text-emerald-200 text-xs mb-1">Carbs</Text>
                  <Text className="text-white font-bold text-xl">{Math.round(dayMacros.carbs)}g</Text>
                </View>
                <View className="items-center">
                  <Text className="text-emerald-200 text-xs mb-1">Fat</Text>
                  <Text className="text-white font-bold text-xl">{Math.round(dayMacros.fat)}g</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Shopping List Button kept in Header, but maybe also useful here? Mockup showed Generate Shopping List button at bottom */}
          <TouchableOpacity
            onPress={() => setShoppingListVisible(true)}
            className="bg-emerald-100 py-4 rounded-xl items-center flex-row justify-center gap-2 mt-6 active:scale-95 transition-all"
          >
            <RefreshCw size={18} color="#065f46" />
            <Text className="text-emerald-800 font-bold">Generate Shopping List</Text>
          </TouchableOpacity>

        </ScrollView>

      </SafeAreaView>

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
