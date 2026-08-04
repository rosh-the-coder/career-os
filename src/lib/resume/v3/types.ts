/**
 * Resume Engine V3 — shared types.
 * schemaVersion "3.0" content model + claim/evidence structures.
 */

export const RESUME_SCHEMA_V3 = "3.0" as const;
export const COMPOSER_VERSION = "resume-engine-v3.0.0" as const;

export type ClaimType = "verified" | "reported" | "estimated" | "inferred";

export interface ResumeClaim {
  text: string;
  evidenceIds: string[];
  claimType: ClaimType;
  confidence: number;
  numericClaims: string[];
  sourceSection: string;
}

export interface ResumeLink {
  label: string;
  url: string;
}

export interface SkillSelection {
  name: string;
  evidenceIds: string[];
  aliases?: string[];
}

export interface ProjectResumeEntry {
  name: string;
  dates: string;
  role?: string;
  oneLineSummary?: string;
  bullets: ResumeClaim[];
  technologies?: string[];
  links?: ResumeLink[];
  evidenceIds: string[];
  relevanceScore: number;
  projectKey: string;
}

export interface ExperienceResumeEntry {
  dates: string;
  title: string;
  company: string;
  location?: string;
  companyBlurb?: string;
  functionalFocus?: string;
  bullets: ResumeClaim[];
  evidenceIds: string[];
  experienceId: string;
}

export interface EducationResumeEntry {
  dates: string;
  line: string;
  details?: string[];
  evidenceIds?: string[];
}

export interface ResumeValidationV3 {
  status: "passed" | "failed" | "warning";
  blockedClaims: string[];
  unsupportedClaims: string[];
  warnings: string[];
  estimateWarnings: string[];
  approvedClaims: { text: string; evidenceIds: string[] }[];
  evidenceMap: Record<string, string[]>;
}

export type SectionId =
  | "summary"
  | "skills"
  | "selectedProjects"
  | "experience"
  | "education"
  | "technicalStack";

export interface ResumeContentV3 {
  schemaVersion: typeof RESUME_SCHEMA_V3;
  target: {
    jobId: string;
    title: string;
    company: string;
    profileKey: string;
  };
  header: {
    name: string;
    professionalTitle: string;
    contactLine: string;
    links: ResumeLink[];
  };
  summary: ResumeClaim;
  skills: { category?: string; items: SkillSelection[] }[];
  selectedProjects: ProjectResumeEntry[];
  experience: ExperienceResumeEntry[];
  education: EducationResumeEntry[];
  technicalStack?: { group: string; items: string[] }[];
  sectionOrder: SectionId[];
  evidenceMap: Record<string, string[]>;
  validation: ResumeValidationV3;
  generationMetadata: {
    composerVersion: string;
    promptVersion?: string;
    modelVersion?: string;
    generatedAt: string;
    pageLength: 1 | 2;
    pageCount?: number;
    /** Resume Intelligence Engine snapshot (scores, lint, strategy) */
    intelligence?: {
      strategyMode: string;
      atsScoreTotal: number;
      humanReviewRequired: boolean;
      lintCount: number;
      engineeringScores: Record<string, number>;
    };
  };
  /** Full intelligence bundle for Studio human-review UI (optional) */
  intelligenceBundle?: unknown;
}

export interface RankedProject {
  projectKey: string;
  name: string;
  score: number;
  breakdown: Record<string, number>;
}

export const PROJECT_RANK_WEIGHTS = {
  profileRelevance: 0.25,
  jdKeywordRelevance: 0.25,
  evidenceStrength: 0.2,
  recency: 0.1,
  operationalStatus: 0.1,
  careerPositioning: 0.1,
} as const;
