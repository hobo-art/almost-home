import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./prisma";
import { INITIAL_CREDITS } from "@/data/prologue";

export const ANON_COOKIE_NAME = "ah_session";
const ANON_SESSION_TTL_DAYS = 30;

export interface SessionInfo {
  type: "anon" | "user";
  id: string;
  credits: number;
}

export async function getOrCreateAnonSession(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_COOKIE_NAME);

  if (existing) {
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken: existing.value },
    });

    if (session && session.expiresAt > new Date() && !session.migratedToId) {
      return { type: "anon", id: session.id, credits: session.credits };
    }
  }

  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ANON_SESSION_TTL_DAYS);

  const session = await prisma.anonymousSession.create({
    data: {
      sessionToken: token,
      credits: INITIAL_CREDITS,
      expiresAt,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      anonSessionId: session.id,
      amount: INITIAL_CREDITS,
      type: "free_grant",
      description: "Welcome credits — from the future, with love",
    },
  });

  cookieStore.set(ANON_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ANON_SESSION_TTL_DAYS * 24 * 60 * 60,
    path: "/",
  });

  return { type: "anon", id: session.id, credits: session.credits };
}

export async function resolveSession(): Promise<SessionInfo | null> {
  const cookieStore = await cookies();
  const anonToken = cookieStore.get(ANON_COOKIE_NAME);

  if (anonToken) {
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken: anonToken.value },
    });

    if (session && session.expiresAt > new Date() && !session.migratedToId) {
      return { type: "anon", id: session.id, credits: session.credits };
    }
  }

  return null;
}

/**
 * Migrate an anonymous session into a newly created user account.
 * Single DB transaction: transfers credits, re-links game sessions and events.
 */
export async function migrateAnonToUser(
  anonSessionId: string,
  userId: string
): Promise<void> {
  const anonSession = await prisma.anonymousSession.findUnique({
    where: { id: anonSessionId },
  });

  if (!anonSession || anonSession.migratedToId) {
    throw new Error("Anonymous session not found or already migrated");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: anonSession.credits } },
    }),
    prisma.anonymousSession.update({
      where: { id: anonSessionId },
      data: { migratedToId: userId, credits: 0 },
    }),
    prisma.gameSession.updateMany({
      where: { anonSessionId },
      data: { userId, anonSessionId: null },
    }),
    prisma.creditTransaction.updateMany({
      where: { anonSessionId },
      data: { userId, anonSessionId: null },
    }),
  ]);
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.anonymousSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      migratedToId: null,
    },
  });
  return result.count;
}
