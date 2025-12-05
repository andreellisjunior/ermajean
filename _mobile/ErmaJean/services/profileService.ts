/**
 * Profile Service
 * Handles profile and macro goal management operations
 * Requirements: 6.1, 6.3
 */

import { supabase } from '../libs/supabase';
import { Profile, MacroGoals } from '../types/config';

/**
 * Fetches the current user's profile
 * Requirements: 6.1
 * 
 * @returns Profile object with user data and macro goals
 */
export async function getProfile(): Promise<Profile> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('name, email, location, has_access, price_id, calorie_goal, protein_goal, carb_goal, fat_goal')
    .eq('id', user.user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Updates the current user's profile
 * Requirements: 6.1
 * 
 * @param profile - Partial profile data to update
 * @returns The updated Profile object
 */
export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const updateData: Record<string, any> = {};
  
  if (profile.name !== undefined) updateData.name = profile.name;
  if (profile.email !== undefined) updateData.email = profile.email;
  if (profile.location !== undefined) updateData.location = profile.location;
  if (profile.calorie_goal !== undefined) updateData.calorie_goal = profile.calorie_goal;
  if (profile.protein_goal !== undefined) updateData.protein_goal = profile.protein_goal;
  if (profile.carb_goal !== undefined) updateData.carb_goal = profile.carb_goal;
  if (profile.fat_goal !== undefined) updateData.fat_goal = profile.fat_goal;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.user.id)
    .select('name, email, location, has_access, price_id, calorie_goal, protein_goal, carb_goal, fat_goal')
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Updates the current user's macro goals
 * Requirements: 6.3
 * 
 * @param goals - MacroGoals object with calorie, protein, carb, and fat targets
 * @returns The updated Profile object
 */
export async function updateMacroGoals(goals: MacroGoals): Promise<Profile> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      calorie_goal: goals.calories,
      protein_goal: goals.protein,
      carb_goal: goals.carbs,
      fat_goal: goals.fat,
    })
    .eq('id', user.user.id)
    .select('name, email, location, has_access, price_id, calorie_goal, protein_goal, carb_goal, fat_goal')
    .single();

  if (error) {
    throw new Error(`Failed to update macro goals: ${error.message}`);
  }

  return data as Profile;
}

// Export all functions as a service object for convenience
export const ProfileService = {
  getProfile,
  updateProfile,
  updateMacroGoals,
};

export default ProfileService;
