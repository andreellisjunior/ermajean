import { getProfile, updateProfile, updateMacroGoals } from '../../services/profileService';
import { supabase } from '../../libs/supabase';

jest.mock('../../libs/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockProfile = {
  name: 'Test User',
  email: 'test@example.com',
  location: 'New York',
  has_access: false,
  price_id: null,
  calorie_goal: 2000,
  protein_goal: 150,
  carb_goal: 200,
  fat_goal: 65,
};

function mockSupabaseChain(data: any, error: any = null) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
  };
  (supabase.from as jest.Mock).mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser },
  });
});

describe('profileService', () => {
  describe('getProfile', () => {
    it('returns the user profile', async () => {
      mockSupabaseChain(mockProfile);

      const result = await getProfile();

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(getProfile()).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      mockSupabaseChain(null, { message: 'Profile not found' });

      await expect(getProfile()).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('updateProfile', () => {
    it('updates and returns the profile', async () => {
      const updated = { ...mockProfile, name: 'Updated Name' };
      mockSupabaseChain(updated);

      const result = await updateProfile({ name: 'Updated Name' });

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(updateProfile({ name: 'Test' })).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      mockSupabaseChain(null, { message: 'Update failed' });

      await expect(updateProfile({ name: 'Test' })).rejects.toThrow('Failed to update profile');
    });
  });

  describe('updateMacroGoals', () => {
    it('updates macro goals and returns the profile', async () => {
      const updated = { ...mockProfile, calorie_goal: 2500, protein_goal: 180 };
      mockSupabaseChain(updated);

      const goals = { calories: 2500, protein: 180, carbs: 200, fat: 65 };
      const result = await updateMacroGoals(goals);

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const goals = { calories: 2000, protein: 150, carbs: 200, fat: 65 };
      await expect(updateMacroGoals(goals)).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      mockSupabaseChain(null, { message: 'Update failed' });

      const goals = { calories: 2000, protein: 150, carbs: 200, fat: 65 };
      await expect(updateMacroGoals(goals)).rejects.toThrow('Failed to update macro goals');
    });
  });
});
