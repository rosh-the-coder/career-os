"use client";

import { useState, useTransition } from "react";
import { runDiscoveryAction } from "@/app/actions";

export function DiscoverButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await runDiscoveryAction();
            if (!result.ok) {
              setMessage(result.error ?? "Discovery failed");
              return;
            }
            setMessage(
              `Added ${result.irelandCoreAdded ?? 0} Ireland + ${result.euSponsorshipAdded ?? 0} EU sponsorship roles.`,
            );
          });
        }}
        className="rounded-md border border-line bg-panel-2 px-4 py-2 text-sm text-ink hover:border-accent/40 disabled:opacity-60"
      >
        {pending ? "Discovering…" : "Run daily discovery"}
      </button>
      {message ? <p className="max-w-xs text-right text-xs text-ink-muted">{message}</p> : null}
    </div>
  );
}
