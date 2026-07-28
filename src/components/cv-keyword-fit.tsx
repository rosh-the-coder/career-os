"use client";

import { useMemo, useState, useTransition } from "react";
import {
  analyzeResumeKeywordsAction,
  applyResumeAtsEditsAction,
  suggestResumeAtsEditsAction,
} from "@/app/actions";
import type { AtsOptimizeCache } from "@/lib/resume/ats-optimize";

export function CvKeywordFit({
  jobId,
  resumeVersionId,
  initialCache,
}: {
  jobId: string;
  resumeVersionId: string;
  initialCache: AtsOptimizeCache | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const coverage = initialCache?.coverage;
  const edits = initialCache?.edits ?? [];
  const suggestMeta = initialCache?.suggestMeta;

  const selectedIndexes = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, on]) => on)
        .map(([k]) => Number(k)),
    [selected],
  );

  function run(
    action: (fd: FormData) => Promise<{ ok: boolean; error?: string }>,
    extra?: Record<string, string | string[]>,
  ) {
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("jobId", jobId);
        fd.set("resumeVersionId", resumeVersionId);
        if (extra) {
          for (const [k, v] of Object.entries(extra)) {
            if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
            else fd.set(k, v);
          }
        }
        const result = await action(fd);
        if (!result.ok) setError(result.error ?? "Action failed");
        else setSelected({});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">CV keyword fit</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Keyword overlap against this JD — not a vendor ATS score.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(analyzeResumeKeywordsAction)}
            className="rounded-md border border-line px-3 py-2 text-sm hover:bg-panel-2 disabled:opacity-50"
          >
            Analyze keywords
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(suggestResumeAtsEditsAction)}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas hover:bg-accent-dim disabled:opacity-50"
          >
            Suggest edits
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {pending ? <p className="text-xs text-ink-faint">Working…</p> : null}

      {coverage ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl text-ink">{coverage.overlapPercent}%</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              keyword overlap · {coverage.matched.length}/{coverage.relevantJdTerms.length} terms
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Matched</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {coverage.matched.map((t) => (
                  <span
                    key={`m-${t}`}
                    className="rounded border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent"
                  >
                    {t}
                  </span>
                ))}
                {!coverage.matched.length ? (
                  <span className="text-sm text-ink-muted">None yet</span>
                ) : null}
              </div>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Missing</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {coverage.missing.map((t) => (
                  <span
                    key={`x-${t}`}
                    className="rounded border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[11px] text-warn"
                  >
                    {t}
                  </span>
                ))}
                {!coverage.missing.length ? (
                  <span className="text-sm text-ink-muted">No gaps in tracked terms</span>
                ) : null}
              </div>
            </div>
          </div>

          {coverage.presentButWeak.length ? (
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                Skills only (weak)
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {coverage.presentButWeak.map((t) => (
                  <span
                    key={`w-${t}`}
                    className="rounded border border-line bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-ink-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          Run Analyze keywords to compare this CV against the job description.
        </p>
      )}

      {suggestMeta?.note ? (
        <p className="text-sm text-warn">{suggestMeta.note}</p>
      ) : null}
      {suggestMeta && !suggestMeta.note ? (
        <p className="font-mono text-[11px] text-ink-faint">
          Suggestions via {suggestMeta.provider}/{suggestMeta.model}
        </p>
      ) : null}

      {edits.length ? (
        <div className="space-y-3 border-t border-line pt-4">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            Suggested edits
          </h3>
          <ul className="space-y-3">
            {edits.map((edit, i) => (
              <li key={`${edit.path}-${i}`} className="rounded-lg border border-line bg-panel-2/50 p-3">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!selected[i]}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, [i]: e.target.checked }))
                    }
                  />
                  <div className="min-w-0 flex-1 space-y-2 text-sm">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      {edit.path}
                      {edit.claimStatus === "warning" ? " · claim warning" : ""}
                    </div>
                    <div>
                      <span className="text-ink-faint">Before</span>
                      <p className="text-ink-muted">{edit.before}</p>
                    </div>
                    <div>
                      <span className="text-accent">After</span>
                      <p className="text-ink">{edit.after}</p>
                    </div>
                    {edit.reason ? <p className="text-xs text-ink-faint">{edit.reason}</p> : null}
                    {edit.keywordsIntroduced?.length ? (
                      <p className="font-mono text-[10px] text-ink-faint">
                        + {edit.keywordsIntroduced.join(", ")}
                      </p>
                    ) : null}
                    {edit.claimNote ? <p className="text-xs text-warn">{edit.claimNote}</p> : null}
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={pending || selectedIndexes.length === 0}
            onClick={() =>
              run(applyResumeAtsEditsAction, {
                editIndex: selectedIndexes.map(String),
              })
            }
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas hover:bg-accent-dim disabled:opacity-50"
          >
            Apply selected ({selectedIndexes.length})
          </button>
          <p className="text-xs text-ink-faint">
            Creates a new ResumeVersion with DOCX/PDF. Original is kept.
          </p>
        </div>
      ) : null}
    </div>
  );
}
