import { NextResponse } from "next/server";
// Waitlist storage/consent workflow is not configured. Do not accept or log emails.
export async function POST() {
  return NextResponse.json(
    {
      error: "The waitlist is not available. Please create an account instead.",
    },
    { status: 503 },
  );
}
