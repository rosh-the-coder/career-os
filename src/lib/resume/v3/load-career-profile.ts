/**
 * Load canonical career inventory for Resume Engine V3.
 */

import { prisma } from "@/lib/db/prisma";
import { parseJsonArray, parseJsonObject } from "@/lib/utils";

type ResumeBullet = { text: string; profiles?: string[]; evidenceIds?: string[] };

/** Imported onboarding may store plain strings; Studio stores { text, profiles }. */
function normalizeResumeBullets(json: string | null | undefined): ResumeBullet[] {
  const raw = parseJsonArray<unknown>(json ?? "[]");
  return raw
    .map((item): ResumeBullet | null => {
      if (typeof item === "string") {
        const text = item.trim();
        return text ? { text, profiles: ["*"] } : null;
      }
      if (item && typeof item === "object" && "text" in item) {
        const text = String((item as ResumeBullet).text ?? "").trim();
        if (!text) return null;
        return {
          text,
          profiles: (item as ResumeBullet).profiles,
          evidenceIds: (item as ResumeBullet).evidenceIds,
        };
      }
      return null;
    })
    .filter(Boolean) as ResumeBullet[];
}

export interface LoadedMetric {
  id: string;
  label: string;
  value: number | null;
  valueText: string | null;
  unit: string;
  approvedForCV: boolean;
  isEstimate: boolean;
  needsReview: boolean;
}

export interface LoadedEvidence {
  id: string;
  type: string;
  title: string;
  description: string;
  source: string;
  verified: boolean;
  confidence: string;
  allowedProfiles: string[];
  keywords: string[];
  prohibitedClaims: string[];
  notes: string | null;
  isEstimate: boolean;
  needsReview: boolean;
  experienceId: string | null;
  projectId: string | null;
  metrics: LoadedMetric[];
}

export interface LoadedProject {
  id: string;
  key: string;
  name: string;
  type: string;
  status: string;
  primaryRole: string;
  stack: string[];
  features: string[];
  outcomes: string[];
  useAsEvidenceFor: string[];
  constraints: string[];
  verified: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  shortSummary: string | null;
  problemStatement: string | null;
  solutionSummary: string | null;
  technicalSummary: string | null;
  resumeBullets: { text: string; profiles?: string[]; evidenceIds?: string[] }[];
  roleVariants: Record<string, string>;
  keywords: string[];
  projectUrl: string | null;
  githubUrl: string | null;
  caseStudyUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  cvPriority: number;
  approvedForCV: boolean;
  evidence: LoadedEvidence[];
}

export interface LoadedExperience {
  id: string;
  company: string;
  umbrellaTitle: string;
  officialTitle: string | null;
  /** Multiple employer-supplied official titles; user picks one via selectedOfficialTitle. */
  titleOptions?: string[];
  selectedOfficialTitle?: string | null;
  /** One truthful parenthetical descriptor — only used when titleDescriptorApproved. */
  approvedTitleDescriptor?: string | null;
  titleDescriptorApproved?: boolean;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  alternativeTitles: Record<string, string>;
  themes: string[];
  bullets: string[];
  resumeBullets: { text: string; profiles?: string[]; evidenceIds?: string[] }[];
  companyContext: string | null;
  verified: boolean;
  approvedForCV: boolean;
  sortOrder: number;
  chronologyIndex: number;
  relevanceScore: number;
  preferredOrderByRole: Record<string, number>;
  evidence: LoadedEvidence[];
}

export interface LoadedSkill {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  verified: boolean;
  approvedForCV: boolean;
  profiles: string[];
  evidenceIds: string[];
}

export interface LoadedProfile {
  id: string;
  key: string;
  name: string;
  positioning: string;
  keywords: string[];
  evidenceOrder: string[];
  isDefault: boolean;
}

export interface LoadedSettings {
  location: string;
  phone: string;
  contactEmail: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface CareerInventory {
  userId: string;
  isOperator: boolean;
  name: string;
  settings: LoadedSettings;
  profiles: LoadedProfile[];
  projects: LoadedProject[];
  experiences: LoadedExperience[];
  skills: LoadedSkill[];
  evidence: LoadedEvidence[];
}

function mapEvidence(e: {
  id: string;
  type: string;
  title: string;
  description: string;
  source: string;
  verified: boolean;
  confidence: string;
  allowedProfilesJson: string;
  keywordsJson: string;
  prohibitedClaimsJson: string;
  notes: string | null;
  isEstimate: boolean;
  needsReview: boolean;
  experienceId: string | null;
  projectId: string | null;
  metrics: {
    id: string;
    label: string;
    value: number | null;
    valueText: string | null;
    unit: string;
    approvedForCV: boolean;
    isEstimate: boolean;
    needsReview: boolean;
  }[];
}): LoadedEvidence {
  return {
    id: e.id,
    type: e.type,
    title: e.title,
    description: e.description,
    source: e.source,
    verified: e.verified,
    confidence: e.confidence,
    allowedProfiles: parseJsonArray<string>(e.allowedProfilesJson),
    keywords: parseJsonArray<string>(e.keywordsJson),
    prohibitedClaims: parseJsonArray<string>(e.prohibitedClaimsJson),
    notes: e.notes,
    isEstimate: e.isEstimate,
    needsReview: e.needsReview,
    experienceId: e.experienceId,
    projectId: e.projectId,
    metrics: e.metrics.map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      valueText: m.valueText,
      unit: m.unit,
      approvedForCV: m.approvedForCV,
      isEstimate: m.isEstimate,
      needsReview: m.needsReview,
    })),
  };
}

export async function loadCareerInventory(userId: string): Promise<CareerInventory> {
  if (!userId) {
    throw new Error("loadCareerInventory requires userId — never load a random workspace");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      settings: true,
      careerProfiles: true,
      projects: { include: { evidenceItems: { include: { metrics: true } } }, orderBy: { sortOrder: "asc" } },
      experiences: { include: { evidenceItems: { include: { metrics: true } } }, orderBy: { sortOrder: "asc" } },
      skills: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      evidenceItems: { include: { metrics: true } },
    },
  });

  if (!user.settings) throw new Error("Missing settings for career inventory");

  const evidence = user.evidenceItems.map(mapEvidence);

  return {
    userId: user.id,
    isOperator: user.isOperator,
    name: user.name,
    settings: {
      location: user.settings.location,
      phone: user.settings.phone,
      contactEmail: user.settings.contactEmail || user.email,
      portfolioUrl: user.settings.portfolioUrl,
      githubUrl: user.settings.githubUrl,
      linkedinUrl: user.settings.linkedinUrl,
    },
    profiles: user.careerProfiles.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      positioning: p.positioning,
      keywords: parseJsonArray<string>(p.keywordsJson),
      evidenceOrder: parseJsonArray<string>(p.evidenceOrderJson),
      isDefault: p.isDefault,
    })),
    projects: user.projects.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      type: p.type,
      status: p.status,
      primaryRole: p.primaryRole,
      stack: parseJsonArray<string>(p.stackJson),
      features: parseJsonArray<string>(p.featuresJson),
      outcomes: parseJsonArray<string>(p.outcomesJson),
      useAsEvidenceFor: parseJsonArray<string>(p.useAsEvidenceForJson),
      constraints: parseJsonArray<string>(p.constraintsJson),
      verified: p.verified,
      sortOrder: p.sortOrder,
      startDate: p.startDate,
      endDate: p.endDate,
      isCurrent: p.isCurrent,
      shortSummary: p.shortSummary,
      problemStatement: p.problemStatement,
      solutionSummary: p.solutionSummary,
      technicalSummary: p.technicalSummary,
      resumeBullets: normalizeResumeBullets(p.resumeBulletsJson),
      roleVariants: parseJsonObject<Record<string, string>>(p.roleVariantsJson),
      keywords: parseJsonArray<string>(p.keywordsJson),
      projectUrl: p.projectUrl,
      githubUrl: p.githubUrl,
      caseStudyUrl: p.caseStudyUrl,
      demoUrl: p.demoUrl,
      featured: p.featured,
      cvPriority: p.cvPriority,
      approvedForCV: p.approvedForCV,
      evidence: p.evidenceItems.map(mapEvidence),
    })),
    experiences: user.experiences.map((e) => ({
      id: e.id,
      company: e.company,
      umbrellaTitle: e.umbrellaTitle,
      officialTitle: e.officialTitle,
      titleOptions: parseJsonArray<string>(e.titleOptionsJson),
      selectedOfficialTitle: e.selectedOfficialTitle,
      approvedTitleDescriptor: e.approvedTitleDescriptor,
      titleDescriptorApproved: e.titleDescriptorApproved,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      alternativeTitles: parseJsonObject<Record<string, string>>(e.alternativeTitlesJson),
      themes: parseJsonArray<string>(e.themesJson),
      bullets: parseJsonArray<string>(e.bulletsJson),
      resumeBullets: normalizeResumeBullets(e.resumeBulletsJson),
      companyContext: e.companyContext,
      verified: e.verified,
      approvedForCV: e.approvedForCV,
      sortOrder: e.sortOrder,
      chronologyIndex: e.chronologyIndex ?? e.sortOrder,
      relevanceScore: e.relevanceScore ?? 0,
      preferredOrderByRole: parseJsonObject<Record<string, number>>(e.preferredOrderByRoleJson ?? "{}"),
      evidence: e.evidenceItems.map(mapEvidence),
    })),
    skills: user.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      keywords: parseJsonArray<string>(s.keywordsJson),
      verified: s.verified,
      approvedForCV: s.approvedForCV,
      profiles: parseJsonArray<string>(s.profilesJson),
      evidenceIds: parseJsonArray<string>(s.evidenceIdsJson),
    })),
    evidence,
  };
}

/** Flat text corpus for claim validation (excludes generated CV). */
export function buildEvidenceCorpus(inventory: CareerInventory): string[] {
  const texts: string[] = [];
  for (const e of inventory.evidence) {
    texts.push(`${e.title}\n${e.description}`);
    for (const m of e.metrics) {
      if (m.approvedForCV && !m.needsReview) {
        texts.push(`${m.label} ${m.valueText ?? m.value ?? ""} ${m.unit}`);
      }
    }
  }
  for (const p of inventory.projects) {
    texts.push(
      [p.name, p.shortSummary, p.solutionSummary, p.technicalSummary, ...p.stack, ...p.outcomes, ...p.features]
        .filter(Boolean)
        .join("\n"),
    );
    for (const b of p.resumeBullets) texts.push(b.text);
  }
  for (const exp of inventory.experiences) {
    texts.push([exp.company, exp.umbrellaTitle, exp.companyContext, ...exp.themes, ...exp.bullets].filter(Boolean).join("\n"));
    for (const b of exp.resumeBullets) texts.push(b.text);
  }
  return texts.filter(Boolean);
}
