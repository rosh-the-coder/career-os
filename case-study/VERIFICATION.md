# Preparation verification

**Date:** 2026-08-04  
**Scope:** Step 1 preparation only — no portfolio React page built.

## Checklist

| Gate | Status |
|---|---|
| Every storyboard §00–§60 mapped in `CASE_STUDY_BUILD_BRIEF.md` | pass |
| Every section has a component binding in `COMPONENT_MAP.md` | pass |
| Every visual has an `ASSET_MANIFEST.json` entry (53 assets) | pass |
| Every required screenshot has capture instructions | pass (`SCREENSHOT_CAPTURE_PLAN.md` + `CAPTURE_CHECKLIST.md`) |
| Diagram data files (16) present under `DIAGRAM_DATA/` | pass |
| Designed SVG placeholders (not blank grey) | pass (`public/assets/placeholders/`) |
| Copy mapped with sources; no public `[FOUNDER PENDING]` | pass (`COPY_MAP.md`) |
| Claims cite Bible / Historian / code | pass (brief + copy map) |
| No private data in seed demo contacts | pass (`alex.rivera@example.com`, example URLs) |
| Case-study UI / portfolio page **not** built | pass (`case-study/app/` stub only) |
| `npm run seed:case-study` creates isolated user | pass |
| Real inventory not overwritten by seed | pass (separate email `case-study@careeros.demo`) |

## Case-study mode

| Item | Detail |
|---|---|
| Env | `CAREEROS_CASE_STUDY_MODE=true` (see `.env.example`) |
| Script | `npm run seed:case-study` |
| Banner | `CaseStudyModeBanner` when mode on |
| User resolution | `getPrimaryUser()` → demo operator |
| Page scoping | Dashboard / Jobs / Approve / Settings / Profiles / Studio / Discover filter by active user |

## Not done (by design — later steps)

- Real WebP screenshots (Step 2 — human capture)
- Portfolio React app under `case-study/app/` (Step 3)
- Publish to `theonlyrosh.com/projects/careeros` (Step 4 — other repo)
