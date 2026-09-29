export function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-signal text-ink" role="status" aria-live="polite">
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-ink" />
        <div className="absolute inset-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        <div className="absolute inset-[42%] bg-ink" />
      </div>
      <div className="text-center">
        <p className="font-display text-3xl font-bold uppercase tracking-tight">Loading</p>
        <p className="mt-2 monofont text-[10px] uppercase tracking-[0.35em]">
          decrypting payload<span className="animate-blink">_</span>
        </p>
      </div>
    </div>
  );
}

export default Loading;
