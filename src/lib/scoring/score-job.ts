import {
  DEFAULT_PROFILE_KEY,
  SCORE_WEIGHTS,
  type JobScoreResult,
  type ProfileKey,
  type ScoreBreakdown,
  type SoftFlag,
} from "@/lib/types";
import { inferYearsRequired, runHardFilters, type FilterableJob, type FilterSettings } from "@/lib/scoring/hard-filters";

export interface ScoringProfile {
  key: ProfileKey | string;
  name: string;
  keywords: string[];
  evidenceOrder: string[];
  positioning: string;
}

export interface ScoringSkill {
  name: string;
  category: string;
  keywords: string[];
}

export interface ScoringProject {
  key: string;
  name: string;
  stack: string[];
  useAsEvidenceFor: string[];
  features: string[];
}

export interface ScoringEvidence {
  id: string;
  title: string;
  keywords: string[];
  allowedProfiles: string[];
  confidence: string;
  verified: boolean;
}

export interface ScoringContext {
  job: FilterableJob & {
    keywords?: string[];
    requirements?: { text: string; kind: string }[];
    responsibilities?: string[];
  };
  settings: FilterSettings;
  profiles: ScoringProfile[];
  skills: ScoringSkill[];
  projects: ScoringProject[];
  evidence: ScoringEvidence[];
  defaultProfileKey?: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function weightedTotal(b: ScoreBreakdown): number {
  const sum =
    b.skillsOverlap * SCORE_WEIGHTS.skillsOverlap +
    b.evidenceStrength * SCORE_WEIGHTS.evidenceStrength +
    b.projectRelevance * SCORE_WEIGHTS.projectRelevance +
    b.seniorityFit * SCORE_WEIGHTS.seniorityFit +
    b.currentEligibility * SCORE_WEIGHTS.currentEligibility +
    b.longTermPermit * SCORE_WEIGHTS.longTermPermit +
    b.locationFit * SCORE_WEIGHTS.locationFit +
    b.salaryFit * SCORE_WEIGHTS.salaryFit +
    b.careerAlignment * SCORE_WEIGHTS.careerAlignment;
  return Math.round(sum);
}

function jobCorpus(ctx: ScoringContext): string {
  const reqs = (ctx.job.requirements ?? []).map((r) => r.text).join(" ");
  const resp = (ctx.job.responsibilities ?? []).join(" ");
  const kws = (ctx.job.keywords ?? []).join(" ");
  return `${ctx.job.title} ${ctx.job.descriptionClean || ctx.job.descriptionRaw} ${reqs} ${resp} ${kws}`.toLowerCase();
}

function skillOverlapScore(ctx: ScoringContext, corpus: string): {
  score: number;
  matched: string[];
  missing: string[];
} {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of ctx.skills) {
    const aliases = unique([skill.name.toLowerCase(), ...skill.keywords.map((k) => k.toLowerCase())]);
    const hit = aliases.some((a) => a.length > 1 && corpus.includes(a));
    if (hit) matched.push(skill.name);
  }

  // Extract likely required tech tokens from job for gap detection
  const techHints = [
    "react",
    "typescript",
    "javascript",
    "next.js",
    "nextjs",
    "tailwind",
    "figma",
    "python",
    "node.js",
    "aws",
    "azure",
    "gcp",
    "graphql",
    "vue",
    "angular",
    "swift",
    "kotlin",
    "java ",
    "c++",
    "rust",
    "docker",
    "kubernetes",
  ];

  const owned = new Set(
    ctx.skills.flatMap((s) => [s.name.toLowerCase(), ...s.keywords.map((k) => k.toLowerCase())]),
  );

  for (const hint of techHints) {
    if (corpus.includes(hint.trim()) && ![...owned].some((o) => o.includes(hint.trim()) || hint.trim().includes(o))) {
      // only flag if present in job and not owned
      const ownedHit = [...owned].some((o) => corpus.includes(o) && (o.includes(hint.trim()) || hint.includes(o)));
      if (!ownedHit && !matched.some((m) => m.toLowerCase().includes(hint.trim()))) {
        if (corpus.includes(hint.trim()) && !owned.has(hint.trim())) {
          const label = hint.trim();
          if (!missing.includes(label) && corpus.includes(label)) missing.push(label);
        }
      }
    }
  }

  // Simpler missing detection: tech hints in job not in skill inventory
  const missingClean: string[] = [];
  for (const hint of techHints) {
    const h = hint.trim();
    if (!corpus.includes(h)) continue;
    const has = [...owned].some((o) => o === h || o.includes(h) || h.includes(o));
    if (!has) missingClean.push(h);
  }

  const coverage = ctx.skills.length === 0 ? 0 : matched.length / Math.min(ctx.skills.length, 40);
  // Blend coverage with density of matches
  const density = clamp01(matched.length / 8);
  const score = clamp01(coverage * 0.35 + density * 0.65);

  return { score, matched: unique(matched).slice(0, 20), missing: unique(missingClean).slice(0, 8) };
}

function pickProfile(ctx: ScoringContext, corpus: string): ScoringProfile {
  const defaultKey = ctx.defaultProfileKey ?? DEFAULT_PROFILE_KEY;
  let best = ctx.profiles.find((p) => p.key === defaultKey) ?? ctx.profiles[0];
  let bestScore = -1;

  for (const profile of ctx.profiles) {
    const hits = profile.keywords.filter((k) => corpus.includes(k.toLowerCase())).length;
    const titleBoost =
      corpus.includes(profile.name.toLowerCase()) ||
      profile.keywords.some((k) => ctx.job.title.toLowerCase().includes(k.toLowerCase()))
        ? 3
        : 0;
    // Bias toward default when close
    const bias = profile.key === defaultKey ? 1.5 : 0;
    const s = hits + titleBoost + bias;
    if (s > bestScore) {
      bestScore = s;
      best = profile;
    }
  }

  return best;
}

function projectRelevance(
  ctx: ScoringContext,
  profile: ScoringProfile,
  corpus: string,
): { score: number; projects: string[]; evidenceTitles: string[] } {
  const ranked = ctx.projects
    .map((p) => {
      const stackHits = p.stack.filter((s) => corpus.includes(s.toLowerCase())).length;
      const profileHit = p.useAsEvidenceFor.some(
        (u) =>
          u.toLowerCase().includes(profile.name.toLowerCase().split(" ")[0]) ||
          profile.key.includes(u.toLowerCase().replace(/\s+/g, "_")),
      )
        ? 2
        : 0;
      const orderBoost = profile.evidenceOrder.findIndex(
        (e) => e.toLowerCase() === p.name.toLowerCase() || e.toLowerCase() === p.key.toLowerCase(),
      );
      const orderScore = orderBoost >= 0 ? (5 - orderBoost) * 0.4 : 0;
      return { project: p, score: stackHits + profileHit + orderScore };
    })
    .sort((a, b) => b.score - a.score);

  const top = ranked.filter((r) => r.score > 0).slice(0, 3);
  const fallback = ranked.slice(0, 3);
  const chosen = top.length ? top : fallback;
  const maxPossible = 10;
  const raw = chosen.reduce((acc, c) => acc + c.score, 0) / maxPossible;

  const evidenceTitles = ctx.evidence
    .filter((e) => e.verified && e.allowedProfiles.some((ap) => ap === profile.key || ap === "*" || profile.name.toLowerCase().includes(ap.toLowerCase())))
    .slice(0, 8)
    .map((e) => e.title);

  return {
    score: clamp01(raw),
    projects: chosen.map((c) => c.project.name),
    evidenceTitles,
  };
}

function seniorityFit(job: FilterableJob): number {
  const title = job.title.toLowerCase();
  const text = `${job.descriptionClean || job.descriptionRaw}`.toLowerCase();
  const years = job.yearsRequired ?? inferYearsRequired(`${title}\n${text}`);

  let base = 0.88;
  if (/\b(junior|graduate|entry[- ]level|associate)\b/.test(title)) base = 0.82;
  else if (/\b(mid[- ]level|intermediate)\b/.test(title)) base = 0.95;
  else if (/\b(senior|lead)\b/.test(title)) base = 0.22;
  else if (/\b(staff|principal|director|head of|vp\b)\b/.test(title)) base = 0.05;
  // Exact mid titles without senior — UX/UI Designer, Product Designer, etc.
  else if (/\b(ux[/ ]?ui|ui[/ ]?ux|ux designer|ui designer|product designer|ux engineer|design engineer)\b/.test(title)) {
    base = 0.94;
  }

  if (years != null) {
    if (years >= 8) base = Math.min(base, 0.08);
    else if (years >= 6) base = Math.min(base, 0.18);
    else if (years >= 5) base = Math.min(base, 0.32);
    else if (years >= 4) base = Math.min(base, 0.5);
    else if (years <= 2) base = Math.max(base, 0.9);
  }

  return clamp01(base);
}

function locationFit(job: FilterableJob): number {
  const loc = `${job.location ?? ""} ${job.country ?? ""} ${job.remoteType ?? ""}`.toLowerCase();
  const desc = (job.descriptionClean || job.descriptionRaw).toLowerCase();
  if (/\bdublin\b/.test(loc) || /\bireland\b/.test(loc)) return 1;
  if (job.remoteType === "hybrid" && /\bireland\b/.test(desc)) return 0.9;
  if (job.remoteType === "remote" && /\bireland\b|\beu\b|\beurope\b/.test(desc + loc)) return 0.85;
  if (job.remoteType === "remote") return 0.55;
  if (!loc.trim()) return 0.6;
  return 0.45;
}

function salaryFit(job: FilterableJob, settings: FilterSettings): number {
  if (job.salaryMin == null && job.salaryMax == null) return 0.7;
  const currency = (job.salaryCurrency ?? "EUR").toUpperCase();
  if (currency !== "EUR") return 0.65;
  const max = job.salaryMax ?? job.salaryMin ?? 0;
  if (max >= settings.salaryFloorEur) return 1;
  if (settings.salaryFloorSoft) return 0.55;
  return 0.3;
}

function eligibilityScores(
  current: string,
  future: string,
): { current: number; future: number } {
  const currentMap: Record<string, number> = {
    eligible_now: 1,
    likely_eligible_now: 0.85,
    unclear: 0.5,
    not_eligible: 0,
  };
  const futureMap: Record<string, number> = {
    long_term_sponsorship_promising: 1,
    long_term_sponsorship_possible: 0.75,
    unknown: 0.55,
    long_term_sponsorship_unlikely: 0.35,
  };
  return {
    current: currentMap[current] ?? 0.5,
    future: futureMap[future] ?? 0.5,
  };
}

export function scoreJob(ctx: ScoringContext): JobScoreResult {
  const filter = runHardFilters(ctx.job, ctx.settings);
  const softFlags: SoftFlag[] = [...filter.softFlags];

  if (filter.rejected) {
    return {
      totalScore: 0,
      breakdown: {
        skillsOverlap: 0,
        evidenceStrength: 0,
        projectRelevance: 0,
        seniorityFit: 0,
        currentEligibility: 0,
        longTermPermit: 0,
        locationFit: 0,
        salaryFit: 0,
        careerAlignment: 0,
      },
      recommendedProfileKey: ctx.defaultProfileKey ?? DEFAULT_PROFILE_KEY,
      strengths: [],
      gaps: [filter.reason ?? "Hard rejected"],
      eligibilityCurrent: filter.eligibilityCurrent,
      eligibilityFuture: filter.eligibilityFuture,
      recommendedProjects: [],
      evidenceUsed: [],
      softFlags,
      hardRejected: true,
      hardRejectReason: filter.reason,
    };
  }

  const corpus = jobCorpus(ctx);
  const profile = pickProfile(ctx, corpus);
  const skills = skillOverlapScore(ctx, corpus);
  const projects = projectRelevance(ctx, profile, corpus);
  const elig = eligibilityScores(filter.eligibilityCurrent, filter.eligibilityFuture);

  const verifiedEvidence = ctx.evidence.filter((e) => e.verified);
  const evidenceStrength = clamp01(
    verifiedEvidence.filter((e) =>
      e.keywords.some((k) => corpus.includes(k.toLowerCase())) ||
      tokenize(e.title).some((t) => corpus.includes(t)),
    ).length / Math.max(6, Math.min(verifiedEvidence.length, 12)),
  );

  const careerAlignment = clamp01(
    profile.keywords.filter((k) => corpus.includes(k.toLowerCase())).length / Math.max(profile.keywords.length * 0.35, 3),
  );

  const breakdown: ScoreBreakdown = {
    skillsOverlap: skills.score,
    evidenceStrength,
    projectRelevance: projects.score,
    seniorityFit: seniorityFit(ctx.job),
    currentEligibility: elig.current,
    longTermPermit: elig.future,
    locationFit: locationFit(ctx.job),
    salaryFit: salaryFit(ctx.job, ctx.settings),
    careerAlignment,
  };

  const totalScore = weightedTotal(breakdown);

  const strengths: string[] = [];
  if (skills.matched.length) {
    strengths.push(`Strong skills overlap: ${skills.matched.slice(0, 6).join(", ")}`);
  }
  if (projects.projects.length) {
    strengths.push(`Relevant project evidence: ${projects.projects.join(", ")}`);
  }
  strengths.push(`Recommended profile: ${profile.name}`);
  if (breakdown.locationFit >= 0.85) strengths.push("Location / work mode aligns with Dublin/Ireland targeting");
  if (breakdown.currentEligibility >= 0.8) strengths.push("Likely eligible to start under Stamp 1G");

  const gaps: string[] = [];
  for (const m of skills.missing.slice(0, 5)) {
    gaps.push(`${m} mentioned but not in verified skill inventory`);
  }
  for (const flag of softFlags) {
    if (flag.severity === "warn") gaps.push(flag.message);
  }
  if (breakdown.seniorityFit < 0.45) {
    gaps.push("Seniority / years asked are a poor fit for current mid-level band");
  } else if (breakdown.seniorityFit < 0.7) {
    gaps.push("Title seniority may be a stretch");
  }

  return {
    totalScore,
    breakdown,
    recommendedProfileKey: profile.key,
    strengths,
    gaps,
    eligibilityCurrent: filter.eligibilityCurrent,
    eligibilityFuture: filter.eligibilityFuture,
    recommendedProjects: projects.projects,
    evidenceUsed: projects.evidenceTitles,
    softFlags,
    hardRejected: false,
  };
}
