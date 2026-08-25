"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SCORE_WEIGHTS } from "@/lib/types";

const DEMO = {
  total: 84,
  band: "STRONG FIT",
  role: "UX Engineer",
  breakdown: {
    skillsOverlap: 0.86,
    evidenceStrength: 0.78,
    projectRelevance: 0.74,
    seniorityFit: 0.9,
    currentEligibility: 0.88,
    longTermPermit: 0.7,
    locationFit: 0.82,
    salaryFit: 0.75,
    careerAlignment: 0.8,
  },
} as const;

const LABELS: Record<keyof typeof DEMO.breakdown, string> = {
  skillsOverlap: "Skills overlap",
  evidenceStrength: "Evidence strength",
  projectRelevance: "Project relevance",
  seniorityFit: "Seniority fit",
  currentEligibility: "Current eligibility",
  longTermPermit: "Long-term permit",
  locationFit: "Location",
  salaryFit: "Salary",
  careerAlignment: "Career alignment",
};

/** Demo-safe explanations — structural truth, not invented user data. */
const EXPLAIN: Record<keyof typeof DEMO.breakdown, string> = {
  skillsOverlap: "Keywords and skills from your inventory overlap the role’s required set.",
  evidenceStrength: "Matched claims are backed by verified or approved evidence items.",
  projectRelevance: "Selected projects map to themes called out in the job description.",
  seniorityFit: "Role asks for a mid band (≈2–4 years). Inventory falls within that range.",
  currentEligibility: "Work permission flags allow this market without a hard reject.",
  longTermPermit: "Longer-term authorisation is weaker than current eligibility — soft signal.",
  locationFit: "Listing location aligns with your target markets and location rules.",
  salaryFit: "Stated or inferred band vs your soft salary floor — not a hard gate.",
  careerAlignment: "Role direction matches your positioning and target titles.",
};

const RULES = ["eligibility", "seniority", "discipline", "location", "experience"] as const;
const REASONING = ["semantic fit", "evidence relevance", "strengths / gaps", "career alignment"] as const;

export function ScoreExplainer() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<keyof typeof DEMO.breakdown>("seniorityFit");
  const [layersIn, setLayersIn] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setOpen(true);
      setLayersIn(true);
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLayersIn(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const keys = Object.keys(DEMO.breakdown) as (keyof typeof DEMO.breakdown)[];

  return (
    <div className="space-y-12 md:space-y-16">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(240px,320px)_1fr] lg:gap-12">
        <div className="rounded-2xl border border-line bg-panel p-6 md:p-8 lg:sticky lg:top-28">
          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Sample role</div>
          <div className="mt-2 font-display text-2xl text-ink md:text-3xl">{DEMO.role}</div>
          <div className="text-sm text-ink-muted">Design systems · mid band</div>
          <div className="mt-8 flex items-end gap-3">
            <span className="font-display text-7xl leading-none text-accent md:text-8xl">{DEMO.total}</span>
            <span className="mb-2 font-mono text-[11px] uppercase tracking-wider text-accent">
              {DEMO.band}
            </span>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-ink-muted">
            Fit score ≠ hiring probability. It is a decision aid based on your inventory and the role.
          </p>
        </div>

        <div>
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Dimension breakdown
          </div>
          <div className="space-y-2" role="listbox" aria-label="Score dimensions">
            {keys.map((key) => {
              const v = DEMO.breakdown[key];
              const weight = SCORE_WEIGHTS[key as keyof typeof SCORE_WEIGHTS];
              const active = selected === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setSelected(key)}
                  onFocus={() => setSelected(key)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-accent/40 bg-accent/5"
                      : "border-line bg-panel/50 hover:border-line hover:bg-panel",
                  )}
                >
                  <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
                    <span>
                      {LABELS[key]}
                      {weight != null ? (
                        <span className="ml-2 font-mono text-[10px] text-ink-faint">w{weight}</span>
                      ) : null}
                    </span>
                    <span className="font-mono tabular-nums text-ink">{v.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className="h-full rounded-full bg-info/80 transition-all duration-700"
                      style={{ width: open ? `${v * 100}%` : "0%" }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <div
            className="mt-4 rounded-xl border border-line bg-canvas/60 p-4"
            role="status"
            aria-live="polite"
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {LABELS[selected]} — {DEMO.breakdown[selected].toFixed(2)}
            </div>
            <p className="mt-2 text-sm text-ink-muted">{EXPLAIN[selected]}</p>
          </div>
        </div>
      </div>

      {/* Rules → Reasoning → Human */}
      <div ref={layerRef} className="mx-auto max-w-3xl">
        <div className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          How a score is made
        </div>
        <div
          className={cn(
            "space-y-3 transition-all duration-700",
            layersIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-40",
          )}
        >
          <div className="rounded-xl border border-line bg-panel p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Rules</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {RULES.map((r) => (
                <span
                  key={r}
                  className="rounded border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center font-mono text-ink-faint" aria-hidden>
            ↓
          </div>
          <div className="rounded-xl border border-line bg-panel p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-info">Reasoning</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {REASONING.map((r) => (
                <span
                  key={r}
                  className="rounded border border-info/30 bg-info/5 px-2.5 py-1 font-mono text-[11px] text-ink-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center font-mono text-ink-faint" aria-hidden>
            ↓
          </div>
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-accent">Human</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-canvas">
                Apply
              </span>
              <span className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-muted">
                Skip
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              CareerOS helps you decide what deserves your time. It does not predict hiring outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
