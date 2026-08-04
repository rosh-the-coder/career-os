"use client";

import { useState } from "react";
import type { ResumeIntelligenceBundle } from "@/lib/resume-intelligence";

type ReviewStatus = "pending" | "accepted" | "rejected";

/**
 * Human Review for Resume Intelligence — shows Original / Suggested / Reason.
 * Never auto-applies rewrites after lint; Accept / Reject stays with the human.
 */
export function IntelligenceReviewPanel(props: {
  intelligence: ResumeIntelligenceBundle | null;
}) {
  const intel = props.intelligence;
  const [decisions, setDecisions] = useState<Record<number, ReviewStatus>>({});

  if (!intel) return null;

  const { atsScore, lint, bulletSuggestions, strategy, humanReviewRequired } = intel;

  return (
    <div className="space-y-3 rounded-lg border border-line bg-panel/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg">Resume Intelligence</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded border border-line px-2 py-0.5 uppercase tracking-wide">
            {strategy.mode} mode
          </span>
          {humanReviewRequired ? (
            <span className="rounded border border-warn/40 bg-warn/10 px-2 py-0.5 text-warn">
              Review recommended
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded border border-line/70 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">ATS score</div>
          <div className="font-mono text-lg">{atsScore.total}/100</div>
        </div>
        <div className="rounded border border-line/70 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">Engineering</div>
          <div className="font-mono text-lg">{atsScore.dimensions.engineeringSignal}/10</div>
        </div>
        <div className="rounded border border-line/70 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">Bullet quality</div>
          <div className="font-mono text-lg">{atsScore.dimensions.bulletQuality}/10</div>
        </div>
        <div className="rounded border border-line/70 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">Lint</div>
          <div className="font-mono text-lg">{lint.length}</div>
        </div>
      </div>

      {atsScore.explanation.length ? (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
          {atsScore.explanation.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      {atsScore.improvements.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">Before export</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
            {atsScore.improvements.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {lint.length ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-ink-muted">Lint warnings ({lint.length})</summary>
          <ul className="mt-2 space-y-1 pl-1 text-ink-muted">
            {lint.slice(0, 12).map((w, i) => (
              <li key={`${w.code}-${i}`} className="rounded border border-line/50 px-2 py-1 text-xs">
                <span className="font-mono text-ink-faint">{w.severity}</span> · {w.message}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {bulletSuggestions.length ? (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">
            Human review — suggestions are not applied automatically
          </div>
          {bulletSuggestions.map((s, idx) => {
            const status = decisions[idx] ?? s.status;
            return (
              <div key={idx} className="rounded border border-line/70 bg-canvas/40 p-2 text-sm">
                <div className="text-xs text-ink-faint">Original</div>
                <p className="text-ink-muted line-through decoration-ink-faint/40">{s.original}</p>
                <div className="mt-1 text-xs text-ink-faint">Suggested</div>
                <p className="text-ink">{s.suggested}</p>
                <div className="mt-1 text-xs text-ink-muted">Reason: {s.reason}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className={`rounded border px-2 py-1 text-xs ${
                      status === "accepted" ? "border-accent bg-accent/10" : "border-line"
                    }`}
                    onClick={() => setDecisions((d) => ({ ...d, [idx]: "accepted" }))}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className={`rounded border px-2 py-1 text-xs ${
                      status === "rejected" ? "border-warn/50 bg-warn/10" : "border-line"
                    }`}
                    onClick={() => setDecisions((d) => ({ ...d, [idx]: "rejected" }))}
                  >
                    Reject
                  </button>
                  {status !== "pending" ? (
                    <span className="self-center text-[10px] uppercase tracking-wide text-ink-faint">
                      {status}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
