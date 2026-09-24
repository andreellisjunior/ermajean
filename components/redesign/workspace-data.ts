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
  const db = createClient();
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
  const plan = getPlanType(
    profile.data?.has_access || false,
    profile.data?.price_id,
  );
  let usageCount = 0;
  if (plan !== "unlimited") {
    let query = db
      .from("recipe_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("source", plan === "monthly" ? "monthly" : "free");
    if (plan === "monthly") {
      const month = new Date();
      month.setDate(1);
      month.setHours(0, 0, 0, 0);
      query = query.gte("created_at", month.toISOString());
    }
    usageCount = (await query).count || 0;
  }
  return {
    usageCount,
    recipes: recipes.data || [],
    profile: profile.data || {
      name: "Friend",
      email: user.email || "",
      has_access: false,
    },
    meals: meals.data || [],
    userId: user.id,
    error:
      recipes.error || meals.error || profile.error
        ? "Some kitchen data could not load. Refresh to try again."
        : undefined,
  };
}
