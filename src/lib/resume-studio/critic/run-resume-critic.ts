/**
 * Resume Critic — post-compose recruiter-style review.
 * Reuses Groq → Gemini JSON pattern from llm-judge / ats-optimize.
 */

import { PROMPT_GUARDRAILS } from "@/lib/ai/types";
import type { CompositionDocument } from "../composition/types";
import { compositionToMarkdown } from "../composition/compose-document";

export interface ResumeCritiqueScores {
  visualHierarchy: number;
  readability: number;
  atsCompatibility: number;
  contentDensity: number;
  evidenceStrength: number;
  executiveScanability: number;
  roleFit: number;
}

export interface ResumeCritique {
  scores: ResumeCritiqueScores;
  weakBullets: string[];
  genericWording: string[];
  missingQuantifiedImpact: string[];
  suggestions: string[];
  overall: "ready" | "revise" | "blocked";
  meta: { provider: "groq" | "gemini" | "heuristic"; model: string; used: boolean };
}

function clamp10(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return 5;
  return Math.max(1, Math.min(10, Math.round(x)));
}

function coerceCritique(raw: unknown, heuristic: ResumeCritique): ResumeCritique {
  if (!raw || typeof raw !== "object") return heuristic;
  const o = raw as Record<string, unknown>;
  const scoresRaw = (o.scores ?? {}) as Record<string, unknown>;
  const overall = o.overall === "ready" || o.overall === "revise" || o.overall === "blocked" ? o.overall : heuristic.overall;
  return {
    scores: {
      visualHierarchy: clamp10(scoresRaw.visualHierarchy ?? heuristic.scores.visualHierarchy),
      readability: clamp10(scoresRaw.readability ?? heuristic.scores.readability),
      atsCompatibility: clamp10(scoresRaw.atsCompatibility ?? heuristic.scores.atsCompatibility),
      contentDensity: clamp10(scoresRaw.contentDensity ?? heuristic.scores.contentDensity),
      evidenceStrength: clamp10(scoresRaw.evidenceStrength ?? heuristic.scores.evidenceStrength),
      executiveScanability: clamp10(scoresRaw.executiveScanability ?? heuristic.scores.executiveScanability),
      roleFit: clamp10(scoresRaw.roleFit ?? heuristic.scores.roleFit),
    },
    weakBullets: Array.isArray(o.weakBullets) ? o.weakBullets.map(String).slice(0, 12) : [],
    genericWording: Array.isArray(o.genericWording) ? o.genericWording.map(String).slice(0, 12) : [],
    missingQuantifiedImpact: Array.isArray(o.missingQuantifiedImpact)
      ? o.missingQuantifiedImpact.map(String).slice(0, 12)
      : [],
    suggestions: Array.isArray(o.suggestions) ? o.suggestions.map(String).slice(0, 12) : heuristic.suggestions,
    overall,
    meta: heuristic.meta,
  };
}

/** Deterministic critic when LLM disabled / unavailable */
export function heuristicCritique(doc: CompositionDocument): ResumeCritique {
  const md = compositionToMarkdown(doc);
  const hasMetrics = /\d+(\.\d+)?K|\+\d+%|→|->/.test(md);
  const hasProjects = /Aethelgard|CareerOS|RedVelvetVault/i.test(md);
  const experiences = doc.blocks.filter((b) => b.kind === "experience").length;
  const suggestions: string[] = [];
  if (!hasMetrics) suggestions.push("Add verified quantified impact where evidence exists.");
  if (experiences < 2) suggestions.push("Ensure core employment history is visible.");
  if (!hasProjects) suggestions.push("Include strongest verified projects for the target role.");

  const scores: ResumeCritiqueScores = {
    visualHierarchy: doc.themeId === "arthur-cox" ? 8 : 6,
    readability: 7,
    atsCompatibility: 8,
    contentDensity: hasMetrics ? 8 : 5,
    evidenceStrength: hasProjects ? 8 : 5,
    executiveScanability: doc.themeId === "arthur-cox" ? 8 : 6,
    roleFit: 7,
  };
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 7;
  return {
    scores,
    weakBullets: [],
    genericWording: [],
    missingQuantifiedImpact: hasMetrics ? [] : ["Limited quantified impact visible"],
    suggestions,
    overall: avg >= 7.5 ? "ready" : avg >= 5.5 ? "revise" : "blocked",
    meta: { provider: "heuristic", model: "deterministic-v4", used: false },
  };
}

async function callGroq(prompt: string): Promise<{ json: unknown; model: string } | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const model = process.env.GROQ_SCORE_MODEL || "llama-3.1-8b-instant";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a senior recruiter reviewing a résumé. Return JSON only." },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  try {
    return { json: JSON.parse(text), model };
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) return { json: JSON.parse(text.slice(start, end + 1)), model };
    return null;
  }
}

async function callGemini(prompt: string): Promise<{ json: unknown; model: string } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_SCORE_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  try {
    return { json: JSON.parse(text), model };
  } catch {
    return null;
  }
}

function buildPrompt(doc: CompositionDocument, jobTitle?: string, company?: string, jdSnippet?: string): string {
  const md = compositionToMarkdown(doc);
  return `${PROMPT_GUARDRAILS}

Review this résumé as a hiring manager for ${jobTitle ?? "the target role"} at ${company ?? "the company"}.
Score each dimension 1–10. Do not invent metrics. Flag weak/generic bullets.

Return JSON:
{
  "scores": {
    "visualHierarchy": 1-10,
    "readability": 1-10,
    "atsCompatibility": 1-10,
    "contentDensity": 1-10,
    "evidenceStrength": 1-10,
    "executiveScanability": 1-10,
    "roleFit": 1-10
  },
  "weakBullets": string[],
  "genericWording": string[],
  "missingQuantifiedImpact": string[],
  "suggestions": string[],
  "overall": "ready" | "revise" | "blocked"
}

JD snippet:
${(jdSnippet ?? "").slice(0, 2500)}

RESUME:
${md.slice(0, 12000)}
`;
}

export async function runResumeCritic(opts: {
  document: CompositionDocument;
  jobTitle?: string;
  company?: string;
  jdSnippet?: string;
}): Promise<ResumeCritique> {
  const base = heuristicCritique(opts.document);
  if (process.env.SCORE_LLM_DISABLED === "true" || process.env.RESUME_CRITIC_DISABLED === "true") {
    return base;
  }

  const prompt = buildPrompt(opts.document, opts.jobTitle, opts.company, opts.jdSnippet);
  try {
    const groq = await callGroq(prompt);
    if (groq) {
      const c = coerceCritique(groq.json, base);
      c.meta = { provider: "groq", model: groq.model, used: true };
      return c;
    }
    const gemini = await callGemini(prompt);
    if (gemini) {
      const c = coerceCritique(gemini.json, base);
      c.meta = { provider: "gemini", model: gemini.model, used: true };
      return c;
    }
  } catch (err) {
    console.warn("[resume-critic]", err instanceof Error ? err.message : err);
  }
  return base;
}
