import test from "node:test";
import assert from "node:assert/strict";
import { generationInput, normalizeRecipe } from "../libs/ai/schema";
const recipe = {
  recipe_name: "Skillet dinner",
  description: "A quick keeper.",
  prep_time: "5 min",
  cook_time: "15 min",
  total_time: "20 min",
  servings: "4",
  difficulty_level: "Easy",
  course: "Dinner",
  ingredients: ["1 cup rice", "2 eggs"],
  instructions: ["Cook the rice.", "Cook eggs fully and serve."],
  is_kid_friendly: false,
};
test("generation rejects oversized and unexpected input before provider spending", () => {
  for (const input of [
    { ingredients: "a".repeat(4001) },
    { user_id: "other" },
    { ingredients: ["rice"] },
    { is_kid_friendly: "true" },
  ])
    assert.equal(generationInput.safeParse(input).success, false);
  assert.equal(generationInput.parse({ ingredients: "rice" }).serving, "4");
});
test("canonical output is a single draft with newline text, no invented savings", () => {
  assert.deepEqual(normalizeRecipe(recipe, true), {
    ...recipe,
    ingredients: "1 cup rice\n2 eggs",
    instructions: "Cook the rice.\nCook eggs fully and serve.",
    is_kid_friendly: true,
  });
  assert.throws(() =>
    normalizeRecipe({ ...recipe, estimated_savings: "$20" }, false),
  );
  assert.throws(() => normalizeRecipe([recipe], false));
});
test("refusals, empty, oversized and invalid yield outputs cannot be stored", () => {
  for (const bad of [
    null,
    { ...recipe, servings: "0" },
    { ...recipe, servings: "101" },
    { ...recipe, ingredients: [] },
    { ...recipe, ingredients: [" "] },
    { ...recipe, recipe_name: "" },
    { ...recipe, instructions: ["x".repeat(25000)] },
  ])
    assert.throws(() => normalizeRecipe(bad, false));
});
