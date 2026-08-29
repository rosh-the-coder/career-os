import { describe, expect, it } from "vitest";
import { resolveCvTitle, getRolePolicy } from "@/lib/resume/v3/role-policy";
import { isJunkExperience, eligibleExperiences } from "@/lib/resume/v3/cv-eligibility";
import type { CareerInventory, LoadedExperience } from "@/lib/resume/v3/load-career-profile";

function exp(partial: Partial<LoadedExperience> & Pick<LoadedExperience, "company" | "umbrellaTitle">): LoadedExperience {
  return {
    id: partial.id ?? "1",
    company: partial.company,
    umbrellaTitle: partial.umbrellaTitle,
    officialTitle: null,
    titleOptions: [],
    selectedOfficialTitle: null,
    approvedTitleDescriptor: null,
    titleDescriptorApproved: false,
    location: null,
    startDate: "2024",
    endDate: "2025",
    isCurrent: false,
    alternativeTitles: {},
    themes: [],
    bullets: partial.bullets ?? ["Did retail work"],
    resumeBullets: [],
    companyContext: null,
    verified: partial.verified ?? false,
    approvedForCV: partial.approvedForCV ?? false,
    sortOrder: 0,
    chronologyIndex: 0,
    relevanceScore: 0,
    preferredOrderByRole: {},
    evidence: [],
  };
}

describe("general / guest CV path", () => {
  it("uses job title for general profiles instead of UX Engineer", () => {
    expect(resolveCvTitle("general", "Retail Assistant")).toBe("Retail Assistant");
    expect(getRolePolicy("general").cvTitle).not.toMatch(/UX/i);
    expect(getRolePolicy("unknown_niche").key).toBe("general");
  });

  it("uses AI software/developer JD titles for applied_ai exports", () => {
    expect(resolveCvTitle("applied_ai", "AI Software Developer")).toBe("AI Software Developer");
  });

  it("filters markdown section headers mistaken for jobs", () => {
    expect(isJunkExperience(exp({ company: "Career summary", umbrellaTitle: "Career summary" }))).toBe(true);
    expect(isJunkExperience(exp({ company: "TESCO Express", umbrellaTitle: "Sales Assistant" }))).toBe(false);
  });

  it("falls back to imported experience when nothing is approved", () => {
    const inventory = {
      experiences: [
        exp({ company: "Target roles", umbrellaTitle: "Target roles", bullets: [] }),
        exp({
          id: "tesco",
          company: "TESCO Express",
          umbrellaTitle: "Sales Assistant",
          approvedForCV: false,
          verified: false,
        }),
      ],
      isOperator: false,
    } as CareerInventory;

    const eligible = eligibleExperiences(inventory);
    expect(eligible).toHaveLength(1);
    expect(eligible[0]!.company).toBe("TESCO Express");
  });
});
