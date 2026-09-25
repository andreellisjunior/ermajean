import test from "node:test";
import assert from "node:assert/strict";
import {
  bearerToken,
  boundedJson,
  verifiedIdentity,
} from "../libs/security/auth-core";
import { ApiError } from "../libs/security/errors";
import {
  recipeSchema,
  recipeUpdateSchema,
  noteSchema,
  idSchema,
  nutritionSchema,
  perServingNutrition,
  macrosRequestSchema,
} from "../libs/security/recipe-validation";
import { ownedRecipe, saveRecipe } from "../libs/recipe-service";
const sample = {
  recipe_name: "Dinner",
  description: "Good food",
  prep_time: "10 min",
  cook_time: "20 min",
  total_time: "30 min",
  servings: "4",
  difficulty_level: "Easy",
  course: "Dinner",
  ingredients: "1 cup rice",
  instructions: "Cook rice.",
};
test("explicit malformed credentials never downgrade to cookie authentication", () => {
  for (const value of ["Basic abc", "Bearer", "Bearer a b", "Bearer abc\tdef"])
    assert.throws(
      () =>
        bearerToken(
          new Request("https://test.local", {
            headers: { authorization: value },
          }),
        ),
      ApiError,
    );
  assert.equal(bearerToken(new Request("https://test.local")), undefined);
  assert.equal(
    bearerToken(
      new Request("https://test.local", {
        headers: { authorization: "Bearer a.b.c" },
      }),
    ),
    "a.b.c",
  );
});
test("identity verification rejects expired or missing users", async () => {
  await assert.rejects(
    () =>
      verifiedIdentity("expired", async () => ({
        data: { user: null },
        error: { message: "expired" },
      })),
    (e: ApiError) => e.status === 401,
  );
  assert.deepEqual(
    await verifiedIdentity("valid", async (token) => ({
      data: { user: { id: token } },
      error: null,
    })),
    { id: "valid" },
  );
});
test("body limit checks actual streamed bytes without trusting content length", async () => {
  await assert.rejects(
    () =>
      boundedJson(
        new Request("https://test.local", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-length": "1",
          },
          body: JSON.stringify({ large: "x".repeat(100) }),
        }),
        20,
      ),
    (e: ApiError) => e.status === 413,
  );
  await assert.rejects(
    () =>
      boundedJson(
        new Request("https://test.local", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        }),
      ),
    (e: ApiError) => e.status === 400,
  );
  await assert.rejects(
    () =>
      boundedJson(
        new Request("https://test.local", { method: "POST", body: "{}" }),
      ),
    (e: ApiError) => e.status === 415,
  );
});
test("recipe payload cannot write ownership, ids, billing or content version", () => {
  assert.equal(recipeSchema.parse(sample).servings, "4");
  for (const field of ["user_id", "id", "has_access", "content_version"])
    assert.equal(
      recipeSchema.safeParse({ ...sample, [field]: "malicious" }).success,
      false,
    );
  assert.equal(
    recipeUpdateSchema.safeParse({ id: "1", user_id: "other" }).success,
    false,
  );
  for (const servings of ["0", "-1", "NaN", "Infinity", "400", "four", "4.5"])
    assert.equal(
      recipeSchema.safeParse({ ...sample, servings }).success,
      false,
    );
});
test("IDs and note edits reject coercion traps and missing identifiers", () => {
  for (const id of [
    null,
    "",
    "0",
    "-1",
    "1e3",
    "1.5",
    "9007199254740992",
    {},
    [],
  ])
    assert.equal(idSchema.safeParse(id).success, false);
  assert.equal(
    noteSchema.safeParse({ recipeId: "1", title: "x", note: "y", edit: true })
      .success,
    false,
  );
  assert.equal(
    noteSchema.safeParse({
      recipeId: "1",
      title: "x",
      note: "y",
      user_id: "other",
    }).success,
    false,
  );
});
test("per-serving estimates do not scale with recipe yield or caller portions", () => {
  const n = {
    calories: 400,
    protein: 30,
    carbs: 45,
    fat: 12,
    fiber: 4,
    sugar: 2,
    sodium: 550,
  };
  for (const servings of [1, 2, 4, 8]) {
    macrosRequestSchema.parse({ recipeId: "1", servings });
    assert.deepEqual(perServingNutrition(n), n);
  }
  for (const bad of [NaN, Infinity, -1])
    assert.equal(
      nutritionSchema.safeParse({ ...n, protein: bad }).success,
      false,
    );
  assert.equal(
    nutritionSchema.safeParse({ ...n, calories: null }).success,
    false,
  );
  assert.equal(nutritionSchema.safeParse({ ...n, calories: 0 }).success, true);
});
test("private recipe reads and updates always filter both id and user", async () => {
  const calls: unknown[] = [];
  const chain: any = {
    select: () => chain,
    update: (x: unknown) => {
      calls.push(["update", x]);
      return chain;
    },
    eq: (...args: unknown[]) => {
      calls.push(args);
      return chain;
    },
    maybeSingle: async () => ({
      data: null as unknown,
      error: null as unknown,
    }),
  };
  const db: any = { from: () => chain };
  await assert.rejects(
    () => ownedRecipe(db, "user-a", "9"),
    (e: ApiError) => e.status === 404,
  );
  assert.deepEqual(calls, [
    ["id", "9"],
    ["user_id", "user-a"],
  ]);
  calls.length = 0;
  await assert.rejects(
    () => saveRecipe(db, "user-a", { description: "updated" }, "9"),
    (e: ApiError) => e.status === 404,
  );
  assert.deepEqual(calls.slice(1), [
    ["id", "9"],
    ["user_id", "user-a"],
  ]);
});
