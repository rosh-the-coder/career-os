# Storyboard

**Parent:** Case Study Blueprint  
**Purpose:** Shot list for portfolio video / scroll story / deck beats  
**Compiled:** 2026-08-04

---

## Beat sheet

| # | Act | Duration (guide) | On-screen | VO / caption seed | Asset |
|---|---|---|---|---|---|
| 1 | 1 | 8s | Problem titles floating (UX / AI / Design Eng) | “One profile, many labels — boards don’t know which.” | Motion graphic |
| 2 | 1 | 6s | Eligibility / Stamp 1G constraint (abstract) | “Fit isn’t only skills.” | Diagram |
| 3 | 2 | 8s | Spec principles list | “Evidence before generation. Human submits.” | Doc still |
| 4 | 3 | 8s | Blocked scrape vs API/paste | “Coverage with boundaries.” | `/jobs/new` |
| 5 | 4 | 10s | Five principles → code modules | Map principle to file | Diagram |
| 6 | 5 | 12s | System context animation | Next.js · Prisma · Groq/Gemini · boards | DIAGRAM_SPEC |
| 7 | 6 | 15s | Dashboard → Discover → Approve | Daily ops loop | Screen recording |
| 8 | 6 | 12s | Job detail score cards | Explainable fit | `/jobs/[id]` |
| 9 | 7 | 12s | Hard reject banner | Deterministic gate | Rejected job |
| 10 | 7 | 15s | Resume Studio validation + composition | Claim-checked pack | `/resume-studio` |
| 11 | 7 | 10s | Provider fallback sketch | Groq → Gemini → heuristic | Diagram |
| 12 | 8 | 10s | Git timeline 6 commits | Shipped MVP→V4 | TIMELINE |
| 13 | 8 | 8s | Vitest / checklist | Verified engineering outcomes | Still |
| 14 | 8 | 6s | “Outcome metrics: not claimed” card | Honesty beat | Typography |
| 15 | 9 | 12s | Gaps + roadmap | What remains | Profiles partial; FUTURE |
| 16 | End | 6s | Name + repo role | CareerOS — personal job-search OS | Title card |

---

## Recording order (efficient)

1. Seeded DB with mixed: scored, rejected, studio versions, applications.  
2. Capture stills per SCREENSHOT_SPEC.  
3. Record continuous path: Dashboard Discover → Jobs → Approve → Generate → Studio → Applications.  
4. Record failure path: import blocked URL → paste → hard reject example.  
5. Export redacted DOCX/PDF stills.

---

## Continuity rules

- Same job ID across score → resume → application beats when possible.  
- Show `modelVersion` if contrasting heuristic vs LLM judge.  
- Never show `.env` or API keys.  
- Prefer arthur-cox theme for “production pack” beat; mention minimal-ats as alternate ready theme.
