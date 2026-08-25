"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TAG_PILL_CLASS, colorForStatus, colorForNextAction } from "@/lib/applications/constants";

/** Product-accurate statuses from the applications tracker. */
const LIFECYCLE = ["Applied", "Interviewed", "Follow up", "Offer"] as const;

export function ApplicationLifecycleDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStage(LIFECYCLE.length - 1);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const p = Math.min(
          LIFECYCLE.length - 1,
          Math.floor(entry.intersectionRatio * LIFECYCLE.length),
        );
        setStage(p);
      },
      { threshold: [0.2, 0.4, 0.6, 0.8] },
    );
    obs.observe(el);

    const id = window.setInterval(() => {
      setStage((s) => (s + 1) % LIFECYCLE.length);
    }, 2200);
    return () => {
      obs.disconnect();
      window.clearInterval(id);
    };
  }, []);

  const status = LIFECYCLE[stage] === "Follow up" ? "Applied" : LIFECYCLE[stage];
  const next =
    LIFECYCLE[stage] === "Follow up"
      ? "Follow up"
      : LIFECYCLE[stage] === "Interviewed"
        ? "Prepare Interview"
        : LIFECYCLE[stage] === "Offer"
          ? "Decide"
          : "Waiting";

  return (
    <div ref={ref} className="mt-10">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {LIFECYCLE.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] transition-all duration-300",
                i === stage
                  ? TAG_PILL_CLASS[
                      label === "Follow up" ? colorForNextAction("Follow up") : colorForStatus(status)
                    ]
                  : "bg-panel-2 text-ink-faint",
              )}
            >
              {label}
            </span>
            {i < LIFECYCLE.length - 1 ? (
              <span className="font-mono text-[10px] text-ink-faint">↓</span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
        <div className="grid gap-px bg-line md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {[
            ["Role", "UX Engineer"],
            ["Company", "Contour Systems"],
            ["Résumé", "CV v3"],
            ["Applied", "12 Mar 2026"],
            ["Next action", next],
          ].map(([k, v]) => (
            <div key={k} className="bg-panel px-4 py-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{k}</div>
              <div className="mt-1 text-sm text-ink">{v}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-[11px]",
              TAG_PILL_CLASS[colorForStatus(status)],
            )}
          >
            {status}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Updated by you · Tracked by CareerOS
          </span>
        </div>
      </div>
    </div>
  );
}
