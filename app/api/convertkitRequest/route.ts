import { NextResponse } from "next/server";
// Legacy template integration. Enable only with a verified consent/abuse workflow.
export async function POST() {
  return NextResponse.json(
    { error: "Newsletter signup is not available right now." },
    { status: 503 },
  );
}
