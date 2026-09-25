import { supabase } from "@/libs/supabase";
import { MealSlot, Recipe, ShoppingListItem } from "@/types/config";
import {
  categorizeIngredient,
  parseIngredient,
} from "@/utils/shoppingListUtils";

export function deriveShoppingItems(
  meals: MealSlot[],
  recipes: Map<string, Recipe>,
): ShoppingListItem[] {
  return meals.flatMap((meal) => {
    const recipe = recipes.get(meal.recipeId || "");
    if (!recipe || !meal.id) return [];
    return recipe.ingredients
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line, index) => {
        if (line.endsWith(":")) return [];
        const parsed = parseIngredient(line.replace(/^[-*•]\s*/, ""));
        return [
          {
            id: `meal:${meal.id}:recipe:${recipe.id}:v:${recipe.content_version ?? 1}:ingredient:${index}`,
            ingredient: parsed.name,
            quantity: parsed.quantityKnown ? String(parsed.quantity) : "",
            unit: parsed.unit,
            category: categorizeIngredient(parsed.name),
            checked: false,
          },
        ];
      });
  });
}
async function owner() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw Error("Please sign in to sync your list.");
  return data.user.id;
}
export async function loadShoppingItems(
  week: string,
  derived: ShoppingListItem[],
) {
  const user = await owner();
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("user_id", user)
    .eq("week_start", week);
  if (error) throw Error(`Could not sync your shopping list: ${error.message}`);
  const saved = data || [];
  return [
    ...derived.map((item) => ({
      ...item,
      checked: saved.find((row) => row.item_key === item.id)?.checked ?? false,
    })),
    ...saved
      .filter((row) => row.manual)
      .map((row) => ({
        id: row.item_key,
        ingredient: row.label,
        quantity: row.quantity || "",
        unit: row.unit || "",
        category: categorizeIngredient(row.label),
        checked: row.checked,
      })),
  ];
}
export async function saveShoppingItem(week: string, item: ShoppingListItem) {
  const user = await owner();
  const { error } = await supabase
    .from("shopping_items")
    .upsert(
      {
        user_id: user,
        week_start: week,
        item_key: item.id,
        label: item.ingredient,
        checked: item.checked,
        manual: item.id.startsWith("manual:"),
        quantity: item.quantity,
        unit: item.unit,
      },
      { onConflict: "user_id,week_start,item_key" },
    );
  if (error) throw Error(`Your change was not saved: ${error.message}`);
}
