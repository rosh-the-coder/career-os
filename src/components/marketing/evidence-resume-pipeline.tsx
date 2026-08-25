"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const INVENTORY = ["Experience", "Projects", "Skills", "Metrics", "Evidence"] as const;

/** Evidence → selection → validation → résumé preview. */
export function EvidenceResumePipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(4);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const ratio = entry.intersectionRatio;
        if (ratio > 0.7) setStep(4);
        else if (ratio > 0.55) setStep(3);
        else if (ratio > 0.4) setStep(2);
        else if (ratio > 0.25) setStep(1);
        else setStep(0);
      },
      { threshold: [0.2, 0.3, 0.45, 0.6, 0.75] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-8 md:space-y-10">
      {/* Inventory */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Career inventory
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {INVENTORY.map((item, i) => (
            <span
              key={item}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-all duration-500",
                step >= 1 && i < 3
                  ? "border-accent/40 bg-accent/10 text-ink"
                  : "border-line bg-panel text-ink-muted",
              )}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="font-mono text-[10px] text-ink-faint" aria-hidden>
        ↓ match against
      </div>

      <div
        className={cn(
          "rounded-xl border border-line bg-panel px-4 py-3 transition-opacity duration-500",
          step >= 1 ? "opacity-100" : "opacity-40",
        )}
      >
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          Job requirements
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Design systems · usability research · front-end collaboration · mid seniority
        </p>
      </div>

      <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
        {["Select", "Compose", "Validate"].map((label, i) => (
          <span
            key={label}
            className={cn(
              "rounded border px-2.5 py-1 transition-colors duration-500",
              step >= 2 + i ? "border-accent/40 text-accent" : "border-line text-ink-faint",
            )}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-xl border border-accent/40 bg-accent/5 p-5 transition-all duration-500",
              step >= 3 ? "opacity-100" : "opacity-50",
            )}
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
              ✓ Verified
            </div>
            <p className="mt-2 font-display text-lg text-ink">
              Grew YouTube subscribers 2.9K → 8.2K
            </p>
            <p className="mt-2 text-xs text-ink-muted">Metric linked to approved evidence</p>
          </div>
          <div
            className={cn(
              "relative rounded-xl border border-danger/40 bg-danger/5 p-5 transition-all duration-500",
              step >= 3 ? "opacity-100" : "opacity-50",
            )}
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-danger">
              × No evidence
            </div>
            <p className="mt-2 font-display text-lg text-ink line-through decoration-danger/60">
              Led enterprise AI strategy
            </p>
            <p className="mt-2 text-xs text-ink-muted">Blocked from résumé composition</p>
            {step >= 4 ? (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <span className="rotate-[-8deg] rounded border-2 border-danger/50 bg-canvas/80 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-danger">
                  Not exported
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-line bg-canvas p-5 transition-all duration-700 md:p-6",
            step >= 4 ? "opacity-100" : "opacity-40",
          )}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Résumé preview · DOCX / PDF
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-3 w-[40%] rounded bg-panel-2" />
            <div className="h-2 w-full rounded bg-panel-2" />
            <div className="h-2 w-[92%] rounded bg-panel-2" />
            <div className="mt-4 border-t border-line pt-3">
              <div className="font-mono text-[10px] text-ink-faint">Selected bullet</div>
              <p className="mt-1 text-sm text-ink">
                Grew YouTube subscribers 2.9K → 8.2K through weekly shipping and community loops.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-xl text-sm text-ink-muted">
        CareerOS can improve how your experience is presented. It does not invent experience you do
        not have.
      </p>
    </div>
  );
}
