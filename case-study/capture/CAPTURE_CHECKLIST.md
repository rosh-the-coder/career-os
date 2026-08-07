# Capture Checklist

Use with `CAREEROS_CASE_STUDY_MODE=true` and `npm run seed:case-study`.

Save all files to: `case-study/public/assets/screens/`

| # | Filename | Route | Done |
|---|---|---|---|
| 1 | `01-dashboard-overview.webp` | `/dashboard` | [ ] |
| 2 | `02-jobs-ranked-list.webp` | `/jobs` | [ ] |
| 3 | `03-job-import.webp` | `/jobs/new` | [ ] |
| 4 | `04-job-score-breakdown.webp` | `/jobs/{scored}` | [ ] |
| 5 | `05-hard-reject.webp` | `/jobs/{rejected}` | [ ] |
| 6 | `06-eligibility-soft-flags.webp` | `/jobs/{scored}` | [ ] |
| 7 | `07-approve-queue.webp` | `/approve` | [ ] |
| 8 | `08-profile-recommendation.webp` | `/jobs/{scored}` | [ ] |
| 9 | `09-project-recommendation.webp` | `/jobs/{materials}` | [ ] |
| 10 | `10-resume-studio-overview.webp` | `/resume-studio` | [ ] |
| 11 | `11-resume-validation.webp` | `/resume-studio` | [ ] |
| 12 | `12-resume-keyword-fit.webp` | `/jobs/{materials}` | [ ] |
| 13 | `13-resume-version-lineage.webp` | `/resume-studio` | [ ] |
| 14 | `14-generated-resume-preview.webp` | studio/export | [ ] |
| 15 | `15-applications-tracker.webp` | `/applications` | [ ] |
| 16 | `16-settings-constraints.webp` | `/settings` | [ ] |
| 17 | `17-provider-fallback-state.webp` | `/jobs/{fallback}` | [ ] |
| 18 | `18-empty-state.webp` | `/resume-studio` (optional) | [ ] |
| 19 | `19-mobile-dashboard.webp` | `/dashboard` @390 | [ ] |
| 20 | `20-mobile-job-detail.webp` | `/jobs/{scored}` @390 | [ ] |

## QA before closing

- [ ] Amber demo banner visible while capturing (mode on)
- [ ] Settings shows `alex.rivera@example.com` / `+353 000 0000` / example URLs
- [ ] Applications have no recruiter names/emails/notes
- [ ] No real personal CV contact on export preview
- [ ] Filenames unchanged
- [ ] Set `CAREEROS_CASE_STUDY_MODE=false` when returning to personal use
