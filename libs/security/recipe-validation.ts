import { z } from "zod";
export const idSchema = z
  .union([
    z.string().regex(/^[1-9]\d{0,15}$/),
    z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  ])
  .transform(String)
  .refine((v) => Number.isSafeInteger(Number(v)), "Invalid identifier");
const short = z.string().trim().min(1).max(200);
const text = z.string().trim().min(1).max(20000);
export const nutritionSchema = z
  .object({
    calories: z.number().finite().min(0).max(20000),
    protein: z.number().finite().min(0).max(2000),
    carbs: z.number().finite().min(0).max(5000),
    fat: z.number().finite().min(0).max(2000),
    fiber: z.number().finite().min(0).max(2000),
    sugar: z.number().finite().min(0).max(5000),
    sodium: z.number().finite().min(0).max(100000),
  })
  .strict();
export const recipeSchema = z
  .object({
    recipe_name: short,
    description: z.string().trim().max(4000),
    prep_time: short,
    cook_time: short,
    total_time: short,
    servings: z
      .string()
      .trim()
      .regex(
        /^(?:[1-9]\d?|100)(?:\s+(?:servings?|people|persons?))?$/i,
        "Use a serving count from 1 to 100",
      ),
    difficulty_level: short,
    course: short,
    ingredients: text,
    instructions: text,
    est_cost: z.string().max(100).optional(),
    est_savings: z.string().max(100).optional(),
    is_kid_friendly: z.boolean().optional(),
    ...Object.fromEntries(
      Object.entries(nutritionSchema.shape).map(([key, schema]) => [
        key,
        schema.nullable().optional(),
      ]),
    ),
  })
  .strict();
export const recipeUpdateSchema = recipeSchema
  .partial()
  .extend({ id: idSchema })
  .strict()
  .refine((v) => Object.keys(v).length > 1, "Provide recipe changes");
export const noteSchema = z
  .object({
    recipeId: idSchema,
    title: z.string().trim().min(1).max(200),
    note: z.string().trim().min(1).max(10000),
    edit: z.boolean().optional(),
    id: idSchema.optional(),
  })
  .strict()
  .refine(
    (v) => !v.edit || v.id !== undefined,
    "Note identifier required to edit",
  );
export const macrosRequestSchema = z
  .object({
    recipeId: idSchema,
    servings: z
      .union([
        z.number(),
        z
          .string()
          .regex(/^\d+(?:\.\d+)?$/)
          .transform(Number),
      ])
      .pipe(z.number().finite().positive().max(100))
      .optional(),
  })
  .strict();
export function perServingNutrition(value: unknown) {
  const parsed = nutritionSchema.parse(value);
  return {
    ...parsed,
    calories: Math.round(parsed.calories),
    sodium: Math.round(parsed.sodium),
  };
}
