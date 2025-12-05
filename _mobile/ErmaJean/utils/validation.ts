/**
 * Validation utility functions
 * Requirements: 7.4
 */

import { RecipeInput, MacroGoals } from '../types/config';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Simple key-value error map for form components
export type ValidationErrors = Record<string, string | undefined>;

/**
 * Validates a recipe form submission
 * Required fields: recipe_name, description, ingredients, instructions
 * @param recipe - The recipe input to validate
 * @returns ValidationErrors object with field names as keys and error messages as values
 */
export function validateRecipeForm(recipe: Partial<RecipeInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  // Required field validations
  if (!recipe.recipe_name || recipe.recipe_name.trim() === '') {
    errors.recipe_name = 'Recipe name is required';
  }

  if (!recipe.description || recipe.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!recipe.ingredients || recipe.ingredients.trim() === '') {
    errors.ingredients = 'Ingredients are required';
  }

  if (!recipe.instructions || recipe.instructions.trim() === '') {
    errors.instructions = 'Instructions are required';
  }

  // Optional numeric field validations (if provided, must be valid)
  if (recipe.calories !== undefined && recipe.calories < 0) {
    errors.calories = 'Calories must be a positive number';
  }

  if (recipe.protein !== undefined && recipe.protein < 0) {
    errors.protein = 'Protein must be a positive number';
  }

  if (recipe.carbs !== undefined && recipe.carbs < 0) {
    errors.carbs = 'Carbs must be a positive number';
  }

  if (recipe.fat !== undefined && recipe.fat < 0) {
    errors.fat = 'Fat must be a positive number';
  }

  return errors;
}

/**
 * Validates macro goals form submission
 * All fields must be positive numbers within reasonable ranges
 * @param goals - The macro goals to validate
 * @returns ValidationResult with isValid flag and array of errors
 */
export function validateGoalsForm(goals: Partial<MacroGoals>): ValidationResult {
  const errors: ValidationError[] = [];

  // Calories validation (reasonable range: 500-10000)
  if (goals.calories === undefined || goals.calories === null) {
    errors.push({ field: 'calories', message: 'Calorie goal is required' });
  } else if (goals.calories < 500 || goals.calories > 10000) {
    errors.push({ field: 'calories', message: 'Calorie goal must be between 500 and 10000' });
  }

  // Protein validation (reasonable range: 0-500g)
  if (goals.protein === undefined || goals.protein === null) {
    errors.push({ field: 'protein', message: 'Protein goal is required' });
  } else if (goals.protein < 0 || goals.protein > 500) {
    errors.push({ field: 'protein', message: 'Protein goal must be between 0 and 500g' });
  }

  // Carbs validation (reasonable range: 0-1000g)
  if (goals.carbs === undefined || goals.carbs === null) {
    errors.push({ field: 'carbs', message: 'Carbs goal is required' });
  } else if (goals.carbs < 0 || goals.carbs > 1000) {
    errors.push({ field: 'carbs', message: 'Carbs goal must be between 0 and 1000g' });
  }

  // Fat validation (reasonable range: 0-500g)
  if (goals.fat === undefined || goals.fat === null) {
    errors.push({ field: 'fat', message: 'Fat goal is required' });
  } else if (goals.fat < 0 || goals.fat > 500) {
    errors.push({ field: 'fat', message: 'Fat goal must be between 0 and 500g' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
