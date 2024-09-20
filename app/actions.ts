'use server';

import { encodedRedirect } from '@/utils/utils';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const supabase = createClient();
  const origin = headers().get('origin');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + ' ' + error.message);
    return encodedRedirect('error', '/sign-up', error.message);
  } else {
    return encodedRedirect(
      'success',
      '/sign-up',
      'Thanks for signing up! Please check your email for a verification link.'
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
    return encodedRedirect('error', '/', error.message);
  }

  return redirect('/recipes');
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
    redirectTo: `${origin}/auth/callback?redirect_to=/recipes/reset-password`,
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

  const recipe_name = formData.get('recipeName')?.toString();
  const description = formData.get('desc')?.toString();
  const prep_time = formData.get('prepTime')?.toString();
  const cook_time = formData.get('cookTime')?.toString();
  const total_time = formData.get('estTotalTime')?.toString();
  const servings = formData.get('servings')?.toString();
  const difficulty_level = formData.get('level[name]')?.toString();
  const course = formData.get('course[name]')?.toString();
  const ingredients = formData.get('ingredients')?.toString();
  const instructions = formData.get('instructions')?.toString();

  console.log(formData);
  // Log the retrieved values
  console.log({
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
    user_id: userId,
  });

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
        user_id: userId,
      },
    ])
    .select();

  console.log(data);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not add recipe');
  }

  return encodedRedirect('success', '/recipes', 'Recipe added successfully');
};

// adds name to the profiles table
export const addProfileNameAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const name = formData.get('name')?.toString();

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ name, user_id: userId }])
    .select();

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
