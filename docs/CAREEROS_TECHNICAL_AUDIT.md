# CareerOS Technical Audit

Evidence-based technical audit of the CareerOS / JobHunter codebase for CV and portfolio use.

**Rules applied:** Analyse only what is actually implemented. Do not invent AI capabilities. Do not describe the system as agentic unless architecture supports autonomous multi-step tool-using workflows. Distinguish deterministic logic, API-based AI, LLM reasoning, scraping, ranking algorithms, and automation.

**Date of audit:** 28 July 2026

---

## 1. PRODUCT SUMMARY

**CareerOS** is a personal, evidence-first job-search OS that discovers relevant roles, hard-filters and scores them against a seeded career inventory, explains fit, and generates claim-validated ATS resumes (DOCX/PDF). Submission is always manual.

### User journey (implemented)

1. **Seed / configure** — Career profiles A–E, skills, experiences, projects, evidence items, metrics, eligibility settings (Stamp 1G, salary floor, location prefs).
2. **Discover or import jobs** — One-click discovery from ATS APIs + aggregators + Ireland career-page watchlist, *or* paste JD / URL import.
3. **Normalize + filter + score** — Regex/heuristic parsing → hard filters → weighted deterministic score → optional LLM judge override.
4. **Review** — Dashboard, jobs list, Approve queue: strengths, gaps, eligibility, soft flags, score breakdown.
5. **Generate materials** — Profile-aligned ATS resume from reference templates → claim validation → DOCX/PDF export.
6. **Optional ATS optimize** — Deterministic CV↔JD keyword coverage; optional LLM rewrite suggestions with claim checks; human selects edits to apply.
7. **Track applications** — Manual “record application”; status/interview notes (basic tracker, not a Notion clone).

**Not implemented:** auto-submit applications, embeddings/RAG, autonomous agents, scheduled cron discovery in production.

---

## 2. SYSTEM ARCHITECTURE

| Layer | Implementation |
|---|---|
| **Frontend** | Next.js 15 App Router, React 19, Tailwind CSS 4 |
| **Backend** | Next.js Server Actions + one download API route |
| **Database** | Prisma → Supabase PostgreSQL |
| **Auth** | Supabase Auth (magic link) + email allowlist; `DEV_BYPASS_AUTH` for local |
| **AI** | Groq (primary judge/ATS edits) + Gemini (fallback); optional Gemini resume polish (default off) |
| **Automation** | Discovery/scoring/resume pipelines triggered by UI/CLI (no Vercel Cron in repo) |
| **Storage** | Postgres for records; DOCX/PDF under `data/exports/` (or `/tmp` on Vercel) |
| **External** | Greenhouse/Lever/Ashby APIs, Adzuna, Remotive, Arbeitnow, optional Brave/SerpAPI |

### Module layout

```
src/lib/
  career-data/     # (seeded via prisma/seed)
  scoring/         # hard filters + weighted score + LLM judge
  ai/              # provider abstraction, Gemini client, prompts
  resume/          # composition, claim validation, ATS optimize, DOCX/PDF
  jobs/            # import, URL fetch, normalize, discover, aggregators
  auth/            # Supabase session, allowlist
  db/              # Prisma client
```

### Data flow

```
Discovery / Paste / URL
  → parseJobText (deterministic) [optional Gemini extract if wired]
  → Job row
  → hard filters
  → scoreJob (deterministic weights)
  → runLlmJudge (Groq → Gemini → heuristic fallback)
  → JobScore persisted
  → [human] generate resume from reference templates
  → validateClaims → DOCX/PDF
  → [optional] keyword coverage + LLM edit suggestions → human apply
  → [human] record Application
```

---

## 3. JOB DISCOVERY PIPELINE

### Sources (API-first; limited HTML fetch)

| Source | Method |
|---|---|
| **Greenhouse** (~50 boards) | Official JSON API |
| **Lever** (~9 companies) | Public postings JSON |
| **Ashby** (~12 boards) | Posting-board JSON API |
| **Adzuna** | Jobs API (GB index, Ireland-filtered) — optional keys |
| **Remotive** | Public remote design jobs API |
| **Arbeitnow** | Public EU job-board API |
| **Ireland watchlist** | HTML fetch + `<a>` link extraction from employer career pages |
| **Manual** | Paste JD and/or URL |

**Not used:** scraping LinkedIn / Indeed / Glassdoor / IrishJobs (explicitly blocked). Optional **Brave Search / SerpAPI** only checks whether a title+company appears *indexed* on those sites (presence flag, not scraping).

### From raw listing → structured `Job`

1. **Title pre-filter** — UX/UI/product design/frontend/applied-AI title hints; skip staff/principal/director+; skip extreme YOE.
2. **Dedup** — URL set against existing jobs; re-import rescores existing row.
3. **Geo classify** — `ireland_core` vs `eu_sponsorship`.
4. **Candidate ranking** — Heuristic sort (watchlist/Adzuna/Dublin/title boosts; senior penalty).
5. **Import** — `parseJobText`: clean text, section bullets, tech keywords, salary/YOE/remote/seniority/sponsorship via regex.
6. **Score pipeline** — hard filters + scoring (below).
7. **Batch target** — Default ~25 Ireland-core adds per discovery run.

**Normalization:** HTML strip, text clean, structured fields into Prisma `Job` (`requirementsJson`, `keywordsJson`, etc.). No NER model; no embeddings.

---

## 4. JOB MATCHING / SCORING

### Architecture: hybrid

1. **Deterministic core** (`scoreJob`) — always runs.
2. **LLM judge** (`runLlmJudge`) — if keys available and not hard-rejected; **replaces** total/breakdown/strengths/gaps when successful.
3. **Eligibility dimensions** from hard filters are **preserved** even when LLM judges.

### Hard filters (deterministic regex)

**Reject:** UK/US-only auth, unpaid/commission, internships, director/head/principal/staff+, mechanical/CAD “design engineer”, PhD/deep-ML research (when required), video/motion (if toggle off), 8+ YOE (and Senior+6 YOE).

**Soft flags:** no-sponsorship language, senior stretch, high YOE, below salary floor.

**No education matching dimension.**

### Weighted score (0–100)

Live weights from `src/lib/types.ts` (docs may be stale):

| Component | Weight | Method |
|---|---|---|
| Skills overlap | 20 | Substring match skills/aliases vs JD corpus + TECH_HINTS missing list |
| Evidence strength | 16 | Verified evidence keyword/title token hits in corpus |
| Project relevance | 14 | Stack hits + profile fit + evidence-order boost |
| Seniority fit | 22 | Title band + inferred YOE heuristics |
| Current eligibility | 10 | From hard-filter eligibility enum |
| Long-term permit | 6 | Sponsorship language classification |
| Location fit | 6 | Dublin/Ireland/remote heuristics |
| Salary fit | 3 | vs €40k soft floor |
| Career alignment | 3 | Profile keyword hits in corpus |

**Profile pick:** keyword/title hits across 5 profiles, bias to default `ux_engineer`.

**Not present:** embeddings, cosine similarity, semantic retrieval, ML rankers.

### LLM judge (when used)

| Item | Detail |
|---|---|
| **Providers** | Groq `llama-3.1-8b-instant` (default) → Gemini `gemini-2.0-flash` |
| **Input** | Candidate brief (skills/projects/evidence/profiles) + JD (≤14k chars) + heuristic baseline |
| **Output** | JSON: `totalScore`, `breakdown` (0–1), `recommendedProfileKey`, `strengths`, `gaps`, `recommendedProjects`, `evidenceUsed`, `rationale` |
| **Structured output** | Groq `response_format: json_object`; Gemini `responseMimeType: application/json` |
| **Validation** | Clamp scores; validate profile key; force eligibility from heuristic; JSON parse with brace extraction fallback |
| **Downstream** | Upserted to `JobScore`; `modelVersion` like `llm-judge:groq:…` |

On failure/rate limit → heuristic score + soft flag. `SCORE_LLM_DISABLED=true` forces heuristics only.

---

## 5. AI / LLM ARCHITECTURE

| Model / API | Role | Default |
|---|---|---|
| **Groq Llama 3.1 8B** | Job-fit judge; ATS bullet rewrite suggestions | Primary when `GROQ_API_KEY` set |
| **Gemini 2.0 Flash** | Judge/ATS fallback; optional job extract + resume polish via `LLMProvider` | Fallback / optional |
| **DeterministicProvider** | Job parse + resume compose without LLM | Resume path default (`RESUME_DETERMINISTIC_ONLY=true`) |

**Prompting:** Guardrails in `PROMPT_GUARDRAILS` (evidence-only, no invented seniority/ML claims). No tool/function calling. No multi-step agent loop. No conversation memory beyond single-request context.

### Terminology (justified)

| Term | Applies? |
|---|---|
| **LLM workflow** | Yes — discrete LLM steps in scoring and optional ATS optimize |
| **AI decision-support** | Yes — fit scores + explanations for human review |
| **AI-assisted automation** | Yes — discovery→score→materials pipeline with LLM assist |
| **AI agent / agentic workflow** | **No** — no autonomous tool-using multi-step agent |
| **RAG / embeddings / vector retrieval** | **No** — keyword + DB evidence inventory only |

---

## 6. ATS RESUME GENERATION

### Pipeline (what actually ships)

1. **Profile from score** — recommended career profile (or default).
2. **`buildReferenceAtsContent`** — selects pre-authored verified content per profile (Product Designer / Design Engineer / UX Engineer / Applied AI / AI Creative), swaps project framing (e.g. RedVelvetVault product vs eng bullets), appends Irish AI Creative tenure, lightly appends “Targeting {title} at {company}…” to summary.
3. **Page-length trim** — 1-page bullet caps.
4. **`validateClaims`** — blocks prohibited patterns (Senior AI, PhD, model training, etc.); warns on numeric claims not in evidence corpus.
5. **Export** — `docx` + `pdfkit` → DOCX/PDF; markdown stored.
6. **Optional ATS optimize** — deterministic keyword overlap %; LLM suggests path-based rewrites; claim-check each edit; human applies selected edits → new `ResumeVersion`.

### AI vs non-AI

| Step | Type |
|---|---|
| JD understanding for resume body | Mostly **non-AI** (profile templates); JD used lightly in summary + later optimize |
| Requirement extraction | Deterministic parse (optional Gemini extract exists but resume path doesn’t depend on it) |
| Experience selection | **Template/profile rules**, not dynamic RAG retrieval |
| Tailoring | Light template + optional LLM keyword rewrites |
| Factual accuracy | Claim validation + evidence corpus + prompt guardrails |
| Formats | Structured ATS sections → DOCX/PDF |

**Important CV-safe nuance:** Generation is **evidence-grounded template composition + claim validation**, not free-form “LLM writes a new resume from the JD.” Deep per-JD rewriting is optional and human-gated.

---

## 7. AUTOMATION

| Stage | Automatic? | Trigger |
|---|---|---|
| Job discovery | Semi-auto | UI Discover / CLI `cli:discover` |
| Extraction / normalize | Auto | On import |
| Filtering / scoring | Auto | On import / rescore / `score-pending` CLI |
| Fit explanation | Auto | With score |
| Resume generation | Semi-auto | Human (or batch “prepare packs”) |
| ATS keyword analysis | Semi-auto | Human |
| ATS LLM edits | Semi-auto | Human suggest → human apply |
| Application submit | **Manual** | Human outside the system |
| Application record | Manual | UI |

**Human-in-the-loop by design:** review scores, approve materials, submit apps, salary/immigration answers.

No production cron in `vercel.json` — “future Vercel Cron” is documented intent only.

**Full pipeline:**

```
Job discovery
→ Data extraction / normalisation
→ Filtering (hard + soft)
→ Matching / scoring (heuristic ± LLM judge)
→ Fit analysis (strengths / gaps / eligibility)
→ Resume generation (templates + claim validation)
→ [optional] ATS keyword optimize
→ Human review → manual application submit → tracker record
```

---

## 8. DATA MODEL

```
User
 ├─ Settings (eligibility, salary, URLs, batch target)
 ├─ CareerProfile (5 positioning variants)
 ├─ Experience / Project / Skill
 ├─ EvidenceItem → Metric
 ├─ Job → JobScore
 ├─ ResumeVersion (content, validation, docx/pdf paths, optimizeJson)
 └─ Application (links Job + ResumeVersion)
```

**Key entities:**

- **Job** — source, URL, company, title, location, salary, description, requirements/keywords JSON, seniority, sponsorship text, status, hard-reject reason, soft flags, listing category
- **JobScore** — total + per-dimension scores, strengths/gaps, eligibility, recommended projects/evidence, explanation JSON, model version
- **ResumeVersion** — content JSON, markdown, validation status/JSON, DOCX/PDF paths, optimize cache
- **Application** — status, channel, interview stage, notes, follow-up, recruiter fields

Flow: inventory seeds scoring → JobScore recommends profile → ResumeVersion binds job+profile → Application tracks submission.

See `prisma/schema.prisma` for full field definitions.

---

## 9. EVALUATION / ACCURACY

| Mechanism | Status |
|---|---|
| Unit tests (Vitest) | **Yes** — hard filters, scoring, LLM judge coercion, ATS keyword coverage |
| Claim / hallucination guards | **Yes** — prohibited patterns + numeric evidence check; blocks resume persist on blocked claims |
| LLM output validation | **Yes** — JSON parse, clamps, profile whitelist, eligibility grounding |
| Job-match accuracy metrics / labeled eval set | **No** |
| Scoring consistency / regression harness beyond unit tests | **Limited** (unit tests only) |
| Generated-resume quality eval / ATS simulator | **No** |
| Human review UI | **Yes** (Approve / Resume Studio) |

**Explicit:** there is **no formal offline evaluation suite** measuring precision/recall of job match or resume win-rate.

---

## 10. TECHNICAL COMPLEXITY (TOP 10)

1. **Hybrid scoring** — Deterministic multi-factor weights + LLM-as-judge with hard-filter eligibility lock-in.
2. **Evidence-first resume system** — Verified inventory, claim guards, estimate markers.
3. **Multi-source discovery** — ATS board APIs + aggregators + career-page watchlist, geo buckets, dedup.
4. **Immigration-aware eligibility modeling** — Stamp 1G / sponsorship soft-vs-hard logic in filters and score.
5. **Explainable fit outputs** — Strengths/gaps/soft flags/`explanationJson` for human decisions.
6. **ATS optimize loop** — Keyword coverage + constrained LLM edits + re-validation + versioning.
7. **Provider fallbacks** — Groq→Gemini→heuristic; resume deterministic-by-default for reliability.
8. **Full-stack product surface** — Dashboard → jobs → approve → resume studio → applications.
9. **DOCX/PDF export pipeline** — Structured ATS layout via `docx` + PDFKit.
10. **Production auth/data path** — Supabase Auth allowlist + Prisma/Postgres on Vercel.

---

## 11. TECH STACK

| Category | Technologies |
|---|---|
| **Languages** | TypeScript |
| **Frontend** | Next.js 15, React 19, Tailwind 4 |
| **Backend** | Next.js Server Actions, Route Handlers |
| **Database** | Prisma, Supabase PostgreSQL |
| **Auth** | Supabase Auth (SSR cookies), email allowlist |
| **AI/LLM** | Groq (OpenAI-compatible API), Google Gemini (`@google/generative-ai`) |
| **ML** | None (no training, embeddings, or classical ML models) |
| **Scraping** | Light HTML career-page fetch; URL HTML fetch for allowed hosts |
| **Job APIs** | Greenhouse, Lever, Ashby, Adzuna, Remotive, Arbeitnow |
| **Search** | Optional Brave Search / SerpAPI (presence only) |
| **Documents** | `docx`, `pdfkit` |
| **Validation** | Zod (dependency), custom claim validators |
| **Automation** | Scripts (`tsx`), UI-triggered pipelines |
| **Cloud** | Supabase, Vercel |
| **Tooling** | Vitest, ESLint, Prisma, tsx CLI |

---

## 12. ENGINEERING MATURITY

| Area | Assessment |
|---|---|
| **Scalability** | Single-user personal tool; discovery is sequential/board-loop; fine for personal batch, not multi-tenant scale |
| **Reliability** | Strong fallbacks (LLM→heuristic, resume deterministic default); timeouts on fetches |
| **Error handling** | JobFetchError codes, soft flags for rate limits, try/catch per board |
| **Security** | Auth + allowlist; personal data hardcoded in seed/settings — appropriate for personal tool, not multi-tenant SaaS |
| **Rate limits** | Explicit Groq pacing script; UI messaging on 429 |
| **Validation** | Zod available; scoring/resume use custom validators; Prisma schema constraints |
| **Logging** | Console warnings for Gemini failures; limited structured observability |
| **Testing** | Focused unit tests on core logic; no E2E/integration suite found |
| **Maintainability** | Clear module boundaries; product rules documented; some large template/seed files |

---

## 13. CV CLAIMS TABLE

| Potential Resume Claim | Technical Evidence | Confidence | Recommended Technical Wording |
|---|---|---|---|
| Built AI-assisted job search automation platform | Discovery + score + resume + tracker in Next.js/Prisma | High | Built CareerOS, an end-to-end AI-assisted job intelligence and application-prep platform |
| Multi-source job discovery pipeline | Greenhouse/Lever/Ashby/Adzuna/Remotive/Arbeitnow + watchlist | High | Engineered a multi-source job discovery pipeline over ATS board APIs and EU/Ireland aggregators with URL deduplication and geo classification |
| Deterministic hard filters for eligibility/seniority | `hard-filters.ts` | High | Implemented deterministic hard-filter rules for work authorization, seniority band, role type, and YOE constraints |
| Explainable multi-factor job scoring | Weighted breakdown + strengths/gaps persisted | High | Designed explainable multi-factor job-fit scoring (skills, evidence, projects, seniority, eligibility, location, salary) |
| LLM-as-judge with structured outputs | `llm-judge.ts` Groq/Gemini JSON | High | Integrated an LLM-as-judge layer (Groq/Gemini) with structured JSON scoring and heuristic fallback |
| Evidence-grounded ATS resume generation | Reference templates + `validateClaims` + DOCX/PDF | High | Built evidence-grounded ATS resume generation with claim validation and DOCX/PDF export |
| Hallucination / claim prevention | Prohibited patterns + numeric evidence checks | High | Enforced resume claim guards to block unsupported seniority/ML claims and unverified metrics |
| CV↔JD keyword optimization | `ats-optimize.ts` | High | Implemented deterministic CV–JD keyword coverage analysis and human-gated LLM rewrite suggestions |
| Human-in-the-loop workflow | Approve queue, manual submit disclaimer | High | Designed a human-in-the-loop application workflow (auto-prep materials; manual review and submission) |
| “Agentic multi-agent job hunter” | No agent loop / tool calling | **Reject** | — |
| “RAG / embedding semantic matching” | Keyword-only | **Reject** | — |
| “Fully autonomous applications” | Manual submit | **Reject** | — |
| Scrapes LinkedIn/Indeed at scale | Explicitly blocked | **Reject** | Optional: “Verified listing presence via search APIs without scraping antibot job boards” |

---

## 14. RESUME-READY SUMMARY

### A. Technical overview (2–3 sentences)

CareerOS is a full-stack, evidence-first job intelligence system that discovers roles from ATS board APIs and aggregators, applies deterministic eligibility/seniority filters, and produces explainable multi-factor fit scores—optionally refined by an LLM-as-judge with structured JSON outputs. It composes profile-aligned ATS resumes from a verified career inventory, validates claims before DOCX/PDF export, and supports human-gated keyword optimization. The system automates discovery→scoring→materials preparation while keeping application submission and final review under human control.

### B. High-impact bullets (5–7)

- Built **CareerOS**, a personal AI-assisted job intelligence platform (Next.js, TypeScript, Prisma/Supabase) covering discovery, explainable scoring, ATS resume generation, and application tracking.
- Engineered a **multi-source discovery pipeline** across Greenhouse, Lever, Ashby, and EU/Ireland job APIs with URL deduplication, title/YOE prefilters, and Ireland-core vs EU-sponsorship classification.
- Implemented **deterministic hard filters** and a **weighted multi-factor scoring engine** (skills, evidence, projects, seniority, work-authorization eligibility, location, salary) with transparent strengths/gaps.
- Integrated an **LLM-as-judge** (Groq Llama → Gemini Flash) producing structured fit scores with eligibility grounding and automatic heuristic fallback under rate limits.
- Designed an **evidence-grounded ATS resume pipeline**: profile-specific verified templates, claim/hallucination guards, and DOCX/PDF export for human review.
- Added **CV–JD keyword coverage analysis** plus constrained LLM rewrite suggestions with claim re-validation and versioned resume history.
- Shipped a **human-in-the-loop** approve → materials → apply workflow with Supabase Auth allowlisting for production deployment on Vercel.

### C. One-line tech stack

TypeScript · Next.js 15 · React 19 · Prisma · Supabase (Postgres + Auth) · Groq · Gemini · Greenhouse/Lever/Ashby APIs · docx/PDFKit · Vitest · Vercel

### D. Ultra-condensed

Evidence-first job intelligence OS: API-based discovery, hybrid deterministic+LLM fit scoring, claim-validated ATS resume automation, human-in-the-loop apply.

---

## Safe positioning for AI / Full-Stack roles

**Prefer:** AI decision-support system · LLM-as-judge · structured-output LLM workflows · evidence-grounded generation · deterministic + LLM hybrid ranking · job-search automation pipeline

**Avoid:** agentic · multi-agent · RAG · semantic embeddings · autonomous applicant bot

Those rejected terms are not supported by this codebase.

---

## Appendix: Key source files

| Area | Paths |
|---|---|
| Scoring | `src/lib/scoring/hard-filters.ts`, `score-job.ts`, `llm-judge.ts` |
| Discovery | `src/lib/jobs/discover.ts`, `aggregators.ts`, `ireland-watchlist.ts`, `board-presence.ts` |
| Import / parse | `src/lib/jobs/service.ts`, `parse-job.ts`, `fetch-url.ts` |
| AI provider | `src/lib/ai/provider.ts`, `types.ts` |
| Resume | `src/lib/resume/service.ts`, `compose.ts`, `reference-templates.ts`, `ats-optimize.ts`, `export-docx.ts` |
| Schema | `prisma/schema.prisma`, `prisma/seed.ts` |
| Actions | `src/app/actions.ts` |
| Tests | `tests/hard-filters.test.ts`, `score-job.test.ts`, `llm-judge.test.ts`, `ats-optimize.test.ts` |
| Docs | `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md` |
