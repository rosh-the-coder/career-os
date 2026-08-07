# Component Map

Reusable React components for `case-study/app/` (Step 3). Prefer these over one-off section files.

**Motion stack:** Framer Motion default · GSAP ScrollTrigger only for complex pins (`ToolPileScene`, `EcosystemOrbit`, `PhilosophyStatement`, pipeline).

---

## CaseStudyShell

| Field | Spec |
|---|---|
| responsibility | Page frame, dark field tokens, reduced-motion provider, asset resolver |
| props | `children` |
| state | `reducedMotion` from `prefers-reduced-motion` |
| animation | none |
| a11y | landmark `main`; skip link |
| reduced-motion | disables scrub pins → fade/static |
| mobile | full width; safe areas |
| sections | all |

## CaseStudyNavigation

| Field | Spec |
|---|---|
| responsibility | Act jump links; progress dot |
| props | `acts: {id,label}[]`; `activeAct` |
| state | scrollspy |
| animation | opacity on §00/§22 hide |
| a11y | `nav`; keyboard |
| reduced-motion | instant |
| mobile | bottom or compact top |
| sections | §01+ except hero silence |

## ActDivider

| Field | Spec |
|---|---|
| responsibility | Chapter cards |
| props | `actNumber`; `title`; `eyebrow?` |
| state | none |
| animation | enter slide |
| a11y | `h2` |
| reduced-motion | static |
| mobile | stacked |
| sections | §02 §09 §15 §21 §28 §35 §44 §51 |

## HeroScene

| Field | Spec |
|---|---|
| responsibility | Brand / ambient full-bleed moments |
| props | `mode: 'title' \| 'seal' \| 'ambient'`; `title`; `subline?` |
| state | none |
| animation | Framer fade/stagger |
| a11y | `h1` once on §00 |
| reduced-motion | instant visible |
| mobile | smaller type scale |
| sections | §00 §03 §04 §06 §08 §19 §27 §34 §43 §50 §56 §60 |

## AntiPromiseScene

| Field | Spec |
|---|---|
| responsibility | Strike-through anti-promises → Human submits |
| props | `lines: string[]`; `finalLine: string` |
| state | scrub progress 0–1 |
| animation | GSAP or Framer scrub |
| a11y | list; aria on struck |
| reduced-motion | all struck + final visible |
| mobile | stacked |
| sections | §01 |

## ToolPileScene

| Field | Spec |
|---|---|
| responsibility | Interactive tool rain / pile |
| props | `tools: {id,label}[]`; `onComplete?` |
| state | `index`; `complete` |
| animation | physics-ish drop (Framer); GSAP pin |
| a11y | button “Add next tool”; live region |
| reduced-motion | show full stack + caption |
| mobile | tap; auto-advance |
| sections | §05 |

## WorkflowLoop

| Field | Spec |
|---|---|
| responsibility | Circular / sequential daily loop |
| props | `nodes`; `autoPlay` |
| state | `activeNode` |
| animation | edge pulse |
| a11y | tabbable nodes |
| reduced-motion | static labeled list |
| mobile | vertical from diagram `mobileOrder` |
| sections | §10 |

## EcosystemOrbit

| Field | Spec |
|---|---|
| responsibility | Landscape orbit + empty workflow core |
| props | `data` from `tool-ecosystem.json` |
| state | rotation; selected |
| animation | loop orbit; bounce |
| a11y | list alternative; tooltips as dialogs |
| reduced-motion | static ring / list |
| mobile | vertical categories |
| sections | §16 §17 §18 |

## PhilosophyStatement

| Field | Spec |
|---|---|
| responsibility | Full-screen thesis typography |
| props | `text: string` |
| state | none |
| animation | word stagger; long pin |
| a11y | `h2` |
| reduced-motion | full text immediate |
| mobile | stacked lines |
| sections | §22 |

## PrincipleGate

| Field | Spec |
|---|---|
| responsibility | Principle micro-interactions |
| props | `title`; `mode: 'evidence' \| 'human' \| 'title'` |
| state | locked/unlocked |
| animation | snap / unlock |
| a11y | explain state in text |
| reduced-motion | show unlocked end-state + caption |
| mobile | tap instead of drag |
| sections | §23 §24 §26 |

## ScoringExploder

| Field | Spec |
|---|---|
| responsibility | Score atom → weighted fragments / constellation |
| props | `weights` from scoring-breakdown data |
| state | exploded boolean |
| animation | explode on hover/tap |
| a11y | table alternative of weights |
| reduced-motion | table always |
| mobile | tap explode |
| sections | §25 §31 |

## SystemArchitectureScene

| Field | Spec |
|---|---|
| responsibility | Pipeline chambers / system context |
| props | `data` end-to-end or system-architecture JSON |
| state | progress; pinned stage |
| animation | scrub packet; GSAP pin |
| a11y | ordered list fallback |
| reduced-motion | static flowchart |
| mobile | vertical steps |
| sections | §29 §33 |

## HumanVsAIMap

| Field | Spec |
|---|---|
| responsibility | Deterministic vs optional AI vs human |
| props | `data` human-vs-ai / nested rings |
| state | llmEnabled |
| animation | pierce reject |
| a11y | categorized lists |
| reduced-motion | static map |
| mobile | stacked categories |
| sections | §13 §30 |

## ProductScreenFigure

| Field | Spec |
|---|---|
| responsibility | Act 6 figure wrapper (title, purpose, takeaway) |
| props | `title`; `purpose`; `takeaway`; `assetId`; `children` |
| state | none |
| animation | enter |
| a11y | `figure` / `figcaption` |
| reduced-motion | static |
| mobile | stack caption above image |
| sections | §36–§42 |

## AnnotatedScreenshot

| Field | Spec |
|---|---|
| responsibility | Large screenshot + numbered annotations |
| props | `assetId`; `annotations: {n,label,x,y}[]`; `alt` |
| state | active annotation |
| animation | pulse hotspots |
| a11y | alt + annotation list |
| reduced-motion | no pulse |
| mobile | annotations as list under image (not tiny overlays) |
| sections | §36–§42 · Act 6 extras |

## EvidencePipeline

| Field | Spec |
|---|---|
| responsibility | Inventory → validate → export motion |
| props | `data` evidence-to-resume |
| state | progress |
| animation | scan beam |
| a11y | step list |
| reduced-motion | static steps |
| mobile | vertical |
| sections | §32 §47 |

## ResumeVersionLineage

| Field | Spec |
|---|---|
| responsibility | Parent/child version tree |
| props | `data` resume-version-lineage |
| state | selected node |
| animation | tree draw |
| a11y | tree list |
| reduced-motion | static |
| mobile | vertical |
| sections | lineage deep dive / §40 |

## ArchitectureDeepDive

| Field | Spec |
|---|---|
| responsibility | Collapsed Linear-style engineering modules |
| props | `title`; `preview`; `children`; `diagramId?` |
| state | `open` default false |
| animation | height spring |
| a11y | `button` + `region`; keyboard |
| reduced-motion | instant expand |
| mobile | full-width accordion |
| sections | §45–§49 |

## MetricCallout

| Field | Spec |
|---|---|
| responsibility | Conceptual 20% / shipping timeline metrics |
| props | `kind: 'conceptual20' \| 'timeline'`; `disclaimer?` |
| state | none |
| animation | bar morph / node light |
| a11y | text alternative + disclaimer |
| reduced-motion | final state |
| mobile | stacked |
| sections | §11 §12 §58 |

## HonestyPanel

| Field | Spec |
|---|---|
| responsibility | Anti-chart + is/isn’t scope |
| props | `mode: 'anti-metric' \| 'scope'`; `items` |
| state | rejected attempt |
| animation | stamp collapse |
| a11y | alert on reject |
| reduced-motion | stamped state |
| mobile | stacked columns |
| sections | §55 §57 |

## ReflectionSection

| Field | Spec |
|---|---|
| responsibility | What-changed statements |
| props | `headline`; `body?` (≤2 lines) |
| state | none |
| animation | fade |
| a11y | `h3` |
| reduced-motion | static |
| mobile | same |
| sections | §52 §53 §54 §56 |

## NextProjectFooter

| Field | Spec |
|---|---|
| responsibility | Invitation + end credits + future portfolio link slot |
| props | `primaryCta?`; `secondaryCta?`; `credit` |
| state | none |
| animation | fade |
| a11y | links focusable |
| reduced-motion | static |
| mobile | stacked CTAs |
| sections | §59 §60 |

---

## Asset resolver helper (not a scene)

`resolveAsset(id)` → real file under `public/assets/screens|animations` if `status!==missing`, else placeholder SVG. Used by all visual components.

## Section → component matrix (quick)

| §§ | Primary component |
|---|---|
| 00 | HeroScene |
| 01 | AntiPromiseScene |
| 02,09,15,21,28,35,44,51 | ActDivider |
| 05 | ToolPileScene |
| 10 | WorkflowLoop |
| 12 | MetricCallout |
| 13,30 | HumanVsAIMap |
| 16–18 | EcosystemOrbit |
| 22 | PhilosophyStatement |
| 23–24,26 | PrincipleGate |
| 25,31 | ScoringExploder |
| 29,33 | SystemArchitectureScene |
| 32 | EvidencePipeline |
| 36–42 | ProductScreenFigure + AnnotatedScreenshot |
| 45–49 | ArchitectureDeepDive |
| 52–54,56 | ReflectionSection |
| 55,57 | HonestyPanel |
| 58 | MetricCallout |
| 59–60 | NextProjectFooter |
| Shell | CaseStudyShell + CaseStudyNavigation |
