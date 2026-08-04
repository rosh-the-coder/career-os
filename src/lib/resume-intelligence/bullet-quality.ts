/**
 * Bullet quality framework — ATS + recruiter + hiring manager layers.
 */

import { detectEngineeringSignals, extractMetricsFromText } from "./engineering-signals";
import type { IntelligentBullet } from "./types";

export const BANNED_OPENERS = [
  /^helped\b/i,
  /^worked on\b/i,
  /^responsible for\b/i,
  /^participated\b/i,
  /^assisted\b/i,
  /^involved in\b/i,
  /^created\b/i,
  /^made\b/i,
];

export const STRONG_VERBS = [
  "Designed",
  "Engineered",
  "Architected",
  "Implemented",
  "Integrated",
  "Automated",
  "Optimized",
  "Orchestrated",
  "Delivered",
  "Validated",
  "Reduced",
  "Improved",
  "Consolidated",
  "Scaled",
  "Built", // allowed when followed by systems language; still scored lower than Designed/Engineered
];

const TECH_ONLY = /^(built|created|made|developed)\s+(using|with|in)\s+/i;
const LEADS_WITH_TECH = /^(using|with)\s+(react|python|typescript|next\.?js|node)/i;

function firstVerb(text: string): string {
  const m = text.trim().match(/^([A-Za-z]+)/);
  return m?.[1] ?? "";
}

export function evaluateBullet(text: string, evidenceIds: string[] = []): IntelligentBullet {
  const t = text.trim().replace(/\s+/g, " ");
  const verb = firstVerb(t);
  const rejectReasons: string[] = [];

  if (BANNED_OPENERS.some((p) => p.test(t))) {
    rejectReasons.push("Weak opener verb");
  }
  if (TECH_ONLY.test(t) || LEADS_WITH_TECH.test(t)) {
    rejectReasons.push("Leads with technology instead of problem/system");
  }
  if (t.split(/\s+/).length < 8) {
    rejectReasons.push("Too short — lacks problem/solution/outcome");
  }
  if (/^built pipeline\.?$/i.test(t) || /^built (a |an )?(app|page|website)\.?$/i.test(t)) {
    rejectReasons.push("Generic task description");
  }

  const eng = detectEngineeringSignals(t);
  const metrics = extractMetricsFromText(t, evidenceIds);
  const hasProblem = /\b(for|to|that|which|problem|bottleneck|manual|fragmented|workflow|operations?)\b/i.test(t);
  const hasSolution = /\b(designed|implemented|built|orchestrated|integrated|automated|consolidated|platform|pipeline|system|workflow)\b/i.test(t);
  const hasEngineering = eng.signals.length > 0 || /\b(api|queue|pipeline|database|auth|batch|validation|background)\b/i.test(t);
  const hasOutcome =
    metrics.length > 0 ||
    /\b(increased|reduced|improved|accelerated|enabled|shipped|delivered|unified|staged)\b/i.test(t);

  if (!hasEngineering && !hasOutcome) {
    rejectReasons.push("Missing engineering depth and outcome");
  }

  let quality: IntelligentBullet["quality"] = "acceptable";
  if (rejectReasons.length >= 2) quality = "rejected";
  else if (rejectReasons.length === 1) quality = "weak";
  else if (eng.score >= 0.45 && hasOutcome && hasSolution) quality = "strong";
  else if (eng.score < 0.15 && !hasOutcome) quality = "weak";

  const atsKeywords = [
    ...eng.signals.map((s) => s.replace(/_/g, " ")),
    ...(t.match(/\b(Python|TypeScript|React|Next\.js|REST APIs?|Prisma|Supabase|Firebase|LLM|API)\b/gi) ?? []),
  ];

  return {
    text: t,
    verb,
    hasProblem,
    hasSolution,
    hasEngineering,
    hasOutcome,
    engineeringScore: eng.score,
    atsKeywords: [...new Set(atsKeywords.map((k) => k.toLowerCase()))],
    evidenceIds,
    metricTexts: metrics.map((m) => m.text),
    quality,
    rejectReasons,
    audiences: {
      ats: atsKeywords.length > 0 || /\b(api|python|react|typescript|sql|git)\b/i.test(t),
      recruiter: hasOutcome || hasProblem,
      hiringManager: hasEngineering && hasSolution,
    },
  };
}

export function rankBullets(bullets: IntelligentBullet[]): IntelligentBullet[] {
  return [...bullets].sort((a, b) => {
    const q = { strong: 3, acceptable: 2, weak: 1, rejected: 0 };
    if (q[b.quality] !== q[a.quality]) return q[b.quality] - q[a.quality];
    if (b.engineeringScore !== a.engineeringScore) return b.engineeringScore - a.engineeringScore;
    return b.metricTexts.length - a.metricTexts.length;
  });
}

/** Suggest a stronger rewrite only when we can stay evidence-grounded (no fabrication). */
export function suggestBulletRewrite(bullet: IntelligentBullet): string | null {
  if (bullet.quality === "strong" || bullet.quality === "acceptable") return null;
  const body = bullet.text.replace(/^(Helped|Worked on|Responsible for|Participated in|Assisted with|Involved in|Created|Made)\s+/i, "");
  if (/^built\b/i.test(bullet.text) && detectEngineeringSignals(bullet.text).score >= 0.3) {
    return `Designed ${body.replace(/^built\s+/i, "")}`.replace(/\s+/g, " ").trim();
  }
  if (BANNED_OPENERS.some((p) => p.test(bullet.text))) {
    const rest = body.charAt(0).toUpperCase() + body.slice(1);
    return `Implemented ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`.replace(/\s+/g, " ").trim();
  }
  return null;
}

export function selectBulletsForMode(
  bullets: IntelligentBullet[],
  mode: "ats" | "executive" | "technical",
  max: number,
): IntelligentBullet[] {
  const ranked = rankBullets(bullets.filter((b) => b.quality !== "rejected"));
  if (mode === "technical") {
    return ranked.sort((a, b) => b.engineeringScore - a.engineeringScore).slice(0, max);
  }
  if (mode === "executive") {
    return ranked
      .sort((a, b) => Number(b.hasOutcome) - Number(a.hasOutcome) || b.metricTexts.length - a.metricTexts.length)
      .slice(0, max);
  }
  // ATS: prefer keyword-bearing strong bullets
  return ranked
    .sort((a, b) => b.atsKeywords.length - a.atsKeywords.length || b.engineeringScore - a.engineeringScore)
    .slice(0, max);
}
