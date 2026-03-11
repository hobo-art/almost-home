export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveSession, getOrCreateAnonSession } from "@/lib/session";
import { getBalance } from "@/lib/credit-system";
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

    const credits = await getBalance(sessionType, sessionId);

    const history = await prisma.creditTransaction.findMany({
      where:
        sessionType === "anon"
          ? { anonSessionId: sessionId }
          : { userId: sessionId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      credits,
      sessionType,
      history: history.map((t) => ({
        amount: t.amount,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Credits error:", error);
    return NextResponse.json(
      { error: "Failed to load credit balance" },
      { status: 500 }
    );
  }
}
