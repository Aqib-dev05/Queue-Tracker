"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b border-ink/10 bg-paper/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-700 text-lg tracking-tight">
          <span className="grid place-items-center w-8 h-8 rounded-md bg-teal text-paper font-mono text-sm font-700">
            #
          </span>
          QueueSkip
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {!loading && user && (
            <>
              <Link href="/dashboard" className="text-ink/80 hover:text-ink transition-colors">
                Dashboard
              </Link>
              <Link href="/queue" className="text-ink/80 hover:text-ink transition-colors">
                My tokens
              </Link>
              <span className="hidden sm:inline text-slate">{user.fullName.split(" ")[0]}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md border border-ink/15 hover:border-rust hover:text-rust transition-colors"
              >
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="text-ink/80 hover:text-ink transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-md bg-teal text-paper hover:bg-teal-dark transition-colors"
              >
                Get a token
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
