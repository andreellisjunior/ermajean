import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  bearerToken,
  boundedJson,
  verifiedIdentity,
} from "./security/auth-core";
import { ApiError } from "./security/errors";
export { ApiError };
export const readJson = boundedJson;
export async function requireUser(request?: Request) {
  const token = bearerToken(request);
  const supabase = token
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      )
    : await createCookieClient();
  const user = await verifiedIdentity(token, (t) => supabase.auth.getUser(t));
  return { user, supabase };
}
export function apiError(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: "Invalid request",
        fields: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  return NextResponse.json(
    { error: "Unable to complete request. Please try again." },
    { status: 500 },
  );
}
