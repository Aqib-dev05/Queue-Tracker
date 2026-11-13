"use client";

import { useQueueStatus } from "@/lib/useQueueStatus";

const pad = (n) => String(n).padStart(3, "0");

// The counter display: which token is being called right now.
export default function LiveBoard() {
  const { status, live } = useQueueStatus();
  const serving = status ? status.nowServing : null;

  return (
    <div className="rounded-2xl bg-ink text-paper shadow-[0_24px_60px_-20px_rgba(20,36,32,0.6)] overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 text-xs uppercase tracking-[0.22em] text-paper/60">
        <span>Now serving</span>
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${live ? "bg-amber animate-pulse" : "bg-paper/30"}`} />
          {live ? "Live" : "Connecting"}
        </span>
      </div>

      <div className="px-6 py-6 sm:py-8">
        <p
          key={serving}
          className="led tick font-mono font-700 text-amber text-7xl sm:text-8xl tracking-tight leading-none"
          aria-live="polite"
        >
          {serving === null ? "···" : serving > 0 ? pad(serving) : "---"}
        </p>
        <p className="mt-3 text-sm text-paper/60 h-5">
          {serving === 0 && "The counter hasn't called anyone yet today."}
        </p>
      </div>

      <div className="grid grid-cols-2 border-t border-paper/10 text-sm">
        <div className="px-6 py-4 border-r border-paper/10">
          <p className="text-paper/60">Last token issued</p>
          <p className="font-mono font-700 text-xl mt-1">{status && status.lastIssued > 0 ? pad(status.lastIssued) : "---"}</p>
        </div>
        <div className="px-6 py-4">
          <p className="text-paper/60">People waiting</p>
          <p className="font-mono font-700 text-xl mt-1">{status ? status.waiting : "–"}</p>
        </div>
      </div>
    </div>
  );
}
