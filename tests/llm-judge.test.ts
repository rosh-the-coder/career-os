import { describe, expect, it } from "vitest";
import { mergeHeuristicWithJudge, type LlmJudgeOutput } from "../src/lib/scoring/llm-judge";
import type { JobScoreResult } from "../src/lib/types";

const heuristic: JobScoreResult = {
  totalScore: 70,
  breakdown: {
    skillsOverlap: 0.7,
    evidenceStrength: 0.8,
    projectRelevance: 0.7,
    seniorityFit: 0.8,
    currentEligibility: 0.85,
    longTermPermit: 0.55,
    locationFit: 1,
    salaryFit: 0.7,
    careerAlignment: 0.6,
  },
  recommendedProfileKey: "ux_engineer",
  strengths: ["Heuristic strength"],
  gaps: ["Heuristic gap"],
  eligibilityCurrent: "likely_eligible_now",
  eligibilityFuture: "unknown",
  recommendedProjects: ["RedVelvetVault"],
  evidenceUsed: ["RedVelvetVault"],
  softFlags: [],
  hardRejected: false,
};

describe("llm judge merge", () => {
  it("keeps heuristic when judge unused", () => {
    const judge: LlmJudgeOutput = {
      result: {
        totalScore: 40,
        breakdown: heuristic.breakdown,
        recommendedProfileKey: "applied_ai",
        strengths: ["AI"],
        gaps: ["Gap"],
      },
      meta: { provider: "none", model: "heuristic-fallback", used: false, error: "no key" },
    };
    const merged = mergeHeuristicWithJudge(heuristic, judge);
    expect(merged.totalScore).toBe(70);
    expect(merged.judgeMeta.used).toBe(false);
  });

  it("applies judge scores when used", () => {
    const judge: LlmJudgeOutput = {
      result: {
        totalScore: 52,
        breakdown: { ...heuristic.breakdown, skillsOverlap: 0.4, seniorityFit: 0.3 },
        recommendedProfileKey: "applied_ai",
        strengths: ["Built LLM tooling in Irish AI Creative matches JD automation ask"],
        gaps: ["JD requires enterprise LangChain/Semantic Kernel depth not evidenced"],
        recommendedProjects: ["Dublin Gold Testing B2B Growth Engine"],
        evidenceUsed: ["Irish AI Creative"],
      },
      meta: { provider: "groq", model: "llama-3.1-8b-instant", used: true },
    };
    const merged = mergeHeuristicWithJudge(heuristic, judge);
    expect(merged.totalScore).toBe(52);
    expect(merged.recommendedProfileKey).toBe("applied_ai");
    expect(merged.strengths[0]).toMatch(/LLM tooling|Irish AI/i);
    expect(merged.judgeMeta.provider).toBe("groq");
  });
});
