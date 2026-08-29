/**
 * Export validation helpers for Resume Engine V3 correction pass.
 */

import { containsRawIsoDate } from "@/lib/resume/v3/date-format";
import { getRolePolicy } from "./role-policy";

const REQUIRED_HEADINGS = [
  "PROFILE",
  "SKILLS",
  "PROFESSIONAL EXPERIENCE",
] as const;

const PROHIBITED_SNIPPETS = [
  "without inventing unverified metrics",
  "via layoff",
  "[Website LINK]",
  "[Show-reel LINK]",
  "undefined",
  "null",
];

export interface ExportValidationResult {
  ok: boolean;
  errors: string[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Index of a section heading on its own line — ignores the word in body copy. */
function headingIndex(text: string, heading: string): number {
  const re = new RegExp(`^${escapeRegExp(heading)}\\s*$`, "m");
  const match = re.exec(text);
  return match ? match.index : -1;
}

export function resumeExportValidationOpts(input: {
  profileKey: string;
  pageLength: 1 | 2;
  sectionOrder?: readonly string[];
}) {
  const aiLike = input.profileKey === "ai_engineer" || input.profileKey === "applied_ai";
  const policy = getRolePolicy(input.profileKey);
  let experienceFirst = !policy.projectsFirst;
  if (input.sectionOrder) {
    const exp = input.sectionOrder.indexOf("experience");
    const proj = input.sectionOrder.indexOf("selectedProjects");
    if (exp >= 0 && proj >= 0) experienceFirst = exp < proj;
  }
  return {
    requireAiEngineerTitle: false,
    requireTechnicalStack: input.pageLength === 2 && aiLike,
    requireRedVelvetVault: input.pageLength === 2 && aiLike,
    requireAethelgard: aiLike,
    requireCareerOs: aiLike,
    expectExperienceBeforeProjects: experienceFirst,
    requireFullEmploymentHistory: input.pageLength === 2 && aiLike,
  };
}

export function validateExportedResumeText(
  text: string,
  opts: {
    /** Display name that must appear in the export (defaults to operator seed name). */
    candidateName?: string;
    /** When set, the export must include this header title (not a hardcoded "AI Engineer"). */
    expectedProfessionalTitle?: string;
    requireTechnicalStack?: boolean;
    requireRedVelvetVault?: boolean;
    requireAethelgard?: boolean;
    requireCareerOs?: boolean;
    requireAiEngineerTitle?: boolean;
    expectExperienceBeforeProjects?: boolean;
    /** Arthur Cox / AI Engineer 2-page mandatory employment checks */
    requireFullEmploymentHistory?: boolean;
  } = {},
): ExportValidationResult {
  const errors: string[] = [];
  const upper = text;

  const candidateName = (opts.candidateName ?? "").trim();
  if (candidateName) {
    const nameRe = new RegExp(escapeRegExp(candidateName), "i");
    if (!nameRe.test(text)) {
      errors.push(`Missing candidate name (${candidateName})`);
    }
  }
  if (opts.requireAiEngineerTitle && !/AI Engineer/i.test(text)) {
    errors.push("Missing AI Engineer title");
  }

  const expectedTitle = opts.expectedProfessionalTitle?.trim();
  if (expectedTitle) {
    const titleRe = new RegExp(escapeRegExp(expectedTitle), "i");
    if (!titleRe.test(text)) {
      errors.push(`Missing professional title (${expectedTitle})`);
    }
  }

  for (const h of REQUIRED_HEADINGS) {
    if (headingIndex(upper, h) < 0) errors.push(`Missing heading ${h}`);
  }

  if (opts.requireTechnicalStack !== false) {
    if (!upper.includes("TECHNICAL STACK")) errors.push("Missing TECHNICAL STACK");
    const stackIdx = upper.indexOf("TECHNICAL STACK");
    if (stackIdx >= 0) {
      const after = upper.slice(stackIdx + "TECHNICAL STACK".length, stackIdx + 80).trim();
      if (!after || /^(PROFILE|SKILLS|PROFESSIONAL|SELECTED|EDUCATION)/.test(after)) {
        errors.push("TECHNICAL STACK heading has no content");
      }
    }
  } else if (upper.includes("TECHNICAL STACK")) {
    const stackIdx = upper.indexOf("TECHNICAL STACK");
    const after = upper.slice(stackIdx + "TECHNICAL STACK".length).trim();
    if (!after) errors.push("Empty TECHNICAL STACK must be omitted");
  }

  if (opts.requireAethelgard !== false && !/Aethelgard/i.test(text)) {
    errors.push("Missing Aethelgard");
  }
  if (opts.requireCareerOs !== false && !/CareerOS/i.test(text)) {
    errors.push("Missing CareerOS");
  }
  if (opts.requireRedVelvetVault && !/RedVelvetVault/i.test(text)) {
    errors.push("Missing RedVelvetVault");
  }

  if (opts.requireFullEmploymentHistory) {
    if (!/Irish AI Creative/i.test(text)) errors.push("Missing Irish AI Creative");
    if (!/Two Blokes Trading/i.test(text)) errors.push("Missing Two Blokes Trading");
    if (!/\bIndependent\b/i.test(text)) errors.push("Missing Independent");
    if (!/Arcop Associates/i.test(text)) errors.push("Missing Arcop Associates");

    if (!/Mar 2026\s*[–—-]\s*Jul 2026/.test(text)) {
      errors.push("Irish AI dates must be Mar 2026 – Jul 2026");
    }
    if (!/Jan 2025\s*[–—-]\s*Jan 2026/.test(text)) {
      errors.push("Two Blokes dates must be Jan 2025 – Jan 2026");
    }
    if (!/Jan 2022\s*[–—-]\s*Mar 2023/.test(text)) {
      errors.push("Arcop dates must be Jan 2022 – Mar 2023");
    }

    // Experience order: Irish AI → Two Blokes → Independent → Arcop
    const irish = text.search(/Irish AI Creative/i);
    const two = text.search(/Two Blokes Trading/i);
    const indep = text.search(/\bIndependent\b/i);
    const arcop = text.search(/Arcop Associates/i);
    if (!(irish >= 0 && two > irish && indep > two && arcop > indep)) {
      errors.push("Experience order must be Irish AI → Two Blokes → Independent → Arcop");
    }
  }

  // Always reject known-bad legacy date strings
  if (/Arcop[\s\S]{0,120}2019\s*[–—-]\s*2019/i.test(text) || /2019\s*[–—-]\s*2019[\s\S]{0,80}Arcop/i.test(text)) {
    errors.push("Prohibited Arcop dates 2019 – 2019");
  }
  if (
    /Two Blokes[\s\S]{0,160}2024\s*[–—-]\s*2025/i.test(text) ||
    /2024\s*[–—-]\s*2025[\s\S]{0,80}Two Blokes/i.test(text)
  ) {
    errors.push("Prohibited Two Blokes dates 2024 – 2025");
  }

  if (opts.expectExperienceBeforeProjects !== false) {
    const exp = headingIndex(upper, "PROFESSIONAL EXPERIENCE");
    const proj = headingIndex(upper, "SELECTED PROJECTS");
    // Projects section may be omitted for niches with no project inventory
    if (proj >= 0 && (exp < 0 || !(exp < proj))) {
      errors.push("PROFESSIONAL EXPERIENCE must appear before SELECTED PROJECTS");
    }
  }

  // Match role-policy section order: AI/experience-first vs design projects-first
  const markers =
    opts.expectExperienceBeforeProjects === false
      ? ["PROFILE", "SKILLS", "SELECTED PROJECTS", "PROFESSIONAL EXPERIENCE", "EDUCATION"]
      : ["PROFILE", "SKILLS", "PROFESSIONAL EXPERIENCE", "SELECTED PROJECTS", "EDUCATION"];
  let last = -1;
  for (const m of markers) {
    const idx = headingIndex(upper, m);
    if (idx < 0) {
      // Optional when no projects were selected / rendered
      if (m === "SELECTED PROJECTS") continue;
      errors.push(`Section order broken at ${m}`);
      break;
    }
    if (idx < last) {
      errors.push(`Section order broken at ${m}`);
      break;
    }
    last = idx;
  }

  for (const bad of PROHIBITED_SNIPPETS) {
    if (text.toLowerCase().includes(bad.toLowerCase())) {
      errors.push(`Prohibited snippet: ${bad}`);
    }
  }

  if (containsRawIsoDate(text)) {
    errors.push("Raw ISO date fragment present (YYYY-MM or YYYY-MM-DD)");
  }

  if (/LinkedIn[^\n]*PROFILE/i.test(text) || /GitHub[^\n]*PROFILE/i.test(text)) {
    errors.push("Links appear to merge with PROFILE heading");
  }

  return { ok: errors.length === 0, errors };
}
