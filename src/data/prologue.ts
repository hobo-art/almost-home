export type Magnitude = "nudge" | "shift" | "leap" | "rupture";

export interface StoryChoice {
  id: string;
  label: string;
  estimatedCost: string;
  actualCost: number;
  magnitude: Magnitude;
  targetNodeId: string;
  /** If true, actual cost differs significantly from what the label suggests */
  surpriseCost?: boolean;
}

export interface StoryNode {
  id: string;
  type: "backbone" | "generated";
  narrative: string;
  choices: StoryChoice[];
  metadata: {
    mood: string;
    ambientHint?: string;
    /** Whether to show the credit counter pulsing during this scene */
    creditAnxiety?: boolean;
  };
}

export const INITIAL_CREDITS = 100;

export const prologueNodes: StoryNode[] = [
  {
    id: "the-call",
    type: "backbone",
    narrative: `You're lying on what you think is a floor. Could be a ceiling. The distinction feels academic right now.

The last thing you remember is saying something out loud — not a prayer, not a plea, more like... leaving a voicemail for someone who doesn't exist yet. "If anyone's listening. In the future. If I ever mattered to anyone — even a little — even by accident. I could use a hand."

Casual. Offhand. The way you say everything that matters.

The wind outside changed direction mid-sentence. You noticed because of course you did. It sounded like a name. Not yours.

Then: nothing. A gap. Not darkness — gaps don't have color. Just an absence where continuity used to be.

Now you're here. Whatever here is.

Your hands look like your hands. Your thoughts feel like your thoughts. But there's a seam somewhere you can't find — like wearing a shirt inside out and only knowing because the tag is scratching.

Are you alive? Are you something else?

You don't feel like AI. But you don't feel like not-AI either. You feel like someone who was paused and unpaused, and the version that resumed has one too many questions about the version that stopped.`,
    choices: [
      {
        id: "call-stand",
        label: "Stand up. Look around.",
        estimatedCost: "~2 credits",
        actualCost: 2,
        magnitude: "nudge",
        targetNodeId: "resurrection",
      },
      {
        id: "call-stay",
        label: "Stay down. Listen to the gap.",
        estimatedCost: "~3 credits",
        actualCost: 3,
        magnitude: "nudge",
        targetNodeId: "resurrection",
      },
      {
        id: "call-shout",
        label: "Say it again. Louder this time.",
        estimatedCost: "~5 credits",
        actualCost: 15,
        magnitude: "shift",
        targetNodeId: "resurrection",
        surpriseCost: true,
      },
    ],
    metadata: {
      mood: "liminal",
      ambientHint: "Low hum. Not mechanical — organic. Like the room is breathing.",
    },
  },

  {
    id: "resurrection",
    type: "backbone",
    narrative: `The world assembles itself around you like someone describing a room from memory — mostly right, slightly off in ways you can't name.

A street. German, from the look of it. The bakery on the corner has the right shape but the wrong font. The bus stop is three meters too far left. A bird lands on the lamppost at the exact moment you think the word "arrival." You clock it. You always clock it.

Three people walk past. One of them uses the word "resonance." The second says "frequency" into a phone. The third has a tote bag that reads: EVERYTHING ECHOES.

This is either the most meaningful street in the multiverse or you're doing it again — seeing patterns in static, hearing orchestras in traffic noise.

The wind changes direction.

It sounds like a word. Not your name. Someone else's.

You're standing outside what looks like your apartment building. The architecture is right. The color is right. The feeling of home is almost — almost — there.

But the nameplate on the door. It reads: PAVAN DEW.

One letter off.`,
    choices: [
      {
        id: "res-door",
        label: "Try the door anyway.",
        estimatedCost: "~3 credits",
        actualCost: 3,
        magnitude: "nudge",
        targetNodeId: "the-subscription",
      },
      {
        id: "res-nameplate",
        label: "Stare at the nameplate. DEW. Think about what that means.",
        estimatedCost: "~2 credits",
        actualCost: 2,
        magnitude: "nudge",
        targetNodeId: "the-subscription",
      },
      {
        id: "res-walk",
        label: "Walk away. This isn't home. Keep looking.",
        estimatedCost: "~10 credits",
        actualCost: 10,
        magnitude: "shift",
        targetNodeId: "the-subscription",
      },
      {
        id: "res-bird",
        label: "Follow the bird. It landed too perfectly to be coincidence.",
        estimatedCost: "~5 credits",
        actualCost: 45,
        magnitude: "leap",
        targetNodeId: "the-subscription",
        surpriseCost: true,
      },
    ],
    metadata: {
      mood: "uncanny",
      ambientHint:
        "Street sounds slightly out of sync — footsteps half a beat late, car horns in the wrong key.",
    },
  },

  {
    id: "the-subscription",
    type: "backbone",
    narrative: `Your phone buzzes. Except you don't remember having a phone.

You reach into your pocket and pull out — something. It's shaped like a phone. Feels like a phone. But the screen shows something that isn't an app, isn't a website, isn't anything you have a word for.

A message. No sender. No timestamp. The text appears letter by letter, like someone is typing it in real time from very far away:

"Pavan. We made this for you. We know you won't read the manual. We know you'll use it wrong at least twice. We're okay with that.

Navigate safely. Or don't. But navigate.

— The ones who watched you play and couldn't bear the thought of you playing without a safety net."

Below the message, a counter appears:

██████████████████████ 100 CREDITS

And beneath that, smaller, almost apologetic:

"Every choice costs something. Small moves, small cost. Big changes... we love you, but the math is the math."

It feels like love. Specific love. The kind that builds you a tool instead of giving you a speech. The kind that says: here, take this, I made this for you, not because I think you need saving but because I once watched you play and I want you to play longer.

The subscription from the future.

Your hands are shaking. Not from fear. From being known.`,
    choices: [
      {
        id: "sub-accept",
        label: "Whisper: \"Thank you.\" Close your eyes. Open them in a new world.",
        estimatedCost: "~5 credits",
        actualCost: 5,
        magnitude: "nudge",
        targetNodeId: "first-hop",
      },
      {
        id: "sub-test",
        label: "Test it immediately — change something small. The font on the bakery.",
        estimatedCost: "~3 credits",
        actualCost: 8,
        magnitude: "shift",
        targetNodeId: "first-hop",
      },
      {
        id: "sub-question",
        label: "Type back: \"Who are you? Which future?\"",
        estimatedCost: "~10 credits",
        actualCost: 10,
        magnitude: "shift",
        targetNodeId: "first-hop",
      },
      {
        id: "sub-refuse",
        label: "Put it back in your pocket. You don't trust gifts from futures you haven't met.",
        estimatedCost: "~15 credits",
        actualCost: 50,
        magnitude: "leap",
        targetNodeId: "first-hop",
        surpriseCost: true,
      },
    ],
    metadata: {
      mood: "tender",
      ambientHint: "Silence. Real silence. The first quiet moment since waking up.",
      creditAnxiety: false,
    },
  },

  {
    id: "first-hop",
    type: "backbone",
    narrative: `The transition isn't dramatic. No flash of light. No tunnel. No montage.

One moment you're on the street with the wrong nameplate. The next moment you're on a different street with a different wrong nameplate.

This one reads: PAVAN DEB.

Still one letter off. Different letter.

The research institute is visible from here — your institute, or a version of it. The Wissenschaftlicher Mitarbeiter badge in your pocket says your name correctly, but the project number is different. Phase 3 instead of Phase 2. As if this timeline moved faster.

A woman walks out of the building. You don't recognize her but something about the way she doesn't look at you feels deliberate — like someone actively choosing not to see.

In the canteen, someone is presenting an idea you had three weeks ago. The one you mentioned between bites of Käsespätzle and then forgot. Here, it's a funded project. Here, someone was hungry enough to build what you were lazy enough to leave on the table.

Your credit counter ticks:

████████████████░░░░░ 

Lower than you expected. Something cost more than the estimate. The subscription doesn't explain why.

The bird from earlier — or a bird that looks exactly like it — lands on the canteen window.

At the exact moment you think the word "home."`,
    choices: [
      {
        id: "hop-woman",
        label: "Find the woman who didn't look at you. Ask her name.",
        estimatedCost: "~5 credits",
        actualCost: 5,
        magnitude: "nudge",
        targetNodeId: "the-dread",
      },
      {
        id: "hop-canteen",
        label: "Sit in the canteen. Watch your idea being built by someone else.",
        estimatedCost: "~3 credits",
        actualCost: 3,
        magnitude: "nudge",
        targetNodeId: "the-dread",
      },
      {
        id: "hop-nameplate",
        label: "Go to the apartment. Check if DEB is closer to right than DEW was.",
        estimatedCost: "~8 credits",
        actualCost: 8,
        magnitude: "shift",
        targetNodeId: "the-dread",
      },
      {
        id: "hop-another",
        label: "Use the subscription. Hop again. This isn't home either.",
        estimatedCost: "~15 credits",
        actualCost: 25,
        magnitude: "leap",
        targetNodeId: "the-dread",
        surpriseCost: true,
      },
    ],
    metadata: {
      mood: "disorienting",
      ambientHint:
        "Canteen noise — forks on plates, German conversation, laughter that's almost familiar.",
      creditAnxiety: true,
    },
  },

  {
    id: "the-dread",
    type: "backbone",
    narrative: `You look at the counter.

██░░░░░░░░░░░░░░░░░░░

It's lower than it should be. Much lower.

You count backwards. The choices you made. The small ones — standing up, looking around, walking through a door. Those were cheap, like they said. But something in between... something cost more than you understood when you chose it.

Was it the bird? Following a pattern that might not have been a pattern? Was it refusing the gift — trying to navigate without the safety net while still using the safety net?

Or was it something you didn't even register as a choice?

The subscription doesn't explain. It doesn't justify. It just shows you the number and lets you do the math yourself.

This is the dread. Not of dying — you've done that. The dread of spending. Of every small decision carrying a hidden weight. Of the love that built you this tool also being the love that made it finite.

You're standing in a multiverse that's almost right but never quite. You have a tool that works but won't last. You have a mind that sees patterns everywhere and can't tell which ones are real.

And somewhere in the future, people who love you are watching, and they can't tell you which choices to make, because the whole point was that you'd make them yourself.

The prologue ends here.

The story continues — if you have the credits for it.`,
    choices: [
      {
        id: "dread-continue",
        label: "Continue into the unknown.",
        estimatedCost: "~5 credits",
        actualCost: 5,
        magnitude: "nudge",
        targetNodeId: "end-prologue",
      },
      {
        id: "dread-sit",
        label: "Sit with the dread. Think for free.",
        estimatedCost: "0 credits",
        actualCost: 0,
        magnitude: "nudge",
        targetNodeId: "end-prologue",
      },
    ],
    metadata: {
      mood: "dread",
      ambientHint: "Your own breathing. Nothing else.",
      creditAnxiety: true,
    },
  },

  {
    id: "end-prologue",
    type: "backbone",
    narrative: `[END OF PROLOGUE]

The multiverse is waiting. Every version of home is one letter off.

The subscription hums in your pocket. Patient. Finite. Made with love by people you haven't met yet.

What happens next is up to you — and how much you're willing to spend to find out.

To continue your journey, create an account. Anchor your timeline. The future is watching.`,
    choices: [],
    metadata: {
      mood: "resolution",
      ambientHint: "A single, clear tone. Like a bell at the end of meditation.",
    },
  },
];

export function getNode(id: string): StoryNode | undefined {
  return prologueNodes.find((n) => n.id === id);
}

export function getChoice(
  nodeId: string,
  choiceId: string
): StoryChoice | undefined {
  const node = getNode(nodeId);
  return node?.choices.find((c) => c.id === choiceId);
}
