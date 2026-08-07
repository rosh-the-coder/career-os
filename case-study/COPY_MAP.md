# Copy Map

Visible text only. Max lengths enforced. Sources cited. No `[FOUNDER PENDING]` in public strings where answers exist.

**Legend:** D = desktop · M = mobile · WC = max words

---

## Cold open

| ID | Final copy | Source | WC | D | M |
|---|---|---|---|---|---|
| §00 title | CareerOS | README / Bible | 1 | same | same |
| §00 sub | A job-search operating system. | Storyboard | 5 | delayed | delayed shorter pause |
| §01 l1 | Not a mass-apply bot. | Bible / Storyboard | 5 | strike | strike |
| §01 l2 | Not an AI that invents a career. | Bible / Storyboard | 7 | strike | strike |
| §01 l3 | Not a guaranteed interview machine. | Bible / Storyboard | 5 | strike | strike |
| §01 final | Human submits. | README disclaimer | 2 | hold | hold |

---

## Act 1

| ID | Final copy | Source | WC |
|---|---|---|---|
| §02 | ACT 01 — The Broken Job Hunt | Storyboard | 6 |
| §05 after | Eight tools. Zero workflow. | Storyboard | 4 |
| §06 | One profile. Many misreads. | Bible §3 / Storyboard | 4 |
| §07 whisper | Fit isn’t only skills. | Storyboard / eligibility design | 5 |
| §08 | Fragmented. | Storyboard | 1 |
| §08 sub | The work wasn’t hard. The system was. | Storyboard | 8 |

**Origin micro-line (optional Act 1 end, ≤25 words):**  
After 17 July 2026, an existing job-search frustration became urgent — searching, filtering, rewriting, and paying for fragmented tools on repeat.  
Source: founder insight (layoff date in Settings / Architecture decision log).

---

## Act 2

| ID | Final copy | Source | WC |
|---|---|---|---|
| §09 | ACT 02 — The Investigation | Storyboard | 5 |
| §09 whisper | It started as a decision engine — not a resume builder. | Founder insight | 12 |
| §12 | Only ~20% is the valuable work. | Storyboard (conceptual) | 7 |
| §12 disclaimer | Illustrative split — not a measured KPI. | Storyboard honesty rule | 7 |
| §12 human | Judgment · Truthful materials | Storyboard | 4 |
| §13 | Control is a feature. | Storyboard | 4 |
| §14 | So what already exists? | Storyboard | 5 |

---

## Act 3

| ID | Final copy | Source | WC |
|---|---|---|---|
| §15 | ACT 03 — Existing Landscape | Storyboard | 5 |
| §17 | Each solves one slice. | Storyboard | 5 |
| §18 | Nobody owns the workflow. | Storyboard | 5 |

---

## Act 4

| ID | Final copy | Source | WC |
|---|---|---|---|
| §21 | ACT 04 — The Philosophy | Storyboard | 5 |
| §22 | Generate resumes that sell you truthfully. | Founder principle / Storyboard | 6 |
| §23 | Evidence before generation. | README / Build spec | 4 |
| §24 | Human in the loop. | README / Build spec | 5 |
| §25 | Transparent scoring. | README / Build spec | 2 |
| §26 | No invented seniority. | README / Build spec | 3 |
| §27 | Beliefs need an engine. | Storyboard | 5 |

---

## Act 5

| ID | Final copy | Source | WC |
|---|---|---|---|
| §28 | ACT 05 — The Engine | Storyboard | 5 |
| §30 | AI advises. Rules authorize. | Storyboard / AI_USAGE | 4 |
| §34 | Now — the thing itself. | Storyboard | 5 |

**Engine side note (≤20 words, optional):**  
Early keyword matching produced obviously wrong fit scores — LLM judgement arrived to read meaning, while hard filters stayed deterministic.  
Source: founder insight + `llm-judge.ts` / `hard-filters.ts`.

---

## Act 6

| ID | Final copy | Source | WC |
|---|---|---|---|
| §35 | ACT 06 — The Product | Storyboard | 5 |
| §36 | Pipeline at a glance. | Storyboard | 4 |
| §37 | Batch in. Human chooses. | Storyboard | 4 |
| §38 | Explainable multi-factor fit. | Storyboard / SCORE_WEIGHTS | 4 |
| §39 | Some roles end here. | Storyboard | 5 |
| §40 | Review before the world sees it. | Storyboard | 7 |
| §41 | Same pipeline. Two artifacts. | Storyboard | 4 |
| §42 | Track what you sent. Submit stays outside. | Storyboard / README | 8 |
| §43 | Under the glass — engineering. | Storyboard | 5 |

---

## Act 7

| ID | Final copy | Source | WC |
|---|---|---|---|
| §44 | ACT 07 — Engineering | Storyboard | 4 |
| §45 title | Hard filters | Storyboard | 2 |
| §45 preview | Eligibility before opinion. | Storyboard | 3 |
| §46 title | LLM judge | Storyboard | 2 |
| §46 preview | Narrative yes. Eligibility no. | Storyboard / llm-judge | 4 |
| §47 title | Claim validation | Storyboard | 2 |
| §47 preview | Corpus excludes the CV itself. | V3 validate-content | 6 |
| §48 title | Resume engines | Storyboard | 2 |
| §48 preview | Feature-flagged migration. | RESUME_ENGINE_VERSION | 3 |
| §49 title | Regression memory | Storyboard | 2 |
| §49 preview | 55 tests at audit · YOE negation locked. | Historian §20 · commit 58c7763 | 8 |
| §50 | The interesting part isn’t the stack. It’s what the stack forbids. | Storyboard | 14 |

**Trust note (expandable footer, ≤30 words):**  
The resume engine took many iterations before a document felt trusted enough to submit — editorial quality, not a single catastrophic failure.  
Source: founder insight.

---

## Act 8–9

| ID | Final copy | Source | WC |
|---|---|---|---|
| §51 | ACT 08 — What changed how I build | Storyboard | 8 |
| §52 | Generation can be creative. Authorization must be dull. | Storyboard | 8 |
| §53 | If it isn’t persisted, it isn’t the workflow. | Storyboard / Studio limits | 9 |
| §54 | Docs drift. Code decides. | Storyboard / Bible Appendix A | 4 |
| §55 stamp | NO EVIDENCE | Storyboard honesty | 2 |
| §56 | Build systems that tell the truth — especially about themselves. | Storyboard | 11 |
| §57 is | Personal job-search OS · Evidence-first · Human-in-the-loop | Bible | 8 |
| §57 isn’t | Mass apply · Multi-tenant SaaS · Visa advice | Bible | 7 |
| §58 | Six commits. Jul 24 → Aug 4, 2026. | TIMELINE.md | 8 |
| §59 | Explore the system. | Storyboard | 3 |
| §60 credit | CareerOS · Evidence before generation. | README | 5 |
| §60 scope | Production-ready for one operator — not distribution-ready SaaS. | Founder insight | 9 |

---

## Mobile variants

- Prefer identical wording; allow line breaks earlier.  
- §22 may split to 2–3 lines.  
- §12 disclaimer always visible (don’t hide under tap).  
- Act 7 previews may wrap; keep titles unchanged.

## Banned public phrases

- Invented interview/offer percentages  
- “Guaranteed ATS pass”  
- “Multi-user platform” / “SaaS customers”  
- “Scrapes LinkedIn”  
- “[FOUNDER PENDING]”  
