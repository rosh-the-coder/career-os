"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    id: "discover",
    num: "01",
    title: "Discover",
    takeaway: "Start with roles worth evaluating.",
  },
  {
    id: "understand",
    num: "02",
    title: "Understand",
    takeaway: "Decide whether this deserves your time.",
  },
  {
    id: "prepare",
    num: "03",
    title: "Prepare",
    takeaway: "Tailor the story without rewriting your history.",
  },
  {
    id: "track",
    num: "04",
    title: "Track",
    takeaway: "Keep the search organised after you apply.",
  },
] as const;

function StageCanvas({ stage }: { stage: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          CareerOS · same job object
        </span>
        <span className="font-mono text-[10px] text-accent">{STAGES[stage].num}</span>
      </div>

      {/* Persistent job header */}
      <div className="border-b border-line bg-panel/60 px-4 py-4 md:px-5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Role</div>
        <div className="mt-1 font-display text-xl text-ink md:text-2xl">UX Engineer</div>
        <div className="mt-1 text-sm text-ink-muted">Contour Systems · Ireland / hybrid</div>
      </div>

      <div className="min-h-[280px] p-4 md:min-h-[320px] md:p-5">
        {stage === 0 ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {["Greenhouse boards", "Lever / Ashby", "Optional Adzuna", "Import URL / JD"].map((s) => (
                <div key={s} className="rounded-lg border border-line bg-panel px-3 py-2.5 text-sm text-ink">
                  {s}
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-dashed border-line px-3 py-2 font-mono text-[11px] text-ink-muted">
              Markets: Ireland · EU · Remote Europe
            </div>
          </div>
        ) : null}

        {stage === 1 ? (
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
              <div className="font-display text-5xl text-accent">84</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-accent">
                Strong fit
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-line bg-panel px-3 py-2">
                <span className="font-mono text-[10px] text-accent">STRENGTH</span>
                <p className="mt-1 text-ink-muted">Design systems + front-end evidence</p>
              </div>
              <div className="rounded-lg border border-line bg-panel px-3 py-2">
                <span className="font-mono text-[10px] text-warn">GAP</span>
                <p className="mt-1 text-ink-muted">No GraphQL production claim</p>
              </div>
              <div className="rounded-lg border border-line bg-panel px-3 py-2">
                <span className="font-mono text-[10px] text-ink-faint">ELIGIBILITY</span>
                <p className="mt-1 text-ink-muted">Current permission · soft location flag</p>
              </div>
            </div>
          </div>
        ) : null}

        {stage === 2 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["Design system shipping", "Usability study", "Prototype metrics"].map((e) => (
                <span
                  key={e}
                  className="rounded-md border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-ink"
                >
                  {e}
                </span>
              ))}
            </div>
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Résumé composition
              </div>
              <div className="mt-2 space-y-1.5 text-sm text-ink-muted">
                <div className="h-2 w-[80%] rounded bg-panel-2" />
                <div className="h-2 w-[60%] rounded bg-panel-2" />
                <div className="h-2 w-[66%] rounded bg-accent/30" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="rounded border border-accent/40 px-2 py-0.5 text-accent">
                  Claims validated
                </span>
                <span className="rounded border border-line px-2 py-0.5 text-ink-muted">
                  ATS keywords 18/22
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {stage === 3 ? (
          <div className="rounded-xl border border-line bg-panel overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-px bg-line font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              <div className="bg-canvas px-3 py-2">Status</div>
              <div className="bg-canvas px-3 py-2">Next</div>
              <div className="bg-canvas px-3 py-2">Materials</div>
            </div>
            <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-px bg-line text-sm">
              <div className="bg-panel px-3 py-3 text-ink">Applied</div>
              <div className="bg-panel px-3 py-3 text-ink-muted">Follow up</div>
              <div className="bg-panel px-3 py-3 text-ink-muted">CV v3</div>
            </div>
            <p className="border-t border-line px-3 py-2 text-xs text-ink-faint">
              Stages update when you do — CareerOS does not auto-apply.
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-line bg-panel/40 px-4 py-3 md:px-5">
        <p className="text-sm text-ink">{STAGES[stage].takeaway}</p>
      </div>
    </div>
  );
}

export function OperatingModelWalkthrough() {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target) return;
        const idx = nodes.indexOf(visible.target as HTMLDivElement);
        if (idx >= 0) setActive(idx);
      },
      { root: null, rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  const jump = useCallback((i: number) => {
    setActive(i);
    stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div>
      {/* Desktop: sticky canvas + scroll stages */}
      <div className="hidden lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
        <nav className="sticky top-28 self-start space-y-1" aria-label="Operating model stages">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(i)}
              className={cn(
                "flex w-full items-baseline gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                i === active ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink",
              )}
              aria-current={i === active ? "step" : undefined}
            >
              <span className="font-mono text-[10px]">{s.num}</span>
              <span className="text-sm font-medium">{s.title}</span>
            </button>
          ))}
        </nav>

        <div ref={scrollerRef} className="relative min-h-[160vh]">
          <div className="sticky top-24 z-10 pb-8">
            <StageCanvas stage={active} />
          </div>
          {/* Invisible scroll markers for stage changes */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-[20vh]" aria-hidden>
            {STAGES.map((s, i) => (
              <div
                key={s.id}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="h-[28vh]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: sequential crops */}
      <div className="space-y-12 lg:hidden">
        {STAGES.map((s, i) => (
          <div key={s.id} id={s.id} className="scroll-mt-24">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              {s.num} {s.title}
            </div>
            <StageCanvas stage={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
