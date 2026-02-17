import { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } from '../../services/recipeService';
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

const mockRecipe = {
  id: 'recipe-1',
  user_id: 'user-123',
  recipe_name: 'Test Recipe',
  description: 'A test recipe',
  prep_time: '10 min',
  cook_time: '20 min',
  total_time: '30 min',
  servings: '4',
  difficulty_level: 'Easy',
  course: 'Dinner',
  ingredients: 'ingredient 1\ningredient 2',
  instructions: 'step 1\nstep 2',
  calories: 500,
  protein: 30,
  carbs: 50,
  fat: 20,
  is_kid_friendly: true,
};

function mockSupabaseChain(data: any, error: any = null) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
  };
  // For queries that end with order() instead of single()
  chain.order.mockResolvedValue({ data, error });
  (supabase.from as jest.Mock).mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser },
  });
});

describe('recipeService', () => {
  describe('getRecipes', () => {
    it('returns recipes for authenticated user', async () => {
      mockSupabaseChain([mockRecipe]);

      const result = await getRecipes();

      expect(result).toEqual([mockRecipe]);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(getRecipes()).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      mockSupabaseChain(null, { message: 'Database error' });

      await expect(getRecipes()).rejects.toThrow('Failed to fetch recipes');
    });

    it('returns empty array when no recipes exist', async () => {
      mockSupabaseChain(null);

      const result = await getRecipes();

      expect(result).toEqual([]);
    });
  });

  describe('getRecipeById', () => {
    it('returns a single recipe', async () => {
      mockSupabaseChain(mockRecipe);

      const result = await getRecipeById('recipe-1');

      expect(result).toEqual(mockRecipe);
    });

    it('returns null when recipe not found', async () => {
      mockSupabaseChain(null, { code: 'PGRST116', message: 'not found' });

      const result = await getRecipeById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(getRecipeById('recipe-1')).rejects.toThrow('User not authenticated');
    });
  });

  describe('createRecipe', () => {
    it('creates and returns a new recipe', async () => {
      mockSupabaseChain(mockRecipe);

      const input = {
        recipe_name: 'Test Recipe',
        description: 'A test recipe',
        prep_time: '10 min',
        cook_time: '20 min',
        total_time: '30 min',
        servings: '4',
        difficulty_level: 'Easy',
        course: 'Dinner',
        ingredients: 'ingredient 1\ningredient 2',
        instructions: 'step 1\nstep 2',
        calories: 500,
        protein: 30,
        carbs: 50,
        fat: 20,
        is_kid_friendly: true,
      };

      const result = await createRecipe(input);

      expect(result).toEqual(mockRecipe);
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(createRecipe({} as any)).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      mockSupabaseChain(null, { message: 'Insert failed' });

      await expect(createRecipe({} as any)).rejects.toThrow('Failed to create recipe');
    });
  });

  describe('updateRecipe', () => {
    it('updates and returns the recipe', async () => {
      const updated = { ...mockRecipe, recipe_name: 'Updated Recipe' };
      mockSupabaseChain(updated);

      const result = await updateRecipe('recipe-1', { recipe_name: 'Updated Recipe' });

      expect(result).toEqual(updated);
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(updateRecipe('recipe-1', {})).rejects.toThrow('User not authenticated');
    });
  });

  describe('deleteRecipe', () => {
    it('deletes without error', async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) => resolve({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(deleteRecipe('recipe-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('recipes');
    });

    it('throws when user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(deleteRecipe('recipe-1')).rejects.toThrow('User not authenticated');
    });

    it('throws on Supabase error', async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) => resolve({ error: { message: 'Delete failed' } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(deleteRecipe('recipe-1')).rejects.toThrow('Failed to delete recipe');
    });
  });
});
