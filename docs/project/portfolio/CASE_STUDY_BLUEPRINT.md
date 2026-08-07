# Case Study Blueprint

**Parent:** `PROJECT_BIBLE.md`  
**Audience:** Senior engineers / hiring managers  
**Rule:** Narrative may dramatize structure; facts must remain evidence-backed. No invented metrics.

---

## Act 1 — Problem

| Layer | Content |
|---|---|
| **Narrative** | A multidisciplinary candidate in Dublin faces mis-framing on boards, eligibility complexity (Stamp 1G), slow manual CV tailoring, and hallucination risk from generic AI resume tools. Volume-oriented auto-apply tools are the wrong optimizer. |
| **Visuals** | Split: chaotic tabs/spreadsheets vs structured CareerOS pipeline (conceptual; do not fake UI of competitors). |
| **Screenshots** | Settings eligibility panel (redact PII); empty import form as “manual grind entry point.” |
| **Diagrams** | Problem map (profiles × titles × eligibility × hallucination). |
| **Animations** | Soft flags appearing on a JD that says “no sponsorship” but remains reviewable. |
| **Technical deep dive** | Build spec §2 problem list; README principles. |

**Evidence:** `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` §2; `README.md`.  
**Founder:** `[FOUNDER PENDING]` personal trigger story.

---

## Act 2 — Investigation

| Layer | Content |
|---|---|
| **Narrative** | Spec-driven investigation: what must be automated vs reviewed; what must never be invented. |
| **Visuals** | Spec excerpt → checklist Phase 0–2. |
| **Screenshots** | `docs/CHECKLIST.md` completion (as doc screenshot); early dashboard. |
| **Diagrams** | HITL checkpoint sketch. |
| **Animations** | Decision: “submit” node remains human. |
| **Technical deep dive** | Product principles §3; historian inventory method. |

**Evidence:** Build spec §3; `docs/CHECKLIST.md`.

---

## Act 3 — Existing Landscape

| Layer | Content |
|---|---|
| **Narrative** | Job boards optimize discovery volume; resume AI optimizes prose; auto-apply optimizes send count. None combine evidence inventory + Irish eligibility gates + explainable fit + claim-validated ATS packs for one operator. |
| **Visuals** | Comparison table of categories (not branded competitor screenshots unless licensed). |
| **Screenshots** | Blocked-host behavior requiring paste (`/jobs/new`) as intentional landscape choice. |
| **Diagrams** | Before/after capability matrix (honest gaps included). |
| **Animations** | “Scrape LinkedIn” path marked rejected. |
| **Technical deep dive** | `BLOCKED_HOST_HINTS`; Decision D8. |

**Do not claim** market share or competitor deficiency metrics.

---

## Act 4 — Design Principles

| Layer | Content |
|---|---|
| **Narrative** | Evidence before generation; HITL; strategic targeting; transparent scoring; no invented seniority. |
| **Visuals** | Five principle cards tied to code modules. |
| **Screenshots** | Score breakdown; validation warnings; title on generated CV. |
| **Diagrams** | Principles as gates on pipeline. |
| **Animations** | Claim blocked → warning state. |
| **Technical deep dive** | Bible §5; title-policy tests. |

---

## Act 5 — Architecture

| Layer | Content |
|---|---|
| **Narrative** | Next.js monolith with clear domain modules; Postgres inventory; optional LLM periphery; Vercel deploy. |
| **Visuals** | System context diagram. |
| **Screenshots** | Job detail showing filter + score + resume actions on one surface. |
| **Diagrams** | SYSTEM_ARCHITECTURE diagrams; ERD; scoring pipeline. |
| **Animations** | Packet flowing Discover→Score→Resume→Track. |
| **Technical deep dive** | `SYSTEM_ARCHITECTURE.md`; `SCORE_WEIGHTS`; engine flag. |

---

## Act 6 — Product

| Layer | Content |
|---|---|
| **Narrative** | Daily loop: discover/import → approve → generate packs → studio review → track applications. |
| **Visuals** | Route storyboard (see STORYBOARD.md). |
| **Screenshots** | Dashboard, Approve, Studio, Applications. |
| **Diagrams** | User journey state machine. |
| **Animations** | Approve queue batch → materials_ready. |
| **Technical deep dive** | Module breakdown Bible §14; API_MAP actions. |

---

## Act 7 — Engineering

| Layer | Content |
|---|---|
| **Narrative** | Hybrid scoring with eligibility lock-in; V3 inventory composer replacing templates; claim corpus that excludes self-CV; provider fallbacks; YOE negation regression tests. |
| **Visuals** | Code callouts (weights, merge, validate). |
| **Screenshots** | Vitest pass summary; Arthur Cox fixture mention (redact personal contact on CV exports). |
| **Diagrams** | V2→V3→V4; provider fallback; project ranking weights. |
| **Animations** | LLM judge attempt → eligibility floats unchanged. |
| **Technical deep dive** | DECISION_LOG; AI_USAGE; tests list (55). |

---

## Act 8 — Results

| Layer | Content |
|---|---|
| **Narrative** | **Verified results only:** Milestone 1 checklist complete; 6 commits in ~12 days MVP→V4; 55 Vitest tests passing at historian audit; V3 verification report 2026-08-03; deployable Vercel+Supabase path documented. |
| **Visuals** | Timeline of commits; checklist ticks. |
| **Screenshots** | Resume Studio with validation status; generated DOCX/PDF (redacted). |
| **Diagrams** | Honest “results” panel: engineering outputs vs **unavailable** hiring outcome metrics. |
| **Animations** | None that imply interview-rate charts. |
| **Technical deep dive** | Historian §§20–22, §29–30. |

**Forbidden:** fabricated hours saved, application counts, interview rates, offer outcomes unless founder provides verified numbers later.

---

## Act 9 — Reflection

| Layer | Content |
|---|---|
| **Narrative** | Determinism beats unconstrained generation for high-stakes self-representation; doc drift and multi-engine maintenance are real costs; serverless export durability and inventory CMS remain gaps. |
| **Visuals** | Lessons + Future boards. |
| **Screenshots** | Profiles read-only page as “known gap.” |
| **Diagrams** | Now/Next/Later. |
| **Animations** | Trade-off seesaw (recall vs safety). |
| **Technical deep dive** | LESSONS.md; FUTURE.md; founder interview answers when available. |

**Founder:** `[FOUNDER PENDING]` rebuild priorities; productize vs personal.

---

## Production notes

- Redact phone, email, personal URLs in all public CV screenshots.  
- Prefer desktop 1440×900 captures; add mobile only if claiming responsive work.  
- Cite commit SHAs when claiming shipping speed.  
- Label any founder-only anecdote clearly until merged into Bible.
