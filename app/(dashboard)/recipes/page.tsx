import BottomNavigation from '@/components/BottomNavigation';
import { Message } from '@/components/ui/form-message';
import RecipeList from '@/components/ui/RecipeList';
import { getPlanType } from '@/libs/planUtils';
import { createClient } from '@/libs/supabase/server';
import { Recipe } from '@/types/config';
import { redirect } from 'next/navigation';

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Message & { session_id?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user but we have a session_id, redirect to auto-login
  if (!user && searchParams.session_id) {
    return redirect(
      `/auth/checkout-success?session_id=${searchParams.session_id}`
    );
  }

  if (!user) {
    return redirect('/');
  }

  const { data: recipes, error } = (await supabase
    .from('recipes')
    .select(
      'id,recipe_name,description,prep_time,cook_time,total_time,servings,difficulty_level,course,ingredients,instructions,est_cost,est_savings,calories,protein,carbs,fat,fiber,sugar,sodium'
    )
    .order('created_at', { ascending: false })) as {
    data: Recipe[];
    error: any;
  };
  const { data: profiles, error: profileError } = (await supabase
    .from('profiles')
    .select(
      'name, email, location, has_access, price_id, calorie_goal, protein_goal, carb_goal, fat_goal'
    )) as {
    data: {
      name: string;
      email: string;
      location?: string;
      has_access: boolean;
      price_id?: string;
      calorie_goal?: number;
      protein_goal?: number;
      carb_goal?: number;
      fat_goal?: number;
    }[];
    error: any;
  };

  // Determine user's plan and calculate appropriate count
  const userPlan = profiles?.[0];
  const planType = getPlanType(
    userPlan?.has_access || false,
    userPlan?.price_id
  );
  let count = 0;

  if (planType === 'free') {
    // Free plan: count all AI recipes (lifetime limit)
    const { count: freeCount } = await supabase
      .from('recipe_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('source', 'free');
    count = freeCount || 0;
  } else if (planType === 'monthly') {
    // Monthly plan: count AI recipes from current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyCount } = await supabase
      .from('recipe_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('source', 'monthly')
      .gte('created_at', startOfMonth.toISOString());
    count = monthlyCount || 0;
  } else {
    // Unlimited plan: count not needed, but set to 0 for consistency
    count = 0;
  }

  return (
    <>
      <RecipeList {...{ profiles, recipes, searchParams, count }} />
      <BottomNavigation profile={profiles} />
    </>
  );
}
