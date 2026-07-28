import path from "path";
import os from "os";
import { prisma } from "@/lib/db/prisma";
import { buildResumeFileName, validateClaims } from "@/lib/resume/compose";
import { generateDocxAndPdf, type AtsResumeContent } from "@/lib/resume/export-docx";
import { atsToMarkdown, buildReferenceAtsContent } from "@/lib/resume/reference-templates";
import {
  analyzeCvKeywordCoverage,
  applyAtsEdits,
  atsContentToDraft,
  parseAtsFromContentJson,
  parseOptimizeCache,
  suggestAtsEdits,
  type AtsEditSuggestion,
  type AtsOptimizeCache,
} from "@/lib/resume/ats-optimize";
import { getPrimaryUser } from "@/lib/jobs/service";
import { parseJsonArray } from "@/lib/utils";

function exportDir() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "career-os-exports");
  }
  return path.join(process.cwd(), "data", "exports");
}

async function loadEvidenceBundle(userId: string, markdown: string) {
  const evidence = await prisma.evidenceItem.findMany({
    where: { userId },
    include: { metrics: true },
  });
  const evidenceTexts = [
    ...evidence.map((e) => `${e.title}\n${e.description}`),
    markdown,
  ];
  const estimateLabels = evidence
    .flatMap((e) => e.metrics)
    .filter((m) => m.isEstimate || m.needsReview)
    .map((m) => m.label);
  return { evidence, evidenceTexts, estimateLabels };
}

export async function persistAtsResumeVersion(opts: {
  userId: string;
  jobId: string;
  profileId: string;
  profileName: string;
  company: string;
  pageLength: 1 | 2;
  ats: AtsResumeContent;
  evidenceTitles: string[];
  evidenceTexts: string[];
  estimateLabels: string[];
  promptVersion: string;
  modelVersion: string;
  optimizeJson?: string | null;
}) {
  const markdown = atsToMarkdown(opts.ats);
  const draft = atsContentToDraft(opts.ats);

  const validation = validateClaims(draft, opts.evidenceTexts, opts.estimateLabels);
  if (validation.blockedClaims.length) {
    throw new Error(
      `Resume blocked by claim guard: "${validation.blockedClaims[0].slice(0, 120)}…"`,
    );
  }

  const fileBase = buildResumeFileName(opts.profileName.replace(/\s+/g, "_"), opts.company);
  const outDir = exportDir();
  let docxPath: string;
  let pdfPath: string | null;
  try {
    const files = await generateDocxAndPdf(opts.ats, markdown, outDir, fileBase);
    docxPath = files.docxPath;
    pdfPath = files.pdfPath;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Export failed (${detail}). DOCX write directory: ${outDir}`);
  }

  return prisma.resumeVersion.create({
    data: {
      userId: opts.userId,
      jobId: opts.jobId,
      profileId: opts.profileId,
      pageLength: opts.pageLength,
      contentJson: JSON.stringify({ draft, ats: opts.ats }),
      markdown,
      evidenceUsedJson: JSON.stringify(opts.evidenceTitles),
      validationJson: JSON.stringify(validation),
      validationStatus: validation.status,
      promptVersion: opts.promptVersion,
      modelVersion: opts.modelVersion,
      docxPath,
      pdfPath: pdfPath ?? undefined,
      fileName: fileBase,
      optimizeJson: opts.optimizeJson ?? undefined,
    },
  });
}

export async function generateResumeForJob(jobId: string, pageLength: 1 | 2 = 1) {
  const user = await getPrimaryUser();
  if (!user.settings) throw new Error("Missing settings");

  const job = await prisma.job.findUniqueOrThrow({
    where: { id: jobId },
    include: { score: { include: { profile: true } } },
  });

  if (job.status === "rejected") {
    throw new Error("Cannot generate resume for hard-rejected job");
  }

  const profile =
    job.score?.profile ??
    (await prisma.careerProfile.findFirstOrThrow({
      where: { userId: user.id, isDefault: true },
    }));

  const contactEmail = user.settings.contactEmail || user.email;
  const contact = {
    name: user.name,
    location: user.settings.location,
    email: contactEmail,
    phone: user.settings.phone,
    portfolioUrl: user.settings.portfolioUrl,
    githubUrl: user.settings.githubUrl,
    linkedinUrl: user.settings.linkedinUrl,
  };

  const ats = buildReferenceAtsContent(profile.key, contact, {
    jobTitle: job.title,
    company: job.company,
  });

  if (pageLength === 1) {
    ats.projects = ats.projects.map((p) => ({ ...p, bullets: p.bullets.slice(0, 5) }));
    ats.experiences = ats.experiences.map((e) => ({
      ...e,
      bullets: e.bullets.slice(0, 4),
    }));
  }

  const markdown = atsToMarkdown(ats);
  const { evidence, evidenceTexts, estimateLabels } = await loadEvidenceBundle(user.id, markdown);

  const version = await persistAtsResumeVersion({
    userId: user.id,
    jobId: job.id,
    profileId: profile.id,
    profileName: profile.name,
    company: job.company,
    pageLength,
    ats,
    evidenceTitles: [
      "Reference CV corpus",
      "Irish AI Creative (Mar–Jul 2026)",
      ...evidence.map((e) => e.title),
    ],
    evidenceTexts,
    estimateLabels,
    promptVersion: "v2-reference-pdf-aligned",
    modelVersion: "reference-template-v1",
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}

async function resolveResumeVersion(jobId: string, resumeVersionId?: string | null) {
  if (resumeVersionId) {
    const version = await prisma.resumeVersion.findFirst({
      where: { id: resumeVersionId, jobId },
    });
    if (!version) throw new Error("Resume version not found for this job");
    return version;
  }
  const latest = await prisma.resumeVersion.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) throw new Error("Generate a CV for this job first");
  return latest;
}

export async function analyzeResumeKeywordsForJob(jobId: string, resumeVersionId?: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const version = await resolveResumeVersion(jobId, resumeVersionId);

  const skills = await prisma.skill.findMany({ where: { userId: job.userId } });
  const coverage = analyzeCvKeywordCoverage({
    jobTitle: job.title,
    descriptionClean: job.descriptionClean || job.descriptionRaw,
    descriptionRaw: job.descriptionRaw,
    keywords: parseJsonArray<string>(job.keywordsJson),
    requirements: parseJsonArray<{ text: string; kind: string }>(job.requirementsJson),
    cvMarkdown: version.markdown,
    skillsInventory: skills.map((s) => ({
      name: s.name,
      keywords: parseJsonArray<string>(s.keywordsJson),
    })),
  });

  const prev = parseOptimizeCache(version.optimizeJson);
  const cache: AtsOptimizeCache = {
    coverage,
    edits: prev?.edits,
    suggestMeta: prev?.suggestMeta,
  };

  await prisma.resumeVersion.update({
    where: { id: version.id },
    data: { optimizeJson: JSON.stringify(cache) },
  });

  return { versionId: version.id, cache };
}

export async function suggestResumeAtsEditsForJob(jobId: string, resumeVersionId?: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const version = await resolveResumeVersion(jobId, resumeVersionId);
  const ats = parseAtsFromContentJson(version.contentJson);
  if (!ats) throw new Error("Resume content is missing structured ATS data");

  let cache = parseOptimizeCache(version.optimizeJson);
  if (!cache?.coverage) {
    const analyzed = await analyzeResumeKeywordsForJob(jobId, version.id);
    cache = analyzed.cache;
  }

  const { evidenceTexts, estimateLabels } = await loadEvidenceBundle(job.userId, version.markdown);
  const { edits, meta } = await suggestAtsEdits({
    jobTitle: job.title,
    descriptionClean: job.descriptionClean || job.descriptionRaw,
    ats,
    coverage: cache.coverage,
    evidenceTexts,
    estimateLabels,
  });

  const next: AtsOptimizeCache = {
    coverage: cache.coverage,
    edits,
    suggestMeta: meta,
  };

  await prisma.resumeVersion.update({
    where: { id: version.id },
    data: { optimizeJson: JSON.stringify(next) },
  });

  return { versionId: version.id, cache: next };
}

export async function applyResumeAtsEditsForJob(
  jobId: string,
  resumeVersionId: string,
  editIndexes: number[],
) {
  const job = await prisma.job.findUniqueOrThrow({
    where: { id: jobId },
    include: { score: { include: { profile: true } } },
  });
  const source = await resolveResumeVersion(jobId, resumeVersionId);
  const ats = parseAtsFromContentJson(source.contentJson);
  if (!ats) throw new Error("Resume content is missing structured ATS data");

  const cache = parseOptimizeCache(source.optimizeJson);
  if (!cache?.edits?.length) throw new Error("No edit suggestions to apply — run Suggest edits first");

  const selected: AtsEditSuggestion[] = [];
  for (const idx of editIndexes) {
    const edit = cache.edits[idx];
    if (!edit) throw new Error(`Invalid edit index: ${idx}`);
    if (edit.claimStatus === "blocked") continue;
    selected.push(edit);
  }
  if (!selected.length) throw new Error("Select at least one valid edit");

  const patched = applyAtsEdits(ats, selected);
  const markdown = atsToMarkdown(patched);
  const { evidence, evidenceTexts, estimateLabels } = await loadEvidenceBundle(job.userId, markdown);

  const profile =
    job.score?.profile ??
    (await prisma.careerProfile.findFirstOrThrow({
      where: { userId: job.userId, isDefault: true },
    }));

  // Re-analyze coverage on the patched CV for the new version
  const skills = await prisma.skill.findMany({ where: { userId: job.userId } });
  const coverage = analyzeCvKeywordCoverage({
    jobTitle: job.title,
    descriptionClean: job.descriptionClean || job.descriptionRaw,
    keywords: parseJsonArray<string>(job.keywordsJson),
    requirements: parseJsonArray<{ text: string; kind: string }>(job.requirementsJson),
    cvMarkdown: markdown,
    skillsInventory: skills.map((s) => ({
      name: s.name,
      keywords: parseJsonArray<string>(s.keywordsJson),
    })),
  });

  const optimizeJson = JSON.stringify({
    coverage,
    edits: [],
    suggestMeta: {
      provider: cache.suggestMeta?.provider ?? "apply",
      model: cache.suggestMeta?.model ?? "ats-optimize",
      note: `Applied ${selected.length} edit(s) from ${source.id}`,
      suggestedAt: new Date().toISOString(),
    },
  } satisfies AtsOptimizeCache);

  const version = await persistAtsResumeVersion({
    userId: job.userId,
    jobId: job.id,
    profileId: profile.id,
    profileName: profile.name,
    company: job.company,
    pageLength: (source.pageLength === 2 ? 2 : 1) as 1 | 2,
    ats: patched,
    evidenceTitles: [
      "Reference CV corpus",
      "Irish AI Creative (Mar–Jul 2026)",
      ...evidence.map((e) => e.title),
      `ATS optimize from ${source.fileName ?? source.id}`,
    ],
    evidenceTexts,
    estimateLabels,
    promptVersion: "v2-ats-optimize",
    modelVersion: `ats-optimize:${cache.suggestMeta?.provider ?? "unknown"}`,
    optimizeJson,
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}
