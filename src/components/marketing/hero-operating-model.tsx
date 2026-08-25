"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CYCLE_MS = 7000;
const PHASES = [
  { id: "job", at: 0 },
  { id: "score", at: 0.18 },
  { id: "evidence", at: 0.42 },
  { id: "resume", at: 0.65 },
  { id: "human", at: 0.82 },
] as const;

/** Compact CareerOS operational sequence for the hero. */
export function HeroOperatingModel() {
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) {
      setT(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT(((now - start) % CYCLE_MS) / CYCLE_MS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phase = (id: (typeof PHASES)[number]["id"]) => {
    if (reduced) return true;
    const p = PHASES.find((x) => x.id === id)!;
    return t >= p.at;
  };

  const scoreShown = phase("score");
  const evidenceShown = phase("evidence");
  const resumeShown = phase("resume");
  const humanShown = phase("human");

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_0_0_1px_rgba(42,42,36,0.5)]"
      aria-label="CareerOS operating sequence: job to human review"
    >
      <div className="border-b border-line px-4 py-2.5 md:px-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          <span className="text-accent">◈</span>
          CareerOS · job lifecycle
        </div>
      </div>

      <div className="space-y-0 p-4 md:p-5">
        {/* Job */}
        <div
          className={cn(
            "rounded-xl border border-line bg-canvas/70 p-4 transition-all duration-500",
            phase("job") ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Imported role</div>
          <div className="mt-1.5 font-display text-2xl text-ink">Product Designer</div>
          <div className="mt-1 text-sm text-ink-muted">Public ATS · Remote EU · Mid band</div>
        </div>

        <div className="flex justify-center py-2 font-mono text-[10px] text-ink-faint" aria-hidden>
          ↓
        </div>

        {/* Score */}
        <div
          className={cn(
            "rounded-xl border border-line bg-canvas/70 p-4 transition-all duration-500",
            scoreShown ? "opacity-100" : "opacity-35",
          )}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Fit</div>
          <div className="mt-1 flex items-end gap-3">
            <span
              className={cn(
                "font-display text-5xl tabular-nums text-accent transition-opacity duration-500",
                scoreShown ? "opacity-100" : "opacity-40",
              )}
            >
              {scoreShown ? "84" : "··"}
            </span>
            <span className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              Strong fit
            </span>
          </div>
        </div>

        <div className="flex justify-center py-2 font-mono text-[10px] text-ink-faint" aria-hidden>
          ↓
        </div>

        {/* Evidence */}
        <div
          className={cn(
            "rounded-xl border border-line bg-canvas/70 px-4 py-3 transition-all duration-500",
            evidenceShown ? "opacity-100" : "opacity-35",
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              Evidence matched
            </span>
            <span className="font-mono text-sm text-ink">
              {evidenceShown ? "14" : "—"}
              <span className="text-ink-faint"> items</span>
            </span>
          </div>
        </div>

        <div className="flex justify-center py-2 font-mono text-[10px] text-ink-faint" aria-hidden>
          ↓
        </div>

        {/* Resume + human */}
        <div
          className={cn(
            "rounded-xl border border-line bg-canvas/70 p-4 transition-all duration-500",
            resumeShown ? "opacity-100" : "opacity-35",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className={cn(resumeShown ? "text-accent" : "text-ink-faint")}>
              Résumé ready for review
            </span>
            <span className="text-ink-faint">·</span>
            <span
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                humanShown
                  ? "border-warn/40 bg-warn/10 text-warn"
                  : "border-line text-ink-faint",
              )}
            >
              Human review
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-faint">You approve claims. You submit the application.</p>
        </div>
      </div>
    </div>
  );
}
