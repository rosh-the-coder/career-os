/**
 * Resume Intelligence Engine — signals, bullet quality, impressiveness ranking.
 */
import { describe, expect, it } from "vitest";
import {
  compareEngineeringImpressiveness,
  detectEngineeringSignals,
  evaluateBullet,
  BANNED_OPENERS,
  selectBulletsForMode,
  lintResumeIntelligence,
  scoreAtsIntelligence,
  resolveStrategy,
} from "@/lib/resume-intelligence";
import type { ExperienceIntelligence, ProjectIntelligence } from "@/lib/resume-intelligence";

describe("engineering signal impressiveness", () => {
  it("ranks pipeline systems above a React page", () => {
    const weak = "Built a React page.";
    const strong =
      "Designed an event-driven workflow with background jobs, human approval, state synchronization, and REST API orchestration.";
    expect(compareEngineeringImpressiveness(weak, strong)).toBeGreaterThan(0);
    expect(detectEngineeringSignals(strong).score).toBeGreaterThan(detectEngineeringSignals(weak).score);
    expect(detectEngineeringSignals(strong).signals).toEqual(
      expect.arrayContaining(["background_jobs", "human_approval", "rest_apis"]),
    );
  });
});

describe("bullet quality", () => {
  it("rejects banned weak openers", () => {
    for (const opener of ["Helped", "Worked on", "Responsible for", "Created", "Made"]) {
      const b = evaluateBullet(`${opener} the dashboard with React.`);
      expect(BANNED_OPENERS.some((p) => p.test(b.text))).toBe(true);
      expect(["weak", "rejected"]).toContain(b.quality);
    }
  });

  it("scores strong story bullets highly", () => {
    const b = evaluateBullet(
      "Designed a queue-based production pipeline that validated spreadsheet uploads, orchestrated background generation jobs through REST APIs and staged Etsy drafts for human approval.",
    );
    expect(b.quality).toBe("strong");
    expect(b.audiences.hiringManager).toBe(true);
    expect(b.engineeringScore).toBeGreaterThan(0.4);
  });

  it("technical mode prefers engineering depth", () => {
    const bullets = [
      evaluateBullet("Delivered stakeholder updates across the product roadmap."),
      evaluateBullet(
        "Engineered a queue-based production pipeline with background jobs, REST APIs and human approval gates.",
      ),
    ];
    const selected = selectBulletsForMode(bullets, "technical", 1);
    expect(selected[0]?.text).toMatch(/queue-based/i);
  });
});

describe("strategy + lint + ATS score", () => {
  it("defaults AI Engineer to technical mode", () => {
    expect(resolveStrategy("ai_engineer").mode).toBe("technical");
  });

  it("lints missing story and scores ATS dimensions", () => {
    const experiences: ExperienceIntelligence[] = [
      {
        id: "e1",
        company: "Irish AI",
        role: "AI Engineer",
        timeline: "Mar 2026 – Jul 2026",
        oneSentenceSummary: "AI-assisted production workflows.",
        engineering: ["pipelines"],
        impact: [],
        technology: ["Python"],
        confidence: 0.8,
        evidenceIds: ["ev1"],
        engineeringSignals: ["pipelines", "automation"],
        engineeringScore: 0.7,
        businessImpactScore: 0.4,
        missingStoryFields: ["problem"],
        candidateBullets: [
          evaluateBullet(
            "Designed AI-assisted production workflows that automated repetitive creative steps under stakeholder review.",
          ),
        ],
      },
    ];
    const projects: ProjectIntelligence[] = [
      {
        id: "p1",
        projectKey: "aethelgard",
        name: "Aethelgard",
        timeline: "2025",
        oneSentenceSummary: "AI-assisted production platform for Etsy workflows.",
        engineering: ["pipelines", "human approval"],
        impact: [],
        technology: ["Python"],
        confidence: 0.9,
        evidenceIds: ["ev2"],
        engineeringSignals: ["pipelines", "human_approval", "background_jobs"],
        engineeringScore: 0.85,
        businessImpactScore: 0.5,
        missingStoryFields: [],
        candidateBullets: [
          evaluateBullet(
            "Designed a queue-based production pipeline that validated spreadsheet uploads and staged drafts for human approval.",
          ),
        ],
      },
    ];

    const lint = lintResumeIntelligence({ experiences, projects });
    expect(lint.some((w) => w.code === "missing_story")).toBe(true);

    const score = scoreAtsIntelligence({
      experiences,
      projects,
      jobCorpus: "ai engineer python rest api pipeline legal innovation",
      profileKey: "ai_engineer",
    });
    expect(score.total).toBeGreaterThan(50);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.dimensions.engineeringSignal).toBeGreaterThan(5);
    expect(score.explanation.length).toBeGreaterThan(0);
  });
});
