# Case Study Build Brief

**Role:** Implementation-ready plan derived from `CAREEROS_CASE_STORYBOARD.md`.  
**Not:** A prose rewrite of the storyboard.  
**Facts:** `docs/project/PROJECT_BIBLE.md` · Evidence: repository + Historian  
**Status key:** `todo` until React Step 3

**Height tokens:** `full` ≈ 100vh · `tall` ≈ 90vh · `std` ≈ 70–80vh · `short` ≈ 40–60vh · `pin` = sticky hold

---

## §00 Title breath

| Field | Spec |
|---|---|
| visible title | CareerOS |
| purpose | Brand before thesis |
| height | full |
| sticky | no |
| desktop | centered display word; delayed subline |
| mobile | same, smaller type |
| component | `HeroScene` |
| asset | `title-breath` (animation) |
| animation | fade 800ms; subline T+1200 |
| interaction | scroll only |
| source doc | Storyboard §00 · Bible §1 |
| repo evidence | README product name |
| status | todo |

## §01 Anti-promise

| Field | Spec |
|---|---|
| visible title | (none / crossed lines) |
| purpose | Kill wrong expectations |
| height | tall |
| sticky | soft 0.6 |
| desktop | stacked strike lines |
| mobile | stacked, larger tap targets N/A |
| component | `AntiPromiseScene` |
| asset | `antipromise` |
| animation | scrub strike L→R |
| interaction | scrub |
| source doc | Storyboard §01 · Bible “what it is not” |
| repo evidence | README disclaimer; no auto-apply |
| status | todo |

## §02 Act card — Broken Job Hunt

| Field | Spec |
|---|---|
| visible title | ACT 01 / THE BROKEN JOB HUNT |
| purpose | Chapter title |
| height | std |
| sticky | no |
| desktop | act numeral + title meet center |
| mobile | stacked |
| component | `ActDivider` |
| asset | none |
| animation | slide-in |
| interaction | scroll |
| source doc | Storyboard §02 |
| repo evidence | Build spec §2 problem |
| status | todo |

## §03 Rejection timeline

| Field | Spec |
|---|---|
| visible title | (ambient) |
| purpose | Feel time burning |
| height | pin |
| sticky | hold until fill |
| desktop | horizontal timeline |
| mobile | vertical density marks |
| component | `HeroScene` variant / timeline scene |
| asset | `rejection-timeline` |
| animation | scrub fill |
| interaction | scrub; optional hover mute labels |
| source doc | Storyboard §03 |
| repo evidence | conceptual only — no invented counts |
| status | todo |

## §04 Tab avalanche

| Field | Spec |
|---|---|
| visible title | (none) |
| purpose | Fragmentation as chrome |
| height | std |
| sticky | no |
| desktop | tab cascade |
| mobile | fewer tabs, same idea |
| component | custom under `ToolPileScene` family |
| asset | `tab-avalanche` |
| animation | cascade |
| interaction | scrub/auto |
| source doc | Storyboard §04 |
| repo evidence | founder frustration (copy map) |
| status | todo |

## §05 Tool rain

| Field | Spec |
|---|---|
| visible title | Eight tools. Zero workflow. |
| purpose | Iconic Act 1 interaction |
| height | pin |
| sticky | hold until sequence once |
| desktop | click drops tools |
| mobile | tap drops; scroll advances if idle |
| component | `ToolPileScene` |
| asset | `tool-rain` + `DIAGRAM_DATA/fragmented-workflow.json` |
| animation | drop + stack; Repeat collapses |
| interaction | tap/click sequence locked |
| source doc | Storyboard §05 |
| repo evidence | fragmented tool problem — Build spec §2 |
| status | todo |

## §06 Wrong room

| Field | Spec |
|---|---|
| visible title | One profile. Many misreads. |
| purpose | Multidiscipline mislabel |
| height | pin |
| sticky | hold |
| desktop | door corridor |
| mobile | vertical door stack |
| component | `HeroScene` / mislabel scene |
| asset | `wrong-room` |
| animation | stamp scrub |
| interaction | scrub |
| source doc | Storyboard §06 · Bible §3 |
| repo evidence | PROFILE_KEYS multidisciplinary set |
| status | todo |

## §07 Eligibility fog

| Field | Spec |
|---|---|
| visible title | Fit isn’t only skills. |
| purpose | Eligibility atmosphere |
| height | std |
| sticky | no |
| desktop | fog over JD |
| mobile | same |
| component | fog scene |
| asset | `eligibility-fog` |
| animation | fog loop |
| interaction | pointer clears fog briefly |
| source doc | Storyboard §07 · Bible eligibility |
| repo evidence | `hard-filters.ts`; Settings Stamp 1G |
| status | todo |

## §08 Act 1 seal

| Field | Spec |
|---|---|
| visible title | Fragmented. |
| purpose | Land Act 1 |
| height | tall |
| sticky | no |
| desktop | large word |
| mobile | large word |
| component | `ReflectionSection` lite / seal |
| asset | none |
| animation | hold |
| interaction | scroll |
| source doc | Storyboard §08 |
| repo evidence | — |
| status | todo |

## §09 Act card — Investigation

| Field | Spec |
|---|---|
| visible title | ACT 02 / THE INVESTIGATION |
| purpose | Chapter |
| height | std |
| sticky | no |
| component | `ActDivider` |
| asset | none |
| animation | typewriter question erase |
| interaction | scroll |
| source doc | Storyboard §09 |
| repo evidence | CareerOS began as decision engine (copy map) |
| status | todo |

## §10 Daily loop

| Field | Spec |
|---|---|
| visible title | (nodes) |
| purpose | Grind as motion |
| height | pin |
| sticky | hold one cycle |
| desktop | circular flow |
| mobile | vertical sequence from `daily-job-search-loop` mobileOrder |
| component | `WorkflowLoop` |
| asset | `daily-loop` + diagram JSON |
| animation | pulse edges |
| interaction | click node / auto-run |
| source doc | Storyboard §10 |
| repo evidence | founder loop description (copy map) |
| status | todo |

## §11 Time bar

| Field | Spec |
|---|---|
| visible title | (none) |
| purpose | Setup 20% beat |
| height | std |
| sticky | no |
| component | `MetricCallout` precursor |
| asset | `time-bar` |
| animation | scrub expand |
| interaction | scrub |
| source doc | Storyboard §11 |
| repo evidence | illustrative only |
| status | todo |

## §12 20% reveal

| Field | Spec |
|---|---|
| visible title | Only ~20% is the valuable work. |
| purpose | Act 2 thesis |
| height | pin |
| sticky | hold |
| desktop | split bar |
| mobile | stacked bars |
| component | `MetricCallout` |
| asset | `twenty-percent` |
| animation | dim 80% / bloom 20% |
| interaction | tap segments |
| source doc | Storyboard §12 |
| repo evidence | **conceptual** — label not KPI |
| status | todo |

## §13 Never automate

| Field | Spec |
|---|---|
| visible title | Control is a feature. |
| purpose | HITL plant |
| height | std |
| sticky | no |
| component | `HumanVsAIMap` / assist vs human |
| asset | `DIAGRAM_DATA/human-vs-ai.json` |
| animation | snap-back |
| interaction | drag to Automate rejects |
| source doc | Storyboard §13 · AI_USAGE |
| repo evidence | README human submit |
| status | todo |

## §14 Act 2 seal

| Field | Spec |
|---|---|
| visible title | So what already exists? |
| purpose | Bridge |
| height | short |
| sticky | no |
| component | `ActDivider` seal |
| asset | none |
| animation | question mark |
| interaction | scroll |
| source doc | Storyboard §14 |
| repo evidence | — |
| status | todo |

## §15 Act card — Landscape

| Field | Spec |
|---|---|
| visible title | ACT 03 / EXISTING LANDSCAPE |
| purpose | Chapter |
| height | std |
| sticky | no |
| component | `ActDivider` |
| asset | none |
| animation | pull-back |
| interaction | scroll |
| source doc | Storyboard §15 |
| repo evidence | — |
| status | todo |

## §16 Ecosystem orbit

| Field | Spec |
|---|---|
| visible title | (orbit) |
| purpose | Ecosystem not table |
| height | pin |
| sticky | hold |
| desktop | orbital map |
| mobile | vertical category list from mobileOrder |
| component | `EcosystemOrbit` |
| asset | `ecosystem-orbit` + `tool-ecosystem.json` |
| animation | slow loop |
| interaction | drag rotate; hover tooltips |
| source doc | Storyboard §16 |
| repo evidence | landscape framing Bible Act 3 |
| status | todo |

## §17 Slice labels

| Field | Spec |
|---|---|
| visible title | Each solves one slice. |
| purpose | Categorize orbit |
| height | std |
| sticky | continues pin from §16 preferred |
| component | `EcosystemOrbit` |
| asset | same |
| animation | magnetic snap |
| interaction | scrub |
| source doc | Storyboard §17 |
| repo evidence | — |
| status | todo |

## §18 Nobody owns workflow

| Field | Spec |
|---|---|
| visible title | Nobody owns the workflow. |
| purpose | Act 3 thesis |
| height | pin |
| sticky | hold |
| component | `EcosystemOrbit` |
| asset | same |
| animation | bounce from center |
| interaction | drag into center → bounce |
| source doc | Storyboard §18 |
| repo evidence | CareerOS owns workflow thesis Bible |
| status | todo |

## §19 Missing product silhouette

| Field | Spec |
|---|---|
| visible title | (glyph) |
| purpose | Foreshadow OS |
| height | std |
| sticky | no |
| component | silhouette scene |
| asset | none / composed |
| animation | glyph assemble |
| interaction | scroll |
| source doc | Storyboard §19 |
| repo evidence | — |
| status | todo |

## §20 Act 3 seal

| Field | Spec |
|---|---|
| visible title | (fade) |
| purpose | Silence before philosophy |
| height | short |
| sticky | no |
| component | `ActDivider` |
| asset | none |
| animation | fade black |
| interaction | scroll |
| source doc | Storyboard §20 |
| repo evidence | — |
| status | todo |

## §21 Act card — Philosophy

| Field | Spec |
|---|---|
| visible title | ACT 04 / THE PHILOSOPHY |
| purpose | Reset pace |
| height | std |
| sticky | no |
| component | `ActDivider` |
| asset | none |
| animation | minimal |
| interaction | scroll slow |
| source doc | Storyboard §21 |
| repo evidence | — |
| status | todo |

## §22 Hero statement

| Field | Spec |
|---|---|
| visible title | Generate resumes that sell you truthfully. |
| purpose | Unforgettable thesis |
| height | pin (long) |
| sticky | hold 1.2 scenes |
| desktop | huge type only — no cards/UI/diagrams |
| mobile | huge type, stacked lines |
| component | `PhilosophyStatement` |
| asset | none |
| animation | word stagger 120ms |
| interaction | optional parallax |
| source doc | Storyboard §22 · founder principle |
| repo evidence | README evidence-first; claim validation |
| status | todo |

## §23–§26 Principles

| ID | Title | component | interaction | evidence |
|---|---|---|---|---|
| §23 | Evidence before generation | `PrincipleGate` | claim blocked until evidence docks | `validate-content.ts` |
| §24 | Human in the loop | `PrincipleGate` | submit locked until Review | README |
| §25 | Transparent scoring | `ScoringExploder` | hover score explodes | `SCORE_WEIGHTS` |
| §26 | No invented seniority | `PrincipleGate` | title edit rubber-bands | `title-policy.ts` |

Each: height std · sticky no · asset none · status todo · source Storyboard + Bible §5

## §27 Philosophy seal

| Field | Spec |
|---|---|
| visible title | Beliefs need an engine. |
| purpose | Bridge to Act 5 |
| height | short |
| component | seal |
| source doc | Storyboard §27 |
| status | todo |

## §28 Act card — Engine

| Field | Spec |
|---|---|
| visible title | ACT 05 / THE ENGINE |
| purpose | Chapter |
| height | std |
| component | `ActDivider` |
| animation | blueprint grid |
| source doc | Storyboard §28 |
| status | todo |

## §29 Pipeline fly-through

| Field | Spec |
|---|---|
| visible title | (chambers) |
| purpose | Whole system motion |
| height | pin |
| sticky | hold |
| desktop | isometric pipeline |
| mobile | vertical steps from `end-to-end-careeros-flow` |
| component | `SystemArchitectureScene` |
| asset | `pipeline-flythrough` + diagram JSON |
| animation | scrub packet |
| interaction | scrub; click pin name |
| source doc | Storyboard §29 · SYSTEM_ARCHITECTURE |
| repo evidence | historian §3 workflow |
| status | todo |

## §30 Deterministic / AI rings

| Field | Spec |
|---|---|
| visible title | AI advises. Rules authorize. |
| purpose | Architecture thesis |
| height | pin |
| sticky | hold |
| component | `HumanVsAIMap` |
| asset | `nested-rings` + `deterministic-plus-llm.json` |
| animation | failed pierce spark |
| interaction | toggle LLM |
| source doc | Storyboard §30 · AI_USAGE |
| repo evidence | `llm-judge.ts` merge |
| status | todo |

## §31 Scoring constellation

| Field | Spec |
|---|---|
| visible title | (stars) |
| purpose | Weights as beauty |
| height | std |
| component | `ScoringExploder` |
| asset | `scoring-constellation` + `scoring-breakdown.json` |
| animation | stars settle |
| interaction | hover labels |
| source doc | Storyboard §31 |
| repo evidence | `src/lib/types.ts` SCORE_WEIGHTS |
| status | todo |

## §32 Evidence → page

| Field | Spec |
|---|---|
| visible title | (scan) |
| purpose | Honesty as motion |
| height | std |
| component | `EvidencePipeline` |
| asset | `evidence-scan` + `evidence-to-resume.json` |
| animation | scan beam scrub |
| interaction | scrub |
| source doc | Storyboard §32 |
| repo evidence | `validate-content.ts` |
| status | todo |

## §33 Provider fallback

| Field | Spec |
|---|---|
| visible title | (relays) |
| purpose | Reliability |
| height | std |
| component | relay scene / `SystemArchitectureScene` part |
| asset | `provider-relay` |
| animation | baton pass |
| interaction | kill relay |
| source doc | Storyboard §33 · DECISION_LOG D3 |
| repo evidence | Groq→Gemini→heuristic |
| status | todo |

## §34 Engine seal

| Field | Spec |
|---|---|
| visible title | Now — the thing itself. |
| purpose | Bridge to product |
| height | short |
| component | seal |
| animation | blueprint → glass |
| source doc | Storyboard §34 |
| status | todo |

## §35 Act card — Product

| Field | Spec |
|---|---|
| visible title | ACT 06 / THE PRODUCT |
| purpose | First real UI chapter |
| height | std |
| component | `ActDivider` |
| animation | glass → pixels |
| source doc | Storyboard §35 |
| **note** | Screenshots begin |
| status | todo |

## §36 Dashboard

| Field | Spec |
|---|---|
| visible title | Pipeline at a glance. |
| purpose | First real screen |
| height | tall |
| sticky | soft |
| component | `ProductScreenFigure` + `AnnotatedScreenshot` |
| asset | `01-dashboard-overview.webp` |
| animation | frame up; demo counts tick |
| interaction | hotspot Discover |
| source doc | Storyboard §36 · SCREENSHOT_SPEC S02 |
| repo evidence | `src/app/dashboard/page.tsx` |
| status | todo |

## §37 Discover → Approve

| Field | Spec |
|---|---|
| visible title | Batch in. Human chooses. |
| purpose | HITL triage |
| height | tall |
| component | `ProductScreenFigure` |
| asset | `07-approve-queue.webp` (+ dashboard crop optional) |
| animation | slider |
| interaction | drag compare |
| source doc | Storyboard §37 |
| repo evidence | `src/app/approve/page.tsx` |
| status | todo |

## §38 Job fit

| Field | Spec |
|---|---|
| visible title | Explainable fit. |
| purpose | Score UI |
| height | tall |
| component | `AnnotatedScreenshot` |
| asset | `04-job-score-breakdown.webp` + `06-eligibility-soft-flags.webp` |
| animation | hotspot pulse |
| interaction | hotspot callouts |
| source doc | Storyboard §38 |
| repo evidence | `src/app/jobs/[id]/page.tsx` |
| status | todo |

## §39 Hard reject

| Field | Spec |
|---|---|
| visible title | Some roles end here. |
| purpose | Determinism with teeth |
| height | tall |
| component | `AnnotatedScreenshot` |
| asset | `05-hard-reject.webp` |
| animation | morph Fit↔Reject |
| interaction | toggle |
| source doc | Storyboard §39 |
| repo evidence | `hard-filters.ts` |
| status | todo |

## §40 Resume Studio

| Field | Spec |
|---|---|
| visible title | Review before the world sees it. |
| purpose | Truthful materials |
| height | tall |
| component | `AnnotatedScreenshot` |
| asset | `10-resume-studio-overview.webp` · `11-resume-validation.webp` · `13-resume-version-lineage.webp` |
| animation | badge draw |
| interaction | hotspots |
| source doc | Storyboard §40 |
| repo evidence | `src/app/resume-studio/page.tsx` |
| status | todo |

## §41 Export

| Field | Spec |
|---|---|
| visible title | Same pipeline. Two artifacts. |
| purpose | Tangible output |
| height | tall |
| component | `ProductScreenFigure` |
| asset | `14-generated-resume-preview.webp` |
| animation | flip DOCX/PDF |
| interaction | flip |
| source doc | Storyboard §41 |
| repo evidence | export-docx / pdfkit |
| status | todo |

## §42 Applications

| Field | Spec |
|---|---|
| visible title | Track what you sent. Submit stays outside. |
| purpose | Close loop |
| height | tall |
| component | `AnnotatedScreenshot` |
| asset | `15-applications-tracker.webp` |
| animation | row sweep |
| interaction | pan |
| source doc | Storyboard §42 |
| repo evidence | `applications/` |
| status | todo |

## §43 Product seal

| Field | Spec |
|---|---|
| visible title | Under the glass — engineering. |
| purpose | Bridge Act 7 |
| height | short |
| component | seal |
| source doc | Storyboard §43 |
| status | todo |

## §44 Act card — Engineering

| Field | Spec |
|---|---|
| visible title | ACT 07 / ENGINEERING |
| purpose | Depth chapter |
| height | std |
| component | `ActDivider` |
| source doc | Storyboard §44 |
| status | todo |

## §45–§49 Expandables

| ID | Title | component | diagram | evidence |
|---|---|---|---|---|
| §45 | Hard filters | `ArchitectureDeepDive` | hard-filter-decision-tree | `hard-filters.ts` |
| §46 | LLM judge | `ArchitectureDeepDive` | deterministic-plus-llm | `llm-judge.ts` |
| §47 | Claim validation | `ArchitectureDeepDive` | evidence-to-resume | `validate-content.ts` |
| §48 | Engines v2→v4 | `ArchitectureDeepDive` | resume-composition | `resume/service.ts` |
| §49 | Tests as memory | `ArchitectureDeepDive` | — | `tests/*` · 55 tests |

Default **collapsed**. height auto · sticky no · status todo

## §50 Engineering seal

| Field | Spec |
|---|---|
| visible title | The interesting part isn’t the stack. It’s what the stack forbids. |
| purpose | Exit depth |
| height | std |
| component | seal |
| source doc | Storyboard §50 |
| status | todo |

## §51 Act card — What changed

| Field | Spec |
|---|---|
| visible title | ACT 08 / WHAT CHANGED HOW I BUILD |
| purpose | Reframe reflection |
| height | std |
| component | `ActDivider` |
| source doc | Storyboard §51 |
| status | todo |

## §52–§55 Changes

| ID | Title | component | asset |
|---|---|---|---|
| §52 | Authorization ≠ generation | `ReflectionSection` | none |
| §53 | Preview is not the product | `ReflectionSection` | none |
| §54 | Docs drift; code decides | `ReflectionSection` | none |
| §55 | Refuse fake outcomes | `HonestyPanel` | `anti-chart` |

§55 sticky hold. Sources: Storyboard + LESSONS.md + founder iterative trust insight.

## §56 Reflection seal

| Field | Spec |
|---|---|
| visible title | Build systems that tell the truth — especially about themselves. |
| purpose | Creed |
| height | tall |
| component | `ReflectionSection` |
| source doc | Storyboard §56 |
| status | todo |

## §57 Is / isn’t

| Field | Spec |
|---|---|
| visible title | (two columns) |
| purpose | Bookend scope |
| height | std |
| component | `HonestyPanel` |
| source doc | Storyboard §57 · Bible |
| status | todo |

## §58 Timeline

| Field | Spec |
|---|---|
| visible title | (commits) |
| purpose | Real shipping metric |
| height | std |
| component | `MetricCallout` / timeline |
| asset | `development-timeline.json` |
| interaction | hover SHA |
| source doc | Storyboard §58 · TIMELINE.md |
| repo evidence | git log 6 commits |
| status | todo |

## §59 Invitation

| Field | Spec |
|---|---|
| visible title | Explore the system. |
| purpose | Quiet CTA |
| height | std |
| component | `NextProjectFooter` precursor |
| source doc | Storyboard §59 |
| status | todo |

## §60 End card

| Field | Spec |
|---|---|
| visible title | CareerOS · evidence before generation |
| purpose | Credits |
| height | full |
| component | `NextProjectFooter` / end |
| source doc | Storyboard §60 |
| status | todo |

---

## Shell chrome (global)

| component | sections |
|---|---|
| `CaseStudyShell` | all |
| `CaseStudyNavigation` | after §01; hide on §00 and §22 |

## Extra product figures (Act 6 order expansion)

Map remaining required screens into Act 6 figures even if storyboard folded them:

| asset | placement |
|---|---|
| `02-jobs-ranked-list` | beside §36 or §38 |
| `03-job-import` | before §37 |
| `08-profile-recommendation` | with §38 |
| `09-project-recommendation` | with §38/§40 |
| `12-resume-keyword-fit` | with §40 |
| `16-settings-constraints` | optional appendix figure |
| `17-provider-fallback-state` | Act 7 or §33 callout with real UI |
| `18-empty-state` | optional |
| `19/20 mobile` | responsive proof strip |

## Completion gate (Step 3)

- [ ] Every §00–§60 has a component binding above  
- [ ] Every visual resolves via `ASSET_MANIFEST.json`  
- [ ] No Act 1–5 real screenshots  
- [ ] No private data  
- [ ] No invented outcome metrics  
