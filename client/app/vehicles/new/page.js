"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const initialForm = {
  type: "motorcycle",
  registrationNumber: "",
  make: "",
  model: "",
  color: "",
  engineNumber: "",
  chassisNumber: "",
};

export default function NewVehiclePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.createVehicle(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-md px-5 py-12">
      <h1 className="font-display text-3xl font-700">Register a vehicle</h1>
      <p className="text-slate mt-2">These details are used to generate your MTAG queue token.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-600">Vehicle type</span>
          <select value={form.type} onChange={update("type")} className="input">
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
            <option value="rickshaw">Rickshaw</option>
          </select>
        </label>

        <Field label="Registration number">
          <input required value={form.registrationNumber} onChange={update("registrationNumber")} className="input" placeholder="ICT-1234" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Make">
            <input required value={form.make} onChange={update("make")} className="input" placeholder="Honda" />
          </Field>
          <Field label="Model">
            <input required value={form.model} onChange={update("model")} className="input" placeholder="CD 70" />
          </Field>
        </div>
        <Field label="Color">
          <input required value={form.color} onChange={update("color")} className="input" placeholder="Red" />
        </Field>
        <Field label="Engine number">
          <input required value={form.engineNumber} onChange={update("engineNumber")} className="input" />
        </Field>
        <Field label="Chassis number">
          <input required value={form.chassisNumber} onChange={update("chassisNumber")} className="input" />
        </Field>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save vehicle"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-600">{label}</span>
      {children}
    </label>
  );
}
