# Lessons Learned

**Parent:** `PROJECT_BIBLE.md` §17  
**Compiled:** 2026-08-04  
**Sources:** Code fixes, tests, verification reports, doc conflicts. Founder process lessons pending.

---

## L1 — High-stakes filters need negation and tests

**Lesson:** YOE extraction without negation creates false rejects.  
**Evidence:** Fix + `hard-filters.test.ts`; commit `58c7763`.  
**Transfer:** Any regex gate on natural language needs adversarial fixtures.

---

## L2 — LLM must not own irreversible policy

**Lesson:** Fit narrative can be probabilistic; eligibility should not.  
**Evidence:** `mergeHeuristicWithJudge` preserves eligibility floats.  
**Transfer:** Separate “judgment” from “authorization” in applied AI systems.

---

## L3 — Templates don’t scale across positionings

**Lesson:** Hard-coded CV templates fight multidisciplinary profile matrices.  
**Evidence:** V2 → V3 migration; role policies + inventory.  
**Transfer:** Content systems need structured sources of truth before generation.

---

## L4 — Validation corpus must not include the artifact

**Lesson:** Checking claims against generated markdown weakens the validator.  
**Evidence:** V3 `buildEvidenceCorpus` excludes generated CV; V2 path weaker.  
**Transfer:** Ground truth ≠ model output.

---

## L5 — Preview ≠ artifact

**Lesson:** Studio theme preview and Accept/Reject UI can diverge from exported files.  
**Evidence:** Historian §16.  
**Transfer:** Persist decisions or clearly label ephemeral UI.

---

## L6 — Doc drift is a product risk

**Lesson:** Architecture weights and project-selection docs diverged from code.  
**Evidence:** Bible Appendix A.  
**Transfer:** Code-generated docs or CI drift checks for critical constants.

---

## L7 — Feature flags beat big-bang rewrites

**Lesson:** `RESUME_ENGINE_VERSION` allowed coexistence of v2/v3/v4.  
**Evidence:** `resume/service.ts`; V3 report.  
**Trade-off:** Multi-path maintenance cost.

---

## L8 — Serverless file IO is not a document platform

**Lesson:** `/tmp` exports on Vercel are ephemeral.  
**Evidence:** Historian §19–21; deploy reality.  
**Transfer:** Plan object storage early for user-facing files.

---

## L9 — Coverage vs ToS

**Lesson:** Blocking protected boards reduces coverage and increases paste friction — intentionally.  
**Evidence:** `BLOCKED_HOST_HINTS`.  
**Transfer:** Explicit non-goals prevent accidental scrape debt.

---

## L10 — Portfolio honesty compounds

**Lesson:** Shipping speed and test counts are real metrics; hiring outcomes are not present in-repo.  
**Evidence:** Historian §§29–30.  
**Transfer:** Case studies that invent outcomes destroy trust with senior audiences.

---

## Founder-only lessons

| Prompt | Status |
|---|---|
| What process mistake cost the most calendar time? | `[FOUNDER PENDING]` |
| What would you refuse to rebuild the same way? | `[FOUNDER PENDING]` |
| What did this teach about job-search psychology? | `[FOUNDER PENDING]` |
