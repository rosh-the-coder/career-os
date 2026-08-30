import { describe, expect, it } from "vitest";
import {
  resumeExportValidationOpts,
  validateExportedResumeText,
} from "@/lib/resume/v3/export-validation";
import {
  composeDocument,
  compositionToMarkdown,
} from "@/lib/resume-studio/composition/compose-document";
import { heuristicCritique } from "@/lib/resume-studio/critic/run-resume-critic";
import { exportCompositionPdf, runVisualHeuristics } from "@/lib/resume-studio/export";
import { getTheme, listReadyThemes } from "@/lib/resume-studio/themes";
import { composeResumeV3 } from "@/lib/resume/v3/compose-resume";
import type { CareerInventory } from "@/lib/resume/v3/load-career-profile";
import type { ResumeContentV3 } from "@/lib/resume/v3/types";

function minimalInventory(): CareerInventory {
  return {
    userId: "u1",
    isOperator: true,
    name: "Roshan Najar",
    settings: {
      location: "Dublin, Ireland",
      phone: "+353 838501604",
      contactEmail: "theonlyroshn@gmail.com",
      portfolioUrl: "https://theonlyrosh.com/",
      githubUrl: "https://github.com/rosh-the-coder",
      linkedinUrl: "https://linkedin.com/in/x",
    },
    profiles: [
      {
        id: "p1",
        key: "ai_engineer",
        name: "AI Engineer",
        positioning: "x",
        keywords: ["Python"],
        evidenceOrder: ["Aethelgard", "CareerOS", "RedVelvetVault"],
        isDefault: false,
      },
    ],
    projects: [
      {
        id: "p-a",
        key: "aethelgard",
        name: "Aethelgard Art Co. Production Suite",
        type: "Independent product",
        status: "Operational / actively developed",
        primaryRole: "AI Product Builder",
        stack: ["Python"],
        features: [],
        outcomes: [],
        useAsEvidenceFor: ["AI Engineer"],
        constraints: [],
        verified: true,
        sortOrder: 1,
        startDate: "July 2026",
        endDate: "Present",
        isCurrent: true,
        shortSummary: "AI production suite",
        problemStatement: null,
        solutionSummary: null,
        technicalSummary: null,
        resumeBullets: [
          { text: "Built an AI-assisted digital-product production system.", profiles: ["*"] },
          { text: "Designed a Factory Dashboard with review queues.", profiles: ["*"] },
          { text: "Implemented CSV/XLSX batch production.", profiles: ["*"] },
        ],
        roleVariants: { ai_engineer: "AI Product Builder" },
        keywords: ["Python"],
        projectUrl: null,
        githubUrl: null,
        caseStudyUrl: null,
        demoUrl: null,
        featured: true,
        cvPriority: 10,
        approvedForCV: true,
        evidence: [],
      },
      {
        id: "p-c",
        key: "careeros",
        name: "CareerOS",
        type: "Independent product",
        status: "Operational / actively developed",
        primaryRole: "AI Product Engineer",
        stack: ["Next.js", "TypeScript"],
        features: [],
        outcomes: [],
        useAsEvidenceFor: ["AI Engineer"],
        constraints: [],
        verified: true,
        sortOrder: 2,
        startDate: "July 2026",
        endDate: "Present",
        isCurrent: true,
        shortSummary: "Job OS",
        problemStatement: null,
        solutionSummary: null,
        technicalSummary: null,
        resumeBullets: [
          { text: "Built a Next.js and TypeScript platform that scores jobs.", profiles: ["*"] },
          { text: "Developed evidence-aware CV generation.", profiles: ["*"] },
          { text: "Integrated Prisma and Supabase.", profiles: ["*"] },
        ],
        roleVariants: { ai_engineer: "AI Product Engineer" },
        keywords: ["TypeScript"],
        projectUrl: null,
        githubUrl: null,
        caseStudyUrl: null,
        demoUrl: null,
        featured: true,
        cvPriority: 10,
        approvedForCV: true,
        evidence: [],
      },
      {
        id: "p-r",
        key: "redvelvetvault",
        name: "RedVelvetVault",
        type: "Independent product",
        status: "shipped",
        primaryRole: "Product Design Engineer",
        stack: ["React", "Firebase"],
        features: [],
        outcomes: [],
        useAsEvidenceFor: ["AI Engineer"],
        constraints: [],
        verified: true,
        sortOrder: 3,
        startDate: "Mar 2025",
        endDate: "Dec 2025",
        isCurrent: false,
        shortSummary: "Virtual gallery",
        problemStatement: null,
        solutionSummary: null,
        technicalSummary: null,
        resumeBullets: [
          { text: "Built a React and TypeScript application with Firebase.", profiles: ["*"] },
          { text: "Integrated Unity WebGL and React.", profiles: ["*"] },
          { text: "Designed an end-to-end product.", profiles: ["*"] },
        ],
        roleVariants: { ai_engineer: "Product Design Engineer" },
        keywords: ["React"],
        projectUrl: null,
        githubUrl: null,
        caseStudyUrl: null,
        demoUrl: null,
        featured: true,
        cvPriority: 7,
        approvedForCV: true,
        evidence: [],
      },
    ],
    experiences: [
      {
        id: "e-irish",
        company: "Irish AI Creative / South Dublin Auction House",
        umbrellaTitle: "AI Creative Technologist & Automation Builder",
        officialTitle: "AI Creative Technologist & Automation Builder",
        location: "Dublin, Ireland",
        startDate: "Mar 2026",
        endDate: "Jul 2026",
        isCurrent: false,
        alternativeTitles: {},
        themes: ["automation"],
        bullets: [],
        resumeBullets: [],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 1,
        chronologyIndex: 1,
        relevanceScore: 1,
        preferredOrderByRole: { ai_engineer: 1 },
        evidence: [],
      },
      {
        id: "e-tb",
        company: "Two Blokes Trading",
        umbrellaTitle: "Video Editor",
        officialTitle: "Video Editor",
        selectedOfficialTitle: "Video Editor",
        titleOptions: ["Video Editor"],
        approvedTitleDescriptor: "Content & Growth",
        titleDescriptorApproved: true,
        location: "Remote / Ireland",
        startDate: "Jan 2025",
        endDate: "Jan 2026",
        isCurrent: false,
        alternativeTitles: {},
        themes: ["systems"],
        bullets: [],
        resumeBullets: [],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 2,
        chronologyIndex: 2,
        relevanceScore: 0.75,
        preferredOrderByRole: { ai_engineer: 2 },
        evidence: [],
      },
      {
        id: "e-ind",
        company: "Independent",
        umbrellaTitle: "Product Designer & Frontend Implementer",
        officialTitle: null,
        location: "Dublin, Ireland",
        startDate: "2023",
        endDate: "2026",
        isCurrent: false,
        alternativeTitles: {},
        themes: ["frontend"],
        bullets: ["Designed React interfaces"],
        resumeBullets: [{ text: "Designed React interfaces", profiles: ["*"] }],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 3,
        chronologyIndex: 3,
        relevanceScore: 0.7,
        preferredOrderByRole: { ai_engineer: 3 },
        evidence: [],
      },
      {
        id: "e-arcop",
        company: "Arcop Associates",
        umbrellaTitle: "Architectural Intern",
        officialTitle: "Architectural Intern",
        location: "Bengaluru, India",
        startDate: "Jan 2022",
        endDate: "Mar 2023",
        isCurrent: false,
        alternativeTitles: {},
        themes: ["docs"],
        bullets: ["Produced technical drawings"],
        resumeBullets: [],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 4,
        chronologyIndex: 4,
        relevanceScore: 0.35,
        preferredOrderByRole: { ai_engineer: 4 },
        evidence: [],
      },
    ],
    skills: [
      "Python",
      "TypeScript",
      "LLM API Integration",
      "Prompt Engineering",
      "React",
      "Git",
      "Workflow Automation",
    ].map((name, i) => ({
      id: `s${i}`,
      name,
      category: "core",
      keywords: [],
      verified: true,
      approvedForCV: true,
      profiles: ["*"],
      evidenceIds: [],
    })),
    evidence: [],
  };
}

describe("Resume Studio V4", () => {
  it("exposes arthur-cox and minimal-ats ready themes", () => {
    expect(listReadyThemes().map((t) => t.id).sort()).toEqual(["arthur-cox", "minimal-ats"]);
    expect(getTheme("stripe").id).toBe("arthur-cox"); // stub falls back to ready theme
  });

  it("composes editorial document with date-column theme and ATS reading order", () => {
    const content = composeResumeV3({
      inventory: minimalInventory(),
      jobId: "cms57uhgm0001l1048pagpfj8",
      jobTitle: "AI Engineer",
      company: "Arthur Cox LLP",
      description: "Python LLM automation React",
      profileKey: "ai_engineer",
      pageLength: 2,
    });
    const doc = composeDocument(content, "arthur-cox");
    expect(doc.themeId).toBe("arthur-cox");
    expect(doc.blocks.some((b) => b.kind === "experience")).toBe(true);
    expect(doc.blocks.some((b) => b.kind === "divider")).toBe(true);
    const md = compositionToMarkdown(doc);
    expect(md.indexOf("PROFESSIONAL EXPERIENCE")).toBeLessThan(md.indexOf("SELECTED PROJECTS"));
    expect(md).toMatch(/Two Blokes Trading/);
    expect(md).toMatch(/2\.9K/);
    expect(md).not.toMatch(/2019\s*[–—-]\s*2019/);
  });

  it("strips team suffix from JD title on Restream-style design engineer roles", () => {
    const content = composeResumeV3({
      inventory: minimalInventory(),
      jobId: "restream-test",
      jobTitle: "Design Engineer - AI Clips Team",
      company: "Restream",
      description: "React TypeScript Figma design systems",
      profileKey: "design_engineer",
      pageLength: 1,
    });
    expect(content.header.professionalTitle).toBe("Design Engineer");
    expect(content.summary.text).toMatch(/^Design Engineer with hands-on experience/);
    expect(content.summary.text).not.toMatch(/AI Clips Team/i);
    const md = compositionToMarkdown(composeDocument(content, "arthur-cox"));
    expect(md).toContain("Design Engineer\n");
    expect(md).not.toMatch(/AI Clips Team/i);
  });

  it("passes V4 export validation for applied_ai + AI Software Developer (WorldQuant-style)", () => {
    const inv = minimalInventory();
    inv.profiles[0] = { ...inv.profiles[0]!, key: "applied_ai", name: "Applied AI / Automation" };
    const content = composeResumeV3({
      inventory: inv,
      jobId: "worldquant-test",
      jobTitle: "AI Software Developer",
      company: "WorldQuant",
      description: "Python C++ AI software developer quantitative research",
      profileKey: "applied_ai",
      pageLength: 1,
    });
    expect(content.header.professionalTitle).toBe("AI Software Developer");
    const doc = composeDocument(content, "arthur-cox");
    const md = compositionToMarkdown(doc);
    const check = validateExportedResumeText(md, {
      ...resumeExportValidationOpts({
        profileKey: content.target.profileKey,
        pageLength: 1,
        sectionOrder: content.sectionOrder,
      }),
      candidateName: content.header.name,
      expectedProfessionalTitle: content.header.professionalTitle,
    });
    expect(check.errors).toEqual([]);
    expect(check.ok).toBe(true);
    expect(md).not.toMatch(/Missing AI Engineer/i);
  });

  it("PDF export returns a buffer and critic heuristic scores", async () => {
    const content = composeResumeV3({
      inventory: minimalInventory(),
      jobId: "job",
      jobTitle: "AI Engineer",
      company: "Arthur Cox LLP",
      description: "Python",
      profileKey: "ai_engineer",
      pageLength: 2,
    });
    const doc = composeDocument(content as ResumeContentV3, "arthur-cox");
    const pdf = await exportCompositionPdf(doc);
    expect(pdf.buffer.length).toBeGreaterThan(1000);
    expect(pdf.pageCount).toBeGreaterThanOrEqual(1);
    const critique = heuristicCritique(doc);
    expect(critique.scores.visualHierarchy).toBeGreaterThanOrEqual(1);
    expect(["ready", "revise", "blocked"]).toContain(critique.overall);
    const flags = runVisualHeuristics(doc, pdf.pageCount);
    expect(Array.isArray(flags)).toBe(true);
  });
});
