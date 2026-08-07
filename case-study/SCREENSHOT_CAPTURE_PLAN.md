# Screenshot Capture Plan

**Mode:** `CAREEROS_CASE_STUDY_MODE=true` after `npm run seed:case-study`  
**Demo user:** `case-study@careeros.demo` (safe contacts only)  
**Output folder:** `case-study/public/assets/screens/`  
**Filenames:** exact — do not rename  
**Viewport desktop:** 1440×1000 · **mobile:** 390×844  
**Redact always:** any residual personal email/phone/URLs/notes (demo seed should already be safe)

---

## Preconditions

```bash
npm run seed:case-study
# .env
CAREEROS_CASE_STUDY_MODE=true
DEV_BYPASS_AUTH=true
npm run dev
```

Confirm amber banner: `CASE STUDY DEMO DATA`.

Find demo job IDs from seed console output (scored / materials / rejected / fallback).

---

## Capture sequence

### 01 — Dashboard overview

| Field | Value |
|---|---|
| filename | `01-dashboard-overview.webp` |
| route | `/dashboard` |
| state | Demo jobs present (scored, rejected, materials_ready) |
| steps | Seed → open `/dashboard` → scroll top |
| viewport | 1440×1000 |
| scroll | 0 |
| redact | none expected |
| proves | Ops overview / pipeline |
| annotations | counts · Discover · priority list |
| storyboard | §36 |

### 02 — Jobs ranked list

| Field | Value |
|---|---|
| filename | `02-jobs-ranked-list.webp` |
| route | `/jobs` |
| state | Mixed statuses visible |
| steps | Open `/jobs` |
| viewport | 1440×1000 |
| scroll | 0 |
| proves | Ranking UI |
| annotations | score · profile · status |
| storyboard | Act 6 jobs |

### 03 — Job import

| Field | Value |
|---|---|
| filename | `03-job-import.webp` |
| route | `/jobs/new` |
| state | Empty form |
| steps | Open `/jobs/new` |
| viewport | 1440×1000 |
| proves | Controlled ingestion |
| annotations | paste · URL |
| storyboard | Act 6 import |

### 04 — Job score breakdown

| Field | Value |
|---|---|
| filename | `04-job-score-breakdown.webp` |
| route | `/jobs/{scored-id}` |
| state | North Harbor Labs · score 78 · UX Engineer |
| steps | From jobs list open scored demo job · ensure breakdown visible |
| viewport | 1440×1000 |
| proves | Explainable scoring |
| annotations | 1 total · 2 dimensions · 3 strengths/gaps |
| storyboard | §38 |

### 05 — Hard reject

| Field | Value |
|---|---|
| filename | `05-hard-reject.webp` |
| route | `/jobs/{rejected-id}` |
| state | Atlas Motion Works principal CAD · rejected banner |
| steps | Open rejected demo job |
| viewport | 1440×1000 |
| proves | Deterministic hard filter |
| annotations | banner · reason |
| storyboard | §39 |

### 06 — Eligibility soft flags

| Field | Value |
|---|---|
| filename | `06-eligibility-soft-flags.webp` |
| route | `/jobs/{scored-id}` |
| state | `no_sponsorship_language` soft flag visible |
| steps | Same scored job · frame soft-flag UI |
| viewport | 1440×1000 |
| proves | Soft flags for human review |
| annotations | soft flag chip |
| storyboard | §38 |

### 07 — Approve queue

| Field | Value |
|---|---|
| filename | `07-approve-queue.webp` |
| route | `/approve` |
| state | Scored / materials_ready rows |
| steps | Open `/approve` |
| viewport | 1440×1000 |
| proves | HITL triage |
| annotations | queue · actions |
| storyboard | §37 |

### 08 — Profile recommendation

| Field | Value |
|---|---|
| filename | `08-profile-recommendation.webp` |
| route | `/jobs/{scored-id}` |
| state | Recommended profile visible (UX Engineer) |
| steps | Scroll job detail to profile recommendation |
| viewport | 1440×1000 |
| proves | Role positioning pick |
| annotations | profile name |
| storyboard | Act 6 profile |

### 09 — Project recommendation

| Field | Value |
|---|---|
| filename | `09-project-recommendation.webp` |
| route | `/jobs/{materials-id}` |
| state | Recommended projects list (Workflow OS / Demo Systems Work) |
| steps | Open materials job · frame project recommendations |
| viewport | 1440×1000 |
| proves | Project selection signal |
| annotations | project names |
| storyboard | Act 6 projects |

### 10 — Resume Studio overview

| Field | Value |
|---|---|
| filename | `10-resume-studio-overview.webp` |
| route | `/resume-studio` |
| state | ≥2 versions |
| steps | Open `/resume-studio` |
| viewport | 1440×1000 |
| redact | confirm demo contact only |
| proves | Studio review surface |
| annotations | validation · download · composition |
| storyboard | §40 |

### 11 — Resume validation

| Field | Value |
|---|---|
| filename | `11-resume-validation.webp` |
| route | `/resume-studio` |
| state | Warning validation on parent version |
| steps | Expand/focus version with warning status |
| viewport | 1440×1000 |
| proves | Claim safeguards |
| annotations | warning badge · list |
| storyboard | §40 / §47 |

### 12 — Resume keyword fit

| Field | Value |
|---|---|
| filename | `12-resume-keyword-fit.webp` |
| route | `/jobs/{materials-id}` |
| state | Keyword fit / optimize panel (seed includes optimizeJson on resume; if UI needs analyze click, run Analyze once on materials job) |
| steps | Open materials job · frame CV keyword fit panel |
| viewport | 1440×1000 |
| proves | ATS tooling + human apply gate |
| annotations | coverage · suggest · apply |
| storyboard | Act 6 ATS |

### 13 — Resume version lineage

| Field | Value |
|---|---|
| filename | `13-resume-version-lineage.webp` |
| route | `/resume-studio` |
| state | Parent + child versions |
| steps | Frame lineage UI between the two seeded versions |
| viewport | 1440×1000 |
| proves | Append-only lineage |
| annotations | parent · child |
| storyboard | §40 |

### 14 — Generated resume preview

| Field | Value |
|---|---|
| filename | `14-generated-resume-preview.webp` |
| route | Studio composition preview and/or downloaded demo markdown/PDF opened locally |
| state | Demo contact Alex Rivera only |
| steps | Capture studio composition preview OR export preview with demo identity |
| viewport | 1440×1000 or document crop |
| redact | must show only demo contact |
| proves | Export artifact |
| annotations | header · projects |
| storyboard | §41 |

### 15 — Applications tracker

| Field | Value |
|---|---|
| filename | `15-applications-tracker.webp` |
| route | `/applications` |
| state | Demo rows; recruiter fields null |
| steps | Open `/applications` |
| viewport | 1440×1000 |
| proves | Tracker without auto-apply fantasy |
| annotations | tags · next actions |
| storyboard | §42 |

### 16 — Settings constraints

| Field | Value |
|---|---|
| filename | `16-settings-constraints.webp` |
| route | `/settings` |
| state | Demo links/contacts |
| steps | Open `/settings` · verify example.com contacts |
| viewport | 1440×1000 |
| redact | abort if real phone/email appears |
| proves | Constraints UI |
| annotations | salary · video toggle · batch |
| storyboard | Act 6 settings |

### 17 — Provider fallback state

| Field | Value |
|---|---|
| filename | `17-provider-fallback-state.webp` |
| route | `/jobs/{fallback-id}` |
| state | Harborfield job · `llm_rate_limit` soft flag |
| steps | Open fallback demo job · frame flag |
| viewport | 1440×1000 |
| proves | Graceful degradation |
| annotations | soft flag · modelVersion |
| storyboard | §33 |

### 18 — Empty state

| Field | Value |
|---|---|
| filename | `18-empty-state.webp` |
| route | `/resume-studio` |
| state | Empty versions — **optional**: temporarily hide demo versions or capture before seed resumes; if hard, capture Profiles empty-ish or document as deferred |
| steps | Prefer a clean empty studio; else skip and leave placeholder |
| viewport | 1440×1000 |
| proves | Empty Studio |
| storyboard | optional |

### 19 — Mobile dashboard

| Field | Value |
|---|---|
| filename | `19-mobile-dashboard.webp` |
| route | `/dashboard` |
| viewport | 390×844 |
| steps | Device mode → capture |
| proves | Responsive ops |
| storyboard | §36 mobile |

### 20 — Mobile job detail

| Field | Value |
|---|---|
| filename | `20-mobile-job-detail.webp` |
| route | `/jobs/{scored-id}` |
| viewport | 390×844 |
| steps | Device mode → capture |
| proves | Responsive fit UI |
| storyboard | §38 mobile |

---

## After capture

1. Save into `case-study/public/assets/screens/` with exact names.  
2. Update `ASSET_MANIFEST.json` statuses from `missing` → `ready` for captured ids (or do in Step 3).  
3. Spot-check: no real email/phone; amber banner may be cropped out of final portfolio crops if undesired (capture with banner ok for internal QA).  
4. Do **not** commit real personal data screenshots.  
