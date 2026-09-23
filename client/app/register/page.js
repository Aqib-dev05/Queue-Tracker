"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const initialForm = { fullName: "", cnic: "", email: "", phone: "", password: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
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
      await register(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="font-display text-3xl font-700">Create your account</h1>
      <p className="text-slate mt-2">One account covers every vehicle you register.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Full name">
          <input
            required
            value={form.fullName}
            onChange={update("fullName")}
            className="input"
            placeholder="Sahibzada Hasanat"
          />
        </Field>
        <Field label="CNIC" hint="Format: 12345-1234567-1">
          <input
            required
            value={form.cnic}
            onChange={update("cnic")}
            className="input"
            placeholder="12345-1234567-1"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone">
          <input
            required
            value={form.phone}
            onChange={update("phone")}
            className="input"
            placeholder="03xx-xxxxxxx"
          />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={update("password")}
            className="input"
            placeholder="••••••••"
          />
        </Field>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-slate mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-teal font-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-600">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate mt-1">{hint}</span>}
    </label>
  );
}
