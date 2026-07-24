# CareerOS

Evidence-first job matching and ATS application preparation for Roshan Najar — personal daily tool and portfolio case study.

**Principles:** evidence before generation · human-in-the-loop · transparent scoring · no invented seniority

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Prisma + **Supabase PostgreSQL**
- Supabase Auth (magic link) + email allowlist
- Deterministic hard filters + weighted scoring
- Gemini optional via `GEMINI_API_KEY`
- DOCX + PDF export (`data/exports/`)
- Deploy target: **Vercel**

## Quick start (after Supabase project exists)

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for full Supabase + Vercel setup.

```bash
cp .env.example .env
# fill DATABASE_URL, DIRECT_URL, Supabase keys, GEMINI_API_KEY
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With `DEV_BYPASS_AUTH=true`, login is skipped. Set `false` on Vercel.

### Tests

```bash
npm test
```

### CLI

```bash
# Paste a job file
npm run cli:import -- --file ./sample-job.txt

# Or with URL
npm run cli:import -- --url "https://boards.greenhouse.io/..."

# Re-score
npm run cli:score -- --job-id <id>
```

## Milestone 1 (shipped)

| Phase | Capability |
|---|---|
| 0 | Seeded career profiles A–E, experiences, projects, skills, evidence, metrics |
| 1 | Job import (paste + URL), hard filters, explainable scoring, job UI, CLI |
| 2 | ATS resume generation, claim validation, DOCX + markdown export, Resume Studio |

## Product decisions (locked)

- Default profile bias: **UX Engineer**
- Years-of-experience: soft note only (skills-first)
- “No sponsorship”: soft flag — keep for review (Stamp 1G)
- Salary floor €40k: soft preference
- Video/motion fallback roles: off (settings toggle)
- Design Engineer = digital only (CAD/mechanical hard-reject)
- Estimates shown in UI with **Estimate · review** marker

## Auth

`DEV_BYPASS_AUTH=true` for local single-user. Wire Supabase Auth for Vercel production (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Docs

- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/ROADMAP.md`
- `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` (source of truth)

## Disclaimer

CareerOS prepares applications. You review CVs, salary/immigration answers, and submit manually.
