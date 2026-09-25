// Single explicit production catalog. Unknown paid IDs never gain access.
export const YEARLY_PRICE_ID = "price_1QWp6pEl9PRnOeq5BdPuTmWU";
export const MONTHLY_PRICE_ID = "price_1S1vPoEl9PRnOeq5lBf7pBbo";
export type PlanType = "free" | "monthly" | "unlimited" | "unknown";
export const isUnlimitedPlan = (priceId?: string) =>
  priceId === YEARLY_PRICE_ID;
export const isMonthlyPlan = (priceId?: string) => priceId === MONTHLY_PRICE_ID;
export const isFreePlan = (hasAccess: boolean) => !hasAccess;
export function getPlanType(hasAccess: boolean, priceId?: string): PlanType {
  if (!hasAccess) return "free";
  if (isMonthlyPlan(priceId)) return "monthly";
  if (isUnlimitedPlan(priceId)) return "unlimited";
  return "unknown";
}
export function getRecipeLimit(plan: PlanType): number | null {
  return plan === "unlimited"
    ? null
    : plan === "monthly"
      ? 8
      : plan === "free"
        ? 3
        : 0;
}
export const isCheckoutPrice = (value: unknown): value is string =>
  typeof value === "string" && (isMonthlyPlan(value) || isUnlimitedPlan(value));
