"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { prepareResumePacksAction, saveJobsAction } from "@/app/actions";

export type ApproveJobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  status: string;
  listingCategory: string;
  score: number;
  profileName: string | null;
  url: string | null;
};

export function ApproveQueueClient({ jobs }: { jobs: ApproveJobRow[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    for (const job of jobs) next[job.id] = checked;
    setSelected(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Tick jobs you approve → prepare ATS CV packs. You still submit applications yourself (Model A).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!selectedIds.length || pending}
            onClick={() => {
              setMessage(null);
              startTransition(async () => {
                const fd = new FormData();
                selectedIds.forEach((id) => fd.append("jobIds", id));
                await saveJobsAction(fd);
                setMessage(`Saved ${selectedIds.length} job(s) for later.`);
              });
            }}
            className="rounded-md border border-line px-3 py-2 text-sm hover:bg-panel-2 disabled:opacity-50"
          >
            Save selected
          </button>
          <button
            type="button"
            disabled={!selectedIds.length || pending}
            onClick={() => {
              setMessage(null);
              startTransition(async () => {
                const fd = new FormData();
                selectedIds.forEach((id) => fd.append("jobIds", id));
                const result = await prepareResumePacksAction(fd);
                if (!result.ok) {
                  setMessage(result.error ?? "Failed");
                  return;
                }
                setMessage(
                  `Prepared ${result.prepared} CV pack(s).${
                    result.failed.length ? ` ${result.failed.length} failed.` : ""
                  } Review in Resume Studio.`,
                );
                setSelected({});
              });
            }}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas hover:bg-accent-dim disabled:opacity-50"
          >
            {pending ? "Preparing…" : `Prepare CV packs (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-lg border border-line bg-panel-2 px-4 py-3 text-sm text-ink-muted">
          {message}{" "}
          {message.includes("Resume Studio") ? (
            <Link href="/resume-studio" className="text-accent hover:underline">
              Open Resume Studio →
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={jobs.length > 0 && selectedIds.length === jobs.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="accent-accent"
                />
              </th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Profile</th>
              <th className="px-4 py-3 font-medium">Track</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Listing</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-line/70 hover:bg-panel-2/40">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[job.id])}
                    onChange={() => toggle(job.id)}
                    className="accent-accent"
                    aria-label={`Select ${job.title}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="font-medium text-ink hover:text-accent">
                    {job.title}
                  </Link>
                  <div className="text-ink-muted">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-ink">{job.score}</td>
                <td className="px-4 py-3 text-ink-muted">{job.profileName ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-[10px] uppercase text-ink-faint">
                  {job.listingCategory === "eu_sponsorship" ? "EU sponsorship" : "Ireland"}
                </td>
                <td className="px-4 py-3 font-mono text-[10px] uppercase text-ink-muted">
                  {job.status.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3">
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-muted">
                  No scored jobs ready to approve. Run discovery from the dashboard first.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
