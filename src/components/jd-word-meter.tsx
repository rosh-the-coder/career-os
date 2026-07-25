"use client";

import { useMemo, useState } from "react";
import { JD_WORD_SOFT_LIMIT, countWords } from "@/lib/jobs/jd-meta";

export function JdWordMeter({ text, className }: { text: string; className?: string }) {
  const words = useMemo(() => countWords(text), [text]);
  const over = words > JD_WORD_SOFT_LIMIT;
  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Word count (LLM soft limit)
        </span>
        <span className={`font-mono text-sm ${over ? "text-warn" : "text-ink-muted"}`}>
          {words}/{JD_WORD_SOFT_LIMIT}
        </span>
      </div>
      {over ? (
        <p className="mt-1 text-xs text-warn">
          Over the soft limit — scoring may hit Groq rate limits. Trim the JD, Save, then Score.
        </p>
      ) : (
        <p className="mt-1 text-xs text-ink-faint">
          Soft guide for free LLM scoring. You can exceed it; trim if Score fails with a rate-limit flag.
        </p>
      )}
    </div>
  );
}

/** Controlled textarea + meter for import / editors that own the string. */
export function JdTextareaField({
  name,
  defaultValue = "",
  required,
  rows = 16,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
}) {
  const [text, setText] = useState(defaultValue);
  return (
    <div className="space-y-2">
      <textarea
        name={name}
        rows={rows}
        required={required}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-md border border-line bg-canvas px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent/50"
        placeholder="Paste the full job description here…"
      />
      <JdWordMeter text={text} />
    </div>
  );
}
