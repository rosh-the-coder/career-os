import { describe, expect, it } from "vitest";
import {
  legacyStatusToTags,
  monthsBetween,
  parseSalaryNumber,
  primaryTagToStatus,
} from "@/lib/applications/constants";

describe("application tracker helpers", () => {
  it("parses salary amounts", () => {
    expect(parseSalaryNumber("€60,000")).toBe(60000);
    expect(parseSalaryNumber("55k")).toBe(55000);
    expect(parseSalaryNumber(null)).toBeNull();
  });

  it("maps legacy status to tags and back", () => {
    expect(legacyStatusToTags("interview")).toEqual(["Applied", "Interviewed"]);
    expect(primaryTagToStatus(["Applied", "Offer"])).toBe("offer");
  });

  it("computes month ranges", () => {
    const a = new Date("2026-01-01");
    const b = new Date("2026-08-15");
    expect(monthsBetween(a, b)).toBeGreaterThan(6);
  });
});
