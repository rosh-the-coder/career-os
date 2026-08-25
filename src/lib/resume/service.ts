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
import {
  composeResumeV3,
  loadCareerInventory,
  legacyValidationFromV3,
  resumeEngineVersion,
  v3ToAtsContent,
  v3ToMarkdown,
  resumeExportValidationOpts,
  validateExportedResumeText,
  COMPOSER_VERSION,
  RESUME_SCHEMA_V3,
  type ResumeContentV3,
} from "@/lib/resume/v3";
import {
  composeDocument,
  generateCompositionExports,
  runResumeCritic,
  runVisualHeuristics,
  COMPOSER_VERSION_V4,
  RESUME_SCHEMA_V4,
  type ThemeId,
} from "@/lib/resume-studio";
import { getTheme } from "@/lib/resume-studio/themes";

function exportDir() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "career-os-exports");
  }
  return path.join(process.cwd(), "data", "exports");
}

/** V2 legacy: includes markdown (known weakness). Prefer omitGeneratedMarkdown for new paths. */
async function loadEvidenceBundle(userId: string, markdown?: string) {
  const evidence = await prisma.evidenceItem.findMany({
    where: { userId },
    include: { metrics: true },
  });
  const evidenceTexts = [
    ...evidence.map((e) => `${e.title}\n${e.description}`),
    ...(markdown ? [markdown] : []),
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
  contentV3?: ResumeContentV3;
  parentVersionId?: string;
  composerVersion?: string;
  schemaVersion?: string;
  pageCount?: number;
  personName?: string;
}) {
  const markdown = opts.contentV3 ? v3ToMarkdown(opts.contentV3) : atsToMarkdown(opts.ats);
  const draft = atsContentToDraft(opts.ats);

  if (opts.contentV3) {
    const exportCheck = validateExportedResumeText(
      markdown,
      {
        ...resumeExportValidationOpts({
          profileKey: opts.contentV3.target.profileKey,
          pageLength: opts.pageLength,
          sectionOrder: opts.contentV3.sectionOrder,
        }),
        candidateName: opts.personName ?? opts.contentV3.header.name,
      },
    );
    if (!exportCheck.ok) {
      throw new Error(`Export validation failed: ${exportCheck.errors.join("; ")}`);
    }
  }

  const validation = opts.contentV3
    ? legacyValidationFromV3(opts.contentV3.validation)
    : validateClaims(draft, opts.evidenceTexts, opts.estimateLabels);

  if (validation.blockedClaims.length) {
    throw new Error(
      `Resume blocked by claim guard: "${validation.blockedClaims[0].slice(0, 120)}…"`,
    );
  }

  const fileBase = `${buildResumeFileName(opts.profileName.replace(/\s+/g, "_"), opts.company, new Date(), opts.personName ?? "Candidate")}_${Date.now().toString(36)}`;
  const outDir = exportDir();
  let docxPath: string;
  let pdfPath: string | null;
  let exportPageCount: number | undefined;
  try {
    const files = await generateDocxAndPdf(opts.ats, markdown, outDir, fileBase);
    docxPath = files.docxPath;
    pdfPath = files.pdfPath;
    exportPageCount = files.pageCount;
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
      contentJson: JSON.stringify(
        opts.contentV3
          ? { schemaVersion: RESUME_SCHEMA_V3, v3: opts.contentV3, draft, ats: opts.ats }
          : { draft, ats: opts.ats },
      ),
      markdown,
      evidenceUsedJson: JSON.stringify(opts.evidenceTitles),
      validationJson: JSON.stringify(opts.contentV3?.validation ?? validation),
      validationStatus: validation.status,
      promptVersion: opts.promptVersion,
      modelVersion: opts.modelVersion,
      docxPath,
      pdfPath: pdfPath ?? undefined,
      fileName: fileBase,
      optimizeJson: opts.optimizeJson ?? undefined,
      parentVersionId: opts.parentVersionId,
      composerVersion: opts.composerVersion,
      schemaVersion: opts.schemaVersion,
      pageCount: exportPageCount ?? opts.pageCount ?? opts.pageLength,
    },
  });
}

async function resolveProfileForJob(
  userId: string,
  job: {
    title: string;
    score: { profile: { id: string; key: string; name: string } | null } | null;
  },
) {
  // Prefer dedicated AI Engineer profile for literal AI Engineer JDs when available
  if (/\bai engineer\b/i.test(job.title)) {
    const aiEng = await prisma.careerProfile.findUnique({
      where: { userId_key: { userId, key: "ai_engineer" } },
    });
    if (aiEng) return aiEng;
  }

  if (job.score?.profile) return job.score.profile;

  return prisma.careerProfile.findFirstOrThrow({
    where: { userId, isDefault: true },
  });
}

export async function generateResumeForJob(jobId: string, pageLength: 1 | 2 = 1) {
  const user = await getPrimaryUser();
  if (!user.settings) throw new Error("Missing settings");

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
    include: { score: { include: { profile: true } } },
  });
  if (!job) throw new Error("Job not found");

  if (job.status === "rejected") {
    throw new Error("Cannot generate resume for hard-rejected job");
  }

  const engine = resumeEngineVersion();

  if (engine === "v4") {
    return generateResumeForJobV4(jobId, pageLength, user.id, job);
  }

  if (engine === "v3") {
    return generateResumeForJobV3(jobId, pageLength, user.id, job);
  }

  const profile = await resolveProfileForJob(user.id, job);

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
  // V2 path retains historical behaviour; V3 does not self-validate
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
    composerVersion: "resume-engine-v2",
    schemaVersion: "2.0",
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}

async function generateResumeForJobV4(
  jobId: string,
  pageLength: 1 | 2,
  userId: string,
  job: Awaited<ReturnType<typeof prisma.job.findUniqueOrThrow>> & {
    score: { profile: { id: string; key: string; name: string } | null; recommendedProjectsJson: string } | null;
  },
) {
  const profile = await resolveProfileForJob(userId, job);
  const inventory = await loadCareerInventory(userId);
  const recommended = parseJsonArray<string>(job.score?.recommendedProjectsJson ?? "[]");
  const themeId = (process.env.RESUME_THEME_ID as ThemeId) || "arthur-cox";
  getTheme(themeId); // resolve / fallback

  const contentV3 = composeResumeV3({
    inventory,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    description: job.descriptionClean || job.descriptionRaw,
    keywords: parseJsonArray<string>(job.keywordsJson),
    requirements: parseJsonArray<{ text: string }>(job.requirementsJson),
    profileKey: profile.key,
    pageLength,
    recommendedProjectsFromScore: recommended,
  });

  if (contentV3.validation.blockedClaims.length) {
    throw new Error(
      `Resume blocked by claim guard: "${contentV3.validation.blockedClaims[0].slice(0, 120)}…"`,
    );
  }

  let composition = composeDocument(contentV3, themeId);
  let critique = await runResumeCritic({
    document: composition,
    jobTitle: job.title,
    company: job.company,
    jdSnippet: job.descriptionClean || job.descriptionRaw,
  });

  // One safe improve pass: recompose + re-critique (no metric invention)
  if (critique.overall === "revise" && process.env.RESUME_CRITIC_AUTO_IMPROVE !== "false") {
    composition = composeDocument(contentV3, themeId);
    critique = await runResumeCritic({
      document: composition,
      jobTitle: job.title,
      company: job.company,
      jdSnippet: job.descriptionClean || job.descriptionRaw,
    });
  }

  const markdown = composition.readingOrder.join("\n") + "\n";
  const exportCheck = validateExportedResumeText(
    markdown,
    {
      ...resumeExportValidationOpts({
        profileKey: contentV3.target.profileKey,
        pageLength,
        sectionOrder: contentV3.sectionOrder,
      }),
      candidateName: contentV3.header.name || inventory.name,
    },
  );
  if (!exportCheck.ok) {
    throw new Error(`Export validation failed: ${exportCheck.errors.join("; ")}`);
  }

  const heuristics = runVisualHeuristics(composition);
  const ats = v3ToAtsContent(contentV3);
  const draft = atsContentToDraft(ats);
  const validation = legacyValidationFromV3(contentV3.validation);

  const fileBase = `${buildResumeFileName(contentV3.header.professionalTitle.replace(/\s+/g, "_"), job.company)}_${Date.now().toString(36)}`;
  const outDir = exportDir();
  const files = await generateCompositionExports(composition, outDir, fileBase);
  const visualFlags = runVisualHeuristics(composition, files.pageCount);

  const evidenceTitles = [
    ...new Set([
      ...contentV3.selectedProjects.flatMap((p) => p.evidenceIds),
      ...contentV3.experience.flatMap((e) => e.evidenceIds),
      ...contentV3.summary.evidenceIds,
    ]),
  ]
    .map((id) => inventory.evidence.find((e) => e.id === id)?.title ?? id)
    .filter(Boolean);

  const parent = await prisma.resumeVersion.findFirst({
    where: { jobId: job.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const version = await prisma.resumeVersion.create({
    data: {
      userId,
      jobId: job.id,
      profileId: profile.id,
      pageLength,
      contentJson: JSON.stringify({
        schemaVersion: RESUME_SCHEMA_V4,
        v3: contentV3,
        composition,
        intelligence: contentV3.intelligenceBundle ?? null,
        draft,
        ats,
      }),
      markdown: files.markdown,
      evidenceUsedJson: JSON.stringify(evidenceTitles),
      validationJson: JSON.stringify({
        ...contentV3.validation,
        visualHeuristics: [...heuristics, ...visualFlags],
        critiqueOverall: critique.overall,
        atsIntelligence: contentV3.generationMetadata.intelligence ?? null,
      }),
      validationStatus: validation.status === "failed" ? "failed" : critique.overall === "blocked" ? "warning" : validation.status,
      promptVersion: contentV3.generationMetadata.promptVersion ?? "v4-composition",
      modelVersion: critique.meta.used ? `critic:${critique.meta.provider}` : COMPOSER_VERSION_V4,
      docxPath: files.docxPath,
      pdfPath: files.pdfPath ?? undefined,
      fileName: fileBase,
      parentVersionId: parent?.id,
      composerVersion: COMPOSER_VERSION_V4,
      schemaVersion: RESUME_SCHEMA_V4,
      pageCount: files.pageCount ?? pageLength,
      themeId: composition.themeId,
      compositionJson: JSON.stringify(composition),
      critiqueJson: JSON.stringify(critique),
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}

async function generateResumeForJobV3(
  jobId: string,
  pageLength: 1 | 2,
  userId: string,
  job: Awaited<ReturnType<typeof prisma.job.findUniqueOrThrow>> & {
    score: { profile: { id: string; key: string; name: string } | null; recommendedProjectsJson: string } | null;
  },
) {
  const profile = await resolveProfileForJob(userId, job);
  const inventory = await loadCareerInventory(userId);
  const recommended = parseJsonArray<string>(job.score?.recommendedProjectsJson ?? "[]");

  const contentV3 = composeResumeV3({
    inventory,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    description: job.descriptionClean || job.descriptionRaw,
    keywords: parseJsonArray<string>(job.keywordsJson),
    requirements: parseJsonArray<{ text: string }>(job.requirementsJson),
    profileKey: profile.key,
    pageLength,
    recommendedProjectsFromScore: recommended,
  });

  if (contentV3.validation.blockedClaims.length) {
    throw new Error(
      `Resume blocked by claim guard: "${contentV3.validation.blockedClaims[0].slice(0, 120)}…"`,
    );
  }

  const ats = v3ToAtsContent(contentV3);
  const evidenceTitles = [
    ...new Set([
      ...contentV3.selectedProjects.flatMap((p) => p.evidenceIds),
      ...contentV3.experience.flatMap((e) => e.evidenceIds),
      ...contentV3.summary.evidenceIds,
    ]),
  ]
    .map((id) => inventory.evidence.find((e) => e.id === id)?.title ?? id)
    .filter(Boolean);

  const parent = await prisma.resumeVersion.findFirst({
    where: { jobId: job.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const version = await persistAtsResumeVersion({
    userId,
    jobId: job.id,
    profileId: profile.id,
    profileName: contentV3.header.professionalTitle,
    company: job.company,
    pageLength,
    ats,
    evidenceTitles,
    evidenceTexts: [], // V3 validated externally already
    estimateLabels: contentV3.validation.estimateWarnings,
    promptVersion: contentV3.generationMetadata.promptVersion ?? "v3-deterministic",
    modelVersion: contentV3.generationMetadata.modelVersion ?? COMPOSER_VERSION,
    contentV3,
    parentVersionId: parent?.id,
    composerVersion: COMPOSER_VERSION,
    schemaVersion: RESUME_SCHEMA_V3,
    pageCount: pageLength,
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
  const user = await getPrimaryUser();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.id } });
  if (!job) throw new Error("Job not found");
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
  const user = await getPrimaryUser();
  const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.id } });
  if (!job) throw new Error("Job not found");
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
  const user = await getPrimaryUser();
  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
    include: { score: { include: { profile: true } } },
  });
  if (!job) throw new Error("Job not found");
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
    parentVersionId: source.id,
    composerVersion: source.composerVersion ?? "resume-engine-v2",
    schemaVersion: source.schemaVersion ?? "2.0",
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}
