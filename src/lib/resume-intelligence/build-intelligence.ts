/**
 * Evidence extraction + Experience/Project Intelligence builders.
 */

import type { CareerInventory, LoadedExperience, LoadedProject } from "@/lib/resume/v3/load-career-profile";
import { formatExperienceDates } from "@/lib/resume/v3/rank-experience";
import { formatProjectDates } from "@/lib/resume/v3/rank-projects";
import { evaluateBullet, rankBullets, suggestBulletRewrite } from "./bullet-quality";
import {
  detectBusinessImpact,
  detectEngineeringSignals,
  extractMetricsFromText,
} from "./engineering-signals";
import { curatedBulletsForProject } from "./story-bullets";
import type {
  EvidenceCard,
  ExperienceIntelligence,
  ProjectIntelligence,
  ResumeStrategyMode,
} from "./types";

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function truncateSummary(s: string, maxWords = 24): string {
  const words = s.trim().split(/\s+/);
  if (words.length <= maxWords) return s.trim();
  return words.slice(0, maxWords).join(" ").replace(/[,:;]$/, "") + ".";
}

function corpusFromExperience(exp: LoadedExperience): string {
  return [
    exp.umbrellaTitle,
    exp.officialTitle,
    exp.companyContext,
    ...exp.themes,
    ...exp.bullets,
    ...exp.resumeBullets.map((b) => b.text),
    ...exp.evidence.map((e) => `${e.title} ${e.description}`),
  ]
    .filter(Boolean)
    .join("\n");
}

function corpusFromProject(p: LoadedProject): string {
  return [
    p.name,
    p.shortSummary,
    p.problemStatement,
    p.solutionSummary,
    p.technicalSummary,
    ...p.features,
    ...p.outcomes,
    ...p.stack,
    ...p.resumeBullets.map((b) => b.text),
    ...p.evidence.map((e) => `${e.title} ${e.description}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export function extractEvidenceCardFromExperience(exp: LoadedExperience): EvidenceCard {
  const corpus = corpusFromExperience(exp);
  const evidenceIds = exp.evidence.map((e) => e.id);
  const metrics = [
    ...extractMetricsFromText(corpus, evidenceIds),
    ...exp.evidence.flatMap((e) =>
      e.metrics
        .filter((m) => m.approvedForCV)
        .map((m) => ({
          text: m.valueText ?? String(m.value ?? m.label),
          kind: "other" as const,
          approved: true,
          evidenceIds: [e.id],
        })),
    ),
  ];
  return {
    id: exp.id,
    sourceType: "experience",
    sourceKey: exp.company,
    companyOrName: exp.company,
    role: exp.officialTitle || exp.umbrellaTitle,
    timeline: formatExperienceDates(exp),
    location: exp.location ?? undefined,
    problem: exp.companyContext ?? undefined,
    constraints: [],
    responsibilities: exp.resumeBullets.map((b) => b.text).concat(exp.bullets),
    architecture: [],
    technologies: [],
    systemsDesigned: [],
    engineeringDecisions: [],
    integrations: [],
    metrics,
    outcome: exp.bullets.filter((b) => /increas|reduc|improv|grew|deliver/i.test(b)),
    lessons: [],
    evidenceIds,
    rawCorpus: corpus,
  };
}

export function extractEvidenceCardFromProject(p: LoadedProject): EvidenceCard {
  const corpus = corpusFromProject(p);
  const evidenceIds = p.evidence.map((e) => e.id);
  return {
    id: p.id,
    sourceType: "project",
    sourceKey: p.key,
    companyOrName: p.name,
    role: p.primaryRole,
    timeline: formatProjectDates(p),
    problem: p.problemStatement ?? undefined,
    context: p.shortSummary ?? undefined,
    constraints: p.constraints,
    responsibilities: p.resumeBullets.map((b) => b.text),
    architecture: p.technicalSummary ? [p.technicalSummary] : [],
    technologies: p.stack,
    systemsDesigned: p.features,
    engineeringDecisions: [],
    integrations: p.stack.filter((s) => /api|firebase|supabase|etsy/i.test(s)),
    metrics: extractMetricsFromText(corpus, evidenceIds),
    outcome: p.outcomes,
    lessons: [],
    evidenceIds,
    rawCorpus: corpus,
  };
}

function missingStory(fields: Record<string, unknown>): string[] {
  const missing: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v == null || v === "" || (Array.isArray(v) && !v.length)) missing.push(k);
  }
  return missing;
}

export function buildExperienceIntelligence(
  exp: LoadedExperience,
  profileKey: string,
): ExperienceIntelligence {
  const card = extractEvidenceCardFromExperience(exp);
  const eng = detectEngineeringSignals(card.rawCorpus);
  const impactScore = detectBusinessImpact(card.rawCorpus, card.metrics);

  const candidates = (exp.resumeBullets.length ? exp.resumeBullets : exp.bullets.map((text) => ({ text })))
    .filter((b) => {
      const profiles = (b as { profiles?: string[] }).profiles;
      if (!profiles?.length || profiles.includes("*")) return true;
      return profiles.includes(profileKey);
    })
    .map((b) => evaluateBullet(b.text, card.evidenceIds));

  const summary =
    exp.companyContext?.replace(/\([^)]*layoff[^)]*\)/gi, "").trim() ||
    candidates.find((c) => c.quality === "strong" || c.quality === "acceptable")?.text ||
    `${exp.umbrellaTitle} at ${exp.company}.`;

  return {
    id: exp.id,
    company: exp.company,
    role: exp.officialTitle || exp.umbrellaTitle,
    timeline: card.timeline,
    location: exp.location ?? undefined,
    oneSentenceSummary: truncateSummary(summary, 28),
    problem: card.problem,
    solution: candidates[0]?.text,
    engineering: eng.signals.map((s) => s.replace(/_/g, " ")),
    impact: card.metrics.filter((m) => m.approved).map((m) => m.text),
    technology: [],
    confidence: Math.min(1, 0.5 + eng.score * 0.3 + impactScore * 0.2),
    evidenceIds: card.evidenceIds,
    engineeringSignals: eng.signals,
    engineeringScore: eng.score,
    businessImpactScore: impactScore,
    missingStoryFields: missingStory({
      problem: card.problem,
      outcome: card.outcome.length ? card.outcome : card.metrics.length ? ["metrics"] : [],
    }),
    candidateBullets: rankBullets(candidates),
  };
}

export function buildProjectIntelligence(p: LoadedProject, profileKey: string): ProjectIntelligence {
  const card = extractEvidenceCardFromProject(p);
  const eng = detectEngineeringSignals(card.rawCorpus);
  const impactScore = detectBusinessImpact(card.rawCorpus, card.metrics);

  const curated = curatedBulletsForProject(p.key, profileKey);
  const source =
    curated.length > 0
      ? curated
      : p.resumeBullets.length
        ? p.resumeBullets
        : p.outcomes.map((text) => ({ text, profiles: ["*"] as string[] }));

  const candidates = source
    .filter((b) => {
      const profiles = (b as { profiles?: string[] }).profiles;
      if (!profiles?.length || profiles.includes("*")) return true;
      return profiles.includes(profileKey);
    })
    .map((b) => evaluateBullet(b.text, card.evidenceIds));

  let summary = p.shortSummary ?? p.solutionSummary ?? `${p.name} — ${p.primaryRole}`;
  if (wordCount(summary) > 25) summary = truncateSummary(summary, 24);

  const links = [
    p.projectUrl && { label: "Project", url: p.projectUrl },
    p.githubUrl && { label: "GitHub", url: p.githubUrl },
    p.caseStudyUrl && { label: "Case study", url: p.caseStudyUrl },
    p.demoUrl && { label: "Demo", url: p.demoUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  return {
    id: p.id,
    projectKey: p.key,
    name: p.name,
    timeline: card.timeline,
    role: p.roleVariants[profileKey] || p.primaryRole,
    oneSentenceSummary: summary,
    problem: p.problemStatement ?? undefined,
    solution: p.solutionSummary ?? undefined,
    engineering: eng.signals.map((s) => s.replace(/_/g, " ")),
    impact: card.metrics.filter((m) => m.approved).map((m) => m.text),
    technology: p.stack,
    confidence: Math.min(1, 0.55 + eng.score * 0.3 + impactScore * 0.15),
    evidenceIds: card.evidenceIds,
    engineeringSignals: eng.signals,
    engineeringScore: eng.score,
    businessImpactScore: impactScore,
    missingStoryFields: missingStory({
      problem: p.problemStatement,
      summary: p.shortSummary,
      outcome: p.outcomes.length ? p.outcomes : null,
    }),
    candidateBullets: rankBullets(candidates),
    links: links.length ? links : undefined,
  };
}

export function buildIntelligenceFromInventory(
  inventory: CareerInventory,
  profileKey: string,
  mode: ResumeStrategyMode = "technical",
) {
  const experiences = inventory.experiences
    .filter((e) => e.approvedForCV && e.verified)
    .map((e) => buildExperienceIntelligence(e, profileKey));
  const projects = inventory.projects
    .filter((p) => p.approvedForCV && p.verified)
    .map((p) => buildProjectIntelligence(p, profileKey));

  // Sort by combined impressiveness for strategy awareness
  experiences.sort(
    (a, b) => b.engineeringScore * 0.6 + b.businessImpactScore * 0.4 - (a.engineeringScore * 0.6 + a.businessImpactScore * 0.4),
  );
  projects.sort(
    (a, b) => b.engineeringScore * 0.7 + b.businessImpactScore * 0.3 - (a.engineeringScore * 0.7 + a.businessImpactScore * 0.3),
  );

  const suggestions = [...experiences, ...projects].flatMap((entry) =>
    entry.candidateBullets
      .filter((b) => b.quality === "weak" || b.quality === "rejected")
      .map((b) => {
        const suggested = suggestBulletRewrite(b);
        return suggested
          ? { original: b.text, suggested, reason: b.rejectReasons.join("; ") || "Weak bullet", status: "pending" as const }
          : null;
      })
      .filter(Boolean),
  );

  return { experiences, projects, mode, suggestions };
}
