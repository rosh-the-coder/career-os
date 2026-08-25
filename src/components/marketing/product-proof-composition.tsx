"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const ANNOTATIONS = [
  { n: "①", label: "Fit score", detail: "Explainable total with dimension breakdown." },
  { n: "②", label: "Evidence coverage", detail: "Inventory items matched to the role." },
  { n: "③", label: "Eligibility", detail: "Hard / soft permission and location signals." },
  { n: "④", label: "Resume action", detail: "Compose only after claim validation." },
] as const;

/** Hierarchical product composition — proof beat, not a feature dump. */
export function ProductProofComposition() {
  const [focus, setFocus] = useState(0);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          CareerOS / live product
        </div>
        <p className="max-w-md text-sm text-ink-muted">
          Dashboard, approve queue, and résumé studio — one workspace.
        </p>
      </div>

      <div className="relative">
        {/* Primary surface */}
        <div className="relative z-10 overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-ink-faint" />
            <span className="h-2 w-2 rounded-full bg-ink-faint" />
            <span className="h-2 w-2 rounded-full bg-ink-faint" />
            <span className="ml-3 font-mono text-[10px] text-ink-faint">job detail · Contour Systems</span>
          </div>
          <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
            <div className="p-5 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl text-ink md:text-3xl">UX Engineer</h3>
                  <p className="mt-1 text-sm text-ink-muted">Contour Systems · Dublin / hybrid</p>
                </div>
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-center transition-colors",
                    focus === 0 ? "border-accent/50 bg-accent/10" : "border-line bg-canvas",
                  )}
                >
                  <div className="font-display text-4xl text-accent">84</div>
                  <div className="font-mono text-[10px] uppercase text-accent">Strong</div>
                </div>
              </div>
              <div
                className={cn(
                  "mt-6 rounded-xl border p-4 transition-colors",
                  focus === 1 ? "border-accent/40 bg-accent/5" : "border-line bg-canvas/50",
                )}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Evidence coverage
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Design system", "Research ops", "Prototype"].map((t) => (
                    <span key={t} className="rounded border border-line px-2 py-1 text-xs text-ink-muted">
                      {t}
                    </span>
                  ))}
                  <span className="font-mono text-xs text-accent">14 matched</span>
                </div>
              </div>
              <div
                className={cn(
                  "mt-3 rounded-xl border p-4 transition-colors",
                  focus === 2 ? "border-accent/40 bg-accent/5" : "border-line bg-canvas/50",
                )}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Eligibility
                </div>
                <p className="mt-1 text-sm text-ink-muted">Current permission OK · soft location note</p>
              </div>
            </div>
            <div className="border-t border-line bg-canvas/40 p-4 lg:border-l lg:border-t-0">
              <div
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  focus === 3 ? "border-accent/40 bg-accent/5" : "border-line bg-panel",
                )}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Resume action
                </div>
                <p className="mt-2 text-sm text-ink">Generate tailored résumé</p>
                <button
                  type="button"
                  tabIndex={-1}
                  className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas"
                >
                  Compose
                </button>
              </div>
              <div className="mt-3 rounded-xl border border-line bg-panel p-3">
                <div className="font-mono text-[10px] text-ink-faint">Approve queue</div>
                <div className="mt-2 space-y-2 text-xs text-ink-muted">
                  <div className="flex justify-between">
                    <span>UX Engineer</span>
                    <span className="text-accent">84</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product Designer</span>
                    <span className="text-accent">79</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping secondary crops — desktop */}
        <div className="pointer-events-none absolute -bottom-6 -right-2 z-20 hidden w-56 rotate-[-2deg] rounded-xl border border-line bg-panel p-3 shadow-xl md:block lg:w-64">
          <div className="font-mono text-[9px] uppercase text-ink-faint">Tracker</div>
          <div className="mt-1 text-xs text-ink">Applied · Follow up Fri</div>
        </div>
      </div>

      {/* Annotations */}
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Product annotations">
        {ANNOTATIONS.map((a, i) => (
          <li key={a.label}>
            <button
              type="button"
              onMouseEnter={() => setFocus(i)}
              onFocus={() => setFocus(i)}
              onClick={() => setFocus(i)}
              className={cn(
                "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                focus === i ? "border-accent/40 bg-accent/5" : "border-line bg-panel/40",
              )}
            >
              <span className="font-mono text-accent">{a.n}</span>
              <span className="ml-2 text-sm font-medium text-ink">{a.label}</span>
              <p className="mt-1 text-xs text-ink-muted">{a.detail}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
