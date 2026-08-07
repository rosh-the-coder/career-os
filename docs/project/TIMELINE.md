# CareerOS — Timeline

**Compiled:** 2026-08-04  
**Evidence:** `git log --format="%h %ad %s" --date=short`; `docs/V3_VERIFICATION_REPORT.md`; historian §22  
**Author shortlog:** 6 commits by `rosh-the-coder` (entire repo history at audit HEAD `26f2596`)

---

## Verified git milestones

| Date | Commit | Milestone | What shipped |
|---|---|---|---|
| 2026-07-24 | `a8d2290` | MVP foundation | Initial CareerOS app with Supabase-ready stack |
| 2026-07-24 | `e1c0273` | Discovery + queue | Discovery + approve queue; dashboard stat alignment |
| 2026-07-25 | `68f82b4` | Scoring UX | LLM-per-job scoring UX, discovery sources, safer resume packs |
| 2026-07-28 | `3feecf3` | ATS tooling | ATS keyword-fit tooling + CV optimize cache on job detail |
| 2026-07-30 | `58c7763` | Reliability + ops | YOE false-positive fix; applications tracker updates |
| 2026-08-04 | `26f2596` | Resume engines | Resume engine v3/v4, intelligence, studio UI, claim validation |

**Approximate product sequence:** job-finder MVP → discovery/approve → LLM scoring → ATS optimize → tracker → canonical resume engine.

---

## Documented stamps (non-git)

| Date | Artifact | Note |
|---|---|---|
| 2026-08-03 | `docs/V3_VERIFICATION_REPORT.md` | Core V3 path verified locally; deferred list recorded |
| 2026-08-03 | `CAREEROS_CV_GENERATOR_AUDIT.md` | Pre-V4 CV architecture audit (code-state snapshot) |
| 2026-08-04 | `CAREEROS_PROJECT_HISTORIAN.md` | Full technical inventory for Bible / case study |

---

## Schema / migration markers

| Migration folder | Theme |
|---|---|
| `prisma/migrations/20260803140000_resume_engine_v3` | Resume Engine V3 inventory fields |
| `prisma/migrations/20260803160000_experience_role_order` | Experience role ordering |
| `prisma/migrations/20260803180000_resume_studio_v4` | Resume Studio V4 composition fields |

Historian note: project historically used `db push` heavily — production schema sync must be verified operationally.

---

## Seeded personal chronology (Settings / inventory — not product timeline)

From product decision docs / Settings seed (treat carefully in public assets; redact contact PII):

| Fact | Source | Public use |
|---|---|---|
| Laid off 17 Jul 2026 | `docs/ARCHITECTURE.md` decision log; Settings `layoffDate` | Optional context; `[FOUNDER PENDING]` emotional narrative |
| Irish AI Creative: Mar 2026 – 17 Jul 2026 | Architecture decision log | Employment inventory |
| Stamp 1G → Sep 2027 (renew → Sep 2028) | Architecture decision log / Settings | Eligibility design context |

---

## Gaps (not in git)

- No repository history before 2026-07-24  
- `[FOUNDER PENDING]` when the idea started vs when coding began  
- `[FOUNDER PENDING]` hours invested, rejected prototypes outside this repo  
- Outcome metrics (applications sent, interviews) — **not in repo**; do not invent  

---

## Diagram opportunity

Linear swimlane: *Spec (`ROSHAN_…_BUILD_SPEC.md`) → MVP → Discovery → LLM Judge → ATS Optimize → Tracker → V3/V4*. Annotate each node with commit SHA.
