import type {
  EligibilityCurrent,
  EligibilityFuture,
  HardFilterResult,
  SoftFlag,
} from "@/lib/types";

export interface FilterableJob {
  title: string;
  company: string;
  location?: string | null;
  country?: string | null;
  remoteType?: string | null;
  employmentType?: string | null;
  descriptionRaw: string;
  descriptionClean: string;
  seniority?: string | null;
  yearsRequired?: number | null;
  sponsorshipText?: string | null;
  workAuthorizationText?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
}

export interface FilterSettings {
  includeFallbackVideoRoles: boolean;
  salaryFloorEur: number;
  salaryFloorSoft: boolean;
  canWorkFullTimeNow: boolean;
}

const SENIOR_TITLE_RE =
  /\b(director|head of|vp\b|vice president|principal|staff\b|distinguished|fellow|chief|cto|cpo|ceo)\b/i;

const PHYSICAL_ENGINEERING_RE =
  /\b(mechanical design engineer|electrical design engineer|civil engineer|structural engineer|hardware engineer|pcb|solidworks|autocad|catia|nx\b|inventor\b|revit|hvac|mechatronics|manufacturing engineer|process engineer)\b/i;

const DEEP_ML_RE =
  /\b(phd\b|ph\.d|doctoral|research scientist|ml research scientist|deep learning research|published research|neurips|icml|cvpr)\b/i;

const INTERNSHIP_RE = /\b(internship|intern\b|unpaid intern)\b/i;
const UNPAID_RE = /\b(unpaid|commission[-\s]?only|volunteer)\b/i;
const VIDEO_FALLBACK_RE =
  /\b(video editor|motion designer|motion graphics|social content producer|content creator)\b/i;

const UK_ONLY_RE = /\b(uk only|united kingdom only|must be (based )?in (the )?uk|right to work in the uk)\b/i;
const US_ONLY_RE =
  /\b(us only|usa only|united states only|must be (based )?in (the )?(us|usa)|authorized to work in the (us|united states)|green card|must have us work authorization)\b/i;
/** Word-bounded US tokens only — never match the "us" inside "status"/"useful"/etc. */
const REMOTE_US_RE =
  /\bremote(?:\s|\W){0,40}\b(?:us|usa|united states)\b|\b(?:us|usa|united[\s-]states)\b(?:\s|\W){0,20}(?:based\s+)?remote\b|\b(?:us|usa)-based remote\b/i;
/** Clear non-US geo — used to suppress US-remote false positives on Europe/UK/Ireland listings. */
const NON_US_GEO_RE =
  /\b(ireland|dublin|europe|emea|\beu\b|uk|united kingdom|london|berlin|amsterdam|paris|lisbon|madrid|remote[-\s]?eu)\b/i;

const NO_SPONSORSHIP_RE =
  /\b(no sponsorship|cannot sponsor|will not sponsor|unable to sponsor|must (already )?have (the )?right to work|does not (offer|provide) (visa |work )?sponsorship)\b/i;

function textOf(job: FilterableJob): string {
  return `${job.title}\n${job.location ?? ""}\n${job.country ?? ""}\n${job.employmentType ?? ""}\n${job.sponsorshipText ?? ""}\n${job.workAuthorizationText ?? ""}\n${job.descriptionClean || job.descriptionRaw}`.toLowerCase();
}

function classifyEligibility(job: FilterableJob, text: string): {
  current: EligibilityCurrent;
  future: EligibilityFuture;
  softFlags: SoftFlag[];
} {
  const softFlags: SoftFlag[] = [];
  const hasNoSponsor = NO_SPONSORSHIP_RE.test(text) || NO_SPONSORSHIP_RE.test(job.sponsorshipText ?? "");

  if (hasNoSponsor) {
    softFlags.push({
      code: "no_sponsorship_language",
      message:
        "Listing mentions no sponsorship — kept for review because Stamp 1G may allow starting without a permit.",
      severity: "warn",
    });
    return {
      current: "likely_eligible_now",
      future: "long_term_sponsorship_unlikely",
      softFlags,
    };
  }

  if (/\bsponsor(ship|ed)?\b/i.test(text) || /\bcritical skills\b/i.test(text)) {
    return {
      current: "likely_eligible_now",
      future: "long_term_sponsorship_possible",
      softFlags,
    };
  }

  return {
    current: "likely_eligible_now",
    future: "unknown",
    softFlags,
  };
}

export function runHardFilters(
  job: FilterableJob,
  settings: FilterSettings,
): HardFilterResult {
  const softFlags: SoftFlag[] = [];
  const text = textOf(job);
  const title = job.title.toLowerCase();

  // Geography / work auth geography
  if (UK_ONLY_RE.test(text) && !/\bireland\b/i.test(job.location ?? "")) {
    return {
      rejected: true,
      reason: "Clearly UK-only / UK work authorization required",
      softFlags,
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
    };
  }

  const explicitUsOnly = US_ONLY_RE.test(text);
  const remoteUs =
    REMOTE_US_RE.test(text) &&
    !NON_US_GEO_RE.test(text) &&
    !NON_US_GEO_RE.test(job.location ?? "") &&
    !NON_US_GEO_RE.test(job.country ?? "");
  if (explicitUsOnly || remoteUs) {
    return {
      rejected: true,
      reason: "US-only or remote role requiring US work authorization",
      softFlags,
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
    };
  }

  // Employment type
  if (UNPAID_RE.test(text) || UNPAID_RE.test(job.employmentType ?? "")) {
    return {
      rejected: true,
      reason: "Unpaid or commission-only role",
      softFlags,
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
    };
  }

  if (INTERNSHIP_RE.test(title) || (INTERNSHIP_RE.test(text) && /\bintern(ship)?\b/i.test(title))) {
    return {
      rejected: true,
      reason: "Internship-only listing",
      softFlags,
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
    };
  }

  // Seniority hard reject
  if (SENIOR_TITLE_RE.test(job.title) || SENIOR_TITLE_RE.test(job.seniority ?? "")) {
    return {
      rejected: true,
      reason: "Seniority level (director/head/principal/staff+) outside target band",
      softFlags,
      eligibilityCurrent: "unclear",
      eligibilityFuture: "unknown",
    };
  }

  // Physical / mechanical design engineer (not digital)
  if (PHYSICAL_ENGINEERING_RE.test(text) || PHYSICAL_ENGINEERING_RE.test(job.title)) {
    return {
      rejected: true,
      reason: "Physical/mechanical/electrical engineering role (CAD/hardware) — not digital Design Engineer",
      softFlags,
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
    };
  }

  // Deep ML / PhD research track only — not applied AI / LLM engineering JDs
  if (DEEP_ML_RE.test(text) && /\b(required|must have|mandatory|phd)\b/i.test(text)) {
    return {
      rejected: true,
      reason: "Requires deep ML research / PhD-level expertise",
      softFlags,
      eligibilityCurrent: "not_eligible",
      eligibilityFuture: "unknown",
    };
  }

  // Video fallback
  if (!settings.includeFallbackVideoRoles && VIDEO_FALLBACK_RE.test(job.title)) {
    return {
      rejected: true,
      reason: "Fallback video/motion role (toggle off). Enable in settings to include.",
      softFlags,
      eligibilityCurrent: "unclear",
      eligibilityFuture: "unknown",
    };
  }

  const eligibility = classifyEligibility(job, text);
  softFlags.push(...eligibility.softFlags);

  // Always prefer text inference; ignore stored years if they look like company-age noise (>15)
  const fromText = inferYearsRequired(job.descriptionClean || job.descriptionRaw || text);
  const stored =
    job.yearsRequired != null && job.yearsRequired >= 1 && job.yearsRequired <= 15
      ? job.yearsRequired
      : undefined;
  const inferredYears = fromText ?? stored;
  if (inferredYears != null && inferredYears >= 8) {
    return {
      rejected: true,
      reason: `Requires ${inferredYears}+ years of experience — outside current target band`,
      softFlags,
      eligibilityCurrent: "unclear",
      eligibilityFuture: "unknown",
    };
  }

  if (inferredYears != null && inferredYears >= 6 && /\bsenior\b/i.test(job.title)) {
    return {
      rejected: true,
      reason: `Senior title asking ${inferredYears}+ years — outside mid-level target band`,
      softFlags,
      eligibilityCurrent: "unclear",
      eligibilityFuture: "unknown",
    };
  }

  if (/\bsenior\b/i.test(job.title)) {
    softFlags.push({
      code: "senior_title_stretch",
      message: "Senior title — keep only if skills/evidence strongly match; treat as stretch.",
      severity: "warn",
    });
  }

  // Years soft note (Option A) for mid stretch — hard reject only at 8+ (or Senior+6)
  if (inferredYears != null && inferredYears >= 5) {
    softFlags.push({
      code: "high_years_requested",
      message: `Ad requests ${inferredYears}+ years — soft warning; skills match still evaluated.`,
      severity: "warn",
    });
  } else if (inferredYears != null && inferredYears >= 3) {
    softFlags.push({
      code: "years_requested",
      message: `Ad asks for ${inferredYears}+ years — soft note only; scoring prioritizes skills/evidence.`,
      severity: "info",
    });
  }

  // Salary soft preference
  if (
    settings.salaryFloorSoft &&
    job.salaryMax != null &&
    job.salaryCurrency?.toUpperCase() === "EUR" &&
    job.salaryMax < settings.salaryFloorEur
  ) {
    softFlags.push({
      code: "below_salary_floor",
      message: `Listed max salary below €${settings.salaryFloorEur} preference — kept because fit may still be strong.`,
      severity: "info",
    });
  }

  return {
    rejected: false,
    softFlags,
    eligibilityCurrent: eligibility.current,
    eligibilityFuture: eligibility.future,
  };
}

/** Pull candidate YOE requirement — ignore company-age fluff like "30 years in business". */
export function inferYearsRequired(text: string): number | undefined {
  const raw = text.replace(/\s+/g, " ");

  const COMPANY_AGE =
    /\b(in business|as a (great )?place|celebrat|anniversary|established|founded|for over \d+ years|years of (excellence|success|service|innovation|partnership)|trusted for \d+|operating for)\b/i;

  // Negation / new-grad marketing: "nobody has 10 years…", "don't need 5 years…"
  const YOE_DENIAL =
    /\b(nobody|no[\s-]?one|no[\s-]?body|none|not|n't|never|without|lack(?:s|ing)?|don'?t|do\s+not|does\s+not|doesn'?t|won'?t|will\s+not|need\s+not|no\s+need)\b.{0,40}\b\d+\s*\+?\s*years?/i;

  const YOE_DENIAL_AFTER =
    /\b\d+\s*\+?\s*years?.{0,40}\b(not\s+required|not\s+needed|isn'?t\s+required|aren'?t\s+required|not\s+necessary|is\s+not\s+required)\b/i;

  // "new frontier / this space" disclaimers that deny prior YOE existence
  const FRONTIER_DISCLAIMER =
    /\b(nobody|no[\s-]?one).{0,30}\b\d+\s*\+?\s*years?.{0,40}\b(new\s+frontier|this\s+(field|space|domain|area|era)|agentic|emerging)\b/i;

  const candidates: number[] = [];

  const consider = (n: number, matchText: string, window: string) => {
    if (!Number.isFinite(n) || n < 1 || n > 15) return; // >15 almost never a real mid-band ask
    // Company-age / award fluff — check tight match text only (wide window false-positives nearby real asks)
    if (COMPANY_AGE.test(matchText)) return;
    if (/\byears?\s+as\s+a\b/i.test(matchText)) return;
    // Negation / marketing disclaimers need surrounding context
    if (YOE_DENIAL.test(window) || YOE_DENIAL_AFTER.test(window) || FRONTIER_DISCLAIMER.test(window)) {
      return;
    }
    candidates.push(n);
  };

  const windowAround = (index: number, matchLen: number) => {
    const start = Math.max(0, index - 50);
    const end = Math.min(raw.length, index + matchLen + 70);
    return raw.slice(start, end);
  };

  /** Match + short trailing span — enough for "years as a Great Place" / "years in business". */
  const matchWithTail = (index: number, matchLen: number) => {
    const end = Math.min(raw.length, index + matchLen + 40);
    return raw.slice(index, end);
  };

  // Explicit experience asks (strongest)
  for (const m of raw.matchAll(
    /(\d+)\s*[-–—]\s*(\d+)\s*years?(?:\s+of)?(?:\s+[\w/-]+){0,5}\s+experience\b/gi,
  )) {
    // Use lower bound of range as the requirement floor (4-6 → 4)
    const idx = m.index ?? 0;
    consider(Number(m[1]), matchWithTail(idx, m[0].length), windowAround(idx, m[0].length));
  }
  for (const m of raw.matchAll(
    /(?<![\d])(\d+)\s*\+\s*years?(?:\s+of)?(?:\s+[\w/-]+){0,5}\s+experience\b/gi,
  )) {
    const idx = m.index ?? 0;
    consider(Number(m[1]), matchWithTail(idx, m[0].length), windowAround(idx, m[0].length));
  }
  for (const m of raw.matchAll(
    /(?<![\d-–—])(\d+)\s+years?(?:\s+of)?(?:\s+[\w/-]+){0,5}\s+experience\b/gi,
  )) {
    const idx = m.index ?? 0;
    consider(Number(m[1]), matchWithTail(idx, m[0].length), windowAround(idx, m[0].length));
  }
  for (const m of raw.matchAll(/(?:minimum|at\s+least|min\.?)\s*(?:of\s*)?(\d+)\s*\+?\s*years?/gi)) {
    const idx = m.index ?? 0;
    consider(Number(m[1]), matchWithTail(idx, m[0].length), windowAround(idx, m[0].length));
  }
  for (const m of raw.matchAll(/(?<![\d])(\d+)\s*\+\s*years?\b/gi)) {
    const idx = m.index ?? 0;
    consider(Number(m[1]), matchWithTail(idx, m[0].length), windowAround(idx, m[0].length));
  }

  if (!candidates.length) return undefined;
  // Prefer the *stated requirement floor*, not inflated noise — use max among valid floors ≤15
  return Math.max(...candidates);
}
