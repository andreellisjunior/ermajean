import Stripe from "stripe";
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("Billing is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
}
export async function createCheckout({
  priceId,
  successUrl,
  cancelUrl,
  clientReferenceId,
  user,
}: {
  priceId: string;
  mode: "subscription";
  successUrl: string;
  cancelUrl: string;
  clientReferenceId: string;
  user?: { customerId?: string; email?: string };
}) {
  const session = await stripeClient().checkout.sessions.create({
    mode: "subscription",
    allow_promotion_codes: true,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: clientReferenceId,
    subscription_data: { metadata: { user_id: clientReferenceId } },
    ...(user?.customerId
      ? { customer: user.customerId }
      : { customer_email: user?.email }),
  });
  if (!session.url) throw new Error("Checkout unavailable");
  return session.url;
}
export async function createCustomerPortal({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return (
    await stripeClient().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  ).url;
}
export async function findCheckoutSession(sessionId: string) {
  return stripeClient().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
}
