import { createClient } from "@/libs/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const { data } = await supabase
    .from("recipes")
    .select(
      "id,recipe_name,description,prep_time,cook_time,total_time,servings,difficulty_level,course,ingredients,instructions",
    )
    .eq("id", id)
    .single();

  return NextResponse.json(data);
}
