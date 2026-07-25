import Link from "next/link";
import { EstimateTooltip, PageHeader, Panel, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { parseJsonArray, parseJsonObject } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResumeStudioPage() {
  const versions = await prisma.resumeVersion.findMany({
    include: { job: true, profile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Resume Studio"
        description="Generated ATS drafts with claim validation. Download DOCX/PDF below — works on Vercel too."
      />

      <div className="space-y-4">
        {versions.map((v) => {
          const validation = parseJsonObject<{
            status?: string;
            estimateWarnings?: string[];
            blockedClaims?: string[];
          }>(v.validationJson);

          return (
            <Panel key={v.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">
                    {v.job ? `${v.job.title} @ ${v.job.company}` : "Untitled"}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {v.profile.name} · {v.pageLength}-page · {v.fileName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={v.validationStatus} />
                  <a
                    href={`/api/resumes/${v.id}/download?format=docx`}
                    className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent/40"
                  >
                    Download DOCX
                  </a>
                  <a
                    href={`/api/resumes/${v.id}/download?format=pdf`}
                    className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent/40"
                  >
                    Download PDF
                  </a>
                  {v.job ? (
                    <Link href={`/jobs/${v.job.id}`} className="text-sm text-accent hover:underline">
                      Job
                    </Link>
                  ) : null}
                </div>
              </div>

              {(validation.estimateWarnings?.length ?? 0) > 0 ? (
                <div className="mt-3 text-sm text-warn">
                  {validation.estimateWarnings!.map((w) => (
                    <div key={w}>
                      {w} <EstimateTooltip />
                    </div>
                  ))}
                </div>
              ) : null}

              <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-canvas p-4 font-mono text-xs text-ink-muted">
                {v.markdown}
              </pre>

              <div className="mt-3 font-mono text-[11px] text-ink-faint">
                Evidence items: {parseJsonArray(v.evidenceUsedJson).length}
              </div>
            </Panel>
          );
        })}

        {versions.length === 0 ? (
          <Panel>
            <p className="text-sm text-ink-muted">
              No resumes yet. Use Approve queue → Prepare CV packs, or generate from a job detail page.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
