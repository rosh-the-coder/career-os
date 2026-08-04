import { describe, expect, it } from "vitest";
import {
  buildLinksLine,
  parseLinkUrlsFromLine,
  resolveLinkUrls,
  type AtsResumeContent,
} from "@/lib/resume/export-docx";

describe("resume link helpers", () => {
  it("builds display links line without LINKS prefix", () => {
    expect(
      buildLinksLine({
        linkedinUrl: "https://linkedin.com/in/x",
        portfolioUrl: "https://theonlyrosh.com/",
        githubUrl: "https://github.com/rosh-the-coder",
      }),
    ).toBe("LinkedIn | Portfolio | GitHub");
  });

  it("parses URLs from a legacy linksLine", () => {
    const urls = parseLinkUrlsFromLine(
      "LINKS LinkedIn (https://www.linkedin.com/in/roshan-najar-0556711b4/), Portfolio Website (https://theonlyrosh.com/), Github (https://github.com/rosh-the-coder)",
    );
    expect(urls.linkedinUrl).toContain("linkedin.com");
    expect(urls.portfolioUrl).toBe("https://theonlyrosh.com/");
    expect(urls.githubUrl).toBe("https://github.com/rosh-the-coder");
  });

  it("prefers structured linkUrls over parsing", () => {
    const content = {
      linksLine: "LINKS LinkedIn (https://old.example), Portfolio Website (https://old.example), Github (https://old.example)",
      linkUrls: {
        linkedinUrl: "https://linkedin.com/in/new",
        portfolioUrl: "https://theonlyrosh.com/",
        githubUrl: "https://github.com/rosh-the-coder",
      },
    } as AtsResumeContent;
    expect(resolveLinkUrls(content).portfolioUrl).toBe("https://theonlyrosh.com/");
  });
});
