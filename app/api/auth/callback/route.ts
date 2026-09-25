import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { recoveryTarget } from "@/libs/billing-policy";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://ermajean.com";
  const target = recoveryTarget(req.nextUrl.searchParams.get("redirect_to"));
  if (!code)
    return NextResponse.redirect(
      new URL("/sign-in?message=Invalid%20or%20expired%20link", origin),
    );
  // Native PKCE must exchange the code on the originating device, not this server.
  if (target === "ermajean://reset-password") {
    const url = new URL(target);
    url.searchParams.set("code", code);
    return NextResponse.redirect(url);
  }
  const { error } = await (
    await createClient()
  ).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(
    new URL(
      error ? "/sign-in?message=Invalid%20or%20expired%20link" : target,
      origin,
    ),
  );
}
