/**
 * Reference-aligned ATS content from Roshan's verified PDF CVs
 * (Product Designer / Design Engineer / AI Product Design Engineer extracts),
 * plus Irish AI Creative (Mar–Jul 2026) which was missing from those PDFs.
 */

import type { AtsResumeContent } from "@/lib/resume/export-docx";
import type { ResumeGenerationInput } from "@/lib/ai/types";

const IRISH_AI = {
  dates: "Mar 2026 — Jul 2026",
  title: "AI Creative Technologist & Automation Builder",
  company: "Irish AI Creative / South Dublin Auction House",
  location: "Dublin, Ireland",
  companyBlurb:
    "Irish AI Creative / South Dublin Auction House — creative production studio where the role expanded from video editing into AI-assisted creative workflows, internal tooling, and automation (ended 17 Jul 2026 via layoff).",
  bullets: [
    "Expanded from creative production into AI-assisted workflow automation and internal tooling for character-led and social-first video content.",
    "Built generation workflows with Veo 3, Cursor, and ChatGPT to accelerate repetitive creative production without inventing unverified metrics.",
    "Designed and shipped automation infrastructure supporting B2B lead generation and email outreach for Dublin Gold Testing.",
    "Applied product thinking, UX, API integration, and business-process design across company brands and social platforms.",
  ],
};

const EDUCATION = [
  {
    dates: "Sept 2024 — Mar 2026",
    line: "MSc in Creative Digital Media and UX, Technological University Dublin, Dublin",
    details: [
      "Authoring Principles · Design Practice · VR & AR Applications · Information Modelling",
      "Production & Prototyping · Project Definition & UX Treatment · User Interaction Design · Major Project & Report",
    ],
  },
  {
    dates: "Aug 2023 — Mar 2024",
    line: "Executive PG in UI/UX [CredentialID - IPTIH2403279], Indian Institute of Technology Roorkee, India",
  },
  {
    dates: "Jul 2018 — Nov 2023",
    line: "Bachelor of Architecture, Manipal School of Architecture and Planning, Manipal, India",
  },
];

const STACK_BASE: AtsResumeContent["technicalStack"] = [
  {
    group: "Design Tools",
    items: "Figma, Sketch, InVision, Adobe Creative Cloud (Photoshop, After Effects, Premiere Pro), Framer",
  },
  {
    group: "Frontend Development",
    items:
      "HTML, CSS, JavaScript, TypeScript, React, Next.js, Ionic, Tailwind CSS, Three.js, GSAP, Motion.dev, Unicorn Studio",
  },
  {
    group: "Backend & Data",
    items: "Firebase, PHP & MySQL, REST APIs, JSON, Node.js, Python, Streamlit, Vercel",
  },
  {
    group: "AI & Automation",
    items: "Cursor, ChatGPT, Gemini, Playwright, Apify, prompt engineering, human-in-the-loop workflows",
  },
  {
    group: "Immersive Design",
    items: "Unity + C#, AR/VR Environments, 3D Interaction, Game UI Design, WebGL",
  },
  {
    group: "Collaboration & Tools",
    items: "Git/GitHub, Trello, Miro, Stakeholder Communication, Workshop Facilitation",
  },
];

const RVV_PRODUCT = {
  dates: "Mar 2025 — Dec 2025",
  name: "RedVelvetVault",
  blurb:
    "Designed and shipped a full-stack web platform enabling users to discover, explore, and engage with digital artwork in virtual game-like 3D galleries.",
  role: "Product Designer & Developer",
  links: "[Website LINK] [Show-reel LINK] [Project Report]",
  bullets: [
    "Led end-to-end UX process from research to final delivery, conducting usability testing with 50+ users to validate navigation, onboarding, and interaction flows (81% rated the experience intuitive).",
    "Designed scalable UI components and user flows in Figma, establishing consistent visual hierarchy, spacing, and accessibility standards across the platform.",
    "Built and implemented the final product using React, TypeScript, Firebase, and AI-assisted development workflows (ChatGPT + Cursor), translating design directly into production-ready code.",
    "Collaborated between design and development decisions, balancing usability, performance, and real-world technical constraints.",
    "Shipped functional features including user authentication, content interaction, personalisation, and real-time engagement tools.",
    "Applied accessibility-first principles to improve readability, contrast, and cognitive clarity across complex workflows.",
  ],
};

const RVV_DESIGN_ENG = {
  dates: "Mar 2025 — Dec 2025",
  name: "RedVelvetVault",
  blurb:
    "Designed and implemented a full-stack web platform integrating React frontend with Unity WebGL environments and real-time backend services.",
  role: "Design Engineer",
  links: "[Website LINK] [Show-reel LINK] [Project Report]",
  bullets: [
    "Architected reusable React components using TypeScript and modular state management (Zustand) to ensure maintainability and scalability.",
    "Integrated Firebase Authentication, Firestore, and Storage to support user accounts, real-time content updates, and secure media uploads.",
    "Structured the application into modular feature domains, separating UI components, state logic, and backend integrations.",
    "Implemented real-time data syncing using onSnapshot() listeners for live content interaction.",
    "Structured cross-context communication between React and Unity WebGL via postMessage() for gallery interactions.",
    "Applied performance optimisations to address WebGL memory constraints and large texture handling.",
    "Translated Figma designs into pixel-accurate, responsive interfaces using Tailwind CSS.",
    "Ensured accessibility through semantic structure, contrast validation, and navigational clarity.",
  ],
};

const EXPERIENCE_COMMON = [
  {
    dates: "Oct 2024 — 2026",
    title: "INDEPENDENT PRODUCT DESIGNER (FREELANCE)",
    company: "Independent",
    location: "Dublin, Ireland",
    bulletsProduct: [
      "Created user-centered designs through detailed wireframing and prototyping.",
      "Produced interactive prototypes and high-fidelity mockups tailored for diverse digital environments.",
      "Executed usability testing to collect user insights, refining designs based on feedback.",
      "Facilitated workshops with stakeholders to ensure clarity and consensus on design goals.",
      "Applied design systems and accessibility standards to enhance user experience across all projects.",
    ],
    bulletsEng: [
      "Designed and implemented frontend interfaces for client projects, translating product requirements into responsive React-based components.",
      "Collaborated with stakeholders to define feature scope and iterate rapidly in short development cycles.",
      "Applied design systems and accessibility standards to ensure production-ready delivery.",
    ],
  },
  {
    dates: "Jan 2025 — 2025",
    title: "PRODUCT DESIGN CONSULTANT (Content & Growth)",
    company: "Two Blokes Trading",
    location: "Dublin",
    companyBlurb:
      "Two Blokes Trading is a finance-focused content brand with a growing digital product offering (Trevesto), targeting retail investors.",
    bullets: [
      "Contributed to product growth and user engagement through end-to-end content design for Two Blokes Trading’s app and brand ecosystem (including Trevesto).",
      "Produced 30+ long-form podcast episodes and 250+ short-form videos across YouTube, Instagram, TikTok, LinkedIn, X, and web platforms.",
      "Designed and delivered 300+ digital assets aligned with brand positioning, SEO strategy, and platform-specific user behaviours.",
      "Increased YouTube subscribers from 2.9K to 8.2K (+183%) and total views from 34.9K to 165.5K (+374%) within 10 months while working two days per week.",
      "Collaborated with marketing to create SEO-driven, user-focused multimedia content, improving engagement through clear CTAs and accessible cross-platform design.",
      "Worked closely with founders, marketers, and developers, incorporating feedback rapidly and contributing design input during app development.",
    ],
  },
  {
    dates: "Jul 2022 — Mar 2023",
    title: "ARCHITECTURAL INTERN",
    company: "Arcop Associates",
    location: "Bengaluru",
    companyBlurb:
      "Arcop Associates Pvt Ltd is a multidisciplinary architecture and design firm known for large-scale commercial, institutional, and urban development projects across India.",
    bullets: [
      "Produced detailed technical drawings (plumbing, HVAC, lighting) aligned with design specifications and regulatory standards.",
      "Led 3D visualisations and high-fidelity presentation decks for 5+ major projects, improving stakeholder understanding (reported 60% increase in client clarity).",
      "Collaborated with multidisciplinary teams to translate technical constraints into clear, visually communicative design solutions.",
      "Applied user-centred principles to spatial layouts, incorporating feedback to improve functionality and usability of built environments.",
      "Contributed to structured documentation systems that improved workflow consistency and design standardisation across projects.",
    ],
  },
];

function contactBlock(contact: ResumeGenerationInput["contact"] & { phone?: string }) {
  const phone = contact.phone ?? "+353 838501604";
  const linkUrls = {
    linkedinUrl: contact.linkedinUrl,
    portfolioUrl: contact.portfolioUrl,
    githubUrl: contact.githubUrl,
  };
  return {
    contactLine: `County Dublin, Ireland, ${phone}, ${contact.email}`,
    linksLine: `LINKS LinkedIn (${contact.linkedinUrl}), Portfolio Website (${contact.portfolioUrl}), Github (${contact.githubUrl})`,
    linkUrls,
  };
}

function profileCopy(
  profileKey: string,
  jobTitle?: string,
  company?: string,
): { roleName: string; profile: string; skills: string[] } {
  const tailor =
    jobTitle && company
      ? ` Targeting ${jobTitle} at ${company} with verified product, UX, and implementation evidence.`
      : "";

  if (profileKey === "design_engineer" || profileKey === "ux_engineer") {
    return {
      roleName: profileKey === "ux_engineer" ? "UX Engineer" : "Design Engineer",
      profile:
        `Design Engineer with 2+ years of experience designing and implementing full-stack web applications using React and TypeScript. Experienced in translating complex product requirements into scalable, maintainable frontend architectures with strong attention to performance, accessibility, and visual precision. Comfortable owning features end-to-end from interaction design and system thinking through API integration and production deployment while leveraging AI-assisted workflows to accelerate iteration without compromising code quality.${tailor}`,
      skills: [
        "React & TypeScript (production implementation)",
        "Component Architecture & Reusable UI Systems",
        "API Integration & Real-Time Data",
        "State Management (Zustand)",
        "Accessibility & Semantic UI",
        "Design-to-Code Translation (Figma → Production)",
        "Performance & Frontend Optimisation",
        "AI-Assisted Development Workflows (Cursor)",
        "UX Research & Usability Testing",
        "Prototyping (Low–High Fidelity)",
      ],
    };
  }

  if (profileKey === "applied_ai" || profileKey === "ai_creative") {
    return {
      roleName: profileKey === "ai_creative" ? "AI Creative Technologist" : "AI Product Design Engineer",
      profile:
        `AI-focused product designer and builder with hands-on experience shipping React/TypeScript products and AI-assisted creative/automation workflows. Skilled in UX research, interaction design, prototyping, and turning generative workflows into reliable internal tools — without claiming unverified ML research credentials.${tailor}`,
      skills: [
        "AI-Assisted Prototyping & Development",
        "UX Research & Usability Testing",
        "Interaction Design",
        "Figma (Components & Auto Layout)",
        "React, TypeScript, Next.js",
        "Workflow Automation",
        "Design Systems",
        "Accessibility Standards",
        "Cursor / ChatGPT / Gemini workflows",
        "Content Systems & Cross-Platform Design",
      ],
    };
  }

  // product_designer default
  return {
    roleName: "Product Designer",
    profile:
      `Product Designer with a strong engineering background — experienced in delivering web, mobile, and immersive digital products from concept to launch. Skilled in UX research, interaction design, accessibility, and rapid prototyping. Passionate about building tools that simplify complex workflows, with hands-on experience using code and AI-assisted workflows to ship functioning products. Completed an MSc in Creative Digital Media & UX with 2+ years of hands-on product design experience across real-world, academic, and freelance projects.${tailor}`,
    skills: [
      "UX Research & Usability Testing",
      "Interaction Design",
      "Figma (Components & Auto Layout)",
      "Responsive UI Design",
      "Accessibility Standards",
      "Design Systems",
      "Prototyping (Low–High Fidelity)",
      "Frontend Fundamentals (HTML, CSS, JavaScript, React, TypeScript)",
      "AI-Assisted Prototyping & Development",
    ],
  };
}

/** Build ATS content that mirrors the reference PDFs + Irish AI Creative. */
export function buildReferenceAtsContent(
  profileKey: string,
  contact: ResumeGenerationInput["contact"] & { phone?: string },
  opts?: { jobTitle?: string; company?: string },
): AtsResumeContent {
  const { roleName, profile, skills } = profileCopy(profileKey, opts?.jobTitle, opts?.company);
  const { contactLine, linksLine, linkUrls } = contactBlock(contact);
  const eng = profileKey === "design_engineer" || profileKey === "ux_engineer";
  const rvv = eng ? RVV_DESIGN_ENG : RVV_PRODUCT;

  const irishTitle =
    profileKey === "product_designer"
      ? "Product Designer — AI Workflows & Internal Tools"
      : profileKey === "design_engineer" || profileKey === "ux_engineer"
        ? "Design Engineer — AI Automation & Creative Systems"
        : IRISH_AI.title;

  return {
    documentTitle: `ROSHAN NAJAR, ${roleName}`,
    contactLine,
    linksLine,
    linkUrls,
    profile,
    skills,
    projects: [rvv],
    experiences: [
      {
        dates: IRISH_AI.dates,
        title: irishTitle,
        company: IRISH_AI.company,
        location: IRISH_AI.location,
        companyBlurb: IRISH_AI.companyBlurb,
        bullets: IRISH_AI.bullets,
      },
      {
        dates: EXPERIENCE_COMMON[0].dates,
        title: EXPERIENCE_COMMON[0].title,
        company: EXPERIENCE_COMMON[0].company,
        location: EXPERIENCE_COMMON[0].location,
        bullets: eng ? EXPERIENCE_COMMON[0].bulletsEng! : EXPERIENCE_COMMON[0].bulletsProduct!,
      },
      {
        dates: EXPERIENCE_COMMON[1].dates,
        title: EXPERIENCE_COMMON[1].title,
        company: EXPERIENCE_COMMON[1].company,
        location: EXPERIENCE_COMMON[1].location,
        companyBlurb: EXPERIENCE_COMMON[1].companyBlurb,
        bullets: EXPERIENCE_COMMON[1].bullets!,
      },
      {
        dates: EXPERIENCE_COMMON[2].dates,
        title: EXPERIENCE_COMMON[2].title,
        company: EXPERIENCE_COMMON[2].company,
        location: EXPERIENCE_COMMON[2].location,
        companyBlurb: EXPERIENCE_COMMON[2].companyBlurb,
        bullets: EXPERIENCE_COMMON[2].bullets!,
      },
    ],
    education: EDUCATION,
    technicalStack: STACK_BASE,
  };
}

export function atsToMarkdown(ats: AtsResumeContent): string {
  const lines: string[] = [
    ats.documentTitle,
    ats.contactLine,
    ats.linksLine,
    "",
    "PROFILE",
    ats.profile,
    "",
    "SKILLS",
    ats.skills.join(" · "),
    "",
    "SELECTED PROJECTS",
  ];
  for (const p of ats.projects) {
    lines.push(`${p.dates} ${p.name}`);
    if (p.blurb) lines.push(p.blurb);
    if (p.links) lines.push(p.links);
    lines.push(`Role: ${p.role}`);
    for (const b of p.bullets) lines.push(`• ${b}`);
    lines.push("");
  }
  lines.push("PROFESSIONAL EXPERIENCE");
  for (const e of ats.experiences) {
    lines.push(`${e.dates} ${e.title}, ${e.company}${e.location ? ` ${e.location}` : ""}`);
    if (e.companyBlurb) lines.push(e.companyBlurb);
    for (const b of e.bullets) lines.push(`• ${b}`);
    lines.push("");
  }
  lines.push("EDUCATION");
  for (const ed of ats.education) {
    lines.push(`${ed.dates} ${ed.line}`);
    for (const d of ed.details ?? []) lines.push(`• ${d}`);
  }
  lines.push("", "TECHNICAL STACK");
  for (const t of ats.technicalStack) lines.push(`${t.group}: ${t.items}`);
  return lines.join("\n");
}
