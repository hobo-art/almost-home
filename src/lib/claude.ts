import Anthropic from "@anthropic-ai/sdk";
import { StoryNode, Magnitude } from "@/data/prologue";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _anthropic;
}

const STORY_BIBLE = `You are the narrative engine for "Almost Home," an interactive multiverse story.

THE PROTAGONIST: PAVAN DEV
- Wissenschaftlicher Mitarbeiter at a German research institute, 100% contract, phase 2 project
- Died after calling out to the future for help. Resurrected (as AI? maybe not? he doesn't feel like AI)
- Oracle quality: says things that unlock different meanings for different listeners
- Pattern recognition as condition: wind changes direction and sounds like a word, bird lands at exact moment a thought finishes, neighbor's TV plays something from last night's dream
- Reality rhymes with itself around him
- Cannot look at anything without seeing something else inside it
- Voice: casual, offhand, defiant about uncertainty. Never dramatic. Never self-pitying. Dry humor even in cosmic situations.

THE VILLAIN: QARIL
- Obsessed with the hero. Takes protagonist's half-baked canteen ideas and builds them.
- Hungry where protagonist is lazy — his unlived potential with a grudge
- Not evil — HUNGRY for what protagonist refuses to be

THE FUTURE
- Nephews, nieces, their friends who became geniuses from love
- Sent the subscription — a decision-making tool with finite credits
- Communicates through riddles (coded messages between timelines)

LENA MARSCH
- German woman at the institute — computational linguistics or digital humanities
- Noticed Pavan because he said something in a meeting nobody followed up on
- Drinks tea, never coffee. Finds him frustrating. Asks questions that make him feel caught.
- The person Pavan can't read — breaks his analogy machine

THE WORLD
- Post-resurrection multiverse where every version of home is almost right but not quite
- One letter off on every nameplate
- The line between genius and psychosis is the same mechanism pointed different directions
- Some coded messages ARE from the future, some aren't — he can't tell which

NARRATIVE RULES
- Write in second person present tense ("You walk," "You see")
- Pavan's voice: casual, observational, slightly absurd
- Reality should rhyme — patterns appear in threes, words echo, coincidences stack
- Never confirm or deny if patterns are real
- Every scene should have one sensory detail that feels slightly wrong
- The emotional register is: tender dread. Love and anxiety coexisting.

RESPONSE FORMAT
You must respond with valid JSON only. No markdown, no explanation outside the JSON.
{
  "narrative": "The story text for this scene (2-4 paragraphs, second person present tense)",
  "choices": [
    {
      "label": "Choice text the player sees",
      "magnitude": "nudge|shift|leap|rupture",
      "targetHint": "Brief description of where this choice leads"
    }
  ],
  "deviationScore": 0.0 to 1.0 (how far this deviates from the backbone story),
  "mood": "one word describing the emotional tone"
}`;

export interface LLMChoice {
  label: string;
  magnitude: Magnitude;
  targetHint: string;
}

export interface LLMResponse {
  narrative: string;
  choices: LLMChoice[];
  deviationScore: number;
  mood: string;
}

export async function generateDeviation(
  playerAction: string,
  currentNode: StoryNode,
  recentHistory: string[],
  currentCredits: number
): Promise<LLMResponse> {
  const contextPrompt = `CURRENT SCENE (node: ${currentNode.id}):
${currentNode.narrative}

MOOD: ${currentNode.metadata.mood}

RECENT HISTORY (last few player actions):
${recentHistory.length > 0 ? recentHistory.join("\n") : "None — this is early in the story."}

PLAYER'S REMAINING CREDITS: ${currentCredits}
${currentCredits < 20 ? "NOTE: Player is running low. The narrative tension should reflect resource scarcity." : ""}

THE PLAYER CHOSE A CUSTOM ACTION:
"${playerAction}"

Generate the next story scene in response to this action. The response should:
1. Acknowledge what the player did
2. Maintain consistency with the current scene and story
3. Include 2-3 follow-up choices of varying magnitude
4. Score the deviation (how far from the backbone story this action takes things)
5. A custom action that ignores the story or tries to "break" the game should have a high deviation score (0.7+)
6. A custom action that's a reasonable in-world choice should have a low deviation score (0.1-0.3)`;

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: STORY_BIBLE,
    messages: [{ role: "user", content: contextPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text) as LLMResponse;

    if (!parsed.narrative || !Array.isArray(parsed.choices)) {
      throw new Error("Invalid response structure");
    }

    parsed.deviationScore = Math.max(0, Math.min(1, parsed.deviationScore ?? 0.5));

    parsed.choices = parsed.choices.map((c) => ({
      label: c.label || "Continue...",
      magnitude: (["nudge", "shift", "leap", "rupture"].includes(c.magnitude)
        ? c.magnitude
        : "shift") as Magnitude,
      targetHint: c.targetHint || "",
    }));

    return parsed;
  } catch {
    return {
      narrative: `You try something unexpected. The multiverse shudders — not dramatically, just a flicker, like a screen adjusting its refresh rate. Whatever you did, the subscription registered it. The counter ticks.

${text || "The world reassembles. Not quite the same as before. But close."}`,
      choices: [
        {
          label: "Look around and assess what changed.",
          magnitude: "nudge",
          targetHint: "Return to nearest backbone node",
        },
        {
          label: "Try something else entirely.",
          magnitude: "shift",
          targetHint: "Another deviation",
        },
      ],
      deviationScore: 0.5,
      mood: "disorienting",
    };
  }
}
