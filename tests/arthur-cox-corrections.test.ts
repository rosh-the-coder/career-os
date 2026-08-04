/**
 * Arthur Cox correction-pass tests.
 */
import { describe, expect, it } from "vitest";
import { composeResumeV3 } from "@/lib/resume/v3/compose-resume";
import { v3ToAtsContent, v3ToMarkdown } from "@/lib/resume/v3/adapter";
import { validateExportedResumeText } from "@/lib/resume/v3/export-validation";
import { formatResumeDateRange, containsRawIsoDate, LOCKED_RESUME_DATES } from "@/lib/resume/v3/date-format";
import { selectProjectsForPage, rankProjects, formatProjectDates } from "@/lib/resume/v3/rank-projects";
import { getRolePolicy } from "@/lib/resume/v3/role-policy";
import type { CareerInventory } from "@/lib/resume/v3/load-career-profile";

function inventory(): CareerInventory {
  const mkEv = (id: string, title: string, description: string, projectId: string | null = null) => ({
    id,
    type: "project",
    title,
    description,
    source: "seed",
    verified: true,
    confidence: "high",
    allowedProfiles: ["*"],
    keywords: ["Python", "TypeScript", "React"],
    prohibitedClaims: [] as string[],
    notes: null,
    isEstimate: false,
    needsReview: false,
    experienceId: null as string | null,
    projectId,
    metrics: [] as [],
  });

  const evA = mkEv("ev-a", "Aethelgard", "Python Playwright dashboard API", "p-a");
  const evC = mkEv("ev-c", "CareerOS", "Next.js TypeScript Prisma Supabase", "p-c");
  const evR = mkEv("ev-r", "RVV", "React TypeScript Firebase Unity WebGL", "p-r");
  const evI = {
    ...mkEv("ev-i", "Irish AI", "automation internal tools API lead generation"),
    type: "experience",
    experienceId: "e-irish",
    projectId: null,
  };

  const project = (
    id: string,
    key: string,
    name: string,
    start: string,
    end: string,
    current: boolean,
    bullets: string[],
    stack: string[],
  ) => ({
    id,
    key,
    name,
    type: "Independent product",
    status: current ? "Operational / actively developed" : "shipped",
    primaryRole: "Builder",
    stack,
    features: [],
    outcomes: [],
    useAsEvidenceFor: ["AI Engineer"],
    constraints: [],
    verified: true,
    sortOrder: 1,
    startDate: start,
    endDate: end,
    isCurrent: current,
    shortSummary: `${name} summary`,
    problemStatement: null,
    solutionSummary: null,
    technicalSummary: null,
    resumeBullets: bullets.map((text) => ({ text, profiles: ["*"], evidenceIds: [`ev-${key[0]}`] })),
    roleVariants: { ai_engineer: "AI Product Builder" },
    keywords: stack,
    projectUrl: null,
    githubUrl: null,
    caseStudyUrl: null,
    demoUrl: null,
    featured: true,
    cvPriority: 10,
    approvedForCV: true,
    evidence: key === "aethelgard" ? [evA] : key === "careeros" ? [evC] : [evR],
  });

  return {
    userId: "u1",
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
      project("p-a", "aethelgard", "Aethelgard Art Co. Production Suite", "July 2026", "Present", true, [
        "Built an AI-assisted digital-product production system.",
        "Designed a Factory Dashboard with review queues.",
        "Implemented CSV/XLSX batch production.",
      ], ["Python", "Playwright"]),
      project("p-c", "careeros", "CareerOS", "July 2026", "Present", true, [
        "Built a Next.js and TypeScript platform that scores jobs.",
        "Developed evidence-aware CV generation with DOCX/PDF export.",
        "Integrated Prisma, Supabase and Vercel deployment.",
      ], ["Next.js", "TypeScript", "Prisma"]),
      project("p-r", "redvelvetvault", "RedVelvetVault", "Mar 2025", "Dec 2025", false, [
        "Built a React and TypeScript application with Firebase authentication.",
        "Integrated Unity WebGL and React through structured JSON-based data exchange.",
        "Designed and tested an end-to-end product across discovery and galleries.",
      ], ["React", "TypeScript", "Firebase", "Unity"]),
    ],
    experiences: [
      {
        id: "e-irish",
        company: "Irish AI Creative / South Dublin Auction House",
        umbrellaTitle: "AI Creative Technologist & Automation Builder",
        officialTitle: "AI Creative Technologist & Automation Builder",
        location: "Dublin, Ireland",
        startDate: "2026-03",
        endDate: "2026-07-17",
        isCurrent: false,
        alternativeTitles: { applied_ai: "AI Workflow Automation & Internal Tools" },
        themes: ["automation", "api"],
        bullets: ["old"],
        resumeBullets: [],
        companyContext: "studio (ended 17 Jul 2026 via layoff).",
        verified: true,
        approvedForCV: true,
        sortOrder: 1,
        chronologyIndex: 1,
        relevanceScore: 1,
        preferredOrderByRole: { ai_engineer: 1, applied_ai: 1 },
        evidence: [evI],
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
        themes: ["workflow", "analytics", "systems"],
        bullets: [
          "Built repeatable production workflows and performance-driven publishing systems across long-form and short-form content.",
          "Used structured experimentation, analytics and SEO-informed iteration to grow YouTube subscribers from 2.9K to 8.2K and total views from 34.9K to 165.5K.",
        ],
        resumeBullets: [],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 2,
        chronologyIndex: 2,
        relevanceScore: 0.75,
        preferredOrderByRole: { ai_engineer: 2, applied_ai: 2 },
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
        themes: ["frontend", "react"],
        bullets: [
          "Designed and implemented React-based responsive interfaces for client products",
          "Defined stakeholder requirements and iterated rapidly with design-system thinking",
          "Applied accessibility and UX consulting across product engagements",
        ],
        resumeBullets: [
          {
            text: "Designed and implemented React-based responsive interfaces for client products",
            profiles: ["*"],
          },
        ],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 3,
        chronologyIndex: 3,
        relevanceScore: 0.7,
        preferredOrderByRole: { ai_engineer: 3, applied_ai: 3 },
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
        themes: ["documentation"],
        bullets: [
          "Produced technical drawings and 3D visualizations in a multidisciplinary studio",
          "Translated technical constraints into clear presentation and documentation outputs",
        ],
        resumeBullets: [],
        companyContext: null,
        verified: true,
        approvedForCV: true,
        sortOrder: 4,
        chronologyIndex: 4,
        relevanceScore: 0.35,
        preferredOrderByRole: { ai_engineer: 4, applied_ai: 4 },
        evidence: [],
      },
    ],
    skills: [
      "Python",
      "TypeScript",
      "SQL",
      "React",
      "Next.js",
      "REST APIs",
      "LLM API Integration",
      "Prompt Engineering",
      "Structured Outputs",
      "Human-in-the-loop Systems",
      "Evaluation and Testing",
      "Workflow Automation",
      "Data Processing",
      "Git",
      "Internal Tooling",
      "Figma",
      "Prisma",
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
    evidence: [evA, evC, evR, evI],
  };
}

describe("Arthur Cox correction pass", () => {
  it("ai_engineer policy places experience before projects", () => {
    const order = getRolePolicy("ai_engineer").sectionOrder;
    expect(order.indexOf("experience")).toBeLessThan(order.indexOf("selectedProjects"));
  });

  it("formats dates without ISO fragments", () => {
    expect(formatResumeDateRange("2026-03", "2026-07-17")).toBe("Mar 2026 – Jul 2026");
    expect(formatResumeDateRange("July 2026", "Present", true)).toBe("Jul 2026 – Present");
    expect(LOCKED_RESUME_DATES.aethelgard).toBe("Jul 2026 – Present");
    expect(containsRawIsoDate("Mar 2026 – Jul 2026")).toBe(false);
    expect(containsRawIsoDate("2026-03 – 2026-07-17")).toBe(true);
  });

  it("one-page selects Aethelgard + CareerOS only", () => {
    const inv = inventory();
    const ranked = rankProjects({
      inventory: inv,
      profileKey: "ai_engineer",
      jobTitle: "AI Engineer",
      jobCorpus: "python llm",
      pageLength: 1,
    });
    const selected = selectProjectsForPage(ranked, 1, "ai_engineer");
    expect(selected.map((s) => s.projectKey)).toEqual(["aethelgard", "careeros"]);
  });

  it("two-page selects Aethelgard, CareerOS, RedVelvetVault", () => {
    const inv = inventory();
    const ranked = rankProjects({
      inventory: inv,
      profileKey: "ai_engineer",
      jobTitle: "AI Engineer",
      jobCorpus: "python llm react",
      pageLength: 2,
    });
    const selected = selectProjectsForPage(ranked, 2, "ai_engineer");
    expect(selected.map((s) => s.projectKey)).toEqual(["aethelgard", "careeros", "redvelvetvault"]);
  });

  it("composes Arthur Cox two-page with correct order, dates, stack, no banned wording", () => {
    const inv = inventory();
    const content = composeResumeV3({
      inventory: inv,
      jobId: "cms57uhgm0001l1048pagpfj8",
      jobTitle: "AI Engineer (x2) – Legal Innovation Team",
      company: "Arthur Cox LLP",
      description: "Python LLM API automation evaluation Git React TypeScript",
      profileKey: "ai_engineer",
      pageLength: 2,
    });

    expect(content.header.professionalTitle).toBe("AI Engineer");
    expect(content.sectionOrder.indexOf("experience")).toBeLessThan(
      content.sectionOrder.indexOf("selectedProjects"),
    );
    expect(content.selectedProjects.map((p) => p.projectKey)).toEqual([
      "aethelgard",
      "careeros",
      "redvelvetvault",
    ]);
    expect(content.selectedProjects.every((p) => p.dates.includes("–"))).toBe(true);
    expect(content.selectedProjects.find((p) => p.projectKey === "aethelgard")!.dates).toBe(
      "Jul 2026 – Present",
    );
    expect(content.experience[0]?.dates).toBe("Mar 2026 – Jul 2026");
    expect(content.technicalStack?.length).toBeGreaterThan(0);
    expect(content.experience.map((e) => e.company)).toEqual([
      "Irish AI Creative / South Dublin Auction House",
      "Two Blokes Trading",
      "Independent",
      "Arcop Associates",
    ]);
    expect(content.experience.find((e) => /two blokes/i.test(e.company))!.title).toBe(
      "Video Editor (Content & Growth)",
    );
    expect(content.experience.find((e) => /two blokes/i.test(e.company))!.dates).toBe(
      "Jan 2025 – Jan 2026",
    );
    expect(content.experience.find((e) => /arcop/i.test(e.company))!.dates).toBe(
      "Jan 2022 – Mar 2023",
    );
    expect(content.experience.find((e) => /arcop/i.test(e.company))!.location).toBe(
      "Bengaluru, India",
    );

    const md = v3ToMarkdown(content);
    const check = validateExportedResumeText(md, {
      requireTechnicalStack: true,
      requireRedVelvetVault: true,
      requireFullEmploymentHistory: true,
      expectExperienceBeforeProjects: true,
    });
    expect(check.errors).toEqual([]);
    expect(md).not.toMatch(/layoff/i);
    expect(md).not.toMatch(/unverified metrics/i);
    expect(md).not.toMatch(/\b2026-03\b/);
    expect(md).not.toMatch(/2019\s*[–—-]\s*2019/);
    expect(md).not.toMatch(/2024\s*[–—-]\s*2025/);
    expect(md.indexOf("PROFESSIONAL EXPERIENCE")).toBeLessThan(md.indexOf("SELECTED PROJECTS"));
    // Project name before date in presentation block
    const aIdx = md.indexOf("Aethelgard Art Co. Production Suite");
    const dateIdx = md.indexOf("Jul 2026 – Present", aIdx);
    expect(aIdx).toBeGreaterThan(-1);
    expect(dateIdx).toBeGreaterThan(aIdx);

    const ats = v3ToAtsContent(content);
    expect(ats.professionalTitle).toBe("AI Engineer");
    expect(ats.sectionOrder?.[0]).toBe("summary");
    expect(ats.technicalStack.length).toBeGreaterThan(0);
    expect(ats.projects[0]?.technologies).toBeTruthy();
  });

  it("omits empty technical stack section", () => {
    const inv = inventory();
    const content = composeResumeV3({
      inventory: inv,
      jobId: "job-design",
      jobTitle: "Product Designer",
      company: "Example",
      description: "Figma React design systems",
      profileKey: "product_designer",
      pageLength: 1,
    });
    content.technicalStack = undefined;
    const md = v3ToMarkdown(content);
    expect(md).not.toMatch(/TECHNICAL STACK/);
  });

  it("formats project dates via locked keys", () => {
    const inv = inventory();
    const a = inv.projects.find((p) => p.key === "aethelgard")!;
    expect(formatProjectDates(a)).toBe("Jul 2026 – Present");
  });

  it("DOCX/PDF share the same project set via ATS adapter", async () => {
    const inv = inventory();
    const content = composeResumeV3({
      inventory: inv,
      jobId: "cms57uhgm0001l1048pagpfj8",
      jobTitle: "AI Engineer (x2) – Legal Innovation Team",
      company: "Arthur Cox LLP",
      description: "Python LLM API automation evaluation Git React TypeScript",
      profileKey: "ai_engineer",
      pageLength: 2,
    });
    const ats = v3ToAtsContent(content);
    expect(ats.projects.map((p) => p.name)).toEqual(content.selectedProjects.map((p) => p.name));
    const { buildAtsPdfBuffer } = await import("@/lib/resume/export-docx");
    const pdf = await buildAtsPdfBuffer(ats);
    expect(pdf.pageCount).toBe(2);
  });

  it("does not treat Storage as prohibited RAG", () => {
    const inv = inventory();
    inv.evidence[0]!.prohibitedClaims = ["RAG"];
    const content = composeResumeV3({
      inventory: inv,
      jobId: "cms57uhgm0001l1048pagpfj8",
      jobTitle: "AI Engineer",
      company: "Arthur Cox LLP",
      description: "Python React Firebase",
      profileKey: "ai_engineer",
      pageLength: 2,
    });
    expect(content.validation.blockedClaims.some((c) => /Storage/i.test(c))).toBe(false);
  });
});
