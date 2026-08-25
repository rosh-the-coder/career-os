# Landing + Onboarding Verification

**Date:** 15 August 2026  
**Build:** `tsc` clean · `vitest` 67/67 · `next build` success (routes include `/`, `/request-access`, `/onboarding/first-run`)

---

## What changed

### Pre-auth surfaces
- Public marketing landing at `/` (product storytelling + CareerOS UI demos)
- `/request-access` with `AccessRequest` persistence (duplicate soft-success)
- Split `/login` (auth form + product scene)
- Marketing shell/nav/footer; AppShell skips chrome on `/`, `/login`, `/request-access`, `/onboarding/*`
- Middleware public paths updated; signed-in `/` or `/login` → `/dashboard`

### Onboarding
- Five-stage wizard: welcome → basics → direction → evidence → tools → review
- Career profile preview panel; adaptive gap questions; BYOK cards
- Completeness no longer auto-completes mid-wizard
- Resume upload stays on evidence stage
- Finish → `/onboarding/first-run` (real discovery) → dashboard checklist

### First-run / dashboard
- Guided first discovery (`FirstRunGuide`) using `runDiscoveryAction` (real counts)
- Dismissible setup checklist on dashboard (`setupChecklistJson`)
- New-user greeting from live queue/resume/application counts
- Empty-state CTA when no jobs

### Schema (pushed)
- `AccessRequest`
- `Settings.excludedRolesText`
- `Settings.setupChecklistJson`
- Discover title filtering respects excluded roles
- Settings UI can edit exclusions

### Analytics
- `src/lib/analytics/events.ts` + `TrackOnce` (dev console; no third-party SDK)

---

## Routes

| Path | Role |
|---|---|
| `/` | Landing (anon) / → dashboard (authed) |
| `/request-access` | Beta waitlist |
| `/login` | Standalone auth |
| `/onboarding` | Five-stage setup |
| `/onboarding/first-run` | Post-setup discovery guide |
| `/dashboard?firstrun=1` | Checklist orientation |

---

## Key components

**Marketing:** `marketing-shell`, `marketing-nav`, `marketing-footer`, `hero-operating-model`, `operating-model-walkthrough`, `score-explainer`, `evidence-resume-pipeline`, `byok-provider-grid`

**Onboarding:** `onboarding-shell`, `career-profile-preview`, `first-run-checklist`, `first-run-guide`

---

## Migrations

No Prisma migrate history file — used `prisma db push` (project convention). Generate client after pull if DLL locked by a running `next dev`.

---

## Tests

- `tests/multi-user-onboarding.test.ts` — history parse, title hints, **exclude regex**, markets
- Full suite: 13 files, 67 tests passed

---

## Screenshots

Capture manually at **1440×1000** and **390×844** after `npm run dev`:

1. Landing hero  
2. Operating model  
3. Scoring  
4. Evidence résumé  
5. Login  
6. Onboarding welcome  
7. Target roles  
8. Resume import  
9. Career Profile Preview  
10. BYOK  
11. Final review  
12. Mobile landing  
13. Mobile onboarding  

Store under `docs/screenshots/landing-onboarding/` when available. Automated capture not run in this pass (dev server was stopped for Prisma generate).

---

## Manual flow checklist

| Flow | Expected |
|---|---|
| anon → `/` | Landing, no app sidebar |
| anon → request access | Form → thank-you / duplicate soft success |
| not-invited → login | Unauthorized + request-access link |
| invited new guest → login | → `/onboarding` |
| guest onboarding | Stages persist; resume incomplete |
| guest → first-run | Real discovery counts |
| guest → dashboard | Checklist; dismissible |
| returning guest | → dashboard |
| operator | Existing workspace unchanged |

---

## Known limitations

- Privacy footer is a placeholder (no public policy page yet)
- PDF resume auto-parse still not implemented (honest messaging retained)
- Analytics emit to console only — wire PostHog/etc. later
- No operator admin UI for AccessRequest review yet (query DB / Prisma Studio)
- Incomplete guests can still hit some deep links until `requireOnboarded` on that page; Settings + jobs/new are gated
- Screenshots not yet checked into the repo

---

## Intentionally unchanged

- Scoring algorithms, evidence validation, resume generation architecture
- Job source behaviour (no LinkedIn scrape / auto-apply)
- Authenticated app chrome beyond first-run checklist + empty states
- Case-study Vite microsite
