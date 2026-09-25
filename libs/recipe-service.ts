import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./security/errors";
import {
  idSchema,
  recipeSchema,
  recipeUpdateSchema,
} from "./security/recipe-validation";
export async function ownedRecipe(
  db: SupabaseClient,
  userId: string,
  recipeId: unknown,
) {
  const id = idSchema.parse(recipeId);
  const { data, error } = await db
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new ApiError(500, "Could not load recipe");
  if (!data) throw new ApiError(404, "Recipe not found");
  return data;
}
export async function saveRecipe(
  db: SupabaseClient,
  userId: string,
  input: unknown,
  id?: unknown,
) {
  if (id !== undefined) {
    const parsed = recipeUpdateSchema.parse({ ...(input as object), id });
    const { id: recipeId, ...changes } = parsed;
    const { data, error } = await db
      .from("recipes")
      .update(changes)
      .eq("id", recipeId)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) throw new ApiError(500, "Could not save recipe");
    if (!data) throw new ApiError(404, "Recipe not found");
    return data;
  }
  const recipe = recipeSchema.parse(input);
  const { data, error } = await db
    .from("recipes")
    .insert({ ...recipe, user_id: userId })
    .select()
    .single();
  if (error || !data) throw new ApiError(500, "Could not save recipe");
  return data;
}
export async function deleteOwnedRecipe(db: SupabaseClient, recipeId: unknown) {
  const id = idSchema.parse(recipeId);
  const { error } = await db.rpc("delete_owned_recipe", { p_recipe_id: id });
  if (error)
    throw new ApiError(
      error.code === "P0002" ? 404 : 500,
      error.code === "P0002" ? "Recipe not found" : "Could not delete recipe",
    );
}
