# System Architecture

**Parent:** `docs/project/PROJECT_BIBLE.md` §§9–10  
**Compiled:** 2026-08-04  
**Code authority over:** `docs/ARCHITECTURE.md` (stale module names and score weights)

---

## 1. System context

```text
┌─────────────────────────────────────────────────────────────┐
│  Operator (Roshan) — browser / CLI                          │
└───────────────┬─────────────────────────────┬───────────────┘
                │ Server Actions / Pages      │ scripts/*
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js 15 App (Vercel)                                    │
│  auth · jobs · scoring · resume · studio · applications     │
└───────┬──────────────────┬──────────────────┬───────────────┘
        │ Prisma           │ Groq/Gemini      │ ATS board APIs
        ▼                  ▼                  ▼
   Supabase Postgres   LLM providers    Greenhouse/Lever/Ashby/
   + Supabase Auth                      Adzuna/Remotive/Arbeitnow
                                        + Ireland watchlist HTML
```

**Out of band:** External ATS form submit (human). Optional Brave/SerpAPI for board **presence** only.

---

## 2. Runtime layers

| Layer | Implementation |
|---|---|
| UI | `src/app/**/page.tsx`, `src/components/**` |
| Mutations | `src/app/actions.ts` Server Actions |
| HTTP | `GET /api/resumes/[id]/download`, auth callback/signout |
| Domain | `src/lib/{jobs,scoring,resume,resume-intelligence,resume-studio,applications,ai,auth}` |
| Persistence | Prisma → PostgreSQL |
| Files | `data/exports/` local; `os.tmpdir()/career-os-exports` on Vercel |

---

## 3. End-to-end sequence

```text
1. Auth gate (middleware + allowlist) | DEV_BYPASS_AUTH local
2. Configure Settings (partial UI)
3a. runJobDiscovery → multi-source fetch → prefilter → batch insert
3b. importAndScoreJob (paste | URL)
4. parseJobText (deterministic; optional Gemini extract)
5. runHardFilters → status / softFlags / eligibility
6. scoreJob → optional runLlmJudge → mergeHeuristicWithJudge
7. Persist JobScore; UI on /jobs/[id] and /approve
8. generateResumeForJob(engine v2|v3|v4)
9. validate → write ResumeVersion + DOCX/PDF
10. optional ATS analyze/suggest/apply
11. human review in Resume Studio
12. record Application; submit elsewhere
```

---

## 4. Module boundaries

### Jobs (`src/lib/jobs/`)

- `discover.ts` — board aggregation, batch target  
- `parse-job.ts` — deterministic JD parse  
- `fetch-url.ts` — URL fetch + `BLOCKED_HOST_HINTS`  
- `service.ts` — import + score orchestration  
- `ireland-watchlist.ts` — career-page link extraction  
- `aggregators.ts`, `board-presence.ts`

### Scoring (`src/lib/scoring/`)

- `hard-filters.ts` — reject / soft / eligibility  
- `score-job.ts` — weighted heuristics + `pickProfile`  
- `llm-judge.ts` — structured judge + merge (eligibility lock-in)

### Resume (`src/lib/resume/`)

- `service.ts` — engine switch + generation entry  
- `v3/*` — compose, role/title policy, rank, validate  
- `reference-templates.ts` — legacy v2  
- `ats-optimize.ts` — keyword coverage + LLM edits  
- `export-docx.ts` — DOCX/PDF

### Resume intelligence / studio

- `resume-intelligence/` — signals, lint, strategy  
- `resume-studio/composition/` — layout blocks  
- `resume-studio/themes/` — visual themes  
- `resume-studio/critic/` — LLM/heuristic critique

### Applications / Auth / AI

- Tracker CRUD helpers and Notion-like vocabulary  
- Supabase session + email allowlist  
- `LLMProvider` interface + `PROMPT_GUARDRAILS`

---

## 5. Auth and tenancy

- Production: Supabase magic link; `ALLOWED_EMAILS`  
- Local: `DEV_BYPASS_AUTH` / `NEXT_PUBLIC_DEV_BYPASS_AUTH`  
- Data scoped by `userId` relations — **not** multi-tenant SaaS isolation design

---

## 6. Deployment topology

| Concern | Reality |
|---|---|
| Host | Vercel |
| Build | `prisma generate && next build` |
| Cron | **None** in `vercel.json` |
| Secrets | Vercel env / `.env` (never commit) |
| Export durability | Ephemeral on serverless tmp — operational limitation |

---

## 7. Reliability patterns

- Per-board try/catch in discovery (error counts)  
- LLM rate-limit → heuristic fallback  
- Resume generation blocked for `status === "rejected"`  
- Claim/export validation before persist  
- Version lineage instead of overwrite  

---

## 8. Explicit non-architecture

No embeddings/RAG/vector DB. No browser-automation apply bots. No Gmail sync. No separate Python/n8n workers in this repo (spec mentioned them as options; implementation is TypeScript/Next).

---

## Diagram hooks

See `docs/project/portfolio/DIAGRAM_SPEC.md`: system context, workflow, scoring pipeline, provider fallback.
