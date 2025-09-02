// Utility functions for handling subscription plans

// List of price IDs that have unlimited AI recipe access
const UNLIMITED_PRICE_IDS = [
  'price_1QWp6pEl9PRnOeq5BdPuTmWU', // Original yearly plan
  'price_1QhyoVEl9PRnOeq5rlEdP31y', // Additional unlimited plan 1
  'price_1QBHF8El9PRnOeq5JerI2gKw', // Additional unlimited plan 2
  'price_1QVfRnEl9PRnOeq5u1G8LuQR', // Additional unlimited plan 3
  'price_1S2vTrImUkOCj07bRlmEpnZq', // test plan
];

// Monthly plan price ID (8 recipes per month)
const MONTHLY_PRICE_ID = 'price_1S1vPoEl9PRnOeq5lBf7pBbo';
const TEST_PRICE_ID = 'price_1S2vTcImUkOCj07bxK3ppMcn';

export function isUnlimitedPlan(priceId?: string): boolean {
  return priceId ? UNLIMITED_PRICE_IDS.includes(priceId) : false;
}

export function isMonthlyPlan(priceId?: string): boolean {
  return priceId === TEST_PRICE_ID;
}

export function isFreePlan(hasAccess: boolean): boolean {
  return !hasAccess;
}

export function getPlanType(
  hasAccess: boolean,
  priceId?: string
): 'free' | 'monthly' | 'unlimited' {
  if (!hasAccess) return 'free';
  if (isMonthlyPlan(priceId)) return 'monthly';
  if (isUnlimitedPlan(priceId)) return 'unlimited';
  return 'unlimited'; // Default to unlimited for any other premium plan
}

export function getRecipeLimit(
  planType: 'free' | 'monthly' | 'unlimited'
): number | null {
  switch (planType) {
    case 'free':
      return 3;
    case 'monthly':
      return 8;
    case 'unlimited':
      return null; // No limit
    default:
      return null;
  }
}
