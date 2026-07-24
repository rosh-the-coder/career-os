import type { JobScoreResult } from "@/lib/types";

export type { JobScoreResult };

export interface ParsedJob {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  seniority?: string;
  yearsRequired?: number;
  sponsorshipNotes?: string;
}

export interface CareerProfileInput {
  key: string;
  name: string;
  positioning: string;
  keywords: string[];
}

export interface ResumeGenerationInput {
  jobTitle: string;
  company: string;
  profile: CareerProfileInput;
  experiences: {
    company: string;
    title: string;
    startDate: string;
    endDate?: string | null;
    bullets: string[];
  }[];
  projects: {
    name: string;
    role: string;
    bullets: string[];
    stack: string[];
  }[];
  skills: string[];
  education: string[];
  contact: {
    name: string;
    location: string;
    email: string;
    phone?: string;
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
  };
  pageLength: 1 | 2;
}

export interface ResumeDraft {
  summary: string;
  experiences: ResumeGenerationInput["experiences"];
  projects: ResumeGenerationInput["projects"];
  skills: string[];
  education: string[];
  markdown: string;
}

export interface AnswerGenerationInput {
  jobTitle: string;
  company: string;
  question: string;
  evidenceNotes: string[];
  settingsNotes: string;
}

export interface ApplicationAnswers {
  answers: { question: string; answer: string }[];
}

export interface LLMProvider {
  extractJob(jobText: string): Promise<ParsedJob>;
  generateResume(input: ResumeGenerationInput): Promise<ResumeDraft>;
  generateAnswers(input: AnswerGenerationInput): Promise<ApplicationAnswers>;
}

export const PROMPT_GUARDRAILS = `
Use only supplied evidence. Never invent metrics, tools, dates, or seniority.
Never claim deep ML/model-training expertise.
Aethelgard is in development and not revenue-generating.
Dublin Gold Testing is the strongest operational automation case study.
RedVelvetVault is the strongest product-design / design-engineering case study.
Video editing is supporting capability, not primary identity.
Prefer concise ATS language. Explain gaps honestly.
Mark estimates clearly. Output must stay faithful to evidence.
`.trim();
