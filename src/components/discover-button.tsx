"use client";

import { useState, useTransition } from "react";
import { runDiscoveryAction } from "@/app/actions";

export function DiscoverButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
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
            const ie = result.irelandCoreAdded ?? 0;
            const eu = result.euSponsorshipAdded ?? 0;
            const skipped = result.skippedDuplicates ?? 0;
            setMessage(
              ie + eu === 0
                ? `No new Ireland roles (already ingested or filtered). ${skipped ? `${skipped} duplicates skipped. ` : ""}Import Glassdoor/Indeed via paste.`
                : `Added ${ie} Ireland + ${eu} EU sponsorship roles.`,
            );
          });
        }}
        className="inline-flex min-w-[11.5rem] shrink-0 items-center justify-center rounded-md border border-line bg-panel-2 px-4 py-2 text-sm text-ink hover:border-accent/40 disabled:opacity-60"
      >
        {pending ? "Discovering…" : "Run daily discovery"}
      </button>
      {/* Full-width next row so Approve / Import never shift */}
      {message ? (
        <p className="basis-full text-right text-xs text-ink-muted">{message}</p>
      ) : null}
    </>
  );
}
