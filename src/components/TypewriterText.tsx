"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterText({
  text,
  speed = 30,
  onComplete,
  className = "",
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    setSkipped(false);
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    if (!isComplete && !skipped) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsComplete(true);
      setSkipped(true);
      onComplete?.();
    }
  };

  const paragraphs = displayedText.split("\n\n");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
      onClick={handleSkip}
    >
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className="mb-4 last:mb-0 leading-relaxed"
        >
          {paragraph}
          {i === paragraphs.length - 1 && !isComplete && (
            <span className="inline-block w-2 h-5 bg-indigo-400 ml-0.5 animate-pulse" />
          )}
        </p>
      ))}
      {!isComplete && (
        <div className="absolute bottom-0 right-0 text-zinc-700 text-xs font-mono">
          click to skip
        </div>
      )}
    </motion.div>
  );
}
