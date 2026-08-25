# Landing + Onboarding Implementation Audit

**Date:** 15 August 2026  
**Scope:** Pre-auth surfaces + first-time onboarding only. Authenticated product unchanged except chrome boundaries and new-user empty/first-run affordances.

---

## Current state

| Surface | Today |
|---|---|
| `/` | Redirects signed-out → `/login`, signed-in → `/dashboard`. **No marketing landing.** |
| `/login` | Chrome-free (AppShell skip). Google + magic link. Single column. |
| `/onboarding` | Multi-panel wizard: basics → resumes → keys → questions. Completeness meter. Server actions persist. |
| `/request-access` | **Missing.** |
| App chrome | AppShell skips `/login`, `/auth/*` only. Onboarding still shows sidebar. |
| Middleware | Public: login, auth callback, signout. `/` treated as auth-gated for anonymous → login. |
| Invites | `Invite` model + Settings operator form. Allowlist OR valid invite. |
| BYOK | `UserApiKey` encrypted; catalog with tooltips; Settings + onboarding. |
| Inventory | Experience, Project, Skill, EvidenceItem, Metric, UploadedResume, CareerHistoryDraft, OnboardingAnswer. |
| Scoring | Hard filters + weighted heuristic + LLM judge (BYOK). Breakdown dimensions in `ScoreBreakdown`. |
| Design tokens | Canvas `#0f0f0d`, accent `#c4f542`, Fraunces / Plex Sans / Plex Mono — `globals.css`. |
| Motion | Minimal; no landing motion system; Resume Studio has some UI motion. |
| Analytics | None integrated. |

## Constraints for this build

- Do not invent LinkedIn scraping, auto-apply, success rates, or testimonials.
- PDF resume upload still paste/txt/md — messaging must stay honest.
- Guests never inherit operator env keys.
- Preserve operator inventory on login alias linking.
- Prefer Prisma `AccessRequest` for waitlist persistence (small schema add).

## Gaps this pass closes

1. Public marketing `/`
2. `/request-access`
3. Split `/login` with product scene
4. Chrome-free `/onboarding` + five-stage IA
5. First-run checklist after completion
6. Middleware public paths for marketing

## Out of scope

- Case-study Vite app
- Scoring algorithm changes
- Authenticated dashboard redesign (beyond first-run checklist / empty states)
