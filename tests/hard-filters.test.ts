import { describe, expect, it } from "vitest";
import { runHardFilters } from "../src/lib/scoring/hard-filters";

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

  it("allows video editor when fallback toggle on", () => {
    const result = runHardFilters(
      {
        title: "Video Editor",
        company: "Studio",
        descriptionRaw: "Edit social videos in Dublin.",
        descriptionClean: "Edit social videos in Dublin.",
      },
      { ...baseSettings, includeFallbackVideoRoles: true },
    );
    expect(result.rejected).toBe(false);
  });
});
