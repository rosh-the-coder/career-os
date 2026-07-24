# CareerOS Architecture

## Goal

Personal AI-assisted job-search OS: evidence-grounded matching, explainable scoring, ATS CV generation. Human-in-the-loop. Dual use: daily job tool + portfolio case study.

## Stack (MVP)

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind |
| DB (local → cloud) | Prisma + SQLite → Supabase PostgreSQL |
| Auth | Supabase Auth (optional local bypass for seed/dev) |
| AI | Gemini (Google AI) behind `LLMProvider` interface |
| Docs | DOCX templates + PDF conversion |
| Hosting | Vercel |
| Workers | Scripts + future Vercel Cron |

## Module boundaries

```
src/lib/
  career-data/     # seed loaders, evidence queries
  scoring/         # hard filters + weighted score (deterministic core)
  ai/              # provider abstraction, Gemini client, prompts
  resume/          # composition, claim validation, DOCX/PDF
  jobs/            # import, URL fetch, normalize
  db/              # Prisma client
packages/ shared later via extract; logic lives in src/lib for MVP speed
```

## Data flow

```
Import (paste | URL)
  → normalize JobRecord
  → hard filters (reject / soft flags)
  → LLM parse requirements (optional enrich)
  → deterministic + LLM-assisted score
  → JobScore + explanation
  → (Phase 2) profile pick → evidence retrieve → resume draft
  → claim validation → DOCX/PDF → human review
```

## Scoring weights

Skills 22 | Evidence 18 | Projects 15 | Seniority 12 | Eligibility 12 |
Long-term permit 8 | Location 5 | Salary 4 | Career direction 4

Hard disqualifier overrides score. Years-of-experience soft note only (unless senior title hard-reject).

## Auth model

- Production: Supabase Auth, single-user allowlist (Roshan)
- Local: `DEV_BYPASS_AUTH=true` for seed/demo without keys

## Decision log (product)

- Milestone 1 = Phase 0 + 1 + 2
- Default profile bias: UX Engineer
- Video fallback roles: off (toggle)
- Design Engineer = digital only (reject CAD/mechanical)
- No-sponsorship: soft penalty, keep for review
- Salary floor €40k soft preference
- Stamp 1G → Sep 2027 (renew → Sep 2028); laid off 17 Jul 2026
- Irish AI Creative: Mar 2026 – 17 Jul 2026
- Estimates shown in UI with “needs review” tooltip
