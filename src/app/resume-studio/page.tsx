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
        description="Generated ATS drafts with claim validation. DOCX exports land in data/exports."
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
                <div className="flex items-center gap-2">
                  <StatusPill status={v.validationStatus} />
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
            DOCX: {v.docxPath ?? "—"}
            {v.pdfPath ? ` · PDF: ${v.pdfPath}` : ""} · Evidence items:{" "}
            {parseJsonArray(v.evidenceUsedJson).length}
              </div>
            </Panel>
          );
        })}

        {versions.length === 0 ? (
          <Panel>
            <p className="text-sm text-ink-muted">
              No resumes yet. Score a job, then generate a CV from the job detail page.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
