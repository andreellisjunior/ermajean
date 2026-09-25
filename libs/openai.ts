import OpenAI from "openai";
let client: OpenAI | undefined;
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("AI service is not configured");
  return (client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 45000,
    maxRetries: 0,
  }));
}
