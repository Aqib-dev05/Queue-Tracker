import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Register your vehicle",
    body: "Add your registration number, make, model, and chassis details once — no paperwork counter required.",
  },
  {
    n: "02",
    title: "Pull a digital token",
    body: "Get a queue ticket like MC-014 the moment you request one, timestamped to when you'd actually arrive.",
  },
  {
    n: "03",
    title: "Track your position live",
    body: "Watch \"now serving\" move in real time and head over only when your token is close.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-block text-xs uppercase tracking-[0.2em] text-teal font-600 bg-teal/10 px-3 py-1 rounded-full mb-5">
            Digital queue for vehicle MTAG registration
          </p>
          <h1 className="font-display text-5xl leading-[1.05] font-700 tracking-tight">
            Skip the line at the registration counter.
          </h1>
          <p className="mt-5 text-slate text-lg leading-relaxed max-w-md">
            Motorcycles now need an MTAG too — but standing in line for one shouldn&rsquo;t take your
            whole afternoon. Pull a ticket from your phone and watch the counter catch up to you.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/register"
              className="px-5 py-3 rounded-lg bg-teal text-paper font-600 hover:bg-teal-dark transition-colors"
            >
              Pull a ticket
            </Link>
            <Link href="/login" className="px-5 py-3 rounded-lg border border-ink/15 font-600 hover:border-ink/30">
              I already have one
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="ticket-notch relative bg-white rounded-2xl shadow-[0_20px_50px_-16px_rgba(20,36,32,0.35)] border border-ink/10 rotate-2 max-w-sm mx-auto">
            <div className="px-6 pt-6 pb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate">Queue token</p>
                <p className="font-mono text-4xl font-700 tracking-tight mt-1">MC-014</p>
              </div>
              <span className="text-xs font-600 px-2.5 py-1 rounded-full text-amber-dark bg-amber/15">
                Waiting
              </span>
            </div>
            <div className="ticket-perforation text-ink/15 mx-6" />
            <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate">Now serving</p>
                <p className="font-mono font-700 text-lg">009</p>
              </div>
              <div>
                <p className="text-slate">People ahead</p>
                <p className="font-mono font-700 text-lg">5</p>
              </div>
              <div>
                <p className="text-slate">Est. wait</p>
                <p className="font-mono font-700 text-lg">7 min</p>
              </div>
              <div>
                <p className="text-slate">Vehicle</p>
                <p className="font-600">Honda CD 70</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 grid md:grid-cols-3 gap-10">
          {STEPS.map((step) => (
            <div key={step.n}>
              <p className="font-mono text-sm text-teal font-700">{step.n}</p>
              <h3 className="font-display font-700 text-xl mt-2">{step.title}</h3>
              <p className="text-slate mt-2 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <h2 className="font-display text-3xl font-700">Built as a demo of what the counter could look like</h2>
        <p className="text-slate mt-3 max-w-xl mx-auto">
          This is a working prototype — not affiliated with any traffic police department — showing how
          a digital queue could replace physical lines for MTAG registration.
        </p>
      </section>
    </div>
  );
}
