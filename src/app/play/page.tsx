"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoryRenderer from "@/components/StoryRenderer";
import CreditMeter from "@/components/CreditMeter";

interface StoryNode {
  id: string;
  narrative: string;
  choices: {
    id: string;
    label: string;
    estimatedCost: string;
    magnitude: string;
  }[];
  metadata: {
    mood: string;
    ambientHint?: string;
    creditAnxiety?: boolean;
  };
}

interface GameState {
  currentNode: StoryNode;
  credits: number;
  sessionType: "anon" | "user";
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [credits, setCredits] = useState(100);
  const [lastCost, setLastCost] = useState<number | null>(null);
  const [surprise, setSurprise] = useState(false);
  const [anxious, setAnxious] = useState(false);
  const [outOfCreditsMessage, setOutOfCreditsMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const router = useRouter();

  const handleNewTimeline = async () => {
    setClearing(true);
    try {
      await fetch("/api/session/clear", { method: "POST", credentials: "include" });
      window.location.href = "/play";
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    async function loadState() {
      try {
        const res = await fetch("/api/story/state");
        if (!res.ok) throw new Error("Failed to load");
        const data: GameState = await res.json();
        setGameState(data);
        setCredits(data.credits);
        setAnxious(data.currentNode.metadata.creditAnxiety ?? false);
      } catch (err) {
        console.error("Failed to load game state:", err);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  const handleCreditsChange = (
    newCredits: number,
    cost: number | null,
    isSurprise: boolean
  ) => {
    setCredits(newCredits);
    setLastCost(cost);
    setSurprise(isSurprise);
    setAnxious(newCredits < 30);
  };

  const handleOutOfCredits = (message: string) => {
    setOutOfCreditsMessage(message);
  };

  const handlePrologueEnd = () => {
    // After a delay, we could prompt signup for anonymous users
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-indigo-400 text-sm font-mono animate-pulse tracking-widest mb-4">
            TUNING FREQUENCIES
          </div>
          <div className="text-zinc-700 text-xs font-mono">
            Locating your timeline...
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-sm font-mono mb-4">
            SIGNAL LOST
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-zinc-400 hover:text-white text-sm font-mono underline"
          >
            Try reconnecting
          </button>
        </div>
      </div>
    );
  }

  if (outOfCreditsMessage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <CreditMeter credits={0} lastCost={null} />
          <div className="text-red-500 text-sm font-mono mb-6 tracking-widest">
            SUBSCRIPTION EXHAUSTED
          </div>
          <p className="text-zinc-400 text-base leading-relaxed mb-8">
            {outOfCreditsMessage}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/shop")}
              className="block w-full max-w-xs mx-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-3 font-mono text-sm transition-colors"
            >
              RECHARGE CREDITS
            </button>
            <p className="text-zinc-700 text-xs font-mono">
              Or sit with the silence. Think for free. No one is charging you
              for that.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <CreditMeter
        credits={credits}
        lastCost={lastCost}
        surprise={surprise}
        anxious={anxious}
      />

      <main className="px-4 py-16 sm:py-24">
        <StoryRenderer
          initialNode={gameState.currentNode}
          initialCredits={gameState.credits}
          onCreditsChange={handleCreditsChange}
          onOutOfCredits={handleOutOfCredits}
          onPrologueEnd={handlePrologueEnd}
          sessionType={gameState.sessionType}
        />
      </main>

      <footer className="fixed bottom-4 left-4 right-4 flex items-center justify-between text-zinc-800 text-xs font-mono">
        <span>ALMOST HOME</span>
        {gameState.sessionType === "anon" && (
          <button
            type="button"
            onClick={handleNewTimeline}
            disabled={clearing}
            className="text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50"
          >
            {clearing ? "..." : "New timeline"}
          </button>
        )}
      </footer>
    </div>
  );
}
