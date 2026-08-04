/**
 * Deterministic project ranking for Resume Engine V3.
 */

import { PROJECT_RANK_WEIGHTS } from "@/lib/types";
import { formatLockedOrRange } from "./date-format";
import type { CareerInventory, LoadedProject } from "./load-career-profile";
import { getRolePolicy } from "./role-policy";
import type { RankedProject } from "./types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function corpusIncludes(corpus: string, term: string) {
  const t = term.toLowerCase().trim();
  if (t.length < 2) return false;
  return corpus.includes(t);
}

function statusScore(status: string, isCurrent: boolean): number {
  const s = status.toLowerCase();
  if (isCurrent || /operational|actively|shipped|live/.test(s)) return 1;
  if (/in[_ ]?development|wip/.test(s)) return 0.75;
  if (/paused|archived/.test(s)) return 0.25;
  return 0.5;
}

function recencyScore(p: LoadedProject): number {
  if (p.isCurrent) return 1;
  if (p.startDate?.includes("2026") || p.endDate?.includes("2026") || p.endDate?.toLowerCase() === "present") {
    return 0.95;
  }
  if (p.startDate?.includes("2025") || p.endDate?.includes("2025")) return 0.7;
  return 0.4;
}

export function rankProjects(opts: {
  inventory: CareerInventory;
  profileKey: string;
  jobTitle: string;
  jobCorpus: string;
  recommendedFromScore?: string[];
  pageLength: 1 | 2;
}): RankedProject[] {
  const policy = getRolePolicy(opts.profileKey);
  const profile = opts.inventory.profiles.find((p) => p.key === opts.profileKey);
  const evidenceOrder = profile?.evidenceOrder ?? [];
  const eligible = opts.inventory.projects.filter(
    (p) => p.approvedForCV && p.verified && !/academic only/i.test(p.type),
  );

  const ranked = eligible.map((p) => {
    const preferredIdx = policy.preferredProjectKeys.indexOf(p.key);
    const profileRelevance = preferredIdx >= 0 ? 1 - preferredIdx * 0.12 : 0.35;

    const terms = [...p.stack, ...p.keywords, ...p.useAsEvidenceFor, p.name, p.shortSummary ?? ""];
    const hits = terms.filter((t) => corpusIncludes(opts.jobCorpus, t)).length;
    const jdKeywordRelevance = clamp01(hits / Math.max(4, Math.min(terms.length, 12)));

    const approvedMetrics = p.evidence.flatMap((e) => e.metrics).filter((m) => m.approvedForCV && !m.needsReview);
    const evidenceStrength = clamp01(
      (p.evidence.filter((e) => e.verified).length * 0.2 +
        approvedMetrics.length * 0.15 +
        (p.resumeBullets.length > 0 ? 0.3 : 0)) /
        1.2,
    );

    const orderIdx = evidenceOrder.findIndex(
      (e) => e.toLowerCase() === p.name.toLowerCase() || e.toLowerCase() === p.key.toLowerCase(),
    );
    const careerPositioning =
      orderIdx >= 0
        ? clamp01(1 - orderIdx * 0.15)
        : opts.recommendedFromScore?.some(
              (r) => r.toLowerCase().includes(p.name.toLowerCase()) || r.toLowerCase().includes(p.key),
            )
          ? 0.85
          : 0.4;

    const breakdown = {
      profileRelevance: clamp01(profileRelevance),
      jdKeywordRelevance,
      evidenceStrength: clamp01(evidenceStrength),
      recency: recencyScore(p),
      operationalStatus: statusScore(p.status, p.isCurrent),
      careerPositioning: clamp01(careerPositioning + p.cvPriority * 0.05),
    };

    const score =
      breakdown.profileRelevance * PROJECT_RANK_WEIGHTS.profileRelevance +
      breakdown.jdKeywordRelevance * PROJECT_RANK_WEIGHTS.jdKeywordRelevance +
      breakdown.evidenceStrength * PROJECT_RANK_WEIGHTS.evidenceStrength +
      breakdown.recency * PROJECT_RANK_WEIGHTS.recency +
      breakdown.operationalStatus * PROJECT_RANK_WEIGHTS.operationalStatus +
      breakdown.careerPositioning * PROJECT_RANK_WEIGHTS.careerPositioning;

    return {
      projectKey: p.key,
      name: p.name,
      score,
      breakdown,
    };
  });

  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return ranked;
}

/**
 * One-page: Aethelgard + CareerOS for AI profiles.
 * Two-page: Aethelgard + CareerOS + RedVelvetVault (in that order).
 */
export function selectProjectsForPage(
  ranked: RankedProject[],
  pageLength: 1 | 2,
  profileKey: string,
): RankedProject[] {
  const byKey = new Map(ranked.map((r) => [r.projectKey, r]));
  const aiLike = profileKey === "ai_engineer" || profileKey === "applied_ai";

  if (aiLike) {
    const order = pageLength === 2 ? ["aethelgard", "careeros", "redvelvetvault"] : ["aethelgard", "careeros"];
    const forced = order.map((k) => byKey.get(k)).filter(Boolean) as RankedProject[];
    if (forced.length >= 2) return forced;
  }

  const limit = pageLength === 1 ? 2 : 3;
  let selected = ranked.slice(0, limit);
  if (selected.length === 0 && ranked.length) selected = ranked.slice(0, 1);
  return selected;
}

export function formatProjectDates(p: LoadedProject): string {
  const lockKey =
    p.key === "aethelgard"
      ? "aethelgard"
      : p.key === "careeros"
        ? "careeros"
        : p.key === "redvelvetvault"
          ? "redvelvetvault"
          : undefined;
  return formatLockedOrRange(lockKey, p.startDate, p.endDate, p.isCurrent);
}
