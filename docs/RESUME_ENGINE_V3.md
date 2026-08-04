# Resume Engine V3

## Overview

Canonical, evidence-grounded CV generation. Feature flag: `RESUME_ENGINE_VERSION=v3` (default in `.env.example`). Set `v2` to use legacy `reference-templates.ts`.

## Data flow

```text
Job + CareerInventory (Prisma)
  → resolve profile (AI Engineer title boost)
  → rank projects / experiences
  → compose summary, skills, projects, experience
  → validate claims against evidence corpus (not the CV itself)
  → adapt to AtsResumeContent
  → DOCX + PDF
  → new ResumeVersion (old rows untouched)
```

## Source of truth

`User`, `Settings`, `CareerProfile`, `Experience`, `Project`, `EvidenceItem`, `Metric`.

## Modules

`src/lib/resume/v3/*`

## Ranking weights

See `PROJECT_RANK_WEIGHTS` in `src/lib/types.ts`:

| Factor | Weight |
|---|---:|
| Role profile relevance | 25% |
| JD keyword relevance | 25% |
| Evidence strength | 20% |
| Recency | 10% |
| Operational status | 10% |
| Career positioning | 10% |

## Rollback

Set `RESUME_ENGINE_VERSION=v2`. Legacy templates remain. Existing ResumeVersion downloads still work via `contentJson.ats`.
