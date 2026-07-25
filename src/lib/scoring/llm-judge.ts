import { PROFILE_KEYS, type JobScoreResult, type ProfileKey, type ScoreBreakdown } from "@/lib/types";
import type { ScoringContext } from "@/lib/scoring/score-job";

export type LlmJudgeMeta = {
  provider: "groq" | "gemini" | "none";
  model: string;
  used: boolean;
  error?: string;
};

export type LlmJudgeOutput = {
  result: Partial<JobScoreResult> & {
    totalScore: number;
    breakdown: ScoreBreakdown;
    recommendedProfileKey: string;
    strengths: string[];
    gaps: string[];
  };
  meta: LlmJudgeMeta;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function emptyBreakdown(): ScoreBreakdown {
  return {
    skillsOverlap: 0,
    evidenceStrength: 0,
    projectRelevance: 0,
    seniorityFit: 0,
    currentEligibility: 0,
    longTermPermit: 0,
    locationFit: 0,
    salaryFit: 0,
    careerAlignment: 0,
  };
}

function normalizeBreakdown(raw: Partial<ScoreBreakdown> | undefined, fallback: ScoreBreakdown): ScoreBreakdown {
  const b = raw ?? {};
  return {
    skillsOverlap: clamp01(b.skillsOverlap ?? fallback.skillsOverlap),
    evidenceStrength: clamp01(b.evidenceStrength ?? fallback.evidenceStrength),
    projectRelevance: clamp01(b.projectRelevance ?? fallback.projectRelevance),
    seniorityFit: clamp01(b.seniorityFit ?? fallback.seniorityFit),
    currentEligibility: clamp01(b.currentEligibility ?? fallback.currentEligibility),
    longTermPermit: clamp01(b.longTermPermit ?? fallback.longTermPermit),
    locationFit: clamp01(b.locationFit ?? fallback.locationFit),
    salaryFit: clamp01(b.salaryFit ?? fallback.salaryFit),
    careerAlignment: clamp01(b.careerAlignment ?? fallback.careerAlignment),
  };
}

function buildCandidateBrief(ctx: ScoringContext): string {
  const skills = ctx.skills.map((s) => s.name).slice(0, 40).join(", ");
  const projects = ctx.projects
    .slice(0, 6)
    .map((p) => `- ${p.name} [${p.stack.slice(0, 8).join(", ")}] evidenceFor=${p.useAsEvidenceFor.join("/")}`)
    .join("\n");
  const evidence = ctx.evidence
    .filter((e) => e.verified)
    .slice(0, 12)
    .map((e) => `- ${e.title} (${e.keywords.slice(0, 6).join(", ")})`)
    .join("\n");
  const profiles = ctx.profiles
    .map((p) => `- ${p.key}: ${p.name} — ${p.positioning.slice(0, 180)}`)
    .join("\n");

  return `CANDIDATE: Roshan Najar, Dublin, Ireland.
Work permission: Stamp 1G (can work full-time now; valid ~Sep 2027, renewable ~Sep 2028). Prefer Ireland/Dublin. Soft salary floor €40k.
Target band: mid-level UX Engineer / Product Designer / Design Engineer / applied AI creative — NOT staff/principal/director, NOT 8+ YOE research/PhD ML tracks, NOT mechanical CAD.

PROFILES (pick one key):
${profiles}

VERIFIED SKILLS:
${skills}

PROJECTS:
${projects}

EVIDENCE TITLES:
${evidence}`;
}

function buildJudgePrompt(ctx: ScoringContext, heuristic: JobScoreResult): string {
  const jd = (ctx.job.descriptionClean || ctx.job.descriptionRaw).slice(0, 14000);
  return `You are an honest hiring-fit judge for a job-search OS. Score ONLY from the JD + candidate evidence. Do not invent experience. Be strict and specific.

Return ONLY valid JSON with this shape:
{
  "totalScore": 0-100,
  "recommendedProfileKey": one of ${JSON.stringify(PROFILE_KEYS)},
  "breakdown": {
    "skillsOverlap": 0-1,
    "evidenceStrength": 0-1,
    "projectRelevance": 0-1,
    "seniorityFit": 0-1,
    "currentEligibility": 0-1,
    "longTermPermit": 0-1,
    "locationFit": 0-1,
    "salaryFit": 0-1,
    "careerAlignment": 0-1
  },
  "strengths": ["specific strength citing JD phrase + matching evidence"],
  "gaps": ["specific gap citing JD requirement the candidate lacks"],
  "recommendedProjects": ["project names from the list that best support this JD"],
  "evidenceUsed": ["evidence titles used"],
  "rationale": "2 sentences on overall fit"
}

Rules:
- If role is heavy backend ML research / PhD / staff+ / clearly 8+ years required, seniorityFit and totalScore must be low (<45) unless evidence truly matches (it usually won't).
- Applied AI / LLM app engineering with React/TS can score mid if evidence supports tooling/automation — do not confuse with research scientist.
- Prefer truthful low scores over flattering high scores.
- Strengths/gaps must be concrete (quote or paraphrase JD). Never write generic "aws mentioned but not in inventory" spam — explain why it matters for THIS role.
- Heuristic baseline (ignore if wrong): total=${heuristic.totalScore}, profile=${heuristic.recommendedProfileKey}.

${buildCandidateBrief(ctx)}

JOB:
Title: ${ctx.job.title}
Company: ${ctx.job.company}
Location: ${ctx.job.location ?? ""} / ${ctx.job.country ?? ""}
Remote: ${ctx.job.remoteType ?? ""}
YearsRequired field: ${ctx.job.yearsRequired ?? "unknown"}

JD:
${jd}`;
}

function parseJudgeJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function coerceJudge(
  raw: Record<string, unknown>,
  heuristic: JobScoreResult,
): LlmJudgeOutput["result"] {
  const profileKey = String(raw.recommendedProfileKey ?? heuristic.recommendedProfileKey);
  const validProfile = (PROFILE_KEYS as readonly string[]).includes(profileKey)
    ? profileKey
    : heuristic.recommendedProfileKey;

  const breakdown = normalizeBreakdown(raw.breakdown as Partial<ScoreBreakdown> | undefined, heuristic.breakdown);
  // Eligibility dimensions stay grounded in hard-filter truth
  breakdown.currentEligibility = heuristic.breakdown.currentEligibility;
  breakdown.longTermPermit = heuristic.breakdown.longTermPermit;
  breakdown.locationFit = Math.max(breakdown.locationFit, heuristic.breakdown.locationFit * 0.85);

  const strengths = Array.isArray(raw.strengths)
    ? raw.strengths.map(String).filter(Boolean).slice(0, 8)
    : heuristic.strengths;
  const gaps = Array.isArray(raw.gaps) ? raw.gaps.map(String).filter(Boolean).slice(0, 8) : heuristic.gaps;
  const recommendedProjects = Array.isArray(raw.recommendedProjects)
    ? raw.recommendedProjects.map(String).slice(0, 5)
    : heuristic.recommendedProjects;
  const evidenceUsed = Array.isArray(raw.evidenceUsed)
    ? raw.evidenceUsed.map(String).slice(0, 8)
    : heuristic.evidenceUsed;

  const rationale = raw.rationale ? String(raw.rationale) : "";
  if (rationale) {
    strengths.unshift(`AI judge: ${rationale}`);
  }

  return {
    totalScore: clampScore(Number(raw.totalScore)),
    breakdown,
    recommendedProfileKey: validProfile as ProfileKey | string,
    strengths,
    gaps,
    recommendedProjects,
    evidenceUsed,
  };
}

async function callGroq(prompt: string): Promise<{ text: string; model: string } | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  // 8B instant = highest free daily headroom; override with GROQ_SCORE_MODEL for quality
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
            "You are a rigorous job-fit scoring engine. Reply with JSON only. Never invent candidate experience.",
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
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq empty response");
  return { text, model };
}

async function callGemini(prompt: string): Promise<{ text: string; model: string } | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.GEMINI_SCORE_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
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

/**
 * LLM job-fit judge. Prefer Groq (best free throughput), then Gemini, else none.
 * Hard-filter eligibility is preserved from the heuristic result.
 */
export async function runLlmJudge(
  ctx: ScoringContext,
  heuristic: JobScoreResult,
): Promise<LlmJudgeOutput> {
  if (heuristic.hardRejected) {
    return {
      result: {
        totalScore: 0,
        breakdown: emptyBreakdown(),
        recommendedProfileKey: heuristic.recommendedProfileKey,
        strengths: [],
        gaps: heuristic.gaps,
      },
      meta: { provider: "none", model: "hard-reject", used: false },
    };
  }

  if (process.env.SCORE_LLM_DISABLED === "true") {
    return {
      result: {
        totalScore: heuristic.totalScore,
        breakdown: heuristic.breakdown,
        recommendedProfileKey: heuristic.recommendedProfileKey,
        strengths: heuristic.strengths,
        gaps: heuristic.gaps,
        recommendedProjects: heuristic.recommendedProjects,
        evidenceUsed: heuristic.evidenceUsed,
      },
      meta: { provider: "none", model: "disabled", used: false },
    };
  }

  const prompt = buildJudgePrompt(ctx, heuristic);
  const errors: string[] = [];

  // Prefer Groq for free headroom; Gemini fallback
  try {
    const groq = await callGroq(prompt);
    if (groq) {
      const parsed = parseJudgeJson(groq.text);
      if (parsed) {
        return {
          result: coerceJudge(parsed, heuristic),
          meta: { provider: "groq", model: groq.model, used: true },
        };
      }
      errors.push("Groq JSON parse failed");
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Groq failed");
  }

  try {
    const gemini = await callGemini(prompt);
    if (gemini) {
      const parsed = parseJudgeJson(gemini.text);
      if (parsed) {
        return {
          result: coerceJudge(parsed, heuristic),
          meta: { provider: "gemini", model: gemini.model, used: true },
        };
      }
      errors.push("Gemini JSON parse failed");
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Gemini failed");
  }

  const joined = errors.join(" | ");
  const rateLimited = /429|rate.?limit|too many requests|tokens per minute|tpm|quota/i.test(joined);
  const friendly = rateLimited
    ? "LLM rate limit hit — trim the job description below the soft word limit, Save, wait ~1 min, then Score again."
    : joined || "No LLM key or judge failed — heuristic keyword score used.";

  return {
    result: {
      totalScore: heuristic.totalScore,
      breakdown: heuristic.breakdown,
      recommendedProfileKey: heuristic.recommendedProfileKey,
      strengths: [
        ...heuristic.strengths,
        rateLimited
          ? "AI judge skipped (rate limit) — heuristic score shown; trim JD words and retry."
          : "AI judge unavailable — heuristic keyword score used (add GROQ_API_KEY for LLM scoring).",
      ],
      gaps: heuristic.gaps,
      recommendedProjects: heuristic.recommendedProjects,
      evidenceUsed: heuristic.evidenceUsed,
    },
    meta: {
      provider: "none",
      model: "heuristic-fallback",
      used: false,
      error: friendly.slice(0, 400),
    },
  };
}

export function mergeHeuristicWithJudge(
  heuristic: JobScoreResult,
  judge: LlmJudgeOutput,
): JobScoreResult & { judgeMeta: LlmJudgeMeta } {
  if (heuristic.hardRejected || !judge.meta.used) {
    return {
      ...heuristic,
      softFlags: [
        ...heuristic.softFlags,
        ...(judge.meta.error
          ? [
              {
                code: /rate limit|trim the job/i.test(judge.meta.error)
                  ? "llm_rate_limit"
                  : "llm_judge_fallback",
                message: judge.meta.error,
                severity: (/rate limit|trim the job/i.test(judge.meta.error)
                  ? "warn"
                  : "info") as "warn" | "info",
              },
            ]
          : []),
      ],
      judgeMeta: judge.meta,
    };
  }

  const j = judge.result;
  return {
    ...heuristic,
    totalScore: j.totalScore,
    breakdown: j.breakdown,
    recommendedProfileKey: j.recommendedProfileKey,
    strengths: j.strengths,
    gaps: [
      ...j.gaps,
      ...heuristic.softFlags.filter((f) => f.severity === "warn").map((f) => f.message),
    ].slice(0, 10),
    recommendedProjects: j.recommendedProjects ?? heuristic.recommendedProjects,
    evidenceUsed: j.evidenceUsed ?? heuristic.evidenceUsed,
    softFlags: [
      ...heuristic.softFlags,
      {
        code: "llm_judge",
        message: `Scored by ${judge.meta.provider}:${judge.meta.model}`,
        severity: "info",
      },
    ],
    judgeMeta: judge.meta,
  };
}
