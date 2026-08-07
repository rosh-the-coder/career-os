import { useState } from "react";
import flow from "@diagrams/end-to-end-careeros-flow.json";

export function SystemArchitectureScene({ title }: { title?: string }) {
  const nodes = flow.nodes as { id: string; label: string }[];
  const [active, setActive] = useState(0);

  return (
    <section className="section-pin" aria-label="System pipeline">
      <div className="mx-auto w-full max-w-5xl px-4">
        {title ? <p className="mb-8 text-center text-muted">{title}</p> : null}
        <div className="hidden gap-2 overflow-x-auto pb-4 md:flex">
          {nodes.map((n, i) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActive(i)}
              className={`min-w-[7.5rem] rounded-lg border px-3 py-4 text-left text-xs transition ${
                active === i
                  ? "border-signal bg-signal/15 text-signal"
                  : "border-line bg-panel text-muted"
              }`}
            >
              <span className="mono mb-2 block text-[10px] text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              {n.label}
            </button>
          ))}
        </div>
        <ol className="space-y-2 md:hidden">
          {nodes.map((n, i) => (
            <li
              key={n.id}
              className={`rounded-md border px-4 py-3 text-sm ${
                active === i ? "border-signal/40 text-ink" : "border-line text-muted"
              }`}
            >
              {n.label}
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm text-faint">
          Source: docs/project/architecture/SYSTEM_ARCHITECTURE.md
        </p>
      </div>
    </section>
  );
}
