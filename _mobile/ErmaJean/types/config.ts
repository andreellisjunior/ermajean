export type Recipe = {
    id: string;
    recipe_name: string;
    total_time: string;
    description: string;
    prep_time: string;
    servings: string;
    cook_time: string;
    difficulty_level: string;
    course: string;
    ingredients: string;
    instructions: string;
    est_cost?: string;
    est_savings?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    is_kid_friendly?: boolean;
};

export interface Profile {
    name: string;
    email: string;
    location?: string;
    has_access: boolean;
    price_id?: string;
    calorie_goal?: number;
    protein_goal?: number;
    carb_goal?: number;
    fat_goal?: number;
    kid_friendly_preference?: boolean;
}

// Meal Planning Types (Requirements 3.1, 3.3)
export interface MealPlan {
    id: string;
    user_id: string;
    date: string;
    meal_type: 'Breakfast' | 'Lunch' | 'Dinner';
    recipe_id: string;
    created_at: string;
}

export interface MealSlot {
    date: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner';
    recipeId?: string;
    recipeName?: string;
}

// Macro Tracking Types (Requirements 3.6)
export interface DayMacros {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
}

export interface MacroGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

// Shopping List Types (Requirements 4.1)
export interface ShoppingListItem {
    id: string;
    ingredient: string;
    quantity: string;
    unit: string;
    category: string;
    checked: boolean;
}

// Recipe Input Types (Requirements 7.3, 7.4)
export interface RecipeInput {
    recipe_name: string;
    description: string;
    prep_time: string;
    cook_time: string;
    total_time: string;
    servings: string;
    difficulty_level: string;
    course: string;
    ingredients: string;
    instructions: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    is_kid_friendly?: boolean;
}
