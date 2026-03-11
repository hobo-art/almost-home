import { prisma } from "./prisma";
import { Magnitude } from "@/data/prologue";

export const MAGNITUDE_RANGES: Record<Magnitude, [number, number]> = {
  nudge: [1, 5],
  shift: [10, 25],
  leap: [50, 100],
  rupture: [150, 300],
};

export const CREDIT_PACKS = [
  { id: "pack-200", credits: 200, priceInCents: 300, label: "200 credits" },
  { id: "pack-500", credits: 500, priceInCents: 600, label: "500 credits" },
  { id: "pack-1500", credits: 1500, priceInCents: 1500, label: "1500 credits" },
] as const;

export interface CreditCheckResult {
  canAfford: boolean;
  currentBalance: number;
  estimatedCost: number;
}

export interface SpendResult {
  success: boolean;
  actualCost: number;
  newBalance: number;
  surprise: boolean;
  message?: string;
}

/**
 * Estimate the cost of an LLM-generated deviation based on its magnitude score.
 * The LLM returns a 0-1 deviation score; we map that to credit cost.
 */
export function estimateLLMCost(deviationScore: number): {
  magnitude: Magnitude;
  cost: number;
} {
  if (deviationScore < 0.2) {
    const cost = Math.round(1 + deviationScore * 20);
    return { magnitude: "nudge", cost };
  }
  if (deviationScore < 0.5) {
    const cost = Math.round(10 + (deviationScore - 0.2) * 50);
    return { magnitude: "shift", cost };
  }
  if (deviationScore < 0.8) {
    const cost = Math.round(50 + (deviationScore - 0.5) * 166);
    return { magnitude: "leap", cost };
  }
  const cost = Math.round(150 + (deviationScore - 0.8) * 750);
  return { magnitude: "rupture", cost };
}

export async function getBalance(
  sessionType: "anon" | "user",
  sessionId: string
): Promise<number> {
  if (sessionType === "anon") {
    const session = await prisma.anonymousSession.findUnique({
      where: { id: sessionId },
    });
    return session?.credits ?? 0;
  }
  const user = await prisma.user.findUnique({
    where: { id: sessionId },
  });
  return user?.credits ?? 0;
}

export async function checkCredits(
  sessionType: "anon" | "user",
  sessionId: string,
  estimatedCost: number
): Promise<CreditCheckResult> {
  const currentBalance = await getBalance(sessionType, sessionId);
  return {
    canAfford: currentBalance >= estimatedCost,
    currentBalance,
    estimatedCost,
  };
}

export async function spendCredits(
  sessionType: "anon" | "user",
  sessionId: string,
  actualCost: number,
  estimatedCost: number,
  description: string
): Promise<SpendResult> {
  const currentBalance = await getBalance(sessionType, sessionId);

  if (currentBalance < actualCost) {
    return {
      success: false,
      actualCost,
      newBalance: currentBalance,
      surprise: actualCost > estimatedCost,
      message: outOfCreditsMessage(currentBalance),
    };
  }

  const newBalance = currentBalance - actualCost;

  if (sessionType === "anon") {
    await prisma.$transaction([
      prisma.anonymousSession.update({
        where: { id: sessionId },
        data: { credits: newBalance },
      }),
      prisma.creditTransaction.create({
        data: {
          anonSessionId: sessionId,
          amount: -actualCost,
          type: "spend",
          description,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: sessionId },
        data: { credits: newBalance },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: sessionId,
          amount: -actualCost,
          type: "spend",
          description,
        },
      }),
    ]);
  }

  const surprise = actualCost > estimatedCost * 1.5;

  return {
    success: true,
    actualCost,
    newBalance,
    surprise,
    message: surprise ? surpriseCostMessage(estimatedCost, actualCost) : undefined,
  };
}

export async function grantCredits(
  sessionType: "anon" | "user",
  sessionId: string,
  amount: number,
  type: "free_grant" | "purchase",
  stripePaymentId?: string
): Promise<number> {
  if (sessionType === "anon") {
    const updated = await prisma.anonymousSession.update({
      where: { id: sessionId },
      data: { credits: { increment: amount } },
    });
    await prisma.creditTransaction.create({
      data: {
        anonSessionId: sessionId,
        amount,
        type,
        stripePaymentId,
        description: type === "free_grant" ? "Welcome credits" : `Purchased ${amount} credits`,
      },
    });
    return updated.credits;
  }

  const updated = await prisma.user.update({
    where: { id: sessionId },
    data: { credits: { increment: amount } },
  });
  await prisma.creditTransaction.create({
    data: {
      userId: sessionId,
      amount,
      type,
      stripePaymentId,
      description: type === "free_grant" ? "Welcome credits" : `Purchased ${amount} credits`,
    },
  });
  return updated.credits;
}

function outOfCreditsMessage(remaining: number): string {
  if (remaining === 0) {
    return "Your subscription signal has gone silent. The counter reads zero. You're alone now — with only your own free thinking. No cost. No safety net. Just you.";
  }
  return `You have ${remaining} credits remaining. Not enough for this choice. The subscription hums — patient, finite, unapologetic.`;
}

function surpriseCostMessage(estimated: number, actual: number): string {
  return `The counter drops — further than expected. You estimated ~${estimated}. It cost ${actual}. Some choices carry weight you don't see until after you've made them.`;
}
