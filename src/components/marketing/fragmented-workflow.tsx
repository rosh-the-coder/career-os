"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const NODES = [
  { label: "Job board", handoff: "COPY" },
  { label: "ChatGPT", handoff: "REWRITE" },
  { label: "Résumé tool", handoff: "EXPORT" },
  { label: "ATS tool", handoff: "CHECK" },
  { label: "Tracker", handoff: "UPDATE" },
  { label: "Application", handoff: "REPEAT" },
] as const;

/** Fragmented multi-tool workflow → CareerOS consolidation. */
export function FragmentedWorkflow() {
  const ref = useRef<HTMLDivElement>(null);
  const [consolidated, setConsolidated] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) {
      setConsolidated(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          setConsolidated(true);
        }
      },
      { threshold: [0.35, 0.55] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-10">
      <div
        className={cn(
          "grid gap-2 transition-all duration-700 md:grid-cols-[1fr_auto]",
          consolidated && !reduced ? "md:opacity-40 md:blur-[1px]" : "opacity-100",
        )}
        aria-hidden={consolidated}
      >
        <ol className="space-y-0">
          {NODES.map((node, i) => (
            <li key={node.label} className="relative">
              <div className="flex items-stretch gap-3">
                <div className="flex w-8 flex-col items-center">
                  <div className="mt-3 h-2 w-2 rounded-full bg-ink-faint" />
                  {i < NODES.length - 1 ? (
                    <div className="w-px flex-1 bg-line" />
                  ) : null}
                </div>
                <div className="mb-1 flex-1 rounded-lg border border-line bg-panel px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    Tool {i + 1}
                  </div>
                  <div className="text-sm font-medium text-ink">{node.label}</div>
                </div>
              </div>
              {i < NODES.length - 1 ? (
                <div className="ml-11 py-1 font-mono text-[10px] tracking-[0.2em] text-warn">
                  ↓ {node.handoff}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div
        className={cn(
          "mt-8 flex flex-col items-start gap-2 transition-all duration-700",
          consolidated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-60",
        )}
      >
        <div className="rounded-2xl border border-accent/40 bg-accent/10 px-6 py-4">
          <div className="font-display text-3xl text-accent md:text-4xl">CareerOS</div>
          <div className="mt-1 text-sm text-ink-muted">One operating model.</div>
        </div>
        <p className="max-w-md text-xs text-ink-faint">
          Import external opportunities or discover supported public listings. Not a LinkedIn scraper.
        </p>
      </div>
    </div>
  );
}
