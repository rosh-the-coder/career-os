# LinkedIn Posts

**Parent:** Resume Evidence + Bible  
**Compiled:** 2026-08-04  
**Rule:** Engineering tone. No fake metrics. No “thrilled to announce” fluff. Label drafts as drafts.

---

## Post 1 — Problem framing

**Hook:** Job boards optimize for volume. Multidisciplinary candidates need a different machine.

**Body:** I built CareerOS for my own search in Ireland: ingest roles, apply deterministic eligibility filters (including sponsorship nuance as a soft flag), score fit with explanations, and generate claim-validated ATS resumes. Submission stays human.

**Proof:** Next.js + Prisma + Supabase; hard filters + weighted scoring; resume validators.

**CTA:** Case study diagrams forthcoming — happy to dig into architecture with other builders.

**Do not claim:** Interview results.

---

## Post 2 — Deterministic + LLM

**Hook:** The useful pattern isn’t “AI applies for jobs.” It’s “AI advises inside guardrails.”

**Body:** CareerOS uses optional LLM-as-judge scoring (Groq→Gemini→heuristic fallback) but locks eligibility dimensions to deterministic rules. Resume generation defaults to inventory composition with claim validation — not freeform invention.

**Proof:** `mergeHeuristicWithJudge` behavior; `RESUME_DETERMINISTIC_ONLY`.

---

## Post 3 — Failure lesson (YOE)

**Hook:** Regex eligibility without negation will reject good roles.

**Body:** A JD saying effectively “nobody has N years of X” tripped a years-required hard reject. Fixed the inference path and locked it with Vitest cases. High-stakes filters need regression memory.

**Proof:** Commit `58c7763`; `tests/hard-filters.test.ts`.

---

## Post 4 — Resume engine evolution

**Hook:** Hard-coded CV templates don’t survive nine role profiles.

**Body:** Migrated CareerOS from reference templates (v2) to inventory-driven Resume Engine V3 and composition/themes in V4, behind `RESUME_ENGINE_VERSION`. Old packs remain as versioned rows — no silent overwrite.

**Proof:** V3 verification report; schema lineage fields.

---

## Post 5 — Portfolio honesty

**Hook:** Shipping speed is a metric. Hiring outcomes aren’t — unless you measure them.

**Body:** CareerOS went MVP→V3/V4 in six commits (Jul 24–Aug 4, 2026) with a 55-test Vitest suite at audit. I’m documenting architecture and limitations publicly rather than inventing ATS-pass percentages.

**Proof:** Git log; historian audit date.

---

## Publishing checklist

- [ ] Redact screenshots  
- [ ] No competitor dunking with unverified claims  
- [ ] Link only to assets you’re willing to show (private repo → case study site / diagrams)  
- [ ] Add founder voice after interview notes land  
