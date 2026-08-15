/**
 * Experience ranking + truthful title policy.
 * Resume order uses preferredOrderByRole → relevanceScore → chronologyIndex.
 * Timelines should continue to use chronologyIndex.
 */

import { formatLockedOrRange, formatResumeDateRange } from "./date-format";
import type { CareerInventory, LoadedExperience } from "./load-career-profile";
import { getRolePolicy } from "./role-policy";
import { resolveOfficialExperienceTitle } from "./title-policy";

export interface RankedExperience {
  experienceId: string;
  score: number;
  experience: LoadedExperience;
}

export interface ExperienceTitleDisplay {
  title: string;
  /** @deprecated Title policy no longer invents functional-focus title replacements */
  functionalFocus?: string;
  company: string;
  /** Candidate-facing company context — business summary, never contribution copy */
  companyBlurb?: string;
  titleWarnings?: string[];
}

const AI_ENGINEER_MANDATORY = ["irish ai creative", "two blokes", "independent", "arcop"] as const;

export function resolveExperienceTitle(
  exp: LoadedExperience,
  _profileKey: string,
): ExperienceTitleDisplay {
  const resolved = resolveOfficialExperienceTitle(exp);

  let companyBlurb = exp.companyContext ?? undefined;
  if (companyBlurb) {
    let cleaned = companyBlurb
      .replace(/\s*\([^)]*layoff[^)]*\)\.?/gi, ".")
      .replace(/\s*ended[^.]*(layoff|laid off)[^.]*\.?/gi, ".")
      .replace(/\s{2,}/g, " ")
      .replace(/\.\s*\./g, ".")
      .trim();
    if (/without inventing|unverified metrics/i.test(cleaned)) {
      cleaned = "";
    }
    // Contribution-style blurbs belong in bullets, not company summary
    if (/^(contributed|expanded|built|designed|produced|grew|increased)\b/i.test(cleaned)) {
      cleaned = "";
    }
    companyBlurb = cleaned || undefined;
  }

  return {
    title: resolved.title,
    functionalFocus: undefined,
    company: exp.company,
    companyBlurb,
    titleWarnings: resolved.warnings,
  };
}

export function formatExperienceDates(exp: LoadedExperience): string {
  if (/irish ai creative/i.test(exp.company)) {
    return formatLockedOrRange("irish_ai", exp.startDate, exp.endDate, exp.isCurrent);
  }
  if (/two blokes/i.test(exp.company)) {
    return formatLockedOrRange("two_blokes", exp.startDate, exp.endDate, exp.isCurrent);
  }
  if (/arcop/i.test(exp.company)) {
    return formatLockedOrRange("arcop", exp.startDate, exp.endDate, exp.isCurrent);
  }
  return formatResumeDateRange(exp.startDate, exp.endDate, exp.isCurrent);
}

function matchCompany(exp: LoadedExperience, needle: string) {
  return exp.company.toLowerCase().includes(needle.toLowerCase());
}

function roleOrder(exp: LoadedExperience, profileKey: string): number | undefined {
  const order = exp.preferredOrderByRole?.[profileKey];
  return typeof order === "number" ? order : undefined;
}

/**
 * Sort key: preferredOrderByRole (asc) → relevanceScore (desc) → chronologyIndex (asc).
 */
export function compareExperiencesForResume(a: LoadedExperience, b: LoadedExperience, profileKey: string): number {
  const ao = roleOrder(a, profileKey);
  const bo = roleOrder(b, profileKey);
  if (ao != null && bo != null && ao !== bo) return ao - bo;
  if (ao != null && bo == null) return -1;
  if (ao == null && bo != null) return 1;

  if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
  if (a.chronologyIndex !== b.chronologyIndex) return a.chronologyIndex - b.chronologyIndex;
  return a.sortOrder - b.sortOrder;
}

export function rankExperiences(opts: {
  inventory: CareerInventory;
  profileKey: string;
  jobCorpus: string;
  pageLength: 1 | 2;
}): RankedExperience[] {
  const policy = getRolePolicy(opts.profileKey);
  const themes = policy.experiencePriorityThemes;
  const aiLike = opts.profileKey === "ai_engineer" || opts.profileKey === "applied_ai";

  const eligible = opts.inventory.experiences.filter((e) => e.approvedForCV && e.verified);

  const scored = eligible.map((exp) => {
    const blob = `${exp.umbrellaTitle} ${exp.themes.join(" ")} ${exp.bullets.join(" ")}`.toLowerCase();
    const themeHits = themes.filter((t) => blob.includes(t.toLowerCase())).length;
    const jdHits = exp.themes.filter((t) => opts.jobCorpus.includes(t.toLowerCase())).length;
    const recency = /2026/.test(exp.startDate) || /2026/.test(exp.endDate ?? "")
      ? 1
      : /2025/.test(exp.startDate) || /2025/.test(exp.endDate ?? "")
        ? 0.75
        : 0.4;

    const computed =
      themeHits * 0.35 +
      jdHits * 0.25 +
      recency * 0.25 +
      (1 / (exp.sortOrder + 1)) * 0.15 +
      exp.relevanceScore * 0.5;

    return { experienceId: exp.id, score: computed, experience: exp };
  });

  // AI Engineer / Applied AI: mandatory set, role-preferred order (never drop Two Blokes / Arcop on 2-page)
  if (aiLike) {
    const byNeedle = (needle: string) => scored.find((r) => matchCompany(r.experience, needle));
    const mandatory = AI_ENGINEER_MANDATORY.map((n) => byNeedle(n)).filter(Boolean) as RankedExperience[];

    if (opts.pageLength === 2) {
      // Prefer preferredOrderByRole ordering among mandatory
      mandatory.sort((a, b) => compareExperiencesForResume(a.experience, b.experience, opts.profileKey));
      return mandatory;
    }

    // One-page: keep Irish AI + Two Blokes (compressed) when present; else top by role order
    const onePage = scored
      .slice()
      .sort((a, b) => compareExperiencesForResume(a.experience, b.experience, opts.profileKey))
      .slice(0, 2);
    // Ensure Irish AI is first if present
    const irish = byNeedle("irish ai creative");
    if (irish && !onePage.some((r) => r.experienceId === irish.experienceId)) {
      return [irish, ...onePage.slice(0, 1)];
    }
    return onePage;
  }

  return scored
    .slice()
    .sort((a, b) => compareExperiencesForResume(a.experience, b.experience, opts.profileKey))
    .slice(0, opts.pageLength === 1 ? 3 : 4);
}
