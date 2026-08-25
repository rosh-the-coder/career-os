import { describe, expect, it } from "vitest";
import { parseCareerHistoryMarkdown } from "@/lib/onboarding/parse-history-md";
import {
  buildTitleHintRegex,
  buildExcludeTitleRegex,
  isPrimaryMarketHit,
} from "@/lib/jobs/discover-prefs";

describe("parseCareerHistoryMarkdown", () => {
  it("extracts experience bullets without inventing metrics", () => {
    const md = `# Experience
## Designer — Acme
- Shipped design system
- Led usability tests

# Skills
Figma, React, TypeScript
`;
    const parsed = parseCareerHistoryMarkdown(md);
    expect(parsed.experiences.length).toBeGreaterThan(0);
    expect(parsed.experiences[0].bullets[0]).toContain("design system");
    expect(parsed.skills.some((s) => /figma/i.test(s))).toBe(true);
  });
});

describe("parseResumeText", () => {
  it("extracts experience, skills, and contact from a plain resume", async () => {
    const { parseResumeText } = await import("@/lib/onboarding/parse-resume-text");
    const text = `Rosh N
Dublin, Ireland | rosh@example.com
Product Designer

EXPERIENCE
Senior Product Designer | Acme Corp | 2021 - Present
- Led design system adoption
- Ran discovery sprints with PMs

Designer — Beta Inc — 2019-2021
- Shipped mobile onboarding

SKILLS
Figma, React, TypeScript, User research

PROJECTS
CareerOS
- Built job-fit scoring UI
`;
    const parsed = parseResumeText(text);
    expect(parsed.contactEmail).toMatch(/rosh@example.com/i);
    expect(parsed.experiences.length).toBeGreaterThanOrEqual(1);
    expect(parsed.skills.some((s) => /figma/i.test(s))).toBe(true);
    expect(parsed.projects.some((p) => /careeros/i.test(p.name))).toBe(true);
  });
});

describe("adzunaCountriesForMarkets", () => {
  it("maps Ireland markets to ie (not only gb)", async () => {
    const { adzunaCountriesForMarkets } = await import("@/lib/jobs/aggregators");
    expect(adzunaCountriesForMarkets(["dublin", "ireland"])).toContain("ie");
    expect(adzunaCountriesForMarkets(["london", "united kingdom"])).toContain("gb");
  });
});

describe("discover-prefs", () => {
  it("builds title hints from user roles", () => {
    const re = buildTitleHintRegex("Backend Engineer, Data Analyst");
    expect(re.test("Senior Backend Engineer")).toBe(true);
    expect(re.test("Pastry Chef")).toBe(false);
  });

  it("builds exclude title regex from avoided roles", () => {
    const re = buildExcludeTitleRegex("Mechanical Design Engineer, unpaid internship");
    expect(re).not.toBeNull();
    expect(re!.test("Mechanical Design Engineer")).toBe(true);
    expect(re!.test("Product Designer")).toBe(false);
  });

  it("matches primary markets from tokens", () => {
    expect(isPrimaryMarketHit("Toronto", "Remote Canada", ["canada", "toronto"])).toBe(true);
    expect(isPrimaryMarketHit("London", "UK only", ["canada"])).toBe(false);
  });
});
