export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveSession, getOrCreateAnonSession } from "@/lib/session";
import { loadGameState, processCustomAction } from "@/lib/story-engine";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (!action || typeof action !== "string" || action.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing action text" },
        { status: 400 }
      );
    }

    if (action.length > 500) {
      return NextResponse.json(
        { error: "Action too long. The subscription has bandwidth limits." },
        { status: 400 }
      );
    }

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
    const result = await processCustomAction(state, action.trim());

    if (!result.success && result.isOutOfCredits) {
      return NextResponse.json(
        {
          outOfCredits: true,
          credits: result.credits,
          message: result.error,
        },
        { status: 402 }
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      node: result.generatedNode ?? result.node,
      credits: result.credits,
      spend: result.spendResult,
    });
  } catch (error) {
    console.error("Story generate error:", error);
    return NextResponse.json(
      { error: "The subscription crackled — static between timelines." },
      { status: 500 }
    );
  }
}
