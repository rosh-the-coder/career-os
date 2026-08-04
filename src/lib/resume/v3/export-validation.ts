/**
 * Export validation helpers for Resume Engine V3 correction pass.
 */

import { containsRawIsoDate } from "@/lib/resume/v3/date-format";

const REQUIRED_HEADINGS = [
  "PROFILE",
  "SKILLS",
  "PROFESSIONAL EXPERIENCE",
  "SELECTED PROJECTS",
  "EDUCATION",
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

export function validateExportedResumeText(
  text: string,
  opts: {
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

  if (!/ROSHAN NAJAR/i.test(text)) errors.push("Missing ROSHAN NAJAR");
  if (opts.requireAiEngineerTitle !== false && !/AI Engineer/i.test(text)) {
    errors.push("Missing AI Engineer title");
  }

  for (const h of REQUIRED_HEADINGS) {
    if (!upper.includes(h)) errors.push(`Missing heading ${h}`);
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
    const exp = upper.indexOf("PROFESSIONAL EXPERIENCE");
    const proj = upper.indexOf("SELECTED PROJECTS");
    if (exp < 0 || proj < 0 || !(exp < proj)) {
      errors.push("PROFESSIONAL EXPERIENCE must appear before SELECTED PROJECTS");
    }
  }

  const markers = ["PROFILE", "SKILLS", "PROFESSIONAL EXPERIENCE", "SELECTED PROJECTS", "EDUCATION"];
  let last = -1;
  for (const m of markers) {
    const idx = upper.indexOf(m);
    if (idx < 0 || idx < last) {
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
