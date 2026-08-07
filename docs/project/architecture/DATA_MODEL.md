# Data Model

**Parent:** `PROJECT_BIBLE.md` §10  
**Source of truth:** `prisma/schema.prisma`  
**Note:** Older `docs/DATA_MODEL.md` still mentions SQLite MVP language; runtime target is **Supabase PostgreSQL**.

---

## 1. Entity relationship (logical)

```text
User 1──1 Settings
User 1──* CareerProfile
User 1──* Experience
User 1──* Project
User 1──* Skill
User 1──* EvidenceItem ──* Metric
User 1──* Job 1──1 JobScore
User 1──* ResumeVersion (self: parentVersion / childVersions)
User 1──* Application

EvidenceItem *──? Experience | Project
CareerProfile *── ResumeVersion, JobScore
Job *── ResumeVersion, Application
Application ?── Job, ?── ResumeVersion
```

---

## 2. Model purposes

| Model | Role |
|---|---|
| **User** | Identity (`email`, `name`, `authUserId`) |
| **Settings** | Eligibility prefs, salary floor, contact/URLs, `dailyBatchTarget`, `layoffDate`, toggles |
| **CareerProfile** | Positioning variants (`key`, keywords, evidence order, default flag) |
| **Experience** | Canonical employment; title policy fields; bullets JSON; role order |
| **Project** | Canonical projects; stack/outcomes; CV priority; approval flags |
| **Skill** | Skill inventory + profile affinity |
| **EvidenceItem** | Truth store (`verified`, `confidence`, prohibited claims, estimate flags) |
| **Metric** | Quantified claims with approval/estimate gates |
| **Job** | Ingested listing + status + hard reject / soft flags |
| **JobScore** | 9 float dimensions + totals + strengths/gaps + `modelVersion` |
| **ResumeVersion** | Generated artifact: content/composition JSON, validation, paths, lineage, theme, critique |
| **Application** | Tracker row (Notion-like fields + legacy status dual representation) |

---

## 3. JobScore dimensions

Persisted floats aligned to `SCORE_WEIGHTS` components (see `src/lib/types.ts`).  
`modelVersion` distinguishes `deterministic-v1` vs `llm-judge:…`.

---

## 4. ResumeVersion dual eras

| Era | Content shape | Flag |
|---|---|---|
| V2 | Reference templates / AtsResumeContent | `RESUME_ENGINE_VERSION=v2` |
| V3 | `ResumeContentV3` in `contentJson` | `v3` |
| V4 | + `compositionJson`, `themeId`, `critiqueJson` | `v4` (default in `.env.example`) |

Lineage: `parentVersionId` → child versions (ATS apply creates new rows).

---

## 5. Canonical vs duplicated

| Topic | Reality |
|---|---|
| V2 templates | Hard-coded in `reference-templates.ts` |
| V3 → export | Adapter `v3/adapter.ts` → AtsResumeContent |
| Application status | `status` + `statusTagsJson` dual helpers |
| Job dedup | Primarily by URL; `duplicateGroupId` exists |
| Settings contact | Personal URLs/email in seed — **redact in public case studies** |

---

## 6. Migrations present

- `20260803140000_resume_engine_v3`  
- `20260803160000_experience_role_order`  
- `20260803180000_resume_studio_v4`  

Historian warning: historical `db push` usage — verify prod alignment operationally.

---

## 7. Inventory write paths

| Path | Mechanism |
|---|---|
| Initial seed | `prisma/seed.ts` |
| V3 inventory enrich | `prisma/seed-v3-inventory.ts` / `db:seed:v3` |
| Admin UI CRUD | **Not fully built** (Profiles mostly read-only) |

---

## Diagram hooks

ERD from this file; inventory → evidence corpus → validation; ResumeVersion lineage.
