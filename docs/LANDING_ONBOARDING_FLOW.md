# Landing + Onboarding Flow Map

```text
anonymous visitor
  → /
      → Request access → /request-access → submit AccessRequest → thank-you state
      → Sign in → /login
      → How it works (anchor on /)

invited / allowlisted visitor
  → /login (Google | magic link)
      → unauthorized? → /login?error=unauthorized (+ link request access)
      → success
          → first-time (onboardingStatus ≠ complete) → /onboarding
          → returning complete → /dashboard

onboarding incomplete
  → any gated app route → redirect /onboarding
  → /onboarding?stage=… resumes mid-flow
  → "I'll finish later" → /dashboard only if operator OR soft gate allows; guests stay gated

onboarding complete
  → /onboarding/first-run (optional guided discovery) OR /dashboard?firstrun=1
  → checklist dismissible when items done

operator
  → login → existing workspace unchanged (onboardingStatus complete)
```

## Error paths

| Event | UX |
|---|---|
| Not invited OAuth/email | Login error + Request access |
| Invalid email on request | Inline field error |
| Duplicate access request | Soft success (“already on the list”) |
| Magic link expired | Supabase error → try again |
| Resume PDF binary | Honest message: paste / txt / md |
| API key invalid | Card error state; keep other steps |
| Discover zero results | Empty state + Import CTA |

## Route matrix

| Path | Anon | Authed incomplete | Authed complete |
|---|---|---|---|
| `/` | Landing | → onboarding | → dashboard |
| `/login` | Auth | → onboarding/dashboard | → dashboard |
| `/request-access` | Form | Form OK | Form OK |
| `/onboarding` | → login | Wizard | → dashboard (or allow revisit) |
| `/dashboard` | → login | → onboarding | App |
