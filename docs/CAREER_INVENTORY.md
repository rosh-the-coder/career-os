# Career Inventory

Canonical resume truth lives in Prisma:

- `CareerProfile` — role variants (`ai_engineer`, `applied_ai`, `design_engineer`, …)
- `Experience` — employer truth + `officialTitle` / `alternativeTitlesJson` / `resumeBulletsJson`
- `Project` — Selected Projects candidates with dates, bullets, constraints, `approvedForCV`
- `EvidenceItem` / `Metric` — claim grounding
- `Skill` — approved skill inventory

Upsert without wiping jobs: `npm run db:seed:v3`

Locked facts:

- Irish AI Creative umbrella title: **AI Creative Technologist & Automation Builder**
- Aethelgard & CareerOS dates: **July 2026 – Present**
