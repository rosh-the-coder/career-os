import { describe, expect, it } from "vitest";
import {
  resumeExportValidationOpts,
  validateExportedResumeText,
} from "@/lib/resume/v3/export-validation";
import { getRolePolicy } from "@/lib/resume/v3/role-policy";

const HEADER = `ROSHAN NAJAR, UX Engineer
County Dublin, Ireland
LINKS LinkedIn, Portfolio, GitHub
`;

describe("validateExportedResumeText section order", () => {
  it("allows projects-before-experience for design profiles", () => {
    const text = `${HEADER}
PROFILE
Design engineer profile.
SKILLS
React · TypeScript
SELECTED PROJECTS
RedVelvetVault
PROFESSIONAL EXPERIENCE
Independent
EDUCATION
MSc TU Dublin
`;
    const check = validateExportedResumeText(text, {
      requireAiEngineerTitle: false,
      requireTechnicalStack: false,
      requireAethelgard: false,
      requireCareerOs: false,
      requireRedVelvetVault: false,
      expectExperienceBeforeProjects: false,
    });
    expect(check.ok).toBe(true);
  });

  it("still requires experience-before-projects for AI profiles", () => {
    const text = `${HEADER.replace("UX Engineer", "AI Engineer")}
PROFILE
AI engineer profile with Aethelgard and CareerOS.
SKILLS
Python
SELECTED PROJECTS
Aethelgard
PROFESSIONAL EXPERIENCE
Independent
EDUCATION
MSc
TECHNICAL STACK
AI: Python
`;
    const check = validateExportedResumeText(text, {
      requireAiEngineerTitle: true,
      requireTechnicalStack: true,
      requireAethelgard: true,
      requireCareerOs: true,
      expectExperienceBeforeProjects: true,
    });
    expect(check.ok).toBe(false);
    expect(check.errors.some((e) => /before SELECTED PROJECTS|Section order broken/i.test(e))).toBe(
      true,
    );
  });

  it("treats product_designer / ux_ui_designer / ai_creative as experience-first", () => {
    for (const key of ["product_designer", "ux_ui_designer", "ai_creative"]) {
      expect(getRolePolicy(key).projectsFirst).toBe(false);
      const opts = resumeExportValidationOpts({ profileKey: key, pageLength: 1 });
      expect(opts.expectExperienceBeforeProjects).toBe(true);
      expect(opts.requireAiEngineerTitle).toBe(false);
    }
  });

  it("treats ux_engineer / design_engineer as projects-first", () => {
    for (const key of ["ux_engineer", "design_engineer", "frontend_engineer", "product_engineer"]) {
      expect(getRolePolicy(key).projectsFirst).toBe(true);
      expect(
        resumeExportValidationOpts({ profileKey: key, pageLength: 1 }).expectExperienceBeforeProjects,
      ).toBe(false);
    }
  });

  it("allows experience-before-projects for non-AI designer profiles", () => {
    const text = `${HEADER}
PROFILE
Product designer with shipped systems.
SKILLS
Figma · Research
PROFESSIONAL EXPERIENCE
Independent
SELECTED PROJECTS
RedVelvetVault
EDUCATION
MSc TU Dublin
`;
    const check = validateExportedResumeText(
      text,
      resumeExportValidationOpts({ profileKey: "product_designer", pageLength: 1 }),
    );
    expect(check.errors).toEqual([]);
    expect(check.ok).toBe(true);
  });

  it("follows composed sectionOrder over the profile default", () => {
    const opts = resumeExportValidationOpts({
      profileKey: "ux_engineer",
      pageLength: 1,
      sectionOrder: ["summary", "skills", "experience", "selectedProjects", "education"],
    });
    expect(opts.expectExperienceBeforeProjects).toBe(true);
  });
});
