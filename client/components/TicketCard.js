"use client";

const STATUS_LABEL = {
  waiting: "Waiting",
  serving: "Now serving",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLOR = {
  waiting: "text-amber-dark bg-amber/15",
  serving: "text-teal bg-teal/15",
  completed: "text-slate bg-slate/10",
  cancelled: "text-rust bg-rust/10",
};

export default function TicketCard({ token, onCancel, rotate = true }) {
  const badge = STATUS_COLOR[token.status] || STATUS_COLOR.waiting;

  return (
    <div
      className={`ticket-notch relative bg-white rounded-2xl shadow-[0_8px_24px_-8px_rgba(20,36,32,0.25)] border border-ink/10 overflow-hidden ${
        rotate ? "-rotate-1 hover:rotate-0 transition-transform" : ""
      }`}
    >
      <div className="px-6 pt-6 pb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate">Queue token</p>
          <p className="font-mono text-4xl font-700 tracking-tight mt-1">{token.tokenCode}</p>
        </div>
        <span className={`text-xs font-600 px-2.5 py-1 rounded-full ${badge}`}>
          {STATUS_LABEL[token.status] || token.status}
        </span>
      </div>

      <div className="ticket-perforation text-ink/15 mx-6" />

      <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate">Now serving</p>
          <p className="font-mono font-700 text-lg">
            {token.nowServing > 0 ? String(token.nowServing).padStart(3, "0") : "—"}
          </p>
        </div>
        <div>
          <p className="text-slate">People ahead of you</p>
          <p className="font-mono font-700 text-lg">{token.peopleAhead}</p>
        </div>
        <div>
          <p className="text-slate">Est. wait</p>
          <p className="font-mono font-700 text-lg">{token.estimatedWaitMinutes} min</p>
        </div>
        <div>
          <p className="text-slate">Vehicle</p>
          <p className="font-600">
            {token.vehicle?.make} {token.vehicle?.model}
          </p>
        </div>
      </div>

      {!token.officeIsOpen && token.status === "waiting" && (
        <p className="px-6 pb-4 text-xs text-rust">
          The counter is closed right now — your token carries over to the next opening.
        </p>
      )}

      {onCancel && (token.status === "waiting" || token.status === "serving") && (
        <div className="px-6 pb-5">
          <button
            onClick={() => onCancel(token.id)}
            className="text-sm text-rust hover:underline underline-offset-2"
          >
            Cancel this token
          </button>
        </div>
      )}
    </div>
  );
}
