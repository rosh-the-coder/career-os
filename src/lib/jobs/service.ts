import { prisma } from "@/lib/db/prisma";
import { fetchJobUrl, JobFetchError, isLikelyBlockedJobHost } from "@/lib/jobs/fetch-url";
import { parseJobText } from "@/lib/jobs/parse-job";
import { scoreJob } from "@/lib/scoring/score-job";
import { inferYearsRequired } from "@/lib/scoring/hard-filters";
import { mergeHeuristicWithJudge, runLlmJudge } from "@/lib/scoring/llm-judge";
import { parseJsonArray } from "@/lib/utils";
import type { ProfileKey } from "@/lib/types";
export { getPrimaryUser } from "@/lib/auth/user";
import { getPrimaryUser } from "@/lib/auth/user";

function classifyListingCategory(input: {
  location?: string;
  country?: string;
  description: string;
  sponsorshipText?: string;
}): "ireland_core" | "eu_sponsorship" {
  const blob = `${input.location ?? ""} ${input.country ?? ""} ${input.description} ${input.sponsorshipText ?? ""}`.toLowerCase();
  const inIreland =
    /\bireland\b|\bdublin\b|\bcork\b|\bgalway\b|\blimerick\b/.test(blob) ||
    /\bremote within ireland\b/.test(blob);

  const euOutsideIreland =
    /\b(germany|berlin|netherlands|amsterdam|france|paris|spain|madrid|portugal|lisbon|belgium|brussels|sweden|stockholm|denmark|copenhagen|finland|austria|vienna|poland|warsaw|italy|milan|eu[- ]wide|europe)\b/.test(
      blob,
    ) && !inIreland;

  const sponsorship =
    /\bsponsor(ship|ed)?\b|\bvisa\b|\bwork permit\b|\brelocation\b|\bcritical skills\b/.test(blob);

  if (euOutsideIreland && sponsorship) return "eu_sponsorship";
  return "ireland_core";
}

export async function importAndScoreJob(input: {
  description?: string;
  url?: string;
  title?: string;
  company?: string;
  source?: string;
  listingCategory?: "ireland_core" | "eu_sponsorship";
}) {
  const user = await getPrimaryUser();
  if (!user.settings) throw new Error("User settings missing");

  let description = input.description?.trim() ?? "";
  let title = input.title;
  const company = input.company;
  let source = input.source ?? "manual";
  let fetchWarning: string | undefined;

  if (input.url && (!description || description.length < 40)) {
    if (isLikelyBlockedJobHost(input.url) && description.length < 40) {
      throw new JobFetchError(
        "Indeed/LinkedIn/Glassdoor block auto-fetch. Paste the full job description (keep the URL) and import again.",
        "blocked",
      );
    }
    try {
      const fetched = await fetchJobUrl(input.url);
      description = fetched.text;
      title = title ?? fetched.title;
      source = source === "manual" ? "url" : source;
    } catch (err) {
      if (err instanceof JobFetchError && description.length >= 40) {
        fetchWarning = err.message;
        source = "url_paste";
      } else if (err instanceof JobFetchError) {
        throw err;
      } else {
        throw err;
      }
    }
  }

  if (!description || description.length < 40) {
    throw new JobFetchError(
      "Paste the full job description (at least a few paragraphs). URL alone is not enough for blocked sites.",
      "empty",
    );
  }

  // Avoid duplicate rows when discovery / import hits the same listing URL twice
  if (input.url) {
    const existing = await prisma.job.findFirst({
      where: { userId: user.id, url: input.url },
      include: { score: true },
    });
    if (existing) {
      return scoreExistingJob(existing.id);
    }
  }

  const parsed = parseJobText({
    description,
    title,
    company,
    url: input.url,
  });

  const listingCategory =
    input.listingCategory ??
    classifyListingCategory({
      location: parsed.location,
      country: parsed.country,
      description: parsed.descriptionClean,
      sponsorshipText: parsed.sponsorshipText,
    });

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      source,
      url: input.url,
      company: parsed.company,
      title: parsed.title,
      location: parsed.location,
      country: parsed.country,
      remoteType: parsed.remoteType,
      employmentType: parsed.employmentType,
      salaryMin: parsed.salaryMin,
      salaryMax: parsed.salaryMax,
      salaryCurrency: parsed.salaryCurrency,
      descriptionRaw: description,
      descriptionClean: parsed.descriptionClean,
      requirementsJson: JSON.stringify(parsed.requirements),
      responsibilitiesJson: JSON.stringify(parsed.responsibilities),
      keywordsJson: JSON.stringify(parsed.keywords),
      seniority: parsed.seniority,
      yearsRequired: parsed.yearsRequired,
      sponsorshipText: parsed.sponsorshipText,
      workAuthorizationText: parsed.workAuthorizationText,
      softFlagsJson: fetchWarning
        ? JSON.stringify([{ code: "url_fetch_fallback", message: fetchWarning, severity: "info" }])
        : "[]",
      listingCategory,
      status: "new",
    },
  });

  void fetchWarning;
  return scoreExistingJob(job.id);
}

export async function scoreExistingJob(jobId: string) {
  const user = await getPrimaryUser();
  if (!user.settings) throw new Error("User settings missing");

  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const [profiles, skills, projects, evidence] = await Promise.all([
    prisma.careerProfile.findMany({ where: { userId: user.id } }),
    prisma.skill.findMany({ where: { userId: user.id } }),
    prisma.project.findMany({ where: { userId: user.id } }),
    prisma.evidenceItem.findMany({ where: { userId: user.id } }),
  ]);

  const ctx = {
    job: {
      title: job.title,
      company: job.company,
      location: job.location,
      country: job.country,
      remoteType: job.remoteType,
      employmentType: job.employmentType,
      descriptionRaw: job.descriptionRaw,
      descriptionClean: job.descriptionClean,
      seniority: job.seniority,
      yearsRequired: job.yearsRequired,
      sponsorshipText: job.sponsorshipText,
      workAuthorizationText: job.workAuthorizationText,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      keywords: parseJsonArray<string>(job.keywordsJson),
      requirements: parseJsonArray<{ text: string; kind: string }>(job.requirementsJson),
      responsibilities: parseJsonArray<string>(job.responsibilitiesJson),
    },
    settings: {
      includeFallbackVideoRoles: user.settings.includeFallbackVideoRoles,
      salaryFloorEur: user.settings.salaryFloorEur,
      salaryFloorSoft: user.settings.salaryFloorSoft,
      canWorkFullTimeNow: user.settings.canWorkFullTimeNow,
    },
    profiles: profiles.map((p) => ({
      key: p.key as ProfileKey,
      name: p.name,
      keywords: parseJsonArray(p.keywordsJson),
      evidenceOrder: parseJsonArray(p.evidenceOrderJson),
      positioning: p.positioning,
    })),
    skills: skills.map((s) => ({
      name: s.name,
      category: s.category,
      keywords: parseJsonArray(s.keywordsJson),
    })),
    projects: projects.map((p) => ({
      key: p.key,
      name: p.name,
      stack: parseJsonArray(p.stackJson),
      useAsEvidenceFor: parseJsonArray(p.useAsEvidenceForJson),
      features: parseJsonArray(p.featuresJson),
    })),
    evidence: evidence.map((e) => ({
      id: e.id,
      title: e.title,
      keywords: parseJsonArray(e.keywordsJson),
      allowedProfiles: parseJsonArray(e.allowedProfilesJson),
      confidence: e.confidence,
      verified: e.verified,
    })),
    defaultProfileKey: profiles.find((p) => p.isDefault)?.key ?? "ux_engineer",
  };

  const heuristic = scoreJob(ctx);
  const judge = await runLlmJudge(ctx, heuristic);
  const result = mergeHeuristicWithJudge(heuristic, judge);

  const profile = profiles.find((p) => p.key === result.recommendedProfileKey);

  const priorFlags = parseJsonArray<{ code?: string; message: string; severity: string }>(
    job.softFlagsJson,
  ).filter((f) => f.code === "url_fetch_fallback");

  const correctedYears = inferYearsRequired(job.descriptionClean || job.descriptionRaw);
  const modelVersion = result.judgeMeta.used
    ? `llm-judge:${result.judgeMeta.provider}:${result.judgeMeta.model}`
    : "deterministic-v1";

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: result.hardRejected ? "rejected" : "scored",
      hardRejectReason: result.hardRejected ? result.hardRejectReason : null,
      yearsRequired: correctedYears ?? null,
      softFlagsJson: JSON.stringify([...priorFlags, ...result.softFlags]),
    },
  });

  await prisma.jobScore.upsert({
    where: { jobId: job.id },
    create: {
      jobId: job.id,
      profileId: profile?.id,
      totalScore: result.totalScore,
      skillsOverlap: result.breakdown.skillsOverlap,
      evidenceStrength: result.breakdown.evidenceStrength,
      projectRelevance: result.breakdown.projectRelevance,
      seniorityFit: result.breakdown.seniorityFit,
      currentEligibility: result.breakdown.currentEligibility,
      longTermPermit: result.breakdown.longTermPermit,
      locationFit: result.breakdown.locationFit,
      salaryFit: result.breakdown.salaryFit,
      careerAlignment: result.breakdown.careerAlignment,
      strengthsJson: JSON.stringify(result.strengths),
      gapsJson: JSON.stringify(result.gaps),
      eligibilityCurrent: result.eligibilityCurrent,
      eligibilityFuture: result.eligibilityFuture,
      recommendedProjectsJson: JSON.stringify(result.recommendedProjects),
      evidenceUsedJson: JSON.stringify(result.evidenceUsed),
      explanationJson: JSON.stringify({ ...result, judgeMeta: result.judgeMeta }),
      modelVersion,
    },
    update: {
      profileId: profile?.id,
      totalScore: result.totalScore,
      skillsOverlap: result.breakdown.skillsOverlap,
      evidenceStrength: result.breakdown.evidenceStrength,
      projectRelevance: result.breakdown.projectRelevance,
      seniorityFit: result.breakdown.seniorityFit,
      currentEligibility: result.breakdown.currentEligibility,
      longTermPermit: result.breakdown.longTermPermit,
      locationFit: result.breakdown.locationFit,
      salaryFit: result.breakdown.salaryFit,
      careerAlignment: result.breakdown.careerAlignment,
      strengthsJson: JSON.stringify(result.strengths),
      gapsJson: JSON.stringify(result.gaps),
      eligibilityCurrent: result.eligibilityCurrent,
      eligibilityFuture: result.eligibilityFuture,
      recommendedProjectsJson: JSON.stringify(result.recommendedProjects),
      evidenceUsedJson: JSON.stringify(result.evidenceUsed),
      explanationJson: JSON.stringify({ ...result, judgeMeta: result.judgeMeta }),
      modelVersion,
      scoredAt: new Date(),
    },
  });

  return prisma.job.findUniqueOrThrow({
    where: { id: job.id },
    include: { score: { include: { profile: true } } },
  });
}
