export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ANON_COOKIE_NAME } from "@/lib/session";

/**
 * Clears the anonymous session cookie so the user can start a new timeline.
 * Next request to /play will create a fresh anonymous session (new credits, new progress).
 * Does not sign out authenticated users — use NextAuth signOut for that.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ANON_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res;
}
