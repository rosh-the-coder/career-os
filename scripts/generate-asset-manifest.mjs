import fs from "fs";

const screens = [
  { id: "01-dashboard-overview", file: "01-dashboard-overview.webp", sections: ["§36"], route: "/dashboard", state: "seeded demo: scored + rejected + materials-ready", caption: "CareerOS operational dashboard", annotations: ["pipeline counts", "Discover CTA", "priority jobs"] },
  { id: "02-jobs-ranked-list", file: "02-jobs-ranked-list.webp", sections: ["§36", "act6-jobs"], route: "/jobs", state: "mixed scored/rejected", caption: "Ranked and rejected listings", annotations: ["score", "status", "profile"] },
  { id: "03-job-import", file: "03-job-import.webp", sections: ["act6-import"], route: "/jobs/new", state: "empty form", caption: "Controlled job ingestion", annotations: ["paste", "URL"] },
  { id: "04-job-score-breakdown", file: "04-job-score-breakdown.webp", sections: ["§38"], route: "/jobs/[scored-id]", state: "North Harbor Labs scored 78", caption: "Explainable multi-factor fit", annotations: ["1 score total", "2 dimension cards", "3 strengths/gaps"] },
  { id: "05-hard-reject", file: "05-hard-reject.webp", sections: ["§39"], route: "/jobs/[rejected-id]", state: "principal CAD reject", caption: "Deterministic eligibility gate", annotations: ["reject banner", "reason"] },
  { id: "06-eligibility-soft-flags", file: "06-eligibility-soft-flags.webp", sections: ["§38", "§06-product"], route: "/jobs/[scored-id]", state: "no_sponsorship soft flag", caption: "Soft flags for human review", annotations: ["soft flag chip"] },
  { id: "07-approve-queue", file: "07-approve-queue.webp", sections: ["§37"], route: "/approve", state: "scored queue", caption: "Human triage before materials", annotations: ["queue", "prepare packs"] },
  { id: "08-profile-recommendation", file: "08-profile-recommendation.webp", sections: ["act6-profile"], route: "/jobs/[scored-id]", state: "UX Engineer profile pick", caption: "Role profile recommendation", annotations: ["recommended profile"] },
  { id: "09-project-recommendation", file: "09-project-recommendation.webp", sections: ["act6-projects"], route: "/jobs/[materials-id]", state: "recommended projects", caption: "Project recommendation for packs", annotations: ["project list"] },
  { id: "10-resume-studio-overview", file: "10-resume-studio-overview.webp", sections: ["§40"], route: "/resume-studio", state: "versions present", caption: "Resume Studio review surface", annotations: ["validation", "downloads", "composition"] },
  { id: "11-resume-validation", file: "11-resume-validation.webp", sections: ["§40", "§47"], route: "/resume-studio", state: "warning validation", caption: "Claim validation warnings", annotations: ["warning badge", "warning list"] },
  { id: "12-resume-keyword-fit", file: "12-resume-keyword-fit.webp", sections: ["act6-ats"], route: "/jobs/[materials-id]", state: "optimizeJson present", caption: "ATS keyword fit tooling", annotations: ["coverage", "suggest", "apply gated"] },
  { id: "13-resume-version-lineage", file: "13-resume-version-lineage.webp", sections: ["§40", "act7-lineage"], route: "/resume-studio", state: "parent/child", caption: "Append-only resume lineage", annotations: ["parent", "child"] },
  { id: "14-generated-resume-preview", file: "14-generated-resume-preview.webp", sections: ["§41"], route: "export preview", state: "redacted demo CV", caption: "Generated resume artifact", annotations: ["contact redacted", "projects"] },
  { id: "15-applications-tracker", file: "15-applications-tracker.webp", sections: ["§42"], route: "/applications", state: "demo rows no PII", caption: "Applications tracker", annotations: ["status tags", "next actions"] },
  { id: "16-settings-constraints", file: "16-settings-constraints.webp", sections: ["act6-settings"], route: "/settings", state: "demo contacts", caption: "Constraint surface", annotations: ["salary floor", "video toggle", "batch target"] },
  { id: "17-provider-fallback-state", file: "17-provider-fallback-state.webp", sections: ["§33", "§17-screen"], route: "/jobs/[fallback-id]", state: "llm_rate_limit flag", caption: "Graceful LLM degradation", annotations: ["soft flag", "modelVersion"] },
  { id: "18-empty-state", file: "18-empty-state.webp", sections: ["§10-empty"], route: "/resume-studio", state: "no versions (optional)", caption: "Empty Studio state", annotations: ["empty"] },
  { id: "19-mobile-dashboard", file: "19-mobile-dashboard.webp", sections: ["§36-mobile"], route: "/dashboard", state: "390x844", caption: "Mobile dashboard", annotations: [], viewport: "390x844" },
  { id: "20-mobile-job-detail", file: "20-mobile-job-detail.webp", sections: ["§38-mobile"], route: "/jobs/[scored-id]", state: "390x844", caption: "Mobile job detail", annotations: [], viewport: "390x844" },
];

const animations = [
  ["title-breath", "title-breath.svg", ["§00"]],
  ["antipromise", "antipromise.svg", ["§01"]],
  ["rejection-timeline", "rejection-timeline.svg", ["§03"]],
  ["tab-avalanche", "tab-avalanche.svg", ["§04"]],
  ["tool-rain", "tool-rain.svg", ["§05"]],
  ["wrong-room", "wrong-room.svg", ["§06"]],
  ["eligibility-fog", "eligibility-fog.svg", ["§07"]],
  ["daily-loop", "daily-loop.svg", ["§10"]],
  ["time-bar", "time-bar.svg", ["§11", "§12"]],
  ["twenty-percent", "twenty-percent.svg", ["§12"]],
  ["ecosystem-orbit", "ecosystem-orbit.svg", ["§16", "§17", "§18"]],
  ["pipeline-flythrough", "pipeline-flythrough.svg", ["§29"]],
  ["nested-rings", "nested-rings.svg", ["§30"]],
  ["scoring-constellation", "scoring-constellation.svg", ["§31"]],
  ["evidence-scan", "evidence-scan.svg", ["§32"]],
  ["provider-relay", "provider-relay.svg", ["§33"]],
  ["anti-chart", "anti-chart.svg", ["§55"]],
];

const diagrams = [
  "fragmented-workflow", "daily-job-search-loop", "tool-ecosystem", "human-vs-ai",
  "end-to-end-careeros-flow", "hard-filter-decision-tree", "scoring-breakdown",
  "deterministic-plus-llm", "evidence-to-resume", "project-ranking", "experience-ranking",
  "resume-composition", "resume-version-lineage", "application-lifecycle",
  "system-architecture", "development-timeline",
];

const assets = [];

for (const s of screens) {
  assets.push({
    id: s.id,
    type: "screenshot",
    filename: s.file,
    folder: "public/assets/screens",
    placeholder: `public/assets/placeholders/${s.file.replace(".webp", ".svg")}`,
    storyboardSections: s.sections,
    status: "missing",
    route: s.route,
    viewport: s.viewport || "1440x1000",
    requiredState: s.state,
    redactions: ["email", "phone", "private URLs", "recruiter names", "private notes"],
    caption: s.caption,
    annotations: s.annotations,
  });
}

for (const [id, file, sections] of animations) {
  assets.push({
    id,
    type: "animation",
    filename: file,
    folder: "public/assets/animations",
    placeholder: `public/assets/placeholders/${file}`,
    storyboardSections: sections,
    status: "placeholder",
    route: null,
    viewport: null,
    requiredState: "motion asset or CSS/Lottie implementation",
    redactions: [],
    caption: id,
    annotations: [],
  });
}

for (const id of diagrams) {
  assets.push({
    id: `diagram-${id}`,
    type: "diagram",
    filename: `${id}.json`,
    folder: "DIAGRAM_DATA",
    placeholder: `public/assets/placeholders/${id}.svg`,
    storyboardSections: [],
    status: "ready",
    route: null,
    viewport: null,
    requiredState: "render from DIAGRAM_DATA JSON",
    redactions: [],
    caption: id,
    annotations: [],
    dataFile: `DIAGRAM_DATA/${id}.json`,
  });
}

const manifest = {
  version: 1,
  generated: "2026-08-04",
  rules: {
    screenshotsOnlyFromAct6: true,
    neverBlankGrey: true,
    replacePlaceholderKeepingFilename: true,
  },
  assets,
};

fs.writeFileSync("case-study/ASSET_MANIFEST.json", JSON.stringify(manifest, null, 2));
console.log("assets", assets.length);
