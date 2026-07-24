# Deploy CareerOS — Supabase + Vercel

This is the foundation step so discovery, approve-queue, Gmail, and resume work can run against a stable cloud DB and auth.

## 1. Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name it e.g. `career-os`, set a strong DB password, region close to you (EU if possible)
3. Wait until the project is healthy

### API keys

**Project Settings → API**

- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY` = `service_role` (server only — never expose to the browser)

### Database URLs

**Project Settings → Database → Connection string**

- **Transaction pooler** (port `6543`) → `DATABASE_URL`  
  Append `?pgbouncer=true` if not already present.
- **Direct / Session** (port `5432`) → `DIRECT_URL`  
  Prisma uses this for `db push` / migrations.

Example shape:

```text
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Auth redirect URLs

**Authentication → URL configuration**

Add:

- Site URL: `http://localhost:3000` (local) and later your Vercel URL
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR-APP.vercel.app/auth/callback`

Enable **Email** provider (magic link). Disable public sign-ups if you want; allowlist is also enforced in app code via `ALLOWED_EMAILS`.

---

## 2. Local env

```bash
cp .env.example .env
```

Fill in Supabase + Gemini values. For first cloud wiring you can keep:

```text
DEV_BYPASS_AUTH=true
```

so you can seed and develop without magic-link friction. Set it to `false` before production.

Then:

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

---

## 3. Vercel project

1. Push this repo to GitHub (if not already)
2. [https://vercel.com/new](https://vercel.com/new) → import the repo
3. Framework: Next.js (auto)
4. Add environment variables (Production + Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | Supabase pooler URI |
| `DIRECT_URL` | Supabase direct URI |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role |
| `GEMINI_API_KEY` | your Gemini key |
| `DEV_BYPASS_AUTH` | `false` |
| `ALLOWED_EMAILS` | `roshan@theonlyrosh.com,theonlyroshn@gmail.com` |

5. Deploy
6. Add the Vercel URL to Supabase Auth redirect allowlist
7. Open `/login` → magic link → dashboard

Build command (already in `package.json`):

```text
prisma generate && next build
```

Run `npx prisma db push` and `npm run db:seed` once against production DB (from your machine with Production `DATABASE_URL` / `DIRECT_URL`), or use Supabase SQL after first push.

---

## 4. Verify checklist

- [ ] `prisma db push` succeeds against Supabase
- [ ] Seed creates Roshan profile
- [ ] Local app loads dashboard (bypass or magic link)
- [ ] Vercel deploy succeeds
- [ ] Production magic link works for allowlisted email only
- [ ] Sign out works

---

## 5. After this foundation

Resume the other roadmap items on the cloud stack:

1. Daily 25 discovery quality
2. Approve-queue → bulk CV packs
3. Resume quality pass
4. Gmail alert parsing
5. PDF typography polish
6. Assisted form-fill + learning loop
