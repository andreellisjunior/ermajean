import { NextRequest, NextResponse } from "next/server";
import { requireUser, apiError, ApiError } from "@/libs/auth";
import { getPlanType, getRecipeLimit } from "@/libs/planUtils";
export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser(req);
    const { data, error } = await supabase
      .from("profiles")
      .select("has_access,price_id")
      .eq("id", user.id)
      .single();
    if (error || !data) throw new ApiError(503, "Profile unavailable");
    const plan = getPlanType(data.has_access, data.price_id);
    return NextResponse.json(
      {
        access: plan === "monthly" || plan === "unlimited",
        plan,
        recipe_limit: getRecipeLimit(plan),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
