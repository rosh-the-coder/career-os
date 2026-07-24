export type JobStatus =
  | "new"
  | "scored"
  | "rejected"
  | "saved"
  | "materials_ready"
  | "review_required"
  | "applied"
  | "recruiter_reply"
  | "interview"
  | "rejected_after_application"
  | "offer"
  | "withdrawn";

export type RemoteType = "onsite" | "hybrid" | "remote" | "unknown";

export type EligibilityCurrent =
  | "eligible_now"
  | "likely_eligible_now"
  | "unclear"
  | "not_eligible";

export type EligibilityFuture =
  | "long_term_sponsorship_promising"
  | "long_term_sponsorship_possible"
  | "long_term_sponsorship_unlikely"
  | "unknown";

export interface Requirement {
  text: string;
  kind: "required" | "preferred" | "unknown";
  category?: string;
}

export interface SoftFlag {
  code: string;
  message: string;
  severity: "info" | "warn";
}

export interface HardFilterResult {
  rejected: boolean;
  reason?: string;
  softFlags: SoftFlag[];
  eligibilityCurrent: EligibilityCurrent;
  eligibilityFuture: EligibilityFuture;
}

export interface ScoreBreakdown {
  skillsOverlap: number;
  evidenceStrength: number;
  projectRelevance: number;
  seniorityFit: number;
  currentEligibility: number;
  longTermPermit: number;
  locationFit: number;
  salaryFit: number;
  careerAlignment: number;
}

export interface JobScoreResult {
  totalScore: number;
  breakdown: ScoreBreakdown;
  recommendedProfileKey: string;
  strengths: string[];
  gaps: string[];
  eligibilityCurrent: EligibilityCurrent;
  eligibilityFuture: EligibilityFuture;
  recommendedProjects: string[];
  evidenceUsed: string[];
  softFlags: SoftFlag[];
  hardRejected: boolean;
  hardRejectReason?: string;
}

export const SCORE_WEIGHTS = {
  skillsOverlap: 22,
  evidenceStrength: 18,
  projectRelevance: 15,
  seniorityFit: 12,
  currentEligibility: 12,
  longTermPermit: 8,
  locationFit: 5,
  salaryFit: 4,
  careerAlignment: 4,
} as const;

export const PROFILE_KEYS = [
  "design_engineer",
  "product_designer",
  "applied_ai",
  "ai_creative",
  "ux_engineer",
] as const;

export type ProfileKey = (typeof PROFILE_KEYS)[number];

export const DEFAULT_PROFILE_KEY: ProfileKey = "ux_engineer";
