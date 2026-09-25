import { createHash } from "node:crypto";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { createClient } from "@supabase/supabase-js";
import { getOpenAI } from "../openai";
import { modelSettings } from "./models";
import { ApiError } from "../security/errors";
import {
  generationInput,
  recipeOutput,
  recipePrompt,
  normalizeRecipe,
} from "./schema";
export async function generateRecipe(
  userId: string,
  input: unknown,
  key: unknown,
) {
  const requestId = z.string().uuid().parse(key),
    preferences = generationInput.parse(input);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret)
    throw new ApiError(503, "Recipe generation is not configured");
  const db = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const hash = createHash("sha256")
    .update(JSON.stringify(preferences))
    .digest("hex");
  const { data: reservation, error } = await db.rpc("reserve_generation", {
    p_user: userId,
    p_key: requestId,
    p_hash: hash,
  });
  if (error)
    throw new ApiError(503, "Recipe generation is temporarily unavailable");
  if (reservation.status === "succeeded")
    return { recipe: reservation.output, requestId };
  if (reservation.status === "failed")
    throw new ApiError(
      502,
      "This attempt did not complete. Start a new request.",
    );
  if (reservation.status !== "reserved")
    throw new ApiError(
      reservation.status === "conflict" ? 409 : 429,
      reservation.status === "conflict"
        ? "This request is already in progress or has different preferences"
        : "Recipe limit reached. Please try later or review your plan.",
    );
  try {
    const result = await getOpenAI().chat.completions.parse({
      ...modelSettings("recipe"),
      messages: [
        { role: "system", content: recipePrompt },
        { role: "user", content: JSON.stringify(preferences) },
      ],
      response_format: zodResponseFormat(recipeOutput, "recipe"),
      max_completion_tokens: 6000,
    });
    const parsed = result.choices[0]?.message.parsed;
    if (!parsed || result.choices[0]?.finish_reason !== "stop")
      throw new Error("Incomplete recipe");
    const recipe = normalizeRecipe(parsed, preferences.is_kid_friendly);
    const { error: finish } = await db.rpc("complete_generation", {
      p_user: userId,
      p_key: requestId,
      p_output: recipe,
    });
    if (finish) throw new Error("Could not persist generation");
    return { recipe, requestId };
  } catch {
    await db.rpc("fail_generation", { p_user: userId, p_key: requestId });
    throw new ApiError(502, "Could not generate a recipe. Please try again.");
  }
}
