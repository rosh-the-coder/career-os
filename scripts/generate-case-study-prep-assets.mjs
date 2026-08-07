import fs from "fs";
import path from "path";

const root = "case-study";
const placeholders = path.join(root, "public/assets/placeholders");
const diagramsDir = path.join(root, "DIAGRAM_DATA");
fs.mkdirSync(placeholders, { recursive: true });
fs.mkdirSync(diagramsDir, { recursive: true });

function svgPlaceholder({ filename, route, state, kind }) {
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12141a"/>
      <stop offset="100%" stop-color="#1c2230"/>
    </linearGradient>
  </defs>
  <rect width="1440" height="900" fill="url(#g)"/>
  <rect x="48" y="48" width="1344" height="804" rx="16" fill="none" stroke="#3d4a63" stroke-width="2" stroke-dasharray="10 8"/>
  <text x="72" y="120" fill="#e8eefc" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="36" font-weight="600">PLACEHOLDER</text>
  <text x="72" y="180" fill="#9fb0d0" font-family="IBM Plex Mono, Consolas, monospace" font-size="22">${esc(filename)}</text>
  <text x="72" y="240" fill="#7f92b5" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="20">type: ${esc(kind)}</text>
  <text x="72" y="290" fill="#7f92b5" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="20">route: ${esc(route || "n/a")}</text>
  <text x="72" y="360" fill="#c9d4ea" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="18">capture state:</text>
  <text x="72" y="400" fill="#9fb0d0" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="18">${esc(state).slice(0, 110)}</text>
  <text x="72" y="440" fill="#9fb0d0" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="18">${esc(state).slice(110, 220)}</text>
  <text x="72" y="820" fill="#6b7c9c" font-family="IBM Plex Mono, Consolas, monospace" font-size="14">Replace with real asset. Keep filename. See ASSET_MANIFEST.json</text>
</svg>`;
}

const screens = [
  ["01-dashboard-overview.webp", "/dashboard", "seeded demo: scored + rejected + materials-ready jobs"],
  ["02-jobs-ranked-list.webp", "/jobs", "mixed scored/rejected demo jobs"],
  ["03-job-import.webp", "/jobs/new", "empty import form"],
  ["04-job-score-breakdown.webp", "/jobs/[scored-id]", "North Harbor Labs UX Engineer scored 78"],
  ["05-hard-reject.webp", "/jobs/[rejected-id]", "Atlas Motion Works principal CAD reject"],
  ["06-eligibility-soft-flags.webp", "/jobs/[scored-id]", "no_sponsorship_language soft flag visible"],
  ["07-approve-queue.webp", "/approve", "scored/materials-ready queue"],
  ["08-profile-recommendation.webp", "/jobs/[scored-id]", "profile recommendation panel"],
  ["09-project-recommendation.webp", "/jobs/[materials-id]", "recommended projects list"],
  ["10-resume-studio-overview.webp", "/resume-studio", "versions with validation badges"],
  ["11-resume-validation.webp", "/resume-studio", "warning validation state"],
  ["12-resume-keyword-fit.webp", "/jobs/[materials-id]", "ATS keyword fit panel"],
  ["13-resume-version-lineage.webp", "/resume-studio", "parent/child versions"],
  ["14-generated-resume-preview.webp", "studio/export", "redacted demo DOCX/PDF preview"],
  ["15-applications-tracker.webp", "/applications", "demo rows, no recruiter PII"],
  ["16-settings-constraints.webp", "/settings", "demo contacts only"],
  ["17-provider-fallback-state.webp", "/jobs/[fallback-id]", "llm_rate_limit soft flag"],
  ["18-empty-state.webp", "/resume-studio", "empty studio alternate"],
  ["19-mobile-dashboard.webp", "/dashboard", "390x844 mobile"],
  ["20-mobile-job-detail.webp", "/jobs/[scored-id]", "390x844 mobile"],
];

const animations = [
  ["title-breath.svg", "n/a", "cold open brand"],
  ["antipromise.svg", "n/a", "strike-through anti-promises"],
  ["rejection-timeline.svg", "n/a", "abstract rejection timeline"],
  ["tab-avalanche.svg", "n/a", "browser tabs cascade"],
  ["tool-rain.svg", "n/a", "tool pile interaction"],
  ["wrong-room.svg", "n/a", "mislabel corridor"],
  ["eligibility-fog.svg", "n/a", "eligibility fog"],
  ["daily-loop.svg", "n/a", "job search loop"],
  ["time-bar.svg", "n/a", "time allocation bar"],
  ["twenty-percent.svg", "n/a", "conceptual 20% reveal"],
  ["ecosystem-orbit.svg", "n/a", "tool orbit map"],
  ["pipeline-flythrough.svg", "n/a", "engine pipeline"],
  ["nested-rings.svg", "n/a", "deterministic vs AI"],
  ["scoring-constellation.svg", "n/a", "score weights"],
  ["evidence-scan.svg", "n/a", "claim validation scan"],
  ["provider-relay.svg", "n/a", "fallback baton"],
  ["anti-chart.svg", "n/a", "refuse fake outcomes"],
];

const diagramMeta = {
  "fragmented-workflow": {
    nodes: [
      { id: "resumeio", label: "Resume.io", category: "generate" },
      { id: "chatgpt", label: "ChatGPT", category: "chat" },
      { id: "linkedin", label: "LinkedIn", category: "discover" },
      { id: "word", label: "Word", category: "generate" },
      { id: "notion", label: "Notion", category: "track" },
      { id: "email", label: "Email", category: "submit" },
      { id: "excel", label: "Excel", category: "track" },
      { id: "pdf", label: "PDF", category: "generate" },
    ],
    edges: [
      { from: "resumeio", to: "chatgpt" },
      { from: "chatgpt", to: "linkedin" },
      { from: "linkedin", to: "word" },
      { from: "word", to: "notion" },
      { from: "notion", to: "email" },
      { from: "email", to: "excel" },
      { from: "excel", to: "pdf" },
      { from: "pdf", to: "resumeio", label: "Repeat" },
    ],
    sections: ["§05"],
  },
  "daily-job-search-loop": {
    nodes: [
      { id: "time", label: "Time spent" },
      { id: "find", label: "Finding" },
      { id: "read", label: "Reading" },
      { id: "score", label: "Scoring" },
      { id: "resume", label: "Resume" },
      { id: "cover", label: "Cover Letter" },
      { id: "track", label: "Tracking" },
      { id: "repeat", label: "Repeat" },
    ],
    edges: [
      { from: "time", to: "find" },
      { from: "find", to: "read" },
      { from: "read", to: "score" },
      { from: "score", to: "resume" },
      { from: "resume", to: "cover" },
      { from: "cover", to: "track" },
      { from: "track", to: "repeat" },
      { from: "repeat", to: "time" },
    ],
    sections: ["§10"],
  },
  "tool-ecosystem": {
    nodes: [
      { id: "center", label: "Workflow (empty)", category: "core" },
      { id: "resumeio", label: "Resume.io", category: "generate", tooltip: "Writes documents" },
      { id: "chatgpt", label: "ChatGPT", category: "chat", tooltip: "Generates prose" },
      { id: "huntr", label: "Huntr", category: "track", tooltip: "Tracks applications" },
      { id: "teal", label: "Teal", category: "track", tooltip: "Career tracker" },
      { id: "simplify", label: "Simplify", category: "apply", tooltip: "Apply assist" },
      { id: "linkedin", label: "LinkedIn", category: "discover", tooltip: "Hosts jobs / network" },
      { id: "indeed", label: "Indeed", category: "discover", tooltip: "Job board" },
    ],
    edges: [
      { from: "resumeio", to: "center", kind: "orbit" },
      { from: "chatgpt", to: "center", kind: "orbit" },
      { from: "huntr", to: "center", kind: "orbit" },
      { from: "teal", to: "center", kind: "orbit" },
      { from: "simplify", to: "center", kind: "orbit" },
      { from: "linkedin", to: "center", kind: "orbit" },
      { from: "indeed", to: "center", kind: "orbit" },
    ],
    sections: ["§16", "§17", "§18"],
  },
  "human-vs-ai": {
    nodes: [
      { id: "eligibility", label: "Eligibility hard reject", owner: "deterministic" },
      { id: "yoe", label: "YOE hard reject", owner: "deterministic" },
      { id: "claims", label: "Claim / metric approval", owner: "human+rules" },
      { id: "titles", label: "Official titles", owner: "deterministic" },
      { id: "submit", label: "Application submit", owner: "human" },
      { id: "score_narrative", label: "Fit narrative", owner: "optional-ai" },
      { id: "ats", label: "ATS wording suggest", owner: "optional-ai" },
      { id: "critic", label: "Resume critic", owner: "optional-ai" },
    ],
    edges: [],
    sections: ["§13", "§30"],
    source: "docs/project/architecture/AI_USAGE.md",
  },
  "end-to-end-careeros-flow": {
    nodes: [
      { id: "discover", label: "Discover / Import" },
      { id: "parse", label: "Parse" },
      { id: "filter", label: "Hard filter" },
      { id: "score", label: "Score ± LLM" },
      { id: "review", label: "Review" },
      { id: "resume", label: "Resume v2/v3/v4" },
      { id: "validate", label: "Validate" },
      { id: "export", label: "Export" },
      { id: "studio", label: "Studio" },
      { id: "track", label: "Track" },
      { id: "submit", label: "External submit" },
    ],
    edges: [
      { from: "discover", to: "parse" },
      { from: "parse", to: "filter" },
      { from: "filter", to: "score" },
      { from: "score", to: "review" },
      { from: "review", to: "resume" },
      { from: "resume", to: "validate" },
      { from: "validate", to: "export" },
      { from: "export", to: "studio" },
      { from: "studio", to: "track" },
      { from: "track", to: "submit" },
    ],
    sections: ["§29"],
    source: "docs/project/architecture/SYSTEM_ARCHITECTURE.md",
  },
  "hard-filter-decision-tree": {
    nodes: [
      { id: "geo", label: "UK/US-only geo?" },
      { id: "unpaid", label: "Unpaid / intern?" },
      { id: "senior", label: "Director/VP/Principal/Staff+?" },
      { id: "cad", label: "Mechanical CAD design eng?" },
      { id: "ml", label: "Deep ML / PhD required?" },
      { id: "video", label: "Video/motion (toggle)?" },
      { id: "yoe", label: "YOE thresholds?" },
      { id: "soft", label: "Soft flags" },
      { id: "ok", label: "Continue to score" },
      { id: "reject", label: "Hard reject" },
    ],
    edges: [
      { from: "geo", to: "reject", when: "yes" },
      { from: "geo", to: "unpaid", when: "no" },
      { from: "unpaid", to: "reject", when: "yes" },
      { from: "unpaid", to: "senior", when: "no" },
      { from: "senior", to: "reject", when: "yes" },
      { from: "senior", to: "cad", when: "no" },
      { from: "cad", to: "reject", when: "yes" },
      { from: "cad", to: "ml", when: "no" },
      { from: "ml", to: "reject", when: "yes" },
      { from: "ml", to: "video", when: "no" },
      { from: "video", to: "reject", when: "yes+off" },
      { from: "video", to: "yoe", when: "no" },
      { from: "yoe", to: "reject", when: "hard" },
      { from: "yoe", to: "soft", when: "pass" },
      { from: "soft", to: "ok" },
    ],
    sections: ["§45"],
    source: "src/lib/scoring/hard-filters.ts",
  },
  "scoring-breakdown": {
    nodes: [
      { id: "skills", label: "skillsOverlap", weight: 20 },
      { id: "evidence", label: "evidenceStrength", weight: 16 },
      { id: "projects", label: "projectRelevance", weight: 14 },
      { id: "seniority", label: "seniorityFit", weight: 22 },
      { id: "elig", label: "currentEligibility", weight: 10 },
      { id: "permit", label: "longTermPermit", weight: 6 },
      { id: "loc", label: "locationFit", weight: 6 },
      { id: "salary", label: "salaryFit", weight: 3 },
      { id: "career", label: "careerAlignment", weight: 3 },
    ],
    edges: [],
    sections: ["§31", "§38"],
    source: "src/lib/types.ts SCORE_WEIGHTS",
  },
  "deterministic-plus-llm": {
    nodes: [
      { id: "job", label: "Job + Settings" },
      { id: "hard", label: "Hard filters" },
      { id: "heur", label: "Heuristic scoreJob" },
      { id: "llm", label: "Optional LLM judge" },
      { id: "merge", label: "mergeHeuristicWithJudge" },
      { id: "out", label: "JobScore" },
    ],
    edges: [
      { from: "job", to: "hard" },
      { from: "hard", to: "heur" },
      { from: "heur", to: "llm", optional: true },
      { from: "heur", to: "merge" },
      { from: "llm", to: "merge" },
      { from: "merge", to: "out", note: "eligibility floats locked" },
    ],
    sections: ["§30", "§46"],
    source: "src/lib/scoring/llm-judge.ts",
  },
  "evidence-to-resume": {
    nodes: [
      { id: "inv", label: "Inventory" },
      { id: "rank", label: "Rank projects/exp" },
      { id: "compose", label: "Compose V3" },
      { id: "val", label: "Validate (corpus excludes CV)" },
      { id: "comp", label: "ComposeDocument V4" },
      { id: "theme", label: "Theme" },
      { id: "export", label: "DOCX/PDF" },
    ],
    edges: [
      { from: "inv", to: "rank" },
      { from: "rank", to: "compose" },
      { from: "compose", to: "val" },
      { from: "val", to: "comp" },
      { from: "comp", to: "theme" },
      { from: "theme", to: "export" },
    ],
    sections: ["§32", "§47"],
    source: "src/lib/resume/v3/",
  },
  "project-ranking": {
    nodes: [
      { id: "pr", label: "profileRelevance", weight: 0.25 },
      { id: "jd", label: "jdKeywordRelevance", weight: 0.25 },
      { id: "ev", label: "evidenceStrength", weight: 0.2 },
      { id: "rec", label: "recency", weight: 0.1 },
      { id: "ops", label: "operationalStatus", weight: 0.1 },
      { id: "pos", label: "careerPositioning", weight: 0.1 },
    ],
    edges: [],
    sections: ["§09-product"],
    source: "src/lib/types.ts PROJECT_RANK_WEIGHTS",
    note: "AI profiles force-select Aethelgard+CareerOS on 1-page in product code; demo seed uses Workflow OS / Demo Systems Work",
  },
  "experience-ranking": {
    nodes: [
      { id: "theme", label: "themeHits * 0.35" },
      { id: "jd", label: "jdHits * 0.25" },
      { id: "rec", label: "recency * 0.25" },
      { id: "sort", label: "1/(sortOrder+1) * 0.15" },
      { id: "rel", label: "relevanceScore * 0.5" },
    ],
    edges: [],
    sections: ["act7"],
    source: "CAREEROS_PROJECT_HISTORIAN.md Appendix D",
  },
  "resume-composition": {
    nodes: [
      { id: "v2", label: "v2 templates" },
      { id: "v3", label: "v3 inventory compose" },
      { id: "v4", label: "v4 composition/themes/critic" },
      { id: "flag", label: "RESUME_ENGINE_VERSION" },
    ],
    edges: [
      { from: "flag", to: "v2" },
      { from: "flag", to: "v3" },
      { from: "flag", to: "v4" },
      { from: "v3", to: "v4", label: "content → layout" },
    ],
    sections: ["§48"],
    source: "src/lib/resume/service.ts",
  },
  "resume-version-lineage": {
    nodes: [
      { id: "p", label: "Parent ResumeVersion" },
      { id: "c1", label: "ATS apply child" },
      { id: "c2", label: "Regeneration child" },
    ],
    edges: [
      { from: "p", to: "c1" },
      { from: "p", to: "c2" },
    ],
    sections: ["§13-screen", "act7-lineage"],
    source: "prisma/schema.prisma ResumeVersion.parentVersionId",
  },
  "application-lifecycle": {
    nodes: [
      { id: "applied", label: "Applied" },
      { id: "interviewed", label: "Interviewed" },
      { id: "rejected", label: "Rejected" },
      { id: "offer", label: "Offer" },
      { id: "accepted", label: "Accepted" },
    ],
    edges: [
      { from: "applied", to: "interviewed" },
      { from: "interviewed", to: "rejected" },
      { from: "interviewed", to: "offer" },
      { from: "offer", to: "accepted" },
      { from: "offer", to: "rejected" },
    ],
    sections: ["§42"],
    source: "src/lib/applications/constants.ts",
  },
  "system-architecture": {
    nodes: [
      { id: "op", label: "Operator" },
      { id: "app", label: "Next.js CareerOS" },
      { id: "db", label: "Supabase Postgres" },
      { id: "auth", label: "Supabase Auth" },
      { id: "llm", label: "Groq / Gemini" },
      { id: "boards", label: "ATS board APIs" },
    ],
    edges: [
      { from: "op", to: "app" },
      { from: "app", to: "db" },
      { from: "app", to: "auth" },
      { from: "app", to: "llm", optional: true },
      { from: "app", to: "boards" },
    ],
    sections: ["§28", "§29"],
    source: "docs/project/architecture/SYSTEM_ARCHITECTURE.md",
  },
  "development-timeline": {
    nodes: [
      { id: "c1", label: "2026-07-24 a8d2290 MVP" },
      { id: "c2", label: "2026-07-24 e1c0273 Discovery" },
      { id: "c3", label: "2026-07-25 68f82b4 LLM scoring" },
      { id: "c4", label: "2026-07-28 3feecf3 ATS fit" },
      { id: "c5", label: "2026-07-30 58c7763 Tracker + YOE" },
      { id: "c6", label: "2026-08-04 26f2596 V3/V4" },
    ],
    edges: [
      { from: "c1", to: "c2" },
      { from: "c2", to: "c3" },
      { from: "c3", to: "c4" },
      { from: "c4", to: "c5" },
      { from: "c5", to: "c6" },
    ],
    sections: ["§58"],
    source: "docs/project/TIMELINE.md",
  },
};

for (const [f, route, state] of screens) {
  fs.writeFileSync(
    path.join(placeholders, f.replace(".webp", ".svg")),
    svgPlaceholder({ filename: f, route, state, kind: "screenshot" }),
  );
}
for (const [f, route, state] of animations) {
  fs.writeFileSync(
    path.join(placeholders, f),
    svgPlaceholder({ filename: f, route, state, kind: "animation" }),
  );
}

for (const [id, data] of Object.entries(diagramMeta)) {
  const payload = {
    id,
    ...data,
    labels: (data.nodes || []).map((n) => n.label),
    categories: [...new Set((data.nodes || []).map((n) => n.category).filter(Boolean))],
    mobileOrder: (data.nodes || []).map((n) => n.id),
    sourceReferences: [data.source].filter(Boolean),
  };
  fs.writeFileSync(path.join(diagramsDir, `${id}.json`), JSON.stringify(payload, null, 2));
  fs.writeFileSync(
    path.join(placeholders, `${id}.svg`),
    svgPlaceholder({
      filename: `${id}.svg`,
      route: "diagram",
      state: `Rendered from DIAGRAM_DATA/${id}.json`,
      kind: "diagram",
    }),
  );
}

console.log(
  JSON.stringify({
    screens: screens.length,
    animations: animations.length,
    diagrams: Object.keys(diagramMeta).length,
  }),
);
