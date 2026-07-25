"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateJobDescriptionAction } from "@/app/actions";
import { JdWordMeter } from "@/components/jd-word-meter";

export function JobDescriptionEditor({
  jobId,
  initialText,
}: {
  jobId: string;
  initialText: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [savedBaseline, setSavedBaseline] = useState(initialText);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const dirty = text !== savedBaseline;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl">Description</h2>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const fd = new FormData();
              fd.set("jobId", jobId);
              fd.set("description", text);
              const result = await updateJobDescriptionAction(fd);
              if (result.ok) {
                setSavedBaseline(text);
                setMessage("Saved. Click Score with LLM to re-judge.");
                router.refresh();
              } else {
                setMessage(result.error ?? "Save failed");
              }
            });
          }}
          className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-panel-2 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save description"}
        </button>
      </div>
      <JdWordMeter text={text} />
      {message ? <p className="text-xs text-accent">{message}</p> : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={22}
        className="max-h-[480px] w-full overflow-auto rounded-md border border-line bg-canvas px-3 py-2 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent/50"
      />
    </div>
  );
}
