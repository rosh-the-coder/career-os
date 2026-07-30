import { describe, expect, it } from "vitest";
import { inferYearsRequired, runHardFilters } from "../src/lib/scoring/hard-filters";

const baseSettings = {
  includeFallbackVideoRoles: false,
  salaryFloorEur: 40000,
  salaryFloorSoft: true,
  canWorkFullTimeNow: true,
};

describe("hard filters", () => {
  it("rejects US-only / US work auth roles", () => {
    const result = runHardFilters(
      {
        title: "Frontend Engineer",
        company: "Acme",
        descriptionRaw: "Must be authorized to work in the United States. Remote US only.",
        descriptionClean: "Must be authorized to work in the United States. Remote US only.",
      },
      baseSettings,
    );
    expect(result.rejected).toBe(true);
    expect(result.reason).toMatch(/US/i);
  });

  it("rejects physical/mechanical design engineer roles", () => {
    const result = runHardFilters(
      {
        title: "Mechanical Design Engineer",
        company: "Factory",
        descriptionRaw: "SolidWorks and AutoCAD required for product hardware.",
        descriptionClean: "SolidWorks and AutoCAD required for product hardware.",
      },
      baseSettings,
    );
    expect(result.rejected).toBe(true);
    expect(result.reason).toMatch(/Physical|mechanical|CAD/i);
  });

  it("rejects director/staff seniority", () => {
    const result = runHardFilters(
      {
        title: "Staff Product Designer",
        company: "BigCo",
        descriptionRaw: "Lead the design org in Dublin.",
        descriptionClean: "Lead the design org in Dublin.",
      },
      baseSettings,
    );
    expect(result.rejected).toBe(true);
  });

  it("keeps no-sponsorship jobs with soft flag", () => {
    const result = runHardFilters(
      {
        title: "UX Engineer",
        company: "DublinTech",
        location: "Dublin, Ireland",
        descriptionRaw:
          "We cannot sponsor visas. Hybrid in Dublin. React and TypeScript required.",
        descriptionClean:
          "We cannot sponsor visas. Hybrid in Dublin. React and TypeScript required.",
      },
      baseSettings,
    );
    expect(result.rejected).toBe(false);
    expect(result.softFlags.some((f) => f.code === "no_sponsorship_language")).toBe(true);
    expect(result.eligibilityCurrent).toBe("likely_eligible_now");
  });

  it("rejects video editor when fallback toggle off", () => {
    const result = runHardFilters(
      {
        title: "Video Editor",
        company: "Studio",
        descriptionRaw: "Edit social videos in Dublin.",
        descriptionClean: "Edit social videos in Dublin.",
      },
      baseSettings,
    );
    expect(result.rejected).toBe(true);
  });

  it("rejects 8+ years experience requirements", () => {
    const result = runHardFilters(
      {
        title: "Product Designer",
        company: "BigCo",
        location: "Dublin, Ireland",
        descriptionRaw: "We need 8+ years of product design experience in Dublin.",
        descriptionClean: "We need 8+ years of product design experience in Dublin.",
        yearsRequired: 8,
      },
      baseSettings,
    );
    expect(result.rejected).toBe(true);
    expect(result.reason).toMatch(/8\+/);
  });

  it("rejects Senior titles asking 6+ years", () => {
    const result = runHardFilters(
      {
        title: "Senior Product Designer",
        company: "BigCo",
        location: "Dublin, Ireland",
        descriptionRaw: "6+ years of design experience required.",
        descriptionClean: "6+ years of design experience required.",
        yearsRequired: 6,
      },
      baseSettings,
    );
    expect(result.rejected).toBe(true);
    expect(result.reason).toMatch(/Senior/i);
  });

  it("ignores negated YOE marketing like Salesforce Emerging Talent", () => {
    const jd = `
      AI Builder, Emerging Talent - UK & Ireland Market
      As part of our first-of-its-kind AI Builder New Grad cohort, you'll be embedded with customer-facing teams.
      You're ready to grow faster here than anywhere else - nobody has 10 years of experience in this new frontier, which means your ideas carry real weight from day one.
      Fluency required in English. Fluent in React, TypeScript, GraphQL, Python.
    `;
    expect(inferYearsRequired(jd)).toBeUndefined();

    const result = runHardFilters(
      {
        title: "AI Builder, Emerging Talent - UK & Ireland Market",
        company: "Salesforce",
        location: "UK & Ireland",
        remoteType: "remote",
        descriptionRaw: jd,
        descriptionClean: jd,
      },
      baseSettings,
    );
    expect(result.rejected).toBe(false);
  });

  it("does not treat company age as candidate YOE", () => {
    const years = inferYearsRequired(
      "Version 1 has celebrated 30 years in business. 10+ years as a Great Place to Work. We need 4-6 years of experience building AI solutions.",
    );
    expect(years).toBe(4);

    const result = runHardFilters(
      {
        title: "AI Engineer",
        company: "Version 1",
        location: "Dublin, Ireland",
        descriptionRaw:
          "Version 1 has celebrated 30 years in business and 10+ years as a Great Place to Work. Role requires 4-6 years of experience with React and AI.",
        descriptionClean:
          "Version 1 has celebrated 30 years in business and 10+ years as a Great Place to Work. Role requires 4-6 years of experience with React and AI.",
        yearsRequired: 30, // stale bad parse
      },
      baseSettings,
    );
    expect(result.rejected).toBe(false);
  });

  it("does not hard-reject applied AI engineer JDs for model training wording", () => {
    const result = runHardFilters(
      {
        title: "AI Engineer 2",
        company: "Mastercard",
        location: "Dublin, Ireland",
        descriptionRaw:
          "Develop and support AI and machine learning models. Build model training pipelines. Collaborate with senior engineers in Dublin.",
        descriptionClean:
          "Develop and support AI and machine learning models. Build model training pipelines. Collaborate with senior engineers in Dublin.",
        yearsRequired: 5,
      },
      baseSettings,
    );
    expect(result.rejected).toBe(false);
  });
});
