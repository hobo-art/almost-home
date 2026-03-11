"use client";

import { useState, useCallback } from "react";
import TypewriterText from "./TypewriterText";
import ChoicePanel from "./ChoicePanel";
import SceneTransition from "./SceneTransition";

interface Choice {
  id: string;
  label: string;
  estimatedCost: string;
  magnitude: string;
}

interface StoryNode {
  id: string;
  narrative: string;
  choices: Choice[];
  metadata: {
    mood: string;
    ambientHint?: string;
    creditAnxiety?: boolean;
  };
}

interface SpendInfo {
  actualCost: number;
  surprise: boolean;
  message?: string;
}

interface StoryRendererProps {
  initialNode: StoryNode;
  initialCredits: number;
  onCreditsChange: (credits: number, lastCost: number | null, surprise: boolean) => void;
  onOutOfCredits: (message: string) => void;
  onPrologueEnd: () => void;
  sessionType: "anon" | "user";
}

export default function StoryRenderer({
  initialNode,
  initialCredits,
  onCreditsChange,
  onOutOfCredits,
  onPrologueEnd,
}: StoryRendererProps) {
  const [currentNode, setCurrentNode] = useState<StoryNode>(initialNode);
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [spendMessage, setSpendMessage] = useState<string | null>(null);

  const handleTextComplete = useCallback(() => {
    setTextComplete(true);
  }, []);

  const processResponse = (data: {
    node: StoryNode;
    credits: number;
    spend?: SpendInfo;
  }) => {
    setCredits(data.credits);
    onCreditsChange(data.credits, data.spend?.actualCost ?? null, data.spend?.surprise ?? false);

    if (data.spend?.surprise && data.spend.message) {
      setSpendMessage(data.spend.message);
      setTimeout(() => setSpendMessage(null), 4000);
    }

    if (data.node.id === "end-prologue") {
      onPrologueEnd();
    }

    setCurrentNode(data.node);
    setTextComplete(false);
    setLoading(false);
  };

  const handleChoice = async (choiceId: string) => {
    setLoading(true);
    setSpendMessage(null);

    try {
      const res = await fetch("/api/story/choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choiceId }),
      });

      const data = await res.json();

      if (res.status === 402) {
        onOutOfCredits(data.message);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("Choice error:", data.error);
        setLoading(false);
        return;
      }

      processResponse(data);
    } catch {
      setLoading(false);
    }
  };

  const handleCustomAction = async (action: string) => {
    setLoading(true);
    setSpendMessage(null);

    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.status === 402) {
        onOutOfCredits(data.message);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("Generate error:", data.error);
        setLoading(false);
        return;
      }

      processResponse(data);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {currentNode.metadata.ambientHint && (
        <div className="text-zinc-700 text-xs font-mono mb-6 italic">
          {currentNode.metadata.ambientHint}
        </div>
      )}

      <SceneTransition
        sceneKey={currentNode.id}
        mood={currentNode.metadata.mood}
      >
        <div className="py-4">
          <TypewriterText
            text={currentNode.narrative}
            speed={25}
            onComplete={handleTextComplete}
            className="text-zinc-300 text-base leading-[1.8]"
          />
        </div>
      </SceneTransition>

      {spendMessage && (
        <div className="my-4 p-3 border border-red-900/50 bg-red-950/20 rounded-lg">
          <p className="text-red-400 text-sm font-mono">{spendMessage}</p>
        </div>
      )}

      {textComplete && (
        <ChoicePanel
          choices={currentNode.choices}
          onChoose={handleChoice}
          onCustomAction={handleCustomAction}
          disabled={loading}
          credits={credits}
        />
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="text-indigo-400 text-xs font-mono animate-pulse tracking-widest">
            THE MULTIVERSE IS SHIFTING...
          </div>
        </div>
      )}
    </div>
  );
}
