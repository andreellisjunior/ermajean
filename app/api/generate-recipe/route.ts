import { NextRequest, NextResponse } from "next/server";
import { requireUser, readJson, apiError } from "@/libs/auth";
import { generateRecipe } from "@/libs/ai/generation";
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser(request);
    return NextResponse.json(
      await generateRecipe(
        user.id,
        await readJson(request),
        request.headers.get("Idempotency-Key"),
      ),
    );
  } catch (error) {
    return apiError(error);
  }
}

export const maxDuration = 60;
export const runtime = "nodejs";
