export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveSession, getOrCreateAnonSession } from "@/lib/session";
import { loadGameState } from "@/lib/story-engine";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let sessionType: "anon" | "user" = "anon";
    let sessionId: string;

    const authSession = await getServerSession(authOptions);
    if (authSession?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: authSession.user.email },
      });
      if (user) {
        sessionType = "user";
        sessionId = user.id;
      } else {
        const anon = await resolveSession() ?? await getOrCreateAnonSession();
        sessionId = anon.id;
      }
    } else {
      const anon = await resolveSession() ?? await getOrCreateAnonSession();
      sessionId = anon.id;
    }

    const state = await loadGameState(sessionType, sessionId);

    return NextResponse.json({
      currentNode: state.currentNode,
      credits: state.credits,
      sessionType: state.sessionType,
    });
  } catch (error) {
    console.error("Story state error:", error);
    return NextResponse.json(
      { error: "Failed to load story state" },
      { status: 500 }
    );
  }
}
