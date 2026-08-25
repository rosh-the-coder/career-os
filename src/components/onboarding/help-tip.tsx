"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/** Inline help for BYOK / tools — expands on click (mobile-friendly, no hover-only). */
export function HelpTip({
  text,
  href,
  hrefLabel,
}: {
  text: string;
  href?: string;
  hrefLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-medium transition-colors",
          open
            ? "border-accent/50 bg-accent/15 text-accent"
            : "border-line text-ink-muted hover:border-accent/40 hover:text-ink",
        )}
        aria-expanded={open}
        aria-controls={id}
        title="More info"
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open ? (
        <span
          id={id}
          role="note"
          className="absolute left-0 top-full z-20 mt-2 w-72 rounded-md border border-line bg-panel p-3 text-xs leading-relaxed text-ink-muted shadow-lg"
        >
          <p>{text}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-accent hover:underline"
            >
              {hrefLabel ?? "Get a key"} →
            </a>
          ) : null}
          <button
            type="button"
            className="mt-2 block text-[10px] uppercase tracking-wider text-ink-faint hover:text-ink-muted"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </span>
      ) : null}
    </span>
  );
}
