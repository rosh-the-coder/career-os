# CareerOS — Project Bible

**Status:** Canonical knowledge root for this documentation system  
**Compiled:** 2026-08-04 from repository evidence + Project Historian  
**Git HEAD at compilation:** `26f2596`  
**Rule:** Never invent facts. Code beats stale docs. Founder narrative marked `[FOUNDER PENDING]`.

Derived documents must not contradict this Bible. When they do, update the Bible from new evidence first.

---

## 1. Vision

### Statement (verified)

Build a **personal AI-assisted job-search operating system** that finds suitable roles, filters them against real experience and Irish work eligibility, scores fit with explanations, generates evidence-grounded ATS materials, and prepares applications for **human review** — optimizing for quality and strategic fit, not application volume.

**Evidence:** `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` §1; `README.md`; `docs/ARCHITECTURE.md` Goal.

### What it is not

Not a mass-application bot. Not multi-tenant recruiting SaaS. Not an immigration advisory product. Not a guaranteed ATS-pass predictor.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Build spec vision; README principles; no auto-submit in codebase |
| **Repository references** | `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md`, `README.md`, `docs/ARCHITECTURE.md` |
| **Founder context** | `[FOUNDER PENDING]` Why build vs buy; long-term productization intent |
| **Screenshot opportunities** | Dashboard pipeline overview; Approve queue as HITL proof |
| **Diagram opportunities** | Vision vs anti-vision (bot volume vs quality prep) |

---

## 2. Origin

### Verified

- Working title evolved as CareerOS / Targeted Job Hunter / Roshan Automated Job Finder (`ROSHAN_…_BUILD_SPEC.md`, README).  
- Primary user: Roshan Najar, Dublin.  
- Repo git history begins **2026-07-24** (`a8d2290`). Six commits through **2026-08-04**.  
- Dual intent stated repeatedly: daily tool **and** portfolio case study.

### Unverified (interview required)

| Question | Label |
|---|---|
| What personal event/week triggered building vs spreadsheets/Notion alone? | `[FOUNDER PENDING]` |
| Emotional link to layoff date (Settings `layoffDate` / 17 Jul 2026)? | `[FOUNDER PENDING]` |
| Why Cursor + this stack specifically? | `[FOUNDER PENDING]` |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Spec authorship; git birth date; dual-use language in README/Architecture |
| **Repository references** | Build spec header; `git log`; Settings seed fields |
| **Founder context** | Entire origin story pending interview |
| **Screenshot opportunities** | Settings eligibility panel (redact PII) as “why Ireland/Stamp 1G matters” |
| **Diagram opportunities** | Origin → Spec → MVP commit timeline |

---

## 3. Problem

### Core problem (verified from spec)

Multidisciplinary profile (product/UX design, design engineering, UX/frontend engineering, applied AI, creative tech) is poorly served by:

1. Single generic CV → looks unfocused  
2. Misclassification risk (e.g. video editor framing)  
3. Overlapping skills under different role titles  
4. Irish work-permission evaluation burden  
5. Slow manual tailoring  
6. Hallucinated AI CVs  
7. Auto-apply tools optimizing volume over quality  
8. Need for long-term Critical Skills / sponsorship path awareness  

**Evidence:** `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` §2.

### Engineering restatement

The system must maintain a **canonical career inventory**, map each JD to a **role profile**, apply **deterministic eligibility gates**, produce **explainable scores**, and generate resumes that are **claim-validated** against evidence — with humans submitting applications.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Build spec §2; hard-filters + claim validation implementations |
| **Repository references** | Build spec; `hard-filters.ts`; `validate-content.ts` |
| **Founder context** | `[FOUNDER PENDING]` Which friction hurt most day-to-day |
| **Screenshot opportunities** | Hard-reject banner; soft flags; estimate markers |
| **Diagram opportunities** | Problem map: boards × profiles × eligibility × hallucination |

---

## 4. Thesis

**Thesis (compiled, evidence-backed):**  
For a multidisciplinary candidate under Irish eligibility constraints, job-search leverage comes from **structured inventory + deterministic gates + optional LLM judgment behind guardrails + human submission** — not from autonomous apply agents or unconstrained generative CVs.

**Supporting locks (README product decisions):**

- Default profile bias: UX Engineer  
- YOE: soft note / hard reject only under defined title+YOE rules  
- “No sponsorship”: soft flag — keep for Stamp 1G review  
- Salary floor €40k: soft preference  
- Video/motion fallback: off by default  
- Design Engineer = digital only (CAD/mechanical hard-reject)  
- Estimates marked for review  

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | README locked decisions; scoring merge preserving eligibility |
| **Repository references** | `README.md`; `llm-judge.ts` merge; `hard-filters.ts` |
| **Founder context** | `[FOUNDER PENDING]` Moment eligibility was locked against LLM override |
| **Screenshot opportunities** | Score breakdown with eligibility dimensions |
| **Diagram opportunities** | Thesis diagram: Deterministic core → optional LLM → human |

---

## 5. Product Principles

| Principle | Meaning | Evidence |
|---|---|---|
| Evidence before generation | No CV claim without approved evidence trail | Build spec §3.1; V3 validators |
| Human-in-the-loop | Recommend/prepare; never silent submit | README disclaimer; no auto-apply |
| Strategic targeting | Prefer product/design/UX/AI/frontend paths | Build spec §3.3; `ROLE_POLICIES` |
| Transparent scoring | Strengths, gaps, eligibility, profile pick | JobScore + job detail UI |
| No invented seniority / titles | Title policy; no fabricated YOE/seniority | `title-policy.ts`; principles |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Spec §3; README; title-policy tests |
| **Repository references** | Build spec; `README.md`; `src/lib/resume/v3/title-policy.ts` |
| **Founder context** | `[FOUNDER PENDING]` Principle that was hardest to uphold |
| **Screenshot opportunities** | Resume Studio validation warnings; title preservation on CV |
| **Diagram opportunities** | Principles as non-negotiable gates on the pipeline |

---

## 6. Design Philosophy

### Verified

- Dark “ops console” UI shell (checklist: “Dark premium UI shell”).  
- Notion-style applications tracker (table CRUD, status tags, next actions).  
- Resume Studio as **review surface**, not freeform Word clone (editor deferred).  
- Themes: `arthur-cox` and `minimal-ats` ready; other ThemeIds stubbed `ready: false`.  
- ATS-safe typography prioritized over rich Word named styles (V3 report deferred styles).

### Unverified

| Question | Label |
|---|---|
| Why dark ops console vs calmer consumer UI? | `[FOUNDER PENDING]` |
| Proudest screen and why? | `[FOUNDER PENDING]` |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Checklist UI note; Resume Studio components; theme registry |
| **Repository references** | `docs/CHECKLIST.md`; `src/app/resume-studio/`; `themes/index.ts` |
| **Founder context** | Aesthetic rationale pending |
| **Screenshot opportunities** | Dashboard, Approve, Studio, Applications |
| **Diagram opportunities** | Information architecture of routes |

---

## 7. Engineering Philosophy

1. **Deterministic core, LLM periphery** — filters, parse, V3 compose default deterministic; LLM optional with fallback.  
2. **Feature-flag migration** — `RESUME_ENGINE_VERSION` = `v2` \| `v3` \| `v4` (default in `.env.example`: **v4**).  
3. **Provider fallbacks for free-tier reality** — Groq → Gemini → heuristic.  
4. **Versioned artifacts, never overwrite** — new `ResumeVersion` rows + `parentVersionId`.  
5. **Do not scrape protected boards** — block LinkedIn/Indeed/Glassdoor/IrishJobs hosts; prefer APIs + paste.  
6. **Tests as regression memory** — YOE negation, Arthur Cox fixture, title policy, V3/V4 suites.  
7. **Single-user allowlist** — not multi-tenant isolation theater.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Historian §18–23; env defaults; blocked hosts |
| **Repository references** | `fetch-url.ts`; `llm-judge.ts`; `resume/service.ts`; `tests/*` |
| **Founder context** | `[FOUNDER PENDING]` Why Groq free tier as default |
| **Screenshot opportunities** | LLM rate-limit soft flag on job detail |
| **Diagram opportunities** | Provider fallback chain; engine version switch |

---

## 8. Timeline

See `docs/project/TIMELINE.md` (canonical timeline extract).

Summary: 2026-07-24 MVP → discovery/approve → LLM scoring → ATS optimize → tracker/YOE fix → 2026-08-04 V3/V4.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Git log dates/SHAs |
| **Repository references** | Git history; V3 verification report |
| **Founder context** | `[FOUNDER PENDING]` Pre-repo ideation |
| **Screenshot opportunities** | Changelog-style case-study slide from commits |
| **Diagram opportunities** | Commit swimlane |

---

## 9. Architecture

### Stack

Next.js 15 App Router + React 19 + Prisma 6 + Supabase Postgres + Supabase Auth + Groq/Gemini + DOCX/PDF on Vercel.

### Module map (`src/lib/`)

| Module | Responsibility |
|---|---|
| `jobs/` | Discover, fetch, parse, import orchestration |
| `scoring/` | Hard filters, heuristic score, LLM judge merge |
| `resume/` | V2 templates, V3 compose/validate, ATS optimize, export |
| `resume-intelligence/` | Signals, ranking assist, lint/score |
| `resume-studio/` | Composition, themes, critic, studio export |
| `applications/` | Tracker service + constants |
| `ai/` | Provider interfaces, guardrails |
| `auth/` | Session, allowlist, middleware |
| `db/` | Prisma client |

### Operational workflow

```text
Settings/Inventory seed
→ Discover OR Import
→ parseJobText
→ Job persist
→ runHardFilters
→ scoreJob (± runLlmJudge → merge)
→ JobScore + UI review (Jobs / Approve)
→ generateResumeForJob (v2|v3|v4)
→ claim/export validation
→ DOCX/PDF
→ optional ATS optimize (human apply)
→ Resume Studio review
→ record Application (submit external)
```

Full architecture write-up: `docs/project/architecture/SYSTEM_ARCHITECTURE.md`.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Historian §§3–16; source tree |
| **Repository references** | `src/lib/*`; `src/app/actions.ts` |
| **Founder context** | — |
| **Screenshot opportunities** | End-to-end path across routes |
| **Diagram opportunities** | System context + sequence diagrams |

---

## 10. Data Flow

### Primary flow

Import/Discover → Job → HardFilter decision → JobScore → ResumeVersion → Application (optional link).

### Inventory flow

Seed (`prisma/seed.ts`, `seed-v3-inventory.ts`) → CareerProfile / Experience / Project / Skill / EvidenceItem / Metric → resume composition corpus.

### Scoring math (authoritative)

Weights in `src/lib/types.ts` `SCORE_WEIGHTS` (sum 100 points via weighted 0–1 dimensions):

| Component | Weight |
|---|---|
| skillsOverlap | 20 |
| evidenceStrength | 16 |
| projectRelevance | 14 |
| seniorityFit | 22 |
| currentEligibility | 10 |
| longTermPermit | 6 |
| locationFit | 6 |
| salaryFit | 3 |
| careerAlignment | 3 |

**Doc conflict:** `docs/ARCHITECTURE.md` lists different weights — **ignore for scoring truth**.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Types weights; service orchestrators |
| **Repository references** | `types.ts`; `jobs/service.ts`; `resume/service.ts` |
| **Founder context** | — |
| **Screenshot opportunities** | Job detail score cards |
| **Diagram opportunities** | Data-flow + ERD |

---

## 11. AI Usage

See `docs/project/architecture/AI_USAGE.md`.

**Summary:** Discovery, hard filters, and default V3 resume compose are **not** AI. Optional AI: job extract (Gemini), score judge (Groq→Gemini), ATS edit suggestions, resume critic, optional polish when `RESUME_DETERMINISTIC_ONLY=false`. Application Q&A stub exists but is not a primary UI flow. Auto-apply does not exist.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Historian §18 |
| **Repository references** | `llm-judge.ts`; `ats-optimize.ts`; `run-resume-critic.ts`; `ai/types.ts` |
| **Founder context** | `[FOUNDER PENDING]` Ethics of AI rewriting bullets |
| **Screenshot opportunities** | `modelVersion` badge; critic scores |
| **Diagram opportunities** | Human vs AI decision matrix |

---

## 12. Deterministic Rules

### Hard reject (representative; full logic in code)

UK/US-only auth geography; unpaid/commission-only; internship; director/head/VP/principal/staff+; physical/mechanical/CAD design engineer; deep ML/PhD research language when required; video/motion when toggle off; ≥8 YOE inferred; Senior + ≥6 YOE.

### Soft flags

`no_sponsorship_language`, `senior_title_stretch`, `high_years_requested` / `years_requested`, `below_salary_floor`.

### Eligibility enums

`eligible_now` | `likely_eligible_now` | `unclear` | `not_eligible` (+ future sponsorship path fields).

### Resume determinism

- Default compose path inventory-driven  
- Title resolution never invents official titles  
- V3 validation corpus excludes generated CV text  
- TECH_FABRICATION / role prohibited regexes  

**Evidence:** `hard-filters.ts`, `title-policy.ts`, `validate-content.ts`, tests.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Filter + validation source + Vitest |
| **Repository references** | `src/lib/scoring/hard-filters.ts`; `tests/hard-filters.test.ts` |
| **Founder context** | `[FOUNDER PENDING]` Worst false reject remembered |
| **Screenshot opportunities** | Rejected job banner; validation warning card |
| **Diagram opportunities** | Decision tree for hard filters |

---

## 13. Human Review

| Checkpoint | Mechanism |
|---|---|
| Discovery batch | Manual trigger (`runDiscoveryAction`); no cron |
| Score / eligibility | Jobs detail + Approve queue |
| Resume generation | Explicit generate / pack actions |
| Claim issues | Studio validation status |
| ATS keyword edits | Analyze → suggest → **human apply** |
| Critic suggestions | Displayed; Accept/Reject in Studio is **local UI state only** (not persisted) |
| Application submit | Always outside the app |
| Immigration / salary answers | Human (product principle) |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Approve UI; actions; README disclaimer; Studio limitations |
| **Repository references** | `approve/`; `actions.ts`; Resume Studio components |
| **Founder context** | `[FOUNDER PENDING]` Why not auto-apply even with confirms |
| **Screenshot opportunities** | Approve queue; apply-edits gated UI |
| **Diagram opportunities** | HITL checkpoint sequence |

---

## 14. Module Breakdown

| Product surface | Route | Status |
|---|---|---|
| Dashboard | `/dashboard` | implemented |
| Jobs list | `/jobs` | implemented |
| Job detail | `/jobs/[id]` | implemented |
| Import | `/jobs/new` | implemented |
| Approve | `/approve` | implemented |
| Profiles | `/profiles` | partial (no `/profiles/[id]`) |
| Resume Studio | `/resume-studio` | review/download implemented; editing partial |
| Applications | `/applications` | implemented |
| Settings | `/settings` | partial UI over richer schema |
| Login | `/login` | implemented |

CLI: `cli:import`, `cli:score`, `cli:discover`, `cli:generate-resume`, etc. (`package.json`).

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | App router pages; historian §4 |
| **Repository references** | `src/app/**/page.tsx` |
| **Founder context** | — |
| **Screenshot opportunities** | One capture per route (see SCREENSHOT_SPEC) |
| **Diagram opportunities** | Route IA map |

---

## 15. Technical Decisions

Canonical table: `docs/project/architecture/DECISION_LOG.md`.

Highlights:

| Decision | Choice |
|---|---|
| Eligibility vs LLM | Deterministic eligibility floats preserved on merge |
| DB/Auth | Prisma + Supabase |
| LLM reliability | Groq → Gemini → heuristic |
| Resume truth | Inventory + validators |
| Apply | Human only |
| Board access | APIs + paste; blocked host list |
| Engine migration | Feature flag v2/v3/v4 |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Historian §23 |
| **Repository references** | Decision Log + cited files |
| **Founder context** | Trade-off rationales partially pending |
| **Screenshot opportunities** | — |
| **Diagram opportunities** | Decision tree alternatives |

---

## 16. Trade-offs

| Trade-off | Cost | Benefit |
|---|---|---|
| Hard filters aggressive | Over-reject / recall loss | Safety on seniority/geo/YOE |
| No protected-board scrape | Coverage gaps | ToS / account safety |
| No auto-apply | Manual effort remains | Accountability / anti-bot |
| Three resume engines | Maintenance burden | Safe migration |
| Serverless `/tmp` exports | Non-durable files on Vercel | Simple deploy |
| Free-tier LLMs | Quality/rate variance | Cost / accessibility |
| Seed-driven inventory | Weak CMS UX | Truthful controlled corpus |
| Heuristic (non-embedding) scoring | No semantic similarity | Debuggable, offline-capable core |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Code constraints + deploy docs + historian |
| **Repository references** | `vercel.json`; `fetch-url.ts`; engine flag |
| **Founder context** | `[FOUNDER PENDING]` Ranking of regretted trade-offs |
| **Screenshot opportunities** | Blocked URL paste path on import |
| **Diagram opportunities** | Before/after: template CV vs V3 inventory |

---

## 17. Lessons

See `docs/project/roadmap/LESSONS.md`.

Verified engineering lessons (code-backed):

- YOE regex without negation creates false rejects (`hard-filters` fix + tests).  
- Hard-coded resume templates do not scale across role profiles → V3 inventory composer.  
- LLM judges must not own eligibility.  
- Doc drift is real (Architecture weights, PROJECT_SELECTION force-select rules).  
- Studio preview ≠ exported artifact unless generation re-run.

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Tests, V3 report, historian §24 |
| **Repository references** | `tests/hard-filters.test.ts`; V3 verification |
| **Founder context** | `[FOUNDER PENDING]` Personal process lessons |
| **Screenshot opportunities** | Test file as “regression memory” visual |
| **Diagram opportunities** | Failure → fix loop |

---

## 18. Roadmap

See `docs/project/roadmap/ROADMAP.md` and `FUTURE.md`.

Documented next themes (not commitments beyond repo language):

- Cron discovery  
- Gmail alert parsing (DEPLOY “after foundation”)  
- PDF typography / page re-budget  
- Inventory admin UI / freeform editor  
- Assisted form-fill + learning loop (planned language only)  
- Object storage for durable exports  
- E2E + scoring eval harness  

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | DEPLOY §5; V3 deferred; ARCHITECTURE cron note |
| **Repository references** | `docs/DEPLOY.md`; `docs/V3_VERIFICATION_REPORT.md` |
| **Founder context** | `[FOUNDER PENDING]` Priority order |
| **Screenshot opportunities** | Empty states as “what’s next” |
| **Diagram opportunities** | Now / Next / Later |

---

## 19. Reflection

### Verified reflection surface

CareerOS demonstrates a coherent **HITL + evidence-first** stance implemented in ~two weeks of git history from MVP to V3/V4 — valuable as engineering storytelling **without** outcome metrics.

### Explicit non-claims

Do not claim: user counts, hours saved, interview-rate lift, ATS vendor guarantees, multi-agent autonomy, RAG architecture, LinkedIn scraping, revenue.

### Founder reflection

| Prompt | Label |
|---|---|
| What would you rebuild first with three more months? | `[FOUNDER PENDING]` |
| What did V3/V4 teach about AI product hype vs determinism? | `[FOUNDER PENDING]` |
| Personal tool forever vs productize? | `[FOUNDER PENDING]` |

### Section metadata

| Dimension | Content |
|---|---|
| **Verified evidence** | Git span; principle adherence in code; absence of outcome metrics |
| **Repository references** | Entire Bible; historian §§29–31 |
| **Founder context** | Core reflection pending interview |
| **Screenshot opportunities** | Side-by-side: rejected hallucination patterns in tests |
| **Diagram opportunities** | Results act with “metrics unavailable” honest callout |

---

## Appendix A — Doc conflicts (code wins)

| Conflict | Resolution |
|---|---|
| `docs/ARCHITECTURE.md` score weights | Use `SCORE_WEIGHTS` in `src/lib/types.ts` |
| `docs/ROADMAP.md` missing `/approve`; lists `/profiles/[id]` | Routes as implemented in `src/app/` |
| `docs/DATA_MODEL.md` SQLite language | Production path is PostgreSQL/Supabase |
| README Milestone table pre-V3/V4 | Engines exist; Milestone 1 checklist still accurate for M1 scope |
| Some docs say default engine v3 | `.env.example` / code default **v4** |
| `docs/PROJECT_SELECTION.md` vs force-select | Code `selectProjectsForPage` forces Aethelgard+CareerOS (1p AI) and RVV on 2p AI |

## Appendix B — Founder interview queue

Full question list: `CAREEROS_PROJECT_HISTORIAN.md` §31.  
Interview answers should be merged into Bible sections 2, 6, 11, 13, 16–19 with citations dated.

## Appendix C — Related audits

- `CAREEROS_PROJECT_HISTORIAN.md` — technical inventory  
- `CAREEROS_CV_GENERATOR_AUDIT.md` — CV system audit (2026-08-03 snapshot)  
- `docs/V3_VERIFICATION_REPORT.md` — V3 verification  

*End of Project Bible.*
