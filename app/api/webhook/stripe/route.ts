import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeClient } from "@/libs/stripe";
import { reconcileBilling } from "@/libs/billing-reconcile";
export const runtime = "nodejs";
const supported = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET,
    url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !key || !process.env.STRIPE_SECRET_KEY)
    return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") || "",
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!supported.has(event.type)) return NextResponse.json({ received: true });
  const object = event.data.object as {
    customer?: string | { id: string };
    client_reference_id?: string;
  };
  const customer =
    typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!customer)
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });
  const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    token = randomUUID();
  try {
    const result = await reconcileBilling({
      claim: async () => {
        const claim = await db.rpc("begin_billing_event", {
          p_event: event.id,
          p_customer: customer,
          p_token: token,
        });
        if (claim.error) throw claim.error;
        return claim.data;
      },
      retrieve: async () => {
        const subscriptions: Stripe.Subscription[] = [];
        for await (const subscription of stripe.subscriptions.list({
          customer,
          status: "all",
          limit: 100,
        }))
          subscriptions.push(subscription);
        return subscriptions;
      },
      commit: async (entitlement, subscriptions) => {
        const candidate =
          object.client_reference_id ||
          subscriptions.map((s) => s.metadata?.user_id).find(Boolean);
        const user =
          candidate &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            candidate,
          )
            ? candidate
            : null;
        const applied = await db.rpc("finish_billing_event", {
          p_event: event.id,
          p_customer: customer,
          p_token: token,
          p_user: user,
          p_price: entitlement.priceId,
          p_access: entitlement.hasAccess,
        });
        if (applied.error) throw applied.error;
      },
      release: async () => {
        await db.rpc("release_billing_event", {
          p_customer: customer,
          p_token: token,
        });
      },
    });
    return NextResponse.json(
      result === "busy"
        ? { error: "Reconciliation in progress" }
        : { received: true },
      { status: result === "busy" ? 503 : 200 },
    );
  } catch {
    // No completed ledger entry is written on failure; Stripe receives a retryable status.
    console.error("Stripe reconciliation failed; delivery will retry");
    return NextResponse.json(
      { error: "Reconciliation failed" },
      { status: 503 },
    );
  }
}
