/**
 * No-repetition rule — Company Summary, Role, and Bullets must carry different information.
 * If semantic similarity between summary and a bullet exceeds ~80%, drop/regenerate the bullet.
 */

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "across",
  "over",
  "as",
  "by",
  "at",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
]);

export function tokenizeForSimilarity(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+%.\s]/g, " ")
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}

/** Similarity on significant tokens (0–1). Uses max(Jaccard, containment). */
export function semanticSimilarity(a: string, b: string): number {
  const A = tokenizeForSimilarity(a);
  const B = tokenizeForSimilarity(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter;
  const jaccard = union === 0 ? 0 : inter / union;
  const containment = inter / Math.min(A.size, B.size);
  return Math.max(jaccard, containment);
}

export const REPETITION_THRESHOLD = 0.8;

export function isRepetitiveAgainstSummary(
  summary: string | undefined | null,
  bullet: string,
  threshold = REPETITION_THRESHOLD,
): boolean {
  if (!summary?.trim()) return false;
  return semanticSimilarity(summary, bullet) >= threshold;
}

/**
 * Prefer bullets that do not repeat the company summary.
 * If a bullet is repetitive, try the next alternate from the pool; otherwise skip it.
 */
export function selectNonRepetitiveBullets<T extends { text: string }>(
  summary: string | undefined | null,
  candidates: T[],
  max: number,
  threshold = REPETITION_THRESHOLD,
): T[] {
  const selected: T[] = [];
  for (const c of candidates) {
    if (selected.length >= max) break;
    if (isRepetitiveAgainstSummary(summary, c.text, threshold)) continue;
    // Also avoid near-duplicates of already selected bullets
    if (selected.some((s) => semanticSimilarity(s.text, c.text) >= threshold)) continue;
    selected.push(c);
  }
  // If filtering emptied the list, keep highest-diversity originals under a softer threshold
  if (!selected.length && candidates.length) {
    for (const c of candidates) {
      if (selected.length >= max) break;
      if (summary && semanticSimilarity(summary, c.text) >= 0.95) continue;
      selected.push(c);
    }
  }
  return selected.slice(0, max);
}
