import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { PageHeader, Panel, ScoreBadge, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const settings = await prisma.settings.findFirst();
  const batchTarget = settings?.dailyBatchTarget ?? 25;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [jobCount, scoredJobs, euJobs, applicationCount, estimateCount, irelandToday, rejected, scored] =
    await Promise.all([
      prisma.job.count(),
      prisma.job.findMany({
        where: {
          listingCategory: "ireland_core",
          status: { in: ["scored", "materials_ready", "saved"] },
        },
        include: { score: true },
        orderBy: { collectedAt: "desc" },
        take: 80,
      }),
      prisma.job.findMany({
        where: {
          listingCategory: "eu_sponsorship",
          NOT: { status: "rejected" },
        },
        include: { score: true },
        orderBy: { collectedAt: "desc" },
        take: 15,
      }),
      prisma.application.count(),
      prisma.metric.count({ where: { OR: [{ isEstimate: true }, { needsReview: true }] } }),
      prisma.job.count({
        where: {
          listingCategory: "ireland_core",
          collectedAt: { gte: startOfDay },
        },
      }),
      prisma.job.count({ where: { status: "rejected" } }),
      prisma.job.count({ where: { status: "scored" } }),
    ]);

  const irelandPriority = scoredJobs
    .filter((job) => (job.score?.totalScore ?? 0) >= 65)
    .slice(0, batchTarget);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Daily Ireland batch target: ${batchTarget}. EU sponsorship is a separate exclusive track. Model A: prepare packs — you submit.`}
        action={
          <div className="flex gap-2">
            <Link
              href="/jobs/new"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas transition hover:bg-accent-dim"
            >
              Import job
            </Link>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Jobs ingested", value: jobCount },
          { label: "Scored", value: scored },
          { label: "Ireland added today", value: irelandToday },
          { label: "Hard rejected", value: rejected },
          { label: "Applications", value: applicationCount },
        ].map((stat) => (
          <Panel key={stat.label}>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">{stat.label}</div>
            <div className="mt-2 font-display text-3xl text-ink">{stat.value}</div>
          </Panel>
        ))}
      </div>

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
          <h2 className="font-display text-xl">Ireland / Dublin batch</h2>
          <Link href="/jobs" className="text-sm text-ink-muted hover:text-ink">
            View all
          </Link>
        </div>
        {irelandPriority.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No Ireland matches yet. Run{" "}
            <code className="font-mono text-accent">npm run cli:discover</code> for Greenhouse boards,
            or import a URL + pasted JD.
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
