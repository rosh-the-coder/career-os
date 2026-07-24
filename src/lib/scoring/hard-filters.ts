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
  /\b(phd|machine learning engineer|research scientist|ml research|model training|deep learning research|pytorch research|tensorflow research)\b/i;

const INTERNSHIP_RE = /\b(internship|intern\b|unpaid intern)\b/i;
const UNPAID_RE = /\b(unpaid|commission[-\s]?only|volunteer)\b/i;
const VIDEO_FALLBACK_RE =
  /\b(video editor|motion designer|motion graphics|social content producer|content creator)\b/i;

const UK_ONLY_RE = /\b(uk only|united kingdom only|must be (based )?in (the )?uk|right to work in the uk)\b/i;
const US_ONLY_RE =
  /\b(us only|usa only|united states only|must be (based )?in (the )?(us|usa)|authorized to work in the (us|united states)|green card|must have us work authorization)\b/i;
const REMOTE_US_RE = /\b(remote.*(us|usa|united states)|(us|usa)-?based remote)\b/i;

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

  if (US_ONLY_RE.test(text) || (REMOTE_US_RE.test(text) && !/\bireland\b/i.test(text))) {
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

  // Deep ML / PhD
  if (DEEP_ML_RE.test(text) && /\b(required|must|phd)\b/i.test(text)) {
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

  // Years soft note (Option A) — only soft unless extreme
  if (job.yearsRequired && job.yearsRequired >= 5) {
    softFlags.push({
      code: "high_years_requested",
      message: `Ad requests ${job.yearsRequired}+ years — soft warning; skills match still evaluated.`,
      severity: "warn",
    });
  } else if (job.yearsRequired && job.yearsRequired >= 3) {
    softFlags.push({
      code: "years_requested",
      message: `Ad asks for ${job.yearsRequired}+ years — soft note only; scoring prioritizes skills/evidence.`,
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
