import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { PageHeader, Panel, ScoreBadge, StatusPill } from "@/components/ui";
import { DashboardActions } from "@/components/dashboard-actions";

export const dynamic = "force-dynamic";

function dedupeByUrl<T extends { id: string; url: string | null; score: { totalScore: number } | null }>(
  jobs: T[],
): T[] {
  const best = new Map<string, T>();
  for (const job of jobs) {
    const key = job.url ?? job.id;
    const prev = best.get(key);
    if (!prev || (job.score?.totalScore ?? 0) > (prev.score?.totalScore ?? 0)) {
      best.set(key, job);
    }
  }
  return [...best.values()];
}

export default async function DashboardPage() {
  const settings = await prisma.settings.findFirst();
  const batchTarget = settings?.dailyBatchTarget ?? 25;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [allJobs, euJobsRaw, applicationCount, estimateCount] = await Promise.all([
    prisma.job.findMany({
      include: { score: true },
      orderBy: { collectedAt: "desc" },
    }),
    prisma.job.findMany({
      where: {
        listingCategory: "eu_sponsorship",
        NOT: { status: "rejected" },
      },
      include: { score: true },
      orderBy: { collectedAt: "desc" },
      take: 30,
    }),
    prisma.application.count(),
    prisma.metric.count({ where: { OR: [{ isEstimate: true }, { needsReview: true }] } }),
  ]);

  const uniqueJobs = dedupeByUrl(allJobs);
  const uniqueRejected = uniqueJobs.filter((j) => j.status === "rejected").length;
  const uniqueScored = uniqueJobs.filter((j) =>
    ["scored", "materials_ready", "saved"].includes(j.status),
  ).length;
  const irelandToday = uniqueJobs.filter(
    (j) => j.listingCategory === "ireland_core" && j.collectedAt >= startOfDay,
  ).length;

  const irelandPriority = uniqueJobs
    .filter((job) => {
      if (job.listingCategory !== "ireland_core") return false;
      if (!["scored", "materials_ready", "saved"].includes(job.status)) return false;
      if ((job.score?.totalScore ?? 0) < 65) return false;
      if (job.yearsRequired != null && job.yearsRequired >= 8) return false;
      if (job.yearsRequired != null && job.yearsRequired >= 6 && /\bsenior\b/i.test(job.title)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0))
    .slice(0, batchTarget);

  const euJobs = dedupeByUrl(euJobsRaw).slice(0, 15);
  const hiddenDupes = allJobs.length - uniqueJobs.length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Daily Ireland batch target: ${batchTarget}. EU sponsorship is a separate exclusive track. Model A: prepare packs — you submit.`}
        action={<DashboardActions />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Unique jobs", value: uniqueJobs.length },
          { label: "In queue / scored", value: uniqueScored },
          { label: "Ireland added today", value: irelandToday },
          { label: "Hard rejected", value: uniqueRejected },
          { label: "Applications", value: applicationCount },
        ].map((stat) => (
          <Panel key={stat.label} className="flex min-h-[108px] flex-col justify-between">
            <div className="min-h-[2.5rem] font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-ink-faint">
              {stat.label}
            </div>
            <div className="font-display text-3xl leading-none text-ink">{stat.value}</div>
          </Panel>
        ))}
      </div>

      {hiddenDupes > 0 ? (
        <p className="mb-4 text-xs text-ink-faint">
          {hiddenDupes} duplicate listing(s) hidden from counts and the batch list. Open Jobs for the
          full raw table.
        </p>
      ) : null}

      {estimateCount > 0 ? (
        <Panel className="mb-8 border-warn/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-warn">Estimates awaiting review</div>
              <p className="mt-1 text-sm text-ink-muted">
                {estimateCount} metric(s) labelled estimates. Verify before CV approval.
              </p>
            </div>
            <Link href="/profiles" className="text-sm text-accent hover:underline">
              Review evidence →
            </Link>
          </div>
        </Panel>
      ) : null}

      <Panel className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">Ireland / Dublin batch</h2>
            <p className="mt-1 text-xs text-ink-faint">
              Showing {irelandPriority.length} unique roles with score ≥ 65 (target {batchTarget}).
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/approve" className="text-accent hover:underline">
              Approve →
            </Link>
            <Link href="/jobs" className="text-ink-muted hover:text-ink">
              View all
            </Link>
          </div>
        </div>
        {irelandPriority.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No Ireland matches yet. Click <span className="text-ink">Run daily discovery</span> or import a
            listing.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {irelandPriority.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/jobs/${job.id}`} className="font-medium text-ink hover:text-accent">
                    {job.title}
                  </Link>
                  <div className="mt-1 text-sm text-ink-muted">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={job.status} />
                  {job.score ? <ScoreBadge score={job.score.totalScore} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">EU + visa sponsorship</h2>
            <p className="mt-1 text-sm text-ink-muted">Exclusive track — not counted in the daily 25.</p>
          </div>
        </div>
        {euJobs.length === 0 ? (
          <p className="text-sm text-ink-muted">No EU sponsorship listings yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {euJobs.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/jobs/${job.id}`} className="font-medium text-ink hover:text-accent">
                    {job.title}
                  </Link>
                  <div className="mt-1 text-sm text-ink-muted">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status="eu sponsorship" />
                  {job.score ? <ScoreBadge score={job.score.totalScore} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
