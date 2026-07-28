import { describe, expect, it } from "vitest";
import { analyzeCvKeywordCoverage, applyAtsEdits } from "@/lib/resume/ats-optimize";
import type { AtsResumeContent } from "@/lib/resume/export-docx";

describe("analyzeCvKeywordCoverage", () => {
  it("scores matched vs missing against CV markdown", () => {
    const report = analyzeCvKeywordCoverage({
      jobTitle: "UX Engineer",
      descriptionClean:
        "We need React, TypeScript, Figma, and Accessibility. Vue experience is a plus.",
      keywords: ["React", "TypeScript", "Figma", "Accessibility", "Vue"],
      requirements: [{ text: "Strong React and TypeScript", kind: "must" }],
      cvMarkdown: `ROSHAN NAJAR, UX Engineer
PROFILE
Frontend and design engineer.
SKILLS
React · TypeScript · Figma
SELECTED PROJECTS
• Built React interfaces with TypeScript.
PROFESSIONAL EXPERIENCE
• Designed accessible flows in Figma.
`,
      skillsInventory: [
        { name: "React", keywords: ["react"] },
        { name: "TypeScript", keywords: ["typescript"] },
        { name: "Figma", keywords: ["figma"] },
      ],
    });

    expect(report.matched.map((m) => m.toLowerCase())).toEqual(
      expect.arrayContaining(["react", "typescript", "figma"]),
    );
    expect(report.missing.map((m) => m.toLowerCase())).toEqual(
      expect.arrayContaining(["vue", "accessibility"]),
    );
    expect(report.overlapPercent).toBeGreaterThan(0);
    expect(report.overlapPercent).toBeLessThan(100);
  });

  it("flags skills-only terms as presentButWeak", () => {
    const report = analyzeCvKeywordCoverage({
      jobTitle: "Design Engineer",
      descriptionClean: "Must know Playwright for E2E testing.",
      keywords: ["Playwright"],
      requirements: [],
      cvMarkdown: `SKILLS
Playwright · React

SELECTED PROJECTS
• Built React UI components.
`,
      skillsInventory: [{ name: "Playwright", keywords: ["playwright"] }],
    });

    expect(report.matched.map((m) => m.toLowerCase())).toContain("playwright");
    expect(report.presentButWeak.map((m) => m.toLowerCase())).toContain("playwright");
  });
});

describe("applyAtsEdits", () => {
  const base: AtsResumeContent = {
    documentTitle: "ROSHAN NAJAR, UX Engineer",
    contactLine: "Dublin",
    linksLine: "LINKS",
    profile: "Old profile",
    skills: ["React", "Figma"],
    projects: [
      {
        dates: "2025",
        name: "RVV",
        blurb: "",
        role: "Designer",
        bullets: ["Built a gallery"],
      },
    ],
    experiences: [
      {
        dates: "2024 — Present",
        title: "Designer",
        company: "Independent",
        bullets: ["Shipped UI"],
      },
    ],
    education: [],
    technicalStack: [],
  };

  it("patches profile and bullets by path", () => {
    const next = applyAtsEdits(base, [
      { path: "profile", after: "New profile with React" },
      { path: "experiences[0].bullets[0]", after: "Shipped React UI" },
      { path: "projects[0].bullets[0]", after: "Built a React gallery" },
      { path: "skills", after: "React · TypeScript · Figma" },
    ]);
    expect(next.profile).toBe("New profile with React");
    expect(next.experiences[0].bullets[0]).toBe("Shipped React UI");
    expect(next.projects[0].bullets[0]).toBe("Built a React gallery");
    expect(next.skills).toEqual(["React", "TypeScript", "Figma"]);
    expect(base.profile).toBe("Old profile");
  });
});
