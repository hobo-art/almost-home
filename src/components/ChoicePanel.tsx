"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Choice {
  id: string;
  label: string;
  estimatedCost: string;
  magnitude: string;
}

interface ChoicePanelProps {
  choices: Choice[];
  onChoose: (choiceId: string) => void;
  onCustomAction: (action: string) => void;
  disabled?: boolean;
  credits: number;
}

const magnitudeStyles: Record<string, { border: string; hover: string; badge: string }> = {
  nudge: {
    border: "border-zinc-700",
    hover: "hover:border-indigo-600 hover:bg-indigo-950/20",
    badge: "bg-indigo-900/50 text-indigo-400",
  },
  shift: {
    border: "border-zinc-700",
    hover: "hover:border-amber-600 hover:bg-amber-950/20",
    badge: "bg-amber-900/50 text-amber-400",
  },
  leap: {
    border: "border-zinc-600",
    hover: "hover:border-violet-500 hover:bg-violet-950/20",
    badge: "bg-violet-900/50 text-violet-400",
  },
  rupture: {
    border: "border-zinc-500",
    hover: "hover:border-red-500 hover:bg-red-950/20",
    badge: "bg-red-900/50 text-red-400",
  },
};

export default function ChoicePanel({
  choices,
  onChoose,
  onCustomAction,
  disabled = false,
  credits,
}: ChoicePanelProps) {
  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onCustomAction(customText.trim());
      setCustomText("");
      setShowCustom(false);
    }
  };

  if (choices.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-3 mt-8"
    >
      <div className="text-zinc-600 text-xs font-mono mb-4 tracking-wider">
        WHAT DO YOU DO?
      </div>

      {choices.map((choice, index) => {
        const style = magnitudeStyles[choice.magnitude] || magnitudeStyles.nudge;
        return (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => onChoose(choice.id)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-lg border ${style.border} ${style.hover} transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group`}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-zinc-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                {choice.label}
              </span>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${style.badge}`}>
                  {choice.estimatedCost}
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}

      <div className="pt-2 border-t border-zinc-800/50">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            disabled={disabled || credits < 5}
            className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors disabled:opacity-30"
          >
            {credits < 5
              ? "NOT ENOUGH CREDITS FOR CUSTOM ACTIONS"
              : "OR DO SOMETHING ELSE... (costs more)"}
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleCustomSubmit}
            className="space-y-2"
          >
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="What do you do instead?"
              maxLength={500}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
            />
            <div className="flex justify-between items-center">
              <span className="text-zinc-700 text-xs font-mono">
                Custom actions use the subscription&apos;s AI — costs vary
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="text-zinc-600 hover:text-zinc-400 text-xs font-mono px-3 py-1.5"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!customText.trim() || disabled}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white text-xs font-mono px-4 py-1.5 rounded transition-colors"
                >
                  DO IT
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
}
