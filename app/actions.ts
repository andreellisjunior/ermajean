"use server";

import { generateRecipe } from "@/libs/ai/generation";
import { requireUser, ApiError } from "@/libs/auth";
import { saveRecipe, deleteOwnedRecipe } from "@/libs/recipe-service";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createClient } from "@/libs/supabase/server";
import { encodedRedirect } from "@/libs/utils";
import { redirect } from "next/navigation";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ermajean.com";
const emailValue = (form: FormData) => {
  const value = form.get("email");
  return typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? value.trim()
    : null;
};
const passwordValue = (form: FormData, key = "password") => {
  const value = form.get(key);
  return typeof value === "string" && value.length >= 8 && value.length <= 128
    ? value
    : null;
};
export const signUpAction = async (formData: FormData) => {
  const email = emailValue(formData),
    password = passwordValue(formData);
  if (!email || !password)
    return encodedRedirect(
      "error",
      "/sign-up",
      "Enter a valid email and a password of 8–128 characters.",
    );
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${defaultUrl}/api/auth/callback` },
  });
  return encodedRedirect(
    error ? "error" : "success",
    "/sign-up",
    error
      ? "Unable to create account. Please try again."
      : "Check your email for a verification link.",
  );
};
export const signInAction = async (formData: FormData) => {
  const email = emailValue(formData),
    password = formData.get("password");
  if (
    !email ||
    typeof password !== "string" ||
    !password ||
    password.length > 128
  )
    return { status: 400, message: "Enter your email and password." };
  const { error } = await (
    await createClient()
  ).auth.signInWithPassword({ email, password });
  return error
    ? {
        status: 401,
        message: "Unable to sign in. Check your email and password.",
      }
    : { status: 200, message: "Signed in" };
};
export const googleAuth = async () => {
  const { data, error } = await (
    await createClient()
  ).auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${defaultUrl}/api/auth/callback` },
  });
  if (error || !data.url)
    return encodedRedirect(
      "error",
      "/sign-in",
      "Unable to sign in. Please try again.",
    );
  redirect(data.url);
};
export const forgotPasswordAction = async (formData: FormData) => {
  const email = emailValue(formData);
  if (!email)
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Enter a valid email address.",
    );
  const { error } = await (
    await createClient()
  ).auth.resetPasswordForEmail(email, {
    redirectTo: `${defaultUrl}/api/auth/callback?redirect_to=/recipes/reset-password`,
  });
  // Never redirect to caller-controlled callbackUrl or expose account existence.
  return encodedRedirect(
    error ? "error" : "success",
    "/forgot-password",
    error
      ? "Unable to send the link right now. Please try again."
      : "If an account exists, you’ll receive a password reset link.",
  );
};
export const resetPasswordAction = async (formData: FormData) => {
  const password = passwordValue(formData),
    confirmation = passwordValue(formData, "confirmPassword");
  if (!password || password !== confirmation)
    return encodedRedirect(
      "error",
      "/recipes/reset-password",
      "Use matching passwords of 8–128 characters.",
    );
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Request a new password reset link.",
    );
  const { error } = await supabase.auth.updateUser({ password });
  return encodedRedirect(
    error ? "error" : "success",
    "/recipes/reset-password",
    error
      ? "Password update failed. Please request a new link."
      : "Password updated",
  );
};
export const signOutAction = async () => {
  await (await createClient()).auth.signOut();
  return redirect("/");
};

const field = (f: FormData, k: string, fallback = "") =>
  f.get(k)?.toString() || fallback;
const failure = (error: unknown) => ({
  success: false as const,
  message:
    error instanceof ApiError
      ? error.message
      : error instanceof z.ZodError
        ? "Please check the form values."
        : "Could not complete your request. Please try again.",
});
async function saveForm(form: FormData) {
  const { supabase, user } = await requireUser();
  const input: Record<string, unknown> = {
    recipe_name: field(form, "recipeName"),
    description: field(form, "desc"),
    prep_time: field(form, "prepTime"),
    cook_time: field(form, "cookTime"),
    total_time: field(form, "estTotalTime"),
    servings: field(form, "servings"),
    difficulty_level: field(form, "level[name]", field(form, "level")),
    course: field(form, "course[name]", field(form, "course")),
    ingredients: field(form, "ingredients"),
    instructions: field(form, "instructions"),
    is_kid_friendly: field(form, "isKidFriendly") === "true",
  };
  for (const k of [
    "calories",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "sugar",
    "sodium",
  ])
    if (form.has(k)) input[k] = field(form, k) ? Number(field(form, k)) : null;
  return saveRecipe(supabase, user.id, input, field(form, "id") || undefined);
}
export const addNewRecipeModalAction = async (form: FormData) => {
  try {
    return {
      success: true as const,
      message: "Recipe saved",
      data: [await saveForm(form)],
    };
  } catch (error) {
    return failure(error);
  }
};
export const addNewRecipeAction = async (form: FormData) => {
  const result = await addNewRecipeModalAction(form);
  return encodedRedirect(
    result.success ? "success" : "error",
    "/recipes",
    result.message,
  );
};
export const addAIRecipeModalAction = async (form: FormData) => {
  try {
    const { supabase, user } = await requireUser();
    const result = await generateRecipe(
      user.id,
      {
        taste: field(form, "taste", "something savory"),
        ingredients: field(form, "ingredients"),
        serving: field(form, "serving", "4"),
        total_time: field(form, "totalTime", "30 minutes"),
        course: field(form, "course", "Dinner"),
        restrictions: field(form, "restrictions"),
        is_kid_friendly: field(form, "isKidFriendly") === "true",
      },
      field(form, "requestId") || randomUUID(),
    );
    const { data, error } = await supabase.rpc("save_generated_recipe", {
      p_key: result.requestId,
    });
    if (error)
      throw new ApiError(
        503,
        "Recipe generated but could not be saved. Retry with the same request.",
      );
    return { success: true as const, message: "Recipe saved", data: [data] };
  } catch (error) {
    return failure(error);
  }
};
export const addAIRecipeAction = async (form: FormData) => {
  const result = await addAIRecipeModalAction(form);
  return encodedRedirect(
    result.success ? "success" : "error",
    "/recipes",
    result.message,
  );
};
export const shareRecipeAction = async (recipeId: string) => {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.rpc("publish_recipe", {
      p_recipe_id: z.coerce.number().int().positive().parse(recipeId),
    });
    if (error) throw new Error();
  } catch {
    return encodedRedirect("error", "/recipes", "Could not share recipe");
  }
  return redirect(`/recipe/${recipeId}`);
};
export const deleteRecipeAction = async (recipeId: string) => {
  try {
    const { supabase } = await requireUser();
    await deleteOwnedRecipe(supabase, recipeId);
  } catch {
    return encodedRedirect("error", "/recipes", "Could not delete recipe");
  }
  return redirect("/recipes");
};
async function updateProfileFields(input: Record<string, unknown>) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id);
  if (error) throw new Error("Profile update failed");
}
export const addProfileNameAction = async (form: FormData) => {
  try {
    await updateProfileFields({
      name: z.string().trim().min(1).max(100).parse(field(form, "name")),
    });
  } catch {
    return encodedRedirect("error", "/recipes", "Could not update name");
  }
  return encodedRedirect("success", "/recipes", "Name updated");
};
export const updateProfileAction = async (form: FormData) => {
  try {
    await updateProfileFields({
      name: z.string().trim().min(1).max(100).parse(field(form, "name")),
      location: z.string().trim().max(200).parse(field(form, "location")),
      kid_friendly_preference: field(form, "kidFriendlyPreference") === "true",
    });
  } catch {
    return encodedRedirect("error", "/recipes", "Could not update profile");
  }
  return encodedRedirect("success", "/recipes", "Profile updated");
};
export const updateMacroGoalsModalAction = async (form: FormData) => {
  try {
    const goals: Record<string, number> = {};
    for (const [key, fieldName, defaultValue, max] of [
      ["calorie_goal", "calorieGoal", 2000, 20000],
      ["protein_goal", "proteinGoal", 150, 2000],
      ["carb_goal", "carbGoal", 250, 5000],
      ["fat_goal", "fatGoal", 65, 2000],
    ] as const)
      goals[key] = z.coerce
        .number()
        .int()
        .min(0)
        .max(max)
        .parse(field(form, fieldName, String(defaultValue)));
    await updateProfileFields(goals);
    return { success: true as const, message: "Macro goals updated" };
  } catch (error) {
    return failure(error);
  }
};
export const updateMacroGoalsAction = async (form: FormData) => {
  const result = await updateMacroGoalsModalAction(form);
  return encodedRedirect(
    result.success ? "success" : "error",
    "/recipes",
    result.message,
  );
};
export const deleteUserAction = async () => {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("delete_user");
  if (error)
    return encodedRedirect(
      "error",
      "/recipes",
      error.code === "55000"
        ? "Complete billing closure with support before deleting this account."
        : "Could not delete account",
    );
  await supabase.auth.signOut();
  return redirect("/");
};
const dateValue = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => !Number.isNaN(Date.parse(v)));
const mealValue = z.enum(["Breakfast", "Lunch", "Dinner"]);
export const addMealToPlanAction = async (form: FormData) => {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.rpc("replace_meal_plan", {
      p_date: dateValue.parse(field(form, "date")),
      p_meal_type: mealValue.parse(field(form, "mealType")),
      p_recipe_id: z.coerce
        .number()
        .int()
        .positive()
        .parse(field(form, "recipeId")),
    });
    if (error) throw new Error();
  } catch {
    return encodedRedirect("error", "/meal-plans", "Could not save meal");
  }
  return encodedRedirect("success", "/meal-plans", "Meal saved");
};
export const removeMealFromPlanAction = async (form: FormData) => {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("date", dateValue.parse(field(form, "date")))
      .eq("meal_type", mealValue.parse(field(form, "mealType")));
    if (error) throw new Error();
  } catch {
    return encodedRedirect("error", "/meal-plans", "Could not remove meal");
  }
  return encodedRedirect("success", "/meal-plans", "Meal removed");
};
export const clearWeekMealPlanAction = async (form: FormData) => {
  try {
    const { supabase, user } = await requireUser();
    const start = dateValue.parse(field(form, "weekStart")),
      end = dateValue.parse(field(form, "weekEnd"));
    if (end < start || Date.parse(end) - Date.parse(start) > 7 * 86400000)
      throw new Error();
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);
    if (error) throw new Error();
  } catch {
    return encodedRedirect("error", "/meal-plans", "Could not clear week");
  }
  return encodedRedirect("success", "/meal-plans", "Week cleared");
};
export const generateShoppingListAction = async (form: FormData) => {
  try {
    const { supabase, user } = await requireUser();
    const weekStart = dateValue.parse(field(form, "weekStart")),
      weekEnd = dateValue.parse(field(form, "weekEnd"));
    if (
      weekEnd < weekStart ||
      Date.parse(weekEnd) - Date.parse(weekStart) > 7 * 86400000
    )
      throw new Error();
    const { data, error } = await supabase
      .from("meal_plans")
      .select("recipes(id,recipe_name,ingredients)")
      .eq("user_id", user.id)
      .gte("date", weekStart)
      .lte("date", weekEnd);
    if (error) throw new Error();
    const recipes = (data || []).flatMap((m: any) =>
      m.recipes ? [m.recipes] : [],
    );
    return {
      success: true as const,
      message: "Shopping list ready",
      data: {
        weekStart,
        weekEnd,
        totalRecipes: new Set(recipes.map((r: any) => r.id)).size,
        shoppingList: recipes.flatMap((r: any) =>
          r.ingredients
            .split("\n")
            .filter((s: string) => s.trim())
            .map((name: string) => ({
              name: name.trim(),
              quantity: "",
              unit: "",
              recipes: [r.recipe_name],
              category: "Other",
            })),
        ),
      },
    };
  } catch (error) {
    return failure(error);
  }
};
