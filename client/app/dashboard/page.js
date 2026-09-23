"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .listVehicles()
      .then(({ vehicles }) => setVehicles(vehicles))
      .finally(() => setFetching(false));
  }, [user]);

  async function pullToken(vehicleId) {
    setBusyId(vehicleId);
    setError("");
    try {
      await api.issueToken(vehicleId);
      router.push("/queue");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-700">Your vehicles</h1>
          <p className="text-slate mt-1">Pull a queue token for any registered vehicle.</p>
        </div>
        <Link
          href="/vehicles/new"
          className="px-4 py-2 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors whitespace-nowrap"
        >
          + Add vehicle
        </Link>
      </div>

      {error && <p className="text-sm text-rust mt-4">{error}</p>}

      <div className="mt-8 space-y-4">
        {fetching && <p className="text-slate">Loading…</p>}

        {!fetching && vehicles.length === 0 && (
          <div className="border border-dashed border-ink/20 rounded-xl p-10 text-center">
            <p className="font-600">No vehicles yet</p>
            <p className="text-slate text-sm mt-1">Add your motorcycle or car to pull a queue token.</p>
            <Link
              href="/vehicles/new"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark"
            >
              Register a vehicle
            </Link>
          </div>
        )}

        {vehicles.map((v) => (
          <div
            key={v._id}
            className="bg-white border border-ink/10 rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-600">
                {v.make} {v.model} · <span className="text-slate font-400">{v.color}</span>
              </p>
              <p className="font-mono text-sm text-slate mt-0.5">{v.registrationNumber}</p>
            </div>
            <button
              onClick={() => pullToken(v._id)}
              disabled={busyId === v._id}
              className="px-4 py-2 rounded-lg border border-teal text-teal font-600 hover:bg-teal hover:text-paper transition-colors disabled:opacity-60"
            >
              {busyId === v._id ? "Pulling…" : "Pull a token"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
