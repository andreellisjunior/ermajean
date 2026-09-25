import { NextRequest, NextResponse } from "next/server";
import { requireUser, apiError, readJson, ApiError } from "@/libs/auth";
import { createCheckout } from "@/libs/stripe";
import { isCheckoutPrice } from "@/libs/planUtils";
import { allowedWebReturn } from "@/libs/billing-policy";
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser(req);
    const raw = await readJson(req);
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new ApiError(400, "Invalid request");
    const body = raw as Record<string, unknown>;
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://ermajean.com";
    const successUrl = allowedWebReturn(body.successUrl, origin),
      cancelUrl = allowedWebReturn(body.cancelUrl, origin);
    if (
      !isCheckoutPrice(body.priceId) ||
      body.mode !== "subscription" ||
      !successUrl ||
      !cancelUrl
    )
      throw new ApiError(400, "Invalid checkout request");
    const { data, error } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user.id)
      .single();
    if (error || !data) throw new ApiError(503, "Profile unavailable");
    return NextResponse.json({
      url: await createCheckout({
        priceId: body.priceId,
        mode: "subscription",
        successUrl,
        cancelUrl,
        clientReferenceId: user.id,
        user: { email: user.email, customerId: data.customer_id || undefined },
      }),
    });
  } catch (e) {
    return apiError(e);
  }
}
