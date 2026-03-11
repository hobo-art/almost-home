"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const taglines = [
  "Every version of home is one letter off.",
  "The future sent you a subscription. Use it wisely.",
  "Small moves cost little. Big changes cost everything.",
  "Navigate the multiverse. Find where you belong.",
];

export default function LandingPage() {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNewJourney = useCallback(async () => {
    setResetting(true);
    try {
      await fetch("/api/session/reset", { method: "POST" });
      router.push("/play");
    } catch {
      setResetting(false);
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-indigo-950/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="text-indigo-400/60 text-xs font-mono tracking-[0.3em] mb-6">
            AN INTERACTIVE MULTIVERSE STORY
          </div>

          <h1 className="text-5xl sm:text-7xl font-extralight tracking-tight mb-2">
            <span className="text-white">Almost</span>{" "}
            <span className="text-indigo-400">Home</span>
          </h1>

          <div className="h-8 mt-6 overflow-hidden">
            <motion.p
              key={taglineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-zinc-500 text-sm sm:text-base font-light"
            >
              {taglines[taglineIndex]}
            </motion.p>
          </div>
        </motion.div>

        {/* Credit counter preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-12"
        >
          <div className="bg-zinc-950 border border-zinc-800/50 rounded-lg px-6 py-3 font-mono text-sm">
            <span className="text-zinc-600">CREDITS: </span>
            <span className="text-indigo-400">100</span>
            <span className="text-zinc-700 ml-3">— your starting balance</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={() => router.push("/play")}
            className="group relative bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-8 py-4 font-mono text-sm tracking-wide transition-all hover:shadow-lg hover:shadow-indigo-500/20"
          >
            BEGIN YOUR STORY
            <span className="absolute inset-0 rounded-lg border border-indigo-400/0 group-hover:border-indigo-400/30 transition-colors" />
          </button>

          <p className="text-zinc-700 text-xs font-mono">
            No signup required. Just play.
          </p>

          <button
            onClick={handleNewJourney}
            disabled={resetting}
            className="text-zinc-700 hover:text-zinc-500 text-xs font-mono transition-colors disabled:opacity-40 mt-2"
          >
            {resetting ? "RESETTING TIMELINE..." : "START A NEW JOURNEY"}
          </button>
        </motion.div>

        {/* Story premise teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-20 max-w-lg text-center"
        >
          <p className="text-zinc-600 text-sm leading-relaxed">
            You died. The future brought you back. Now you&apos;re searching for
            home across the multiverse — but every version is almost right and
            never quite. The nameplate on the door is always one letter off.
          </p>
          <p className="text-zinc-700 text-xs mt-4 leading-relaxed">
            A resource-management narrative game. Every choice costs credits.
            Small nudges are cheap. Big changes drain you. When the credits run
            out, you&apos;re alone with your own free thinking.
          </p>
        </motion.div>

        {/* Bottom info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <div className="flex gap-6 text-zinc-700 text-xs font-mono">
            <span>INTERACTIVE FICTION</span>
            <span className="text-zinc-800">•</span>
            <span>AI-POWERED BRANCHING</span>
            <span className="text-zinc-800">•</span>
            <span>RESOURCE MANAGEMENT</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
