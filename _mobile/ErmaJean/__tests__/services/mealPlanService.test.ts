import { getMealPlans, addMealToPlan, removeMealFromPlan, clearWeekMealPlan } from '../../services/mealPlanService';
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

const mockMealPlanData = [
  {
    id: 'mp-1',
    date: '2026-02-16',
    meal_type: 'Breakfast',
    recipe_id: 'recipe-1',
    recipes: { recipe_name: 'Scrambled Eggs' },
  },
  {
    id: 'mp-2',
    date: '2026-02-16',
    meal_type: 'Lunch',
    recipe_id: 'recipe-2',
    recipes: { recipe_name: 'Chicken Salad' },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser },
  });
});

describe('mealPlanService', () => {
  describe('getMealPlans', () => {
    it('returns meal slots for the given week', async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMealPlanData, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const weekStart = new Date('2026-02-16');
      const weekEnd = new Date('2026-02-22');

      const result = await getMealPlans(weekStart, weekEnd);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2026-02-16',
        mealType: 'Breakfast',
        recipeId: 'recipe-1',
        recipeName: 'Scrambled Eggs',
      });
      expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(getMealPlans(new Date(), new Date())).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Query failed' } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(getMealPlans(new Date(), new Date())).rejects.toThrow('Failed to fetch meal plans');
    });

    it('returns empty array when no meals planned', async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getMealPlans(new Date(), new Date());

      expect(result).toEqual([]);
    });
  });

  describe('addMealToPlan', () => {
    it('inserts a meal after removing existing slot', async () => {
      // Mock for removeMealFromPlan (called internally)
      // removeMealFromPlan chains: .delete().eq().eq().eq() (3 eq calls)
      const deleteChain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) => resolve({ error: null }),
      };

      // Mock for insert
      const insertChain: any = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        // First call is for delete (removeMealFromPlan), second is for insert
        if (callCount <= 1) return deleteChain;
        return insertChain;
      });

      await expect(addMealToPlan('2026-02-16', 'Breakfast', 'recipe-1')).resolves.toBeUndefined();
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(addMealToPlan('2026-02-16', 'Breakfast', 'recipe-1')).rejects.toThrow('User not authenticated');
    });
  });

  describe('removeMealFromPlan', () => {
    it('deletes the meal slot', async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) => resolve({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(removeMealFromPlan('2026-02-16', 'Breakfast')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(removeMealFromPlan('2026-02-16', 'Breakfast')).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) => resolve({ error: { message: 'Delete failed' } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(removeMealFromPlan('2026-02-16', 'Breakfast')).rejects.toThrow('Failed to remove meal from plan');
    });
  });

  describe('clearWeekMealPlan', () => {
    it('clears all meals in the week range', async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(clearWeekMealPlan(new Date('2026-02-16'), new Date('2026-02-22'))).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(clearWeekMealPlan(new Date(), new Date())).rejects.toThrow('User not authenticated');
    });
  });
});
