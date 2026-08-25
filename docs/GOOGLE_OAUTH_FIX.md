# Fix Google OAuth (“Unable to exchange external code”)

Production Google login is failing **before** CareerOS runs. Supabase `auth.users` has no successful sign-ins — earlier dashboard access was almost certainly **dev auth bypass**, not a working Google session.

## Confirm in Google Cloud

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**
2. Open the **OAuth 2.0 Client ID** of type **Web application** (not iOS/Android)
3. **Authorized redirect URIs** must include **exactly**:

```text
https://uohjbrcwsocaswkmmosn.supabase.co/auth/v1/callback
```

Do **not** put the Vercel `/auth/callback` URL here. Google talks to Supabase first; Supabase then sends the browser to Vercel.

4. Copy **Client ID** + **Client secret**

## Confirm in Supabase

1. Authentication → **Providers** → **Google** → Enabled
2. Paste the **same** Client ID and Client secret → Save
3. Authentication → **URL configuration**
   - **Site URL:** `https://career-os-topaz-nu.vercel.app` (site root — not `/login`)
   - Redirect allow list must include:
     - `https://career-os-topaz-nu.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

## Workaround while Google is broken

Use **Email magic link** for `roshsells2@gmail.com` (invited). That path does not use the Google client secret.

## After Google is fixed

Sign out → Continue with Google → pick `roshsells2@gmail.com` → expect **onboarding** and an empty workspace (not the operator inventory).
