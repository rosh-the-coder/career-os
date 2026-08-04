/**
 * Non-destructive Resume Engine V3 inventory upsert.
 * Preserves Job / ResumeVersion / Application rows.
 *
 * Usage: npx tsx prisma/seed-v3-inventory.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEW_PROFILES = [
  {
    key: "ai_engineer",
    name: "AI Engineer",
    isDefault: false,
    positioning:
      "Applied AI engineer building workflow automation, LLM API integrations, structured outputs, evaluation loops, and human-in-the-loop internal tools — without claiming deep ML research credentials.",
    keywords: [
      "Python",
      "LLM",
      "API integration",
      "Workflow automation",
      "Prompt engineering",
      "Structured outputs",
      "Evaluation",
      "Data processing",
      "Human-in-the-loop",
      "Internal tools",
    ],
    evidenceOrder: ["Aethelgard", "CareerOS", "Dublin Gold Testing", "Irish AI Creative", "RedVelvetVault"],
  },
  {
    key: "product_engineer",
    name: "Product Engineer",
    isDefault: false,
    positioning:
      "Product Engineer owning end-to-end product workflows across frontend, APIs, automation, and deployment with strong product judgement.",
    keywords: [
      "TypeScript",
      "React",
      "Next.js",
      "Product",
      "APIs",
      "Automation",
      "Deployment",
      "User workflows",
      "Full-stack",
    ],
    evidenceOrder: ["CareerOS", "Aethelgard", "RedVelvetVault", "Irish AI Creative"],
  },
  {
    key: "frontend_engineer",
    name: "Frontend Engineer",
    isDefault: false,
    positioning:
      "Frontend Engineer implementing production React/TypeScript interfaces with accessibility and component architecture.",
    keywords: ["React", "TypeScript", "Next.js", "Tailwind", "Accessibility", "Frontend", "UI"],
    evidenceOrder: ["RedVelvetVault", "CareerOS", "Aethelgard", "Independent"],
  },
  {
    key: "ux_ui_designer",
    name: "UX/UI Designer",
    isDefault: false,
    positioning:
      "UX/UI Designer focused on research, interaction design, visual systems and prototypes for digital products.",
    keywords: ["UX", "UI", "Figma", "Usability", "Interaction design", "Prototyping", "Design systems"],
    evidenceOrder: ["RedVelvetVault", "Independent", "Irish AI Creative", "Aethelgard"],
  },
] as const;

async function main() {
  const user = await prisma.user.findFirst({ include: { settings: true } });
  if (!user) throw new Error("No user — run npm run db:seed first");

  for (const p of NEW_PROFILES) {
    await prisma.careerProfile.upsert({
      where: { userId_key: { userId: user.id, key: p.key } },
      create: {
        userId: user.id,
        key: p.key,
        name: p.name,
        positioning: p.positioning,
        keywordsJson: JSON.stringify(p.keywords),
        evidenceOrderJson: JSON.stringify(p.evidenceOrder),
        isDefault: p.isDefault,
      },
      update: {
        name: p.name,
        positioning: p.positioning,
        keywordsJson: JSON.stringify(p.keywords),
        evidenceOrderJson: JSON.stringify(p.evidenceOrder),
      },
    });
  }

  // Refresh applied_ai title positioning (no longer "AI Product Design Engineer" default)
  await prisma.careerProfile.updateMany({
    where: { userId: user.id, key: "applied_ai" },
    data: {
      name: "Applied AI / Automation",
      positioning:
        "Applied AI and workflow automation builder who combines APIs, Python, AI-assisted coding, data processing, and product thinking to automate real business workflows.",
      evidenceOrderJson: JSON.stringify([
        "Dublin Gold Testing",
        "Aethelgard",
        "CareerOS",
        "Irish AI Creative",
        "RedVelvetVault",
      ]),
    },
  });

  // Irish AI experience — lock umbrella title + V3 fields
  const irish = await prisma.experience.findFirst({
    where: { userId: user.id, company: { contains: "Irish AI Creative" } },
  });
  if (irish) {
    await prisma.experience.update({
      where: { id: irish.id },
      data: {
        umbrellaTitle: "AI Creative Technologist & Automation Builder",
        officialTitle: "AI Creative Technologist & Automation Builder",
        companyContext:
          "Creative production studio producing character-led and social-first video content across company brands and platforms.",
        approvedForCV: true,
        alternativeTitlesJson: JSON.stringify({
          // Profile notes only — never used as title replacements
          notes_product: "Product Designer — AI Workflows & Internal Tools",
          notes_design: "Design Engineer — AI Automation & Creative Systems",
        }),
        resumeBulletsJson: JSON.stringify([
          {
            text: "Built AI-assisted workflows and internal tools to accelerate high-volume creative production.",
            profiles: ["*"],
          },
          {
            text: "Designed a B2B lead-generation pipeline that collected, filtered and organised Dublin business leads for the launch of a gold-testing service.",
            profiles: ["ai_engineer", "applied_ai", "product_engineer", "*"],
          },
          {
            text: "Integrated external APIs and automation tools to support lead enrichment, campaign preparation and repeatable production workflows.",
            profiles: ["ai_engineer", "applied_ai", "*"],
          },
          {
            text: "Collaborated with non-technical stakeholders to translate business requirements into usable internal systems.",
            profiles: ["*"],
          },
        ]),
      },
    });
  }

  // Two Blokes — preserve official title (never invent engineering replacements)
  await prisma.experience.updateMany({
    where: { userId: user.id, company: { contains: "Two Blokes" } },
    data: {
      umbrellaTitle: "Video Editor",
      officialTitle: "Video Editor",
      selectedOfficialTitle: "Video Editor",
      titleOptionsJson: JSON.stringify(["Video Editor"]),
      approvedTitleDescriptor: "Content & Growth",
      titleDescriptorApproved: true,
      location: "Remote / Ireland",
      startDate: "Jan 2025",
      endDate: "Jan 2026",
      isCurrent: false,
      approvedForCV: true,
      chronologyIndex: 2,
      relevanceScore: 0.75,
      preferredOrderByRoleJson: JSON.stringify({
        ai_engineer: 2,
        applied_ai: 2,
        ai_product_engineer: 2,
        product_designer: 3,
        ux_designer: 3,
        frontend_engineer: 3,
      }),
      themesJson: JSON.stringify([
        "Content production",
        "Cross-platform publishing",
        "Growth experimentation",
        "Production workflows",
        "Analytics",
      ]),
      bulletsJson: JSON.stringify([
        "Produced 30+ podcast episodes and 250+ short-form videos across YouTube, Instagram, TikTok, LinkedIn and X.",
        "Increased YouTube subscribers from 2.9K to 8.2K (+183%).",
        "Increased total views from 34.9K to 165.5K (+374%).",
        "Designed reusable production workflows that reduced turnaround time across multiple publishing channels.",
      ]),
      resumeBulletsJson: JSON.stringify([
        {
          text: "Produced 30+ podcast episodes and 250+ short-form videos across YouTube, Instagram, TikTok, LinkedIn and X.",
          profiles: ["*"],
        },
        {
          text: "Increased YouTube subscribers from 2.9K to 8.2K (+183%).",
          profiles: ["*"],
        },
        {
          text: "Increased total views from 34.9K to 165.5K (+374%).",
          profiles: ["*"],
        },
        {
          text: "Designed reusable production workflows that reduced turnaround time across multiple publishing channels.",
          profiles: ["*"],
        },
      ]),
      companyContext:
        "Finance-focused digital content brand with a growing product offering (Trevesto), targeting retail investors.",
    },
  });

  // Arcop — correct legacy 2019 dates
  await prisma.experience.updateMany({
    where: { userId: user.id, company: { contains: "Arcop" } },
    data: {
      umbrellaTitle: "Architectural Intern",
      officialTitle: "Architectural Intern",
      location: "Bengaluru, India",
      startDate: "Jan 2022",
      endDate: "Mar 2023",
      isCurrent: false,
      approvedForCV: true,
      chronologyIndex: 4,
      relevanceScore: 0.35,
      preferredOrderByRoleJson: JSON.stringify({
        ai_engineer: 4,
        applied_ai: 4,
        ai_product_engineer: 4,
        product_designer: 4,
        ux_designer: 4,
        frontend_engineer: 4,
      }),
    },
  });

  await prisma.experience.updateMany({
    where: { userId: user.id, company: { contains: "Irish AI Creative" } },
    data: {
      chronologyIndex: 1,
      relevanceScore: 1,
      preferredOrderByRoleJson: JSON.stringify({
        ai_engineer: 1,
        applied_ai: 1,
        ai_product_engineer: 1,
        product_designer: 2,
        ux_designer: 2,
        frontend_engineer: 2,
      }),
    },
  });

  await prisma.experience.updateMany({
    where: { userId: user.id, company: "Independent" },
    data: {
      chronologyIndex: 3,
      relevanceScore: 0.7,
      preferredOrderByRoleJson: JSON.stringify({
        ai_engineer: 3,
        applied_ai: 3,
        ai_product_engineer: 3,
        product_designer: 1,
        ux_designer: 1,
        frontend_engineer: 1,
      }),
    },
  });

  // --- Aethelgard ---
  const aethelgardBullets = [
    {
      text: "Built an AI-assisted digital-product production system consolidating market research, artwork generation, print preparation, mockup generation, SEO and Etsy draft creation.",
      profiles: ["*"],
    },
    {
      text: "Designed a Factory Dashboard with application-state aggregation, review queues and human approval before any external draft creation.",
      profiles: ["ai_engineer", "applied_ai", "product_engineer", "design_engineer", "*"],
    },
    {
      text: "Implemented CSV/XLSX batch production, persistent background jobs, daily artwork quota management and dry-run testing for safer operations.",
      profiles: ["ai_engineer", "applied_ai", "product_engineer", "*"],
    },
    {
      text: "Integrated multiple AI providers and the Etsy Open API in Python with a local browser-based interface, keeping publish actions under human control.",
      profiles: ["ai_engineer", "applied_ai", "*"],
    },
  ];

  const aethelgard = await prisma.project.upsert({
    where: { userId_key: { userId: user.id, key: "aethelgard" } },
    create: {
      userId: user.id,
      key: "aethelgard",
      name: "Aethelgard Art Co. Production Suite",
      type: "Independent product",
      status: "Operational / actively developed",
      primaryRole: "Design Engineer / AI Product Builder",
      stackJson: JSON.stringify([
        "Python",
        "HTML/CSS/JavaScript",
        "Gemini",
        "OpenAI",
        "OpenRouter",
        "Pillow",
        "OpenCV",
        "Playwright",
        "Etsy Open API",
      ]),
      featuresJson: JSON.stringify([
        "Factory Dashboard",
        "CSV/XLSX batch production",
        "Background jobs",
        "Quota management",
        "Review queues",
        "Human approval",
        "Mockup compositor",
        "Etsy draft creation (no auto-publish)",
      ]),
      outcomesJson: JSON.stringify([
        "7 artwork runs",
        "11 finalized pieces",
        "36 mockup JPGs",
        "21 registered mockup templates",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "AI Engineer",
        "Applied AI",
        "Automation",
        "Design Engineer",
        "Product Engineer",
        "Internal Tools",
      ]),
      constraintsJson: JSON.stringify([
        "Never describe as a successful Etsy business",
        "No verified commercial SaaS revenue",
        "No paying users claimed",
        "No ML model training",
        "No automatic Etsy publishing",
        "No RAG or vector database claims",
      ]),
      startDate: "July 2026",
      endDate: "Present",
      isCurrent: true,
      shortSummary:
        "AI-assisted digital production suite with human-in-the-loop review for artwork, mockups, SEO and Etsy drafts.",
      problemStatement: "Fragmented paid tools and repetitive manual workflows for digital product listing production.",
      solutionSummary:
        "Unified production system with dashboard, batch jobs, quotas, review queues and API integrations under human approval.",
      technicalSummary: "Python local browser UI integrating multiple AI providers and Etsy Open API.",
      resumeBulletsJson: JSON.stringify(aethelgardBullets),
      roleVariantsJson: JSON.stringify({
        ai_engineer: "AI Product Builder",
        applied_ai: "Applied AI / Automation Builder",
        design_engineer: "Design Engineer",
        product_engineer: "Product Builder",
      }),
      keywordsJson: JSON.stringify([
        "Python",
        "Playwright",
        "LLM",
        "API",
        "human-in-the-loop",
        "automation",
        "dashboard",
        "Etsy Open API",
      ]),
      featured: true,
      cvPriority: 10,
      approvedForCV: true,
      sortOrder: 1,
      verified: true,
    },
    update: {
      name: "Aethelgard Art Co. Production Suite",
      type: "Independent product",
      status: "Operational / actively developed",
      primaryRole: "Design Engineer / AI Product Builder",
      startDate: "July 2026",
      endDate: "Present",
      isCurrent: true,
      shortSummary:
        "AI-assisted digital production suite with human-in-the-loop review for artwork, mockups, SEO and Etsy drafts.",
      resumeBulletsJson: JSON.stringify(aethelgardBullets),
      roleVariantsJson: JSON.stringify({
        ai_engineer: "AI Product Builder",
        applied_ai: "Applied AI / Automation Builder",
        design_engineer: "Design Engineer",
        product_engineer: "Product Builder",
      }),
      keywordsJson: JSON.stringify([
        "Python",
        "Playwright",
        "LLM",
        "API",
        "human-in-the-loop",
        "automation",
        "dashboard",
        "Etsy Open API",
      ]),
      constraintsJson: JSON.stringify([
        "Never describe as a successful Etsy business",
        "No verified commercial SaaS revenue",
        "No paying users claimed",
        "No ML model training",
        "No automatic Etsy publishing",
        "No RAG or vector database claims",
      ]),
      featured: true,
      cvPriority: 10,
      approvedForCV: true,
      stackJson: JSON.stringify([
        "Python",
        "HTML/CSS/JavaScript",
        "Gemini",
        "OpenAI",
        "OpenRouter",
        "Pillow",
        "OpenCV",
        "Playwright",
        "Etsy Open API",
      ]),
      featuresJson: JSON.stringify([
        "Factory Dashboard",
        "CSV/XLSX batch production",
        "Background jobs",
        "Quota management",
        "Review queues",
        "Human approval",
        "Mockup compositor",
        "Etsy draft creation (no auto-publish)",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "AI Engineer",
        "Applied AI",
        "Automation",
        "Design Engineer",
        "Product Engineer",
        "Internal Tools",
      ]),
    },
  });

  // --- CareerOS ---
  const careerosBullets = [
    {
      text: "Built a Next.js and TypeScript platform that imports, parses and scores jobs against structured career profiles.",
      profiles: ["*"],
    },
    {
      text: "Developed evidence-aware CV generation with DOCX/PDF export, versioning and ATS keyword analysis under human review.",
      profiles: ["ai_engineer", "product_engineer", "design_engineer", "ux_engineer", "*"],
    },
    {
      text: "Integrated Prisma, Supabase PostgreSQL, Supabase Auth and Vercel deployment for a production personal job OS.",
      profiles: ["ai_engineer", "product_engineer", "frontend_engineer", "*"],
    },
    {
      text: "Combined deterministic hard filters with Groq/Gemini-assisted scoring while keeping application submission manual.",
      profiles: ["ai_engineer", "applied_ai", "product_engineer", "*"],
    },
  ];

  const careeros = await prisma.project.upsert({
    where: { userId_key: { userId: user.id, key: "careeros" } },
    create: {
      userId: user.id,
      key: "careeros",
      name: "CareerOS",
      type: "Independent product",
      status: "Operational / actively developed",
      primaryRole: "AI Product Engineer / Design Engineer",
      stackJson: JSON.stringify([
        "Next.js 15",
        "React 19",
        "TypeScript",
        "Prisma",
        "Supabase PostgreSQL",
        "Supabase Auth",
        "Vercel",
        "docx",
        "pdfkit",
        "Groq",
        "Gemini",
      ]),
      featuresJson: JSON.stringify([
        "Job import and parsing",
        "Hard filters and scoring",
        "Role profile recommendation",
        "ATS DOCX/PDF generation",
        "Resume versioning",
        "Keyword coverage analysis",
        "Human approval of edits",
        "Application tracking",
      ]),
      outcomesJson: JSON.stringify([
        "Deployed on Vercel",
        "Evidence and claim validation pipeline",
        "Deterministic + LLM-assisted scoring",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "AI Engineer",
        "Product Engineer",
        "Design Engineer",
        "UX Engineer",
        "Applied AI",
        "Automation",
        "Internal Tools",
      ]),
      constraintsJson: JSON.stringify([
        "No autonomous job applications",
        "No perfect ATS scoring claims",
        "No legal NLP expertise claims",
        "No guaranteed interview success",
        "Human review required before apply",
      ]),
      startDate: "July 2026",
      endDate: "Present",
      isCurrent: true,
      shortSummary:
        "Targeted job-discovery and evidence-grounded ATS CV generation platform with scoring, versioning and human review.",
      problemStatement: "Manual job search and resume tailoring is slow and inconsistent with immigration constraints.",
      solutionSummary:
        "Personal job OS that discovers/scores roles and prepares claim-validated CVs while keeping submission human-gated.",
      technicalSummary: "Next.js 15, React 19, TypeScript, Prisma, Supabase, Vercel; DOCX/PDF via docx + pdfkit.",
      resumeBulletsJson: JSON.stringify(careerosBullets),
      roleVariantsJson: JSON.stringify({
        ai_engineer: "AI Product Engineer",
        applied_ai: "Applied AI Product Builder",
        design_engineer: "Design Engineer",
        product_engineer: "Product Engineer",
        ux_engineer: "UX Engineer",
      }),
      keywordsJson: JSON.stringify([
        "Next.js",
        "TypeScript",
        "Prisma",
        "Supabase",
        "ATS",
        "scoring",
        "DOCX",
        "PDF",
        "human-in-the-loop",
      ]),
      githubUrl: "https://github.com/rosh-the-coder/career-os",
      projectUrl: "https://career-os-topaz-nu.vercel.app",
      featured: true,
      cvPriority: 10,
      approvedForCV: true,
      sortOrder: 2,
      verified: true,
    },
    update: {
      status: "Operational / actively developed",
      primaryRole: "AI Product Engineer / Design Engineer",
      startDate: "July 2026",
      endDate: "Present",
      isCurrent: true,
      shortSummary:
        "Targeted job-discovery and evidence-grounded ATS CV generation platform with scoring, versioning and human review.",
      resumeBulletsJson: JSON.stringify(careerosBullets),
      constraintsJson: JSON.stringify([
        "No autonomous job applications",
        "No perfect ATS scoring claims",
        "No legal NLP expertise claims",
        "No guaranteed interview success",
        "Human review required before apply",
      ]),
      keywordsJson: JSON.stringify([
        "Next.js",
        "TypeScript",
        "Prisma",
        "Supabase",
        "ATS",
        "scoring",
        "DOCX",
        "PDF",
        "human-in-the-loop",
      ]),
      githubUrl: "https://github.com/rosh-the-coder/career-os",
      projectUrl: "https://career-os-topaz-nu.vercel.app",
      featured: true,
      cvPriority: 10,
      approvedForCV: true,
      stackJson: JSON.stringify([
        "Next.js 15",
        "React 19",
        "TypeScript",
        "Prisma",
        "Supabase PostgreSQL",
        "Supabase Auth",
        "Vercel",
        "docx",
        "pdfkit",
        "Groq",
        "Gemini",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "AI Engineer",
        "Product Engineer",
        "Design Engineer",
        "UX Engineer",
        "Applied AI",
        "Automation",
        "Internal Tools",
      ]),
    },
  });

  // --- Dublin Gold — improve, dates tied to Irish AI period ---
  await prisma.project.updateMany({
    where: { userId: user.id, key: "dublin_gold_testing" },
    data: {
      startDate: "Mar 2026",
      endDate: "Jul 2026",
      isCurrent: false,
      approvedForCV: true,
      featured: true,
      cvPriority: 8,
      shortSummary:
        "Operational B2B lead-generation and outreach workflow for a gold-testing business using Python automation.",
      resumeBulletsJson: JSON.stringify([
        {
          text: "Built a lead-generation workflow that collected and scored relevant Dublin businesses into a structured spreadsheet for outreach.",
          profiles: ["ai_engineer", "applied_ai", "product_engineer", "*"],
        },
        {
          text: "Used APIs and automation tooling (Apify, Anymail Finder) with SendGrid for sequenced email outreach preparation.",
          profiles: ["ai_engineer", "applied_ai", "*"],
        },
        {
          text: "Designed a practical internal workflow and Streamlit dashboard usable by non-technical stakeholders.",
          profiles: ["*"],
        },
      ]),
      keywordsJson: JSON.stringify([
        "Python",
        "Pandas",
        "Streamlit",
        "Apify",
        "SendGrid",
        "lead scoring",
        "automation",
      ]),
      constraintsJson: JSON.stringify([
        "Time-saved metrics are estimates and must be labelled as such",
      ]),
    },
  });

  // --- RedVelvetVault — supporting web/product evidence (not AI/NLP) ---
  await prisma.project.updateMany({
    where: { userId: user.id, key: "redvelvetvault" },
    data: {
      startDate: "Mar 2025",
      endDate: "Dec 2025",
      isCurrent: false,
      approvedForCV: true,
      featured: true,
      cvPriority: 7,
      primaryRole: "Product Design Engineer",
      shortSummary:
        "Full-stack virtual art-gallery platform combining a React application with an embedded Unity WebGL experience.",
      stackJson: JSON.stringify(["React", "TypeScript", "Firebase", "Unity", "C#", "WebGL"]),
      resumeBulletsJson: JSON.stringify([
        {
          text: "Built a React and TypeScript application with Firebase authentication, Firestore and Storage for user galleries, artwork uploads and social features.",
          profiles: ["*"],
        },
        {
          text: "Integrated Unity WebGL and React through structured JSON-based data exchange.",
          profiles: ["ai_engineer", "design_engineer", "frontend_engineer", "product_engineer", "*"],
        },
        {
          text: "Designed and tested an end-to-end product across discovery, profiles, galleries, marketplace and social interactions.",
          profiles: ["*"],
        },
      ]),
      keywordsJson: JSON.stringify([
        "React",
        "TypeScript",
        "Firebase",
        "Unity",
        "WebGL",
        "full-stack",
        "product",
      ]),
      roleVariantsJson: JSON.stringify({
        ai_engineer: "Product Design Engineer",
        applied_ai: "Product Design Engineer",
        product_designer: "Product Designer & Developer",
        design_engineer: "Design Engineer",
        ux_engineer: "UX Engineer",
        frontend_engineer: "Frontend Engineer",
      }),
    },
  });

  // Evidence for CareerOS + refresh Aethelgard evidence
  const existingCareerOsEv = await prisma.evidenceItem.findFirst({
    where: { userId: user.id, projectId: careeros.id },
  });
  if (!existingCareerOsEv) {
    await prisma.evidenceItem.create({
      data: {
        userId: user.id,
        type: "project",
        title: "CareerOS — job scoring and ATS CV generation platform",
        description:
          "Next.js/TypeScript personal job OS: import/parse/score jobs, generate claim-aware DOCX/PDF CVs, keyword fit, versioning, Supabase Auth, Vercel deploy. Submission remains manual.",
        source: "Repository architecture and production deployment",
        verified: true,
        confidence: "high",
        allowedProfilesJson: JSON.stringify([
          "ai_engineer",
          "applied_ai",
          "product_engineer",
          "design_engineer",
          "ux_engineer",
          "*",
        ]),
        keywordsJson: JSON.stringify([
          "Next.js",
          "TypeScript",
          "Prisma",
          "Supabase",
          "ATS",
          "DOCX",
          "PDF",
          "scoring",
        ]),
        prohibitedClaimsJson: JSON.stringify([
          "Autonomous job applications",
          "Perfect ATS score",
          "Legal NLP expert",
        ]),
        projectId: careeros.id,
      },
    });
  }

  await prisma.evidenceItem.updateMany({
    where: { userId: user.id, projectId: aethelgard.id },
    data: {
      title: "Aethelgard — AI production suite (operational / in active development)",
      description:
        "Human-in-the-loop generative production system with Factory Dashboard, batch jobs, quotas, review queues, mockups and Etsy draft prep. Not a live revenue Etsy business; no auto-publish.",
      confidence: "high",
      allowedProfilesJson: JSON.stringify([
        "ai_engineer",
        "ai_creative",
        "applied_ai",
        "design_engineer",
        "product_designer",
        "product_engineer",
        "*",
      ]),
      keywordsJson: JSON.stringify([
        "Python",
        "Playwright",
        "Gemini",
        "image pipeline",
        "human-in-the-loop",
        "Etsy Open API",
        "dashboard",
      ]),
      prohibitedClaimsJson: JSON.stringify([
        "Successful Etsy business",
        "Verified revenue",
        "Passive income",
        "Paying users",
        "RAG",
      ]),
    },
  });

  // Skills enrichment — add LLM API Integration etc. if missing
  const extraSkills = [
    { name: "LLM API Integration", category: "ai", keywords: ["llm api", "openai api", "gemini api"] },
    { name: "Workflow Automation", category: "automation", keywords: ["automation", "workflow"] },
    { name: "Human-in-the-loop Systems", category: "ai", keywords: ["human-in-the-loop", "hitl"] },
    { name: "Evaluation and Testing", category: "ai", keywords: ["evaluation", "benchmark"] },
    { name: "Structured Outputs", category: "ai", keywords: ["json mode", "structured output"] },
    { name: "Internal Tooling", category: "automation", keywords: ["internal tools", "ops tools"] },
    { name: "Data Processing", category: "data", keywords: ["etl", "data pipeline", "pandas"] },
    { name: "SQL", category: "backend", keywords: ["postgres", "postgresql"] },
    { name: "Git", category: "collaboration", keywords: ["github", "version control"] },
    { name: "Prisma", category: "backend", keywords: ["orm"] },
  ];
  for (const s of extraSkills) {
    await prisma.skill.upsert({
      where: { userId_name: { userId: user.id, name: s.name } },
      create: {
        userId: user.id,
        name: s.name,
        category: s.category,
        keywordsJson: JSON.stringify(s.keywords),
        verified: true,
        approvedForCV: true,
        profilesJson: JSON.stringify(["*"]),
      },
      update: {
        approvedForCV: true,
        keywordsJson: JSON.stringify(s.keywords),
      },
    });
  }

  await prisma.skill.updateMany({
    where: { userId: user.id },
    data: { approvedForCV: true, profilesJson: JSON.stringify(["*"]) },
  });

  console.log("V3 inventory upserted for", user.email);
  console.log("Projects: aethelgard, careeros, dublin_gold_testing, redvelvetvault");
  console.log("Profiles added/updated: ai_engineer, product_engineer, frontend_engineer, ux_ui_designer, applied_ai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
