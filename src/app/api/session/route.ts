export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getOrCreateAnonSession, resolveSession } from "@/lib/session";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authSession = await getServerSession(authOptions);

  if (authSession?.user) {
    const user = await prisma.user.findUnique({
      where: { email: authSession.user.email! },
    });
    if (user) {
      return NextResponse.json({
        type: "user" as const,
        id: user.id,
        credits: user.credits,
        email: user.email,
      });
    }
  }

  const existing = await resolveSession();
  if (existing) {
    return NextResponse.json(existing);
  }

  const session = await getOrCreateAnonSession();
  return NextResponse.json(session);
}
