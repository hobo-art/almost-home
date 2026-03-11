export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ANON_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ANON_COOKIE_NAME);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Session reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset session" },
      { status: 500 }
    );
  }
}
