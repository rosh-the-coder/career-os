import path from "path";
import { prisma } from "@/lib/db/prisma";
import { getLLMProvider } from "@/lib/ai/provider";
import { composeResumeDeterministic, buildResumeFileName, validateClaims } from "@/lib/resume/compose";
import { generateDocx } from "@/lib/resume/export-docx";
import { getPrimaryUser } from "@/lib/jobs/service";
import { parseJsonArray } from "@/lib/utils";

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

  const [experiences, projects, skills, evidence] = await Promise.all([
    prisma.experience.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.project.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.skill.findMany({ where: { userId: user.id } }),
    prisma.evidenceItem.findMany({
      where: { userId: user.id },
      include: { metrics: true },
    }),
  ]);

  const recommendedProjects = job.score
    ? parseJsonArray<string>(job.score.recommendedProjectsJson)
    : projects.slice(0, 3).map((p) => p.name);

  const selectedProjects = projects
    .filter((p) => recommendedProjects.some((r) => r === p.name || r === p.key))
    .slice(0, pageLength === 1 ? 2 : 3);

  const selectedExperiences = experiences.slice(0, pageLength === 1 ? 3 : 4);

  const education = evidence
    .filter((e) => e.type === "education")
    .map((e) => e.title);

  const input = {
    jobTitle: job.title,
    company: job.company,
    profile: {
      key: profile.key,
      name: profile.name,
      positioning: profile.positioning,
      keywords: parseJsonArray(profile.keywordsJson),
    },
    experiences: selectedExperiences.map((e) => {
      const alt = parseJsonArray<string>(e.alternativeTitlesJson);
      // alternativeTitlesJson is object — handle both
      let title = e.umbrellaTitle;
      try {
        const obj = JSON.parse(e.alternativeTitlesJson) as Record<string, string>;
        if (profile.key === "design_engineer" && obj.design_engineering) title = obj.design_engineering;
        if (profile.key === "product_designer" && obj.product) title = obj.product;
        if (profile.key === "applied_ai" && obj.applied_ai) title = obj.applied_ai;
        if (obj.general && profile.key === "ai_creative") title = obj.general;
      } catch {
        void alt;
      }
      const bullets = parseJsonArray<string>(e.bulletsJson).slice(0, pageLength === 1 ? 4 : 6);
      return {
        company: e.company,
        title,
        startDate: e.startDate,
        endDate: e.endDate,
        bullets,
      };
    }),
    projects: selectedProjects.map((p) => ({
      name: p.name,
      role: p.primaryRole,
      stack: parseJsonArray<string>(p.stackJson).slice(0, 8),
      bullets: [
        ...parseJsonArray<string>(p.featuresJson).slice(0, 2),
        ...parseJsonArray<string>(p.outcomesJson)
          .filter((o) => !/estimat/i.test(o) || true)
          .slice(0, pageLength === 1 ? 2 : 3)
          .map((o) => (/estimat/i.test(o) ? `${o} (estimate — needs review)` : o)),
      ],
    })),
    skills: skills.map((s) => s.name).slice(0, pageLength === 1 ? 18 : 28),
    education,
    contact: {
      name: user.name,
      location: user.settings.location,
      email: user.email,
      portfolioUrl: user.settings.portfolioUrl,
      githubUrl: user.settings.githubUrl,
      linkedinUrl: user.settings.linkedinUrl,
    },
    pageLength,
  };

  const provider = getLLMProvider();
  const generated = await provider.generateResume(input);
  const draft = composeResumeDeterministic(
    {
      ...input,
      experiences: generated.experiences?.length ? generated.experiences : input.experiences,
      projects: generated.projects?.length ? generated.projects : input.projects,
      skills: generated.skills?.length ? generated.skills : input.skills,
    },
    generated.summary,
  );

  const evidenceTexts = evidence.map((e) => `${e.title}\n${e.description}`);
  const estimateLabels = evidence
    .flatMap((e) => e.metrics)
    .filter((m) => m.isEstimate || m.needsReview)
    .map((m) => m.label);

  const validation = validateClaims(draft, evidenceTexts, estimateLabels);
  if (validation.blockedClaims.length) {
    throw new Error(`Resume blocked: ${validation.blockedClaims[0]}`);
  }

  const fileBase = buildResumeFileName(job.title, job.company);
  const outDir = path.join(process.cwd(), "data", "exports");
  const { docxPath, markdownPath } = await generateDocx(draft, input.contact, outDir, fileBase);

  const version = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      jobId: job.id,
      profileId: profile.id,
      pageLength,
      contentJson: JSON.stringify(draft),
      markdown: draft.markdown,
      evidenceUsedJson: JSON.stringify(evidence.map((e) => e.title)),
      validationJson: JSON.stringify(validation),
      validationStatus: validation.status,
      promptVersion: "v1",
      modelVersion: process.env.GEMINI_API_KEY ? "gemini+deterministic" : "deterministic-v1",
      docxPath,
      pdfPath: markdownPath.replace(/\.md$/, ".pdf.txt"),
      fileName: fileBase,
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}
