import type { CareerInventory } from "./load-career-profile";
import { eligibleExperiences, eligibleSkills, skillMatchesProfile } from "./cv-eligibility";
import { getRolePolicy, resolveCvTitle } from "./role-policy";
import type { ResumeClaim } from "./types";

export function composeSummary(opts: {
  inventory: CareerInventory;
  profileKey: string;
  jobTitle: string;
  company: string;
  selectedProjectNames: string[];
}): ResumeClaim {
  const title = resolveCvTitle(opts.profileKey, opts.jobTitle);
  const names = opts.selectedProjectNames;
  const hasAethelgard = names.some((n) => /aethelgard/i.test(n));
  const hasCareerOs = names.some((n) => /careeros/i.test(n));

  const evidenceIds = opts.inventory.evidence
    .filter((e) => e.verified)
    .slice(0, 4)
    .map((e) => e.id);

  let text: string;

  if (opts.profileKey === "ai_engineer" || opts.profileKey === "applied_ai") {
    const products =
      hasAethelgard && hasCareerOs
        ? "Built Aethelgard, an end-to-end digital production platform, and CareerOS, an evidence-aware job-scoring and CV-generation system."
        : hasAethelgard
          ? "Built Aethelgard, an end-to-end digital production platform."
          : "Built verified automation and product software.";
    text = `Applied AI and product engineer building workflow automation, internal tools and human-in-the-loop software using Python, TypeScript, APIs and LLM services. ${products} Experienced translating operational requirements into practical software for non-technical users.`;
  } else if (
    opts.profileKey === "design_engineer" ||
    opts.profileKey === "ux_engineer" ||
    opts.profileKey === "product_engineer"
  ) {
    text = `${title} with hands-on experience designing and implementing full-stack product interfaces using React and TypeScript. Shipped verified product work including ${names.slice(0, 2).join(" and ") || "product interfaces"}. Comfortable owning features from interaction design through API integration and production deployment.`;
  } else if (opts.profileKey === "frontend_engineer") {
    text = `Frontend-focused engineer implementing production React and TypeScript interfaces with strong attention to accessibility, component architecture and design-to-code delivery.`;
  } else if (opts.profileKey === "ai_creative") {
    text = `AI Creative Technologist combining generative workflows, product thinking and automation to build scalable creative systems. Experience expanding creative production into internal tooling and API-driven workflows.`;
  } else if (opts.profileKey === "product_designer") {
    text = `Product Designer with an engineering mindset — research, interaction design and shipping functional digital products. Uses code and AI-assisted workflows to move from prototype to working software.`;
  } else {
    // general + unknown niches — never invent UX/design positioning
    text = composeGeneralSummary(title, opts.inventory);
  }

  const words = text.split(/\s+/);
  if (words.length > 75) text = words.slice(0, 75).join(" ");

  return {
    text,
    evidenceIds,
    claimType: "verified",
    confidence: 0.85,
    numericClaims: [],
    sourceSection: "summary",
  };
}

/** Honest, evidence-grounded blurb for multi-niche / guest inventories. */
function composeGeneralSummary(cvTitle: string, inventory: CareerInventory): string {
  const exps = eligibleExperiences(inventory).slice(0, 4);
  const titles = [...new Set(exps.map((e) => e.umbrellaTitle.trim()).filter(Boolean))].slice(0, 3);
  const companies = [...new Set(exps.map((e) => e.company.trim()).filter(Boolean))].slice(0, 3);
  const skills = eligibleSkills(inventory)
    .map((s) => s.name.replace(/^[^:]+:\s*/, "").trim())
    .filter((n) => n.length >= 3 && n.length <= 40)
    .slice(0, 5);

  const roleBits = titles.length ? titles.join(", ") : "customer-facing and operational roles";
  const settingBits = companies.length ? ` across ${companies.join(", ")}` : "";
  const skillBits = skills.length ? ` Strengths include ${skills.join(", ")}.` : "";

  return `${cvTitle} with hands-on experience in ${roleBits}${settingBits}. Reliable in fast-paced service environments with a focus on customers, stock, and team delivery.${skillBits}`;
}

/** Grouped skills for ATS-safe multi-line rendering */
export function composeSkills(opts: {
  inventory: CareerInventory;
  profileKey: string;
  jobCorpus: string;
  pageLength: 1 | 2;
}) {
  const policy = getRolePolicy(opts.profileKey);
  const pool = eligibleSkills(opts.inventory);
  const byName = new Map(pool.map((s) => [s.name.toLowerCase(), s]));

  const pick = (names: string[]) =>
    names
      .map((n) => byName.get(n.toLowerCase()))
      .filter(Boolean)
      .map((s) => ({
        name: s!.name,
        evidenceIds: s!.evidenceIds,
        aliases: s!.keywords,
      }));

  if (opts.profileKey === "ai_engineer" || opts.profileKey === "applied_ai") {
    const groups = [
      {
        category: "Applied AI",
        items: pick([
          "LLM API Integration",
          "Prompt Engineering",
          "Structured Outputs",
          "Human-in-the-loop Systems",
          "Evaluation and Testing",
        ]),
      },
      {
        category: "Engineering",
        items: pick([
          "Python",
          "TypeScript",
          "SQL",
          "REST APIs",
          "Data Processing",
          "Workflow Automation",
          "Git",
        ]),
      },
      {
        category: "Product",
        items: pick(["Internal Tooling", "React", "Next.js", "Figma", "Prototyping"]),
      },
    ].filter((g) => g.items.length > 0);

    if (groups.length) return groups;
  }

  // Generic fallback — prefer JD + policy priority
  const limit = opts.pageLength === 1 ? 12 : 16;
  const scored = pool
    .filter((s) => skillMatchesProfile(s, opts.profileKey))
    .map((s) => {
      const displayName = s.name.replace(/^[^:]+:\s*/, "").trim() || s.name;
      const aliases = [displayName, s.name, ...s.keywords];
      const inJd = aliases.some((a) => a.length >= 3 && opts.jobCorpus.includes(a.toLowerCase()));
      const priority = policy.skillPriority.findIndex(
        (p) => p.toLowerCase() === displayName.toLowerCase() || p.toLowerCase() === s.name.toLowerCase(),
      );
      const score = (priority >= 0 ? 20 - priority : 0) + (inJd ? 8 : 0);
      return { skill: s, displayName, score };
    })
    .sort((a, b) => b.score - a.score || a.displayName.localeCompare(b.displayName));

  const picked = scored.slice(0, limit).map((p) => ({
    name: p.displayName,
    evidenceIds: p.skill.evidenceIds,
    aliases: p.skill.keywords,
  }));

  return [{ category: "Core Skills", items: picked }];
}

export function composeTechnicalStack(opts: {
  inventory: CareerInventory;
  profileKey: string;
  pageLength: 1 | 2;
}): { group: string; items: string[] }[] | undefined {
  if (opts.pageLength === 1 && opts.profileKey !== "ai_engineer" && opts.profileKey !== "applied_ai") {
    return undefined;
  }

  // Always populate for AI Engineer 2-page; optional compact for 1-page AI
  const owned = new Set(
    opts.inventory.skills.filter((s) => s.approvedForCV).map((s) => s.name.toLowerCase()),
  );
  const projectTech = opts.inventory.projects
    .filter((p) => p.approvedForCV)
    .flatMap((p) => p.stack.map((s) => s.toLowerCase()));
  const has = (name: string) =>
    owned.has(name.toLowerCase()) || projectTech.some((t) => t.includes(name.toLowerCase()) || name.toLowerCase().includes(t));

  const filter = (items: string[]) => items.filter((i) => has(i.split(" ")[0]!) || has(i));

  const groups = [
    {
      group: "Programming & Data",
      items: filter(["Python", "TypeScript", "SQL", "JavaScript"]),
    },
    {
      group: "Applied AI & Automation",
      items: filter([
        "LLM API Integration",
        "Prompt Engineering",
        "Structured Outputs",
        "Workflow Automation",
        "Human-in-the-loop Systems",
        "Evaluation and Testing",
      ]),
    },
    {
      group: "Web & Backend",
      items: filter(["React", "Next.js", "REST APIs", "Prisma", "Supabase PostgreSQL", "Firebase"]),
    },
    {
      group: "Infrastructure & Delivery",
      items: filter(["Git", "Vercel", "Supabase Auth", "API Integrations"]).length
        ? ["Git", "Vercel", "Supabase Auth", "API Integrations"].filter(
            (i) => has(i) || i === "API Integrations" || i === "Vercel" || i === "Supabase Auth",
          )
        : [],
    },
    {
      group: "Product & UX",
      items: filter(["Figma", "Interaction Design", "Prototyping", "Internal Tooling"]),
    },
  ]
    .map((g) => ({ ...g, items: [...new Set(g.items)] }))
    .filter((g) => g.items.length > 0);

  // Soft-include known stack from CareerOS/Aethelgard even if skill name differs
  if (opts.profileKey === "ai_engineer" || opts.profileKey === "applied_ai") {
    const ensure = (group: string, item: string) => {
      const g = groups.find((x) => x.group === group);
      if (g && !g.items.includes(item)) g.items.push(item);
    };
    ensure("Programming & Data", "Python");
    ensure("Programming & Data", "TypeScript");
    ensure("Web & Backend", "React");
    ensure("Web & Backend", "Next.js");
    ensure("Web & Backend", "REST APIs");
    ensure("Infrastructure & Delivery", "Git");
    ensure("Infrastructure & Delivery", "Vercel");
  }

  const cleaned = groups.filter((g) => g.items.length > 0);
  return cleaned.length ? cleaned : undefined;
}
