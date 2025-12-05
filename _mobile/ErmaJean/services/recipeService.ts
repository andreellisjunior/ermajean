/**
 * Recipe Service
 * Handles CRUD operations for recipe management
 * Requirements: 7.3
 */

import { supabase } from '../libs/supabase';
import { Recipe, RecipeInput } from '../types/config';

/**
 * Fetches all recipes for the current user
 * 
 * @returns Array of Recipe objects
 */
export async function getRecipes(): Promise<Recipe[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetches a single recipe by ID
 * 
 * @param id - Recipe ID
 * @returns Recipe object or null if not found
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Recipe not found
    }
    throw new Error(`Failed to fetch recipe: ${error.message}`);
  }

  return data;
}


/**
 * Creates a new recipe
 * Requirements: 7.3
 * 
 * @param recipe - Recipe input data
 * @returns The created Recipe object
 */
export async function createRecipe(recipe: RecipeInput): Promise<Recipe> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.user.id,
      recipe_name: recipe.recipe_name,
      description: recipe.description,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      total_time: recipe.total_time,
      servings: recipe.servings,
      difficulty_level: recipe.difficulty_level,
      course: recipe.course,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber,
      sugar: recipe.sugar,
      sodium: recipe.sodium,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create recipe: ${error.message}`);
  }

  return data;
}

/**
 * Updates an existing recipe
 * Requirements: 7.3
 * 
 * @param id - Recipe ID to update
 * @param recipe - Partial recipe data to update
 * @returns The updated Recipe object
 */
export async function updateRecipe(
  id: string,
  recipe: Partial<RecipeInput>
): Promise<Recipe> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('recipes')
    .update({
      ...(recipe.recipe_name !== undefined && { recipe_name: recipe.recipe_name }),
      ...(recipe.description !== undefined && { description: recipe.description }),
      ...(recipe.prep_time !== undefined && { prep_time: recipe.prep_time }),
      ...(recipe.cook_time !== undefined && { cook_time: recipe.cook_time }),
      ...(recipe.total_time !== undefined && { total_time: recipe.total_time }),
      ...(recipe.servings !== undefined && { servings: recipe.servings }),
      ...(recipe.difficulty_level !== undefined && { difficulty_level: recipe.difficulty_level }),
      ...(recipe.course !== undefined && { course: recipe.course }),
      ...(recipe.ingredients !== undefined && { ingredients: recipe.ingredients }),
      ...(recipe.instructions !== undefined && { instructions: recipe.instructions }),
      ...(recipe.calories !== undefined && { calories: recipe.calories }),
      ...(recipe.protein !== undefined && { protein: recipe.protein }),
      ...(recipe.carbs !== undefined && { carbs: recipe.carbs }),
      ...(recipe.fat !== undefined && { fat: recipe.fat }),
      ...(recipe.fiber !== undefined && { fiber: recipe.fiber }),
      ...(recipe.sugar !== undefined && { sugar: recipe.sugar }),
      ...(recipe.sodium !== undefined && { sodium: recipe.sodium }),
    })
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update recipe: ${error.message}`);
  }

  return data;
}

/**
 * Deletes a recipe by ID
 * Requirements: 7.3
 * 
 * @param id - Recipe ID to delete
 */
export async function deleteRecipe(id: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);

  if (error) {
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
}

// Export all functions as a service object for convenience
export const RecipeService = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};

export default RecipeService;
