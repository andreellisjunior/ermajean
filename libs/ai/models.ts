/** Reviewed against OpenAI's current model guide on 2026-09-24. */
export function modelSettings(workload: "recipe" | "nutrition") {
  const model = (workload === "recipe"
    ? process.env.OPENAI_RECIPE_MODEL
    : process.env.OPENAI_NUTRITION_MODEL) || "gpt-6-luna";
  return {
    model,
    // Keep documented older-model overrides usable for controlled comparisons.
    ...(/^gpt-[56](?:-|$)/.test(model)
      ? { reasoning_effort: "low" as const }
      : {}),
  };
}
