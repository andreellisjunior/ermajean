/**
 * Recipe Search Utility
 * Provides filtering functionality for recipes
 * Requirements: 1.2
 */

import { Recipe } from '../types/config';

/**
 * Filters recipes by search query
 * Requirements: 1.2
 * 
 * Property 1: Recipe Search Filtering
 * For any search query and recipe list, the filtered results SHALL only contain
 * recipes where the recipe name or description includes the search term (case-insensitive).
 * 
 * @param recipes - Array of recipes to filter
 * @param query - Search query string
 * @returns Filtered array of recipes matching the query
 */
export function filterRecipes(recipes: Recipe[], query: string): Recipe[] {
  // Return all recipes if query is empty or only whitespace
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return recipes;
  }

  const lowerQuery = trimmedQuery.toLowerCase();

  return recipes.filter((recipe) => {
    const nameMatch = recipe.recipe_name?.toLowerCase().includes(lowerQuery);
    const descriptionMatch = recipe.description?.toLowerCase().includes(lowerQuery);
    return nameMatch || descriptionMatch;
  });
}

export default { filterRecipes };
