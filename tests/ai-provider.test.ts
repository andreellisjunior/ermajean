import test from "node:test";
import assert from "node:assert/strict";
import OpenAI from "openai";
import { estimateNutrition } from "../libs/ai/nutrition";
const recipe = { recipe_name: "Rice", ingredients: "1 cup rice", instructions: "Cook rice", servings: "4" };
const values = { calories: 200, protein: 4, carbs: 40, fat: 2, fiber: 1, sugar: 0, sodium: 100 };
function client(content: unknown, finish_reason = "stop", refusal: string | null = null, inspect?: (body: any) => void) {
  return new OpenAI({ apiKey: "test-only", maxRetries: 0, fetch: async (_url, init) => {
    inspect?.(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: "test", object: "chat.completion", created: 0, model: "gpt-6-luna", choices: [{ index: 0, finish_reason, message: { role: "assistant", content: JSON.stringify(content), refusal } }] }), { headers: { "Content-Type": "application/json" } });
  } });
}
test("nutrition uses strict structured output with a reasoning-compatible request and preserves per-serving values", async () => {
  const result = await estimateNutrition(client(values, "stop", null, body => {
    assert.equal(body.response_format.type, "json_schema");
    assert.equal(body.response_format.json_schema.strict, true);
    assert.equal(body.response_format.json_schema.schema.additionalProperties, false);
    assert.ok(body.max_completion_tokens > 350);
    assert.equal(body.max_tokens, undefined);
    assert.equal(body.temperature, undefined);
    assert.equal(JSON.parse(body.messages[1].content).yield, "4");
  }), recipe);
  assert.deepEqual(result, values);
});
test("nutrition rejects refusal, truncation, missing fields, extra fields and invalid numbers before persistence", async () => {
  for (const ai of [client(values, "stop", "Cannot comply"), client(values, "length"), client({ calories: 200 }), client({ ...values, fat: -1 }), client({ ...values, sodium: 100001 }), client({ ...values, invented: 5 })]) {
    await assert.rejects(estimateNutrition(ai, recipe));
  }
});
