"use client";

import { useCallback, useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/auth-context";
import { useQueueStatus } from "@/lib/useQueueStatus";
import { api } from "@/lib/api";
import LiveBoard from "@/components/LiveBoard";
import { STATUS_COLOR, STATUS_LABEL } from "@/components/TicketCard";

export default function AdminPage() {
  const user = useRequireAuth("admin");
  const { status } = useQueueStatus();
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .adminQueue()
      .then(({ tokens }) => setTokens(tokens))
      .catch((err) => setError(err.message));
  }, []);

  // Reload the list on open, and whenever the numbers change.
  const nowServing = status ? status.nowServing : null;
  const lastIssued = status ? status.lastIssued : null;
  useEffect(() => {
    if (user) load();
  }, [user, nowServing, lastIssued, load]);

  async function callNext() {
    setBusy(true);
    setError("");
    try {
      await api.adminNext();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  const nothingWaiting = !status || status.nowServing >= status.lastIssued;
  const current = tokens.find((t) => status && t.sequenceNumber === status.nowServing);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl font-700">Counter control</h1>
      <p className="text-slate mt-1">Call the next token. Everyone watching sees the change instantly.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <LiveBoard />
          <button
            onClick={callNext}
            disabled={busy || nothingWaiting}
            className="mt-5 w-full py-4 rounded-xl bg-teal text-paper text-lg font-600 hover:bg-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nothingWaiting ? "No tokens waiting" : busy ? "Calling…" : `Call next token (${String(status.nowServing + 1).padStart(3, "0")})`}
          </button>
          {error && <p className="text-sm text-rust mt-3">{error}</p>}

          {current && (
            <div className="mt-5 bg-white border border-ink/10 rounded-xl px-5 py-4 text-sm">
              <p className="text-slate">At the counter now</p>
              <p className="font-mono font-700 text-lg mt-1">{current.tokenCode}</p>
              <p className="mt-1">
                {current.owner?.fullName} · {current.owner?.phone}
              </p>
              <p className="text-slate">
                {current.vehicle?.make} {current.vehicle?.model} · {current.vehicle?.registrationNumber}
              </p>
              {current.status === "cancelled" && (
                <p className="text-rust mt-2">This person cancelled. Call the next token.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/10">
            <h2 className="font-display font-700 text-lg">Today&rsquo;s tokens</h2>
          </div>
          {tokens.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate text-center">No tokens have been pulled yet today.</p>
          ) : (
            <ul className="divide-y divide-ink/10 max-h-[28rem] overflow-y-auto">
              {tokens.map((t) => (
                <li
                  key={t.id}
                  className={`px-5 py-3 flex items-center justify-between gap-3 ${t.status === "serving" ? "bg-teal/5" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="font-mono font-700">{t.tokenCode}</p>
                    <p className="text-xs text-slate truncate">
                      {t.owner?.fullName} · {t.vehicle?.registrationNumber}
                    </p>
                  </div>
                  <span className={`text-xs font-600 px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
