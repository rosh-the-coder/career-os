# Resume Versioning

- Every generate / apply-edits creates a **new** `ResumeVersion`.
- V3 stores `schemaVersion`, `composerVersion`, optional `parentVersionId`, `pageCount`.
- `contentJson` shape for V3: `{ schemaVersion, v3, draft, ats }`
- Legacy downloads continue to use `ats` / `draft`.
- Resume Studio shows lineage, selected projects, evidence map, warnings.
