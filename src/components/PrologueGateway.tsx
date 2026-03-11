"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface PrologueGatewayProps {
  credits: number;
  sessionType: "anon" | "user";
}

export default function PrologueGateway({
  credits,
  sessionType,
}: PrologueGatewayProps) {
  const router = useRouter();

  const isAnon = sessionType === "anon";
  const lowCredits = credits < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      className="mt-12 space-y-8"
    >
      <div className="border-t border-zinc-800/50 pt-8" />

      <div className="text-center space-y-3">
        <div className="text-indigo-400/60 text-xs font-mono tracking-[0.3em]">
          THE PROLOGUE ENDS HERE
        </div>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-md mx-auto">
          The multiverse doesn&apos;t pause. Your timeline is still unanchored.
          What comes next requires commitment — and credits.
        </p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {isAnon && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <button
              onClick={() => router.push("/auth/signin")}
              className="w-full group relative bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-4 font-mono text-sm tracking-wide transition-all hover:shadow-lg hover:shadow-indigo-500/20"
            >
              ANCHOR YOUR TIMELINE
              <span className="absolute inset-0 rounded-lg border border-indigo-400/0 group-hover:border-indigo-400/30 transition-colors" />
            </button>
            <p className="text-zinc-700 text-xs font-mono mt-2 text-center">
              Sign in to save your progress. No passwords — just a magic link.
            </p>
          </motion.div>
        )}

        {lowCredits && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <button
              onClick={() => router.push("/shop")}
              className="w-full group border border-zinc-700 hover:border-indigo-600 hover:bg-indigo-950/20 text-zinc-300 hover:text-white rounded-lg px-6 py-4 font-mono text-sm tracking-wide transition-all"
            >
              RECHARGE CREDITS
              <span className="block text-zinc-600 text-xs mt-1 font-normal group-hover:text-zinc-400 transition-colors">
                {credits} credits remaining — the math is the math
              </span>
            </button>
          </motion.div>
        )}

        {!lowCredits && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <button
              onClick={() => router.push("/shop")}
              className="w-full group border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 rounded-lg px-6 py-3 font-mono text-xs tracking-wide transition-all"
            >
              BROWSE CREDIT PACKS
            </button>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="text-center pt-4"
      >
        <p className="text-zinc-800 text-xs font-mono leading-relaxed">
          The subscription hums in your pocket. Patient. Finite.
          <br />
          Made with love by people you haven&apos;t met yet.
        </p>
      </motion.div>
    </motion.div>
  );
}
