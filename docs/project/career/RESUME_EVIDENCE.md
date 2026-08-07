# Resume Evidence

**Parent:** `PROJECT_BIBLE.md`  
**Compiled:** 2026-08-04  
**Rule:** Only verified evidence. No fabricated metrics, titles, or outcomes. Confidence labeled.

---

## How to use

Map bullets to a target role. Prefer claims with **high** confidence. Omit or qualify **medium**. Never use **unsupported**.

---

## Problem

| Evidence statement | Confidence | Cite |
|---|---|---|
| Built a personal system to match multidisciplinary experience to role-specific framing instead of a single generic CV | high | Build spec §2; `CareerProfile` + `ROLE_POLICIES` |
| Encoded Irish work-eligibility constraints into deterministic hard filters and soft flags (incl. sponsorship language as reviewable) | high | `hard-filters.ts`; README decisions |
| Treated AI CV hallucination as a first-class risk requiring inventory + validators | high | `validate-content.ts`; principles |

---

## Solution

| Evidence statement | Confidence | Cite |
|---|---|---|
| End-to-end job-search OS: discover/import → filter → score → resume generate → track | high | App routes; historian §3 |
| Multi-source discovery (Greenhouse, Lever, Ashby, aggregators, Ireland watchlist) with on-demand trigger | high | `discover.ts` |
| Explainable weighted scoring with optional LLM-as-judge that cannot override eligibility floats | high | `score-job.ts`; `llm-judge.ts`; `SCORE_WEIGHTS` |
| Evidence-grounded ATS resume engines (V3 compose, V4 composition/themes) behind feature flag | high | `resume/service.ts`; V3 report |
| Notion-style applications tracker for post-prep status | high | `applications/` |

---

## Engineering

| Evidence statement | Confidence | Cite |
|---|---|---|
| Full-stack TypeScript: Next.js 15 App Router, React 19, Prisma 6, Supabase Auth/Postgres, Vercel | high | `package.json`; deploy docs |
| Server Actions orchestration + download Route Handler | high | `actions.ts`; download route |
| Hybrid AI architecture with Groq→Gemini→heuristic fallbacks | high | AI_USAGE.md |
| Claim validation excluding generated CV from evidence corpus (V3) | high | `validate-content.ts`; V3 report |
| Official experience title policy with tests | high | `title-policy.ts`; tests |
| Regression tests for YOE negation false positives | high | `hard-filters.test.ts` |
| 11 Vitest files / 55 tests passing at 2026-08-04 historian audit | high | Historian §20 |
| Shipped MVP→V3/V4 in 6 commits (2026-07-24 → 2026-08-04) | high | Git log |

---

## Impact

| Evidence statement | Confidence | Cite |
|---|---|---|
| Milestone 1 checklist (Phase 0–2) marked complete in repo | high | `docs/CHECKLIST.md` |
| V3 path verified locally (compose, validation, export, build) on 2026-08-03 | high | `docs/V3_VERIFICATION_REPORT.md` |
| Production URL referenced in CV audit docs | medium | `CAREEROS_CV_GENERATOR_AUDIT.md` (deploy metadata; live DB sync not re-verified by Bible compiler) |
| Interview rate / offers / hours saved | **unsupported** | Not in repository — do not invent |
| Applications submitted using CareerOS materials | **unsupported** unless founder provides count | Tracker may hold personal data; not compiled here |

---

## Technologies

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 · PostgreSQL (Supabase) · Supabase Auth · Zod · Vitest · Groq API · Google Gemini (`@google/generative-ai`) · `docx` · `pdfkit` · Vercel · Greenhouse/Lever/Ashby/Adzuna/Remotive/Arbeitnow integrations

---

## Metrics (allowed)

| Metric | Value | Confidence |
|---|---|---|
| Git commits in repo history (audit) | 6 | high |
| Calendar span (first→HEAD commit) | 2026-07-24 → 2026-08-04 | high |
| Vitest files / tests (historian) | 11 / 55 | high |
| Score dimensions | 9 weighted components | high |
| Profile keys | 9 (`PROFILE_KEYS`) | high |
| Ready resume themes | 2 (`arthur-cox`, `minimal-ats`) | high |
| Server Actions (approx inventory) | 17 exported actions listed in API_MAP | high |

**Disallowed without new evidence:** ATS pass %, time saved, # interviews, conversion rates, “50+ companies” marketing inflation (use configured list counts from code if needed; Greenhouse ~47 slugs per historian errata).

---

## Suggested resume bullets (evidence-tied)

Use only if role-appropriate; edit for voice:

1. Designed and shipped a personal job-search OS (Next.js/Prisma/Supabase) combining multi-source discovery, deterministic eligibility filters, and explainable fit scoring.  
2. Implemented hybrid LLM-as-judge scoring with provider fallbacks while locking immigration/eligibility decisions to deterministic rules.  
3. Built evidence-grounded resume generation (inventory → compose → claim validation → DOCX/PDF) with version lineage and ATS keyword tooling under human apply gates.  
4. Added regression coverage (Vitest) for hard-filter edge cases including YOE negation false positives.

---

## Weak claims to avoid

See historian §30 (autonomous agents, RAG, multi-tenant SaaS, scraping LinkedIn, guaranteed ATS success, etc.).
