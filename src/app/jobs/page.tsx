import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { PageHeader, Panel, ScoreBadge, StatusPill } from "@/components/ui";
import { getPrimaryUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const user = await getPrimaryUser();
  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    include: { score: { include: { profile: true } } },
    orderBy: { collectedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Scored listings with eligibility and profile recommendations."
        action={
          <Link
            href="/jobs/new"
            className="rounded-md border border-line bg-panel-2 px-4 py-2 text-sm text-ink hover:border-accent/40"
          >
            Import
          </Link>
        }
      />

      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Profile</th>
              <th className="px-5 py-3 font-medium">Eligibility</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-line/70 hover:bg-panel-2/50">
                <td className="px-5 py-3">
                  <Link href={`/jobs/${job.id}`} className="font-medium text-ink hover:text-accent">
                    {job.title}
                  </Link>
                  <div className="text-ink-muted">{job.company}</div>
                </td>
                <td className="px-5 py-3">
                  <ScoreBadge score={job.score?.totalScore ?? 0} rejected={job.status === "rejected"} />
                </td>
                <td className="px-5 py-3 text-ink-muted">{job.score?.profile?.name ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-ink-muted">
                  {job.score?.eligibilityCurrent?.replace(/_/g, " ") ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={job.status} />
                </td>
              </tr>
            ))}
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-muted">
                  No jobs yet.{" "}
                  <Link href="/jobs/new" className="text-accent hover:underline">
                    Import your first listing
                  </Link>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
