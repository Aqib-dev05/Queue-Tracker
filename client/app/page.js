"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import LiveBoard from "@/components/LiveBoard";

const STEPS = [
  {
    n: "01",
    title: "Register your vehicle",
    body: "Add your registration number, make, model and chassis details once. No paperwork counter needed.",
  },
  {
    n: "02",
    title: "Pull a token",
    body: "Request a queue token for your vehicle. It is saved to your account and you can see it any time.",
  },
  {
    n: "03",
    title: "Watch the board",
    body: "The number above moves as the counter calls each token. Leave home when yours is close.",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div>
      <section className="mx-auto max-w-5xl px-5 pt-14 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-block text-xs uppercase tracking-[0.2em] text-teal font-600 bg-teal/10 px-3 py-1 rounded-full mb-5">
            MTAG registration queue
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] font-700 tracking-tight">
            Know your turn before you leave home.
          </h1>
          <p className="mt-5 text-slate text-lg leading-relaxed max-w-md">
            Pull a digital token for your vehicle, then follow the counter in real time. No more standing in
            line for hours.
          </p>

          {!loading && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {!user && (
                <>
                  <Link
                    href="/register"
                    className="px-5 py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors"
                  >
                    Pull a token
                  </Link>
                  <Link href="/login" className="px-5 py-3 rounded-lg border border-ink/15 font-600 hover:border-ink/30">
                    Sign in
                  </Link>
                </>
              )}
              {user && user.role !== "admin" && (
                <>
                  <Link
                    href="/dashboard"
                    className="px-5 py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors"
                  >
                    Pull a token
                  </Link>
                  <Link href="/queue" className="px-5 py-3 rounded-lg border border-ink/15 font-600 hover:border-ink/30">
                    My tokens
                  </Link>
                </>
              )}
              {user && user.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-5 py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors"
                >
                  Open admin panel
                </Link>
              )}
            </div>
          )}
        </div>

        <LiveBoard />
      </section>

      <section className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="font-display text-2xl font-700">How it works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-mono text-sm text-teal font-700">{step.n}</p>
                <h3 className="font-display font-700 text-xl mt-2">{step.title}</h3>
                <p className="text-slate mt-2 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
