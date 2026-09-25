import {
  getMealPlans,
  addMealToPlan,
  removeMealFromPlan,
  clearWeekMealPlan,
} from "../../services/mealPlanService";
import { supabase } from "../../libs/supabase";

jest.mock("../../libs/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockUser = { id: "user-123", email: "test@example.com" };

const mockMealPlanData = [
  {
    id: "mp-1",
    date: "2026-02-16",
    meal_type: "Breakfast",
    recipe_id: "recipe-1",
    recipes: { recipe_name: "Scrambled Eggs" },
  },
  {
    id: "mp-2",
    date: "2026-02-16",
    meal_type: "Lunch",
    recipe_id: "recipe-2",
    recipes: { recipe_name: "Chicken Salad" },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser },
  });
});

describe("mealPlanService", () => {
  describe("getMealPlans", () => {
    it("returns meal slots for the given week", async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: mockMealPlanData, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const weekStart = new Date("2026-02-16");
      const weekEnd = new Date("2026-02-22");

      const result = await getMealPlans(weekStart, weekEnd);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "mp-1",
        date: "2026-02-16",
        mealType: "Breakfast",
        recipeId: "recipe-1",
        recipeName: "Scrambled Eggs",
      });
      expect(supabase.from).toHaveBeenCalledWith("meal_plans");
    });

    it("throws when user is not authenticated", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(getMealPlans(new Date(), new Date())).rejects.toThrow(
        "User not authenticated",
      );
    });

    it("throws on Supabase error", async () => {
      const chain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: "Query failed" },
          }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(getMealPlans(new Date(), new Date())).rejects.toThrow(
        "Failed to fetch meal plans",
      );
    });

    it("returns empty array when no meals planned", async () => {
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

  describe("addMealToPlan", () => {
    it("replaces a slot atomically without a client-side delete", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
      await addMealToPlan("2026-02-16", "Breakfast", "12");
      expect(supabase.rpc).toHaveBeenCalledWith("replace_meal_plan", {
        p_date: "2026-02-16",
        p_meal_type: "Breakfast",
        p_recipe_id: "12",
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });
    it("surfaces failed replacement without deleting the original meal", async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        error: { message: "Recipe unavailable" },
      });
      await expect(
        addMealToPlan("2026-02-16", "Breakfast", "12"),
      ).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("throws when user is not authenticated", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(
        addMealToPlan("2026-02-16", "Breakfast", "recipe-1"),
      ).rejects.toThrow("User not authenticated");
    });
  });

  describe("removeMealFromPlan", () => {
    it("deletes the meal slot", async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) => resolve({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(
        removeMealFromPlan("2026-02-16", "Breakfast"),
      ).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith("meal_plans");
    });

    it("throws when user is not authenticated", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(
        removeMealFromPlan("2026-02-16", "Breakfast"),
      ).rejects.toThrow("User not authenticated");
    });

    it("throws on Supabase error", async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: Function) =>
          resolve({ error: { message: "Delete failed" } }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(
        removeMealFromPlan("2026-02-16", "Breakfast"),
      ).rejects.toThrow("Failed to remove meal from plan");
    });
  });

  describe("clearWeekMealPlan", () => {
    it("clears all meals in the week range", async () => {
      const chain: any = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(
        clearWeekMealPlan(new Date("2026-02-16"), new Date("2026-02-22")),
      ).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith("meal_plans");
    });

    it("throws when user is not authenticated", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(clearWeekMealPlan(new Date(), new Date())).rejects.toThrow(
        "User not authenticated",
      );
    });
  });
});
