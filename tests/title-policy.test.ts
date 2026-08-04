/**
 * Role title policy + no-repetition rules.
 */
import { describe, expect, it } from "vitest";
import {
  isTitleReplacement,
  resolveOfficialExperienceTitle,
} from "@/lib/resume/v3/title-policy";
import {
  isRepetitiveAgainstSummary,
  selectNonRepetitiveBullets,
  semanticSimilarity,
} from "@/lib/resume/v3/no-repetition";
import type { LoadedExperience } from "@/lib/resume/v3/load-career-profile";

function exp(partial: Partial<LoadedExperience> & Pick<LoadedExperience, "company" | "umbrellaTitle">): LoadedExperience {
  return {
    id: "e1",
    officialTitle: null,
    titleOptions: [],
    selectedOfficialTitle: null,
    approvedTitleDescriptor: null,
    titleDescriptorApproved: false,
    location: null,
    startDate: "2025",
    endDate: "2026",
    isCurrent: false,
    alternativeTitles: {},
    themes: [],
    bullets: [],
    resumeBullets: [],
    companyContext: null,
    verified: true,
    approvedForCV: true,
    sortOrder: 0,
    chronologyIndex: 0,
    relevanceScore: 0,
    preferredOrderByRole: {},
    evidence: [],
    ...partial,
  };
}

describe("role title policy", () => {
  it("preserves official Video Editor and appends approved descriptor only", () => {
    const resolved = resolveOfficialExperienceTitle(
      exp({
        company: "Two Blokes Trading",
        umbrellaTitle: "Video Editor",
        officialTitle: "Video Editor",
        selectedOfficialTitle: "Video Editor",
        approvedTitleDescriptor: "Content & Growth",
        titleDescriptorApproved: true,
      }),
    );
    expect(resolved.title).toBe("Video Editor (Content & Growth)");
    expect(resolved.officialTitle).toBe("Video Editor");
  });

  it("does not append descriptor without approval", () => {
    const resolved = resolveOfficialExperienceTitle(
      exp({
        company: "Two Blokes Trading",
        umbrellaTitle: "Video Editor",
        officialTitle: "Video Editor",
        approvedTitleDescriptor: "Content & Growth",
        titleDescriptorApproved: false,
      }),
    );
    expect(resolved.title).toBe("Video Editor");
  });

  it("never treats invented engineering titles as acceptable replacements", () => {
    expect(isTitleReplacement("Video Editor", "Product & Growth Systems Engineer")).toBe(true);
    expect(isTitleReplacement("Graphic Designer", "AI Platform Engineer")).toBe(true);
    expect(isTitleReplacement("Video Editor", "Video Editor (Content & Growth)")).toBe(false);
    expect(isTitleReplacement("Product Designer", "Product Designer (UX)")).toBe(false);
  });

  it("warns when an invented engineering title is stored as official", () => {
    const resolved = resolveOfficialExperienceTitle(
      exp({
        company: "Two Blokes Trading",
        umbrellaTitle: "Product & Growth Systems Engineer",
        officialTitle: "Product & Growth Systems Engineer",
      }),
    );
    expect(resolved.warnings.length).toBeGreaterThan(0);
  });
});

describe("no repetition rule", () => {
  it("flags summary/bullet clones above ~80% similarity", () => {
    const summary = "Grew YouTube subscribers through short-form publishing.";
    const bad = "Grew YouTube subscribers through short-form publishing systems.";
    const good = "Produced 30+ podcast episodes across YouTube and Instagram.";
    expect(semanticSimilarity(summary, bad)).toBeGreaterThan(0.8);
    expect(isRepetitiveAgainstSummary(summary, bad)).toBe(true);
    expect(isRepetitiveAgainstSummary(summary, good)).toBe(false);
  });

  it("keeps contribution bullets that differ from the business summary", () => {
    const summary = "Finance-focused digital content brand targeting retail investors.";
    const selected = selectNonRepetitiveBullets(summary, [
      { text: "Finance-focused digital content brand targeting retail investors." },
      { text: "Produced 30+ podcast episodes and 250+ short-form videos across YouTube." },
      { text: "Increased YouTube subscribers from 2.9K to 8.2K (+183%)." },
    ], 3);
    expect(selected.map((s) => s.text).join(" ")).not.toMatch(/^Finance-focused/);
    expect(selected.length).toBe(2);
  });
});
