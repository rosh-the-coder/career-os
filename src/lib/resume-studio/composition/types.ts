/**
 * Resume Studio V4 — Composition Document IR.
 * Exporters render only these blocks; they never invent layout.
 */

export const RESUME_SCHEMA_V4 = "4.0" as const;
export const COMPOSER_VERSION_V4 = "resume-engine-v4.0.0" as const;

export type ThemeId =
  | "arthur-cox"
  | "minimal-ats"
  | "stripe"
  | "openai"
  | "google"
  | "microsoft"
  | "notion"
  | "startup"
  | "academic"
  | "creative"
  | "executive";

export interface CompositionLink {
  label: string;
  url: string;
}

export interface HeaderBlock {
  kind: "header";
  name: string;
  professionalTitle: string;
}

export interface ContactRow {
  kind: "contactRow";
  text: string;
}

export interface LinkRow {
  kind: "linkRow";
  links: CompositionLink[];
}

export interface SectionHeader {
  kind: "sectionHeader";
  label: string;
  sectionId: string;
}

export interface Divider {
  kind: "divider";
  style: "rule" | "space";
}

export interface VerticalSpacer {
  kind: "verticalSpacer";
  token: "headerBottom" | "sectionBefore" | "sectionAfter" | "entryGap" | "dividerGap" | "small";
}

export interface SummaryParagraph {
  kind: "summaryParagraph";
  text: string;
}

export interface SkillGroupBlock {
  kind: "skillGroup";
  category: string;
  items: string[];
}

export interface ExperienceBlock {
  kind: "experience";
  dateLabel: string;
  role: string;
  company: string;
  location?: string;
  summary?: string;
  metrics?: string[];
  bullets: string[];
  technologies?: string[];
  experienceId?: string;
}

export interface ProjectBlock {
  kind: "project";
  dateLabel: string;
  name: string;
  role?: string;
  summary?: string;
  metrics?: string[];
  bullets: string[];
  technologies?: string[];
  links?: CompositionLink[];
  projectKey?: string;
}

export interface EducationBlock {
  kind: "education";
  dateLabel: string;
  line: string;
  details?: string[];
}

export interface TechnicalStackGroup {
  kind: "technicalStackGroup";
  group: string;
  items: string[];
}

export interface BulletList {
  kind: "bulletList";
  items: string[];
}

export interface TechnologyRow {
  kind: "technologyRow";
  label: string;
  items: string[];
}

export interface MetricHighlight {
  kind: "metricHighlight";
  text: string;
}

export interface PageBreakHint {
  kind: "pageBreakHint";
  keepWithNext?: boolean;
}

export interface Whitespace {
  kind: "whitespace";
  points: number;
}

export type CompositionBlock =
  | HeaderBlock
  | ContactRow
  | LinkRow
  | SectionHeader
  | Divider
  | VerticalSpacer
  | SummaryParagraph
  | SkillGroupBlock
  | ExperienceBlock
  | ProjectBlock
  | EducationBlock
  | TechnicalStackGroup
  | BulletList
  | TechnologyRow
  | MetricHighlight
  | PageBreakHint
  | Whitespace;

export interface CompositionDocument {
  schemaVersion: typeof RESUME_SCHEMA_V4;
  themeId: ThemeId;
  pageLength: 1 | 2;
  blocks: CompositionBlock[];
  /** Linear ATS reading-order strings for extraction checks */
  readingOrder: string[];
  meta: {
    jobId?: string;
    profileKey?: string;
    company?: string;
    jobTitle?: string;
    generatedAt: string;
    composerVersion: string;
  };
}
