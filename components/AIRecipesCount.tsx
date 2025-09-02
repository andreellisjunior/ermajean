'use client';

import { getPlanType, getRecipeLimit } from '@/libs/planUtils';

export default function AIRecipesCount({
  count,
  userPlan,
}: {
  count: number;
  userPlan: {
    has_access: boolean;
    price_id?: string;
  };
}) {
  const planType = getPlanType(userPlan.has_access, userPlan.price_id);
  const recipeLimit = getRecipeLimit(planType);

  if (planType === 'unlimited') {
    return (
      <div className="flex gap-2 items-center justify-between w-auto m-4 p-2 font-bold border-2 rounded-lg backdrop-blur-lg text-green-600 border-green-600 bg-green-50">
        <p>Unlimited AI Recipes</p>
        <p>∞</p>
      </div>
    );
  }

  if (planType === 'monthly' && recipeLimit) {
    const remaining = Math.max(0, recipeLimit - count);
    const isAtLimit = count >= recipeLimit;

    return (
      <div
        className={`flex gap-2 items-center justify-between w-auto m-4 p-2 font-bold border-2 rounded-lg backdrop-blur-lg ${
          isAtLimit
            ? 'text-red-600 border-red-600 bg-red-50'
            : 'text-primary border-primary'
        }`}
      >
        <p>
          {isAtLimit
            ? 'Monthly AI Recipe Limit Reached'
            : 'Monthly AI Recipes Remaining:'}
        </p>
        <p>
          {remaining}/{recipeLimit}
        </p>
      </div>
    );
  }

  // Free plan
  if (planType === 'free' && recipeLimit) {
    const remaining = Math.max(0, recipeLimit - count);
    const isAtLimit = count >= recipeLimit;

    return (
      <div
        className={`flex gap-2 items-center justify-between w-auto m-4 p-2 font-bold border-2 rounded-lg backdrop-blur-lg ${
          isAtLimit
            ? 'text-red-600 border-red-600 bg-red-50'
            : 'text-primary border-primary'
        }`}
      >
        <p>
          {isAtLimit
            ? 'Free AI Recipe Limit Reached'
            : 'Free AI Recipes Remaining:'}
        </p>
        <p>
          {remaining}/{recipeLimit}
        </p>
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return null;
}
