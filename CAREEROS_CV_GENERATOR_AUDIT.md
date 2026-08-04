# CareerOS CV Generator Architecture Audit

**Status:** Evidence-based audit of the *current* system only.  
**Scope:** No design, no upgrade proposal, no application code changes.  
**Repo root:** `F:/Apps/JobHunter` (GitHub: `rosh-the-coder/career-os`)  
**Audit date:** 2026-08-03  

This document exists so another AI can plan a major CV-generation upgrade against verified reality.

---

## 1. Repository overview

### Stack

| Layer | Actual |
|---|---|
| Frontend | Next.js 15 App Router, React 19, Tailwind CSS 4 |
| Backend | Same Next.js app (Server Actions + Route Handlers). No separate API server. |
| Languages | TypeScript (primary), SQL via Prisma |
| Package manager | npm (`package-lock.json`) |
| Deployment | Vercel (`career-os` → production URL `https://career-os-topaz-nu.vercel.app`) |
| Persistence | Prisma → Supabase PostgreSQL (`DATABASE_URL` pooler + `DIRECT_URL`) |
| Local DB path | Also supports SQLite historically in docs; production schema inspected on Supabase Postgres |
| Auth | Supabase Auth (magic link) + `ALLOWED_EMAILS` allowlist; `DEV_BYPASS_AUTH` for local |
| AI | Groq (primary LLM judge / ATS suggest), Gemini (fallback), deterministic heuristics |
| Docs export | `docx` + `pdfkit` |

### Relevant environment variables (names only; from `.env.example`)

- `DATABASE_URL`, `DIRECT_URL`
- `DEV_BYPASS_AUTH`, `NEXT_PUBLIC_DEV_BYPASS_AUTH`
- `ALLOWED_EMAILS`
- `GEMINI_API_KEY`, `GEMINI_SCORE_MODEL`
- `RESUME_DETERMINISTIC_ONLY` (default treated as deterministic; see §8)
- `GROQ_API_KEY`, `GROQ_SCORE_MODEL`, optional `SCORE_LLM_DISABLED`
- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
- `BRAVE_SEARCH_API_KEY`, `SERPAPI_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Relevant folder tree (CV / profile / evidence / export)

```text
F:/Apps/JobHunter
├─ CAREEROS_CV_GENERATOR_AUDIT.md          ← this file
├─ package.json
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                              ← master career inventory seed
├─ src/
│  ├─ app/
│  │  ├─ actions.ts                        ← generate/analyze/suggest/apply resume actions
│  │  ├─ profiles/page.tsx
│  │  ├─ resume-studio/page.tsx
│  │  ├─ jobs/[id]/page.tsx                ← generate CV + CV keyword fit UI
│  │  ├─ jobs/new/page.tsx
│  │  ├─ approve/page.tsx
│  │  ├─ applications/page.tsx
│  │  ├─ settings/page.tsx
│  │  └─ api/resumes/[id]/download/route.ts
│  ├─ components/
│  │  └─ cv-keyword-fit.tsx
│  └─ lib/
│     ├─ ai/
│     │  ├─ provider.ts                    ← Gemini/Deterministic providers (mostly unused)
│     │  └─ types.ts                       ← ResumeGenerationInput, PROMPT_GUARDRAILS
│     ├─ resume/
│     │  ├─ reference-templates.ts         ← ACTIVE CV composer (hard-coded)
│     │  ├─ service.ts                     ← generateResumeForJob + ATS optimize orchestration
│     │  ├─ compose.ts                     ← dormant deterministic composer + validateClaims
│     │  ├─ export-docx.ts                 ← DOCX + PDF from AtsResumeContent
│     │  └─ ats-optimize.ts                ← keyword coverage + LLM edit suggestions
│     ├─ scoring/
│     │  ├─ score-job.ts
│     │  ├─ hard-filters.ts
│     │  └─ llm-judge.ts
│     ├─ jobs/
│     │  ├─ service.ts                     ← importAndScoreJob, scoreExistingJob
│     │  ├─ parse-job.ts                   ← live JD parser (deterministic)
│     │  └─ tech-terms.ts
│     ├─ types.ts                          ← PROFILE_KEYS, SCORE_WEIGHTS
│     └─ db/prisma.ts
├─ data/
│  ├─ resume-references/extracted/         ← reference CV text extracts
│  └─ exports/                             ← generated DOCX/PDF/MD (local)
├─ docs/
│  ├─ RESUME_STANDARDS.md
│  ├─ CHATGPT_RESUME_PROMPTS.md
│  ├─ PROMPT_GUARDRAILS.md
│  ├─ DATA_MODEL.md
│  └─ ARCHITECTURE.md
└─ tests/
   ├─ ats-optimize.test.ts
   ├─ export-links.test.ts
   ├─ score-job.test.ts
   ├─ llm-judge.test.ts
   └─ hard-filters.test.ts
```

**Not present (despite older docs mentioning them):**

- `src/lib/career-data/`
- `templates/` DOCX template assets
- `prisma/migrations/`
- Dedicated prompt registry / `.prompt` files
- Seeded `Project` for **CareerOS** or **DeliverNoo**

---

## 2. Current CV-generation workflow

### End-to-end flow (as implemented)

```text
Job imported (paste/URL)
  → parseJobText (deterministic)
  → hard filters + scoreJob (+ optional runLlmJudge)
  → Job + JobScore persisted (recommended profile + projects)
  → User clicks Generate 1-page / 2-page (or Approve → Prepare packs)
  → generateResumeForJob
      → picks JobScore.profile (else default CareerProfile)
      → buildReferenceAtsContent(profile.key, contact, {jobTitle, company})
      → optional bullet truncation for 1-page
      → validateClaims
      → generateDocxAndPdf
      → ResumeVersion row + job.status = materials_ready
  → Optional: Analyze keywords → Suggest edits → Apply selected
  → Download via /api/resumes/[id]/download
```

### Stage table

| Stage | Status | File / symbol | Persistence | Notes |
|---|---|---|---|---|
| Job imported | **Fully implemented** | `src/lib/jobs/service.ts` → `importAndScoreJob`; UI `jobs/new`; action in `src/app/actions.ts` | `Job` | URL fetch or paste; blocked hosts require paste |
| Job parsed | **Fully implemented (deterministic)** | `src/lib/jobs/parse-job.ts` → `parseJobText` | Fields on `Job` (`requirementsJson`, `keywordsJson`, etc.) | Gemini `extractJob` exists in `provider.ts` but **has no call sites** |
| Role/profile selected | **Fully implemented (scoring)** | `score-job.ts` → `pickProfile`; LLM may override via `runLlmJudge` | `JobScore.profileId` | Used later for CV title/summary variant only |
| Candidate evidence selected | **Partial / scoring-only** | `score-job.ts` → `projectRelevance` | `JobScore.recommendedProjectsJson`, `evidenceUsedJson` | **Not consumed by CV generation** |
| Resume content generated | **Fully implemented but hard-coded** | `reference-templates.ts` → `buildReferenceAtsContent`; orchestrated by `generateResumeForJob` | `ResumeVersion.contentJson`, `markdown` | Does **not** load Prisma `Project` / `Experience` rows into the CV body |
| Claims validated | **Partially implemented** | `compose.ts` → `validateClaims` | `ResumeVersion.validationJson`, `validationStatus` | Blocks only hard prohibited patterns; numeric checks weakened (see §7) |
| DOCX generated | **Fully implemented** | `export-docx.ts` → `generateDocxAndPdf` | `ResumeVersion.docxPath` | Library: `docx` |
| PDF generated | **Fully implemented with fallback** | `export-docx.ts` → `buildAtsPdfBuffer` | `ResumeVersion.pdfPath` (nullable) | Library: `pdfkit`; PDF failure does not block DOCX |
| Resume displayed / downloaded | **Fully implemented** | `resume-studio/page.tsx`; `jobs/[id]/page.tsx`; `api/resumes/[id]/download/route.ts` → `GET` | Files under `data/exports` or `/tmp/career-os-exports` | Download regenerates if file missing |

### Entry points (exact)

| Entry | Symbol | Calls |
|---|---|---|
| Job detail generate | `generateResumeAction` in `src/app/actions.ts` | `generateResumeForJob(jobId, pageLength)` |
| Approve queue packs | `prepareResumePacksAction` in `src/app/actions.ts` | always `generateResumeForJob(jobId, 1)` |
| Keyword analyze | `analyzeResumeKeywordsAction` | `analyzeResumeKeywordsForJob` |
| Suggest edits | `suggestResumeAtsEditsAction` | `suggestResumeAtsEditsForJob` |
| Apply edits | `applyResumeAtsEditsAction` | `applyResumeAtsEditsForJob` |
| Core generator | `generateResumeForJob` in `src/lib/resume/service.ts` | `buildReferenceAtsContent` → `persistAtsResumeVersion` |
| Persist + export | `persistAtsResumeVersion` | `validateClaims` → `generateDocxAndPdf` → `prisma.resumeVersion.create` |

### Input / output shapes (generation)

**Input (effective):**

- `jobId`, `pageLength: 1 | 2`
- Contact from `Settings` + `User`
- `CareerProfile.key` from score or default
- Job `title` / `company` (appended into summary as “Targeting …”)

**Output object:** `AtsResumeContent` (`export-docx.ts`)

```ts
{
  documentTitle, contactLine, linksLine, linkUrls?,
  profile, skills,
  projects: [{ dates, name, blurb, role, bullets, links? }],
  experiences: [{ dates, title, company, location?, companyBlurb?, bullets }],
  education: [{ dates, line, details? }],
  technicalStack: [{ group, items }]
}
```

Persisted as:

- `contentJson`: `{ draft, ats }`
- `markdown`: from `atsToMarkdown`
- `docxPath` / `pdfPath` / `fileName`
- `promptVersion`: `"v2-reference-pdf-aligned"` (initial) or `"v2-ats-optimize"` (after apply)
- `modelVersion`: `"reference-template-v1"` or `"ats-optimize:<provider>"`

### External services in this path

| Service | Used in CV gen? |
|---|---|
| Groq | Only for ATS *suggest edits* (and separately for scoring judge) |
| Gemini | Fallback for ATS suggest; dormant resume rewrite provider |
| Supabase | Auth + Postgres |
| None for initial CV body | Initial body is **100% hard-coded templates** |

### Error handling

- Hard-rejected jobs: `generateResumeForJob` throws `"Cannot generate resume for hard-rejected job"`
- Claim block: throws if `blockedClaims.length > 0`
- Export failure: throws with outDir detail
- PDF write failure: logged; DOCX still saved; `pdfPath` may be null
- Download route regenerates from `contentJson` if disk file missing

### Planned / unused / mocked

| Item | Label |
|---|---|
| `getLLMProvider()` / `GeminiProvider.generateResume` | **Unused** by live generation path (no call sites outside `provider.ts`) |
| `composeResumeDeterministic` | **Unused** by live generation; only via dormant provider |
| DB `Project` / `Experience` / `CareerProfile.positioning` as CV source | **Unused** by `buildReferenceAtsContent` |
| `JobScore.recommendedProjectsJson` for CV project selection | **Unused** |
| ChatGPT paste-into-Studio workflow in `docs/CHATGPT_RESUME_PROMPTS.md` | **Documented / partial** — Studio has no Markdown paste editor |
| Resume template DB / `.docx` templates | **Planned in build spec / absent** |

---

## 3. Current profile model

Career information is **not** a single master-resume document. It is split across:

1. **Database inventory** (seeded in `prisma/seed.ts`)
2. **Hard-coded reference CV templates** (`src/lib/resume/reference-templates.ts`) — *what actually prints*
3. **Docs / ChatGPT prompts** (`docs/CHATGPT_RESUME_PROMPTS.md`, build spec)

### Where each field lives

| Field | Storage | Used in printed CV? |
|---|---|---|
| Name | `User.name` | Yes (hard-coded “ROSHAN NAJAR” + role in template) |
| Contact email / phone / links | `Settings` | Yes via `contactBlock` |
| Location | `Settings.location` | Contact line hard-codes “County Dublin, Ireland” |
| Visa / eligibility | `Settings` (`currentPermission`, Stamp 1G dates, sponsorship flags) | Scoring/filters only — **not printed on CV** |
| Target roles | `CareerProfile` rows (5 keys) | Profile key selects template variant |
| Professional summary | DB `CareerProfile.positioning` **and** hard-coded `profileCopy()` | **Printed summary comes from `profileCopy`, not DB** |
| Skills | `Skill` table **and** hard-coded skills arrays in `profileCopy` + `STACK_BASE` | Printed skills from `profileCopy`; stack from `STACK_BASE` |
| Employment history | `Experience` table **and** `IRISH_AI` / `EXPERIENCE_COMMON` constants | **Printed from constants** |
| Education | Evidence items in seed + hard-coded `EDUCATION` | **Printed from `EDUCATION` constant** |
| Projects | `Project` table **and** `RVV_PRODUCT` / `RVV_DESIGN_ENG` | **Printed project = RedVelvetVault only** |
| Links | `Settings` | Yes |
| Metrics | `Metric` linked to `EvidenceItem` | Not dynamically inserted; some numbers embedded in template bullets |
| Claims / evidence | `EvidenceItem` (+ `prohibitedClaimsJson`) | Loaded for validation corpus only |
| Preferred titles | `Experience.alternativeTitlesJson` (Irish AI only) | Partially mirrored in template `irishTitle` switch; **DB JSON not read at generate time** |
| Excluded content | `PROMPT_GUARDRAILS`, `PROHIBITED_PATTERNS`, project `constraintsJson` | Patterns enforced in validate; constraints not auto-enforced beyond prompts |

### Actual Prisma shapes (summary)

See `prisma/schema.prisma` for full fields. Critical models:

- **CareerProfile:** `key`, `name`, `positioning`, `keywordsJson`, `evidenceOrderJson`, `isDefault`
- **Experience:** `company`, `umbrellaTitle`, `startDate`, `endDate`, `alternativeTitlesJson`, `themesJson`, `bulletsJson`, `verified`
- **Project:** `key`, `name`, `type`, `status`, `primaryRole`, `stackJson`, `featuresJson`, `outcomesJson`, `useAsEvidenceForJson`, `constraintsJson` — **no date fields**
- **EvidenceItem / Metric:** verification, confidence, estimates, `approvedForCV`
- **Settings:** contact + immigration targeting

### Duplication / inconsistency risks (verified)

| Topic | DB seed | Printed template |
|---|---|---|
| Irish AI title | `umbrellaTitle` + `alternativeTitlesJson` | Hard-coded `IRISH_AI` + profile-based title overrides |
| Irish AI dates | `2026-03` → `2026-07-17` | `Mar 2026 — Jul 2026` |
| Independent dates | `2023`–`2026` | `Oct 2024 — 2026` |
| Two Blokes dates | `2024`–`2025` | `Jan 2025 — 2025` |
| Arcop dates | `2019`–`2019` | `Jul 2022 — Mar 2023` |
| Project set | RVV, Dublin Gold, Aethelgard | **Only RVV printed** |
| Positioning text | DB `positioning` | Different hard-coded `profile` paragraphs |

**Risk:** editing seed/DB does **not** change generated CVs until `reference-templates.ts` is updated. Scoring and Profiles UI show DB truth; exports show template truth.

---

## 4. Role profiles

Canonical keys: `PROFILE_KEYS` in `src/lib/types.ts`.

| key | Seed name | Default? | CV title (`profileCopy`) | Summary source | Skills source | Project bullets on CV | Experience title tweak | Scoring keywords (seed) | evidenceOrder (seed) |
|---|---|---|---|---|---|---|---|---|---|
| `ux_engineer` | UX Engineer | **Yes** | UX Engineer | Eng shared copy | Eng skills list | `RVV_DESIGN_ENG` | Design Engineer — AI Automation… | React, TS, Figma, a11y, … | RVV, Independent, Aethelgard, Dublin Gold |
| `design_engineer` | Design Engineer | No | Design Engineer | Eng shared copy | Eng skills list | `RVV_DESIGN_ENG` | Design Engineer — AI Automation… | React, design systems, API, … | RVV, Aethelgard, Dublin Gold, Irish AI, Independent |
| `product_designer` | Product Designer | No | Product Designer | Product copy | Product skills | `RVV_PRODUCT` | Product Designer — AI Workflows… | UX research, prototyping, … | RVV, Irish AI, Aethelgard, Independent, Two Blokes |
| `applied_ai` | Applied AI / Automation | No | **AI Product Design Engineer** | AI shared copy | AI skills list | `RVV_PRODUCT` (not Dublin Gold) | `IRISH_AI.title` | Python, APIs, automation, … | **Dublin Gold, Aethelgard, Irish AI, RVV** |
| `ai_creative` | AI Creative Technologist | No | AI Creative Technologist | AI shared copy | AI skills list | `RVV_PRODUCT` | `IRISH_AI.title` | Generative AI, Veo, … | Irish AI, Aethelgard, Dublin Gold, RVV, Two Blokes |

### Scoring weights (global, not per-profile)

From `SCORE_WEIGHTS` in `src/lib/types.ts`:

| Dimension | Weight |
|---|---:|
| skillsOverlap | 20 |
| evidenceStrength | 16 |
| projectRelevance | 14 |
| seniorityFit | 22 |
| currentEligibility | 10 |
| longTermPermit | 6 |
| locationFit | 6 |
| salaryFit | 3 |
| careerAlignment | 3 |

### Visa / eligibility

Handled in `hard-filters.ts` + Settings — **shared across profiles**, not profile-specific resume rules.

### Resume length preference

- UI offers 1-page and 2-page buttons on job detail.
- 1-page: truncate project bullets to 5 and experience bullets to 4 (`generateResumeForJob`).
- Approve “Prepare packs” **always** generates 1-page.
- No per-profile length preference stored.

### Template preference

- Single ATS layout for all profiles (`AtsResumeContent` → DOCX/PDF).
- Variant = copy + RVV product vs eng bullets + Irish AI title switch.

### Missing / poorly defined profiles (relative to upgrade goals)

| Desired / mentioned | Present? |
|---|---|
| AI Engineer (literal) | **No dedicated profile**; Arthur Cox maps to `applied_ai` but CV title becomes “AI Product Design Engineer” |
| Frontend Engineer | **Absent** |
| Product Engineer | **Absent** |
| AI Product Engineer | Partial via `applied_ai` naming mismatch |
| Automation Engineer | Partial via `applied_ai` keywords only |
| UX/UI Designer | **Absent** as distinct key (product_designer covers design) |

---

## 5. Project representation

### Schema (`Project` in `prisma/schema.prisma`)

Fields: `id`, `userId`, `key`, `name`, `type`, `status`, `primaryRole`, `stackJson`, `featuresJson`, `outcomesJson`, `useAsEvidenceForJson`, `constraintsJson`, `verified`, `sortOrder`, timestamps.  
**No:** start/end dates, URL fields, resume-bullet field, problem/decision fields as first-class columns (those live inside JSON strings / docs).

### Seeded projects (DB + seed.ts) — complete list

| key | name | status | primaryRole | Known in system? |
|---|---|---|---|---|
| `redvelvetvault` | RedVelvetVault | shipped | Product Design Engineer / Product Designer & Developer | **Yes** |
| `dublin_gold_testing` | Dublin Gold Testing B2B Growth Engine | operational | Applied AI & Workflow Automation Specialist | **Yes** (DB + scoring; **not** on printed CV) |
| `aethelgard` | Aethelgard Art Co. Production Suite | in_development | Product builder / AI tooling | **Yes** (DB + scoring; **not** on printed CV) |

### Explicit checks

| Project | In DB seed? | In printed CV templates? | In docs/prompts? |
|---|---|---|---|
| Aethelgard | Yes | No | Yes |
| CareerOS | **No** | No | Yes (product docs / technical audit claims) |
| RedVelvetVault | Yes | **Yes (only selected project)** | Yes |
| DeliverNoo | **No occurrences in repo search** | No | No |
| Dublin Gold Testing B2B Growth Engine | Yes | No (except one Irish AI bullet mentions Dublin Gold Testing) | Yes |

### How projects are chosen for a CV today

1. Scoring: `projectRelevance()` ranks up to 3 projects into `JobScore.recommendedProjectsJson`.
2. Generation: **ignores that list**. Always inserts exactly one project object: `RVV_PRODUCT` or `RVV_DESIGN_ENG`.

### Capability checklist (current)

| Capability | Supported? |
|---|---|
| Select 2–3 projects dynamically for CV | **No** (scoring only) |
| Change project order on CV | **No** |
| Rewrite bullets by target role | Partial: two hard-coded RVV variants; ATS suggest can rewrite existing bullets |
| Preserve verified facts | Intended via templates + validateClaims; not DB-driven |
| Exclude weaker projects | N/A on CV (only one project) |
| Distinguish shipped vs academic | DB `status` / `type` exist; CV does not branch on them |
| Display project dates | Hard-coded on RVV (`Mar 2025 — Dec 2025`); Project model has no dates |
| Include project links | Placeholder text `[Website LINK] [Show-reel LINK] [Project Report]` in DOCX/MD; PDF skips placeholders |

---

## 6. Work-experience representation

### Schema (`Experience`)

`company`, `umbrellaTitle`, `location`, `startDate`, `endDate`, `isCurrent`, `alternativeTitlesJson`, `themesJson`, `bulletsJson`, `verified`, `sortOrder`.

### Seeded experiences

1. Irish AI Creative / South Dublin Auction House — `AI Creative Technologist & Automation Builder` (`2026-03` → `2026-07-17`)
2. Two Blokes Trading — `Content Systems & Growth Collaborator`
3. Independent — `Product Designer & Frontend Implementer`
4. Arcop Associates — `Architectural Intern`

### Printed experiences (template order)

1. Irish AI Creative (always first)
2. Independent
3. Two Blokes Trading
4. Arcop Associates

### Role-title handling (Irish AI expansion)

**DB:** `alternativeTitlesJson` includes:

- `product` → Product Designer — AI Workflows & Internal Tools  
- `design_engineering` → Design Engineer — AI Automation & Creative Systems  
- `applied_ai` → Applied AI & Workflow Automation Specialist  
- `general` → AI Creative Technologist  

**Printed CV:** `buildReferenceAtsContent` switches `irishTitle` by `profileKey` (product / eng / else `IRISH_AI.title`). It does **not** read `alternativeTitlesJson` from Prisma.

Company blurb in template explicitly states expansion from video editing into AI workflows, internal tooling, automation, and layoff on 17 Jul 2026.

### Truthful functional title vs official context

- **Partially supported** via hard-coded title variants + company blurb.
- **Not a general mechanism:** no generator API that picks `alternativeTitlesJson[profile]` while binding to employer/dates from DB.
- Metrics/bullets for Irish AI in template are fixed prose, not composed from `themesJson`/`bulletsJson`.

### Role-specific rewriting

| Mechanism | Scope |
|---|---|
| Template title switch | Irish AI only |
| Independent bulletsProduct vs bulletsEng | Eng vs non-eng profiles |
| Two Blokes / Arcop | Same bullets for all profiles |
| ATS suggest edits | Can rewrite any existing bullet path after generation |

---

## 7. Evidence and claim validation

### Evidence schema

`EvidenceItem`: `type`, `title`, `description`, `source`, `verified`, `confidence`, `allowedProfilesJson`, `keywordsJson`, `prohibitedClaimsJson`, `notes`, `isEstimate`, `needsReview`, optional `experienceId` / `projectId`.

`Metric`: `label`, `value`, `valueText`, `unit`, `exact`, `source`, `approvedForCV`, `isEstimate`, `needsReview`.

### Validation pipeline (`validateClaims` in `compose.ts`)

Inputs: `ResumeDraft`, `allowedEvidenceTexts[]`, `estimateLabels[]`.

Checks:

1. **Prohibited regexes** (`PROHIBITED_PATTERNS`): senior AI engineer, ML engineer, data scientist, successful Etsy business, passive income, PhD, model training → `blockedClaims` → status `failed` → generation throws.
2. **Numeric tokens** in summary/bullets must appear in evidence corpus *or* text contains `"estimat"` → otherwise soft unsupported claim.
3. Every estimate metric label → `estimateWarnings`.

Status:

- `failed` if any blocked claim
- `warning` if unsupported numbers or estimate warnings
- `passed` otherwise

### Classification mapping (actual vs desired vocabulary)

| Desired label | Actual system behavior |
|---|---|
| verified | DB flag `EvidenceItem.verified` / `Metric.approvedForCV` — **not used to classify generated bullets** |
| reported | **Not a formal status** |
| estimated | Metrics with `isEstimate`/`needsReview` → warning strings; UI `EstimateTooltip` |
| inferred | **Not modeled** |
| unsupported | Numeric not in corpus → `claims[].supported=false` |
| warning | `validationStatus = "warning"`; Studio shows estimate warnings |
| blocked | Prohibited pattern → throw on persist |

### UI surfaces

- Resume Studio: `StatusPill` on `validationStatus`; estimate warnings list; evidence count from `evidenceUsedJson`
- Job detail: CV keyword fit claim notes on suggested edits (`claimStatus`)
- Profiles: estimate tooltips on metrics

### Paths where overstatement can occur

1. **Hard-coded template bullets** can assert anything; validation only catches listed patterns + bare numbers.
2. **`loadEvidenceBundle` includes the generated markdown itself** in `evidenceTexts`, so numbers present in the CV automatically “exist” in the corpus — **weakens numeric validation for initial generation**.
3. `EvidenceItem.prohibitedClaimsJson` is seeded but **never loaded into `validateClaims`**.
4. `Metric.approvedForCV === false` does not block printing if the number is hard-coded in templates.
5. LLM ATS suggest can introduce wording; blocked edits are discarded, but non-numeric unsupported claims are not deeply checked.
6. LLM judge strengths for Arthur Cox mention RAG/NLP proficiency that may **overreach** relative to seeded evidence (scoring text, not CV body — but stored on `JobScore`).

---

## 8. LLM and prompt system

### Live prompts

| Purpose | Path / symbol | Provider | Structured output | Used by CV gen? |
|---|---|---|---|---|
| Job-fit judge | `src/lib/scoring/llm-judge.ts` → `buildJudgePrompt`, `runLlmJudge` | Groq then Gemini; heuristic fallback | JSON score breakdown + profile + projects | Scoring only |
| ATS edit suggestions | `src/lib/resume/ats-optimize.ts` → `buildSuggestPrompt`, `suggestAtsEdits` | Groq then Gemini | ≤8 path-based edits JSON | Post-CV optimize |
| Shared guardrails | `PROMPT_GUARDRAILS` in `src/lib/ai/types.ts` | prepended to Gemini/ATS prompts | n/a | Yes (optimize / dormant resume) |

### Dormant prompts (`src/lib/ai/provider.ts`)

| Method | Status |
|---|---|
| `GeminiProvider.extractJob` | Implemented; **no call sites** (live path uses `parseJobText`) |
| `GeminiProvider.generateResume` | Implemented; **no call sites** |
| `GeminiProvider.generateAnswers` | Implemented; **no call sites** found for application Q&A generation in resume flow |
| `getLLMProvider()` | Returns Deterministic unless `RESUME_DETERMINISTIC_ONLY === "false"`; **unused** by `generateResumeForJob` |

### Human / external prompts (not executed by app)

- `docs/CHATGPT_RESUME_PROMPTS.md` — per-profile ChatGPT instructions
- `docs/PROMPT_GUARDRAILS.md` — documentation of guardrails
- `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` — product spec, not imported

### Prompt characteristics

| Trait | Reality |
|---|---|
| Hard-coded | Yes (TS string templates) |
| Templated | Light string interpolation |
| Stored externally | No |
| Versioned | Resume versions store `promptVersion` string only |
| Tested | Judge merge tested (`tests/llm-judge.test.ts`); ATS coverage tested; **prompt golden tests absent** |
| Token limits | JD/evidence sliced in prompts (e.g. job text slice in dormant extract; ATS uses JD excerpt) — no formal budget framework |
| Retry | Provider failover Groq→Gemini→heuristic; Gemini quota → fallback null |

### Current weaknesses (observed)

- Initial CV not LLM-tailored to JD beyond “Targeting {title} at {company}…” suffix.
- Judge can recommend Dublin Gold + Aethelgard; CV still emits RVV-only.
- ATS suggest limited to rewriting existing paths — cannot insert new projects/sections.
- `applied_ai` CV title “AI Product Design Engineer” poorly matches “AI Engineer” JDs.

---

## 9. ATS targeting

### JD parsing (`parse-job.ts`)

Deterministic extraction of title/company/location/remote/salary/seniority/years/sponsorship, keyword hits from `TECH_KEYWORDS`, section bullets when headers match.

Arthur Cox live row (Supabase):

- keywordsJson ≈ `["Python","Azure","UI","AI"]`
- requirementsJson ≈ `[]` (empty — parser did not capture structured requirements)

### CV keyword fit (`ats-optimize.ts` + `CvKeywordFit`)

1. `collectJdTerms` — union of job keywords, `TECH_HINTS`, `TECH_KEYWORDS`, skill inventory aliases present in JD.
2. `analyzeCvKeywordCoverage` — matched / missing / presentButWeak / overlapPercent.
3. Optional LLM `suggestAtsEdits` — rewrite existing content paths only.
4. Human selects edits → new `ResumeVersion`.

### What it does / does not do

| Check | Supported? |
|---|---|
| Raw overlap % | Yes |
| Synonyms | Partial via skill aliases + tech term list — not general NLP synonyms |
| Truthful vs stuffing | Soft: edits claim-validated; no stuffing score |
| Section titles | Implicit via markdown section scrape for skills-only weakness |
| Skill placement | Yes (`presentButWeak` if skills-only) |
| Bullet evidence depth | No semantic evidence linking |
| Formatting / length ATS checks | No |
| Missing essentials (education, etc.) | No |
| Vendor ATS simulation | Explicitly **not** — labeled keyword overlap |

Arthur Cox latest resume versions: `optimizeJson` is **null** (keyword fit not run / not cached on those rows).

---

## 10. Resume templates and layouts

### Templates that exist

| Name | Kind | Target |
|---|---|---|
| Reference ATS layout | Single programmatic template | All profiles |
| RVV Product bullets | Content variant | Non-eng profiles |
| RVV Design Eng bullets | Content variant | `design_engineer`, `ux_engineer` |
| Extracted reference TXT files | Source material | `data/resume-references/extracted/*` |

**No** separate DOCX template files, no multi-template selector, no per-role layout objects.

### Layout (from `RESUME_STANDARDS.md` + exporters)

Section order:

1. Title (`ROSHAN NAJAR, <Role>`)
2. Contact line
3. LINKS
4. PROFILE
5. SKILLS
6. SELECTED PROJECTS
7. PROFESSIONAL EXPERIENCE
8. EDUCATION
9. TECHNICAL STACK

### Typography / geometry

| | DOCX | PDF |
|---|---|---|
| Font | Calibri | Helvetica / Helvetica-Bold |
| Margins | ~0.55–0.65 in | A4 ~40–48 pt |
| Columns | Single | Single |
| Tables | None | None |
| Icons / skill bars | None | None |
| Headers/footers | None | None |
| Hyperlinks | Plain URLs in LINKS line | Clickable LinkedIn/Portfolio/Github labels |

### ATS risk assessment

- **Safest current template:** the single-column Calibri/Helvetica text flow (no text boxes, no multi-column tables, no images, no graphical bars).
- Risks: placeholder `[Website LINK]` strings in DOCX; dense length on 2-page; contact location hard-coded “County Dublin”.

---

## 11. DOCX generation

| Item | Detail |
|---|---|
| Library | `docx` (`Document`, `Packer`, `Paragraph`, `TextRun`, `convertInchesToTwip`) |
| Generator | `generateDocxAndPdf` in `src/lib/resume/export-docx.ts` |
| Template loading | None — paragraphs built in code |
| Styles | No named Word styles; direct TextRun props |
| Bullets | Literal `• ` prefix in paragraph text (not Word list styles) |
| Page breaks | None explicit |
| Hyperlinks | URLs as plain text in LINKS line (ATS-oriented) |
| Naming | `buildResumeFileName(role, company)` → `Roshan_Najar_<Role>_<Company>_<YYYY-MM-DD>` |
| Storage | `data/exports` locally; `os.tmpdir()/career-os-exports` on Vercel |
| Validation | Claim validation before write; no DOCX schema validation |
| Tests | `tests/export-links.test.ts` (link helpers only) — **no full DOCX render test** |

### Known issues

- Non-standard bullets (`•` text) rather than Word list numbering.
- Project link placeholders not real hyperlinks.
- No enforcement of one-page geometry beyond truncating bullet counts.
- Deprecated `generateDocx(draft, …)` still present.

---

## 12. PDF generation

| Item | Detail |
|---|---|
| Method | Direct `PDFDocument` draw from same `AtsResumeContent` |
| Dependency | `pdfkit` (+ `serverExternalPackages` in `next.config.ts`) |
| Same content model as DOCX? | **Yes** (`AtsResumeContent`) — **not** DOCX→PDF conversion |
| Hyperlinks | Clickable labels via `writePdfLinksRow`; skips project placeholder links |
| Failure mode | Catch → `pdfPath = null`; download route can regenerate in memory |
| Page count | Not measured/validated in code |
| Discrepancies vs DOCX | PDF omits project `links` placeholders; different fonts/margins; DOCX shows raw URLs |

---

## 13. Current UI workflow

### Profiles (`src/app/profiles/page.tsx`)

- Read-only inventory of CareerProfiles, Experience, Projects, Metrics, Skills from Prisma.
- No edit forms.
- Shows DB truth (including Aethelgard / Dublin Gold), which can diverge from printed CVs.

### Jobs (`jobs/page.tsx`, `jobs/[id]/page.tsx`, `jobs/new`)

- List/score/detail/import.
- Job detail: generate 1/2 page CV, show versions, downloads, **CvKeywordFit** panel, JD editor, rescore.

### Approve (`approve/page.tsx` + `approve-queue.tsx`)

- Queue for preparing materials; `prepareResumePacksAction` generates 1-page CVs for selected jobs.

### Resume Studio (`resume-studio/page.tsx`)

- Lists all `ResumeVersion` cards: job title/company, profile name, page length, fileName, validation pill, DOCX/PDF download, job link, markdown preview, evidence count, estimate warnings.
- **No** manual Markdown editor, **no** inline content editing, **no** regenerate button on this page, **no** diff view between versions (versions simply accumulate).

### Applications

- Tracker separate from resume generation (`applications` service/UI). Can associate resume versions when recording applications from job detail.

### Settings

- Contact, immigration, batch target, etc. — feeds scoring + contact block.

---

## 14. Current Arthur Cox job record

**Present in Supabase production DB.**

| Field | Value |
|---|---|
| Job ID | `cms57uhgm0001l1048pagpfj8` |
| Title | `AI Engineer (x2) – Legal Innovation Team` |
| Company | `Arthur Cox LLP` |
| Status | `materials_ready` |
| Listing category | `ireland_core` |
| Seniority (stored) | `mid` |
| yearsRequired | `null` |
| keywordsJson | `["Python","Azure","UI","AI"]` |
| requirementsJson | `[]` (empty) |
| Score | `72` |
| Scorer | `llm-judge:groq:llama-3.1-8b-instant` |
| Chosen profile | `applied_ai` / **Applied AI / Automation** |
| Recommended projects (score) | Dublin Gold Testing B2B Growth Engine; Aethelgard Art Co. Production Suite |
| Evidence used (score) | RVV, Dublin Gold, Aethelgard, Irish AI Creative evidence titles |
| Eligibility | `likely_eligible_now` / future `unknown` |
| Keyword fit cache | **null** on latest resume rows |
| Generated CVs | Multiple `ResumeVersion` rows (e.g. `cmsd8chon0007ckvkrj0o9ci7`, earlier `…2026-07-28`) |
| Printed CV title | **`ROSHAN NAJAR, AI Product Design Engineer`** |
| Selected project on CV | **RedVelvetVault only** |
| promptVersion | `v2-reference-pdf-aligned` |
| modelVersion | `reference-template-v1` |
| validationStatus | `warning` |
| Local export example | `data/exports/Roshan_Najar_Applied_AI_Automation_Arthur_Cox_LLP_2026-08-03.{docx,pdf,md}` |
| Vercel path example | `/tmp/career-os-exports/...` with `pdfPath: null` on an earlier version |

**Gap (factual):** scoring recommends automation/AI projects; generated artifact still uses design-product RVV template content under an “AI Product Design Engineer” banner — not an Arthur Cox–specific tailored CV.

---

## 15. Data migration risks

| Area | Risk |
|---|---|
| Existing `ResumeVersion` rows | Content frozen in `contentJson`/`markdown`; regenerating changes outputs; keep old rows if preserving history |
| Duplicated profile data | Template vs DB drift — migration must choose a single source of truth |
| Project IDs / keys | Adding CareerOS/Aethelgard dates needs schema or JSON conventions; key renames break `evidenceOrder` string matching |
| Role names | `applied_ai` display name vs CV title mismatch will affect filename + UI |
| Date formats | Seed uses `YYYY-MM` / year-only; templates use `Mon YYYY — Mon YYYY` |
| Adding Aethelgard & CareerOS to CVs | Aethelgard exists in DB; CareerOS does **not** — requires seed + template/composer changes |
| Evidence references | Evidence titles are free text; renaming breaks human readability in `evidenceUsedJson` |
| Prompt schema changes | `promptVersion` is a string label only — no migration framework |
| DB migrations | No `prisma/migrations` folder; production uses `db push` style — coordinate carefully |
| Deployment | Vercel ephemeral filesystem: DOCX/PDF paths may die; download route regenerates from JSON |
| Score→CV coupling | Today decoupled; coupling them will change materials for all future generates |

---

## 16. Recommended extension points

*(Pointers only — not a design.)*

| Goal | Safest hook | Risk |
|---|---|---|
| Canonical master profile | Elevate Prisma User/Settings/Experience/Project/Evidence as sole source; stop hard-coding in `reference-templates.ts` | **Architectural rewrite** of composer |
| Selected-project evidence library | Already partially modeled in `Project` + `EvidenceItem`; extend fields (dates, urls, bullets) | **Moderate refactor** |
| Role-specific project ranking | Reuse `projectRelevance` / `evidenceOrderJson` outputs inside `generateResumeForJob` | **Low-risk extension** if templates become data-driven |
| Role-specific experience ranking | Use `Experience.sortOrder` + `alternativeTitlesJson` | **Moderate** (title policy needed) |
| ATS keyword mapping | Extend `tech-terms.ts` + `ats-optimize.ts` | **Low-risk extension** |
| Claim validation | Strengthen `validateClaims`; wire `prohibitedClaimsJson` + `approvedForCV`; stop validating CV against itself | **Moderate refactor** |
| DOCX templates | Continue `export-docx.ts` paragraph builder **or** introduce real `.docx` templates later | Low for style tweaks; moderate for template engine |
| PDF generation | Keep parallel `buildAtsPdfBuffer` from shared content model | **Low-risk** |
| Versioned outputs | `ResumeVersion` already versions; add lineage fields / labels | **Low-risk extension** |
| Manual approval | Studio + keyword-fit checkboxes already human-gate edits | **Low-risk** |
| CareerOS self-documentation | New `Project` seed row + evidence; do not invent metrics | **Low-risk data + moderate composer** |

---

## 17. Minimum files required for implementation planning

1. `prisma/schema.prisma` — canonical data model for profiles, projects, evidence, resumes.  
2. `prisma/seed.ts` — actual seeded career inventory and profile definitions.  
3. `src/lib/resume/reference-templates.ts` — **active** CV body composer (current source of printed truth).  
4. `src/lib/resume/service.ts` — generation + ATS optimize orchestration.  
5. `src/lib/resume/compose.ts` — claim validation + dormant deterministic composer.  
6. `src/lib/resume/export-docx.ts` — DOCX/PDF content model and exporters.  
7. `src/lib/resume/ats-optimize.ts` — keyword coverage and edit suggestions.  
8. `src/lib/scoring/score-job.ts` — profile/project ranking already computed but unused by CV.  
9. `src/lib/scoring/llm-judge.ts` — LLM scoring prompts and merge behavior.  
10. `src/lib/jobs/parse-job.ts` — live JD parsing limitations.  
11. `src/lib/jobs/tech-terms.ts` — keyword vocabulary for scoring/ATS.  
12. `src/lib/ai/types.ts` — `ResumeGenerationInput` / `PROMPT_GUARDRAILS`.  
13. `src/lib/ai/provider.ts` — dormant LLM resume path and env gating.  
14. `src/lib/types.ts` — `PROFILE_KEYS`, `SCORE_WEIGHTS`.  
15. `src/app/actions.ts` — server action entry points.  
16. `src/app/jobs/[id]/page.tsx` — generate + keyword-fit UX.  
17. `src/app/resume-studio/page.tsx` — version review UX.  
18. `src/app/api/resumes/[id]/download/route.ts` — download/regeneration behavior.  
19. `docs/RESUME_STANDARDS.md` — intended ATS layout contract.  
20. `docs/PROMPT_GUARDRAILS.md` + `docs/CHATGPT_RESUME_PROMPTS.md` — human/LLM policy corpus.

---

## 18. Open questions and missing information

These cannot be fully resolved from code/DB alone:

1. **Official employment title** at Irish AI Creative / South Dublin Auction House vs preferred functional titles for each target role — DB has umbrella + alternatives; which is “official” for compliance?
2. **Authoritative employment dates** where seed and reference PDFs disagree (Independent, Two Blokes, Arcop).
3. **Project date semantics** for Aethelgard and CareerOS (“July 2026 – Present”): development start vs public/maintenance dates — Project model currently has **no dates**.
4. **CareerOS project facts** for evidence (stack, metrics, URLs, verification) — not seeded; only narrative claims in docs/audits.
5. **DeliverNoo** — absent from repository; no inventory to migrate.
6. **Live URLs** for RedVelvetVault website / show-reel / project report (templates still use placeholders).
7. **Whether Arthur Cox CV should be forced 1-page or 2-page** as a product rule (both exist; packs default to 1).
8. **Preferred contact email** for external applications (`Settings.contactEmail` vs `User.email` — generation prefers settings contactEmail).
9. **Which metrics are approved for external use** beyond `approvedForCV` flags (some template bullets include numbers that may need re-confirmation).
10. **Whether LLM judge overstatements** (e.g. RAG/NLP strengths on Arthur Cox score) should be treated as candidate-facing truth or scoring-only chatter.

---

## Appendix A — Critical factual summary for planners

- **Printed CVs are template-driven**, not evidence-retrieval-driven.  
- **DB inventory is richer than the CV printer** (Aethelgard + Dublin Gold exist; CareerOS does not).  
- **Scoring already ranks projects/profiles** the CV generator ignores.  
- **Arthur Cox is in the DB**, scored to `applied_ai` (72), with generated materials that still feature RedVelvetVault under “AI Product Design Engineer.”  
- **Claim validation is real but incomplete**; do not treat it as full factual grounding.  
- **DOCX and PDF share one content model**; PDF is not derived from DOCX.

---

*End of audit. No upgrade design included by request.*
