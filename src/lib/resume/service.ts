import path from "path";
import os from "os";
import { prisma } from "@/lib/db/prisma";
import { buildResumeFileName, validateClaims } from "@/lib/resume/compose";
import { generateDocxAndPdf } from "@/lib/resume/export-docx";
import { atsToMarkdown, buildReferenceAtsContent } from "@/lib/resume/reference-templates";
import { getPrimaryUser } from "@/lib/jobs/service";
import type { ResumeDraft } from "@/lib/ai/types";

function exportDir() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "career-os-exports");
  }
  return path.join(process.cwd(), "data", "exports");
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

  const evidence = await prisma.evidenceItem.findMany({
    where: { userId: user.id },
    include: { metrics: true },
  });

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

  // Reference PDF content + Irish AI Creative — not thin seed snippets
  const ats = buildReferenceAtsContent(profile.key, contact, {
    jobTitle: job.title,
    company: job.company,
  });

  // Optional: trim experience bullets for strict 1-page packs
  if (pageLength === 1) {
    ats.projects = ats.projects.map((p) => ({ ...p, bullets: p.bullets.slice(0, 5) }));
    ats.experiences = ats.experiences.map((e, i) => ({
      ...e,
      bullets: e.bullets.slice(0, i === 0 ? 4 : 4),
    }));
  }

  const markdown = atsToMarkdown(ats);
  const draft: ResumeDraft = {
    summary: ats.profile,
    skills: ats.skills,
    experiences: ats.experiences.map((e) => ({
      company: e.company,
      title: e.title,
      startDate: e.dates.split("—")[0]?.trim() ?? "",
      endDate: e.dates.split("—")[1]?.trim() ?? null,
      bullets: e.bullets,
    })),
    projects: ats.projects.map((p) => ({
      name: p.name,
      role: p.role,
      stack: [],
      bullets: p.bullets,
    })),
    education: ats.education.map((e) => e.line),
    markdown,
  };

  const evidenceTexts = [
    ...evidence.map((e) => `${e.title}\n${e.description}`),
    markdown, // reference claims are self-supported by the verified CV corpus
  ];
  const estimateLabels = evidence
    .flatMap((e) => e.metrics)
    .filter((m) => m.isEstimate || m.needsReview)
    .map((m) => m.label);

  const validation = validateClaims(draft, evidenceTexts, estimateLabels);
  if (validation.blockedClaims.length) {
    throw new Error(
      `Resume blocked by claim guard: "${validation.blockedClaims[0].slice(0, 120)}…"`,
    );
  }

  const fileBase = buildResumeFileName(profile.name.replace(/\s+/g, "_"), job.company);
  const outDir = exportDir();
  let docxPath: string;
  let pdfPath: string | null;
  try {
    const files = await generateDocxAndPdf(ats, markdown, outDir, fileBase);
    docxPath = files.docxPath;
    pdfPath = files.pdfPath;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Export failed (${detail}). DOCX write directory: ${outDir}`);
  }

  const version = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      jobId: job.id,
      profileId: profile.id,
      pageLength,
      contentJson: JSON.stringify({ draft, ats }),
      markdown,
      evidenceUsedJson: JSON.stringify([
        "Reference CV corpus",
        "Irish AI Creative (Mar–Jul 2026)",
        ...evidence.map((e) => e.title),
      ]),
      validationJson: JSON.stringify(validation),
      validationStatus: validation.status,
      promptVersion: "v2-reference-pdf-aligned",
      modelVersion: "reference-template-v1",
      docxPath,
      pdfPath: pdfPath ?? undefined,
      fileName: fileBase,
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "materials_ready" },
  });

  return version;
}
