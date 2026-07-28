import Link from "next/link";
import { notFound } from "next/navigation";
import { generateResumeAction, recordApplicationAction, rescoreJobAction } from "@/app/actions";
import { CvKeywordFit } from "@/components/cv-keyword-fit";
import { JobDescriptionEditor } from "@/components/job-description-editor";
import { EstimateTooltip, PageHeader, Panel, ScoreBadge, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { computeParseConfidence, isLlmScored } from "@/lib/jobs/jd-meta";
import { parseOptimizeCache } from "@/lib/resume/ats-optimize";
import { SCORE_WEIGHTS } from "@/lib/types";
import { parseJsonArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { score: { include: { profile: true } }, resumeVersions: { orderBy: { createdAt: "desc" } } },
  });
  if (!job) notFound();

  const softFlags = parseJsonArray<{ code: string; message: string; severity: string }>(job.softFlagsJson);
  const strengths = job.score ? parseJsonArray<string>(job.score.strengthsJson) : [];
  const gaps = job.score ? parseJsonArray<string>(job.score.gapsJson) : [];
  const projects = job.score ? parseJsonArray<string>(job.score.recommendedProjectsJson) : [];
  const evidence = job.score ? parseJsonArray<string>(job.score.evidenceUsedJson) : [];
  const requirements = parseJsonArray<{ text: string; kind: string }>(job.requirementsJson);
  const llmScored = isLlmScored(job.score?.modelVersion);
  const confidence = computeParseConfidence({
    description: job.descriptionClean || job.descriptionRaw,
    title: job.title,
    location: job.location,
    yearsRequired: job.yearsRequired,
    requirementsCount: requirements.length,
    llmScored,
  });
  const rateLimitFlag = softFlags.find(
    (f) => f.code === "llm_rate_limit" || /rate limit|trim the job/i.test(f.message),
  );
  const latestResume = job.resumeVersions[0] ?? null;
  const optimizeCache = latestResume ? parseOptimizeCache(latestResume.optimizeJson) : null;

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.company}${job.location ? ` · ${job.location}` : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusPill status={job.status} />
            <ScoreBadge score={job.score?.totalScore ?? 0} rejected={job.status === "rejected"} />
          </div>
        }
      />

      {rateLimitFlag ? (
        <Panel className="mb-6 border-warn/40">
          <div className="text-sm font-medium text-warn">Rate limit — trim the JD</div>
          <p className="mt-1 text-sm text-ink-muted">{rateLimitFlag.message}</p>
        </Panel>
      ) : null}

      {job.hardRejectReason ? (
        <Panel className="mb-6 border-danger/40">
          <div className="text-sm font-medium text-danger">Hard rejected</div>
          <p className="mt-1 text-sm text-ink-muted">{job.hardRejectReason}</p>
        </Panel>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="font-display text-xl">Match explanation</h2>
          {job.score?.profile ? (
            <p className="mt-2 text-sm text-ink-muted">
              Recommended profile: <span className="text-ink">{job.score.profile.name}</span>
            </p>
          ) : null}
          {job.score?.modelVersion ? (
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              Scorer: {llmScored ? "LLM judge" : "Awaiting LLM / heuristic"} · {job.score.modelVersion}
              {" · "}
              Parse confidence: {confidence}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Strengths</h3>
              <ul className="mt-2 space-y-2 text-sm text-ink">
                {strengths.map((s) => (
                  <li key={s} className="border-l-2 border-accent/50 pl-3">
                    {s}
                  </li>
                ))}
                {!strengths.length ? <li className="text-ink-muted">—</li> : null}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Gaps & notes</h3>
              <ul className="mt-2 space-y-2 text-sm text-ink">
                {gaps.map((g) => (
                  <li key={g} className="border-l-2 border-warn/50 pl-3">
                    {g}
                  </li>
                ))}
                {!gaps.length ? <li className="text-ink-muted">—</li> : null}
              </ul>
            </div>
          </div>

          {softFlags.length ? (
            <div className="mt-5">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Soft flags</h3>
              <ul className="mt-2 space-y-2">
                {softFlags.map((f, i) => (
                  <li
                    key={`${f.code}-${i}`}
                    className={`text-sm ${f.severity === "warn" ? "text-warn" : "text-ink-muted"}`}
                  >
                    {f.message}
                    {f.code.includes("estimate") || f.message.toLowerCase().includes("estimat") ? (
                      <EstimateTooltip />
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <Panel>
          <h2 className="font-display text-xl">Eligibility</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Current</dt>
              <dd className="mt-1 text-ink">{job.score?.eligibilityCurrent?.replace(/_/g, " ") ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Long-term</dt>
              <dd className="mt-1 text-ink">{job.score?.eligibilityFuture?.replace(/_/g, " ") ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Source</dt>
              <dd className="mt-1 text-ink-muted">{job.source}</dd>
            </div>
            {job.url ? (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">URL</dt>
                <dd className="mt-1 truncate">
                  <a href={job.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    Open listing
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <form action={rescoreJobAction}>
              <input type="hidden" name="jobId" value={job.id} />
              <button
                type="submit"
                className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas hover:bg-accent-dim"
              >
                {llmScored ? "Re-score with LLM" : "Score with LLM"}
              </button>
            </form>
            <p className="text-xs text-ink-faint">
              Scores one job at a time. If you hit a rate limit, trim the description below and try again.
            </p>
            {job.status !== "rejected" ? (
              <>
                <form action={generateResumeAction} className="flex gap-2">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="pageLength" value="1" />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-canvas hover:bg-accent-dim"
                  >
                    Generate 1-page CV
                  </button>
                </form>
                <form action={generateResumeAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="pageLength" value="2" />
                  <button type="submit" className="w-full rounded-md border border-line px-3 py-2 text-sm hover:bg-panel-2">
                    Generate 2-page CV
                  </button>
                </form>
                <form action={recordApplicationAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button type="submit" className="w-full rounded-md border border-line px-3 py-2 text-sm hover:bg-panel-2">
                    Mark applied
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </Panel>
      </div>

      {job.score ? (
        <Panel className="mb-6">
          <h2 className="font-display text-xl">Score breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Skills", job.score.skillsOverlap, SCORE_WEIGHTS.skillsOverlap],
                ["Evidence", job.score.evidenceStrength, SCORE_WEIGHTS.evidenceStrength],
                ["Projects", job.score.projectRelevance, SCORE_WEIGHTS.projectRelevance],
                ["Seniority", job.score.seniorityFit, SCORE_WEIGHTS.seniorityFit],
                ["Eligibility", job.score.currentEligibility, SCORE_WEIGHTS.currentEligibility],
                ["Permit path", job.score.longTermPermit, SCORE_WEIGHTS.longTermPermit],
                ["Location", job.score.locationFit, SCORE_WEIGHTS.locationFit],
                ["Salary", job.score.salaryFit, SCORE_WEIGHTS.salaryFit],
                ["Direction", job.score.careerAlignment, SCORE_WEIGHTS.careerAlignment],
              ] as const
            ).map(([label, value, weight]) => (
              <div key={label} className="rounded-lg border border-line bg-panel-2/60 px-3 py-2">
                <div className="flex justify-between font-mono text-[11px] text-ink-faint">
                  <span>{label}</span>
                  <span>×{weight}</span>
                </div>
                <div className="mt-1 text-lg text-ink">{Math.round(value * 100)}%</div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Recommended projects</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {projects.map((p) => (
              <li key={p} className="text-ink">
                {p}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">Evidence used</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-muted">
            {evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display text-xl">Parsed requirements</h2>
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm text-ink-muted">
            {requirements.map((r) => (
              <li key={r.text}>
                <span className="font-mono text-[10px] uppercase text-ink-faint">{r.kind}</span> — {r.text}
              </li>
            ))}
            {!requirements.length ? <li>No structured requirements extracted — see raw description.</li> : null}
          </ul>
        </Panel>
      </div>

      {job.resumeVersions.length ? (
        <Panel className="mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">Generated CVs</h2>
            <Link href="/resume-studio" className="text-sm text-accent hover:underline">
              Open Resume Studio
            </Link>
          </div>
          <ul className="space-y-2">
            {job.resumeVersions.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-panel-2/60 px-3 py-2 text-sm"
              >
                <div>
                  <span className="text-ink">{v.fileName ?? v.id}</span>
                  <span className="ml-2 font-mono text-[10px] uppercase text-ink-faint">
                    {v.pageLength}-page · {v.promptVersion}
                    {latestResume?.id === v.id ? " · latest" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/api/resumes/${v.id}/download?format=docx`}
                    className="rounded-md border border-line px-2.5 py-1 text-xs hover:border-accent/40"
                  >
                    DOCX
                  </a>
                  <a
                    href={`/api/resumes/${v.id}/download?format=pdf`}
                    className="rounded-md border border-line px-2.5 py-1 text-xs hover:border-accent/40"
                  >
                    PDF
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {latestResume ? (
        <Panel className="mb-6">
          <CvKeywordFit
            jobId={job.id}
            resumeVersionId={latestResume.id}
            initialCache={optimizeCache}
          />
        </Panel>
      ) : null}

      <Panel>
        <div className="mb-3 flex justify-end">
          <Link href="/approve" className="text-sm text-ink-muted hover:text-ink">
            ← Back to approve
          </Link>
        </div>
        <JobDescriptionEditor
          jobId={job.id}
          initialText={job.descriptionClean || job.descriptionRaw}
        />
      </Panel>
    </div>
  );
}
