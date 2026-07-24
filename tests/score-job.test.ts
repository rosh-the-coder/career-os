import { describe, expect, it } from "vitest";
import { scoreJob } from "../src/lib/scoring/score-job";
import type { ScoringContext } from "../src/lib/scoring/score-job";

function baseCtx(overrides?: Partial<ScoringContext>): ScoringContext {
  return {
    job: {
      title: "UX Engineer",
      company: "Dublin Product Co",
      location: "Dublin, Ireland",
      country: "Ireland",
      remoteType: "hybrid",
      descriptionRaw:
        "We need a UX Engineer with React, TypeScript, Figma, accessibility, and design systems. Hybrid Dublin. Permanent.",
      descriptionClean:
        "We need a UX Engineer with React, TypeScript, Figma, accessibility, and design systems. Hybrid Dublin. Permanent.",
      keywords: ["React", "TypeScript", "Figma"],
      requirements: [{ text: "React and TypeScript", kind: "required" }],
      responsibilities: ["Build accessible product UI"],
      yearsRequired: 3,
    },
    settings: {
      includeFallbackVideoRoles: false,
      salaryFloorEur: 40000,
      salaryFloorSoft: true,
      canWorkFullTimeNow: true,
    },
    profiles: [
      {
        key: "ux_engineer",
        name: "UX Engineer",
        keywords: ["React", "TypeScript", "Figma", "Accessibility", "Design systems"],
        evidenceOrder: ["RedVelvetVault"],
        positioning: "UX Engineer bridging design and code",
      },
      {
        key: "design_engineer",
        name: "Design Engineer",
        keywords: ["React", "TypeScript", "Internal tools"],
        evidenceOrder: ["RedVelvetVault"],
        positioning: "Design Engineer",
      },
    ],
    skills: [
      { name: "React", category: "frontend", keywords: [] },
      { name: "TypeScript", category: "frontend", keywords: [] },
      { name: "Figma", category: "design", keywords: [] },
      { name: "Accessibility", category: "design", keywords: ["a11y"] },
      { name: "Design systems", category: "design", keywords: [] },
    ],
    projects: [
      {
        key: "redvelvetvault",
        name: "RedVelvetVault",
        stack: ["React", "TypeScript", "Tailwind CSS"],
        useAsEvidenceFor: ["Design engineering", "UX"],
        features: ["Modular UI"],
      },
    ],
    evidence: [
      {
        id: "1",
        title: "RedVelvetVault",
        keywords: ["React", "TypeScript", "UX"],
        allowedProfiles: ["ux_engineer", "*"],
        confidence: "high",
        verified: true,
      },
    ],
    defaultProfileKey: "ux_engineer",
    ...overrides,
  };
}

describe("scoreJob", () => {
  it("scores a strong UX Engineer match highly and recommends UX Engineer", () => {
    const result = scoreJob(baseCtx());
    expect(result.hardRejected).toBe(false);
    expect(result.totalScore).toBeGreaterThanOrEqual(65);
    expect(result.recommendedProfileKey).toBe("ux_engineer");
    expect(result.softFlags.some((f) => f.code === "years_requested")).toBe(true);
  });

  it("returns zero score on hard reject", () => {
    const result = scoreJob(
      baseCtx({
        job: {
          ...baseCtx().job,
          title: "Staff Designer",
          descriptionClean: "Staff designer in Dublin",
          descriptionRaw: "Staff designer in Dublin",
        },
      }),
    );
    expect(result.hardRejected).toBe(true);
    expect(result.totalScore).toBe(0);
  });

  it("does not hard-reject on years alone", () => {
    const result = scoreJob(
      baseCtx({
        job: {
          ...baseCtx().job,
          yearsRequired: 4,
        },
      }),
    );
    expect(result.hardRejected).toBe(false);
    expect(result.totalScore).toBeGreaterThan(0);
  });
});
