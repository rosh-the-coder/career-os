# AI Usage Map

**Parent:** `PROJECT_BIBLE.md` §11  
**Compiled:** 2026-08-04  
**Rule:** Prefer precise “optional / default-off” language. Do not imply AI drives eligibility or submission.

---

## 1. Providers

| Provider | Role | Config |
|---|---|---|
| Groq | Primary LLM judge / ATS suggest / critic (when keys present) | `GROQ_API_KEY`, `GROQ_SCORE_MODEL` (default `llama-3.1-8b-instant`) |
| Google Gemini | Fallback judge; optional job extract; optional polish | `GEMINI_API_KEY`, `GEMINI_SCORE_MODEL` (e.g. `gemini-2.0-flash`) |
| Deterministic heuristics | Always-available core | N/A |
| Kill switch | Force heuristic scoring | `SCORE_LLM_DISABLED=true` |
| Resume polish gate | Default deterministic compose | `RESUME_DETERMINISTIC_ONLY` (default true) |

Interface / guardrails: `src/lib/ai/types.ts` (`PROMPT_GUARDRAILS`).

---

## 2. Workflow × AI matrix

| Stage | Uses AI? | Provider | Purpose | Deterministic control |
|---|---|---|---|---|
| Discovery | No | — | API/HTML fetch | — |
| Job parse | Optional | Gemini | Structured extract | `parseJobText` default |
| Hard filters | No | — | Eligibility / YOE / geo | Rules only |
| Scoring | Optional | Groq → Gemini | Fit narrative + scores | `scoreJob`; eligibility locked on merge |
| Resume compose V3/V4 | Default **No** | — | Inventory composition | Full V3 path |
| Resume polish | Optional | Gemini | Rewrite | Off unless deterministic flag false |
| ATS edit suggest | Optional | Groq → Gemini | Keyword rewrites | Coverage analysis alone; claim check; human apply |
| Resume critic | Optional | Groq → Gemini | Recruiter-style review | `heuristicCritique` fallback |
| Application Q&A | Optional stub | Gemini provider | Screening answers | DeterministicProvider stub — **not primary UI** |
| Auto-apply | No | — | — | Human submit only |

---

## 3. Must stay deterministic / human

| Decision | Control | Why |
|---|---|---|
| Visa / eligibility hard reject | Filters + human review | Immigration risk; Stamp 1G nuance |
| YOE hard reject | Deterministic (+ negation fixes) | False positives hurt recall |
| Claim / metric approval | DB flags + validators | Hallucination risk |
| Final CV submit | Human | Product principle |
| Application submission | Human | Anti-bot / accountability |
| Title invention | Title policy | Integrity |

---

## 4. Prompt / data leaving the boundary

When LLM features run, prompts may include JD text and candidate brief materials — **third-party processing** (Groq/Google). No claim of enterprise DPA packaging in-app.

---

## 5. Failure modes

| Failure | System behavior |
|---|---|
| Rate limit / missing key | Fall back to heuristic path |
| LLM/heuristic disagreement | LLM may replace totals when used; eligibility floats preserved |
| ATS rewrite drift | `validateEditText` before apply; residual risk if validators miss subtle wording |
| Critic “auto improve” | Re-composes layout from same contentV3 — **no content rewrite** (Studio limitation) |
| Studio Accept/Reject | Local React state only — not persisted |

---

## 6. Non-claims

- Not a multi-agent autonomous job hunter  
- Not RAG / embeddings retrieval  
- Not a proprietary foundation model  
- Not “AI writes your entire CV from scratch” in the default V3/V4 path  

---

## Diagram hooks

Human vs AI swimlane; provider fallback; scoring merge detail.
