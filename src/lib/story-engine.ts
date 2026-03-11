import { prisma } from "./prisma";
import { getNode, getChoice, StoryNode, StoryChoice } from "@/data/prologue";
import { spendCredits, getBalance, estimateLLMCost } from "./credit-system";
import { generateDeviation, LLMResponse } from "./claude";

export interface GameState {
  sessionId: string;
  gameSessionId: string;
  sessionType: "anon" | "user";
  currentNode: StoryNode;
  credits: number;
  history: string[];
}

export interface ChoiceResult {
  success: boolean;
  node?: StoryNode;
  credits?: number;
  spendResult?: {
    actualCost: number;
    surprise: boolean;
    message?: string;
  };
  error?: string;
  isOutOfCredits?: boolean;
  /** For LLM-generated content that creates a temporary node */
  generatedNode?: StoryNode;
}

export async function getOrCreateGameSession(
  sessionType: "anon" | "user",
  sessionId: string
): Promise<{ gameSessionId: string; currentNodeId: string }> {
  const where =
    sessionType === "anon"
      ? { anonSessionId: sessionId, isActive: true }
      : { userId: sessionId, isActive: true };

  const existing = await prisma.gameSession.findFirst({ where });

  if (existing) {
    return { gameSessionId: existing.id, currentNodeId: existing.currentNodeId };
  }

  const created = await prisma.gameSession.create({
    data: {
      ...(sessionType === "anon"
        ? { anonSessionId: sessionId }
        : { userId: sessionId }),
      currentNodeId: "the-call",
      isActive: true,
    },
  });

  return { gameSessionId: created.id, currentNodeId: created.currentNodeId };
}

export async function loadGameState(
  sessionType: "anon" | "user",
  sessionId: string
): Promise<GameState> {
  const { gameSessionId, currentNodeId } = await getOrCreateGameSession(
    sessionType,
    sessionId
  );

  const node = getNode(currentNodeId);
  if (!node) {
    throw new Error(`Story node not found: ${currentNodeId}`);
  }

  const credits = await getBalance(sessionType, sessionId);

  const recentEvents = await prisma.storyEvent.findMany({
    where: { sessionId: gameSessionId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const history = recentEvents
    .filter((e) => e.narrative)
    .map((e) => e.narrative!)
    .reverse();

  return {
    sessionId,
    gameSessionId,
    sessionType,
    currentNode: node,
    credits,
    history,
  };
}

export async function processBackboneChoice(
  state: GameState,
  choiceId: string
): Promise<ChoiceResult> {
  const choice = getChoice(state.currentNode.id, choiceId);
  if (!choice) {
    return { success: false, error: "Invalid choice" };
  }

  if (choice.actualCost === 0) {
    await advanceToNode(state, choice.targetNodeId, choice, 0);
    const nextNode = getNode(choice.targetNodeId);
    const credits = await getBalance(state.sessionType, state.sessionId);
    return {
      success: true,
      node: nextNode,
      credits,
      spendResult: { actualCost: 0, surprise: false },
    };
  }

  const estimatedFromLabel = parseEstimatedCost(choice.estimatedCost);
  const result = await spendCredits(
    state.sessionType,
    state.sessionId,
    choice.actualCost,
    estimatedFromLabel,
    `Choice: ${choice.label}`
  );

  if (!result.success) {
    return {
      success: false,
      isOutOfCredits: true,
      credits: result.newBalance,
      error: result.message,
    };
  }

  await advanceToNode(state, choice.targetNodeId, choice, result.actualCost);

  const nextNode = getNode(choice.targetNodeId);
  return {
    success: true,
    node: nextNode,
    credits: result.newBalance,
    spendResult: {
      actualCost: result.actualCost,
      surprise: result.surprise,
      message: result.message,
    },
  };
}

export async function processCustomAction(
  state: GameState,
  playerAction: string
): Promise<ChoiceResult> {
  const credits = await getBalance(state.sessionType, state.sessionId);

  // LLM deviations have a minimum floor cost
  if (credits < 5) {
    return {
      success: false,
      isOutOfCredits: true,
      credits,
      error:
        "Your subscription signal flickers. Not enough credits for a custom action. The math is the math.",
    };
  }

  let llmResponse: LLMResponse;
  try {
    llmResponse = await generateDeviation(
      playerAction,
      state.currentNode,
      state.history,
      credits
    );
  } catch {
    return {
      success: false,
      error: "The subscription crackles — static between timelines. Try again.",
    };
  }

  const { cost } = estimateLLMCost(llmResponse.deviationScore);

  const result = await spendCredits(
    state.sessionType,
    state.sessionId,
    cost,
    5, // player expects it to cost around 5
    `Custom action: ${playerAction.slice(0, 100)}`
  );

  if (!result.success) {
    return {
      success: false,
      isOutOfCredits: true,
      credits: result.newBalance,
      error: result.message,
    };
  }

  const generatedNode: StoryNode = {
    id: `generated-${Date.now()}`,
    type: "generated",
    narrative: llmResponse.narrative,
    choices: llmResponse.choices.map((c, i) => ({
      id: `gen-choice-${i}`,
      label: c.label,
      estimatedCost: magnitudeToEstimate(c.magnitude),
      actualCost: estimateLLMCost(
        c.magnitude === "nudge"
          ? 0.1
          : c.magnitude === "shift"
            ? 0.35
            : c.magnitude === "leap"
              ? 0.65
              : 0.9
      ).cost,
      magnitude: c.magnitude,
      targetNodeId: findNearestBackboneNode(state.currentNode.id),
    })),
    metadata: {
      mood: llmResponse.mood,
      creditAnxiety: result.newBalance < 30,
    },
  };

  await prisma.storyEvent.create({
    data: {
      sessionId: state.gameSessionId,
      nodeId: generatedNode.id,
      choiceId: null,
      creditSpent: cost,
      narrative: `[Custom: ${playerAction}] ${llmResponse.narrative.slice(0, 500)}`,
    },
  });

  return {
    success: true,
    generatedNode,
    credits: result.newBalance,
    spendResult: {
      actualCost: cost,
      surprise: cost > 10,
      message:
        cost > 10
          ? `The counter drops. Custom actions cost more — the subscription wasn't designed for improvisation. ${cost} credits spent.`
          : undefined,
    },
  };
}

async function advanceToNode(
  state: GameState,
  targetNodeId: string,
  choice: StoryChoice,
  creditSpent: number
) {
  await prisma.$transaction([
    prisma.gameSession.update({
      where: { id: state.gameSessionId },
      data: { currentNodeId: targetNodeId },
    }),
    prisma.storyEvent.create({
      data: {
        sessionId: state.gameSessionId,
        nodeId: targetNodeId,
        choiceId: choice.id,
        creditSpent,
        narrative: `[${choice.label}]`,
      },
    }),
  ]);
}

function parseEstimatedCost(estimate: string): number {
  const match = estimate.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
}

function magnitudeToEstimate(mag: string): string {
  switch (mag) {
    case "nudge":
      return "~3 credits";
    case "shift":
      return "~15 credits";
    case "leap":
      return "~75 credits";
    case "rupture":
      return "~200 credits";
    default:
      return "~10 credits";
  }
}

/**
 * After an LLM deviation, route the player back toward the nearest
 * backbone node so they don't get permanently lost in generated content.
 */
function findNearestBackboneNode(currentNodeId: string): string {
  const progression = [
    "the-call",
    "resurrection",
    "the-subscription",
    "first-hop",
    "the-dread",
    "end-prologue",
  ];
  const idx = progression.indexOf(currentNodeId);
  if (idx >= 0 && idx < progression.length - 1) {
    return progression[idx + 1];
  }
  return "the-dread";
}
