import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PROMPT_GUARDRAILS,
  type ApplicationAnswers,
  type AnswerGenerationInput,
  type LLMProvider,
  type ParsedJob,
  type ResumeDraft,
  type ResumeGenerationInput,
} from "@/lib/ai/types";
import { parseJobText } from "@/lib/jobs/parse-job";
import { composeResumeDeterministic } from "@/lib/resume/compose";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

function isQuotaOrRateLimit(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|quota|rate.?limit|too many requests|resource_exhausted/i.test(msg);
}

async function geminiJson<T>(prompt: string): Promise<T | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const model = client.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(`${PROMPT_GUARDRAILS}\n\n${prompt}`);
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (err) {
    // Free-tier 429 / network / JSON errors → caller uses deterministic fallback
    if (isQuotaOrRateLimit(err)) {
      console.warn("[gemini] quota/rate-limit — using deterministic fallback");
    } else {
      console.warn("[gemini] call failed — using deterministic fallback:", err);
    }
    return null;
  }
}

export class DeterministicProvider implements LLMProvider {
  async extractJob(jobText: string): Promise<ParsedJob> {
    const parsed = parseJobText({ description: jobText });
    return {
      title: parsed.title,
      company: parsed.company,
      requirements: parsed.requirements.map((r) => r.text),
      responsibilities: parsed.responsibilities,
      keywords: parsed.keywords,
      seniority: parsed.seniority,
      yearsRequired: parsed.yearsRequired,
      sponsorshipNotes: parsed.sponsorshipText,
    };
  }

  async generateResume(input: ResumeGenerationInput): Promise<ResumeDraft> {
    return composeResumeDeterministic(input);
  }

  async generateAnswers(input: AnswerGenerationInput): Promise<ApplicationAnswers> {
    return {
      answers: [
        {
          question: input.question,
          answer: `Based on verified experience: ${input.evidenceNotes.slice(0, 2).join(" ")} ${input.settingsNotes}`.trim(),
        },
      ],
    };
  }
}

export class GeminiProvider implements LLMProvider {
  private fallback = new DeterministicProvider();

  async extractJob(jobText: string): Promise<ParsedJob> {
    const enriched = await geminiJson<ParsedJob>(`
Extract structured job fields as JSON with keys:
title, company, requirements (string[]), responsibilities (string[]), keywords (string[]),
seniority, yearsRequired (number|null), sponsorshipNotes.
Job text:
${jobText.slice(0, 20000)}
`);
    if (!enriched?.title) return this.fallback.extractJob(jobText);
    return enriched;
  }

  async generateResume(input: ResumeGenerationInput): Promise<ResumeDraft> {
    const base = composeResumeDeterministic(input);
    const refined = await geminiJson<{
      summary: string;
      experiences: ResumeDraft["experiences"];
      projects: ResumeDraft["projects"];
    }>(`
Rewrite resume content using ONLY the provided evidence. Do not invent facts.
Return JSON: { summary, experiences (same structure), projects (same structure) }.
Profile: ${input.profile.name} — ${input.profile.positioning}
Target role: ${input.jobTitle} at ${input.company}
Evidence experiences: ${JSON.stringify(input.experiences)}
Evidence projects: ${JSON.stringify(input.projects)}
Skills: ${input.skills.join(", ")}
`);
    if (!refined?.summary) return base;
    return {
      ...base,
      summary: refined.summary,
      experiences: refined.experiences ?? base.experiences,
      projects: refined.projects ?? base.projects,
      markdown: base.markdown,
    };
  }

  async generateAnswers(input: AnswerGenerationInput): Promise<ApplicationAnswers> {
    const result = await geminiJson<ApplicationAnswers>(`
Generate truthful application answers as JSON { answers: [{ question, answer }] }.
Question: ${input.question}
Role: ${input.jobTitle} at ${input.company}
Evidence notes: ${input.evidenceNotes.join(" | ")}
Settings: ${input.settingsNotes}
`);
    if (!result?.answers?.length) return this.fallback.generateAnswers(input);
    return result;
  }
}

export function getLLMProvider(): LLMProvider {
  // CV packs work without any LLM. Gemini is optional polish only.
  if (process.env.RESUME_DETERMINISTIC_ONLY !== "false") {
    return new DeterministicProvider();
  }
  if (process.env.GEMINI_API_KEY) return new GeminiProvider();
  return new DeterministicProvider();
}
