import { NextRequest, NextResponse } from "next/server";
import { requireUser, apiError, ApiError } from "@/libs/auth";
import { stripeClient } from "@/libs/stripe";
import { getPlanType } from "@/libs/planUtils";
import { ownsCheckout } from "@/libs/billing-policy";
export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser(req);
    const id = req.nextUrl.searchParams.get("session_id");
    if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id))
      throw new ApiError(400, "Invalid session");
    const { data, error } = await supabase
      .from("profiles")
      .select("customer_id,has_access,price_id")
      .eq("id", user.id)
      .single();
    if (error) throw new ApiError(503, "Profile unavailable");
    const session = await stripeClient().checkout.sessions.retrieve(id);
    if (!ownsCheckout(session, user.id, data?.customer_id))
      throw new ApiError(404, "Session unavailable");
    return NextResponse.json(
      {
        session_id: id,
        complete: session.status === "complete",
        payment_status: session.payment_status,
        has_access: ["monthly", "unlimited"].includes(
          getPlanType(!!data?.has_access, data?.price_id),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
