import { parseIngredient } from "../../utils/shoppingListUtils";
import { deriveShoppingItems } from "../../services/shoppingService";
jest.mock("../../libs/supabase", () => ({ supabase: {} }));
test.each([
  ["2 cups flour", 2, "cup", "flour"],
  ["1 1/2 tbsp olive oil", 1.5, "tbsp", "olive oil"],
  ["1½ cups rice", 1.5, "cup", "rice"],
  ["¼ tsp salt", 0.25, "tsp", "salt"],
  ["3 chicken breasts", 3, "", "chicken breasts"],
])("parses %s without swallowing ingredient name", (text, q, u, name) => {
  expect(parseIngredient(String(text))).toMatchObject({
    quantity: q,
    unit: u,
    name,
    quantityKnown: true,
  });
});
test.each(["salt to taste", "1-2 onions", "1/0 cups flour"])(
  "preserves ambiguous quantity %s",
  (text) =>
    expect(parseIngredient(text)).toMatchObject({
      name: text,
      quantityKnown: false,
    }),
);
test("shopping identity changes when recipe content changes", () => {
  const recipe: any = {
    id: "12",
    ingredients: "2 cups flour",
    content_version: 1,
  };
  const meals: any = [{ id: "m", recipeId: "12" }];
  const first = deriveShoppingItems(meals, new Map([["12", recipe]]));
  recipe.content_version = 2;
  expect(deriveShoppingItems(meals, new Map([["12", recipe]]))[0].id).not.toBe(
    first[0].id,
  );
});
