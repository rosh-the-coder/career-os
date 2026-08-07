# Diagram Specification

**Parent:** `PROJECT_BIBLE.md` + Case Study  
**Compiled:** 2026-08-04  
**Rule:** No quantitative outcome metrics on diagrams. Label confidence where inferred.

---

## D-01 End-to-end job workflow

| Field | Spec |
|---|---|
| **Type** | Horizontal flowchart |
| **Purpose** | Product narrative spine |
| **Nodes** | Discover/Import → Parse → HardFilter → Score (±LLM) → Review → Resume (v2/v3/v4) → Validate → Export → ATS opt (opt) → Studio → Application track → External submit |
| **Edges** | Solid = data/control; dashed = optional LLM |
| **Sources** | Historian §3; `SYSTEM_ARCHITECTURE.md` |
| **Case-study act** | 1–6 |

---

## D-02 System context

| Field | Spec |
|---|---|
| **Type** | C4-style context |
| **Nodes** | Operator, CareerOS app, Supabase, LLM providers, ATS APIs, Aggregators, Watchlist sites |
| **Edges** | HTTPS; label “no LinkedIn/Indeed scrape” |
| **Sources** | SYSTEM_ARCHITECTURE §1 |
| **Act** | 5 |

---

## D-03 Scoring pipeline

| Field | Spec |
|---|---|
| **Type** | Pipeline + merge join |
| **Nodes** | Job+Settings → HardFilters → Heuristic scoreJob → (optional) LLM judge → merge → JobScore |
| **Callout** | Eligibility floats locked from heuristic path |
| **Weights table** | Attach `SCORE_WEIGHTS` (code) as footnote — not Architecture.md |
| **Sources** | `score-job.ts`, `llm-judge.ts`, `types.ts` |
| **Act** | 5, 7 |

---

## D-04 Deterministic vs AI decision map

| Field | Spec |
|---|---|
| **Type** | 2-column swimlane or colored stage bar |
| **Legend** | Green = deterministic; Amber = optional AI; Red = human-only |
| **Stages** | Per AI_USAGE matrix |
| **Act** | 4, 7 |

---

## D-05 Evidence → resume pipeline

| Field | Spec |
|---|---|
| **Type** | Flow |
| **Nodes** | Inventory (Exp/Proj/Skill/Evidence/Metric) → Rank projects/exp → Compose ResumeContentV3 → Validate (corpus excludes CV) → ComposeDocument (V4) → Theme → DOCX/PDF |
| **Sources** | `compose-resume.ts`, `validate-content.ts`, composition/ |
| **Act** | 7 |

---

## D-06 Database ERD

| Field | Spec |
|---|---|
| **Type** | ER diagram |
| **Content** | Models from DATA_MODEL.md / schema.prisma |
| **Omit** | Seed PII field values |
| **Act** | Appendix / 5 |

---

## D-07 Resume version lineage

| Field | Spec |
|---|---|
| **Type** | Tree |
| **Nodes** | ResumeVersion parent → children (ATS apply, regenerations) |
| **Fields shown** | composerVersion, schemaVersion, themeId, validation status |
| **Act** | 7–8 |

---

## D-08 Provider fallback

| Field | Spec |
|---|---|
| **Type** | Decision chain |
| **Nodes** | Attempt Groq → fail/limit → Gemini → fail → heuristic |
| **Applies to** | Judge, ATS suggest, critic |
| **Act** | 7 |

---

## D-09 Hard-filter decision tree

| Field | Spec |
|---|---|
| **Type** | Decision tree |
| **Branches** | Geo auth → unpaid/intern → seniority titles → CAD/mechanical → ML/PhD → video toggle → YOE thresholds → soft flags → eligibility enum |
| **Sources** | `hard-filters.ts` (keep aligned with code; do not simplify incorrectly) |
| **Act** | 4, 7 |

---

## D-10 Project ranking

| Field | Spec |
|---|---|
| **Type** | Weighted bar / formula card |
| **Weights** | PROFILE_RANK: 0.25 / 0.25 / 0.2 / 0.1 / 0.1 / 0.1 |
| **Force-select callout** | AI profiles: Aethelgard + CareerOS on 1-page; RVV on 2-page when present (**code**, not stale PROJECT_SELECTION doc) |
| **Act** | 7 |

---

## D-11 HITL checkpoints

| Field | Spec |
|---|---|
| **Type** | Sequence |
| **Checkpoints** | Trigger discovery; Approve; Generate; Review validation; Apply ATS edits; Download; External submit |
| **Act** | 6 |

---

## D-12 Application lifecycle

| Field | Spec |
|---|---|
| **Type** | State machine |
| **States/tags** | Applied, Interviewed, Rejected, Offer, Accepted + next-action tags |
| **Sources** | `applications/constants.ts` |
| **Act** | 6 |

---

## D-13 Before/after resume engines

| Field | Spec |
|---|---|
| **Type** | Comparison |
| **Before** | V2 hard-coded reference templates |
| **After** | V3 inventory compose + V4 composition/themes/critic |
| **Bridge** | `RESUME_ENGINE_VERSION` flag |
| **Act** | 7–9 |

---

## D-14 Human vs AI decisions

| Field | Spec |
|---|---|
| **Type** | Table diagram |
| **Rows** | Eligibility, YOE reject, claims, titles, submit, score narrative, ATS wording suggest, critic |
| **Columns** | Owner (Det / AI / Human) |
| **Act** | 4, 9 |

---

## D-15 Git shipping timeline

| Field | Spec |
|---|---|
| **Type** | Linear timeline |
| **Nodes** | 6 commits with dates/SHAs from TIMELINE.md |
| **Act** | 8 |

---

## Rendering guidance

- Prefer monochrome + one accent; avoid marketing purple glow.  
- Always footnote “Source: path/to/file”.  
- If a diagram would require an outcome metric, replace with engineering metric (tests, commits, checklist).
