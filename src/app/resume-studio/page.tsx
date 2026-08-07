import Link from "next/link";
import { EstimateTooltip, PageHeader, Panel, StatusPill } from "@/components/ui";
import { StudioVersionPanel } from "@/components/resume-studio/studio-version-panel";
import { prisma } from "@/lib/db/prisma";
import { parseJsonArray, parseJsonObject } from "@/lib/utils";
import { isResumeContentV3 } from "@/lib/resume/v3/adapter";
import type { ResumeContentV3 } from "@/lib/resume/v3/types";
import type { CompositionDocument } from "@/lib/resume-studio/composition/types";
import type { ResumeCritique } from "@/lib/resume-studio/critic/run-resume-critic";
import { getPrimaryUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export default async function ResumeStudioPage() {
  const user = await getPrimaryUser();
  const versions = await prisma.resumeVersion.findMany({
    where: { userId: user.id },
    include: { job: true, profile: true, parentVersion: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Resume Studio"
        description="Composition preview, theme switching, critic scores, evidence maps and version lineage."
      />

      <div className="space-y-4">
        {versions.map((v) => {
          const validation = parseJsonObject<{
            status?: string;
            estimateWarnings?: string[];
            blockedClaims?: string[];
            unsupportedClaims?: string[];
            warnings?: string[];
            visualHeuristics?: string[];
          }>(v.validationJson);

          let contentParsed: unknown = null;
          try {
            contentParsed = JSON.parse(v.contentJson);
          } catch {
            contentParsed = null;
          }
          const bag = contentParsed && typeof contentParsed === "object" ? (contentParsed as Record<string, unknown>) : {};
          const v3raw = "v3" in bag ? bag.v3 : contentParsed;
          const isV3 = isResumeContentV3(v3raw);
          const contentV3 = isV3 ? (v3raw as ResumeContentV3) : null;
          const selectedProjects = contentV3 ? contentV3.selectedProjects.map((p) => p.name) : [];

          let savedComposition: CompositionDocument | null = null;
          if (v.compositionJson) {
            try {
              savedComposition = JSON.parse(v.compositionJson) as CompositionDocument;
            } catch {
              savedComposition = null;
            }
          } else if (bag.composition) {
            savedComposition = bag.composition as CompositionDocument;
          }

          let critique: ResumeCritique | null = null;
          if (v.critiqueJson) {
            try {
              critique = JSON.parse(v.critiqueJson) as ResumeCritique;
            } catch {
              critique = null;
            }
          }

          const intelligence =
            (bag.intelligence as import("@/lib/resume-intelligence").ResumeIntelligenceBundle | null) ??
            (contentV3?.intelligenceBundle as import("@/lib/resume-intelligence").ResumeIntelligenceBundle | null) ??
            null;

          const warningCount =
            (validation.estimateWarnings?.length ?? 0) +
            (validation.unsupportedClaims?.length ?? 0) +
            (validation.warnings?.length ?? 0) +
            (validation.visualHeuristics?.length ?? 0);

          return (
            <Panel key={v.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">
                    {v.job ? `${v.job.title} @ ${v.job.company}` : "Untitled"}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {v.profile.name} · {v.pageLength}-page · {v.fileName}
                    {v.themeId ? ` · theme ${v.themeId}` : ""}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ink-faint">
                    {v.composerVersion ?? "legacy"} · schema {v.schemaVersion ?? "2.x"} ·{" "}
                    {new Date(v.createdAt).toISOString()}
                    {v.parentVersionId ? ` · child of ${v.parentVersion?.fileName ?? v.parentVersionId}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={v.validationStatus} />
                  {v.job ? (
                    <Link href={`/jobs/${v.job.id}`} className="text-sm text-accent hover:underline">
                      Job
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border border-line bg-canvas/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Selected projects</div>
                  <div className="mt-1 text-sm text-ink">
                    {selectedProjects.length ? selectedProjects.join(", ") : "—"}
                  </div>
                </div>
                <div className="rounded-md border border-line bg-canvas/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Evidence items</div>
                  <div className="mt-1 font-display text-2xl text-ink">
                    {parseJsonArray(v.evidenceUsedJson).length}
                  </div>
                </div>
                <div className="rounded-md border border-line bg-canvas/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Warnings</div>
                  <div className="mt-1 font-display text-2xl text-ink">{warningCount}</div>
                </div>
                <div className="rounded-md border border-line bg-canvas/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Page target</div>
                  <div className="mt-1 font-display text-2xl text-ink">{v.pageCount ?? v.pageLength}</div>
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

              <div className="mt-4">
                <StudioVersionPanel
                  versionId={v.id}
                  contentV3={contentV3}
                  savedComposition={savedComposition}
                  critique={critique}
                  intelligence={intelligence}
                  themeId={v.themeId}
                  markdown={v.markdown}
                  downloadBase={v.fileName ?? v.id}
                />
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
