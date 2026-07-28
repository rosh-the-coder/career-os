import { PROMPT_GUARDRAILS, type ResumeDraft } from "@/lib/ai/types";
import { TECH_HINTS, TECH_KEYWORDS, textIncludesTerm, uniqueStrings } from "@/lib/jobs/tech-terms";
import { validateClaims } from "@/lib/resume/compose";
import type { AtsResumeContent } from "@/lib/resume/export-docx";
import { atsToMarkdown } from "@/lib/resume/reference-templates";

export interface SkillInventoryItem {
  name: string;
  keywords: string[];
}

export interface KeywordCoverageReport {
  overlapPercent: number;
  matched: string[];
  missing: string[];
  presentButWeak: string[];
  relevantJdTerms: string[];
  analyzedAt: string;
}

export interface AtsEditSuggestion {
  path: string;
  before: string;
  after: string;
  reason: string;
  keywordsIntroduced: string[];
  claimStatus: "ok" | "blocked" | "warning";
  claimNote?: string;
}

export interface AtsOptimizeCache {
  coverage: KeywordCoverageReport;
  edits?: AtsEditSuggestion[];
  suggestMeta?: {
    provider: string;
    model: string;
    note?: string;
    suggestedAt: string;
  };
}

export interface AnalyzeCvInput {
  jobTitle: string;
  descriptionClean: string;
  descriptionRaw?: string;
  keywords: string[];
  requirements: { text: string; kind?: string }[];
  cvMarkdown: string;
  skillsInventory: SkillInventoryItem[];
}

function jdCorpus(input: AnalyzeCvInput): string {
  const reqs = input.requirements.map((r) => r.text).join(" ");
  const kws = input.keywords.join(" ");
  return `${input.jobTitle} ${input.descriptionClean || input.descriptionRaw || ""} ${reqs} ${kws}`.toLowerCase();
}

function displayLabel(term: string): string {
  const found = TECH_KEYWORDS.find((k) => k.toLowerCase() === term.toLowerCase());
  if (found) return found;
  if (term.length <= 3) return term.toUpperCase();
  return term.charAt(0).toUpperCase() + term.slice(1);
}

/** Build the set of JD-relevant terms we care about for CV overlap. */
export function collectJdTerms(input: AnalyzeCvInput): string[] {
  const corpus = jdCorpus(input);
  const terms: string[] = [];

  for (const k of input.keywords) {
    if (textIncludesTerm(corpus, k)) terms.push(displayLabel(k));
  }

  for (const hint of TECH_HINTS) {
    if (textIncludesTerm(corpus, hint)) terms.push(displayLabel(hint));
  }

  for (const kw of TECH_KEYWORDS) {
    if (textIncludesTerm(corpus, kw)) terms.push(kw);
  }

  for (const skill of input.skillsInventory) {
    const aliases = [skill.name, ...skill.keywords];
    if (aliases.some((a) => textIncludesTerm(corpus, a))) {
      terms.push(skill.name);
    }
  }

  return uniqueStrings(terms);
}

/**
 * Deterministic CV↔JD keyword coverage against generated CV markdown.
 * overlapPercent = matched / relevantJdTerms (0 if no JD terms).
 */
export function analyzeCvKeywordCoverage(input: AnalyzeCvInput): KeywordCoverageReport {
  const cvLower = input.cvMarkdown.toLowerCase();
  const skillsSectionMatch = input.cvMarkdown.match(/SKILLS\n([\s\S]*?)(?:\n\n|\nSELECTED|\nPROFESSIONAL|\nEDUCATION|\nTECHNICAL|$)/i);
  const skillsSection = (skillsSectionMatch?.[1] ?? "").toLowerCase();
  const bulletsAndBody = cvLower.replace(skillsSection, " ");

  const relevantJdTerms = collectJdTerms(input);
  const matched: string[] = [];
  const missing: string[] = [];
  const presentButWeak: string[] = [];

  for (const term of relevantJdTerms) {
    const t = term.toLowerCase();
    const inCv = textIncludesTerm(cvLower, t);
    if (!inCv) {
      missing.push(term);
      continue;
    }
    matched.push(term);
    const inBody = textIncludesTerm(bulletsAndBody, t);
    const inSkillsOnly = textIncludesTerm(skillsSection, t) && !inBody;
    if (inSkillsOnly) presentButWeak.push(term);
  }

  const denom = relevantJdTerms.length;
  const overlapPercent = denom === 0 ? 0 : Math.round((matched.length / denom) * 100);

  return {
    overlapPercent,
    matched,
    missing,
    presentButWeak,
    relevantJdTerms,
    analyzedAt: new Date().toISOString(),
  };
}

export function parseOptimizeCache(raw: string | null | undefined): AtsOptimizeCache | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AtsOptimizeCache;
    if (!parsed?.coverage) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getByPath(ats: AtsResumeContent, path: string): string | null {
  if (path === "profile") return ats.profile;
  if (path === "skills") return ats.skills.join(" · ");

  const proj = path.match(/^projects\[(\d+)\]\.bullets\[(\d+)\]$/);
  if (proj) {
    const i = Number(proj[1]);
    const j = Number(proj[2]);
    return ats.projects[i]?.bullets[j] ?? null;
  }

  const exp = path.match(/^experiences\[(\d+)\]\.bullets\[(\d+)\]$/);
  if (exp) {
    const i = Number(exp[1]);
    const j = Number(exp[2]);
    return ats.experiences[i]?.bullets[j] ?? null;
  }

  return null;
}

function setByPath(ats: AtsResumeContent, path: string, value: string): boolean {
  if (path === "profile") {
    ats.profile = value;
    return true;
  }
  if (path === "skills") {
    ats.skills = value
      .split(/[·|,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return true;
  }

  const proj = path.match(/^projects\[(\d+)\]\.bullets\[(\d+)\]$/);
  if (proj) {
    const i = Number(proj[1]);
    const j = Number(proj[2]);
    if (!ats.projects[i] || ats.projects[i].bullets[j] === undefined) return false;
    ats.projects[i].bullets[j] = value;
    return true;
  }

  const exp = path.match(/^experiences\[(\d+)\]\.bullets\[(\d+)\]$/);
  if (exp) {
    const i = Number(exp[1]);
    const j = Number(exp[2]);
    if (!ats.experiences[i] || ats.experiences[i].bullets[j] === undefined) return false;
    ats.experiences[i].bullets[j] = value;
    return true;
  }

  return false;
}

export function applyAtsEdits(
  ats: AtsResumeContent,
  edits: Pick<AtsEditSuggestion, "path" | "after">[],
): AtsResumeContent {
  const next: AtsResumeContent = structuredClone(ats);
  for (const edit of edits) {
    setByPath(next, edit.path, edit.after);
  }
  return next;
}

export function atsContentToDraft(ats: AtsResumeContent): ResumeDraft {
  const markdown = atsToMarkdown(ats);
  return {
    summary: ats.profile,
    skills: ats.skills,
    experiences: ats.experiences.map((e) => ({
      company: e.company,
      title: e.title,
      startDate: e.dates.split("—")[0]?.trim() ?? "",
      endDate: e.dates.split("—")[1]?.trim() ?? null,
      bullets: e.bullets,
    })),
    projects: ats.projects.map((p) => ({
      name: p.name,
      role: p.role,
      stack: [],
      bullets: p.bullets,
    })),
    education: ats.education.map((e) => e.line),
    markdown,
  };
}

function validateEditText(
  after: string,
  evidenceTexts: string[],
  estimateLabels: string[],
): { status: AtsEditSuggestion["claimStatus"]; note?: string } {
  const mini: ResumeDraft = {
    summary: "",
    skills: [],
    education: [],
    experiences: [{ company: "", title: "", startDate: "", endDate: null, bullets: [after] }],
    projects: [],
    markdown: after,
  };
  const result = validateClaims(mini, evidenceTexts, estimateLabels);
  if (result.blockedClaims.length) {
    return { status: "blocked", note: result.claims.find((c) => !c.supported)?.reason };
  }
  if (result.status === "warning") {
    return { status: "warning", note: "Numeric claim may need evidence review" };
  }
  return { status: "ok" };
}

function buildSuggestPrompt(args: {
  jdExcerpt: string;
  ats: AtsResumeContent;
  missing: string[];
  evidenceExcerpt: string;
}): string {
  const bulletIndex: { path: string; text: string }[] = [
    { path: "profile", text: args.ats.profile },
    ...args.ats.projects.flatMap((p, i) =>
      p.bullets.map((b, j) => ({ path: `projects[${i}].bullets[${j}]`, text: b })),
    ),
    ...args.ats.experiences.flatMap((e, i) =>
      e.bullets.map((b, j) => ({ path: `experiences[${i}].bullets[${j}]`, text: b })),
    ),
  ];

  return `${PROMPT_GUARDRAILS}

You rewrite EXISTING resume bullets to mirror job-description language where truthful.
Do not invent tools, metrics, titles, employers, or seniority.
You may only rephrase lines from the bullet index. Prefer introducing missing keywords that are already implied by the bullet.

Missing keywords to consider (only if truthful for that bullet): ${args.missing.join(", ") || "(none)"}

JOB DESCRIPTION EXCERPT:
${args.jdExcerpt.slice(0, 4000)}

EVIDENCE CORPUS (claims must stay faithful):
${args.evidenceExcerpt.slice(0, 5000)}

BULLET INDEX (path → text):
${bulletIndex.map((b) => `${b.path}: ${b.text}`).join("\n")}

SKILLS LINE: ${args.ats.skills.join(" · ")}

Return JSON only:
{
  "edits": [
    {
      "path": "experiences[0].bullets[1]",
      "before": "exact current text",
      "after": "rewritten text",
      "reason": "short why",
      "keywordsIntroduced": ["React"]
    }
  ]
}

Rules:
- Max 8 edits
- before must match the bullet index text exactly for that path
- path must be one of: profile | skills | projects[i].bullets[j] | experiences[i].bullets[j]
- For skills path, before/after are the full skills line joined with " · "
- Skip bullets you cannot improve truthfully
`;
}

async function callGroqJson(prompt: string): Promise<{ text: string; model: string } | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.GROQ_SCORE_MODEL?.trim() || "llama-3.1-8b-instant";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You rewrite resume bullets for ATS keyword fit. Reply with JSON only. Never invent experience.",
        },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq empty response");
  return { text, model };
}

async function callGeminiJson(prompt: string): Promise<{ text: string; model: string } | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.GEMINI_SCORE_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini empty response");
  return { text, model };
}

function parseEditsJson(text: string): Omit<AtsEditSuggestion, "claimStatus" | "claimNote">[] {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as {
    edits?: {
      path?: string;
      before?: string;
      after?: string;
      reason?: string;
      keywordsIntroduced?: string[];
    }[];
  };
  if (!Array.isArray(parsed.edits)) return [];
  return parsed.edits
    .filter((e) => e.path && e.before && e.after)
    .slice(0, 8)
    .map((e) => ({
      path: String(e.path),
      before: String(e.before),
      after: String(e.after),
      reason: String(e.reason ?? ""),
      keywordsIntroduced: Array.isArray(e.keywordsIntroduced)
        ? e.keywordsIntroduced.map(String)
        : [],
    }));
}

export async function suggestAtsEdits(input: {
  jobTitle: string;
  descriptionClean: string;
  ats: AtsResumeContent;
  coverage: KeywordCoverageReport;
  evidenceTexts: string[];
  estimateLabels?: string[];
}): Promise<{
  edits: AtsEditSuggestion[];
  meta: { provider: string; model: string; note?: string; suggestedAt: string };
}> {
  const estimateLabels = input.estimateLabels ?? [];
  const prompt = buildSuggestPrompt({
    jdExcerpt: `${input.jobTitle}\n\n${input.descriptionClean}`,
    ats: input.ats,
    missing: input.coverage.missing,
    evidenceExcerpt: input.evidenceTexts.join("\n\n"),
  });

  let raw: { text: string; model: string } | null = null;
  let provider = "none";
  const errors: string[] = [];

  try {
    raw = await callGroqJson(prompt);
    if (raw) provider = "groq";
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Groq failed");
  }

  if (!raw) {
    try {
      raw = await callGeminiJson(prompt);
      if (raw) provider = "gemini";
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Gemini failed");
    }
  }

  if (!raw) {
    return {
      edits: [],
      meta: {
        provider: "none",
        model: "none",
        note: errors[0] || "No LLM API key configured — keyword analysis only.",
        suggestedAt: new Date().toISOString(),
      },
    };
  }

  let parsed: Omit<AtsEditSuggestion, "claimStatus" | "claimNote">[] = [];
  try {
    parsed = parseEditsJson(raw.text);
  } catch {
    return {
      edits: [],
      meta: {
        provider,
        model: raw.model,
        note: "LLM returned invalid JSON",
        suggestedAt: new Date().toISOString(),
      },
    };
  }

  const edits: AtsEditSuggestion[] = [];
  for (const edit of parsed) {
    const current = getByPath(input.ats, edit.path);
    if (current === null) continue;
    // Prefer path-current as before when LLM drifts
    const before = current;
    if (edit.after.trim() === before.trim()) continue;

    const claim = validateEditText(edit.after, input.evidenceTexts, estimateLabels);
    if (claim.status === "blocked") continue;

    edits.push({
      ...edit,
      before,
      claimStatus: claim.status,
      claimNote: claim.note,
    });
  }

  return {
    edits,
    meta: {
      provider,
      model: raw.model,
      suggestedAt: new Date().toISOString(),
    },
  };
}

/** Parse ResumeVersion.contentJson → ats object. */
export function parseAtsFromContentJson(contentJson: string): AtsResumeContent | null {
  try {
    const parsed = JSON.parse(contentJson) as { ats?: AtsResumeContent };
    if (!parsed.ats?.profile || !Array.isArray(parsed.ats.experiences)) return null;
    return parsed.ats;
  } catch {
    return null;
  }
}
