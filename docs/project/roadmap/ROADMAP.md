# Roadmap

**Parent:** `PROJECT_BIBLE.md` §18  
**Compiled:** 2026-08-04  
**Rule:** Separate **done**, **deferred-in-docs**, and **inference**. Inference is not a commitment.

---

## Done (verified)

| Item | Evidence |
|---|---|
| Milestone 1 Phase 0–2 | `docs/CHECKLIST.md` |
| Discovery + Approve queue | Commits `e1c0273`, `68f82b4` |
| LLM scoring UX | `68f82b4` |
| ATS keyword tooling | `3feecf3` |
| Applications tracker + YOE fix | `58c7763` |
| Resume Engine V3/V4 + Studio + claim validation | `26f2596`; V3 report |

---

## Explicitly deferred / partial (repo language)

| Item | Source |
|---|---|
| Full Word named styles | V3 verification report |
| PDF page-count re-budget loop | V3 report |
| Freeform resume editor | V3 report; historian §16 |
| Career inventory admin forms | V3 report; Profiles read-only |
| `/profiles/[id]` | Listed in old ROADMAP; **not built** |
| DeliverNoo project | Intentionally omitted (no verified inventory) |
| Disputed employment date resolution | Seeded as-is |
| Gmail alert parsing | `docs/DEPLOY.md` “After this foundation” |
| Assisted form-fill + learning loop | DEPLOY future list |
| Vercel Cron discovery | Architecture “future Cron”; none in `vercel.json` |
| Studio Accept/Reject persistence | Not implemented (local state) |
| Critic auto-improve content rewrite | No-op compose today |
| Theme stubs beyond arthur-cox / minimal-ats | `ready: false` |

---

## Documented “after foundation” (DEPLOY)

Unchecked planned themes in deploy docs:

1. Daily ~25 discovery quality  
2. Approve-queue → bulk CV packs (partially addressed by pack actions — verify vs ambition)  
3. Resume quality pass  
4. Gmail alert parsing  
5. PDF typography polish  
6. Assisted form-fill + learning loop  

Treat as backlog signals, not dated commitments.

---

## Inferred extensions (not commitments)

- Object storage for durable exports on Vercel  
- E2E browser tests  
- Offline scoring/match eval harness  
- Richer Notion-like boards for applications  
- Cron + pacing for discovery/LLM  

---

## Suggested priority bands (compiler recommendation only)

| Band | Items |
|---|---|
| **P0 reliability** | Durable exports; prod migration alignment verification |
| **P1 daily ops** | Cron discovery; inventory admin CRUD |
| **P2 quality** | PDF re-budget; freer Studio editing with persisted decisions |
| **P3 expansion** | Gmail parse; form-fill assist — only with HITL intact |

Founder reordering: `[FOUNDER PENDING]`.
