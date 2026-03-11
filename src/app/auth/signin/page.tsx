"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/play");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-indigo-400 text-sm font-mono animate-pulse tracking-widest">
          CHECKING TIMELINE...
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-indigo-400 text-sm font-mono animate-pulse tracking-widest">
          TIMELINE ANCHORED — REDIRECTING...
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/play" });
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-indigo-400 text-sm font-mono mb-4 tracking-widest">
            SIGNAL SENT
          </div>
          <h1 className="text-2xl text-white mb-4 font-light">
            A coded message has been sent to your timeline.
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Check your email. Click the link. The future is waiting.
          </p>
          <p className="text-zinc-700 text-xs mt-6">
            Check your spam folder — new signals sometimes get intercepted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-indigo-400 text-sm font-mono mb-4 tracking-widest text-center">
          ANCHOR YOUR TIMELINE
        </div>
        <h1 className="text-2xl text-white mb-2 font-light text-center">
          The future needs to know where to find you.
        </h1>
        <p className="text-zinc-500 text-sm mb-8 text-center leading-relaxed">
          Enter your email. We&apos;ll send a link — a coded message between
          timelines. No passwords. No friction. Just connection.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg px-4 py-3 transition-colors font-mono text-sm tracking-wide"
          >
            {loading ? "TRANSMITTING..." : "SEND SIGNAL"}
          </button>
        </form>

        <p className="text-zinc-700 text-xs mt-6 text-center">
          Your story progress will be preserved. Nothing is lost.
        </p>
      </div>
    </div>
  );
}
