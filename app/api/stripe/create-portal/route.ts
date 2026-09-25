import { NextRequest, NextResponse } from "next/server";
import { requireUser, apiError, readJson, ApiError } from "@/libs/auth";
import { createCustomerPortal } from "@/libs/stripe";
import { allowedWebReturn } from "@/libs/billing-policy";
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser(req);
    const raw = await readJson(req);
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new ApiError(400, "Invalid request");
    const body = raw as Record<string, unknown>;
    const returnUrl = allowedWebReturn(
      body.returnUrl,
      process.env.NEXT_PUBLIC_SITE_URL || "https://ermajean.com",
    );
    if (!returnUrl) throw new ApiError(400, "Invalid return URL");
    const { data, error } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();
    if (error) throw new ApiError(503, "Profile unavailable");
    if (!data?.customer_id) throw new ApiError(400, "No billing account");
    return NextResponse.json({
      url: await createCustomerPortal({
        customerId: data.customer_id,
        returnUrl,
      }),
    });
  } catch (e) {
    return apiError(e);
  }
}
