/**
 * Canonical resume date formatting for Resume Engine V3.
 * Never print raw ISO values like 2026-03 or 2026-07-17 on CVs.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Locked display dates for verified inventory keys */
export const LOCKED_RESUME_DATES: Record<string, string> = {
  irish_ai: "Mar 2026 – Jul 2026",
  aethelgard: "Jul 2026 – Present",
  careeros: "Jul 2026 – Present",
  redvelvetvault: "Mar 2025 – Dec 2025",
  two_blokes: "Jan 2025 – Jan 2026",
  arcop: "Jan 2022 – Mar 2023",
  edu_msc: "Sep 2024 – Mar 2026",
  edu_iit: "Aug 2023 – Mar 2024",
  edu_barch: "Jul 2018 – Nov 2023",
};

function parsePart(raw: string): { y: number; m?: number } | "present" | null {
  const s = raw.trim();
  if (!s || /^present$/i.test(s)) return "present";

  const isoDay = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) return { y: Number(isoDay[1]), m: Number(isoDay[2]) };

  const isoMonth = s.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) return { y: Number(isoMonth[1]), m: Number(isoMonth[2]) };

  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return { y: Number(yearOnly[1]) };

  const monYear = s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})$/i);
  if (monYear) {
    const m = MONTHS.findIndex((x) => x.toLowerCase() === monYear[1].slice(0, 3).toLowerCase());
    const monthIdx = m >= 0 ? m + 1 : /sep/i.test(monYear[1]) ? 9 : undefined;
    return { y: Number(monYear[2]), m: monthIdx };
  }

  // Already "Jul 2026" etc.
  const already = s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i);
  if (already) {
    const m = MONTHS.findIndex((x) => x.toLowerCase() === already[1].slice(0, 3).toLowerCase());
    const y = Number(s.slice(-4));
    return { y, m: m >= 0 ? m + 1 : undefined };
  }

  return null;
}

function formatPart(p: { y: number; m?: number } | "present"): string {
  if (p === "present") return "Present";
  if (p.m && p.m >= 1 && p.m <= 12) return `${MONTHS[p.m - 1]} ${p.y}`;
  return String(p.y);
}

/**
 * Normalize a start/end pair into resume display form.
 * Examples: Mar 2026 – Jul 2026 | Jul 2026 – Present | 2023 – 2026
 */
export function formatResumeDateRange(start?: string | null, end?: string | null, isCurrent = false): string {
  if (!start && !end) return "";
  const startP = start ? parsePart(start) : null;
  const endP = isCurrent || !end || /present/i.test(end) ? ("present" as const) : parsePart(end);

  if (!startP || startP === "present") {
    if (endP && endP !== "present") return formatPart(endP);
    return start?.trim() ?? "";
  }

  // Year-only both sides → YYYY – YYYY
  if (!startP.m && endP && endP !== "present" && !endP.m) {
    return `${startP.y} – ${endP.y}`;
  }

  const left = formatPart(startP);
  const right = endP ? formatPart(endP) : "Present";
  return `${left} – ${right}`;
}

export function formatLockedOrRange(
  lockKey: string | undefined,
  start?: string | null,
  end?: string | null,
  isCurrent = false,
): string {
  if (lockKey && LOCKED_RESUME_DATES[lockKey]) return LOCKED_RESUME_DATES[lockKey];
  return formatResumeDateRange(start, end, isCurrent);
}

/** Reject raw ISO fragments that must not appear on CVs */
export function containsRawIsoDate(text: string): boolean {
  return /\b\d{4}-\d{2}(-\d{2})?\b/.test(text);
}
