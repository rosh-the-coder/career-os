# Migration — Resume Engine V3

## Applied

1. Prisma schema extended (`Project` CV fields, `Skill` enrichment, `Experience` titles, `ResumeVersion` lineage).
2. SQL migration: `prisma/migrations/20260803140000_resume_engine_v3/migration.sql` (applied to Supabase).
3. Schema backups: `prisma/schema.prisma.bak-v2`, `prisma/seed.ts.bak-v2`.
4. Non-destructive inventory upsert: `npm run db:seed:v3` (preserves jobs/resumes).
5. Feature flag: `RESUME_ENGINE_VERSION=v3`.

## Preserve

- All existing `ResumeVersion` rows (not mutated).
- Legacy `reference-templates.ts` for `v2` path.
- Download route regenerates from stored `ats` payload.

## Verify

```bash
npm run db:seed:v3
npm test
npx tsx scripts/generate-resume.ts cms57uhgm0001l1048pagpfj8 1
npm run build
```

## Arthur Cox

Job ID `cms57uhgm0001l1048pagpfj8` should generate a **new** version with profile title AI Engineer and Selected Projects including Aethelgard + CareerOS.
