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
  skillsOverlap: 20,
  evidenceStrength: 16,
  projectRelevance: 14,
  /** Heavy weight — Senior / 5+ YOE must not score like mid UX roles */
  seniorityFit: 22,
  currentEligibility: 10,
  longTermPermit: 6,
  locationFit: 6,
  salaryFit: 3,
  careerAlignment: 3,
} as const;

export const PROFILE_KEYS = [
  "ai_engineer",
  "applied_ai",
  "design_engineer",
  "product_engineer",
  "ux_engineer",
  "product_designer",
  "frontend_engineer",
  "ux_ui_designer",
  "ai_creative",
] as const;

export type ProfileKey = (typeof PROFILE_KEYS)[number];

export const DEFAULT_PROFILE_KEY: ProfileKey = "ux_engineer";

/** Project ranking weights for Resume Engine V3 (must sum to 1). */
export const PROJECT_RANK_WEIGHTS = {
  profileRelevance: 0.25,
  jdKeywordRelevance: 0.25,
  evidenceStrength: 0.2,
  recency: 0.1,
  operationalStatus: 0.1,
  careerPositioning: 0.1,
} as const;
