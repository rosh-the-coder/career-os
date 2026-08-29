/**
 * Role-policy for Resume Engine V3 — titles, section order, project preferences.
 */

import type { ProfileKey } from "@/lib/types";
import type { SectionId } from "./types";

export interface RolePolicy {
  key: ProfileKey | string;
  cvTitle: string;
  /** Alternate titles chosen by JD terminology */
  cvTitleAliases?: string[];
  positioning: string;
  sectionOrder: SectionId[];
  preferredProjectKeys: string[];
  skillPriority: string[];
  experiencePriorityThemes: string[];
  prohibitedClaims: RegExp[];
  projectsFirst: boolean;
}

const ATS_SAFE_ORDER_EXPERIENCE: SectionId[] = [
  "summary",
  "skills",
  "experience",
  "selectedProjects",
  "education",
  "technicalStack",
];

const ATS_SAFE_ORDER_PROJECTS: SectionId[] = [
  "summary",
  "skills",
  "selectedProjects",
  "experience",
  "education",
  "technicalStack",
];

const GLOBAL_PROHIBITED: RegExp[] = [
  /senior ai engineer/i,
  /machine[-\s]?learning engineer/i,
  /data scientist/i,
  /successful etsy business/i,
  /passive income/i,
  /\bphd\b/i,
  /model training/i,
  /proficient in rag/i,
  /vector database/i,
  /langchain/i,
  /langgraph/i,
  /azure openai/i,
  /transformer architecture/i,
  /ocr pipeline/i,
  /legal[- ]document processing/i,
  /paying users/i,
  /saas revenue/i,
  /via layoff/i,
  /without inventing unverified metrics/i,
  /interactive adult entertainment/i,
  /\badult entertainment\b/i,
];

export const ROLE_POLICIES: Record<string, RolePolicy> = {
  ai_engineer: {
    key: "ai_engineer",
    cvTitle: "AI Engineer",
    cvTitleAliases: ["Applied AI Engineer", "AI Automation Engineer"],
    positioning:
      "Applied AI systems, LLM API integration, workflow automation, Python, structured outputs, evaluation, data processing, internal tools, human review.",
    sectionOrder: ATS_SAFE_ORDER_EXPERIENCE,
    preferredProjectKeys: ["aethelgard", "careeros", "redvelvetvault", "dublin_gold_testing"],
    skillPriority: [
      "Python",
      "LLM API Integration",
      "Prompt Engineering",
      "Workflow Automation",
      "REST APIs",
      "Data Processing",
      "Human-in-the-loop Systems",
      "Evaluation and Testing",
      "Git",
      "TypeScript",
      "React",
      "Internal Tooling",
      "SQL",
      "Structured Outputs",
    ],
    experiencePriorityThemes: [
      "automation",
      "internal tools",
      "api",
      "workflow",
      "pipeline",
      "llm",
      "python",
      "frontend",
      "react",
    ],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: false,
  },
  applied_ai: {
    key: "applied_ai",
    cvTitle: "Applied AI & Automation Builder",
    cvTitleAliases: ["Applied AI Engineer", "AI Automation Engineer"],
    positioning:
      "Applied AI and workflow automation builder combining APIs, Python, AI-assisted coding, data processing, and product thinking.",
    sectionOrder: ATS_SAFE_ORDER_EXPERIENCE,
    preferredProjectKeys: ["aethelgard", "careeros", "redvelvetvault", "dublin_gold_testing"],
    skillPriority: [
      "Python",
      "Workflow Automation",
      "REST APIs",
      "Streamlit",
      "Prompt Engineering",
      "Data Processing",
      "Playwright",
      "SendGrid",
      "Human-in-the-loop Systems",
    ],
    experiencePriorityThemes: ["automation", "api", "lead", "workflow", "internal", "frontend"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: false,
  },
  design_engineer: {
    key: "design_engineer",
    cvTitle: "Design Engineer",
    positioning:
      "Product design, frontend implementation, design systems, interaction design, APIs, internal tooling, shipped products.",
    sectionOrder: ATS_SAFE_ORDER_PROJECTS,
    preferredProjectKeys: ["redvelvetvault", "aethelgard", "careeros"],
    skillPriority: [
      "React",
      "TypeScript",
      "Design Systems",
      "Figma",
      "Accessibility",
      "API Integration",
      "Next.js",
      "Tailwind CSS",
    ],
    experiencePriorityThemes: ["design", "frontend", "product", "ux", "react"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: true,
  },
  product_engineer: {
    key: "product_engineer",
    cvTitle: "Product Engineer",
    positioning:
      "End-to-end ownership across frontend and backend, product judgement, APIs, automation, user workflows, deployment.",
    sectionOrder: ATS_SAFE_ORDER_PROJECTS,
    preferredProjectKeys: ["careeros", "aethelgard", "redvelvetvault"],
    skillPriority: [
      "TypeScript",
      "React",
      "Next.js",
      "Python",
      "REST APIs",
      "Prisma",
      "Workflow Automation",
      "Product Strategy",
    ],
    experiencePriorityThemes: ["product", "api", "frontend", "automation", "shipping"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: true,
  },
  ux_engineer: {
    key: "ux_engineer",
    cvTitle: "UX Engineer",
    positioning:
      "UX, React, TypeScript, accessibility, component systems, prototyping, production implementation.",
    sectionOrder: ATS_SAFE_ORDER_PROJECTS,
    preferredProjectKeys: ["redvelvetvault", "careeros", "aethelgard"],
    skillPriority: [
      "React",
      "TypeScript",
      "Figma",
      "Accessibility",
      "Usability Testing",
      "Design Systems",
      "Prototyping",
      "Next.js",
    ],
    experiencePriorityThemes: ["ux", "design", "frontend", "accessibility", "prototype"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: true,
  },
  product_designer: {
    key: "product_designer",
    cvTitle: "Product Designer",
    positioning:
      "Research, interaction design, product strategy, systems thinking, prototypes, usability, technical collaboration.",
    sectionOrder: ATS_SAFE_ORDER_EXPERIENCE,
    preferredProjectKeys: ["redvelvetvault", "aethelgard", "careeros"],
    skillPriority: [
      "UX Research",
      "Usability Testing",
      "Interaction Design",
      "Figma",
      "Design Systems",
      "Prototyping",
      "Accessibility",
    ],
    experiencePriorityThemes: ["design", "ux", "research", "stakeholder", "product"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: false,
  },
  frontend_engineer: {
    key: "frontend_engineer",
    cvTitle: "Frontend Engineer",
    positioning: "React, TypeScript, production UI implementation, component architecture, accessibility.",
    sectionOrder: ATS_SAFE_ORDER_PROJECTS,
    preferredProjectKeys: ["redvelvetvault", "careeros", "aethelgard"],
    skillPriority: ["React", "TypeScript", "Next.js", "Tailwind CSS", "JavaScript", "HTML", "CSS", "Accessibility"],
    experiencePriorityThemes: ["frontend", "react", "typescript", "ui"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: true,
  },
  ux_ui_designer: {
    key: "ux_ui_designer",
    cvTitle: "UX/UI Designer",
    positioning: "Traditional UX/UI craft — research, flows, visual systems, prototypes. Light on AI engineering.",
    sectionOrder: ATS_SAFE_ORDER_EXPERIENCE,
    preferredProjectKeys: ["redvelvetvault", "aethelgard"],
    skillPriority: [
      "Figma",
      "UX Research",
      "Usability Testing",
      "Interaction Design",
      "Design Systems",
      "Prototyping",
      "Accessibility",
    ],
    experiencePriorityThemes: ["design", "ux", "ui", "visual", "research"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: false,
  },
  ai_creative: {
    key: "ai_creative",
    cvTitle: "AI Creative Technologist",
    positioning:
      "Generative media, product thinking, frontend development, and automation for scalable creative systems.",
    sectionOrder: ATS_SAFE_ORDER_EXPERIENCE,
    preferredProjectKeys: ["aethelgard", "dublin_gold_testing", "redvelvetvault"],
    skillPriority: [
      "Prompt Engineering",
      "Gemini",
      "OpenAI",
      "Workflow Automation",
      "Figma",
      "React",
      "Content Systems",
    ],
    experiencePriorityThemes: ["creative", "generative", "content", "automation", "veo"],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: false,
  },
  /** Guest / multi-niche inventory — title comes from the job, not a design default. */
  general: {
    key: "general",
    cvTitle: "Professional",
    positioning:
      "Evidence-grounded CV composed from the candidate’s imported experience and skills, tailored to the target role.",
    sectionOrder: ATS_SAFE_ORDER_EXPERIENCE,
    preferredProjectKeys: [],
    skillPriority: [
      "Customer Service",
      "Communication",
      "Cash Handling",
      "Till Work",
      "Stock Handling",
      "Inventory Checks",
      "Team Collaboration",
      "Time Management",
      "Food Preparation",
      "Hygiene Standards",
    ],
    experiencePriorityThemes: [
      "customer",
      "retail",
      "sales",
      "hospitality",
      "service",
      "stock",
      "cook",
      "kitchen",
      "event",
      "operations",
    ],
    prohibitedClaims: GLOBAL_PROHIBITED,
    projectsFirst: false,
  },
};

export function getRolePolicy(profileKey: string): RolePolicy {
  return ROLE_POLICIES[profileKey] ?? ROLE_POLICIES.general;
}

/** Pick CV title from policy + JD terminology (no fabrication). */
export function resolveCvTitle(profileKey: string, jobTitle: string): string {
  const policy = getRolePolicy(profileKey);
  const jt = jobTitle.toLowerCase();
  const cleanedJob = jobTitle
    .replace(/\s*[|–—•].*$/, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // General / unknown profiles: use the job title so hospitality ≠ “UX Engineer”
  if (profileKey === "general" || !ROLE_POLICIES[profileKey]) {
    if (cleanedJob.length >= 2 && cleanedJob.length <= 80) return cleanedJob;
    return "Professional";
  }

  if (profileKey === "ai_engineer" || profileKey === "applied_ai") {
    if (/\bai engineer\b/.test(jt)) return "AI Engineer";
    if (/\bautomation\b/.test(jt)) return "AI Automation Engineer";
    if (/\bapplied ai\b/.test(jt)) return "Applied AI Engineer";
    if (
      /\bai\b/.test(jt) &&
      /\b(developer|engineer|software|programmer|researcher)\b/.test(jt) &&
      cleanedJob.length >= 2 &&
      cleanedJob.length <= 80
    ) {
      return cleanedJob;
    }
    if (profileKey === "ai_engineer") return "AI Engineer";
  }

  if (policy.cvTitleAliases?.length) {
    for (const alias of policy.cvTitleAliases) {
      if (jt.includes(alias.toLowerCase())) return alias;
    }
  }

  // If JD title clearly matches a known alias of this policy family, prefer JD wording
  if (cleanedJob.length >= 2 && cleanedJob.length <= 80) {
    const policyWords = policy.cvTitle.toLowerCase().split(/\s+/);
    if (policyWords.every((w) => w.length < 3 || jt.includes(w))) {
      return cleanedJob;
    }
  }

  return policy.cvTitle;
}

export function globalProhibitedPatterns(): RegExp[] {
  return GLOBAL_PROHIBITED;
}
