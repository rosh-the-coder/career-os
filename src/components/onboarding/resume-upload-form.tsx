"use client";

import { useRef, useState, useTransition } from "react";
import { uploadResumeAction } from "@/app/onboarding/actions";
import { cn } from "@/lib/utils";

const ACCEPT = ".txt,.md,.pdf,text/plain,text/markdown,application/pdf";

export function ResumeUploadForm({ remainingSlots }: { remainingSlots: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [paste, setPaste] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const hasContent = files.length > 0 || paste.trim().length > 0;
  const canAdd = remainingSlots > 0;

  function takeFiles(list: FileList | File[] | null) {
    if (!list || !canAdd) return;
    const next = Array.from(list).filter((f) => f.size > 0);
    const room = Math.max(0, remainingSlots - files.length);
    const accepted = next.slice(0, room).filter((f) => {
      const n = f.name.toLowerCase();
      return (
        n.endsWith(".txt") ||
        n.endsWith(".md") ||
        n.endsWith(".markdown") ||
        n.endsWith(".pdf") ||
        f.type.startsWith("text/") ||
        f.type === "application/pdf"
      );
    });
    if (!accepted.length) {
      setLocalError("Use .pdf, .txt, or .md resumes.");
      return;
    }
    setLocalError(null);
    setFiles((prev) => {
      const names = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const merged = [...prev];
      for (const f of accepted) {
        const key = `${f.name}-${f.size}`;
        if (!names.has(key)) {
          merged.push(f);
          names.add(key);
        }
      }
      return merged.slice(0, remainingSlots);
    });
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function onParse() {
    if (!hasContent || pending || !canAdd) return;
    setLocalError(null);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    if (paste.trim()) fd.set("pastedText", paste.trim());
    startTransition(async () => {
      try {
        await uploadResumeAction(fd);
      } catch (err) {
        // Next redirect throws — ignore redirect errors
        if (err && typeof err === "object" && "digest" in err) return;
        setLocalError("Couldn’t parse that resume. Try another file or paste the text.");
      }
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          takeFiles(e.target.files);
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
          takeFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition-colors",
          dragOver
            ? "border-accent bg-accent/10"
            : "border-line bg-panel/40 hover:border-accent/50 hover:bg-accent/5",
        )}
      >
        <span className="text-sm font-medium text-ink">Drop resumes here, or click to browse</span>
        <span className="text-xs text-ink-muted">
          Up to {remainingSlots} more · PDF, .txt, or .md
        </span>
      </button>

      {files.length > 0 ? (
        <ul className="space-y-1.5 rounded-md border border-line bg-panel/40 p-3">
          {files.map((f) => (
            <li
              key={`${f.name}-${f.size}`}
              className="flex items-center justify-between gap-2 text-xs font-mono text-ink-muted"
            >
              <span className="truncate text-ink">{f.name}</span>
              <button
                type="button"
                className="shrink-0 text-ink-faint transition-colors hover:text-danger"
                onClick={() =>
                  setFiles((prev) => prev.filter((x) => !(x.name === f.name && x.size === f.size)))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <label className="block text-sm">
        <span className="text-ink-muted">Or paste resume text</span>
        <textarea
          value={paste}
          onChange={(e) => {
            setPaste(e.target.value);
            setLocalError(null);
          }}
          rows={5}
          placeholder="Paste the full resume text here…"
          className="mt-1.5 w-full rounded-md border border-line bg-canvas px-3 py-2 font-mono text-xs"
        />
      </label>

      {localError ? <p className="text-sm text-danger">{localError}</p> : null}

      <button
        type="button"
        disabled={pending || !canAdd || !hasContent}
        onClick={onParse}
        className="btn-primary-sm"
        title={!hasContent ? "Add a resume file or paste text first" : undefined}
      >
        {pending
          ? "Parsing…"
          : `Parse resume${files.length > 1 ? "s" : ""}${files.length ? ` (${files.length})` : ""}`}
      </button>
    </div>
  );
}
