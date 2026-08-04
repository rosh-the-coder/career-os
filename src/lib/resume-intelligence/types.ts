/**
 * Resume Intelligence Engine — structured case-study representation.
 * Generation must use this layer; never invent from raw free text alone.
 */

export type ResumeStrategyMode = "ats" | "executive" | "technical";

export type EngineeringSignal =
  | "background_jobs"
  | "queues"
  | "automation"
  | "pipelines"
  | "state_management"
  | "event_systems"
  | "ai_orchestration"
  | "rest_apis"
  | "database_architecture"
  | "human_approval"
  | "versioning"
  | "authentication"
  | "deployment"
  | "observability"
  | "batch_processing"
  | "validation"
  | "integrations"
  | "frontend_systems"
  | "product_ownership";

export interface ExtractedMetric {
  text: string;
  kind: "before_after" | "percentage" | "scale" | "volume" | "time" | "users" | "other";
  approved: boolean;
  evidenceIds: string[];
}

export interface EvidenceCard {
  id: string;
  sourceType: "experience" | "project";
  sourceKey: string;
  companyOrName: string;
  role?: string;
  timeline: string;
  location?: string;
  problem?: string;
  users?: string;
  context?: string;
  constraints: string[];
  responsibilities: string[];
  architecture: string[];
  technologies: string[];
  systemsDesigned: string[];
  engineeringDecisions: string[];
  integrations: string[];
  scale?: string;
  metrics: ExtractedMetric[];
  outcome: string[];
  lessons: string[];
  evidenceIds: string[];
  rawCorpus: string;
}

export interface ExperienceIntelligence {
  id: string;
  company: string;
  role: string;
  timeline: string;
  location?: string;
  oneSentenceSummary: string;
  problem?: string;
  solution?: string;
  engineering: string[];
  impact: string[];
  technology: string[];
  confidence: number;
  evidenceIds: string[];
  engineeringSignals: EngineeringSignal[];
  engineeringScore: number; // 0–1 impressiveness
  businessImpactScore: number; // 0–1
  missingStoryFields: string[];
  candidateBullets: IntelligentBullet[];
}

export interface ProjectIntelligence {
  id: string;
  projectKey: string;
  name: string;
  timeline: string;
  role?: string;
  oneSentenceSummary: string; // < 25 words preferred
  problem?: string;
  solution?: string;
  engineering: string[];
  impact: string[];
  technology: string[];
  confidence: number;
  evidenceIds: string[];
  engineeringSignals: EngineeringSignal[];
  engineeringScore: number;
  businessImpactScore: number;
  missingStoryFields: string[];
  candidateBullets: IntelligentBullet[];
  links?: { label: string; url: string }[];
}

export interface IntelligentBullet {
  text: string;
  verb: string;
  hasProblem: boolean;
  hasSolution: boolean;
  hasEngineering: boolean;
  hasOutcome: boolean;
  engineeringScore: number;
  atsKeywords: string[];
  evidenceIds: string[];
  metricTexts: string[];
  quality: "strong" | "acceptable" | "weak" | "rejected";
  rejectReasons: string[];
  audiences: {
    ats: boolean;
    recruiter: boolean;
    hiringManager: boolean;
  };
}

export interface BulletSuggestion {
  original: string;
  suggested: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
}

export interface ResumeLintWarning {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  section?: string;
  suggestion?: string;
}

export interface AtsIntelligenceScore {
  total: number; // 0–100
  dimensions: {
    keywordCoverage: number;
    roleAlignment: number;
    technicalDepth: number;
    leadership: number;
    productThinking: number;
    engineeringSignal: number;
    businessImpact: number;
    evidenceConfidence: number;
    readability: number;
    bulletQuality: number;
  };
  explanation: string[];
  improvements: string[];
}

export interface ResumeStrategy {
  mode: ResumeStrategyMode;
  profileKey: string;
  prioritizeSignals: EngineeringSignal[];
  maxBulletsPerEntry: number;
  emphasizeMetrics: boolean;
  emphasizeArchitecture: boolean;
}

export interface ResumeIntelligenceBundle {
  strategy: ResumeStrategy;
  experiences: ExperienceIntelligence[];
  projects: ProjectIntelligence[];
  lint: ResumeLintWarning[];
  atsScore: AtsIntelligenceScore;
  bulletSuggestions: BulletSuggestion[];
  humanReviewRequired: boolean;
}
