/**
 * MealPlansScreen
 * Weekly calendar view for meal planning with day cards, meal slots, and macro counters
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/libs/supabase';
import { Haptic } from '@/utils/haptics';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/design';
import { Recipe, MealSlot, MacroGoals } from '@/types/config';
import { MealSlot as MealSlotComponent } from '@/components/MealSlot';
import { MacroCounter } from '@/components/MacroCounter';
import { RecipeSelectionModal } from '@/components/RecipeSelectionModal';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import {
  getWeekStart,
  getWeekEnd,
  getDaysInWeek,
  formatDate,
  isToday,
} from '@/utils/dateUtils';
import { calculateDayMacros } from '@/utils/macroCalculations';
import {
  getMealPlans,
  addMealToPlan,
  removeMealFromPlan,
  MealType,
} from '@/services/mealPlanService';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

export default function MealPlansScreen() {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<MealSlot[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [macroGoals, setMacroGoals] = useState<MacroGoals | undefined>();
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
  
  // Create a map of recipes for quick lookup
  const recipesMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach(recipe => map.set(recipe.id, recipe));
    return map;
  }, [recipes]);

  // Format week range for display
  const weekRangeText = useMemo(() => {
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekEnd.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }, [weekStart, weekEnd]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      // Fetch meal plans for the week
      const mealPlans = await getMealPlans(weekStart, weekEnd);
      setMeals(mealPlans);

      // Fetch all recipes
      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .order('recipe_name', { ascending: true });
      
      if (recipesData) {
        setRecipes(recipesData);
      }

      // Fetch user profile for macro goals
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('calorie_goal, protein_goal, carb_goal, fat_goal')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.calorie_goal) {
          setMacroGoals({
            calories: profile.calorie_goal,
            protein: profile.protein_goal || 150,
            carbs: profile.carb_goal || 250,
            fat: profile.fat_goal || 65,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching meal plan data:', error);
      Alert.alert('Error', 'Failed to load meal plans. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation handlers
  const goToPreviousWeek = async () => {
    await Haptic.navigation();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = async () => {
    await Haptic.navigation();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = async () => {
    await Haptic.buttonPress();
    setCurrentDate(new Date());
  };

  // Meal slot handlers
  const handleSlotPress = (date: string, mealType: MealType) => {
    setSelectedSlot({ date, mealType });
    setRecipeModalVisible(true);
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!selectedSlot) return;
    
    try {
      await addMealToPlan(selectedSlot.date, selectedSlot.mealType, recipe.id);
      
      // Update local state
      setMeals(prev => {
        // Remove existing meal in this slot if any
        const filtered = prev.filter(
          m => !(m.date === selectedSlot.date && m.mealType === selectedSlot.mealType)
        );
        // Add new meal
        return [...filtered, {
          date: selectedSlot.date,
          mealType: selectedSlot.mealType,
          recipeId: recipe.id,
          recipeName: recipe.recipe_name,
        }];
      });
      
      await Haptic.success();
    } catch (error) {
      console.error('Error adding meal to plan:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    }
  };

  const handleDeleteMeal = async (date: string, mealType: MealType) => {
    try {
      await removeMealFromPlan(date, mealType);
      
      // Update local state
      setMeals(prev => prev.filter(
        m => !(m.date === date && m.mealType === mealType)
      ));
    } catch (error) {
      console.error('Error removing meal from plan:', error);
      Alert.alert('Error', 'Failed to remove meal. Please try again.');
    }
  };

  // Get meal for a specific slot
  const getMealForSlot = (date: string, mealType: MealType): MealSlot | undefined => {
    return meals.find(m => m.date === date && m.mealType === mealType);
  };

  // Get recipe for a meal slot
  const getRecipeForSlot = (date: string, mealType: MealType): Recipe | undefined => {
    const meal = getMealForSlot(date, mealType);
    if (meal?.recipeId) {
      return recipesMap.get(meal.recipeId);
    }
    return undefined;
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading meal plans...</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Meal Plans</Text>
          <TouchableOpacity
            style={styles.shoppingButton}
            onPress={async () => {
              await Haptic.buttonPress();
              setShoppingListVisible(true);
            }}
          >
            <Ionicons name="cart-outline" size={24} color="#10b981" />
          </TouchableOpacity>
        </View>
        
        {/* Week Navigation */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday} style={styles.weekTextContainer}>
            <Text style={styles.weekText}>{weekRangeText}</Text>
            <Text style={styles.todayHint}>Tap for today</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
      >
        {daysInWeek.map((day) => {
          const dateStr = formatDate(day);
          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = day.getDate();
          const isTodayDate = isToday(day);
          const dayMacros = calculateDayMacros(dateStr, meals, recipesMap);
          const hasMeals = meals.some(m => m.date === dateStr && m.recipeId);

          return (
            <View key={dateStr} style={[styles.dayCard, isTodayDate && styles.todayCard]}>
              {/* Day Header */}
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <View style={[styles.dayBadge, isTodayDate && styles.todayBadge]}>
                    <Text style={[styles.dayNum, isTodayDate && styles.todayDayNum]}>
                      {dayNum}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.dayName, isTodayDate && styles.todayDayName]}>
                      {dayName}
                    </Text>
                    {isTodayDate && <Text style={styles.todayLabel}>Today</Text>}
                  </View>
                </View>
              </View>

              {/* Meal Slots */}
              <View style={styles.mealSlots}>
                {MEAL_TYPES.map((mealType) => (
                  <MealSlotComponent
                    key={`${dateStr}-${mealType}`}
                    date={dateStr}
                    mealType={mealType}
                    recipe={getRecipeForSlot(dateStr, mealType)}
                    onPress={() => handleSlotPress(dateStr, mealType)}
                    onDelete={() => handleDeleteMeal(dateStr, mealType)}
                  />
                ))}
              </View>

              {/* Macro Counter for the day */}
              {hasMeals && (
                <View style={styles.macroSection}>
                  <MacroCounter
                    currentMacros={dayMacros}
                    macroGoals={macroGoals}
                    compact
                  />
                </View>
              )}
            </View>
          );
        })}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Recipe Selection Modal */}
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

      {/* Shopping List Modal */}
      <ShoppingListModal
        visible={shoppingListVisible}
        onClose={() => setShoppingListVisible(false)}
        meals={meals}
        recipes={recipesMap}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  shoppingButton: {
    padding: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  weekTextContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  todayHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBadge: {
    backgroundColor: '#10b981',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  todayDayNum: {
    color: '#fff',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  todayDayName: {
    color: '#10b981',
  },
  todayLabel: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  mealSlots: {
    gap: 8,
  },
  macroSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bottomSpacer: {
    height: 32,
  },
});
