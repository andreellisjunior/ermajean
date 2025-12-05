/**
 * Meal Plan Service
 * Handles CRUD operations for meal planning functionality
 * Requirements: 3.1, 3.3, 3.4, 3.5
 */

import { supabase } from '../libs/supabase';
import { MealPlan, MealSlot } from '../types/config';
import { formatDate } from '../utils/dateUtils';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

/**
 * Fetches meal plans for a given week range
 * Requirements: 3.1, 3.5
 * 
 * @param weekStart - Start date of the week
 * @param weekEnd - End date of the week
 * @returns Array of MealSlot objects for the week
 */
export async function getMealPlans(weekStart: Date, weekEnd: Date): Promise<MealSlot[]> {
  const startDateStr = formatDate(weekStart);
  const endDateStr = formatDate(weekEnd);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      id,
      date,
      meal_type,
      recipe_id,
      recipes (
        recipe_name
      )
    `)
    .eq('user_id', user.user.id)
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .order('date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch meal plans: ${error.message}`);
  }

  // Transform database records to MealSlot format
  const mealSlots: MealSlot[] = (data || []).map((plan: any) => ({
    date: plan.date,
    mealType: plan.meal_type as MealType,
    recipeId: plan.recipe_id,
    recipeName: plan.recipes?.recipe_name,
  }));

  return mealSlots;
}

/**
 * Adds a recipe to a meal slot
 * Requirements: 3.3
 * 
 * @param date - Date string in YYYY-MM-DD format
 * @param mealType - Type of meal (Breakfast, Lunch, Dinner)
 * @param recipeId - ID of the recipe to assign
 */
export async function addMealToPlan(
  date: string,
  mealType: MealType,
  recipeId: string
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // First, remove any existing meal in this slot (upsert behavior)
  await removeMealFromPlan(date, mealType);

  const { error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: user.user.id,
      date,
      meal_type: mealType,
      recipe_id: recipeId,
    });

  if (error) {
    throw new Error(`Failed to add meal to plan: ${error.message}`);
  }
}

/**
 * Removes a meal from a specific slot
 * Requirements: 3.4
 * 
 * @param date - Date string in YYYY-MM-DD format
 * @param mealType - Type of meal (Breakfast, Lunch, Dinner)
 */
export async function removeMealFromPlan(
  date: string,
  mealType: MealType
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', user.user.id)
    .eq('date', date)
    .eq('meal_type', mealType);

  if (error) {
    throw new Error(`Failed to remove meal from plan: ${error.message}`);
  }
}

/**
 * Clears all meals for a given week
 * Requirements: 3.5
 * 
 * @param weekStart - Start date of the week
 * @param weekEnd - End date of the week
 */
export async function clearWeekMealPlan(
  weekStart: Date,
  weekEnd: Date
): Promise<void> {
  const startDateStr = formatDate(weekStart);
  const endDateStr = formatDate(weekEnd);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', user.user.id)
    .gte('date', startDateStr)
    .lte('date', endDateStr);

  if (error) {
    throw new Error(`Failed to clear week meal plan: ${error.message}`);
  }
}

// Export all functions as a service object for convenience
export const MealPlanService = {
  getMealPlans,
  addMealToPlan,
  removeMealFromPlan,
  clearWeekMealPlan,
};

export default MealPlanService;
