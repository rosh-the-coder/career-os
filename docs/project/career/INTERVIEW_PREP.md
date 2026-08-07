# Interview Prep

**Parent:** `PROJECT_BIBLE.md`  
**Compiled:** 2026-08-04  
**Rule:** Prefer precise engineering answers. Mark founder-only narrative as pending.

---

## 1. Founder story (90 seconds)

**Verified spine (safe to say):**

> I built CareerOS as my personal job-search operating system while targeting roles in Ireland. Boards and generic AI CV tools don’t handle a multidisciplinary profile or Stamp 1G eligibility nuance well. The product discovers or imports jobs, applies deterministic hard filters, scores fit with explanations, and generates claim-validated ATS resumes — then I review and submit manually. It is also structured as a portfolio case study of evidence-first applied AI.

**Add after interview:** `[FOUNDER PENDING]` layoff/emotional trigger; why build vs buy; proudest moment.

---

## 2. Technical story (2–3 minutes)

1. **Ingest:** Paste/URL + multi-board discovery; blocked protected hosts.  
2. **Parse:** Deterministic `parseJobText` (optional Gemini extract).  
3. **Gate:** `runHardFilters` for geo/seniority/YOE/CAD/video rules.  
4. **Score:** Weighted heuristics (`SCORE_WEIGHTS`); optional Groq/Gemini judge; merge preserves eligibility.  
5. **Generate:** Engine flag v2/v3/v4; V3 inventory compose; V4 themes/composition; validators; DOCX/PDF.  
6. **Operate:** Approve queue, Studio review, applications tracker; no auto-apply.

---

## 3. Architecture story

- Monolith Next.js domain modules under `src/lib/*`  
- Postgres via Prisma as career inventory + job/resume truth  
- LLM as **periphery** with fallbacks — not system of record for eligibility or claims  
- Append-only `ResumeVersion` lineage  
- Serverless export durability as known limitation  

Draw: D-03 scoring pipeline + D-05 evidence→resume.

---

## 4. Failures & fixes (credible)

| Failure | What happened | Fix | Evidence |
|---|---|---|---|
| YOE false positive | Negation phrases like “nobody has 10 years…” triggered reject | Negation-aware inference + tests | `hard-filters.test.ts`; commit `58c7763` |
| Template CV ceiling | Hard-coded templates couldn’t serve role variants truthfully at scale | Resume Engine V3 inventory composer | V3 report; commit `26f2596` |
| Doc drift | Architecture.md weights ≠ code | Treat `types.ts` as authority | Bible Appendix A |
| Studio UX honesty | Accept/Reject and theme preview don’t persist/export as users might assume | Documented limitation; generation-time files authoritative | Historian §16 |

`[FOUNDER PENDING]` worst wrong accept/reject remembered; any hallucination that slipped pre-validator.

---

## 5. Trade-offs (interview gold)

| Question | Answer sketch |
|---|---|
| Why not auto-apply? | Accountability, ToS, salary/immigration answers require human; product principle |
| Why not embeddings? | Debuggable heuristics first; no RAG in scope; inventory already structured |
| Why allow LLM scoring? | Better narrative + soft judgment; eligibility remains deterministic |
| Why three engines? | Safe migration from templates → composer → composition studio |
| Why block LinkedIn scrape? | Fragility + ToS; APIs/paste/watchlist instead |

---

## 6. Roadmap answers

**Say:** Cron discovery, durable object storage for exports, inventory admin UI, freeform editor, PDF re-budget, optional Gmail parsing (documented future — not built), scoring eval harness.

**Don’t say:** Committed ship dates you don’t have. Productization decision is `[FOUNDER PENDING]`.

---

## 7. STAR examples

### STAR A — Eligibility lock-in

- **S:** LLM judge could inflate unfit roles.  
- **T:** Keep explainable AI without unsafe eligibility overrides.  
- **A:** Implemented merge that preserves heuristic eligibility dimensions; hard filters first.  
- **R:** Eligibility decisions remain rule-based; LLM adds narrative/score under constraints. (No hiring-outcome metric.)

### STAR B — YOE negation

- **S:** False hard rejects on rhetorical YOE language.  
- **T:** Restore recall without abandoning YOE gates.  
- **A:** Fixed inference + Vitest regression (Salesforce-style cases in tests).  
- **R:** Specific false-positive class closed in suite; commit `58c7763`.

### STAR C — Evidence-first resumes

- **S:** Generative CVs invent stack/metrics.  
- **T:** Produce tailored ATS packs that stay claim-grounded.  
- **A:** Seeded inventory, V3 compose, corpus excluding self-CV, title policy, export validation.  
- **R:** V3 verification report; Arthur Cox fixture tests; Studio validation UI.

### STAR D — Shipping velocity

- **S:** Needed daily tool quickly.  
- **T:** Reach usable MVP then deepen resume honesty.  
- **A:** Incremental commits: MVP → discovery/approve → LLM scoring → ATS → tracker → V3/V4.  
- **R:** 6 commits over ~12 days; Milestone 1 checklist complete. (Do not inflate to “production SaaS.”)

---

## 8. Likely hard questions

| Question | Honest answer |
|---|---|
| Is this multi-user? | No — allowlisted single operator. |
| Does it guarantee ATS pass? | No. |
| Do you scrape LinkedIn? | No — blocked. |
| Is discovery always-on? | No cron; on-demand. |
| Are DOCX and PDF identical? | Same pipeline; rendering may differ. |
| Can Studio edit freely? | Review-focused; freeform editor deferred. |
| Where are outcome metrics? | Not in repo; I won’t invent them. |

---

## 9. Demo script (10 minutes)

1. Dashboard counts + Discover (or show existing batch)  
2. Job detail score + soft flags  
3. Hard reject example  
4. Generate resume → Studio validation + download  
5. ATS analyze (optional)  
6. Applications row  
7. Close on principles + limitations  

Redact live PII on shared calls.
