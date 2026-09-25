import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { getPlanType } from "@/libs/planUtils";
import { Recipe } from "@/types";
export type Profile = {
  name: string;
  email: string;
  has_access: boolean;
  price_id?: string;
  location?: string;
};
export type Meal = {
  id: string;
  date: string;
  meal_type: string;
  recipe_id: string;
};
export type WorkspaceData = {
  recipes: Recipe[];
  profile: Profile;
  meals: Meal[];
  userId: string;
  error?: string;
  preview?: boolean;
  usageCount?: number;
};
export async function loadWorkspace(): Promise<WorkspaceData> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/sign-in");
  const [recipes, profile, meals] = await Promise.all([
    db
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    db.from("profiles").select("*").eq("id", user.id).single(),
    db
      .from("meal_plans")
      .select("id,date,meal_type,recipe_id")
      .eq("user_id", user.id),
  ]);
  const allowance = await db.rpc("generation_allowance");
  const usageCount = allowance.data?.used;
  return {
    usageCount,
    recipes: (recipes.data || []).map((r) => ({ ...r, id: String(r.id) })),
    profile: profile.data || {
      name: "Friend",
      email: user.email || "",
      has_access: false,
    },
    meals: (meals.data || []).map((m) => ({
      ...m,
      recipe_id: String(m.recipe_id),
    })),
    userId: user.id,
    error:
      recipes.error || meals.error || profile.error || allowance.error
        ? "Some kitchen data could not load. Refresh to try again."
        : undefined,
  };
}
