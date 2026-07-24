# CareerOS Database Schema

SQLite via Prisma for local MVP. Types map 1:1 to future Supabase/PostgreSQL.

## Entities

- **User** — auth identity (Supabase user id)
- **Settings** — eligibility, salary floor, toggles
- **CareerProfile** — A–E positioning variants
- **Experience / Project / Skill** — inventory
- **EvidenceItem / Metric** — claim source of truth
- **Job / JobRequirement / JobScore** — ingestion + scoring
- **ResumeVersion / Application** — generation + tracking

See `prisma/schema.prisma` for fields.
