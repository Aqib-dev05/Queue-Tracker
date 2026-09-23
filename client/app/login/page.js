"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="font-display text-3xl font-700">Welcome back</h1>
      <p className="text-slate mt-2">Sign in to check your queue position.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-600">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            className="input"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-600">Password</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={update("password")}
            className="input"
            placeholder="••••••••"
          />
        </label>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-slate mt-6">
        New here?{" "}
        <Link href="/register" className="text-teal font-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
