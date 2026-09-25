import { NextResponse } from "next/server";
// Inbound forwarding is deliberately disabled. Re-enable only with verified
// signing-key/timestamp checks, durable replay protection, and an approved recipient.
// Returning a rejection ensures untrusted inbound bodies can never send email.
export async function POST() {
  return NextResponse.json(
    { error: "Inbound forwarding is disabled" },
    { status: 503 },
  );
}
