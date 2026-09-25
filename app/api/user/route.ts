import { NextRequest, NextResponse } from "next/server";
import { requireUser, apiError, ApiError } from "@/libs/auth";
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireUser(request);
    const { data, error } = await supabase.rpc("generation_allowance");
    if (error || !data)
      throw new ApiError(503, "Account allowance unavailable");
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
