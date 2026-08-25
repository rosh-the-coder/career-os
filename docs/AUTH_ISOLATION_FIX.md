# Auth isolation incident — 15 Aug 2026

## What you saw

Production URL contained:

```text
/dashboard#error=server_error&error_code=unexpected_failure
&error_description=Unable+to+exchange+external+code
```

That means **Google OAuth failed**. The new Google account never became the session. The **previous session stayed active**, so CareerOS correctly showed *that* workspace — which looked like “I signed in as someone else and saw Roshan’s jobs.”

This is a failed switch + sticky session problem, not Discover leaking rows across tenants in the query layer.

## Fixes shipped (local — deploy required)

1. **`AuthHashErrorGuard`** — if `#error=…` appears on any page, sign out and send to `/login?error=auth`
2. **Login always `signOut()` before Google / magic link** — clean account switch
3. **Middleware no longer forces `/login` → `/dashboard`** — you can open login while signed in
4. **Auth callback** — no code / provider error → login (never silent dump to dashboard); onboarding for incomplete guests
5. **`getPrimaryUser`** — resolve by `authUserId` first; refuse email/auth mismatches; strangers get isolated rows; only explicit `OPERATOR_EMAILS` share inventory
6. **Sidebar** — show email + Switch account

## Operator note

Emails in `OPERATOR_EMAILS` intentionally share one career profile (gmail ↔ career email). A third Google account **not** on that list needs an invite and gets an empty workspace + onboarding.

## Supabase dashboard (do this)

1. Authentication → URL configuration  
2. **Site URL** = `https://career-os-topaz-nu.vercel.app/login` (not `/dashboard`)  
3. Redirect allow list includes `…/auth/callback`  
4. Confirm Google provider client id/secret are valid (exchange failures often mean secret/redirect mismatch)

## Deploy

These fixes are not live until you commit + deploy to Vercel.
