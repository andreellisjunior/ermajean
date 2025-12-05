/**
 * Macro calculation utility functions
 * Requirements: 3.6
 */

import { Recipe, MealSlot, DayMacros, MacroGoals } from '../types/config';

export interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

/**
 * Calculates the total macros for a day based on planned meals
 * @param date - The date string (YYYY-MM-DD)
 * @param meals - Array of meal slots for the day
 * @param recipes - Map of recipe IDs to Recipe objects
 * @returns DayMacros object with summed nutritional values
 */
export function calculateDayMacros(
  date: string,
  meals: MealSlot[],
  recipes: Map<string, Recipe>
): DayMacros {
  const dayMeals = meals.filter(meal => meal.date === date && meal.recipeId);
  
  const totals = dayMeals.reduce(
    (acc, meal) => {
      const recipe = meal.recipeId ? recipes.get(meal.recipeId) : undefined;
      if (recipe) {
        return {
          calories: acc.calories + (recipe.calories ?? 0),
          protein: acc.protein + (recipe.protein ?? 0),
          carbs: acc.carbs + (recipe.carbs ?? 0),
          fat: acc.fat + (recipe.fat ?? 0),
          fiber: acc.fiber + (recipe.fiber ?? 0),
          sugar: acc.sugar + (recipe.sugar ?? 0),
          sodium: acc.sodium + (recipe.sodium ?? 0),
        };
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );

  return {
    date,
    ...totals,
  };
}

/**
 * Sums multiple MacroValues objects together
 * @param macros - Array of MacroValues to sum
 * @returns Combined MacroValues
 */
export function sumMacros(macros: MacroValues[]): MacroValues {
  return macros.reduce(
    (acc, macro) => ({
      calories: acc.calories + macro.calories,
      protein: acc.protein + macro.protein,
      carbs: acc.carbs + macro.carbs,
      fat: acc.fat + macro.fat,
      fiber: acc.fiber + macro.fiber,
      sugar: acc.sugar + macro.sugar,
      sodium: acc.sodium + macro.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
}

/**
 * Calculates the percentage of a macro value against a goal
 * @param current - Current macro value
 * @param goal - Goal macro value
 * @returns Percentage (0-100+), returns 0 if goal is 0
 */
export function calculateMacroPercentage(current: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }
  return Math.round((current / goal) * 100);
}
