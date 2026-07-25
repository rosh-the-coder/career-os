"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runDiscoveryAction } from "@/app/actions";

/** Dashboard action cluster — keeps the three buttons on one row; status below. */
export function DashboardActions() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-nowrap items-center gap-2">
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
                  ? `No new Ireland roles.${skipped ? ` ${skipped} duplicates skipped.` : ""} Try Import for niche paste.`
                  : `Added ${ie} Ireland + ${eu} EU sponsorship roles.`,
              );
            });
          }}
          className="inline-flex h-10 min-w-[11.5rem] shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-line bg-panel-2 px-4 text-sm text-ink hover:border-accent/40 disabled:opacity-60"
        >
          {pending ? "Discovering…" : "Run daily discovery"}
        </button>
        <Link
          href="/approve"
          className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-md border border-line px-4 text-sm text-ink hover:border-accent/40"
        >
          Approve queue
        </Link>
        <Link
          href="/jobs/new"
          className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-md bg-accent px-4 text-sm font-medium text-canvas transition hover:bg-accent-dim"
        >
          Import job
        </Link>
      </div>
      {message ? <p className="max-w-md text-right text-xs text-ink-muted">{message}</p> : null}
    </div>
  );
}
