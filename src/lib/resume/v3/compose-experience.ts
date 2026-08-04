import type { CareerInventory } from "./load-career-profile";
import { LOCKED_RESUME_DATES } from "./date-format";
import { selectNonRepetitiveBullets } from "./no-repetition";
import {
  formatExperienceDates,
  resolveExperienceTitle,
  type RankedExperience,
} from "./rank-experience";
import type { ExperienceResumeEntry, ResumeClaim } from "./types";

/** Business summaries — explain the company, not the candidate's contributions. */
const COMPANY_BUSINESS_BLURBS: Record<string, string> = {
  "irish ai":
    "Creative production studio producing character-led and social-first video content across company brands and platforms.",
  "two blokes":
    "Finance-focused digital content brand with a growing product offering (Trevesto), targeting retail investors.",
  arcop:
    "Multidisciplinary architecture and design firm known for large-scale commercial, institutional and urban development projects across India.",
  independent:
    "Independent product and design practice delivering client interfaces, UX consulting and frontend implementation.",
};

const IRISH_AI_BULLETS_AI: { text: string; profiles: string[] }[] = [
  {
    text: "Designed AI-assisted production workflows and internal tools that automated repetitive creative steps while keeping stakeholder review in the loop.",
    profiles: ["*"],
  },
  {
    text: "Engineered a B2B lead-generation pipeline that collected, filtered and organised Dublin business leads for the launch of a gold-testing service.",
    profiles: ["ai_engineer", "applied_ai", "product_engineer", "*"],
  },
  {
    text: "Integrated external APIs and automation tooling to support lead enrichment, campaign preparation and repeatable operational workflows.",
    profiles: ["ai_engineer", "applied_ai", "*"],
  },
  {
    text: "Translated non-technical business requirements into usable internal systems for creative and operations stakeholders.",
    profiles: ["*"],
  },
];

const TWO_BLOKES_BULLETS: { text: string; profiles: string[] }[] = [
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
];

function sanitizeBullet(text: string): string {
  return text
    .replace(/\s*without inventing unverified metrics\.?/gi, "")
    .replace(/\s*via layoff\.?/gi, "")
    .replace(/\s*ended 17 Jul 2026 via layoff\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\.\s*\./g, ".")
    .trim();
}

function businessBlurbFor(company: string, fromTitle?: string): string | undefined {
  const key = Object.keys(COMPANY_BUSINESS_BLURBS).find((k) => company.toLowerCase().includes(k));
  if (key) return COMPANY_BUSINESS_BLURBS[key];
  return fromTitle;
}

function bulletBudget(company: string, profileKey: string, pageLength: 1 | 2, entryCount: number): number {
  const aiLike = profileKey === "ai_engineer" || profileKey === "applied_ai";
  if (/two blokes/i.test(company)) return pageLength === 1 ? 3 : 5;
  if (/irish ai creative/i.test(company)) return pageLength === 1 ? 3 : 4;
  if (aiLike && pageLength === 2 && entryCount >= 4) {
    if (/independent/i.test(company)) return 2;
    if (/arcop/i.test(company)) return 1;
  }
  if (/arcop/i.test(company)) return 2;
  return pageLength === 1 ? 3 : 4;
}

function pickExperienceBullets(
  ranked: RankedExperience,
  profileKey: string,
  pageLength: 1 | 2,
  entryCount: number,
  companyBlurb?: string,
): ResumeClaim[] {
  const exp = ranked.experience;
  const max = bulletBudget(exp.company, profileKey, pageLength, entryCount);
  const evidenceIds = exp.evidence.map((e) => e.id);
  const isIrish = /irish ai creative/i.test(exp.company);
  const isTwoBlokes = /two blokes/i.test(exp.company);

  let source: { text: string; profiles?: string[]; evidenceIds?: string[] }[];

  if (isIrish && (profileKey === "ai_engineer" || profileKey === "applied_ai")) {
    source = IRISH_AI_BULLETS_AI;
  } else if (isTwoBlokes) {
    source = TWO_BLOKES_BULLETS;
  } else {
    const fromResume = exp.resumeBullets.filter((b) => {
      if (!b.profiles || !b.profiles.length || b.profiles.includes("*")) return true;
      return b.profiles.includes(profileKey);
    });
    source = fromResume.length
      ? fromResume
      : exp.bullets.map((text) => ({ text, evidenceIds }));
  }

  const deduped = selectNonRepetitiveBullets(companyBlurb, source, max);

  return deduped.map((b) => ({
    text: sanitizeBullet(b.text),
    evidenceIds: (b.evidenceIds?.length ? b.evidenceIds : evidenceIds) as string[],
    claimType: "verified" as const,
    confidence: 0.88,
    numericClaims: b.text.match(/\b\d+(\.\d+)?%?\b/g) ?? [],
    sourceSection: "experience",
  }));
}

export function composeExperience(opts: {
  inventory: CareerInventory;
  ranked: RankedExperience[];
  profileKey: string;
  pageLength: 1 | 2;
}): ExperienceResumeEntry[] {
  const entryCount = opts.ranked.length;
  return opts.ranked.map((r) => {
    const title = resolveExperienceTitle(r.experience, opts.profileKey);
    let companyBlurb = businessBlurbFor(r.experience.company, title.companyBlurb);

    if (
      opts.pageLength === 2 &&
      (opts.profileKey === "ai_engineer" || opts.profileKey === "applied_ai") &&
      !/irish ai creative|two blokes/i.test(r.experience.company)
    ) {
      // Keep Arcop/Independent denser on 2-page AI resumes — still allow short business line
      if (/arcop|independent/i.test(r.experience.company)) {
        companyBlurb = businessBlurbFor(r.experience.company, undefined);
      }
    }

    const bullets = pickExperienceBullets(
      r,
      opts.profileKey,
      opts.pageLength,
      entryCount,
      companyBlurb,
    );

    return {
      dates: formatExperienceDates(r.experience),
      title: title.title,
      company: title.company,
      location: r.experience.location ?? undefined,
      companyBlurb,
      functionalFocus: undefined,
      bullets,
      evidenceIds: [...new Set(bullets.flatMap((b) => b.evidenceIds))],
      experienceId: r.experience.id,
    };
  });
}

export function composeEducation(
  _inventory: CareerInventory,
  opts?: { compress?: boolean },
) {
  const compress = opts?.compress ?? false;
  return [
    {
      dates: LOCKED_RESUME_DATES.edu_msc,
      line: "MSc in Creative Digital Media and UX, Technological University Dublin, Dublin",
      details: compress
        ? undefined
        : [
            "Authoring Principles · Design Practice · VR & AR Applications · Information Modelling",
            "Production & Prototyping · User Interaction Design · Major Project & Report",
          ],
    },
    {
      dates: LOCKED_RESUME_DATES.edu_iit,
      line: "Executive PG in UI/UX, Indian Institute of Technology Roorkee, India",
    },
    {
      dates: LOCKED_RESUME_DATES.edu_barch,
      line: "Bachelor of Architecture, Manipal School of Architecture and Planning, Manipal, India",
    },
  ];
}
