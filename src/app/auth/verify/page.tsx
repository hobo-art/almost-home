export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-indigo-400 text-sm font-mono mb-4 tracking-widest animate-pulse">
          SIGNAL IN TRANSIT
        </div>
        <h1 className="text-2xl text-white mb-4 font-light">
          Check your email.
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
          A link has been sent — a coded message from one timeline to another.
          Click it to anchor your position in the multiverse.
        </p>
        <div className="text-zinc-700 text-xs">
          The link expires in 24 hours. Like most good things.
        </div>
      </div>
    </div>
  );
}
