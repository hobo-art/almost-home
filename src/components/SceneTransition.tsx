"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface SceneTransitionProps {
  sceneKey: string;
  children: ReactNode;
  mood?: string;
}

const moodGradients: Record<string, string> = {
  liminal: "from-indigo-950/20 via-transparent to-transparent",
  uncanny: "from-violet-950/20 via-transparent to-transparent",
  tender: "from-blue-950/20 via-transparent to-transparent",
  disorienting: "from-amber-950/10 via-transparent to-transparent",
  dread: "from-red-950/15 via-transparent to-transparent",
  resolution: "from-zinc-800/20 via-transparent to-transparent",
};

export default function SceneTransition({
  sceneKey,
  children,
  mood = "liminal",
}: SceneTransitionProps) {
  const gradient = moodGradients[mood] || moodGradients.liminal;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={`bg-gradient-to-b ${gradient} min-h-[60vh] rounded-lg p-1`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
