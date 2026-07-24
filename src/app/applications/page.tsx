import Link from "next/link";
import { updateApplicationAction } from "@/app/actions";
import { PageHeader, Panel, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const STATUSES = [
  "applied",
  "recruiter_reply",
  "interview",
  "rejected_after_application",
  "offer",
  "withdrawn",
];

const STAGES = ["none", "recruiter_screen", "hiring_manager", "task", "onsite", "final", "offer"];

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    include: { job: true, resumeVersion: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Notion-style tracker: where you applied, which CV, salary asked, referral, follow-up, interview stage."
      />

      <div className="space-y-4">
        {applications.map((a) => (
          <Panel key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/jobs/${a.jobId}`} className="font-display text-xl hover:text-accent">
                  {a.job.title}
                </Link>
                <div className="mt-1 text-sm text-ink-muted">
                  {a.job.company}
                  {a.locationApplied ? ` · ${a.locationApplied}` : ""}
                  {a.job.url ? (
                    <>
                      {" · "}
                      <a href={a.job.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        Listing
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
              <StatusPill status={a.status} />
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Submitted</dt>
                <dd>{a.submittedAt ? a.submittedAt.toISOString().slice(0, 10) : "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Channel</dt>
                <dd>{a.submissionChannel ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">CV</dt>
                <dd className="truncate">{a.resumeVersion?.fileName ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Follow-up</dt>
                <dd>{a.followUpAt ? a.followUpAt.toISOString().slice(0, 10) : "—"}</dd>
              </div>
            </dl>

            <form action={updateApplicationAction} className="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-3">
              <input type="hidden" name="id" value={a.id} />
              <label className="text-sm">
                <span className="text-ink-muted">Status</span>
                <select name="status" defaultValue={a.status} className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-ink-muted">Interview stage</span>
                <select
                  name="interviewStage"
                  defaultValue={a.interviewStage ?? "none"}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-ink-muted">Salary asked</span>
                <input
                  name="salaryAsked"
                  defaultValue={a.salaryAsked ?? ""}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5"
                  placeholder="€55k"
                />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted">Referral</span>
                <input
                  name="referral"
                  defaultValue={a.referral ?? ""}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted">Recruiter</span>
                <input
                  name="recruiterName"
                  defaultValue={a.recruiterName ?? ""}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                <span className="text-ink-muted">Follow-up date</span>
                <input
                  name="followUpAt"
                  type="date"
                  defaultValue={a.followUpAt ? a.followUpAt.toISOString().slice(0, 10) : ""}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5"
                />
              </label>
              <label className="text-sm md:col-span-3">
                <span className="text-ink-muted">Notes</span>
                <textarea
                  name="notes"
                  defaultValue={a.notes ?? ""}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5"
                />
              </label>
              <button type="submit" className="rounded-md border border-line px-3 py-2 text-sm hover:bg-panel-2 md:col-span-3 md:w-fit">
                Save tracker row
              </button>
            </form>
          </Panel>
        ))}

        {applications.length === 0 ? (
          <Panel>
            <p className="text-sm text-ink-muted">
              No applications yet. From a job page: generate CV → open listing → submit yourself → Mark applied.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
