import type { CareerInventory, LoadedProject } from "./load-career-profile";
import { formatProjectDates } from "./rank-projects";
import { curatedBulletsForProject } from "@/lib/resume-intelligence/story-bullets";
import type { ProjectResumeEntry, RankedProject, ResumeClaim, ResumeLink } from "./types";

function sanitizeBullet(text: string): string {
  return text
    .replace(/\s*without inventing unverified metrics\.?/gi, ".")
    .replace(/\s*via layoff\.?/gi, ".")
    .replace(/\s*ended 17 Jul 2026 via layoff\.?/gi, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/\.\s*\./g, ".")
    .trim();
}

function pickBullets(
  project: LoadedProject,
  profileKey: string,
  pageLength: 1 | 2,
): ResumeClaim[] {
  const max = pageLength === 1 ? 3 : 3;

  const curated = curatedBulletsForProject(project.key, profileKey);
  const candidates: { text: string; profiles?: string[]; evidenceIds?: string[] }[] =
    curated.length
      ? curated
      : project.resumeBullets.length
        ? project.resumeBullets
        : project.outcomes.slice(0, 3).map((text) => ({
            text,
            evidenceIds: project.evidence.map((e) => e.id),
          }));

  const filtered = candidates.filter((b) => {
    if (!b.profiles || b.profiles.length === 0 || b.profiles.includes("*")) return true;
    return b.profiles.includes(profileKey);
  });

  const evidenceFallback = project.evidence.map((e) => e.id);

  return filtered.slice(0, max).map((b) => ({
    text: sanitizeBullet(b.text),
    evidenceIds: b.evidenceIds?.length ? b.evidenceIds : evidenceFallback,
    claimType: "verified" as const,
    confidence: 0.9,
    numericClaims: (b.text.match(/\b\d+(\.\d+)?%?\b/g) ?? []) as string[],
    sourceSection: "selectedProjects",
  }));
}

function projectLinks(p: LoadedProject): ResumeLink[] {
  const links: ResumeLink[] = [];
  if (p.projectUrl) links.push({ label: "Project", url: p.projectUrl });
  if (p.githubUrl) links.push({ label: "GitHub", url: p.githubUrl });
  if (p.caseStudyUrl) links.push({ label: "Case study", url: p.caseStudyUrl });
  if (p.demoUrl) links.push({ label: "Demo", url: p.demoUrl });
  return links;
}

function technologiesFor(p: LoadedProject): string[] {
  if (p.key === "aethelgard") {
    return ["Python", "REST APIs", "LLM APIs", "Etsy Open API", "CSV/XLSX processing"];
  }
  if (p.key === "careeros") {
    return ["Next.js", "TypeScript", "Prisma", "Supabase", "DOCX/PDF"];
  }
  if (p.key === "redvelvetvault") {
    return ["React", "TypeScript", "Firebase", "Unity", "C#", "WebGL"];
  }
  return p.stack.slice(0, 8);
}

export function composeProjects(opts: {
  inventory: CareerInventory;
  ranked: RankedProject[];
  profileKey: string;
  pageLength: 1 | 2;
}): ProjectResumeEntry[] {
  const byKey = new Map(opts.inventory.projects.map((p) => [p.key, p]));

  return opts.ranked.map((r) => {
    const p = byKey.get(r.projectKey);
    if (!p) {
      return {
        name: r.name,
        dates: "",
        bullets: [],
        evidenceIds: [],
        relevanceScore: r.score,
        projectKey: r.projectKey,
      };
    }

    // For AI Engineer, frame RVV as product/web engineering — not AI/NLP
    let role = p.roleVariants[opts.profileKey] || p.primaryRole;
    if (p.key === "redvelvetvault" && (opts.profileKey === "ai_engineer" || opts.profileKey === "applied_ai")) {
      role = "Product Design Engineer";
    }

    const bullets = pickBullets(p, opts.profileKey, opts.pageLength);

    return {
      name: p.name,
      dates: formatProjectDates(p),
      role,
      oneLineSummary: p.shortSummary ?? undefined,
      bullets,
      technologies: technologiesFor(p),
      links: projectLinks(p),
      evidenceIds: [...new Set(bullets.flatMap((b) => b.evidenceIds))],
      relevanceScore: r.score,
      projectKey: p.key,
    };
  });
}
