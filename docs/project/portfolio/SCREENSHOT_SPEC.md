# Screenshot Specification

**Parent:** Historian §27 + Case Study  
**Compiled:** 2026-08-04  
**Redaction:** Always mask phone, email, personal URLs, and any seed contact fields before publishing.

---

## Capture defaults

| Setting | Value |
|---|---|
| Viewport desktop | 1440×900 |
| Viewport mobile (optional) | 390×844 |
| Theme | App default (dark ops shell) |
| Data | Seeded inventory + mixed job statuses + ≥1 V3/V4 ResumeVersion |
| Filename prefix | `career-os_` |
| Format | PNG |

---

## Screen catalog

### S01 — Login

| Field | Value |
|---|---|
| **Route** | `/login` |
| **State** | Auth enabled (`DEV_BYPASS_AUTH=false` if capturing real login); empty email |
| **Viewport** | desktop + mobile |
| **Annotations** | Magic-link entry; allowlist product |
| **Caption** | Single-operator auth gate |
| **Placeholder file** | `career-os_login.png` |

### S02 — Dashboard

| Field | Value |
|---|---|
| **Route** | `/dashboard` |
| **State** | Seeded jobs; pipeline counts non-zero |
| **Viewport** | desktop |
| **Annotations** | Counts; Discover CTA |
| **Caption** | Ops overview — priority entry points |
| **Placeholder file** | `career-os_dashboard.png` |

### S03 — Jobs list

| Field | Value |
|---|---|
| **Route** | `/jobs` |
| **State** | Mix of scored / rejected |
| **Viewport** | desktop |
| **Annotations** | Score column; status chips |
| **Caption** | Ranked and rejected listings in one queue |
| **Placeholder file** | `career-os_jobs_list.png` |

### S04 — Job detail (fit)

| Field | Value |
|---|---|
| **Route** | `/jobs/[id]` |
| **State** | Scored job with JobScore breakdown; strengths/gaps visible |
| **Viewport** | desktop |
| **Annotations** | Weight components; profile pick; modelVersion |
| **Caption** | Explainable multi-factor fit |
| **Placeholder file** | `career-os_job_score.png` |

### S05 — Job detail (hard reject)

| Field | Value |
|---|---|
| **Route** | `/jobs/[id]` |
| **State** | `status=rejected` with hardRejectReason (YOE or geo) |
| **Viewport** | desktop |
| **Annotations** | Banner + reason |
| **Caption** | Deterministic eligibility gate |
| **Placeholder file** | `career-os_job_reject.png` |

### S06 — Import

| Field | Value |
|---|---|
| **Route** | `/jobs/new` |
| **State** | Empty form |
| **Viewport** | desktop |
| **Annotations** | Paste vs URL; note blocked hosts |
| **Caption** | Controlled ingestion |
| **Placeholder file** | `career-os_import.png` |

### S07 — Approve queue

| Field | Value |
|---|---|
| **Route** | `/approve` |
| **State** | Multiple scored candidates; selection possible |
| **Viewport** | desktop |
| **Annotations** | Save / prepare packs actions |
| **Caption** | Human triage before materials |
| **Placeholder file** | `career-os_approve.png` |

### S08 — Profiles

| Field | Value |
|---|---|
| **Route** | `/profiles` |
| **State** | Seeded profiles visible |
| **Viewport** | desktop |
| **Annotations** | Positioning variants; note read-only limits |
| **Caption** | Career profile overview (admin CMS not complete) |
| **Placeholder file** | `career-os_profiles.png` |

### S09 — Resume Studio (populated)

| Field | Value |
|---|---|
| **Route** | `/resume-studio` |
| **State** | V3/V4 versions with validation, composition preview, critic if present |
| **Viewport** | desktop |
| **Annotations** | Validation badge; selected projects; lineage; download |
| **Caption** | Review surface for claim-checked packs |
| **Placeholder file** | `career-os_studio.png` |
| **Redact** | Yes — CV contact block |

### S10 — Resume Studio (empty)

| Field | Value |
|---|---|
| **Route** | `/resume-studio` |
| **State** | No versions (or filtered empty) |
| **Viewport** | desktop |
| **Annotations** | Empty state |
| **Caption** | Studio before first generation |
| **Placeholder file** | `career-os_studio_empty.png` |

### S11 — Validation warnings

| Field | Value |
|---|---|
| **Route** | `/resume-studio` (card detail) |
| **State** | Version with warning/blocked validationJson |
| **Viewport** | desktop |
| **Annotations** | Warning list |
| **Caption** | Safeguards before export trust |
| **Placeholder file** | `career-os_validation.png` |

### S12 — Version lineage

| Field | Value |
|---|---|
| **Route** | `/resume-studio` |
| **State** | parentVersion set (after ATS apply) |
| **Viewport** | desktop |
| **Annotations** | Parent/child relationship |
| **Caption** | Append-only resume lineage |
| **Placeholder file** | `career-os_lineage.png` |

### S13 — ATS keyword fit

| Field | Value |
|---|---|
| **Route** | `/jobs/[id]` (keyword fit panel) |
| **State** | optimizeJson present after analyze |
| **Viewport** | desktop |
| **Annotations** | Coverage; suggest vs apply gating |
| **Caption** | Keyword tooling with human apply |
| **Placeholder file** | `career-os_ats_fit.png` |

### S14 — Applications tracker

| Field | Value |
|---|---|
| **Route** | `/applications` |
| **State** | Several rows with status tags / next actions |
| **Viewport** | desktop |
| **Annotations** | Notion-style fields |
| **Caption** | Post-prep tracking (submit is external) |
| **Placeholder file** | `career-os_applications.png` |
| **Redact** | Contact fields |

### S15 — Settings

| Field | Value |
|---|---|
| **Route** | `/settings` |
| **State** | Default seeded settings |
| **Viewport** | desktop |
| **Annotations** | Salary floor; video toggle; batch target |
| **Caption** | Constraint surface |
| **Placeholder file** | `career-os_settings.png` |
| **Redact** | Contact URLs/email/phone |

### S16 — DOCX export

| Field | Value |
|---|---|
| **Route** | File / Word open (not app route) |
| **State** | Generated arthur-cox pack |
| **Viewport** | — |
| **Annotations** | Official titles; selected projects |
| **Caption** | ATS DOCX output |
| **Placeholder file** | `career-os_export_docx.png` |
| **Redact** | Yes |

### S17 — PDF export

| Field | Value |
|---|---|
| **Route** | PDF viewer |
| **State** | Same version as S16 |
| **Viewport** | — |
| **Annotations** | Layout parity note (not pixel-identical claim) |
| **Caption** | PDF export from same pipeline |
| **Placeholder file** | `career-os_export_pdf.png` |
| **Redact** | Yes |

### S18 — LLM rate-limit / fallback flag

| Field | Value |
|---|---|
| **Route** | `/jobs/[id]` |
| **State** | Soft flag or modelVersion indicating heuristic fallback (if reproducible) |
| **Viewport** | desktop |
| **Annotations** | Reliability path |
| **Caption** | Graceful degradation when LLM unavailable |
| **Placeholder file** | `career-os_llm_fallback.png` |

### S19 — JD word meter

| Field | Value |
|---|---|
| **Route** | `/jobs/[id]` |
| **State** | Long JD triggering meter warning |
| **Viewport** | desktop |
| **Annotations** | Soft limit for rate limits |
| **Caption** | Operational awareness for long descriptions |
| **Placeholder file** | `career-os_jd_meter.png` |

---

## Annotation style

- Use numbered callouts; max 5 per frame.  
- Prefer engineering labels (“eligibility float”, “validation status”) over marketing.  
- If a UI control is non-persistent (Studio Accept/Reject), do not caption it as a saved workflow.
