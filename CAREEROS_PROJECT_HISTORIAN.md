# CareerOS Project Historian

**Purpose:** Verified technical inventory for a subsequent founder interview and Project Bible / case-study work.  
**Rule applied:** Claims below are grounded in repository code, schema, tests, docs, and git history. Planned features are labeled. No application code was modified to produce this file.  
**Audit date:** 2026-08-04  
**Git HEAD at audit (local):** `26f2596` — *Ship resume engine v3/v4 with intelligence, studio UI, and claim validation.*  
**Uncertainty label:** Where docs disagree with code, **code wins** and the conflict is noted.

---

## 1. Executive technical summary

CareerOS is a **personal, single-user job-search operations system**. It helps one candidate (seeded as Roshan Najar) discover or import job listings targeted at Ireland/Dublin and EU-sponsorship roles, apply deterministic eligibility hard filters, produce explainable multi-factor fit scores (optionally refined by an LLM judge), recommend a career profile, and generate evidence-grounded ATS resumes (DOCX/PDF) with claim validation. Application submission is **manual**; CareerOS prepares materials and tracks applications after the fact.

**Who it is for:** Currently built for one allowlisted operator (email allowlist + seeded inventory), not a multi-tenant SaaS.

**Main workflow (operational):** Configure settings/inventory → Discover or paste/import jobs → Parse → Hard-filter → Score (± LLM judge) → Review on Jobs / Approve → Generate resume (engine v2 legacy / v3 / v4 via `RESUME_ENGINE_VERSION`) → Validate claims → Export → Optional ATS keyword optimize → Record application in tracker.

**Genuinely operational:** Job import (paste + limited URL fetch), multi-source discovery (ATS board APIs + aggregators + Ireland career-page HTML fetch), hard filters, heuristic scoring, Groq/Gemini LLM judge with fallback, profile recommendation, Resume Engine V3/V4 composition + claim validation + DOCX/PDF, Resume Studio listing with composition/critique panels, Notion-style applications tracker UI, Supabase Auth + Vercel deploy path, Vitest suite (55 tests passing locally at audit).

**Incomplete / partial:** No Vercel Cron (discovery is on-demand); no auto-apply; no embeddings/RAG; Profiles UI mostly read-only (no full inventory admin CRUD); freeform resume editor not built; `/profiles/[id]` route documented in `docs/ROADMAP.md` but **not present** in `src/app/profiles/` (only `page.tsx`); PDF page-count re-budget loop deferred (`docs/V3_VERIFICATION_REPORT.md`); Gmail integration mentioned in `docs/DEPLOY.md` as future, **not implemented** in `src/`.

**Technically distinctive:** Evidence-first generation (inventory + claim guards before export); hybrid deterministic + LLM-as-judge scoring with eligibility lock-in; role policies + official title preservation; dual resume engines (legacy templates vs V3 composer vs V4 composition/themes/critic); human-in-the-loop design stated in README.

**Product class:** Personal daily tool + portfolio case study — **not** a multi-user product or production recruiting platform.

---

## 2. Repository and stack overview

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 App Router, React 19 |
| Backend | Next.js Server Actions + minimal Route Handlers |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Auth | Supabase Auth (magic link) + `ALLOWED_EMAILS`; `DEV_BYPASS_AUTH` |
| Deployment | Vercel (`vercel.json`: `prisma generate && next build`) |
| Documents | `docx`, `pdfkit` |
| AI | Groq (OpenAI-compatible HTTP); Google Gemini (`@google/generative-ai`) |
| Search | Optional Brave Search / SerpAPI (board **presence** only) |
| Job APIs | Greenhouse, Lever, Ashby, Adzuna, Remotive, Arbeitnow |
| Scraping | Light HTML career-page fetch (`ireland-watchlist.ts`); URL HTML fetch with blocked hosts |
| Styling | Tailwind CSS 4 |
| Tests | Vitest |
| Package manager | npm (`package-lock.json`) |
| Validation | Zod (dependency); custom claim validators |

### Important repository tree (source-focused)

```text
F:/Apps/JobHunter/
├── CAREEROS_PROJECT_HISTORIAN.md   (this file)
├── CAREEROS_CV_GENERATOR_AUDIT.md
├── ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md
├── README.md
├── package.json
├── vercel.json
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── seed-v3-inventory.ts
│   └── migrations/
├── scripts/          # CLI: import, score, discover, generate-resume, …
├── tests/            # 11 Vitest files
├── docs/             # Architecture, V3 docs, deploy, …
├── data/exports/     # Generated DOCX/PDF/MD (local)
└── src/
    ├── app/          # Pages + actions.ts + auth routes + resume download API
    ├── components/
    └── lib/
        ├── ai/
        ├── auth/
        ├── db/
        ├── jobs/
        ├── scoring/
        ├── resume/          # compose, export, ats-optimize, v3/
        ├── resume-intelligence/
        ├── resume-studio/
        └── applications/
```

**Excluded from “product tree”:** `.next/`, `node_modules/`, `docs/AETHELGARD_UI_SYSTEM.md` (separate product UI bible, not CareerOS runtime).

---

## 3. Full user journey

```text
Seed / Settings
→ Discover OR Import (paste / URL)
→ parseJobText
→ Job row persist
→ runHardFilters
→ scoreJob (heuristic)
→ runLlmJudge (optional) → mergeHeuristicWithJudge
→ JobScore persist; UI review (Jobs / Approve)
→ generateResumeForJob (v2 | v3 | v4)
→ claim / export validation
→ DOCX/PDF write
→ optional ATS keyword analyze / suggest / apply
→ human review (Resume Studio / downloads)
→ record / patch Application (manual submit outside app)
```

| Stage | UI | Action / API | Core function | Inputs | Outputs | Persist | Errors | Human? | Status |
|---|---|---|---|---|---|---|---|---|---|
| Auth | `/login` | `/auth/callback` | Supabase session + allowlist | email magic link | cookie session | User.authUserId | unauthorized redirect | — | **implemented** (bypass for local) |
| Settings | `/settings` | `updateSettingsAction` | Prisma Settings update | salary floor, toggles, batch | updated settings | Settings | — | yes | **implemented** (subset of fields editable) |
| Inventory seed | CLI `db:seed` / `db:seed:v3` | — | `prisma/seed.ts`, `seed-v3-inventory.ts` | seed data | profiles, exp, projects, evidence | DB | — | operator | **implemented** |
| Discover | Dashboard / Discover button | `runDiscoveryAction` | `runJobDiscovery` | board APIs, aggregators, watchlist | new Jobs + scores | Job, JobScore | per-board catch; counts errors | trigger | **implemented** (on-demand, not cron) |
| Import | `/jobs/new` | `importJobAction` | `importAndScoreJob` | paste, URL, title, company | Job + score | Job, JobScore | `JobFetchError` | yes | **implemented** |
| Parse | (inside import) | — | `parseJobText` | raw description | structured fields | Job columns/JSON | heuristics fail soft | — | **implemented** (deterministic; Gemini extract optional via provider, not default resume path) |
| Hard filter | Job detail | inside score | `runHardFilters` | job + settings | reject / soft flags / eligibility | Job.status, hardRejectReason, softFlagsJson | — | review | **implemented** |
| Score | Job detail / Approve | `rescoreJobAction` | `scoreJob` + `runLlmJudge` | inventory + job | total + breakdown + explanation | JobScore | LLM rate-limit → heuristic | review | **implemented** |
| Fit UI | `/jobs/[id]`, `/approve` | — | reads JobScore | scores JSON | strengths/gaps UI | — | — | **yes** | **implemented** |
| Resume gen | Job detail / Approve packs | `generateResumeAction`, `prepareResumePacksAction` | `generateResumeForJob` | job + profile + inventory | ResumeVersion + files | ResumeVersion, Job.status | claim/export throw | trigger | **implemented** (engine flag) |
| Claim validation | Resume Studio | inside persist | `validateResumeContentV3` / `validateClaims` | content + evidence corpus | status, blocked | validationJson | block persist | review | **implemented** |
| Export | download API | `GET /api/resumes/[id]/download` | `generateDocxAndPdf` / studio export | AtsResumeContent / CompositionDocument | DOCX/PDF | paths on version; `/tmp` on Vercel | export errors | download | **implemented** |
| ATS optimize | Job detail | analyze/suggest/apply actions | `ats-optimize.ts` | CV + JD | coverage, edits | optimizeJson; new version on apply | LLM fail → analysis only | **yes** (apply gated) | **implemented** |
| Application track | `/applications` | patch/create/delete/reorder | `applications/service.ts` | tracker fields | Application rows | Application | — | **yes**; submit external | **implemented** (Notion-style UI) |

---

## 4. Product modules

### Dashboard (`/dashboard`)
- **Purpose:** Pipeline counts and priority entry points.  
- **Impl:** `src/app/dashboard/page.tsx`, `dashboard-actions.tsx`, `discover-button.tsx`.  
- **Limits:** Not a full analytics product.  
- **Status:** implemented.

### Jobs list (`/jobs`)
- **Purpose:** Browse scored/rejected jobs.  
- **Impl:** `src/app/jobs/page.tsx`.  
- **Status:** implemented.

### Job detail (`/jobs/[id]`)
- **Purpose:** Score breakdown, eligibility, JD edit, rescore, resume generate, ATS keyword fit.  
- **Impl:** `src/app/jobs/[id]/page.tsx`, `job-description-editor.tsx`, `cv-keyword-fit.tsx`, `jd-word-meter.tsx`.  
- **Status:** implemented.

### Import (`/jobs/new`)
- **Purpose:** Paste JD / URL import.  
- **Impl:** `src/app/jobs/new/page.tsx` → `importJobAction` → `importAndScoreJob`.  
- **Status:** implemented. Blocked hosts require paste.

### Approve (`/approve`)
- **Purpose:** Queue review; save jobs; batch prepare resume packs.  
- **Impl:** `src/app/approve/page.tsx`, `approve-queue.tsx`.  
- **Status:** implemented.

### Profiles (`/profiles`)
- **Purpose:** Overview of career profiles.  
- **Impl:** `src/app/profiles/page.tsx` only.  
- **Limits:** ROADMAP lists `/profiles/[id]` — **not implemented**. Inventory editing is seed/script-driven, not a full admin UI.  
- **Status:** partially implemented.

### Resume Studio (`/resume-studio`)
- **Purpose:** List generated versions with validation, selected projects, composition preview, critic, intelligence panel, lineage, downloads.  
- **Impl:** `src/app/resume-studio/page.tsx`, `src/components/resume-studio/*`.  
- **Limits:** Freeform editor deferred (`docs/V3_VERIFICATION_REPORT.md`). Theme switching described in UI copy; generation theme driven by env/`RESUME_THEME_ID` path in service.  
- **Status:** implemented for review/download; partial for editing.

### Applications (`/applications`)
- **Purpose:** Notion-style tracker.  
- **Impl:** `applications/page.tsx`, `applications-tracker.tsx`, `lib/applications/*`.  
- **Status:** implemented (UI + CRUD actions).

### Settings (`/settings`)
- **Purpose:** Salary floor, video fallback toggle, soft salary, daily batch target.  
- **Impl:** `settings/page.tsx`, `updateSettingsAction`.  
- **Limits:** Many Settings columns exist in schema but are not all exposed in UI.  
- **Status:** partially implemented UI over richer model.

### Discovery / parsing / scoring / resume / auth / deploy
Covered in dedicated sections 6–9, 11–16, 19, 21.

---

## 5. Data model

Source of truth: `prisma/schema.prisma` (PostgreSQL via `DATABASE_URL` / `DIRECT_URL`).

### Models and relationships

```text
User 1─1 Settings
User 1─* CareerProfile, Experience, Project, Skill, EvidenceItem, Job, ResumeVersion, Application
EvidenceItem *─1 Experience? / Project?
EvidenceItem 1─* Metric
Job 1─1 JobScore
Job 1─* ResumeVersion, Application
CareerProfile 1─* ResumeVersion, JobScore
ResumeVersion self-relation parentVersion / childVersions
Application optional Job, optional ResumeVersion
```

### Field notes (selected)

| Model | Important fields | Meaning / write / read |
|---|---|---|
| **User** | email, name, authUserId | Identity; written by seed / auth mapping (`lib/auth/user.ts`) |
| **Settings** | permission*, salaryFloor*, includeFallbackVideoRoles, contact/URLs, dailyBatchTarget, layoffDate | Eligibility prefs + contact; seed defaults; partial UI update |
| **CareerProfile** | key, name, positioning, keywordsJson, evidenceOrderJson, isDefault | Positioning variants; seed; scoring profile pick; resume |
| **Experience** | umbrellaTitle, officialTitle, titleOptionsJson, selectedOfficialTitle, approvedTitleDescriptor, titleDescriptorApproved, resumeBulletsJson, preferredOrderByRoleJson, chronologyIndex, relevanceScore, companyContext | Canonical employment; V3 title policy + ranking |
| **Project** | key, stack/outcomes JSON, resumeBulletsJson, roleVariantsJson, approvedForCV, cvPriority, status, dates, evidenceIdsJson | Canonical projects for V3 ranking/composition |
| **Skill** | name, category, keywordsJson, approvedForCV, profilesJson | Skill inventory for scoring + resume skills |
| **EvidenceItem** | verified, confidence, keywordsJson, prohibitedClaimsJson, isEstimate, needsReview | Truth store; claim validation corpus |
| **Metric** | value/valueText, approvedForCV, isEstimate, needsReview | Quantified claims gate |
| **Job** | source, url, description*, requirementsJson, yearsRequired, softFlagsJson, hardRejectReason, listingCategory, status | Ingested listing |
| **JobScore** | totalScore, 9 float dimensions, strengths/gaps JSON, explanationJson, modelVersion | Scoring output |
| **ResumeVersion** | contentJson, markdown, validation*, docx/pdf paths, optimizeJson, parentVersionId, composerVersion, schemaVersion, themeId, compositionJson, critiqueJson | Generated artifact + lineage + V4 extras |
| **Application** | status + Notion fields (companyName, statusTagsJson, nextActionsJson, …), optional jobId | Tracker |

### Canonical vs duplicated / legacy

- **V2 resumes:** Hard-coded reference templates in `src/lib/resume/reference-templates.ts` (legacy when `RESUME_ENGINE_VERSION=v2`).  
- **V3:** DB inventory → `ResumeContentV3` in contentJson (`schemaVersion` / `composerVersion`).  
- **AtsResumeContent:** Adapter layer (`v3/adapter.ts`) for exporters — duplicated presentation of V3 content.  
- **Application.status** vs **statusTagsJson:** Dual representation; helpers `legacyStatusToTags` / `primaryTagToStatus`.  
- **docs/ARCHITECTURE.md** score weights are **stale** vs `SCORE_WEIGHTS` in `src/lib/types.ts`.  
- **Settings defaults** embed personal contact URLs/email/phone — canonical for this personal tool; treat carefully in public case studies (redact).  
- **duplicateGroupId** on Job: field exists; discovery primarily dedupes by **URL**.  
- Migrations under `prisma/migrations/` exist for V3/V4; project historically used `db push` heavily — **migration risk** if prod DB not aligned.

---

## 6. Job discovery and ingestion

### Entry paths

| Path | Mechanism | File |
|---|---|---|
| Automatic discovery (manual trigger) | `runJobDiscovery` | `src/lib/jobs/discover.ts` |
| Greenhouse boards (~50) | JSON API | `fetchGreenhouse` |
| Lever companies | JSON API | `fetchLever` |
| Ashby boards | JSON API | `fetchAshby` |
| Adzuna | API (optional keys) | `aggregators.ts` `fetchAdzunaIreland` |
| Remotive | public API | `fetchRemotiveDesign` |
| Arbeitnow | public API | `fetchArbeitnow` |
| Ireland watchlist | HTML fetch + `<a>` extraction | `ireland-watchlist.ts` |
| Paste | form description | `importAndScoreJob` |
| URL fetch | `fetchJobUrl` | `fetch-url.ts` |
| Board presence (optional) | Brave/SerpAPI search index | `board-presence.ts` — **not** HTML scrape of LinkedIn/Indeed/Glassdoor |

### Explicit non-capabilities

- **Does not scrape** LinkedIn, Indeed, Glassdoor, IrishJobs (blocked in `fetch-url.ts` `BLOCKED_HOST_HINTS`).  
- **No cron** in `vercel.json` — discovery is UI/CLI (`runDiscoveryAction`, `scripts/discover-greenhouse.ts`).  
- Dedup: existing URL set; re-import rescores.  
- Categories: `ireland_core` | `eu_sponsorship`.  
- Prefilter: title hints, skip staff/principal/director+, extreme YOE via `inferYearsRequired`.  
- Candidate sort: heuristic boosts (watchlist, Adzuna, Dublin, title; senior penalty).  
- Batch target: `Settings.dailyBatchTarget` (default 25).  
- Rate limits: fetch timeouts (~12–20s); LLM scoring paced via `scripts/score-pending.ts`.

---

## 7. Job parsing

**Primary:** `parseJobText` in `src/lib/jobs/parse-job.ts` — **deterministic**.

Extracts / infers:

- title (input or first line)  
- company (input, nearby lines, or URL host)  
- location line heuristics; country if Ireland mentioned  
- remoteType: hybrid/remote/onsite/unknown  
- employmentType: Permanent / Fixed-term / Contract  
- salaryMin/Max/Currency (euro regex)  
- seniority from title keywords  
- yearsRequired via `inferYearsRequired`  
- sponsorshipText / workAuthorizationText (sentence regex)  
- requirements bullets (section headers) with preferred vs required  
- responsibilities bullets  
- keywords from `TECH_KEYWORDS`  
- descriptionClean  

**Optional LLM:** `GeminiProvider.extractJob` in `src/lib/ai/provider.ts` — JSON extract; falls back to deterministic. Used when LLM provider selected; resume path defaults deterministic (`RESUME_DETERMINISTIC_ONLY`).

**Long JD:** LLM judge truncates JD (~14k chars); UI word meter (`jd-word-meter.tsx`, `jd-meta.ts`) warns soft limits for rate limits.

**Weak cases:** Company/title inference from messy pastes; salary non-EUR; YOE false positives historically (mitigated for negation — e.g. “nobody has 10 years…”); soft skills / education not first-class structured fields.

---

## 8. Eligibility and hard filters

**File:** `src/lib/scoring/hard-filters.ts` — `runHardFilters`, `inferYearsRequired`.

### Hard reject (examples)

- UK-only / US-only work auth geography  
- Unpaid / commission-only  
- Internship (title/text)  
- Director / head / VP / principal / staff+ titles  
- Physical/mechanical/CAD “design engineer”  
- Deep ML / PhD research when required language present  
- Video/motion titles when `includeFallbackVideoRoles` false  
- ≥8 YOE inferred; Senior title + ≥6 YOE  

### Soft flags

- no_sponsorship_language (kept for Stamp 1G review)  
- senior_title_stretch  
- high_years_requested / years_requested  
- below_salary_floor  

### Eligibility enums

`eligible_now` | `likely_eligible_now` | `unclear` | `not_eligible`  
Future: sponsorship promising/possible/unlikely | unknown  

**Override:** User can still view rejected jobs; generation blocked for `status === "rejected"` in `generateResumeForJob`. No formal “override hard reject” flag found — rescoring after JD edit is the path.

**Display:** Job detail hard-reject banner; soft flags in gaps/notes; eligibility CURRENT/LONG-TERM panels.

---

## 9. Job scoring and fit explanation

### Deterministic core — `scoreJob` (`src/lib/scoring/score-job.ts`)

**Weights** (`SCORE_WEIGHTS` in `src/lib/types.ts`) — **code is authoritative**:

| Component | Weight | Nature |
|---|---|---|
| skillsOverlap | 20 | heuristic substring match |
| evidenceStrength | 16 | heuristic |
| projectRelevance | 14 | heuristic |
| seniorityFit | 22 | heuristic (title + YOE) |
| currentEligibility | 10 | from hard-filter map |
| longTermPermit | 6 | from hard-filter map |
| locationFit | 6 | heuristic |
| salaryFit | 3 | heuristic vs floor |
| careerAlignment | 3 | profile keyword hits |

Total = round(Σ weight_i × score_i) with scores in 0–1 → 0–100.

Also: `pickProfile` keyword/title scoring with default bias `DEFAULT_PROFILE_KEY = "ux_engineer"`.

### LLM judge — `runLlmJudge` / `mergeHeuristicWithJudge` (`llm-judge.ts`)

- Providers: Groq (`GROQ_SCORE_MODEL` default `llama-3.1-8b-instant`) → Gemini (`gemini-2.0-flash`) → heuristic fallback  
- Structured JSON score + strengths/gaps  
- **Preserves** heuristic eligibility dimensions; clamps profile key to `PROFILE_KEYS`  
- `SCORE_LLM_DISABLED=true` forces heuristic  

### UI scores

Breakdown cards map to JobScore float fields (skills, evidence, projects, seniority, eligibility, permit path, location, salary — UI may group eligibility). Strengths/gaps from JSON. `modelVersion` indicates `llm-judge:…` vs `deterministic-v1`.

### Limitations / inconsistencies

- Not semantic similarity / embeddings  
- Heuristic vs LLM can disagree; LLM replaces totals when used  
- ARCHITECTURE.md weights outdated  
- Education not a score dimension  

---

## 10. Role profiles

**Keys** (`PROFILE_KEYS` in `src/lib/types.ts`):

| key | Default CV title (`role-policy.ts`) |
|---|---|
| ai_engineer | AI Engineer |
| applied_ai | Applied AI & Automation Builder |
| design_engineer | Design Engineer |
| product_engineer | Product Engineer |
| ux_engineer | UX Engineer (default bias) |
| product_designer | Product Designer |
| frontend_engineer | Frontend Engineer |
| ux_ui_designer | UX/UI Designer |
| ai_creative | AI Creative Technologist |

**Policy fields** (`ROLE_POLICIES`): cvTitle, aliases, positioning, sectionOrder, preferredProjectKeys, skillPriority, experiencePriorityThemes, prohibitedClaims, projectsFirst.

**Selection:** Scoring `pickProfile`; resume uses JobScore.profile or default. `resolveCvTitle` maps JD wording for AI profiles.

**Overlap:** applied_ai vs ai_engineer share project prefs; design/UX/frontend share RedVelvetVault-forward prefs. Missing profiles: pure backend, data science, PM — intentionally out of band.

**Seed:** Profiles also in DB via seed; policies in code are resume-composition authority for V3.

---

## 11. Evidence and truth system

### Storage

- `EvidenceItem` + `Metric` linked to Experience/Project  
- Project/Experience `resumeBulletsJson`, constraints, approvedForCV  
- Evidence `prohibitedClaimsJson`, confidence, verified, isEstimate, needsReview  

### Validation paths

1. **V3:** `validateResumeContentV3` (`validate-content.ts`) — corpus from `buildEvidenceCorpus` (**excludes generated CV**); global + role prohibited regexes; TECH_FABRICATION list; metric gates; evidenceIds on claims.  
2. **V2:** `validateClaims` (`compose.ts`) — prohibited patterns + numeric presence in evidence texts (legacy weakness: could include markdown in bundle).  
3. **Export:** `validateExportedResumeText` for AI-profile structural requirements.  
4. **ATS edits:** `validateEditText` before apply.  
5. **Title policy:** `resolveOfficialExperienceTitle` — no invented titles.  

### Prevents (best-effort)

Invented tech (RAG, LangChain, etc. unless in evidence), inflated seniority phrases, Etsy/revenue/PhD claims, unverified metrics (warnings / blocks).

### Remaining failure paths

- Weak substring evidence matching  
- LLM ATS rewrite could still introduce subtle unsupported wording if validation misses  
- Seeded disputed dates not “resolved” (V3 verification report)  
- Human can still download and edit outside the system  
- V2 template path can still ship canned copy if engine forced to v2  

---

## 12. Resume intelligence

**Orchestrator:** `composeResumeV3` → `runResumeIntelligence` (`src/lib/resume-intelligence/`).

Includes: engineering signals, bullet quality, story bullets, lint-and-score, strategy modes.

**Project ranking weights** (`PROJECT_RANK_WEIGHTS`):

- profileRelevance 0.25  
- jdKeywordRelevance 0.25  
- evidenceStrength 0.2  
- recency 0.1  
- operationalStatus 0.1  
- careerPositioning 0.1  

**Selection:** `selectProjectsForPage` — for `ai_engineer` / `applied_ai`, force-select Aethelgard + CareerOS on 1-page; add RedVelvetVault on 2-page when present (code forces this; `docs/PROJECT_SELECTION.md` is stale if it says otherwise).  
**Experience:** `preferredOrderByRole` → `relevanceScore` → `chronologyIndex`; mandatory companies for AI Engineer paths (`AI_ENGINEER_MANDATORY`).  
**Mostly deterministic;** intelligence layer scores/reorders; optional critic LLM is post-compose (V4).

---

## 13. Resume writing system

| Piece | Mechanism | AI? |
|---|---|---|
| Summary | `composeSummary` + role policy positioning | Deterministic (optional Gemini polish only if `RESUME_DETERMINISTIC_ONLY=false`) |
| Experience/project bullets | Inventory `resumeBulletsJson` + compose + `selectNonRepetitiveBullets` | Deterministic selection/writing from inventory |
| Skills / stack | policy skillPriority + inventory | Deterministic |
| ATS keyword edits | `suggestAtsEdits` | Groq/Gemini optional; human apply |
| Critic | `runResumeCritic` | LLM optional; heuristic fallback |
| Guardrails | `PROMPT_GUARDRAILS` in `src/lib/ai/types.ts` | Prompt-level |

**Title preservation:** `title-policy.ts`.  
**Repetition:** `no-repetition.ts`.  
**Generic wording:** still possible in inventory text and heuristic critic; critic flags genericWording when LLM used.

---

## 14. Resume composition and visual system

**V3 content model:** `ResumeContentV3` (`v3/types.ts`) — semantic content.  
**V4 composition:** `composeDocument` (`resume-studio/composition/`) — layout blocks + themes.  
**Themes:** `arthur-cox` and `minimal-ats` are `ready: true` (`themes/index.ts`). Additional ThemeId stubs exist (`stripe`, `openai`, `google`, `microsoft`, `notion`, `startup`, `academic`, `creative`, `executive`) with `ready: false` — UI may show “(soon)” and fall back to arthur-cox.  
**Distinction:** selection/writing (V3) → composition (V4) → export.  
**Gaps:** Full Word named styles deferred; PDF re-budget deferred; Studio theme dropdown preview via `composeDocument` does **not** rewrite stored DOCX/PDF; preview is not pixel-perfect Word.

---

## 15. DOCX and PDF export

| Step | Detail |
|---|---|
| Shared model | `AtsResumeContent` and/or `CompositionDocument` |
| DOCX | `docx` package (`export-docx.ts`, studio `export/`) |
| PDF | `pdfkit` |
| Storage | `data/exports/` local; `os.tmpdir()/career-os-exports` on Vercel |
| Download | `src/app/api/resumes/[id]/download/route.ts` |
| Naming | `buildResumeFileName` + uniqueness suffix |
| Validation | claim + export-validation before persist |
| Tests | `export-links.test.ts`, arthur-cox / studio tests |

**Identity:** Same content pipeline intended; rendering differences possible (PDF vs DOCX). Old versions remain as separate ResumeVersion rows.

---

## 16. Resume Studio

**Implemented:** Version cards; job/profile links; composer/schema badges; selected projects; validation warnings; composition preview; critic scores; intelligence panel; parent lineage; DOCX/PDF download links.

**Partial / incomplete (verified in Studio UI code):**
- `IntelligenceReviewPanel` Accept/Reject on suggestions is **local `useState` only** — not persisted and does not regenerate the CV.
- Theme switch in Studio updates client preview only; download still uses files written at generation time.
- Critic “auto improve” (`RESUME_CRITIC_AUTO_IMPROVE`) re-calls `composeDocument` with the same `contentV3` — **no content rewrite** (no-op improve).
- Freeform resume editor not built; inventory admin forms not built.

**Acceptance flow:** Human download/review — no formal “approve to submit” state machine beyond job status `materials_ready` / applications.

---

## 17. Application tracking

**Mark applied:** `recordApplicationAction` from job (links latest resume) or blank row via `createBlankApplicationAction`.  
**CRUD:** `patchApplicationAction`, `deleteApplicationAction`, `reorderApplicationsAction`.  
**Status tags:** Applied, Interviewed, Rejected, Offer, Accepted (`STATUS_TAGS`).  
**Next actions:** Follow up, Waiting, Prepare Interview, Send email, Decide.  
**Fields:** company, position, dates, salary, website, contact, referenceLink, location, workSetting, notes, resume link, optional jobId.  
**Limits:** Not a full Notion clone (no boards/DB relations UI beyond table); no email sync (Gmail mentioned only in deploy doc as future).  
**Submit:** Always external/manual.

---

## 18. AI usage map

### Workflow × AI

| Workflow stage | Uses AI? | Model/provider | Why | Deterministic alternative / guardrail |
|---|---|---|---|---|
| Job discovery | No | — | API/HTML fetch | — |
| Job parse | Optional | Gemini | Structured extract | `parseJobText` |
| Hard filters | No | — | Rules | — |
| Scoring | Optional | Groq → Gemini | Fit narrative + score | `scoreJob`; eligibility locked |
| Resume compose V3/V4 | Default No | — | Inventory compose | Full V3 path |
| Resume polish | Optional | Gemini | Rewrite | `RESUME_DETERMINISTIC_ONLY` default true |
| ATS edit suggest | Optional | Groq → Gemini | Keyword rewrites | Coverage analysis only; claim check; human apply |
| Resume critic | Optional | Groq → Gemini | Recruiter-style review | `heuristicCritique` |
| Application answers | Optional stub | Gemini provider | Q&A | DeterministicProvider stub — **not a primary UI flow** |
| Auto-apply | No | — | — | Human submit |

### Must stay deterministic / human

| Decision | Control | Reason |
|---|---|---|
| Visa / eligibility hard reject | Deterministic filters + human review | Legal/immigration risk; Stamp 1G nuance |
| YOE hard reject | Deterministic (+ negation fixes) | False positives hurt recall |
| Claim / metric approval | DB flags + validators | Hallucination risk |
| Final CV submit | Human | Product principle |
| Application submission | Human | Anti-bot / accountability |
| Title invention | Title policy | Integrity |

---

## 19. Security, privacy, and reliability

- **Auth:** Supabase magic link; middleware allowlist; local bypass flags.  
- **Not multi-tenant isolation beyond userId relations.**  
- **Secrets:** `.env` / Vercel env; `.env.example` placeholders only. Never commit real keys.  
- **DB:** Supabase Postgres; Prisma.  
- **Files:** Local disk or ephemeral `/tmp` on serverless — **exports not durable cloud object storage**.  
- **Prompts:** Send JD + candidate brief to Groq/Gemini when used — third-party processing.  
- **Logging:** Console warnings; limited structured audit.  
- **Rate limits:** Handled with fallbacks and pacing scripts.  
- **No claim of enterprise security, SOC2, encryption-at-rest documentation in-app.**

---

## 20. Testing and quality assurance

**Runner:** `npm test` → Vitest.  
**At audit:** **11 files, 55 tests, all passing.**

| File | Focus |
|---|---|
| `hard-filters.test.ts` | Rejects, YOE negation (Salesforce-style), company age |
| `score-job.test.ts` | Heuristic scoring |
| `llm-judge.test.ts` | Coercion / merge |
| `ats-optimize.test.ts` | Keyword coverage / edits |
| `title-policy.test.ts` | Official titles |
| `resume-engine-v3.test.ts` | V3 compose/validation |
| `resume-intelligence.test.ts` | Intelligence layer |
| `resume-studio-v4.test.ts` | Composition/themes |
| `arthur-cox-corrections.test.ts` | Arthur Cox fixture corrections |
| `export-links.test.ts` | Export link behavior |
| `applications-tracker.test.ts` | Tracker helpers |

**Also:** `tsc` / `npm run build` reported OK in `docs/V3_VERIFICATION_REPORT.md` (2026-08-03).  
**Missing:** E2E browser tests; production discovery integration tests; formal match-accuracy eval set.

---

## 21. Deployment and operational state

- **Local:** `npm run dev` → localhost:3000; Prisma + `.env`.  
- **Prod target:** Vercel + Supabase (`docs/DEPLOY.md`).  
- **Build:** `prisma generate && next build`.  
- **Cron:** none configured.  
- **File persistence:** fragile on Vercel serverless tmp.  
- **GitHub remote:** `https://github.com/rosh-the-coder/career-os` (private per prior deploy metadata).  
- **Live status:** Code is deployable; exact production schema sync (migrations/db push for V3/V4 columns) must be verified operationally — **historian cannot confirm live DB state without credentials**.

---

## 22. Development timeline

Verified from `git log --format="%h %ad %s" --date=short`:

| Verified date | Commit | Milestone |
|---|---|---|
| 2026-07-24 | `a8d2290` | Initial CareerOS app with Supabase-ready stack |
| 2026-07-24 | `e1c0273` | Discovery + approve queue; dashboard stats |
| 2026-07-25 | `68f82b4` | LLM-per-job scoring UX, discovery sources, safer resume packs |
| 2026-07-28 | `3feecf3` | ATS keyword-fit tooling + optimize cache |
| 2026-07-30 | `58c7763` | YOE false-positive fix; applications tracker |
| 2026-08-04 | `26f2596` | Resume engine v3/v4, intelligence, studio, claim validation |

**Approximate sequence (same commits):** job finder MVP → discovery/approve → LLM scoring → ATS optimize → tracker → canonical resume engine.

**Docs stamped:** V3 verification report **2026-08-03**.  
**Author shortlog:** 6 commits by `rosh-the-coder` (all history).  
**Sparse history:** No earlier public history in this repo before 2026-07-24.

---

## 23. Major engineering decisions

| Decision | Problem | Chosen approach | Trade-off | Evidence |
|---|---|---|---|---|
| Deterministic filters before LLM | Unsafe eligibility/YOE | Regex hard filters; LLM cannot override eligibility floats | May over-reject; needs negation tuning | `hard-filters.ts`, `llm-judge.ts` |
| Prisma + Supabase | Cloud DB + auth | Postgres + magic link | Single-user patterns; serverless file limits | schema, deploy docs |
| Provider fallbacks | Free-tier rate limits | Groq → Gemini → heuristic | Quality variance | llm-judge, ats-optimize, critic |
| Evidence-grounded resumes | Hallucination | Inventory + validators | Requires curated seed | validate-content, seed-v3 |
| Human-in-the-loop | Wrong auto-apply | No auto submit | Manual effort remains | README disclaimer |
| Resume versioning / lineage | Overwrite risk | New ResumeVersion rows + parentVersionId | Storage growth | schema |
| Official title policy | Title inflation | Never invent titles | Less “optimized” titles | title-policy.ts |
| No protected-board scrape | ToS / blocks | API + paste; presence search optional | Coverage gaps | fetch-url, board-presence |
| Engine feature flag | Migrate safely | `RESUME_ENGINE_VERSION` v2/v3/v4 | Three codepaths to maintain | `resumeEngineVersion()` |

Alternatives only noted where docs/code imply them (e.g. V2 templates vs V3 composer).

---

## 24. Failures, technical debt, and abandoned approaches

| Item | Status |
|---|---|
| YOE false positive on “nobody has 10 years…” | **Resolved** (tests + hard-filters) |
| V2 hard-coded PDF-aligned templates as primary | **Superseded** by V3/V4; kept as `v2` legacy |
| Functional-focus invented titles | **Resolved/deprecated** in title-policy |
| `validateClaims` including generated markdown in corpus | **Partially resolved** — V3 excludes; V2 path still weaker |
| docs/ARCHITECTURE score weights | **Unresolved** doc drift |
| `/profiles/[id]` in ROADMAP | **Unresolved** / not built |
| Gmail in DEPLOY intro | **Intentionally deferred** / not built |
| PDF page-count re-budget | **Deferred** (V3 report) |
| Freeform resume editor | **Deferred** |
| DeliverNoo project | **Intentionally omitted** (no verified inventory) |
| Disputed employment dates | **Deferred** (seeded as-is) |
| Serverless export durability | **Unresolved** operational limitation |
| `updateApplicationAction` deprecated | Kept for leftover forms |
| Aethelgard UI doc in repo | Unrelated product; not CareerOS runtime |

---

## 25. Current limitations (blunt)

- Not multi-user SaaS  
- No autonomous applications  
- No RAG / vector DB / embeddings  
- No LinkedIn/Indeed HTML scraping  
- No guaranteed ATS vendor pass prediction  
- No legal visa advice product  
- No recruiter analytics / interview feedback loops  
- No browser-automation apply bots  
- Salary extraction incomplete for non-EUR / messy text  
- Discovery coverage limited to configured boards/APIs/watchlist  
- Profiles/inventory admin UI incomplete  
- Export files ephemeral on Vercel  
- No formal offline match-accuracy evaluation  
- Critic/LLM quality depends on keys and rate limits  

---

## 26. Roadmap visible in the repository

### Explicit / documented

- Milestone 1 checklist mostly checked (`docs/CHECKLIST.md`)  
- V3 verification “intentionally deferred” list  
- `docs/DEPLOY.md` §5 “After this foundation” (planned, unchecked): daily 25 discovery quality; approve-queue → bulk CV packs; resume quality pass; **Gmail alert parsing**; PDF typography polish; **assisted form-fill + learning loop**  
- ARCHITECTURE: “Scripts + future Vercel Cron”  
- Deploy verify checklist in DEPLOY.md remains unchecked `[ ]` (doc state; not proof of undeployed app)  

### TODO-derived

- Few classic `TODO` markers; debt expressed as deprecated APIs and deferred V3 report items  

### Reasonable architectural extensions (labeled **inference**, not commitment)

- Cron discovery; object storage for exports; richer inventory CMS; E2E tests; eval harness for scoring  

---

## 27. Visual asset inventory (case study)

| Screen | Route | State needed | Proves | Viewport | Redact? |
|---|---|---|---|---|---|
| Dashboard | `/dashboard` | seeded jobs | ops overview | desktop | soft PII in shell |
| Jobs list | `/jobs` | mixed scores | ranking UI | desktop | company names OK |
| Job score detail | `/jobs/[id]` | scored job | explainability | desktop | — |
| Hard reject | `/jobs/[id]` | rejected YOE/geo | filters | desktop | — |
| Import | `/jobs/new` | empty form | ingestion | desktop | — |
| Approve queue | `/approve` | scored batch | HITL queue | desktop | — |
| Profiles | `/profiles` | seeded profiles | positioning | desktop | — |
| Resume Studio | `/resume-studio` | V3/V4 versions | composition/critic | desktop | **yes** — personal contact on CV |
| Keyword fit | job detail | optimizeJson | ATS tooling | desktop | — |
| Validation warnings | studio card | warning status | safeguards | desktop | — |
| Version lineage | studio | parentVersion set | versioning | desktop | — |
| DOCX/PDF output | files / download | generated | export | — | **yes** |
| Applications tracker | `/applications` | rows | tracker | desktop | contacts |
| Settings | `/settings` | — | constraints UI | desktop | contact fields |
| Login | `/login` | auth on | allowlist product | mobile+desktop | — |
| Empty studio | `/resume-studio` | no versions | empty state | desktop | — |
| LLM rate-limit flag | job detail | soft flag | reliability | desktop | — |

Mobile: responsive Tailwind; not a separate mobile app. Capture both if claiming responsive design.

---

## 28. Diagram opportunities

| Title | Purpose | Nodes / edges | Source files | Case-study act |
|---|---|---|---|---|
| End-to-end job workflow | Product narrative | Discover→Parse→Filter→Score→Resume→Track | discover, service, resume/service, applications | Act 1–3 |
| Scoring pipeline | Hybrid AI | Hard filter→heuristic→LLM merge→JobScore | scoring/* | Act 2 |
| Evidence→resume | Trust | Inventory→rank→compose→validate→export | resume/v3/*, validate-content | Act 3 |
| Deterministic vs AI map | Decision ethics | Color-code stages | §18 tables | Act 2 |
| ERD | Data | Prisma models | schema.prisma | Appendix |
| Resume composition | V3 vs V4 | Content→Composition→Theme→Export | resume-studio/* | Act 3 |
| Version lineage | Trust | parent/child ResumeVersion | schema | Act 3 |
| Provider fallback | Reliability | Groq→Gemini→heuristic | llm-judge, critic | Act 2 |
| HITL checkpoints | UX | Approve, studio, apply | approve, resume-studio | Act 1 |
| Application lifecycle | Ops | statuses/tags | applications/constants | Act 4 |
| Project ranking | Algorithms | weights→selectProjectsForPage | rank-projects.ts | Act 3 |

Do not invent quantitative outcome metrics on diagrams.

---

## 29. Strongest portfolio evidence

| Claim theme | Cite |
|---|---|
| Product thinking / HITL | README principles; Approve queue; manual submit disclaimer |
| Full-stack | Next.js app + Prisma schema + Server Actions + Vercel/Supabase docs |
| Applied AI | `llm-judge.ts`, `ats-optimize.ts`, `run-resume-critic.ts` with structured JSON + fallbacks |
| Workflow automation | `runJobDiscovery` multi-source pipeline |
| Data modelling | Extended Experience/Project/ResumeVersion schema; migrations |
| Evaluation / QA | 55 Vitest tests; Arthur Cox fixture tests; V3 verification report |
| Human safeguards | claim validation, title policy, prohibited patterns, estimate flags |
| Self-directed execution | 6 commits Jul 24–Aug 4 2026 building MVP→V4 |
| Design/export systems | arthur-cox theme + DOCX/PDF exporters |
| Explainable scoring | JobScore breakdown + strengths/gaps UI |

---

## 30. Weak or unsupported claims

Do **not** claim without new evidence:

- Autonomous / agentic multi-agent job applications  
- Guaranteed ATS success or hiring outcome prediction  
- Production multi-tenant recruiting SaaS  
- Legal/immigration advisory product  
- Large user base, revenue, hours saved, interview-rate lifts  
- Enterprise-grade security certification  
- Proprietary foundation model  
- RAG / vector database architecture  
- Scraping LinkedIn/Indeed at scale  
- Always-on scheduled discovery in production  
- Perfect salary/YOE extraction  
- That DOCX and PDF are pixel-identical always  
- That Profiles CMS is fully built  

---

## 31. Questions the repository cannot answer

### Origin
- What personal event or week triggered building CareerOS vs using spreadsheets/Notion alone?  
- Why build vs buy existing job-hunt tools?

### Emotional motivation
- What did it feel like to be laid off (seed `layoffDate`) and channel that into a system?  
- Which rejection or false hope most shaped the “evidence-first” rule?

### User problem
- Beyond yourself, who else have you imagined using this?  
- Which daily friction hurt most: discovery, scoring, or CV rewriting?

### Design thinking
- Why dark “ops console” UI vs a calmer consumer look?  
- Which screen are you proudest of and why?

### Pivotal moments
- When did you decide LLM scoring must not override eligibility?  
- What broke that forced Resume Engine V3 over templates?

### Failures
- Worst wrong reject or wrong accept you remember?  
- Resume hallucination that slipped through before validators?

### Trade-offs
- Why Groq free tier over paid higher-quality models as default?  
- Why not auto-apply even with confirmations?

### Ethical decisions
- Boundaries on scraping and account safety?  
- How you think about AI rewriting experience bullets?

### Outcomes
- Jobs actually applied to via CareerOS materials?  
- Interviews or offers influenced? (repo has no outcome metrics)

### Reflections
- What would you rebuild first with three more months?  
- What did shipping V3/V4 teach about “AI product” hype vs determinism?

### Future vision
- Personal tool forever vs productized CareerOS?  
- Notion-tracker depth vs interview-prep features next?

---

## 32. Critical source files

### Minimum source set for the Project Bible (≤30)

1. `README.md` — product principles and scope disclaimer  
2. `prisma/schema.prisma` — full data model  
3. `src/lib/types.ts` — score weights, profile keys, project rank weights  
4. `src/lib/jobs/discover.ts` — discovery pipeline  
5. `src/lib/jobs/parse-job.ts` — deterministic parsing  
6. `src/lib/jobs/service.ts` — import + score orchestration  
7. `src/lib/jobs/fetch-url.ts` — blocked hosts / fetch policy  
8. `src/lib/scoring/hard-filters.ts` — eligibility and YOE rules  
9. `src/lib/scoring/score-job.ts` — heuristic fit engine  
10. `src/lib/scoring/llm-judge.ts` — LLM-as-judge + merge  
11. `src/lib/resume/v3/compose-resume.ts` — V3 orchestrator  
12. `src/lib/resume/v3/role-policy.ts` — role strategies  
13. `src/lib/resume/v3/title-policy.ts` — title integrity  
14. `src/lib/resume/v3/rank-projects.ts` — project ranking  
15. `src/lib/resume/v3/validate-content.ts` — claim validation V3  
16. `src/lib/resume/service.ts` — v2/v3/v4 generation entry  
17. `src/lib/resume-studio/composition/compose-document.ts` — layout composition  
18. `src/lib/resume-studio/themes/index.ts` — visual themes  
19. `src/lib/resume-studio/critic/run-resume-critic.ts` — critic  
20. `src/lib/resume/export-docx.ts` — DOCX/PDF export  
21. `src/lib/resume/ats-optimize.ts` — keyword fit + LLM edits  
22. `src/lib/ai/types.ts` — `PROMPT_GUARDRAILS` + provider interfaces  
23. `src/app/actions.ts` — all server actions  
24. `src/lib/auth/middleware.ts` — auth gate + allowlist  
25. `src/lib/applications/constants.ts` — tracker vocabulary  
26. `docs/V3_VERIFICATION_REPORT.md` — verified V3 status + deferred list  
27. `docs/DEPLOY.md` — operational deploy reality  
28. `tests/arthur-cox-corrections.test.ts` — high-signal fixture tests  
29. `tests/hard-filters.test.ts` — filter + YOE regression  
30. `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` — original product intent / source-of-truth spec  

---

## Appendix A — Server actions inventory

From `src/app/actions.ts`:  
`importJobAction`, `rescoreJobAction`, `updateJobDescriptionAction`, `generateResumeAction`, `analyzeResumeKeywordsAction`, `suggestResumeAtsEditsAction`, `applyResumeAtsEditsAction`, `recordApplicationAction`, `patchApplicationAction`, `createBlankApplicationAction`, `reorderApplicationsAction`, `deleteApplicationAction`, `updateApplicationAction` (deprecated), `updateSettingsAction`, `runDiscoveryAction`, `prepareResumePacksAction`, `saveJobsAction`.

## Appendix B — HTTP routes

- `GET /api/resumes/[id]/download`  
- `GET /auth/callback`  
- `POST /auth/signout`  
- App pages: `/`, `/dashboard`, `/jobs`, `/jobs/new`, `/jobs/[id]`, `/approve`, `/profiles`, `/resume-studio`, `/applications`, `/settings`, `/login`

## Appendix C — Doc conflicts to resolve in Bible writing

- `docs/ARCHITECTURE.md` scoring weights ≠ `src/lib/types.ts`  
- `docs/ROADMAP.md` actions/routes slightly stale vs `actions.ts` / missing `/approve`; lists `/profiles/[id]` which does not exist  
- `docs/DATA_MODEL.md` still mentions SQLite MVP language; schema is PostgreSQL  
- README Milestone table predates V3/V4 depth  
- `docs/RESUME_ENGINE_V3.md` / some docs imply default engine **v3**; code + `.env.example` default **`RESUME_ENGINE_VERSION=v4`**  
- `docs/PROJECT_SELECTION.md` says RedVelvetVault “not forced”; **code** `selectProjectsForPage` forces RVV on AI-profile **2-page** resumes  

## Appendix D — Follow-up audit errata (2026-08-04)

Corrections incorporated from deeper resume/scoring passes after the first historian draft:

1. **Experience rank formula** (`rank-experience.ts`): per-exp score ≈ `themeHits*0.35 + jdHits*0.25 + recency*0.25 + (1/(sortOrder+1))*0.15 + relevanceScore*0.5`; display sort still `preferredOrderByRole` → `relevanceScore` → `chronologyIndex`.  
2. **Intelligence ATS score:** 10 dimensions 0–10 → `total = round(avg/10 * 100)` (`scoreAtsIntelligence`).  
3. **Greenhouse board count:** discover lists ~47 Greenhouse slugs (plus Lever 9, Ashby 12, watchlist 14) — approximate; treat as configured lists in `discover.ts` / `ireland-watchlist.ts`, not marketing “50+”.  
4. **Studio Accept/Reject / critic auto-improve / theme stubs / theme preview vs export** — see §16.  
5. **`updateApplicationAction`** remains exported but `@deprecated` in favor of `patchApplicationAction`.  

---

*End of CareerOS Project Historian. Next step (human/other AI): founder interview using §31 only.*
