# API Map

**Parent:** `PROJECT_BIBLE.md`  
**Compiled:** 2026-08-04  
**Note:** CareerOS is primarily **Server Actions**, not a public REST API. `docs/ROADMAP.md` action names are slightly stale.

---

## 1. HTTP routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/resumes/[id]/download` | Download DOCX/PDF for a ResumeVersion |
| GET | `/auth/callback` | Supabase auth callback |
| POST | `/auth/signout` | Sign out |

App pages (not JSON APIs): `/`, `/dashboard`, `/jobs`, `/jobs/new`, `/jobs/[id]`, `/approve`, `/profiles`, `/resume-studio`, `/applications`, `/settings`, `/login`.

**Not implemented:** `/profiles/[id]` (listed in older ROADMAP).

---

## 2. Server Actions (`src/app/actions.ts`)

| Action | Purpose |
|---|---|
| `importJobAction` | Create job from paste/URL → parse → filter → score |
| `rescoreJobAction` | Re-run scoring on existing job |
| `updateJobDescriptionAction` | Edit JD text then typically rescore path |
| `generateResumeAction` | Build + validate + export resume for job |
| `analyzeResumeKeywordsAction` | ATS keyword coverage analysis |
| `suggestResumeAtsEditsAction` | LLM/heuristic keyword edit suggestions |
| `applyResumeAtsEditsAction` | Human-gated apply → new ResumeVersion |
| `recordApplicationAction` | Tracker entry from job (links latest resume) |
| `patchApplicationAction` | Partial update tracker row |
| `createBlankApplicationAction` | Blank tracker row |
| `reorderApplicationsAction` | Reorder rows |
| `deleteApplicationAction` | Delete tracker row |
| `updateApplicationAction` | **@deprecated** — prefer patch |
| `updateSettingsAction` | Update Settings subset |
| `runDiscoveryAction` | On-demand multi-source discovery |
| `prepareResumePacksAction` | Batch prepare resume packs (Approve flow) |
| `saveJobsAction` | Persist/save jobs from Approve queue |

---

## 3. CLI scripts (`package.json`)

| Script | Entry |
|---|---|
| `npm run cli:import` | `scripts/import-job.ts` |
| `npm run cli:score` | `scripts/score-job.ts` |
| `npm run cli:discover` | `scripts/discover-greenhouse.ts` |
| `npm run cli:generate-resume` | `scripts/generate-resume.ts` |
| `npm run cli:delete-sample` | `scripts/delete-sample-jobs.ts` |
| `npm run db:seed` / `db:seed:v3` | Prisma seed scripts |

---

## 4. Core domain functions (not HTTP)

| Function | File | Role |
|---|---|---|
| `runJobDiscovery` | `jobs/discover.ts` | Multi-source discovery |
| `importAndScoreJob` | `jobs/service.ts` | Import orchestration |
| `parseJobText` | `jobs/parse-job.ts` | Deterministic parse |
| `runHardFilters` | `scoring/hard-filters.ts` | Eligibility gates |
| `scoreJob` | `scoring/score-job.ts` | Heuristic score |
| `runLlmJudge` / `mergeHeuristicWithJudge` | `scoring/llm-judge.ts` | Optional judge |
| `generateResumeForJob` | `resume/service.ts` | Engine entry |
| `composeResumeV3` | `resume/v3/compose-resume.ts` | V3 orchestrator |
| `validateResumeContentV3` | `resume/v3/validate-content.ts` | Claim validation |
| `composeDocument` | `resume-studio/composition/` | V4 layout |
| `runResumeCritic` | `resume-studio/critic/` | Critique |

---

## 5. Auth surface

- Middleware allowlist (`src/lib/auth/middleware.ts`)  
- User mapping (`src/lib/auth/user.ts`)  
- Env: `ALLOWED_EMAILS`, Supabase URL/keys, bypass flags  

---

## 6. External integrations (outbound)

| System | Usage |
|---|---|
| Greenhouse / Lever / Ashby JSON | Discovery |
| Adzuna / Remotive / Arbeitnow | Aggregators |
| Ireland watchlist HTML | Link extraction |
| Brave / SerpAPI | Optional board presence |
| Groq / Gemini | Optional LLM stages |
| Supabase | Auth + Postgres |

No inbound public webhook API documented in repo.
