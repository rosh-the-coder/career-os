# Resume Engine V3 — Verification Report

**Date:** 2026-08-03  
**Status:** Core V3 path implemented and verified locally

## Done

| Requirement | Evidence |
|---|---|
| CV body no longer primarily hard-coded | `generateResumeForJob` uses `composeResumeV3` when `RESUME_ENGINE_VERSION=v3` |
| Prisma drives resumes | `loadCareerInventory` + Project/Experience resume bullets |
| Aethelgard + CareerOS in Selected Projects | Seeded; Arthur Cox CV includes both with **July 2026 – Present** |
| Dynamic project ranking | `rank-projects.ts` + score recommendations |
| AI Engineer profile | `ai_engineer` seeded; Arthur Cox title **AI Engineer** |
| No RAG/Azure fabrication | Tests + generated Arthur Cox markdown |
| Evidence-linked bullets | `ResumeClaim.evidenceIds` on V3 content |
| Validation excludes self-CV corpus | `buildEvidenceCorpus` / `validateResumeContentV3` |
| DOCX/PDF from V3 | via `v3ToAtsContent` → existing exporters |
| Old resumes preserved | New ResumeVersion rows only; V2 packs untouched |
| Feature flag | `RESUME_ENGINE_VERSION` (`v2` \| `v3`) |
| Tests | 31/31 pass including `tests/resume-engine-v3.test.ts` |
| Typecheck | `tsc --noEmit` OK |
| Production build | `npm run build` exit 0 |

## Arthur Cox sample

- Job: `cms57uhgm0001l1048pagpfj8`
- New version file: `Roshan_Najar_AI_Engineer_Arthur_Cox_LLP_2026-08-03`
- Composer: `resume-engine-v3.0.0` / schema `3.0`
- Selected Projects: Aethelgard, CareerOS
- Irish AI title preserved; functional focus only on that role

## Intentionally deferred / partial

- Full Word list styles / named heading styles (still Calibri paragraphs; ATS-safe)
- PDF page-count re-budget loop
- Rich manual resume editor UI (ATS apply-edits + lineage exist; freeform editor not built)
- Editable Career Inventory admin forms (data is DB-driven; Profiles page still mostly read-only)
- DeliverNoo (no verified inventory — not invented)
- Disputed Independent / Two Blokes / Arcop dates left as seeded (not “resolved”)

## Commands

```bash
npm run db:seed:v3
RESUME_ENGINE_VERSION=v3 npx tsx scripts/generate-resume.ts cms57uhgm0001l1048pagpfj8 1
npm test
npx tsc --noEmit
npm run build
```
