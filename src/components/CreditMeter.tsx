"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CreditMeterProps {
  credits: number;
  maxCredits?: number;
  lastCost?: number | null;
  surprise?: boolean;
  anxious?: boolean;
}

export default function CreditMeter({
  credits,
  maxCredits = 100,
  lastCost = null,
  surprise = false,
  anxious = false,
}: CreditMeterProps) {
  const [showCostFlash, setShowCostFlash] = useState(false);
  const percentage = Math.max(0, Math.min(100, (credits / maxCredits) * 100));

  const barColor =
    credits <= 10
      ? "bg-red-500"
      : credits <= 30
        ? "bg-amber-500"
        : "bg-indigo-500";

  const glowColor =
    credits <= 10
      ? "shadow-red-500/30"
      : credits <= 30
        ? "shadow-amber-500/30"
        : "shadow-indigo-500/30";

  useEffect(() => {
    if (lastCost && lastCost > 0) {
      setShowCostFlash(true);
      const timer = setTimeout(() => setShowCostFlash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCost, credits]);

  return (
    <div className={`fixed top-4 right-4 z-50 ${anxious ? "animate-pulse" : ""}`}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 min-w-[180px] shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-500 text-xs font-mono tracking-wider">
            CREDITS
          </span>
          <motion.span
            key={credits}
            initial={{ scale: 1.3, color: surprise ? "#ef4444" : "#818cf8" }}
            animate={{ scale: 1, color: "#ffffff" }}
            transition={{ duration: 0.5 }}
            className="text-white font-mono text-sm font-bold"
          >
            {credits}
          </motion.span>
        </div>

        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor} shadow-sm ${glowColor}`}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence>
          {showCostFlash && lastCost && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-xs font-mono mt-2 ${surprise ? "text-red-400" : "text-zinc-500"}`}
            >
              {surprise ? `−${lastCost} (unexpected)` : `−${lastCost}`}
            </motion.div>
          )}
        </AnimatePresence>

        {credits === 0 && (
          <div className="text-red-500 text-xs font-mono mt-2 animate-pulse">
            SIGNAL LOST
          </div>
        )}
      </div>
    </div>
  );
}
