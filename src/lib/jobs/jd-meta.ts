/** Soft word budget for free LLM scoring (Groq TPM). Exceeding is allowed but riskier. */
export const JD_WORD_SOFT_LIMIT = 5000;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export type ParseConfidence = "high" | "medium" | "low";

/**
 * Parse/keyword confidence — indicator only. Final fit score comes from the LLM judge.
 */
export function computeParseConfidence(input: {
  description: string;
  title?: string | null;
  location?: string | null;
  yearsRequired?: number | null;
  requirementsCount?: number;
  llmScored?: boolean;
}): ParseConfidence {
  let points = 0;
  const words = countWords(input.description);
  if (words >= 120) points += 2;
  else if (words >= 40) points += 1;
  if (words > JD_WORD_SOFT_LIMIT) points -= 1;

  if (input.title && input.title.length > 3) points += 1;
  if (input.location && /\b(ireland|dublin|cork|galway|remote|hybrid)\b/i.test(input.location)) {
    points += 1;
  }
  if (input.yearsRequired == null || (input.yearsRequired >= 1 && input.yearsRequired <= 12)) {
    points += 1;
  }
  if ((input.requirementsCount ?? 0) >= 3) points += 1;
  if (input.llmScored) points += 1;

  if (points >= 6) return "high";
  if (points >= 3) return "medium";
  return "low";
}

export function isLlmScored(modelVersion?: string | null): boolean {
  return Boolean(modelVersion?.startsWith("llm-judge:"));
}
