# Future

**Parent:** Roadmap + Bible §18–19  
**Compiled:** 2026-08-04  
**Tone:** Possible futures labeled. Not a promise sheet.

---

## Near-term engineering futures (evidence-aligned)

| Theme | Why it matters | Repo signal |
|---|---|---|
| Durable export storage | Serverless tmp loses files | Historian operational limits |
| Scheduled discovery | Daily batch ambition without manual click | Architecture “future Cron”; Settings `dailyBatchTarget` |
| Inventory CMS | Seed/scripts bottleneck | Profiles partial; V3 deferred admin |
| Persisted Studio decisions | Accept/Reject currently ephemeral | Historian §16 |
| PDF page budgeting | Multi-page control incomplete | V3 deferred list |
| Scoring eval set | No formal match-accuracy harness | Historian §20 missing E2E/eval |

---

## Product futures (documented language only)

From `docs/DEPLOY.md` after-foundation list:

- Gmail alert parsing  
- Assisted form-fill + learning loop  
- Resume quality pass / typography polish  

All remain **unimplemented** in `src/` at compilation.

---

## Strategic futures (`[FOUNDER PENDING]`)

| Option | Implications |
|---|---|
| Remain personal tool forever | Keep allowlist; deepen HITL quality; portfolio asset |
| Productize for similar candidates | Requires multi-tenant authz, durable files, support, legal review of AI/immigration messaging |
| Extract resume engine as library | Separate claim validation + compose from job discovery |
| Interview-prep features next | Diverts from Notion-tracker depth — founder priority unknown |

---

## Non-futures (explicitly out unless strategy changes)

- Autonomous mass apply  
- LinkedIn/Indeed HTML scraping at scale  
- Claiming visa legal advice  
- RAG theater without inventory discipline  
- Guaranteed ATS vendor pass prediction  

---

## Research questions for next Bible revision

1. Founder interview §31 answers merged?  
2. Live prod schema aligned to V3/V4 migrations?  
3. Any verified application/interview outcome metrics to add under Impact?  
4. Which deferred item actually shipped next?

---

## Success criteria for “next chapter” (engineering)

Propose measuring progress with **verifiable** signals only:

- Cron or scheduled job exists in deploy config  
- Exports land in object storage with stable URLs  
- Profiles/[id] or inventory admin can edit evidence without seed scripts  
- Eval suite reports precision/recall on a labeled job set  
- Studio actions that claim to improve content actually mutate `contentJson` and re-export  

Do not use vanity user counts until multi-user exists.
