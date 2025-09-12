import { redirect } from 'next/navigation';

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: 'error' | 'success',
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * Formats AI recipe response from structured outputs
 * Since we're using structured outputs, the schema is guaranteed to be correct
 * @param {any} structuredResponse - The structured response from AI
 * @returns {object} Formatted recipe object
 */
export function formatStructuredRecipe(structuredResponse: any) {
  // With structured outputs, we know the data conforms to our schema
  // We just need to clean and format the content

  const {
    recipe_name,
    description,
    prep_time,
    cook_time,
    total_time,
    servings,
    difficulty_level,
    course,
    ingredients,
    instructions,
    estimated_cost_per_serving,
    dining_out_cost_per_serving,
    estimated_savings_per_serving,
  } = structuredResponse;

  // Clean and format ingredients (trim whitespace)
  const cleanIngredients = ingredients.map((ingredient: string) =>
    ingredient.trim()
  );

  // Clean and format instructions (ensure proper numbering)
  const cleanInstructions = instructions.map(
    (instruction: string, index: number) => {
      const cleaned = instruction.trim();
      // Add step numbers if not already present
      if (!cleaned.match(/^\d+\./)) {
        return `${index + 1}. ${cleaned}`;
      }
      return cleaned;
    }
  );

  return {
    recipe_name: recipe_name.trim(),
    description: description.trim(),
    prep_time: prep_time.trim(),
    cook_time: cook_time.trim(),
    total_time: total_time.trim(),
    servings: servings.trim(),
    difficulty_level: difficulty_level.trim(),
    course: course.trim(),
    ingredients: cleanIngredients,
    instructions: cleanInstructions,
    estimated_cost_per_serving: estimated_cost_per_serving.trim(),
    dining_out_cost_per_serving: dining_out_cost_per_serving.trim(),
    estimated_savings_per_serving: estimated_savings_per_serving.trim(),
  };
}

/**
 * Legacy validation function for backward compatibility
 * @deprecated Use formatStructuredRecipe for structured outputs
 */
export function validateAndFormatRecipe(rawResponse: any) {
  return formatStructuredRecipe(rawResponse);
}
