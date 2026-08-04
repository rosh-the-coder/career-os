/**
 * Resume Engine V3 unit tests — ranking, titles, Arthur Cox fixture expectations.
 */
import { describe, expect, it } from "vitest";
import { composeResumeV3 } from "@/lib/resume/v3/compose-resume";
import { resolveExperienceTitle } from "@/lib/resume/v3/rank-experience";
import { rankProjects, selectProjectsForPage, formatProjectDates } from "@/lib/resume/v3/rank-projects";
import { resolveCvTitle } from "@/lib/resume/v3/role-policy";
import { validateResumeContentV3 } from "@/lib/resume/v3/validate-content";
import { v3ToAtsContent } from "@/lib/resume/v3/adapter";
import type { CareerInventory } from "@/lib/resume/v3/load-career-profile";

function fixtureInventory(): CareerInventory {
  const evA = {
    id: "ev-aethelgard",
    type: "project",
    title: "Aethelgard evidence",
    description: "Python Playwright human-in-the-loop Factory Dashboard Etsy draft API",
    source: "seed",
    verified: true,
    confidence: "high",
    allowedProfiles: ["*"],
    keywords: ["Python", "Playwright"],
    prohibitedClaims: ["Successful Etsy business", "RAG"],
    notes: null,
    isEstimate: false,
    needsReview: false,
    experienceId: null,
    projectId: "p-a",
    metrics: [],
  };
  const evC = {
    id: "ev-careeros",
    type: "project",
    title: "CareerOS evidence",
    description: "Next.js TypeScript Prisma Supabase ATS DOCX PDF scoring Vercel",
    source: "seed",
    verified: true,
    confidence: "high",
    allowedProfiles: ["*"],
    keywords: ["Next.js", "TypeScript"],
    prohibitedClaims: ["Autonomous job applications"],
    notes: null,
    isEstimate: false,
    needsReview: false,
    experienceId: null,
    projectId: "p-c",
    metrics: [],
  };
  const evR = {
    id: "ev-rvv",
    type: "project",
    title: "RVV evidence",
    description: "React TypeScript Firebase Unity usability 50+ 81%",
    source: "seed",
    verified: true,
    confidence: "high",
    allowedProfiles: ["*"],
    keywords: ["React"],
    prohibitedClaims: [],
    notes: null,
    isEstimate: false,
    needsReview: false,
    experienceId: null,
    projectId: "p-r",
    metrics: [
      {
        id: "m1",
        label: "Usability testers",
        value: 50,
        valueText: "50+",
        unit: "users",
        approvedForCV: true,
        isEstimate: false,
        needsReview: false,
      },
    ],
  };
  const evIrish = {
    id: "ev-irish",
    type: "experience",
    title: "Irish AI Creative — AI creative + automation expansion",
    description: "Expanded into AI-assisted workflow automation and internal tooling APIs lead generation",
    source: "seed",
    verified: true,
    confidence: "high",
    allowedProfiles: ["*"],
    keywords: ["automation", "API"],
    prohibitedClaims: [],
    notes: null,
    isEstimate: false,
    needsReview: false,
    experienceId: "e-irish",
    projectId: null,
    metrics: [],
  };

  return {
    userId: "u1",
    name: "Roshan Najar",
    settings: {
      location: "Dublin, Ireland",
      phone: "+353 838501604",
      contactEmail: "theonlyroshn@gmail.com",
      portfolioUrl: "https://theonlyrosh.com/",
      githubUrl: "https://github.com/rosh-the-coder",
      linkedinUrl: "https://www.linkedin.com/in/roshan-najar-0556711b4/",
    },
    profiles: [
      {
        id: "prof-ai",
        key: "ai_engineer",
        name: "AI Engineer",
        positioning: "Applied AI",
        keywords: ["Python", "LLM", "API"],
        evidenceOrder: ["Aethelgard", "CareerOS", "Dublin Gold Testing"],
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
        stack: ["Python", "Playwright", "Gemini"],
        features: ["Factory Dashboard"],
        outcomes: [],
        useAsEvidenceFor: ["AI Engineer", "Applied AI"],
        constraints: ["Never describe as a successful Etsy business", "No RAG"],
        verified: true,
        sortOrder: 1,
        startDate: "July 2026",
        endDate: "Present",
        isCurrent: true,
        shortSummary: "AI-assisted digital production suite",
        problemStatement: null,
        solutionSummary: null,
        technicalSummary: null,
        resumeBullets: [
          {
            text: "Built an AI-assisted digital-product production system with human-in-the-loop review queues.",
            profiles: ["*"],
            evidenceIds: ["ev-aethelgard"],
          },
          {
            text: "Integrated multiple AI providers and the Etsy Open API in Python under human approval.",
            profiles: ["ai_engineer", "*"],
            evidenceIds: ["ev-aethelgard"],
          },
        ],
        roleVariants: { ai_engineer: "AI Product Builder" },
        keywords: ["Python", "Playwright", "automation"],
        projectUrl: null,
        githubUrl: null,
        caseStudyUrl: null,
        demoUrl: null,
        featured: true,
        cvPriority: 10,
        approvedForCV: true,
        evidence: [evA],
      },
      {
        id: "p-c",
        key: "careeros",
        name: "CareerOS",
        type: "Independent product",
        status: "Operational / actively developed",
        primaryRole: "AI Product Engineer",
        stack: ["Next.js", "TypeScript", "Prisma", "Supabase"],
        features: ["scoring", "DOCX", "PDF"],
        outcomes: [],
        useAsEvidenceFor: ["AI Engineer", "Product Engineer"],
        constraints: ["No autonomous job applications"],
        verified: true,
        sortOrder: 2,
        startDate: "July 2026",
        endDate: "Present",
        isCurrent: true,
        shortSummary: "Job scoring and ATS CV generation platform",
        problemStatement: null,
        solutionSummary: null,
        technicalSummary: null,
        resumeBullets: [
          {
            text: "Built a Next.js and TypeScript platform that imports, parses and scores jobs against structured career profiles.",
            profiles: ["*"],
            evidenceIds: ["ev-careeros"],
          },
          {
            text: "Developed evidence-aware CV generation with DOCX/PDF export, versioning and ATS keyword analysis under human review.",
            profiles: ["*"],
            evidenceIds: ["ev-careeros"],
          },
        ],
        roleVariants: { ai_engineer: "AI Product Engineer" },
        keywords: ["TypeScript", "ATS", "scoring"],
        projectUrl: "https://career-os-topaz-nu.vercel.app",
        githubUrl: "https://github.com/rosh-the-coder/career-os",
        caseStudyUrl: null,
        demoUrl: null,
        featured: true,
        cvPriority: 10,
        approvedForCV: true,
        evidence: [evC],
      },
      {
        id: "p-r",
        key: "redvelvetvault",
        name: "RedVelvetVault",
        type: "0→1",
        status: "shipped",
        primaryRole: "Design Engineer",
        stack: ["React", "TypeScript", "Firebase"],
        features: [],
        outcomes: ["50+ users"],
        useAsEvidenceFor: ["Product Designer", "UX Engineer"],
        constraints: [],
        verified: true,
        sortOrder: 3,
        startDate: "Mar 2025",
        endDate: "Dec 2025",
        isCurrent: false,
        shortSummary: "Immersive gallery product",
        problemStatement: null,
        solutionSummary: null,
        technicalSummary: null,
        resumeBullets: [
          {
            text: "Led end-to-end UX from research to delivery with usability testing involving 50+ users.",
            profiles: ["*"],
            evidenceIds: ["ev-rvv"],
          },
        ],
        roleVariants: {},
        keywords: ["React", "UX"],
        projectUrl: null,
        githubUrl: null,
        caseStudyUrl: null,
        demoUrl: null,
        featured: true,
        cvPriority: 7,
        approvedForCV: true,
        evidence: [evR],
      },
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
        alternativeTitles: {
          applied_ai: "AI Workflow Automation & Internal Tools",
          functional: "AI Workflow Automation & Internal Tools",
        },
        themes: ["automation", "internal tools", "API", "workflow"],
        bullets: [
          "Expanded from creative production into AI-assisted workflow automation and internal tooling",
          "Designed and shipped automation infrastructure supporting B2B lead generation and outreach",
        ],
        resumeBullets: [
          {
            text: "Expanded from creative production into AI-assisted workflow automation and internal tooling.",
            profiles: ["*"],
            evidenceIds: ["ev-irish"],
          },
          {
            text: "Designed and shipped automation infrastructure supporting B2B lead generation and email outreach for Dublin Gold Testing.",
            profiles: ["ai_engineer", "*"],
            evidenceIds: ["ev-irish"],
          },
        ],
        companyContext: "Creative production studio; role expanded into automation (layoff 17 Jul 2026).",
        verified: true,
        approvedForCV: true,
        sortOrder: 1,
        chronologyIndex: 1,
        relevanceScore: 1,
        preferredOrderByRole: { ai_engineer: 1, applied_ai: 1 },
        evidence: [evIrish],
      },
    ],
    skills: [
      {
        id: "s1",
        name: "Python",
        category: "backend",
        keywords: [],
        verified: true,
        approvedForCV: true,
        profiles: ["*"],
        evidenceIds: ["ev-aethelgard"],
      },
      {
        id: "s2",
        name: "TypeScript",
        category: "frontend",
        keywords: ["ts"],
        verified: true,
        approvedForCV: true,
        profiles: ["*"],
        evidenceIds: ["ev-careeros"],
      },
      {
        id: "s3",
        name: "LLM API Integration",
        category: "ai",
        keywords: ["llm api"],
        verified: true,
        approvedForCV: true,
        profiles: ["*"],
        evidenceIds: ["ev-aethelgard"],
      },
      {
        id: "s4",
        name: "React",
        category: "frontend",
        keywords: [],
        verified: true,
        approvedForCV: true,
        profiles: ["*"],
        evidenceIds: ["ev-rvv"],
      },
      {
        id: "s5",
        name: "Workflow Automation",
        category: "automation",
        keywords: ["automation"],
        verified: true,
        approvedForCV: true,
        profiles: ["*"],
        evidenceIds: ["ev-irish"],
      },
    ],
    evidence: [evA, evC, evR, evIrish],
  };
}

describe("Resume Engine V3", () => {
  it("resolves AI Engineer title for AI Engineer JDs", () => {
    expect(resolveCvTitle("ai_engineer", "AI Engineer (x2) – Legal Innovation Team")).toBe("AI Engineer");
  });

  it("keeps Irish AI umbrella title without inventing a replacement", () => {
    const inv = fixtureInventory();
    const display = resolveExperienceTitle(inv.experiences[0]!, "ai_engineer");
    expect(display.title).toBe("AI Creative Technologist & Automation Builder");
    expect(display.functionalFocus).toBeUndefined();
    expect(display.title).not.toMatch(/AI Engineer/);
  });

  it("formats Aethelgard and CareerOS as Jul 2026 – Present", () => {
    const inv = fixtureInventory();
    const a = inv.projects.find((p) => p.key === "aethelgard")!;
    const c = inv.projects.find((p) => p.key === "careeros")!;
    expect(formatProjectDates(a)).toBe("Jul 2026 – Present");
    expect(formatProjectDates(c)).toBe("Jul 2026 – Present");
  });

  it("selects Aethelgard and CareerOS for ai_engineer one-page", () => {
    const inv = fixtureInventory();
    const ranked = rankProjects({
      inventory: inv,
      profileKey: "ai_engineer",
      jobTitle: "AI Engineer",
      jobCorpus: "python llm api automation workflow next.js typescript",
      pageLength: 1,
    });
    const selected = selectProjectsForPage(ranked, 1, "ai_engineer");
    const keys = selected.map((s) => s.projectKey);
    expect(keys).toContain("aethelgard");
    expect(keys).toContain("careeros");
    expect(keys.length).toBeLessThanOrEqual(2);
  });

  it("Arthur Cox fixture: compose without RAG/Azure fabrication and with Python", () => {
    const inv = fixtureInventory();
    const content = composeResumeV3({
      inventory: inv,
      jobId: "cms57uhgm0001l1048pagpfj8",
      jobTitle: "AI Engineer (x2) – Legal Innovation Team",
      company: "Arthur Cox LLP",
      description:
        "Python, large language models, RAG architectures, Azure, NLP, document processing, evaluation, APIs, Git",
      keywords: ["Python", "Azure", "AI", "RAG"],
      profileKey: "ai_engineer",
      pageLength: 1,
      recommendedProjectsFromScore: [
        "Dublin Gold Testing B2B Growth Engine",
        "Aethelgard Art Co. Production Suite",
      ],
    });

    expect(content.header.professionalTitle).toMatch(/AI Engineer/);
    const projectNames = content.selectedProjects.map((p) => p.name);
    expect(projectNames.some((n) => /Aethelgard/i.test(n))).toBe(true);
    expect(projectNames.some((n) => /CareerOS/i.test(n))).toBe(true);
    expect(projectNames.length).toBeGreaterThan(1);

    const blob = [
      content.summary.text,
      ...content.selectedProjects.flatMap((p) => p.bullets.map((b) => b.text)),
      ...content.skills.flatMap((g) => g.items.map((i) => i.name)),
    ].join("\n");

    expect(blob.toLowerCase()).toContain("python");
    expect(blob.toLowerCase()).not.toMatch(/\bproficient in rag\b/);
    expect(blob.toLowerCase()).not.toMatch(/azure openai/);
    expect(content.header.professionalTitle.toLowerCase()).not.toContain("ml engineer");
    expect(content.validation.blockedClaims.length).toBe(0);

    // Every bullet has evidence
    for (const p of content.selectedProjects) {
      for (const b of p.bullets) expect(b.evidenceIds.length).toBeGreaterThan(0);
    }

    const ats = v3ToAtsContent(content);
    expect(ats.documentTitle).toMatch(/ROSHAN NAJAR/i);
    expect(ats.professionalTitle).toMatch(/AI Engineer/);
    expect(ats.projects.length).toBeGreaterThanOrEqual(2);
  });

  it("blocks fabricated RAG claims in validation", () => {
    const inv = fixtureInventory();
    const content = composeResumeV3({
      inventory: inv,
      jobId: "j1",
      jobTitle: "AI Engineer",
      company: "Test",
      description: "python",
      profileKey: "ai_engineer",
      pageLength: 1,
    });
    content.summary.text = "Proficient in RAG and vector databases for legal NLP.";
    const v = validateResumeContentV3(content, inv);
    expect(v.blockedClaims.length).toBeGreaterThan(0);
  });
});
