"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const PACKS = [
  {
    id: "pack-200",
    credits: 200,
    price: "$3",
    label: "200 credits",
    description: "A modest signal boost. Enough for careful exploration.",
  },
  {
    id: "pack-500",
    credits: 500,
    price: "$6",
    label: "500 credits",
    description: "Room to breathe. Room to make mistakes.",
  },
  {
    id: "pack-1500",
    credits: 1500,
    price: "$15",
    label: "1500 credits",
    description: "The full frequency. Explore every branch, every what-if.",
  },
];

function ShopContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const success = searchParams.get("success");
  const newCredits = searchParams.get("credits");

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits))
      .catch(() => {});
  }, []);

  const handlePurchase = async (packId: string) => {
    setLoading(packId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="text-indigo-400 text-sm font-mono mb-4 tracking-widest">
          SIGNAL BOOST
        </div>
        <h1 className="text-3xl font-light mb-3">Recharge Your Subscription</h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-md mx-auto">
          The future built you a tool. It runs on credits. Every choice costs
          something — that&apos;s the math of love made finite.
        </p>

        {credits !== null && (
          <div className="mt-4 text-zinc-600 text-xs font-mono">
            Current balance: {credits} credits
          </div>
        )}
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 border border-indigo-800/50 bg-indigo-950/30 rounded-lg text-center"
        >
          <div className="text-indigo-400 text-sm font-mono mb-1">
            SIGNAL RECEIVED
          </div>
          <p className="text-zinc-400 text-sm">
            {newCredits} credits added to your subscription. The counter hums
            — louder now.
          </p>
          <button
            onClick={() => router.push("/play")}
            className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-mono underline"
          >
            Return to the story
          </button>
        </motion.div>
      )}

      <div className="space-y-4">
        {PACKS.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-zinc-800 hover:border-indigo-800/50 rounded-lg p-6 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white text-lg font-light">
                    {pack.label}
                  </span>
                  <span className="text-indigo-400 font-mono text-sm">
                    {pack.price}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">{pack.description}</p>
              </div>
              <button
                onClick={() => handlePurchase(pack.id)}
                disabled={loading !== null}
                className="shrink-0 bg-zinc-900 hover:bg-indigo-600 border border-zinc-700 hover:border-indigo-500 text-zinc-300 hover:text-white rounded-lg px-5 py-2.5 font-mono text-sm transition-all disabled:opacity-40"
              >
                {loading === pack.id ? "..." : "PURCHASE"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => router.push("/play")}
          className="text-zinc-600 hover:text-zinc-400 text-sm font-mono transition-colors"
        >
          ← Back to the story
        </button>
      </div>

      <div className="mt-16 text-center text-zinc-800 text-xs font-mono leading-relaxed">
        <p>Payments processed securely via Stripe.</p>
        <p>Credits are non-refundable. The math is the math.</p>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-indigo-400 text-sm font-mono animate-pulse tracking-widest">
              LOADING FREQUENCIES...
            </div>
          </div>
        }
      >
        <ShopContent />
      </Suspense>
    </div>
  );
}
