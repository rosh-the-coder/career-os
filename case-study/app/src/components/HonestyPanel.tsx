import { useState } from "react";

export function HonestyPanel({
  mode,
  isLine,
  isntLine,
}: {
  mode: "anti-metric" | "scope";
  isLine?: string;
  isntLine?: string;
}) {
  const [stamped, setStamped] = useState(false);

  if (mode === "anti-metric") {
    return (
      <section className="section-pin" aria-label="Refuse fake outcomes">
        <div className="mx-auto max-w-xl px-4 text-center">
          <button
            type="button"
            onClick={() => setStamped(true)}
            className={`relative w-full rounded-xl border border-line bg-panel p-10 transition ${
              stamped ? "opacity-40" : ""
            }`}
          >
            <p className="mono text-sm text-faint">Invented lift chart</p>
            <p className="display mt-4 text-5xl text-muted">+40%</p>
            <p className="mt-2 text-sm text-faint">interviews</p>
            {stamped ? (
              <span
                className="absolute inset-0 flex items-center justify-center text-3xl font-semibold tracking-widest text-signal"
                role="alert"
              >
                NO EVIDENCE
              </span>
            ) : null}
          </button>
          <p className="mt-6 text-sm text-muted">Tap to attempt inflate — rejected.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pin" aria-label="Scope">
      <div className="mx-auto grid max-w-4xl gap-6 px-4 md:grid-cols-2">
        <div className="rounded-xl border border-signal/30 bg-signal/5 p-6">
          <p className="mono text-xs tracking-wider text-signal uppercase">Is</p>
          <p className="mt-4 text-ink">{isLine}</p>
        </div>
        <div className="rounded-xl border border-line bg-panel/40 p-6">
          <p className="mono text-xs tracking-wider text-faint uppercase">Isn&apos;t</p>
          <p className="mt-4 text-muted">{isntLine}</p>
        </div>
      </div>
    </section>
  );
}
