import { isCheckoutPrice, isUnlimitedPlan } from "./planUtils";

export function allowedWebReturn(
  value: unknown,
  origin: string,
): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || url.username || url.password) return null;
    if (
      ![
        "/recipes",
        "/kitchen",
        "/profile",
        "/",
        "/auth/checkout-success",
      ].includes(url.pathname)
    )
      return null;
    return url.toString();
  } catch {
    return null;
  }
}
export function recoveryTarget(value: string | null): string {
  return value &&
    [
      "/recipes/reset-password",
      "/reset-password",
      "/kitchen",
      "/recipes",
      "ermajean://reset-password",
    ].includes(value)
    ? value
    : "/kitchen";
}
export function ownsCheckout(
  session: { client_reference_id?: string | null; customer?: unknown },
  userId: string,
  customerId?: string | null,
): boolean {
  return (
    session.client_reference_id === userId ||
    !!(
      customerId &&
      (typeof session.customer === "string"
        ? session.customer
        : (session.customer as { id?: string })?.id) === customerId
    )
  );
}
export function subscriptionEntitlement(
  subscriptions: Array<{
    status: string;
    items: { data: Array<{ price: { id: string } }> };
    metadata?: Record<string, string>;
  }>,
) {
  const eligible = subscriptions
    .filter((s) => ["active", "trialing"].includes(s.status))
    .flatMap((s) => s.items.data.map((i) => i.price.id))
    .filter(isCheckoutPrice);
  const priceId = eligible.find(isUnlimitedPlan) || eligible[0] || null;
  return { priceId, hasAccess: !!priceId };
}
