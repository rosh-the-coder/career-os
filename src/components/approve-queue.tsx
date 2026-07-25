"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { prepareResumePacksAction, saveJobsAction } from "@/app/actions";
import type { ParseConfidence } from "@/lib/jobs/jd-meta";

function friendlyPackError(raw?: string): string {
  if (!raw) return "unknown error";
  if (/429|quota|Too Many Requests|resource_exhausted/i.test(raw)) {
    return "Gemini quota hit (optional AI polish). Set RESUME_DETERMINISTIC_ONLY=true and retry.";
  }
  if (/Export failed|EACCES|EROFS|read-only/i.test(raw)) {
    return raw.length > 220 ? `${raw.slice(0, 220)}…` : raw;
  }
  return raw.length > 180 ? `${raw.slice(0, 180)}…` : raw;
}

function confidenceTone(c: ParseConfidence) {
  if (c === "high") return "text-accent";
  if (c === "medium") return "text-warn";
  return "text-ink-muted";
}

export type ApproveJobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  listingCategory: string;
  score: number;
  profileName: string | null;
  url: string | null;
  llmScored: boolean;
  confidence: ParseConfidence;
};

const stickyCheck =
  "sticky left-0 z-20 w-12 bg-panel group-hover:bg-panel-2";
const stickyRole =
  "sticky left-12 z-20 min-w-[14rem] max-w-[18rem] bg-panel shadow-[4px_0_8px_-4px_rgba(0,0,0,0.45)] group-hover:bg-panel-2";
const stickyHeadCheck = "sticky left-0 top-0 z-30 w-12 bg-panel";
const stickyHeadRole =
  "sticky left-12 top-0 z-30 min-w-[14rem] max-w-[18rem] bg-panel shadow-[4px_0_8px_-4px_rgba(0,0,0,0.45)]";

export function ApproveQueueClient({ jobs }: { jobs: ApproveJobRow[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateOverflow() {
      const node = scrollRef.current;
      if (!node) return;
      const { scrollLeft, scrollWidth, clientWidth } = node;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }

    updateOverflow();
    el.addEventListener("scroll", updateOverflow, { passive: true });
    const ro = new ResizeObserver(updateOverflow);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateOverflow);
      ro.disconnect();
    };
  }, [jobs.length]);

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
          Green <span className="text-accent">Click</span> = not LLM-scored yet — open the job and score
          individually. Confidence is parse quality only; the number is from the LLM.
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
                const failHint = result.failed.length
                  ? ` ${result.failed.length} failed — ${friendlyPackError(result.failed[0]?.error)}`
                  : "";
                setMessage(
                  `Prepared ${result.prepared} CV pack(s).${failHint}${
                    result.prepared > 0 ? " Review in Resume Studio." : ""
                  }`,
                );
                setSelected({});
              });
            }}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas hover:bg-accent-dim disabled:opacity-50"
          >
            {pending ? "Working…" : `Prepare CV packs (${selectedIds.length})`}
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

      {/*
        Viewport-framed scroll: horizontal bar stays at bottom of this pane
        (not buried under the last row). Edge fades = overflow affordance.
      */}
      <div className="relative rounded-xl border border-line">
        {canScrollLeft ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-40 w-8 rounded-l-xl bg-gradient-to-r from-panel to-transparent"
          />
        ) : null}
        {canScrollRight ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-40 flex w-10 items-center justify-end rounded-r-xl bg-gradient-to-l from-panel via-panel/80 to-transparent pr-2"
          >
            <span className="font-mono text-[10px] text-ink-faint">→</span>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          className="max-h-[min(70vh,720px)] overflow-auto overscroll-contain"
          tabIndex={0}
          aria-label="Approve queue table. Scroll horizontally for more columns."
        >
          <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                <th className={`${stickyHeadCheck} border-b border-line px-4 py-3`}>
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={jobs.length > 0 && selectedIds.length === jobs.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="accent-accent"
                  />
                </th>
                <th className={`${stickyHeadRole} border-b border-line px-4 py-3 font-medium`}>Role</th>
                <th className="sticky top-0 z-10 border-b border-line bg-panel px-4 py-3 font-medium">
                  Score
                </th>
                <th className="sticky top-0 z-10 border-b border-line bg-panel px-4 py-3 font-medium">
                  Confidence
                </th>
                <th className="sticky top-0 z-10 border-b border-line bg-panel px-4 py-3 font-medium">
                  Profile
                </th>
                <th className="sticky top-0 z-10 border-b border-line bg-panel px-4 py-3 font-medium">
                  Track
                </th>
                <th className="sticky top-0 z-10 border-b border-line bg-panel px-4 py-3 font-medium">
                  Status
                </th>
                <th className="sticky top-0 z-10 border-b border-line bg-panel px-4 py-3 font-medium">
                  Listing
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="group border-b border-line/70 hover:bg-panel-2/40">
                  <td className={`${stickyCheck} border-b border-line/70 px-4 py-3`}>
                    <input
                      type="checkbox"
                      checked={Boolean(selected[job.id])}
                      onChange={() => toggle(job.id)}
                      className="accent-accent"
                      aria-label={`Select ${job.title}`}
                    />
                  </td>
                  <td className={`${stickyRole} border-b border-line/70 px-4 py-3`}>
                    <Link href={`/jobs/${job.id}`} className="font-medium text-ink hover:text-accent">
                      {job.title}
                    </Link>
                    <div className="truncate text-ink-muted">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ""}
                    </div>
                  </td>
                  <td className="border-b border-line/70 px-4 py-3">
                    {job.llmScored ? (
                      <span className="font-mono text-ink">{job.score}</span>
                    ) : (
                      <Link href={`/jobs/${job.id}`} className="text-accent hover:underline">
                        Click
                      </Link>
                    )}
                  </td>
                  <td
                    className={`border-b border-line/70 px-4 py-3 font-mono text-[11px] uppercase ${confidenceTone(job.confidence)}`}
                  >
                    {job.confidence}
                  </td>
                  <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 text-ink-muted">
                    {job.profileName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 font-mono text-[10px] uppercase text-ink-faint">
                    {job.listingCategory === "eu_sponsorship" ? "EU sponsorship" : "Ireland"}
                  </td>
                  <td className="whitespace-nowrap border-b border-line/70 px-4 py-3 font-mono text-[10px] uppercase text-ink-muted">
                    {job.llmScored ? "scored" : "unscored"}
                  </td>
                  <td className="border-b border-line/70 px-4 py-3">
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
                  <td colSpan={8} className="px-4 py-10 text-center text-ink-muted">
                    No jobs in the queue. Run discovery or import a listing first.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
