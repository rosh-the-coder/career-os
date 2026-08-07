import { useState } from "react";
import timeline from "@diagrams/development-timeline.json";

export function MetricCallout({
  kind,
  title,
  disclaimer,
}: {
  kind: "conceptual20" | "timeline";
  title: string;
  disclaimer?: string;
}) {
  const [showHuman, setShowHuman] = useState(true);
  const nodes = timeline.nodes as { id: string; label: string }[];

  if (kind === "conceptual20") {
    return (
      <section className="section-pin" aria-label="Valuable work split">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h3 className="display text-3xl text-ink md:text-5xl">{title}</h3>
          {disclaimer ? <p className="mt-4 text-sm text-faint">{disclaimer}</p> : null}
          <div className="mt-10 flex h-16 overflow-hidden rounded-lg border border-line">
            <button
              type="button"
              onClick={() => setShowHuman(false)}
              className="flex basis-[80%] items-center justify-center bg-panel text-xs text-faint"
            >
              Assist / automate
            </button>
            <button
              type="button"
              onClick={() => setShowHuman(true)}
              className="flex basis-[20%] items-center justify-center bg-signal/25 text-xs text-signal"
            >
              ~20%
            </button>
          </div>
          <p className="mt-6 text-muted" aria-live="polite">
            {showHuman ? "Judgment · Truthful materials" : "Logistics the system can assist."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pin" aria-label="Development timeline">
      <div className="mx-auto max-w-3xl px-4">
        <h3 className="display mb-10 text-center text-3xl text-ink">{title}</h3>
        <ol className="space-y-3">
          {nodes.map((n) => (
            <li key={n.id} className="rounded-md border border-line bg-panel/40 px-4 py-3 text-sm text-muted">
              {n.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
