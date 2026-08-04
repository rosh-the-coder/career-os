/**
 * Engineering signal detection — ranks how impressive work is, not just what tech was used.
 */

import type { EngineeringSignal, ExtractedMetric } from "./types";

const SIGNAL_PATTERNS: { signal: EngineeringSignal; weight: number; patterns: RegExp[] }[] = [
  {
    signal: "background_jobs",
    weight: 0.9,
    patterns: [/background\s*jobs?/i, /persistent\s*jobs?/i, /job\s*queue/i, /worker\s*process/i],
  },
  {
    signal: "queues",
    weight: 0.85,
    patterns: [/queue/i, /review\s*queues?/i, /work\s*queue/i],
  },
  {
    signal: "automation",
    weight: 0.8,
    patterns: [/automat(e|ion|ed)/i, /repeatable\s*workflow/i, /unattended/i],
  },
  {
    signal: "pipelines",
    weight: 0.9,
    patterns: [/pipeline/i, /production\s*pipeline/i, /etl/i, /batch\s*production/i],
  },
  {
    signal: "state_management",
    weight: 0.75,
    patterns: [/application[- ]state/i, /state\s*(sync|management|aggregation)/i, /zustand/i],
  },
  {
    signal: "event_systems",
    weight: 0.85,
    patterns: [/event[- ]driven/i, /postMessage/i, /webhook/i, /pubsub|pub\/sub/i],
  },
  {
    signal: "ai_orchestration",
    weight: 0.95,
    patterns: [/llm\s*api/i, /prompt\s*engineering/i, /ai[- ]assisted/i, /generative/i, /structured\s*outputs?/i],
  },
  {
    signal: "rest_apis",
    weight: 0.7,
    patterns: [/rest\s*apis?/i, /api\s*integration/i, /openapi/i, /http\s*api/i],
  },
  {
    signal: "database_architecture",
    weight: 0.8,
    patterns: [/prisma/i, /postgres/i, /firestore/i, /supabase/i, /schema/i, /sql\b/i],
  },
  {
    signal: "human_approval",
    weight: 0.9,
    patterns: [/human[- ](in[- ]the[- ]loop|approval|review)/i, /approval\s*before/i, /dry[- ]run/i],
  },
  {
    signal: "versioning",
    weight: 0.65,
    patterns: [/versioning/i, /resume\s*version/i, /schema\s*version/i],
  },
  {
    signal: "authentication",
    weight: 0.7,
    patterns: [/auth(entication)?/i, /supabase\s*auth/i, /firebase\s*auth/i, /oauth/i],
  },
  {
    signal: "deployment",
    weight: 0.65,
    patterns: [/vercel/i, /deploy(ment|ed)?/i, /ci\/cd/i, /production\s*deploy/i],
  },
  {
    signal: "observability",
    weight: 0.7,
    patterns: [/logging/i, /monitoring/i, /observability/i, /metrics\s*dashboard/i],
  },
  {
    signal: "batch_processing",
    weight: 0.85,
    patterns: [/batch/i, /csv\/xlsx/i, /spreadsheet\s*upload/i, /quota/i],
  },
  {
    signal: "validation",
    weight: 0.75,
    patterns: [/validat(e|ion|ed)/i, /schema\s*check/i, /claim\s*validation/i],
  },
  {
    signal: "integrations",
    weight: 0.8,
    patterns: [/integrat(e|ion|ed)/i, /etsy\s*open\s*api/i, /third[- ]party\s*api/i],
  },
  {
    signal: "frontend_systems",
    weight: 0.55,
    patterns: [/react/i, /next\.?js/i, /typescript/i, /component\s*architecture/i],
  },
  {
    signal: "product_ownership",
    weight: 0.7,
    patterns: [/end[- ]to[- ]end/i, /product\s*ownership/i, /shipped/i, /0→1|0-1/i],
  },
];

const WEAK_PAGE_PATTERNS = [
  /\bbuilt a (simple |basic )?(react|web)?\s*page\b/i,
  /\bcreated a (landing|static)\s*page\b/i,
  /\bhelped with\b/i,
  /\bworked on\b/i,
];

export function detectEngineeringSignals(corpus: string): {
  signals: EngineeringSignal[];
  score: number;
  hits: { signal: EngineeringSignal; weight: number }[];
} {
  const hits: { signal: EngineeringSignal; weight: number }[] = [];
  for (const row of SIGNAL_PATTERNS) {
    if (row.patterns.some((p) => p.test(corpus))) {
      hits.push({ signal: row.signal, weight: row.weight });
    }
  }
  const unique = [...new Map(hits.map((h) => [h.signal, h])).values()];
  const raw = unique.reduce((s, h) => s + h.weight, 0);
  // Soft page / trivial UI work caps impressiveness
  const trivialPenalty = WEAK_PAGE_PATTERNS.some((p) => p.test(corpus)) ? 0.35 : 0;
  const score = Math.max(0, Math.min(1, raw / 4.5 - trivialPenalty));
  return { signals: unique.map((h) => h.signal), score, hits: unique };
}

export function detectBusinessImpact(corpus: string, metrics: ExtractedMetric[]): number {
  let score = 0;
  if (metrics.filter((m) => m.approved).length) score += 0.45;
  if (/\bincreas(ed|e)\b|\bgrew\b|\breduc(ed|e)\b|\bimprov(ed|e)\b/i.test(corpus)) score += 0.2;
  if (/\busers?\b|\bsubscribers?\b|\bviews?\b|\bleads?\b|\brevenue\b/i.test(corpus)) score += 0.15;
  if (/\boperational\b|\bproduction\b|\bshipped\b|\blive\b/i.test(corpus)) score += 0.15;
  if (/\bstakeholder|non[- ]technical|business\s*requirements/i.test(corpus)) score += 0.1;
  return Math.min(1, score);
}

export function extractMetricsFromText(text: string, evidenceIds: string[] = []): ExtractedMetric[] {
  const metrics: ExtractedMetric[] = [];
  const beforeAfter =
    text.match(/(\d+(\.\d+)?K?)\s*(→|->|to)\s*(\d+(\.\d+)?K?)/gi) ??
    text.match(/from\s+(\d+(\.\d+)?K?)\s+to\s+(\d+(\.\d+)?K?)/gi) ??
    [];
  for (const m of beforeAfter) {
    metrics.push({ text: m, kind: "before_after", approved: true, evidenceIds });
  }
  const pct = text.match(/\+\s?\d+(\.\d+)?%/g) ?? text.match(/\b\d+(\.\d+)?%\b/g) ?? [];
  for (const m of pct) {
    metrics.push({ text: m, kind: "percentage", approved: true, evidenceIds });
  }
  const volume = text.match(/\b\d+\+\s*(podcast|episodes?|videos?|assets?|leads?|businesses|users?|products?|mockups?|jobs?)/gi) ?? [];
  for (const m of volume) {
    metrics.push({ text: m, kind: "volume", approved: true, evidenceIds });
  }
  return metrics;
}

/** Compare two bullets — higher engineering score wins when both mention same tech */
export function compareEngineeringImpressiveness(a: string, b: string): number {
  return detectEngineeringSignals(b).score - detectEngineeringSignals(a).score;
}
