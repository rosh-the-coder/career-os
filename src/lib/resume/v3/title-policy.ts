/**
 * Role Title Policy — never invent or substantially alter professional job titles.
 *
 * Priority:
 * 1. Official title supplied by the user (selectedOfficialTitle / officialTitle / umbrellaTitle)
 * 2. If multiple official titles exist, use the user-selected one
 * 3. Append ONE truthful descriptor only when explicitly approved
 *
 * CareerOS may strengthen descriptions. It must preserve titles.
 */

import type { LoadedExperience } from "./load-career-profile";

export interface TitlePolicyResult {
  title: string;
  /** Raw official title without descriptor */
  officialTitle: string;
  descriptor?: string;
  /** Legacy display line — only when descriptor was approved (not a title replacement) */
  functionalFocus?: string;
  warnings: string[];
}

/** Titles that look engineered over a creative/ops base role — never invent these as replacements. */
export const INVENTED_TITLE_PATTERNS = [
  /product\s*&\s*growth\s*systems\s*engineer/i,
  /ai\s*platform\s*engineer/i,
  /growth\s*systems\s*engineer/i,
  /content\s*systems\s*&\s*growth\s*collaborator/i,
];

const VAGUE_TITLES = /^(associate|executive|consultant|specialist|coordinator|analyst|intern|assistant)$/i;

export function parseTitleOptions(exp: LoadedExperience): string[] {
  const options: string[] = [];
  for (const t of exp.titleOptions ?? []) {
    if (typeof t === "string" && t.trim()) options.push(t.trim());
  }
  const official = (exp.selectedOfficialTitle || exp.officialTitle || exp.umbrellaTitle || "").trim();
  if (official && !options.some((o) => o.toLowerCase() === official.toLowerCase())) {
    options.unshift(official);
  }
  return [...new Map(options.map((o) => [o.toLowerCase(), o])).values()];
}

function approvedDescriptor(exp: LoadedExperience): string | undefined {
  if (!exp.titleDescriptorApproved) return undefined;
  const fromField = exp.approvedTitleDescriptor?.trim();
  if (fromField) return fromField;

  const desc = exp.alternativeTitles._approvedDescriptor?.trim();
  if (desc) return desc;
  return undefined;
}

/**
 * Resolve display title. Never replaces official title with profile-tailored inventions.
 */
export function resolveOfficialExperienceTitle(exp: LoadedExperience): TitlePolicyResult {
  const warnings: string[] = [];
  const options = parseTitleOptions(exp);
  const selected =
    (exp.selectedOfficialTitle || exp.officialTitle || "").trim() ||
    options[0] ||
    exp.umbrellaTitle.trim();

  const officialTitle = selected;

  // Detect if stored umbrella/official was previously invented over a known base
  if (INVENTED_TITLE_PATTERNS.some((p) => p.test(officialTitle))) {
    warnings.push(
      `Title "${officialTitle}" looks invented — prefer the employer-supplied official title (e.g. Video Editor).`,
    );
  }

  const descriptor = approvedDescriptor(exp);
  let title = officialTitle;

  if (descriptor) {
    // Append once — never replace
    const already = new RegExp(`\\(\\s*${descriptor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\)`, "i");
    if (!already.test(title)) {
      title = `${officialTitle} (${descriptor})`;
    }
  } else if (VAGUE_TITLES.test(officialTitle.split(/[—(]/)[0]!.trim()) && options.length === 1) {
    warnings.push(
      `Title "${officialTitle}" is vague — append one truthful descriptor only after explicit user approval.`,
    );
  }

  // Strip legacy "Functional focus:" replacements that invent alternate job titles
  return {
    title,
    officialTitle,
    descriptor,
    functionalFocus: undefined,
    warnings,
  };
}

/** True if candidate would substantially alter (replace) the official title rather than append. */
export function isTitleReplacement(official: string, proposed: string): boolean {
  const o = official.toLowerCase().replace(/\s+/g, " ").trim();
  const p = proposed.toLowerCase().replace(/\s+/g, " ").trim();
  if (p === o) return false;
  if (p.startsWith(o) && /^\s*\(/.test(p.slice(o.length))) return false; // append descriptor
  // Proposed shares almost no tokens with official → replacement
  const oTokens = new Set(o.split(/[^a-z0-9]+/).filter((t) => t.length > 2));
  const pTokens = p.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  if (!oTokens.size) return true;
  const overlap = pTokens.filter((t) => oTokens.has(t)).length;
  return overlap / oTokens.size < 0.5;
}
