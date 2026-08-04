import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROFILE_DEFS = [
  {
    key: "design_engineer",
    name: "Design Engineer",
    isDefault: false,
    positioning:
      "Design Engineer combining UX systems thinking, frontend implementation, and AI-assisted product development to turn ambiguous ideas into working digital products and internal tools.",
    keywords: [
      "React",
      "TypeScript",
      "Design systems",
      "Component architecture",
      "Design-to-code",
      "API integration",
      "Product prototyping",
      "AI-assisted development",
      "Accessibility",
      "Internal tools",
    ],
    evidenceOrder: ["RedVelvetVault", "Aethelgard", "Dublin Gold Testing", "Irish AI Creative", "Independent"],
  },
  {
    key: "product_designer",
    name: "Product Designer",
    isDefault: false,
    positioning:
      "Product Designer with an engineering mindset, experienced in research, interaction design, workflow simplification, rapid prototyping, and shipping functional products.",
    keywords: [
      "UX research",
      "Usability testing",
      "Interaction design",
      "Product strategy",
      "User flows",
      "Prototyping",
      "Design systems",
      "Accessibility",
      "Workflow design",
      "Stakeholder collaboration",
    ],
    evidenceOrder: ["RedVelvetVault", "Irish AI Creative", "Aethelgard", "Independent", "Two Blokes Trading"],
  },
  {
    key: "applied_ai",
    name: "Applied AI / Automation",
    isDefault: false,
    positioning:
      "Applied AI and workflow automation builder who combines APIs, Python, AI-assisted coding, data processing, and product thinking to automate real business workflows.",
    keywords: [
      "Python",
      "REST APIs",
      "Workflow automation",
      "Data enrichment",
      "Lead scoring",
      "Web scraping",
      "Browser automation",
      "Human-in-the-loop",
      "Streamlit",
      "SendGrid",
    ],
    evidenceOrder: ["Dublin Gold Testing", "Aethelgard", "Irish AI Creative", "RedVelvetVault"],
  },
  {
    key: "ai_creative",
    name: "AI Creative Technologist",
    isDefault: false,
    positioning:
      "AI Creative Technologist combining generative media, product thinking, frontend development, and automation to build scalable creative systems.",
    keywords: [
      "Generative AI",
      "Veo",
      "Prompt engineering",
      "Creative automation",
      "Content systems",
      "AI video",
      "Internal tools",
      "Workflow design",
      "Multimodal",
      "Product prototyping",
    ],
    evidenceOrder: ["Irish AI Creative", "Aethelgard", "Dublin Gold Testing", "RedVelvetVault", "Two Blokes Trading"],
  },
  {
    key: "ux_engineer",
    name: "UX Engineer",
    isDefault: true,
    positioning:
      "UX Engineer bridging interaction design and frontend implementation to build accessible, responsive, production-ready product experiences.",
    keywords: [
      "React",
      "TypeScript",
      "Figma",
      "Accessibility",
      "Responsive UI",
      "Prototyping",
      "Design systems",
      "Frontend architecture",
      "Usability testing",
      "Interaction design",
    ],
    evidenceOrder: ["RedVelvetVault", "Independent", "Aethelgard", "Dublin Gold Testing"],
  },
] as const;

const SKILLS: { name: string; category: string; keywords: string[] }[] = [
  { name: "React", category: "frontend", keywords: ["react.js", "reactjs"] },
  { name: "TypeScript", category: "frontend", keywords: ["ts"] },
  { name: "JavaScript", category: "frontend", keywords: ["js", "es6"] },
  { name: "Next.js", category: "frontend", keywords: ["nextjs", "next"] },
  { name: "HTML", category: "frontend", keywords: [] },
  { name: "CSS", category: "frontend", keywords: [] },
  { name: "Tailwind CSS", category: "frontend", keywords: ["tailwind"] },
  { name: "Zustand", category: "frontend", keywords: [] },
  { name: "GSAP", category: "frontend", keywords: [] },
  { name: "Three.js", category: "frontend", keywords: ["threejs", "webgl"] },
  { name: "Figma", category: "design", keywords: [] },
  { name: "UX research", category: "design", keywords: ["user research"] },
  { name: "Usability testing", category: "design", keywords: [] },
  { name: "Interaction design", category: "design", keywords: [] },
  { name: "Design systems", category: "design", keywords: [] },
  { name: "Accessibility", category: "design", keywords: ["a11y", "wcag"] },
  { name: "Prototyping", category: "design", keywords: [] },
  { name: "Python", category: "backend", keywords: [] },
  { name: "Node.js", category: "backend", keywords: ["nodejs"] },
  { name: "REST APIs", category: "backend", keywords: ["api", "rest"] },
  { name: "Firebase", category: "backend", keywords: ["firestore", "firebase auth"] },
  { name: "Pandas", category: "data", keywords: [] },
  { name: "Streamlit", category: "data", keywords: [] },
  { name: "Playwright", category: "automation", keywords: [] },
  { name: "Apify", category: "automation", keywords: [] },
  { name: "SendGrid", category: "automation", keywords: [] },
  { name: "Cursor", category: "ai", keywords: ["ai-assisted development"] },
  { name: "Prompt engineering", category: "ai", keywords: [] },
  { name: "Gemini", category: "ai", keywords: ["google gemini"] },
  { name: "OpenAI", category: "ai", keywords: ["chatgpt"] },
  { name: "Unity", category: "creative", keywords: ["webgl", "c#"] },
];

async function main() {
  await prisma.application.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.jobScore.deleteMany();
  await prisma.job.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.careerProfile.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "roshan@theonlyrosh.com",
      name: "Roshan Najar",
      settings: {
        create: {},
      },
    },
  });

  for (const p of PROFILE_DEFS) {
    await prisma.careerProfile.create({
      data: {
        userId: user.id,
        key: p.key,
        name: p.name,
        positioning: p.positioning,
        keywordsJson: JSON.stringify(p.keywords),
        evidenceOrderJson: JSON.stringify(p.evidenceOrder),
        isDefault: p.isDefault,
      },
    });
  }

  for (const s of SKILLS) {
    await prisma.skill.create({
      data: {
        userId: user.id,
        name: s.name,
        category: s.category,
        keywordsJson: JSON.stringify(s.keywords),
        verified: true,
      },
    });
  }

  const irishAi = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Irish AI Creative / South Dublin Auction House",
      umbrellaTitle: "AI Creative Technologist & Automation Builder",
      location: "Dublin, Ireland",
      startDate: "2026-03",
      endDate: "2026-07-17",
      isCurrent: false,
      alternativeTitlesJson: JSON.stringify({
        product: "Product Designer — AI Workflows & Internal Tools",
        design_engineering: "Design Engineer — AI Automation & Creative Systems",
        applied_ai: "Applied AI & Workflow Automation Specialist",
        general: "AI Creative Technologist",
      }),
      themesJson: JSON.stringify([
        "Expanded from video editing into AI-assisted creative production and workflow automation",
        "Used Veo 3 and generative tools for character-led and social-first video content",
        "Built internal tools to accelerate repetitive generation workflows",
        "Used Cursor and ChatGPT for AI-assisted implementation and debugging",
        "Produced assets across company brands and social platforms",
        "Built automated lead-generation and email-outreach infrastructure for Dublin Gold Testing",
        "Applied product thinking, UX, automation, API integration, and business-process design",
      ]),
      bulletsJson: JSON.stringify([
        "Expanded role from creative production into AI-assisted workflow automation and internal tooling",
        "Built generation workflows with Veo 3, Cursor, and ChatGPT to accelerate creative production",
        "Designed and shipped automation infrastructure supporting B2B lead generation and outreach",
      ]),
      sortOrder: 1,
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

  const twoBlokes = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Two Blokes Trading",
      umbrellaTitle: "Video Editor",
      officialTitle: "Video Editor",
      selectedOfficialTitle: "Video Editor",
      titleOptionsJson: JSON.stringify(["Video Editor"]),
      approvedTitleDescriptor: "Content & Growth",
      titleDescriptorApproved: true,
      location: "Remote / Ireland",
      startDate: "Jan 2025",
      endDate: "Jan 2026",
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
      sortOrder: 2,
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
    },
  });

  const independent = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Independent",
      umbrellaTitle: "Product Designer & Frontend Implementer",
      location: "Dublin, Ireland",
      startDate: "2023",
      endDate: "2026",
      themesJson: JSON.stringify([
        "Frontend interface design and implementation",
        "React-based responsive components",
        "Stakeholder requirement definition",
        "Rapid iteration",
        "Design systems",
        "Accessibility",
        "Product and UX consulting",
      ]),
      bulletsJson: JSON.stringify([
        "Designed and implemented React-based responsive interfaces for client products",
        "Defined stakeholder requirements and iterated rapidly with design-system thinking",
        "Applied accessibility and UX consulting across product engagements",
      ]),
      sortOrder: 3,
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

  const arcop = await prisma.experience.create({
    data: {
      userId: user.id,
      company: "Arcop Associates",
      umbrellaTitle: "Architectural Intern",
      officialTitle: "Architectural Intern",
      location: "Bengaluru, India",
      startDate: "Jan 2022",
      endDate: "Mar 2023",
      themesJson: JSON.stringify([
        "Technical drawings",
        "Multidisciplinary collaboration",
        "3D visualization",
        "Presentation systems",
        "Translating technical constraints into understandable design outputs",
        "Structured documentation",
        "User-centred spatial thinking",
      ]),
      bulletsJson: JSON.stringify([
        "Produced technical drawings and 3D visualizations in a multidisciplinary studio",
        "Translated technical constraints into clear presentation and documentation outputs",
      ]),
      sortOrder: 4,
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

  const rvv = await prisma.project.create({
    data: {
      userId: user.id,
      key: "redvelvetvault",
      name: "RedVelvetVault",
      type: "0→1 interactive web platform and immersive 3D gallery",
      status: "shipped",
      primaryRole: "Product Design Engineer / Product Designer & Developer",
      stackJson: JSON.stringify([
        "React",
        "TypeScript",
        "Firebase Auth",
        "Firestore",
        "Firebase Storage",
        "Zustand",
        "Unity WebGL",
        "C#",
        "Tailwind CSS",
        "Cursor",
        "ChatGPT",
      ]),
      featuresJson: JSON.stringify([
        "User onboarding",
        "Authentication",
        "Artwork discovery",
        "Personalization",
        "Real-time engagement",
        "React–Unity communication",
        "3D gallery navigation",
        "Modular UI systems",
      ]),
      outcomesJson: JSON.stringify([
        "Usability testing with 50+ users",
        "81% rated the experience highly intuitive",
        "85% said they would recommend it",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "Product design",
        "UX research",
        "Design engineering",
        "Frontend implementation",
        "0→1 product development",
        "Real-time systems",
        "Immersive experience design",
      ]),
      sortOrder: 1,
    },
  });

  const dgt = await prisma.project.create({
    data: {
      userId: user.id,
      key: "dublin_gold_testing",
      name: "Dublin Gold Testing B2B Growth Engine",
      type: "Deployed internal automation system",
      status: "operational",
      primaryRole: "Applied AI & Workflow Automation Specialist",
      stackJson: JSON.stringify([
        "Python",
        "Pandas",
        "NumPy",
        "openpyxl",
        "Streamlit",
        "Apify",
        "Anymail Finder",
        "SendGrid",
        "Windows Task Scheduler",
      ]),
      featuresJson: JSON.stringify([
        "Lead consolidation and normalization",
        "Multi-signal deduplication",
        "Relevance filtering and lead scoring",
        "Email enrichment and verification",
        "Multi-stage outreach sequencing",
        "Streamlit CRM dashboard",
      ]),
      outcomesJson: JSON.stringify([
        "911 raw business locations collected",
        "290 highly relevant B2B targets",
        "160 emails sent successfully",
        "0 recorded bounces",
        "8 completed runs",
        "Estimated 45 hours of manual work saved",
        "Estimated 90%+ reduction in manual research/outreach management time",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "Workflow automation",
        "Applied AI",
        "API integration",
        "Internal tooling",
        "Operational dashboards",
        "Growth operations",
      ]),
      constraintsJson: JSON.stringify([
        "Time-saved metrics are estimates and must be labelled as such",
      ]),
      sortOrder: 2,
    },
  });

  const aethelgard = await prisma.project.create({
    data: {
      userId: user.id,
      key: "aethelgard",
      name: "Aethelgard Art Co. Production Suite",
      type: "Personal AI-assisted digital product production system",
      status: "in_development",
      primaryRole: "Product builder / AI tooling",
      stackJson: JSON.stringify([
        "Python",
        "HTML/CSS/JavaScript",
        "Gemini",
        "OpenAI",
        "OpenRouter",
        "Real-ESRGAN",
        "Pillow",
        "OpenCV",
        "Playwright",
      ]),
      featuresJson: JSON.stringify([
        "Human-in-the-loop image generation workflow",
        "4× upscaling and 300 DPI print crops",
        "Mockup compositing",
        "SEO title suggestions",
        "Etsy draft preparation via Playwright with manual publish gate",
      ]),
      outcomesJson: JSON.stringify([
        "7 artwork runs",
        "11 finalized pieces",
        "36 mockup JPGs",
        "21 registered mockup templates",
      ]),
      useAsEvidenceForJson: JSON.stringify([
        "Productization",
        "AI-assisted internal tools",
        "Human-in-the-loop workflows",
        "Image-processing pipelines",
        "Operator UX",
        "Browser automation",
      ]),
      constraintsJson: JSON.stringify([
        "Etsy shop not yet live",
        "No verified revenue",
        "Draft upload automation remains fragile",
        "Never describe as a successful Etsy business",
      ]),
      sortOrder: 3,
    },
  });

  // Evidence + metrics
  const evRvv = await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "project",
      title: "RedVelvetVault — 0→1 product design & design engineering",
      description:
        "Built an interactive web platform with React/TypeScript/Firebase and Unity WebGL gallery; usability tested with 50+ users (81% highly intuitive, 85% would recommend).",
      source: "Verified project inventory",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["design_engineer", "product_designer", "ux_engineer", "ai_creative", "*"]),
      keywordsJson: JSON.stringify(["React", "TypeScript", "Firebase", "Unity", "UX", "usability", "design engineering"]),
      projectId: rvv.id,
      prohibitedClaimsJson: JSON.stringify(["Senior AI engineer", "ML engineer"]),
    },
  });

  await prisma.metric.createMany({
    data: [
      {
        evidenceId: evRvv.id,
        label: "Usability testers",
        value: 50,
        unit: "users",
        exact: false,
        source: "Usability testing",
        approvedForCV: true,
        valueText: "50+",
      },
      {
        evidenceId: evRvv.id,
        label: "Rated highly intuitive",
        value: 81,
        unit: "%",
        exact: true,
        source: "Usability testing",
        approvedForCV: true,
      },
      {
        evidenceId: evRvv.id,
        label: "Would recommend",
        value: 85,
        unit: "%",
        exact: true,
        source: "Usability testing",
        approvedForCV: true,
      },
    ],
  });

  const evDgt = await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "project",
      title: "Dublin Gold Testing — operational B2B growth automation",
      description:
        "Deployed Python/Streamlit automation for lead consolidation, scoring, enrichment, and sequenced outreach with measurable operational outputs.",
      source: "Verified project inventory",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["applied_ai", "design_engineer", "ai_creative", "*"]),
      keywordsJson: JSON.stringify(["Python", "automation", "Streamlit", "Apify", "SendGrid", "lead scoring"]),
      projectId: dgt.id,
    },
  });

  await prisma.metric.createMany({
    data: [
      {
        evidenceId: evDgt.id,
        label: "Raw locations collected",
        value: 911,
        unit: "locations",
        exact: true,
        source: "System logs",
        approvedForCV: true,
      },
      {
        evidenceId: evDgt.id,
        label: "Relevant B2B targets",
        value: 290,
        unit: "targets",
        exact: true,
        source: "System logs",
        approvedForCV: true,
      },
      {
        evidenceId: evDgt.id,
        label: "Emails sent",
        value: 160,
        unit: "emails",
        exact: true,
        source: "SendGrid",
        approvedForCV: true,
      },
      {
        evidenceId: evDgt.id,
        label: "Estimated hours saved",
        value: 45,
        unit: "hours",
        exact: false,
        source: "Estimate",
        approvedForCV: false,
        isEstimate: true,
        needsReview: true,
      },
      {
        evidenceId: evDgt.id,
        label: "Estimated manual work reduction",
        value: 90,
        unit: "%",
        exact: false,
        source: "Estimate",
        approvedForCV: false,
        isEstimate: true,
        needsReview: true,
      },
    ],
  });

  await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "project",
      title: "Aethelgard — AI production suite (in development)",
      description:
        "Human-in-the-loop generative image pipeline with upscaling, mockups, and Playwright draft prep. Not live/revenue-generating yet.",
      source: "Verified project inventory",
      verified: true,
      confidence: "medium",
      allowedProfilesJson: JSON.stringify(["ai_creative", "applied_ai", "design_engineer", "product_designer"]),
      keywordsJson: JSON.stringify(["Playwright", "Gemini", "image pipeline", "human-in-the-loop"]),
      projectId: aethelgard.id,
      prohibitedClaimsJson: JSON.stringify([
        "Successful Etsy business",
        "Verified revenue",
        "Passive income",
      ]),
      notes: "Never claim live shop or revenue",
      isEstimate: false,
      needsReview: false,
    },
  });

  await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "experience",
      title: "Irish AI Creative — AI creative + automation expansion",
      description:
        "Role ended 17 Jul 2026 (layoff). Expanded from creative production into AI workflows, internal tools, and growth automation.",
      source: "Verified experience",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["ai_creative", "applied_ai", "design_engineer", "product_designer", "*"]),
      keywordsJson: JSON.stringify(["Veo", "automation", "Cursor", "internal tools", "workflow"]),
      experienceId: irishAi.id,
      isEstimate: true,
      needsReview: true,
      notes: "Social metrics placeholders need verification",
    },
  });

  const evTb = await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "experience",
      title: "Two Blokes Trading — measurable content growth",
      description: "Content systems and growth collaboration with verified audience metrics over ~10 months.",
      source: "Verified experience",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["product_designer", "ai_creative", "*"]),
      keywordsJson: JSON.stringify(["content systems", "growth", "YouTube", "SEO"]),
      experienceId: twoBlokes.id,
    },
  });

  await prisma.metric.createMany({
    data: [
      {
        evidenceId: evTb.id,
        label: "Subscriber growth",
        value: 183,
        unit: "%",
        exact: true,
        source: "YouTube analytics",
        approvedForCV: true,
      },
      {
        evidenceId: evTb.id,
        label: "View growth",
        value: 374,
        unit: "%",
        exact: true,
        source: "YouTube analytics",
        approvedForCV: true,
      },
      {
        evidenceId: evTb.id,
        label: "Short-form videos",
        value: 250,
        unit: "videos",
        exact: false,
        source: "Production log",
        approvedForCV: true,
        valueText: "250+",
      },
    ],
  });

  await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "experience",
      title: "Independent product design & frontend implementation",
      description: "React interfaces, design systems, accessibility, stakeholder-driven product work.",
      source: "Verified experience",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["ux_engineer", "product_designer", "design_engineer", "*"]),
      keywordsJson: JSON.stringify(["React", "design systems", "accessibility", "product design"]),
      experienceId: independent.id,
    },
  });

  await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "education",
      title: "MSc Creative Digital Media & UX — TU Dublin",
      description: "Master's in Creative Digital Media & UX, Technological University Dublin.",
      source: "Verified education",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["*"]),
      keywordsJson: JSON.stringify(["UX", "digital media", "TU Dublin"]),
    },
  });

  await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "education",
      title: "Executive PG UI/UX — IIT Roorkee",
      description: "Executive postgraduate qualification in UI/UX, IIT Roorkee.",
      source: "Verified education",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["*"]),
      keywordsJson: JSON.stringify(["UI/UX", "IIT Roorkee"]),
    },
  });

  await prisma.evidenceItem.create({
    data: {
      userId: user.id,
      type: "education",
      title: "Bachelor of Architecture — Manipal",
      description: "Bachelor of Architecture, Manipal School of Architecture and Planning.",
      source: "Verified education",
      verified: true,
      confidence: "high",
      allowedProfilesJson: JSON.stringify(["*"]),
      keywordsJson: JSON.stringify(["architecture", "spatial design"]),
      experienceId: arcop.id,
    },
  });

  console.log("Seeded CareerOS for", user.email);
  console.log("Experiences:", 4, "Projects:", 3, "Profiles:", PROFILE_DEFS.length, "Skills:", SKILLS.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
