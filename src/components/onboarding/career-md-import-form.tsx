"use client";

import { useRef, useState, useTransition } from "react";
import { saveCareerHistoryMdAction } from "@/app/onboarding/actions";
import { CopyCareerPromptButton } from "@/components/onboarding/copy-career-prompt-button";
import { cn } from "@/lib/utils";

export function CareerMdImportForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const hasContent = Boolean(file) || markdown.trim().length > 20;

  function takeFile(list: FileList | File[] | null) {
    if (!list?.length) return;
    const f = Array.from(list).find((x) => x.size > 0);
    if (!f) return;
    const lower = f.name.toLowerCase();
    if (lower.endsWith(".pdf") || f.type === "application/pdf") {
      setLocalError("Use a .md / .txt export here — PDFs go in Resumes above.");
      return;
    }
    setLocalError(null);
    setFile(f);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function onImport() {
    if (!hasContent || pending) return;
    setLocalError(null);
    const fd = new FormData();
    if (file) fd.set("file", file);
    if (markdown.trim()) fd.set("markdown", markdown.trim());
    startTransition(async () => {
      try {
        await saveCareerHistoryMdAction(fd);
      } catch (err) {
        if (err && typeof err === "object" && "digest" in err) return;
        setLocalError("Couldn’t import that draft. Check the markdown and try again.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        For richer targeting (markets, eligibility, avoid-list): copy the prompt sheet into
        ChatGPT/Claude with your materials, then bring the .md back here.
      </p>
      <CopyCareerPromptButton />

      <input
        ref={inputRef}
        type="file"
        accept=".md,.txt,text/markdown,text/plain"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          takeFile(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={openPicker}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          takeFile(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-accent bg-accent/10"
            : "border-line bg-panel/40 hover:border-accent/50 hover:bg-accent/5",
        )}
      >
        <span className="text-sm font-medium text-ink">Drop career .md here, or click to browse</span>
        <span className="text-xs text-ink-muted">.md or .txt from ChatGPT / Claude</span>
      </button>

      {file ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-panel/40 px-3 py-2 text-xs font-mono">
          <span className="truncate text-ink">{file.name}</span>
          <button
            type="button"
            className="shrink-0 text-ink-faint transition-colors hover:text-danger"
            onClick={() => setFile(null)}
          >
            Remove
          </button>
        </div>
      ) : null}

      <label className="block text-sm">
        <span className="text-ink-muted">Or paste the markdown</span>
        <textarea
          value={markdown}
          onChange={(e) => {
            setMarkdown(e.target.value);
            setLocalError(null);
          }}
          rows={6}
          placeholder="Paste the full markdown here…"
          className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2 font-mono text-xs"
        />
      </label>

      {localError ? <p className="text-sm text-danger">{localError}</p> : null}

      <button
        type="button"
        disabled={pending || !hasContent}
        onClick={onImport}
        className="btn-secondary"
        title={!hasContent ? "Add a .md file or paste markdown first" : undefined}
      >
        {pending ? "Importing…" : "Import draft inventory"}
      </button>
    </div>
  );
}
