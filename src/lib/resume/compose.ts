import type { ResumeDraft, ResumeGenerationInput } from "@/lib/ai/types";

export function composeResumeDeterministic(
  input: ResumeGenerationInput,
  summaryOverride?: string,
): ResumeDraft {
  const summary = summaryOverride?.trim() || input.profile.positioning;

  const expBlock = input.experiences
    .map((e) => {
      const dates = `${e.startDate} – ${e.endDate ?? "Present"}`;
      const bullets = e.bullets.map((b) => `• ${b}`).join("\n");
      return `${e.title} — ${e.company}\n${dates}\n${bullets}`;
    })
    .join("\n\n");

  const projBlock = input.projects
    .map((p) => {
      const bullets = p.bullets.map((b) => `• ${b}`).join("\n");
      return `${p.name} — ${p.role}\nStack: ${p.stack.join(", ")}\n${bullets}`;
    })
    .join("\n\n");

  const markdown = `# ${input.contact.name}
${input.contact.location} | ${input.contact.email}
Portfolio: ${input.contact.portfolioUrl}
GitHub: ${input.contact.githubUrl}
LinkedIn: ${input.contact.linkedinUrl}

## Summary
${summary}

## Experience
${expBlock}

## Selected Projects
${projBlock}

## Skills
${input.skills.join(" · ")}

## Education
${input.education.map((e) => `• ${e}`).join("\n")}
`;

  return {
    summary,
    experiences: input.experiences,
    projects: input.projects,
    skills: input.skills,
    education: input.education,
    markdown,
  };
}

export interface ClaimValidationResult {
  status: "passed" | "failed" | "warning";
  claims: { text: string; supported: boolean; reason?: string }[];
  blockedClaims: string[];
  estimateWarnings: string[];
}

const PROHIBITED_PATTERNS = [
  /senior ai engineer/i,
  /machine[-\s]?learning engineer/i,
  /data scientist/i,
  /successful etsy business/i,
  /passive income/i,
  /phd/i,
  /model training/i,
];

export function validateClaims(
  draft: ResumeDraft,
  allowedEvidenceTexts: string[],
  estimateLabels: string[] = [],
): ClaimValidationResult {
  const corpus = allowedEvidenceTexts.join("\n").toLowerCase();
  const allBullets = [
    draft.summary,
    ...draft.experiences.flatMap((e) => e.bullets),
    ...draft.projects.flatMap((p) => p.bullets),
  ];

  const claims: ClaimValidationResult["claims"] = [];
  const blockedClaims: string[] = [];
  const estimateWarnings: string[] = [];

  for (const text of allBullets) {
    for (const pattern of PROHIBITED_PATTERNS) {
      if (pattern.test(text)) {
        blockedClaims.push(text);
        claims.push({ text, supported: false, reason: `Prohibited claim pattern: ${pattern}` });
      }
    }

    // Metric-like numbers should appear in evidence corpus or be marked estimate
    const numbers = text.match(/\b\d+(\.\d+)?%?\b/g) ?? [];
    for (const n of numbers) {
      if (!corpus.includes(n.toLowerCase()) && !text.toLowerCase().includes("estimat")) {
        // soft warning — numbers not found in evidence
        claims.push({
          text: `${n} in: ${text}`,
          supported: false,
          reason: "Numeric claim not found in evidence corpus",
        });
      }
    }
  }

  for (const label of estimateLabels) {
    estimateWarnings.push(`Estimate needs review: ${label}`);
  }

  const unsupported = claims.filter((c) => !c.supported);
  const status =
    blockedClaims.length > 0 ? "failed" : unsupported.length > 0 || estimateWarnings.length > 0 ? "warning" : "passed";

  return { status, claims, blockedClaims, estimateWarnings };
}

export function buildResumeFileName(opts: {
  personName: string;
  role: string;
  company: string;
  pageLength?: 1 | 2;
  date?: Date;
  /** When regenerating for the same job + page length, pass 2+ for `_v2` suffix. */
  versionIndex?: number;
}): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  const name = safe(opts.personName) || "Resume";
  const d = (opts.date ?? new Date()).toISOString().slice(0, 10);
  const parts = [name, safe(opts.role), safe(opts.company)];
  if (opts.pageLength === 2) parts.push("2page");
  else if (opts.pageLength === 1) parts.push("1page");
  parts.push(d);
  let base = parts.filter(Boolean).join("_");
  if (opts.versionIndex && opts.versionIndex > 1) {
    base += `_v${opts.versionIndex}`;
  }
  return base;
}
