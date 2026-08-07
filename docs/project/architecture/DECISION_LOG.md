# Decision Log

**Parent:** `PROJECT_BIBLE.md` §§15–16  
**Compiled:** 2026-08-04  
**Format:** Problem → Decision → Alternatives → Trade-off → Evidence

---

## D1 — Deterministic eligibility before LLM

| | |
|---|---|
| **Problem** | LLM scoring could green-light visa/YOE-unsafe roles |
| **Decision** | Hard filters first; `mergeHeuristicWithJudge` preserves heuristic eligibility dimensions |
| **Alternatives** | Fully LLM eligibility; soft-only filters |
| **Trade-off** | Over-reject risk; requires negation tuning |
| **Evidence** | `hard-filters.ts`, `llm-judge.ts`, `tests/hard-filters.test.ts` |

---

## D2 — Prisma + Supabase Postgres + magic-link auth

| | |
|---|---|
| **Problem** | Need cloud DB + simple auth for personal deploy |
| **Decision** | Prisma 6 + Supabase PostgreSQL + allowlisted magic link; local auth bypass |
| **Alternatives** | Firebase; SQLite-only; password auth |
| **Trade-off** | Single-user patterns; serverless file limits |
| **Evidence** | `schema.prisma`, `docs/DEPLOY.md`, `src/lib/auth/` |

---

## D3 — Provider fallback chain

| | |
|---|---|
| **Problem** | Free-tier rate limits and outages |
| **Decision** | Groq → Gemini → heuristic fallback for judge / ATS / critic |
| **Alternatives** | Single paid model; offline-only |
| **Trade-off** | Quality variance across providers |
| **Evidence** | `llm-judge.ts`, `ats-optimize.ts`, critic |

---

## D4 — Evidence-grounded resume generation

| | |
|---|---|
| **Problem** | Generative CVs hallucinate skills/metrics |
| **Decision** | Seeded inventory + V3 compose + claim validators + title policy |
| **Alternatives** | Pure LLM rewrite from JD; static one-pager |
| **Trade-off** | Requires curated seed; weaker without CMS |
| **Evidence** | `compose-resume.ts`, `validate-content.ts`, seed scripts |

---

## D5 — Human-in-the-loop submission

| | |
|---|---|
| **Problem** | Auto-apply bots create ToS, quality, and accountability risk |
| **Decision** | Prepare materials only; external manual submit |
| **Alternatives** | Confirmed auto-submit; browser automation |
| **Trade-off** | Manual effort remains |
| **Evidence** | README disclaimer; no apply-bot modules |

---

## D6 — Resume versioning / lineage

| | |
|---|---|
| **Problem** | Overwriting destroys prior packs and ATS iterations |
| **Decision** | Append-only `ResumeVersion` + `parentVersionId` |
| **Alternatives** | In-place update; single latest blob |
| **Trade-off** | Storage growth |
| **Evidence** | `schema.prisma` ResumeVersion; ATS apply flow |

---

## D7 — Official title policy

| | |
|---|---|
| **Problem** | “Optimized” titles invent seniority/function |
| **Decision** | `resolveOfficialExperienceTitle` — never invent titles |
| **Alternatives** | Functional-focus invented titles (deprecated) |
| **Trade-off** | Less keyword-optimized titles |
| **Evidence** | `title-policy.ts`, `tests/title-policy.test.ts` |

---

## D8 — No protected-board HTML scrape

| | |
|---|---|
| **Problem** | LinkedIn/Indeed/etc. scrape is fragile and ToS-hostile |
| **Decision** | Block hosts; use ATS JSON APIs, aggregators, watchlist, paste; optional presence search |
| **Alternatives** | Headless scrape; unofficial APIs |
| **Trade-off** | Coverage gaps |
| **Evidence** | `fetch-url.ts` `BLOCKED_HOST_HINTS`; `board-presence.ts` |

---

## D9 — Resume engine feature flag

| | |
|---|---|
| **Problem** | Migrate off hard-coded templates without breaking packs |
| **Decision** | `RESUME_ENGINE_VERSION` v2 \| v3 \| v4 |
| **Alternatives** | Big-bang replace; dual-write always |
| **Trade-off** | Three codepaths |
| **Evidence** | `resume/service.ts`; `.env.example`; V3 report |

---

## D10 — Default profile bias UX Engineer

| | |
|---|---|
| **Problem** | Multidisciplinary profile needs a default positioning |
| **Decision** | `DEFAULT_PROFILE_KEY = "ux_engineer"` with per-job `pickProfile` |
| **Alternatives** | Always AI Engineer; always Product Designer |
| **Trade-off** | Bias may under-rank some AI-heavy roles without JD signals |
| **Evidence** | `types.ts`; README locked decisions |

---

## D11 — “No sponsorship” as soft flag

| | |
|---|---|
| **Problem** | Stamp 1G candidates may still be viable despite “no sponsorship” text |
| **Decision** | Soft flag; keep for human review |
| **Alternatives** | Hard reject all no-sponsorship |
| **Trade-off** | More manual triage |
| **Evidence** | README; hard-filters soft flags |

---

## D12 — Design Engineer = digital only

| | |
|---|---|
| **Problem** | “Design engineer” often means mechanical/CAD |
| **Decision** | Hard-reject physical/mechanical/CAD design engineer signals |
| **Alternatives** | Soft flag only |
| **Trade-off** | Possible false rejects on hybrid wording |
| **Evidence** | README; `hard-filters.ts` |

---

## Product chronology decisions (locked in docs)

- Salary floor €40k soft preference  
- Video/motion fallback off by default  
- Estimates shown with review markers  
- Milestone 1 = Phase 0+1+2 (`docs/CHECKLIST.md`)  

---

## Open / deferred decisions

| Item | Status |
|---|---|
| Cron discovery | Documented future; not configured |
| Gmail parsing | DEPLOY future; not built |
| Object storage for exports | Unresolved operational need |
| Freeform resume editor | Deferred (V3 report) |
| Productize vs personal-only | `[FOUNDER PENDING]` |
