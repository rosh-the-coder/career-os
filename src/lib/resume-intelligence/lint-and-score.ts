/**
 * Resume linter + ATS intelligence scoring.
 */

import type {
  AtsIntelligenceScore,
  ExperienceIntelligence,
  ProjectIntelligence,
  ResumeLintWarning,
  ResumeStrategy,
  ResumeStrategyMode,
} from "./types";

export function resolveStrategy(profileKey: string, mode?: ResumeStrategyMode): ResumeStrategy {
  const resolved: ResumeStrategyMode =
    mode ??
    (profileKey === "ai_engineer" ||
    profileKey === "applied_ai" ||
    profileKey === "design_engineer" ||
    profileKey === "frontend_engineer" ||
    profileKey === "product_engineer"
      ? "technical"
      : profileKey.includes("executive") || profileKey === "product_designer"
        ? "executive"
        : "ats");

  return {
    mode: resolved,
    profileKey,
    prioritizeSignals:
      resolved === "technical"
        ? ["pipelines", "ai_orchestration", "human_approval", "background_jobs", "rest_apis", "batch_processing"]
        : resolved === "executive"
          ? ["product_ownership", "automation", "integrations"]
          : ["rest_apis", "frontend_systems", "automation"],
    maxBulletsPerEntry: resolved === "executive" ? 3 : 5,
    emphasizeMetrics: resolved !== "ats",
    emphasizeArchitecture: resolved === "technical",
  };
}

export function lintResumeIntelligence(opts: {
  experiences: ExperienceIntelligence[];
  projects: ProjectIntelligence[];
}): ResumeLintWarning[] {
  const warnings: ResumeLintWarning[] = [];
  const verbs: string[] = [];
  const allBullets: string[] = [];

  for (const e of opts.experiences) {
    for (const b of e.candidateBullets) {
      allBullets.push(b.text);
      verbs.push(b.verb.toLowerCase());
      if (b.quality === "rejected") {
        warnings.push({
          code: "weak_bullet",
          severity: "warning",
          message: `Weak experience bullet at ${e.company}: ${b.rejectReasons.join(", ")}`,
          section: "experience",
          suggestion: b.text,
        });
      }
      if (b.text.split(/\s+/).length > 42) {
        warnings.push({
          code: "bullet_length",
          severity: "info",
          message: `Long bullet at ${e.company} (${b.text.split(/\s+/).length} words)`,
          section: "experience",
        });
      }
    }
    for (const field of e.missingStoryFields) {
      warnings.push({
        code: "missing_story",
        severity: "info",
        message: `${e.company} missing story field: ${field}`,
        section: "experience",
      });
    }
  }

  for (const p of opts.projects) {
    for (const b of p.candidateBullets) {
      allBullets.push(b.text);
      verbs.push(b.verb.toLowerCase());
      if (b.quality === "rejected") {
        warnings.push({
          code: "weak_bullet",
          severity: "warning",
          message: `Weak project bullet on ${p.name}: ${b.rejectReasons.join(", ")}`,
          section: "projects",
        });
      }
    }
    if (p.oneSentenceSummary.split(/\s+/).length > 28) {
      warnings.push({
        code: "summary_length",
        severity: "info",
        message: `${p.name} summary exceeds ~25 words`,
        section: "projects",
      });
    }
    for (const field of p.missingStoryFields) {
      warnings.push({
        code: "missing_story",
        severity: "warning",
        message: `${p.name} missing story field: ${field} — flag for human review`,
        section: "projects",
      });
    }
  }

  // Repeated verbs
  const verbCounts = new Map<string, number>();
  for (const v of verbs) verbCounts.set(v, (verbCounts.get(v) ?? 0) + 1);
  for (const [v, n] of verbCounts) {
    if (n >= 4) {
      warnings.push({
        code: "repeated_verb",
        severity: "info",
        message: `Verb "${v}" used ${n} times — vary openings`,
      });
    }
  }

  // Near-duplicate bullets
  for (let i = 0; i < allBullets.length; i++) {
    for (let j = i + 1; j < allBullets.length; j++) {
      const a = allBullets[i]!.toLowerCase();
      const b = allBullets[j]!.toLowerCase();
      if (a === b) {
        warnings.push({
          code: "duplicate_bullet",
          severity: "error",
          message: "Duplicate bullet detected",
        });
      }
    }
  }

  return warnings;
}

export function scoreAtsIntelligence(opts: {
  experiences: ExperienceIntelligence[];
  projects: ProjectIntelligence[];
  jobCorpus: string;
  profileKey: string;
}): AtsIntelligenceScore {
  const corpus = opts.jobCorpus.toLowerCase();
  const allBullets = [
    ...opts.experiences.flatMap((e) => e.candidateBullets),
    ...opts.projects.flatMap((p) => p.candidateBullets),
  ];
  const strong = allBullets.filter((b) => b.quality === "strong" || b.quality === "acceptable");
  const engAvg =
    [...opts.experiences, ...opts.projects].reduce((s, x) => s + x.engineeringScore, 0) /
    Math.max(1, opts.experiences.length + opts.projects.length);
  const impactAvg =
    [...opts.experiences, ...opts.projects].reduce((s, x) => s + x.businessImpactScore, 0) /
    Math.max(1, opts.experiences.length + opts.projects.length);
  const confAvg =
    [...opts.experiences, ...opts.projects].reduce((s, x) => s + x.confidence, 0) /
    Math.max(1, opts.experiences.length + opts.projects.length);

  const keywordHits = allBullets.flatMap((b) => b.atsKeywords).filter((k) => corpus.includes(k.toLowerCase()));
  const keywordCoverage = Math.min(10, 4 + keywordHits.length);

  const bulletQuality = Math.min(10, Math.round((strong.length / Math.max(1, allBullets.length)) * 10));
  const technicalDepth = Math.round(engAvg * 10);
  const engineeringSignal = Math.round(engAvg * 10);
  const businessImpact = Math.round(impactAvg * 10);
  const evidenceConfidence = Math.round(confAvg * 10);
  const productThinking = opts.projects.some((p) => p.engineeringSignals.includes("product_ownership")) ? 8 : 6;
  const leadership = /stakeholder|non-technical|translated|ownership/i.test(
    allBullets.map((b) => b.text).join(" "),
  )
    ? 7
    : 5;
  const roleAlignment = /ai_engineer|applied_ai/.test(opts.profileKey)
    ? opts.projects.some((p) => /aethelgard|careeros/i.test(p.projectKey))
      ? 9
      : 6
    : 7;
  const readability = strong.every((b) => b.text.split(/\s+/).length <= 40) ? 8 : 6;

  const dimensions = {
    keywordCoverage,
    roleAlignment,
    technicalDepth,
    leadership,
    productThinking,
    engineeringSignal,
    businessImpact,
    evidenceConfidence,
    readability,
    bulletQuality,
  };

  const total = Math.round(
    (Object.values(dimensions).reduce((a, b) => a + b, 0) / (Object.keys(dimensions).length * 10)) * 100,
  );

  const explanation: string[] = [];
  explanation.push(`Engineering signal average ${(engAvg * 100).toFixed(0)}% across selected entries.`);
  explanation.push(`${strong.length}/${allBullets.length} bullets meet quality bar.`);
  if (impactAvg < 0.4) explanation.push("Limited quantified business impact in evidence — do not fabricate metrics.");
  if (engAvg >= 0.5) explanation.push("Strong systems language detected (pipelines, APIs, orchestration, approval).");

  const improvements: string[] = [];
  if (bulletQuality < 7) improvements.push("Rewrite weak openers; prefer Designed/Engineered/Integrated.");
  if (businessImpact < 6) improvements.push("Surface approved metrics where evidence exists.");
  if (keywordCoverage < 6) improvements.push("Increase natural JD keyword overlap without stuffing.");

  return { total, dimensions, explanation, improvements };
}
