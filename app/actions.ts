'use server';

import { aiPrompt } from '@/libs/openai';
import { getPlanType, getRecipeLimit } from '@/libs/planUtils';
import { createClient } from '@/libs/supabase/server';
import { encodedRedirect } from '@/libs/utils';
import { Recipe } from '@/types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const defaultUrl = process.env.VERCEL_URL
  ? `https://ermajean.com`
  : 'http://localhost:3000';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const supabase = createClient();
  const origin = headers().get('origin');

  if (!email || !password) {
    return encodedRedirect(
      'error',
      '/sign-up',
      'Email and password are required'
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + ' ' + error.message);
    return encodedRedirect('error', '/sign-up', error.message);
  } else {
    return encodedRedirect(
      'success',
      '/sign-up',
      "Thanks for signing up! Please check your email for a verification link. Don't forget to check spam!"
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: 500, message: error.message };
  } else {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        return redirect('/recipes?refresh=true');
      }
    });
  }
};

export const googleAuth = async () => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${defaultUrl}/api/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const supabase = createClient();
  const origin = headers().get('origin');
  const callbackUrl = formData.get('callbackUrl')?.toString();

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?redirect_to=/recipes/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      'error',
      '/forgot-password',
      'Could not reset password'
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    'success',
    '/forgot-password',
    'Check your email for a link to reset your password.'
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      'error',
      '/recipes/reset-password',
      'Password and confirm password are required'
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      'error',
      '/recipes/reset-password',
      'Passwords do not match'
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      'error',
      '/recipes/reset-password',
      'Password update failed'
    );
  }

  encodedRedirect('success', '/recipes/reset-password', 'Password updated');
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/');
};

export const addNewRecipeAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const id = formData.get('id') as string;

  const recipe_name = formData.get('recipeName')?.toString();
  const description = formData.get('desc')?.toString();
  const prep_time = formData.get('prepTime')?.toString();
  const cook_time = formData.get('cookTime')?.toString();
  const total_time = formData.get('estTotalTime')?.toString();
  const servings = formData.get('servings')?.toString();
  const difficulty_level =
    formData.get('level[name]')?.toString() ||
    formData.get('level')?.toString();
  const course =
    formData.get('course[name]')?.toString() ||
    formData.get('course')?.toString();
  const ingredients = formData.get('ingredients')?.toString();
  const instructions = formData.get('instructions')?.toString();

  // Nutritional information
  const calories = formData.get('calories')
    ? Number(formData.get('calories'))
    : null;
  const protein = formData.get('protein')
    ? Number(formData.get('protein'))
    : null;
  const carbs = formData.get('carbs') ? Number(formData.get('carbs')) : null;
  const fat = formData.get('fat') ? Number(formData.get('fat')) : null;
  const fiber = formData.get('fiber') ? Number(formData.get('fiber')) : null;
  const sugar = formData.get('sugar') ? Number(formData.get('sugar')) : null;
  const sodium = formData.get('sodium') ? Number(formData.get('sodium')) : null;

  if (id) {
    const { data, error } = await supabase
      .from('recipes')
      .update({
        recipe_name,
        description,
        prep_time,
        cook_time,
        total_time,
        servings,
        difficulty_level,
        course,
        ingredients,
        instructions,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
      })
      .eq('id', id)
      .eq('user_id', userId);

    const { data: shared, error: err } = await supabase
      .from('share_recipes')
      .update({
        recipe_name,
        description,
        prep_time,
        cook_time,
        total_time,
        servings,
        difficulty_level,
        course,
        ingredients,
        instructions,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
      })
      .eq('recipe_id', id);

    if (error || err) {
      console.error(error.message || err);
      return encodedRedirect('error', '/recipes', 'Could not edit recipe');
    }

    return encodedRedirect(
      'success',
      '/recipes',
      'Recipe updated successfully'
    );
  } else {
    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          recipe_name,
          description,
          prep_time,
          cook_time,
          total_time,
          servings,
          difficulty_level,
          course,
          ingredients,
          instructions,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      console.error(error.message);
      return encodedRedirect('error', '/recipes', 'Could not add recipe');
    }
    return redirect('/recipes');
  }
};

export const addAIRecipeAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  // Get user's plan information
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_access, price_id')
    .eq('id', userId)
    .single();

  const planType = getPlanType(profile?.has_access || false, profile?.price_id);
  const recipeLimit = getRecipeLimit(planType);

  // Check limits based on user's plan
  if (planType === 'free' && recipeLimit) {
    const { count: freeCount } = await supabase
      .from('recipe_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'free');

    if (freeCount >= recipeLimit) {
      return encodedRedirect(
        'error',
        '/recipes',
        "You've reached your limit of 3 free AI recipes. Upgrade to Premium for unlimited AI recipes!"
      );
    }
  } else if (planType === 'monthly' && recipeLimit) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyCount } = await supabase
      .from('recipe_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'monthly')
      .gte('created_at', startOfMonth.toISOString());

    if (monthlyCount >= recipeLimit) {
      return encodedRedirect(
        'error',
        '/recipes',
        "You've reached your monthly limit of 8 AI recipes. Your limit will reset next month, or upgrade to unlimited for no limits!"
      );
    }
  }
  // Unlimited plans have no limits, so no check needed

  const taste = formData.get('taste')?.toString();
  const ingredients = formData.get('ingredients')?.toString();
  const serving = formData.get('serving')?.toString();
  const total_time = formData.get('totalTime')?.toString();
  const course = formData.get('course')?.toString();
  const restrictions = formData.get('restrictions')?.toString();
  const location = formData.get('location')?.toString();

  const aiData = await aiPrompt(
    taste,
    ingredients,
    serving,
    total_time,
    course,
    restrictions,
    location
  );

  const result = JSON.parse(aiData.choices[0].message.content!);
  console.log(result);
  const { data, error } = await supabase
    .from('recipes')
    .insert([
      {
        recipe_name: result.recipe_name,
        description: result.description,
        prep_time: result.prep_time,
        cook_time: result.cook_time,
        total_time: result.total_time,
        servings: result.servings,
        difficulty_level: result.difficulty_level,
        course: result.course,
        ingredients: result.ingredients.join('\n'),
        instructions: result.instructions.join('\n'),
        est_cost: result.estimated_cost_per_serving,
        est_savings: result.estimated_savings_per_serving,
        user_id: userId,
      },
    ])
    .select();

  // Determine source based on user's plan
  let source = 'free';
  if (planType === 'monthly') {
    source = 'monthly';
  } else if (planType === 'unlimited') {
    source = 'unlimited';
  }

  const { error: usageError } = await supabase.from('recipe_usage').insert([
    {
      user_id: userId,
      recipe_id: data[0].id,
      source: source,
    },
  ]);

  if (usageError) {
    console.error(usageError.message);
    return encodedRedirect('error', '/recipes', 'Could not add recipe usage');
  }

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not add recipe');
  }

  return redirect('/recipes');
};

// copy the recipe to the share_recipes table
export const shareRecipeAction = async (recipeId: string) => {
  const supabase = createClient();

  // check if the recipe exists in the share_recipes table
  const { data: recipeExists, error: recipeErr } = (await supabase
    .from('share_recipes')
    .select('*')
    .eq('recipe_id', recipeId)
    .single()) as { data: Recipe; error: any };

  const { data: singleRecipe, error: err } = (await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()) as { data: Recipe; error: any };

  if (recipeExists) {
    return encodedRedirect('success', '/recipes', 'Recipe shared successfully');
  } else {
    const { data, error } = await supabase.from('share_recipes').insert([
      {
        recipe_name: singleRecipe.recipe_name,
        description: singleRecipe.description,
        prep_time: singleRecipe.prep_time,
        cook_time: singleRecipe.cook_time,
        total_time: singleRecipe.total_time,
        servings: singleRecipe.servings,
        difficulty_level: singleRecipe.difficulty_level,
        course: singleRecipe.course,
        ingredients: singleRecipe.ingredients,
        instructions: singleRecipe.instructions,
        recipe_id: singleRecipe.id,
      },
    ]);

    if (error || err) {
      console.error(error?.message || err?.message);
      return encodedRedirect('error', '/recipes', 'Could not share recipe');
    }
    return encodedRedirect('success', '/recipes', 'Recipe shared successfully');
  }
};

// deletes a recipe from the recipes table
export const deleteRecipeAction = async (recipeId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not delete recipe');
  }

  return encodedRedirect('success', '/recipes', 'Recipe deleted successfully');
};

// adds name to the profiles table
export const addProfileNameAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const name = formData.get('name')?.toString();

  const { data, error } = await supabase
    .from('profiles')
    .update([{ name }])
    .eq('id', userId);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not add profile name');
  }

  return encodedRedirect(
    'success',
    '/recipes',
    'Profile name added successfully'
  );
};

export const updateProfileAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const name = formData.get('name')?.toString();
  const location = formData.get('location')?.toString();
  // const email = formData.get('email')?.toString();

  // const { data: userEmail, error: userError } = await supabase.auth.updateUser({
  //   email,
  // });

  // if (userError) {
  //   console.error(userError.message);
  //   return encodedRedirect('error', '/recipes', 'Could not update email');
  // }

  const { error } = await supabase
    .from('profiles')
    .update({ name, location })
    .eq('id', userId);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not update profile');
  }

  return encodedRedirect('success', '/recipes', 'Profile updated successfully');
};

export const updateMacroGoalsAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const calorie_goal = formData.get('calorieGoal')
    ? Number(formData.get('calorieGoal'))
    : 2000;
  const protein_goal = formData.get('proteinGoal')
    ? Number(formData.get('proteinGoal'))
    : 150;
  const carb_goal = formData.get('carbGoal')
    ? Number(formData.get('carbGoal'))
    : 250;
  const fat_goal = formData.get('fatGoal')
    ? Number(formData.get('fatGoal'))
    : 65;

  const { error } = await supabase
    .from('profiles')
    .update({
      calorie_goal,
      protein_goal,
      carb_goal,
      fat_goal,
    })
    .eq('id', userId);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not update macro goals');
  }

  return encodedRedirect(
    'success',
    '/recipes',
    'Macro goals updated successfully'
  );
};

// Non-redirecting version for modal usage
export const updateMacroGoalsModalAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const calorie_goal = formData.get('calorieGoal')
    ? Number(formData.get('calorieGoal'))
    : 2000;
  const protein_goal = formData.get('proteinGoal')
    ? Number(formData.get('proteinGoal'))
    : 150;
  const carb_goal = formData.get('carbGoal')
    ? Number(formData.get('carbGoal'))
    : 250;
  const fat_goal = formData.get('fatGoal')
    ? Number(formData.get('fatGoal'))
    : 65;

  const { error } = await supabase
    .from('profiles')
    .update({
      calorie_goal,
      protein_goal,
      carb_goal,
      fat_goal,
    })
    .eq('id', userId);

  if (error) {
    console.error(error.message);
    return { success: false, message: 'Could not update macro goals' };
  }

  return { success: true, message: 'Macro goals updated successfully' };
};

// delete a user
export const deleteUserAction = async () => {
  const supabase = createClient();

  await supabase.rpc('delete_user');

  supabase.auth.signOut();

  return redirect('/');
};

// Meal Plan Actions
export const addMealToPlanAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const recipeId = formData.get('recipeId')?.toString();
  const date = formData.get('date')?.toString();
  const mealType = formData.get('mealType')?.toString();

  if (!recipeId || !date || !mealType) {
    return encodedRedirect('error', '/meal-plans', 'Missing required fields');
  }

  // Check if meal already exists for this slot
  const { data: existingMeal } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('meal_type', mealType)
    .single();

  if (existingMeal) {
    // Update existing meal
    const { error } = await supabase
      .from('meal_plans')
      .update({ recipe_id: recipeId })
      .eq('user_id', userId)
      .eq('date', date)
      .eq('meal_type', mealType);

    if (error) {
      console.error(error.message);
      return encodedRedirect(
        'error',
        '/meal-plans',
        'Could not update meal plan'
      );
    }
  } else {
    // Insert new meal
    const { error } = await supabase.from('meal_plans').insert([
      {
        user_id: userId,
        recipe_id: recipeId,
        date,
        meal_type: mealType,
      },
    ]);

    if (error) {
      console.error(error.message);
      return encodedRedirect(
        'error',
        '/meal-plans',
        'Could not add meal to plan'
      );
    }
  }

  return encodedRedirect(
    'success',
    '/meal-plans',
    'Meal added to plan successfully'
  );
};

export const removeMealFromPlanAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const date = formData.get('date')?.toString();
  const mealType = formData.get('mealType')?.toString();

  if (!date || !mealType) {
    return encodedRedirect('error', '/meal-plans', 'Missing required fields');
  }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)
    .eq('meal_type', mealType);

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      'error',
      '/meal-plans',
      'Could not remove meal from plan'
    );
  }

  return encodedRedirect(
    'success',
    '/meal-plans',
    'Meal removed from plan successfully'
  );
};

export const clearWeekMealPlanAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const weekStart = formData.get('weekStart')?.toString();
  const weekEnd = formData.get('weekEnd')?.toString();

  if (!weekStart || !weekEnd) {
    return encodedRedirect('error', '/meal-plans', 'Missing week dates');
  }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', userId)
    .gte('date', weekStart)
    .lte('date', weekEnd);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/meal-plans', 'Could not clear week');
  }

  return encodedRedirect('success', '/meal-plans', 'Week cleared successfully');
};

// Non-redirecting versions for modal usage
export const addNewRecipeModalAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const id = formData.get('id') as string;

  const recipe_name = formData.get('recipeName')?.toString();
  const description = formData.get('desc')?.toString();
  const prep_time = formData.get('prepTime')?.toString();
  const cook_time = formData.get('cookTime')?.toString();
  const total_time = formData.get('estTotalTime')?.toString();
  const servings = formData.get('servings')?.toString();
  const difficulty_level =
    formData.get('level[name]')?.toString() ||
    formData.get('level')?.toString();
  const course =
    formData.get('course[name]')?.toString() ||
    formData.get('course')?.toString();
  const ingredients = formData.get('ingredients')?.toString();
  const instructions = formData.get('instructions')?.toString();

  // Nutritional information
  const calories = formData.get('calories')
    ? Number(formData.get('calories'))
    : null;
  const protein = formData.get('protein')
    ? Number(formData.get('protein'))
    : null;
  const carbs = formData.get('carbs') ? Number(formData.get('carbs')) : null;
  const fat = formData.get('fat') ? Number(formData.get('fat')) : null;
  const fiber = formData.get('fiber') ? Number(formData.get('fiber')) : null;
  const sugar = formData.get('sugar') ? Number(formData.get('sugar')) : null;
  const sodium = formData.get('sodium') ? Number(formData.get('sodium')) : null;

  if (id) {
    const { data, error } = await supabase
      .from('recipes')
      .update({
        recipe_name,
        description,
        prep_time,
        cook_time,
        total_time,
        servings,
        difficulty_level,
        course,
        ingredients,
        instructions,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
      })
      .eq('id', id)
      .eq('user_id', userId);

    const { data: shared, error: err } = await supabase
      .from('share_recipes')
      .update({
        recipe_name,
        description,
        prep_time,
        cook_time,
        total_time,
        servings,
        difficulty_level,
        course,
        ingredients,
        instructions,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
      })
      .eq('recipe_id', id);

    if (error || err) {
      console.error(error?.message || err?.message);
      return { success: false, message: 'Could not edit recipe' };
    }

    return { success: true, message: 'Recipe updated successfully' };
  } else {
    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          recipe_name,
          description,
          prep_time,
          cook_time,
          total_time,
          servings,
          difficulty_level,
          course,
          ingredients,
          instructions,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      console.error(error.message);
      return { success: false, message: 'Could not add recipe' };
    }
    return { success: true, message: 'Recipe created successfully', data };
  }
};

export const addAIRecipeModalAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  // Get user's plan information
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_access, price_id')
    .eq('id', userId)
    .single();

  const planType = getPlanType(profile?.has_access || false, profile?.price_id);
  const recipeLimit = getRecipeLimit(planType);

  // Check limits based on user's plan
  if (planType === 'free' && recipeLimit) {
    const { count: freeCount } = await supabase
      .from('recipe_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'free');

    if (freeCount >= recipeLimit) {
      return {
        success: false,
        message:
          "You've reached your limit of 3 free AI recipes. Upgrade to Premium for unlimited AI recipes!",
      };
    }
  } else if (planType === 'monthly' && recipeLimit) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyCount } = await supabase
      .from('recipe_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'monthly')
      .gte('created_at', startOfMonth.toISOString());

    if (monthlyCount >= recipeLimit) {
      return {
        success: false,
        message:
          "You've reached your monthly limit of 8 AI recipes. Your limit will reset next month, or upgrade to unlimited for no limits!",
      };
    }
  }
  // Unlimited plans have no limits, so no check needed

  const taste = formData.get('taste')?.toString();
  const ingredients = formData.get('ingredients')?.toString();
  const serving = formData.get('serving')?.toString();
  const total_time = formData.get('totalTime')?.toString();
  const course = formData.get('course')?.toString();
  const restrictions = formData.get('restrictions')?.toString();
  const location = formData.get('location')?.toString();

  try {
    const aiData = await aiPrompt(
      taste,
      ingredients,
      serving,
      total_time,
      course,
      restrictions,
      location
    );

    const result = JSON.parse(aiData.choices[0].message.content!);
    console.log(result);

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          recipe_name: result.recipe_name,
          description: result.description,
          prep_time: result.prep_time,
          cook_time: result.cook_time,
          total_time: result.total_time,
          servings: result.servings,
          difficulty_level: result.difficulty_level,
          course: result.course,
          ingredients: result.ingredients.join('\n'),
          instructions: result.instructions.join('\n'),
          est_cost: result.estimated_cost_per_serving,
          est_savings: result.estimated_savings_per_serving,
          user_id: userId,
        },
      ])
      .select();

    // Determine source based on user's plan
    let source = 'free';
    if (planType === 'monthly') {
      source = 'monthly';
    } else if (planType === 'unlimited') {
      source = 'unlimited';
    }

    const { error: usageError } = await supabase.from('recipe_usage').insert([
      {
        user_id: userId,
        recipe_id: data[0].id,
        source: source,
      },
    ]);

    if (usageError) {
      console.error(usageError.message);
      return { success: false, message: 'Could not add recipe usage' };
    }

    if (error) {
      console.error(error.message);
      return { success: false, message: 'Could not add recipe' };
    }

    return { success: true, message: 'AI recipe generated successfully', data };
  } catch (error) {
    console.error('AI recipe generation failed:', error);
    return { success: false, message: 'Failed to generate AI recipe' };
  }
};
