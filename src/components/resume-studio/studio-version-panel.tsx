"use client";

import { useMemo, useState } from "react";
import { CompositionPreview } from "./composition-preview";
import { IntelligenceReviewPanel } from "./intelligence-review-panel";
import { composeDocument } from "@/lib/resume-studio/composition/compose-document";
import { listAllThemes, listReadyThemes } from "@/lib/resume-studio/themes";
import type { ResumeContentV3 } from "@/lib/resume/v3/types";
import type { ResumeCritique } from "@/lib/resume-studio/critic/run-resume-critic";
import type { CompositionDocument, ThemeId } from "@/lib/resume-studio/composition/types";
import type { ResumeIntelligenceBundle } from "@/lib/resume-intelligence";

export function StudioVersionPanel(props: {
  versionId: string;
  contentV3: ResumeContentV3 | null;
  savedComposition: CompositionDocument | null;
  critique: ResumeCritique | null;
  intelligence: ResumeIntelligenceBundle | null;
  themeId: string | null;
  markdown: string;
  downloadBase: string;
}) {
  const ready = listReadyThemes();
  const all = listAllThemes();
  const initialTheme = (props.themeId as ThemeId) || "arthur-cox";
  const [themeId, setThemeId] = useState<ThemeId>(
    ready.some((t) => t.id === initialTheme) ? initialTheme : "arthur-cox",
  );

  const document = useMemo(() => {
    if (props.contentV3) return composeDocument(props.contentV3, themeId);
    return props.savedComposition;
  }, [props.contentV3, props.savedComposition, themeId]);

  const critique = props.critique;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-ink-muted">Theme</label>
        <select
          className="rounded-md border border-line bg-panel px-2 py-1.5 text-sm"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value as ThemeId)}
        >
          {all.map((t) => (
            <option key={t.id} value={t.id} disabled={!t.ready}>
              {t.label}
              {!t.ready ? " (soon)" : ""}
            </option>
          ))}
        </select>
        <a
          href={`/api/resumes/${props.versionId}/download?format=docx`}
          className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent/40"
        >
          DOCX
        </a>
        <a
          href={`/api/resumes/${props.versionId}/download?format=pdf`}
          className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent/40"
        >
          PDF
        </a>
      </div>

      <IntelligenceReviewPanel intelligence={props.intelligence} />

      {critique ? (
        <div className="rounded-lg border border-line bg-panel/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg">Resume Critic</h3>
            <span className="rounded-full border border-line px-2 py-0.5 text-xs uppercase tracking-wide">
              {critique.overall}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(critique.scores).map(([k, v]) => (
              <div key={k} className="rounded border border-line/70 px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-ink-faint">{k}</div>
                <div className="font-mono text-lg">{v}/10</div>
              </div>
            ))}
          </div>
          {critique.suggestions.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {critique.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-auto rounded-lg border border-line bg-neutral-200/40 p-3">
        {document ? (
          <CompositionPreview document={document} />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs text-ink-muted">{props.markdown}</pre>
        )}
      </div>
    </div>
  );
}
