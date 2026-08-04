/**
 * Claim validation V3 — validates against external evidence only (never the CV itself).
 */

import { parseJsonArray } from "@/lib/utils";
import type { CareerInventory } from "./load-career-profile";
import { buildEvidenceCorpus } from "./load-career-profile";
import { getRolePolicy, globalProhibitedPatterns } from "./role-policy";
import type { ResumeClaim, ResumeContentV3, ResumeValidationV3 } from "./types";

const TECH_FABRICATION = [
  /\brag\b/i,
  /vector database/i,
  /langchain/i,
  /langgraph/i,
  /azure openai/i,
  /transformer architecture/i,
  /ocr pipeline/i,
  /legal[- ]document/i,
  /paying customers/i,
  /saas revenue/i,
  /autonomous (job )?application/i,
];

function collectProhibited(inventory: CareerInventory, profileKey: string): RegExp[] {
  const patterns = [...globalProhibitedPatterns(), ...getRolePolicy(profileKey).prohibitedClaims];
  for (const e of inventory.evidence) {
    for (const p of e.prohibitedClaims) {
      if (p.trim()) {
        const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Word boundaries prevent "RAG" matching inside "Storage"
        patterns.push(new RegExp(`\\b${escaped}\\b`, "i"));
      }
    }
  }
  for (const proj of inventory.projects) {
    for (const c of proj.constraints) {
      // constraints are human phrases — match key prohibitions
      if (/etsy business|revenue|passive income|ml engineer|senior ai/i.test(c)) {
        patterns.push(new RegExp(c.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      }
    }
  }
  // Always ban fabrication tech unless present in evidence corpus
  patterns.push(...TECH_FABRICATION);
  return patterns;
}

function allClaims(content: ResumeContentV3): ResumeClaim[] {
  return [
    content.summary,
    ...content.selectedProjects.flatMap((p) => p.bullets),
    ...content.experience.flatMap((e) => e.bullets),
  ];
}

export function validateResumeContentV3(
  content: ResumeContentV3,
  inventory: CareerInventory,
): ResumeValidationV3 {
  const corpusTexts = buildEvidenceCorpus(inventory);
  const corpus = corpusTexts.join("\n").toLowerCase();
  const prohibited = collectProhibited(inventory, content.target.profileKey);

  const blockedClaims: string[] = [];
  const unsupportedClaims: string[] = [];
  const warnings: string[] = [];
  const estimateWarnings: string[] = [];
  const approvedClaims: { text: string; evidenceIds: string[] }[] = [];
  const evidenceMap: Record<string, string[]> = {};

  // Metric gate: needsReview metrics must not appear
  for (const e of inventory.evidence) {
    for (const m of e.metrics) {
      if (m.needsReview && !m.approvedForCV) {
        const token = String(m.valueText ?? m.value ?? "");
        if (token && corpusIncludesGenerated(content, token)) {
          warnings.push(`Unapproved/needs-review metric may appear: ${m.label}`);
        }
      }
      if (m.isEstimate) {
        estimateWarnings.push(`Estimate needs review: ${m.label}`);
      }
    }
  }

  for (const claim of allClaims(content)) {
    evidenceMap[claim.text] = claim.evidenceIds;

    for (const pattern of prohibited) {
      if (pattern.test(claim.text)) {
        // Allow if the same phrase is explicitly in evidence as a negation/constraint context — still block affirmative claims
        blockedClaims.push(claim.text);
        break;
      }
    }

    // Technology fabrication: if pattern matched tech list and term not in evidence corpus, block
    for (const tech of TECH_FABRICATION) {
      if (tech.test(claim.text)) {
        const raw = claim.text.toLowerCase();
        const term = raw.match(tech)?.[0];
        if (term && !corpus.includes(term.toLowerCase())) {
          if (!blockedClaims.includes(claim.text)) blockedClaims.push(claim.text);
        } else if (term && corpus.includes(term) && /never|not |do not|don't|without/i.test(corpus)) {
          // evidence mentions as prohibition — still block affirmative CV use
          if (!blockedClaims.includes(claim.text)) blockedClaims.push(claim.text);
        }
      }
    }

    if (claim.evidenceIds.length === 0) {
      unsupportedClaims.push(`No evidence IDs: ${claim.text}`);
    }

    if (claim.claimType === "estimated" && !/estimat|approx|about|more than|~|roughly/i.test(claim.text)) {
      warnings.push(`Estimate not labelled in text: ${claim.text.slice(0, 80)}`);
    }

    // Numeric tokens should appear in evidence corpus when claimType is verified
    if (claim.claimType === "verified") {
      const numbers = claim.text.match(/\b\d+(\.\d+)?%?\b/g) ?? [];
      for (const n of numbers) {
        if (!corpus.includes(n.toLowerCase()) && !/estimat|approx|about|more than/i.test(claim.text)) {
          unsupportedClaims.push(`Numeric ${n} not in evidence: ${claim.text.slice(0, 100)}`);
        }
      }
    }

    if (claim.claimType === "verified" || claim.claimType === "reported") {
      approvedClaims.push({ text: claim.text, evidenceIds: claim.evidenceIds });
    }
  }

  // Seniority / title fabrication in header
  if (/senior ai engineer|machine learning engineer|data scientist/i.test(content.header.professionalTitle)) {
    blockedClaims.push(`Title blocked: ${content.header.professionalTitle}`);
  }

  const status =
    blockedClaims.length > 0 ? "failed" : unsupportedClaims.length > 0 || warnings.length > 0 || estimateWarnings.length > 0 ? "warning" : "passed";

  return {
    status,
    blockedClaims: [...new Set(blockedClaims)],
    unsupportedClaims: [...new Set(unsupportedClaims)],
    warnings: [...new Set(warnings)],
    estimateWarnings: [...new Set(estimateWarnings)],
    approvedClaims,
    evidenceMap,
  };
}

function corpusIncludesGenerated(content: ResumeContentV3, token: string): boolean {
  const blob = [
    content.summary.text,
    ...content.selectedProjects.flatMap((p) => p.bullets.map((b) => b.text)),
    ...content.experience.flatMap((e) => e.bullets.map((b) => b.text)),
  ]
    .join("\n")
    .toLowerCase();
  return blob.includes(token.toLowerCase());
}

export function legacyValidationFromV3(v: ResumeValidationV3) {
  return {
    status: v.status,
    claims: [
      ...v.approvedClaims.map((c) => ({ text: c.text, supported: true })),
      ...v.unsupportedClaims.map((text) => ({ text, supported: false, reason: "unsupported" })),
      ...v.blockedClaims.map((text) => ({ text, supported: false, reason: "blocked" })),
    ],
    blockedClaims: v.blockedClaims,
    estimateWarnings: v.estimateWarnings,
  };
}

/** Helper for tests — parse prohibited list from JSON string */
export function parseProhibitedList(json: string): string[] {
  return parseJsonArray<string>(json);
}
