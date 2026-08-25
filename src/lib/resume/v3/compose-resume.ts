/**
 * Resume Engine V3 orchestrator — selection + Resume Intelligence Layer.
 * Flow: inventory → rank → intelligence → compose claims → validate
 */

import {
  runResumeIntelligence,
  type ResumeStrategyMode,
} from "@/lib/resume-intelligence";
import type { CareerInventory } from "./load-career-profile";
import { composeEducation, composeExperience } from "./compose-experience";
import { composeProjects } from "./compose-projects";
import { composeSkills, composeSummary, composeTechnicalStack } from "./compose-summary";
import { selectNonRepetitiveBullets } from "./no-repetition";
import { rankExperiences } from "./rank-experience";
import { rankProjects, selectProjectsForPage } from "./rank-projects";
import { getRolePolicy, resolveCvTitle } from "./role-policy";
import {
  COMPOSER_VERSION,
  RESUME_SCHEMA_V3,
  type ResumeContentV3,
  type ResumeLink,
} from "./types";
import { validateResumeContentV3 } from "./validate-content";

export interface ComposeResumeV3Input {
  inventory: CareerInventory;
  jobId: string;
  jobTitle: string;
  company: string;
  description: string;
  keywords?: string[];
  requirements?: { text: string }[];
  profileKey: string;
  pageLength: 1 | 2;
  recommendedProjectsFromScore?: string[];
  strategyMode?: ResumeStrategyMode;
}

export function composeResumeV3(input: ComposeResumeV3Input): ResumeContentV3 {
  const jobCorpus = [
    input.jobTitle,
    input.company,
    input.description,
    ...(input.keywords ?? []),
    ...(input.requirements ?? []).map((r) => r.text),
  ]
    .join(" ")
    .toLowerCase();

  const policy = getRolePolicy(input.profileKey);
  const professionalTitle = resolveCvTitle(input.profileKey, input.jobTitle);

  const rankedProjects = rankProjects({
    inventory: input.inventory,
    profileKey: input.profileKey,
    jobTitle: input.jobTitle,
    jobCorpus,
    recommendedFromScore: input.recommendedProjectsFromScore,
    pageLength: input.pageLength,
  });
  const selectedRanked = selectProjectsForPage(rankedProjects, input.pageLength, input.profileKey);

  const rankedExp = rankExperiences({
    inventory: input.inventory,
    profileKey: input.profileKey,
    jobCorpus,
    pageLength: input.pageLength,
  });

  // Resume Intelligence Layer — evidence → signals → bullet quality → strategy
  const intelligence = runResumeIntelligence({
    inventory: input.inventory,
    profileKey: input.profileKey,
    jobCorpus,
    mode: input.strategyMode,
    selectedExperienceIds: rankedExp.map((r) => r.experienceId),
    selectedProjectKeys: selectedRanked.map((r) => r.projectKey),
  });

  // Prefer higher engineering-signal projects when scores are close (impressiveness)
  const intelByProject = new Map(intelligence.projects.map((p) => [p.projectKey, p]));
  const reorderedProjects = [...selectedRanked].sort((a, b) => {
    const ia = intelByProject.get(a.projectKey)?.engineeringScore ?? 0;
    const ib = intelByProject.get(b.projectKey)?.engineeringScore ?? 0;
    if (Math.abs(ib - ia) > 0.08) return ib - ia;
    return 0;
  });

  let selectedProjects = composeProjects({
    inventory: input.inventory,
    ranked: reorderedProjects,
    profileKey: input.profileKey,
    pageLength: input.pageLength,
  });

  let experience = composeExperience({
    inventory: input.inventory,
    ranked: rankedExp,
    profileKey: input.profileKey,
    pageLength: input.pageLength,
  });

  // Apply intelligence-selected bullets (quality-ranked, mode-aware).
  // Keep companyBlurb as business summary — never replace with intelligence one-liners.
  const intelExp = new Map(intelligence.experiences.map((e) => [e.id, e]));
  experience = experience.map((e) => {
    const intel = intelExp.get(e.experienceId);
    if (!intel?.candidateBullets.length) return e;
    const mapped = intel.candidateBullets.map((b) => ({
      text: b.text,
      evidenceIds: b.evidenceIds.length ? b.evidenceIds : e.evidenceIds,
      claimType: "verified" as const,
      confidence: Math.min(0.95, 0.7 + b.engineeringScore * 0.25),
      numericClaims: b.metricTexts,
      sourceSection: "experience" as const,
    }));
    return {
      ...e,
      bullets: selectNonRepetitiveBullets(e.companyBlurb, mapped, mapped.length),
    };
  });

  const intelProj = new Map(intelligence.projects.map((p) => [p.projectKey, p]));
  selectedProjects = selectedProjects.map((p) => {
    const intel = intelProj.get(p.projectKey);
    if (!intel?.candidateBullets.length) return p;
    return {
      ...p,
      oneLineSummary: intel.oneSentenceSummary || p.oneLineSummary,
      bullets: intel.candidateBullets.map((b) => ({
        text: b.text,
        evidenceIds: b.evidenceIds.length ? b.evidenceIds : p.evidenceIds,
        claimType: "verified" as const,
        confidence: Math.min(0.95, 0.7 + b.engineeringScore * 0.25),
        numericClaims: b.metricTexts,
        sourceSection: "selectedProjects",
      })),
    };
  });

  const summary = composeSummary({
    inventory: input.inventory,
    profileKey: input.profileKey,
    jobTitle: input.jobTitle,
    company: input.company,
    selectedProjectNames: selectedProjects.map((p) => p.name),
  });

  const skills = composeSkills({
    inventory: input.inventory,
    profileKey: input.profileKey,
    jobCorpus,
    pageLength: input.pageLength,
  });

  const education = composeEducation(input.inventory, {
    compress:
      input.pageLength === 2 &&
      (input.profileKey === "ai_engineer" || input.profileKey === "applied_ai") &&
      experience.length >= 4,
  });
  const technicalStack = composeTechnicalStack({
    inventory: input.inventory,
    profileKey: input.profileKey,
    pageLength: input.pageLength,
  });

  const links: ResumeLink[] = [
    { label: "LinkedIn", url: input.inventory.settings.linkedinUrl },
    { label: "Portfolio", url: input.inventory.settings.portfolioUrl },
    { label: "GitHub", url: input.inventory.settings.githubUrl },
  ].filter((l) => l.url);

  const location = input.inventory.settings.location?.trim() || "Location on file";
  const contactLine = `${location} | ${input.inventory.settings.phone || ""} | ${input.inventory.settings.contactEmail}`.replace(/\|\s*\|/g, "|").trim();

  const engineeringScores: Record<string, number> = {};
  for (const e of intelligence.experiences) engineeringScores[e.company] = e.engineeringScore;
  for (const p of intelligence.projects) engineeringScores[p.projectKey] = p.engineeringScore;

  const sectionOrder = [
    ...policy.sectionOrder.filter((s) => {
      if (s === "selectedProjects") return selectedProjects.length > 0;
      if (s === "education") return education.length > 0;
      if (s === "technicalStack") return Boolean(technicalStack?.length);
      return true;
    }),
  ];

  const draft: ResumeContentV3 = {
    schemaVersion: RESUME_SCHEMA_V3,
    target: {
      jobId: input.jobId,
      title: input.jobTitle,
      company: input.company,
      profileKey: input.profileKey,
    },
    header: {
      name: input.inventory.name,
      professionalTitle,
      contactLine,
      links,
    },
    summary,
    skills,
    selectedProjects,
    experience,
    education,
    technicalStack,
    sectionOrder,
    evidenceMap: {},
    validation: {
      status: "passed",
      blockedClaims: [],
      unsupportedClaims: [],
      warnings: intelligence.lint.map((w) => w.message),
      estimateWarnings: [],
      approvedClaims: [],
      evidenceMap: {},
    },
    generationMetadata: {
      composerVersion: COMPOSER_VERSION,
      promptVersion: `v3-intelligence-${intelligence.strategy.mode}`,
      modelVersion: "resume-intelligence-v1",
      generatedAt: new Date().toISOString(),
      pageLength: input.pageLength,
      intelligence: {
        strategyMode: intelligence.strategy.mode,
        atsScoreTotal: intelligence.atsScore.total,
        humanReviewRequired: intelligence.humanReviewRequired,
        lintCount: intelligence.lint.length,
        engineeringScores,
      },
    },
    intelligenceBundle: intelligence,
  };

  const validation = validateResumeContentV3(draft, input.inventory);
  // Merge intelligence warnings without failing on missing story fields alone
  draft.validation = {
    ...validation,
    warnings: [...new Set([...(validation.warnings ?? []), ...intelligence.lint.map((w) => w.message)])],
  };
  draft.evidenceMap = validation.evidenceMap;

  return draft;
}
