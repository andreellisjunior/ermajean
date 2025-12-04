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
}
