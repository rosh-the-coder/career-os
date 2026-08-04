/**
 * Resume Intelligence Engine — orchestrator.
 * Profile → Evidence → Intelligence → Strategy → Generation inputs → Lint → Score
 */

import type { CareerInventory } from "@/lib/resume/v3/load-career-profile";
import { buildIntelligenceFromInventory } from "./build-intelligence";
import { selectBulletsForMode } from "./bullet-quality";
import { lintResumeIntelligence, resolveStrategy, scoreAtsIntelligence } from "./lint-and-score";
import type {
  ExperienceIntelligence,
  ProjectIntelligence,
  ResumeIntelligenceBundle,
  ResumeStrategyMode,
} from "./types";

export * from "./types";
export * from "./engineering-signals";
export * from "./bullet-quality";
export * from "./build-intelligence";
export * from "./lint-and-score";
export * from "./story-bullets";

export function runResumeIntelligence(opts: {
  inventory: CareerInventory;
  profileKey: string;
  jobCorpus: string;
  mode?: ResumeStrategyMode;
  selectedExperienceIds?: string[];
  selectedProjectKeys?: string[];
}): ResumeIntelligenceBundle {
  const strategy = resolveStrategy(opts.profileKey, opts.mode);
  const built = buildIntelligenceFromInventory(opts.inventory, opts.profileKey, strategy.mode);

  let experiences = built.experiences;
  let projects = built.projects;

  if (opts.selectedExperienceIds?.length) {
    const set = new Set(opts.selectedExperienceIds);
    experiences = experiences.filter((e) => set.has(e.id));
  }
  if (opts.selectedProjectKeys?.length) {
    const set = new Set(opts.selectedProjectKeys);
    projects = projects.filter((p) => set.has(p.projectKey));
  }

  // Apply strategy bullet selection (mutates copies)
  experiences = experiences.map((e) => ({
    ...e,
    candidateBullets: selectBulletsForMode(e.candidateBullets, strategy.mode, strategy.maxBulletsPerEntry),
  }));
  projects = projects.map((p) => ({
    ...p,
    candidateBullets: selectBulletsForMode(p.candidateBullets, strategy.mode, Math.min(5, strategy.maxBulletsPerEntry)),
  }));

  const lint = lintResumeIntelligence({ experiences, projects });
  const atsScore = scoreAtsIntelligence({
    experiences,
    projects,
    jobCorpus: opts.jobCorpus,
    profileKey: opts.profileKey,
  });

  const humanReviewRequired =
    lint.some((w) => w.code === "missing_story" && w.severity === "warning") ||
    lint.some((w) => w.severity === "error") ||
    (built.suggestions?.length ?? 0) > 0;

  return {
    strategy,
    experiences,
    projects,
    lint,
    atsScore,
    bulletSuggestions: (built.suggestions ?? []) as ResumeIntelligenceBundle["bulletSuggestions"],
    humanReviewRequired,
  };
}

/** Map intelligence bullets onto V3 claim shape for existing composers */
export function intelligenceBulletsToClaims(
  entry: ExperienceIntelligence | ProjectIntelligence,
  sourceSection: string,
) {
  return entry.candidateBullets.map((b) => ({
    text: b.text,
    evidenceIds: b.evidenceIds,
    claimType: "verified" as const,
    confidence: Math.min(0.95, 0.7 + b.engineeringScore * 0.25),
    numericClaims: b.metricTexts,
    sourceSection,
    // intelligence metadata for review UI (stripped by exporters that only read text)
    _intelligence: {
      quality: b.quality,
      engineeringScore: b.engineeringScore,
      audiences: b.audiences,
    },
  }));
}
