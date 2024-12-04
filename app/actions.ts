'use server';

import { encodedRedirect } from '../libs/utils';
import { createClient } from '../libs/supabase/server';
import { headers } from 'next/headers';
import { aiPrompt } from '../libs/openai';
import { Recipe } from '../types/config';
import { redirect } from 'next/navigation';

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

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      return redirect('/recipes?refresh=true');
    }
  });
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

export const addAIRecipeAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const taste = formData.get('taste')?.toString();
  const ingredients = formData.get('ingredients')?.toString();
  const serving = formData.get('serving')?.toString();
  const total_time = formData.get('totalTime')?.toString();
  const course = formData.get('course')?.toString();
  const restrictions = formData.get('restrictions')?.toString();

  const aiData = await aiPrompt(
    taste,
    ingredients,
    serving,
    total_time,
    course,
    restrictions
  );

  const result = JSON.parse(aiData.choices[0].message.content!);

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
        user_id: userId,
      },
    ])
    .select();

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not add recipe');
  }

  return encodedRedirect('success', '/recipes', 'Recipe added successfully');
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
    .update({ name })
    .eq('id', userId);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not update profile');
  }

  return encodedRedirect('success', '/recipes', 'Profile updated successfully');
};

// delete a user
export const deleteUserAction = async () => {
  const supabase = createClient();

  await supabase.rpc('delete_user');

  supabase.auth.signOut();

  return redirect('/');
};

export const addNewNoteAction = async (formData: FormData) => {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const recipe_id = formData.get('recipeId')?.toString();
  const title = formData.get('title')?.toString();
  const note = formData.get('note')?.toString();

  const { data, error } = await supabase.from('notes').insert([
    {
      user_id: userId,
      title,
      note,
      recipe_id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not add note');
  }

  return encodedRedirect('success', '/recipes', 'Note added successfully');
};

export const deleteNoteAction = async (noteId: number) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', '/recipes', 'Could not delete note');
  }

  return encodedRedirect('success', '/recipes', 'Note deleted successfully');
};
