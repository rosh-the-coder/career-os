# CareerOS — Project Manifest

**Compiled:** 2026-08-04  
**Sources:** `CAREEROS_PROJECT_HISTORIAN.md`, repository code, git history, tests, existing docs  
**Rule:** Repository evidence first. Founder-interview fields marked `[FOUNDER PENDING]`. No invented metrics.

---

## Identity

| Field | Value | Confidence |
|---|---|---|
| Product name | CareerOS (working titles: Targeted Job Hunter, Roshan Automated Job Finder) | high |
| Repo path | `F:/Apps/JobHunter` | high |
| GitHub | `https://github.com/rosh-the-coder/career-os` (private) | high |
| Primary user | Roshan Najar (single allowlisted operator) | high |
| Location context | Dublin, Ireland; Stamp 1G eligibility rules in Settings | high |
| Product class | Personal daily job-search OS + portfolio case study | high |
| Multi-tenant SaaS? | No | high |

---

## Stack (verified)

| Layer | Choice | Evidence |
|---|---|---|
| Frontend | Next.js 15 App Router, React 19, Tailwind CSS 4 | `package.json`, `src/app/` |
| Backend | Next.js Server Actions + Route Handlers | `src/app/actions.ts` |
| Language | TypeScript | `tsconfig.json` |
| Database | PostgreSQL via Supabase | `prisma/schema.prisma`, `docs/DEPLOY.md` |
| ORM | Prisma 6 | `package.json` |
| Auth | Supabase Auth (magic link) + `ALLOWED_EMAILS`; `DEV_BYPASS_AUTH` | `src/lib/auth/` |
| Deploy | Vercel (`prisma generate && next build`) | `vercel.json` |
| Documents | `docx`, `pdfkit` | exporters under `src/lib/resume/` |
| AI | Groq (OpenAI-compatible), Google Gemini | `src/lib/ai/`, `llm-judge.ts` |
| Tests | Vitest — 11 files, 55 tests (historian audit) | `tests/` |
| Package manager | npm | `package-lock.json` |

---

## Output tree (this system)

```text
docs/project/
├── PROJECT_BIBLE.md          ← canonical root
├── PROJECT_MANIFEST.md       ← this file
├── TIMELINE.md
├── architecture/
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── DECISION_LOG.md
│   ├── AI_USAGE.md
│   └── API_MAP.md
├── portfolio/
│   ├── CASE_STUDY_BLUEPRINT.md
│   ├── STORYBOARD.md
│   ├── DIAGRAM_SPEC.md
│   └── SCREENSHOT_SPEC.md
├── career/
│   ├── RESUME_EVIDENCE.md
│   ├── INTERVIEW_PREP.md
│   └── LINKEDIN_POSTS.md
└── roadmap/
    ├── ROADMAP.md
    ├── LESSONS.md
    └── FUTURE.md
```

**Dependency rule:** All derived docs must reconcile to `PROJECT_BIBLE.md`. Where older docs conflict with code, **code wins** (see Bible Appendix — Doc Conflicts).

---

## Operational status (blunt)

| Area | Status |
|---|---|
| Job import (paste + URL) | operational |
| Multi-source discovery (on-demand) | operational |
| Hard filters + heuristic scoring | operational |
| LLM judge with fallback | operational |
| Resume Engine V3/V4 + claim validation | operational |
| Resume Studio review/download | operational (editing partial) |
| Applications tracker | operational |
| Cron discovery | not configured |
| Auto-apply | not implemented (by design) |
| Profiles/[id] admin | not implemented |
| Freeform resume editor | deferred |
| Gmail integration | not implemented |
| Embeddings / RAG | not implemented |

---

## Minimum source set

See `CAREEROS_PROJECT_HISTORIAN.md` §32 (30 critical files). Primary product intent: `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md`.

---

## Quality gates for consumers of this system

Reject any derived output that:

1. Repeats large sections verbatim without adding structure  
2. Invents metrics (interview rate, hours saved, ATS pass %)  
3. Invents job titles or employment claims  
4. Claims multi-tenant SaaS, RAG, LinkedIn scraping, or auto-apply  
5. Uses stale score weights from `docs/ARCHITECTURE.md` instead of `SCORE_WEIGHTS` in `src/lib/types.ts`  
6. Treats founder-pending narrative as verified fact  
