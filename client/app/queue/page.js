"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import TicketCard from "@/components/TicketCard";

export default function QueuePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tokens, setTokens] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const refresh = useCallback(() => {
    if (!user) return;
    api
      .listTokens()
      .then(({ tokens }) => setTokens(tokens))
      .finally(() => setFetching(false));
  }, [user]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20000); // live-ish position updates
    return () => clearInterval(id);
  }, [refresh]);

  async function handleCancel(id) {
    await api.cancelToken(id);
    refresh();
  }

  if (loading || !user) return null;

  const active = tokens.filter((t) => t.status === "waiting" || t.status === "serving");
  const past = tokens.filter((t) => t.status !== "waiting" && t.status !== "serving");

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700">My tokens</h1>
          <p className="text-slate mt-1">Positions refresh automatically every 20 seconds.</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-ink/15 font-600 hover:border-ink/30">
          Pull another
        </Link>
      </div>

      {fetching && <p className="text-slate mt-8">Loading…</p>}

      {!fetching && active.length === 0 && (
        <div className="border border-dashed border-ink/20 rounded-xl p-10 text-center mt-8">
          <p className="font-600">No active tokens</p>
          <p className="text-slate text-sm mt-1">Pull a token from your dashboard to join the queue.</p>
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        {active.map((t) => (
          <TicketCard key={t.id} token={t} onCancel={handleCancel} />
        ))}
      </div>

      {past.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-700 mb-4">History</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {past.map((t) => (
              <TicketCard key={t.id} token={t} rotate={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
