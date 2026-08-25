# CareerOS — Product & UX Audit (Landing Brief)

**Audience:** Briefing for a marketing / landing-page design pass (e.g. ChatGPT prompt input).  
**Author posture:** Senior product UX designer (10+ years), shipping B2B and consumer tools — evidence over hype.  
**Scope:** Live CareerOS application only. **Excludes** the separate portfolio case-study site.  
**Date:** 15 August 2026  
**Production reference:** `https://career-os-topaz-nu.vercel.app`  
**Local:** `http://localhost:3000`

---

## 0. How to use this document

Hand this file to a design/LLM collaborator and ask for a **landing page brief** that:

1. Sells the product honestly (no “AI agent” theatre).
2. Funnel ends at **Sign in / invite-only access** — not open self-serve SaaS.
3. Does **not** invent features that are not listed below.
4. Matches the existing visual language (dark canvas, lime accent, Fraunces + Plex) unless you explicitly want a redesign.
5. Leaves the authenticated app chrome alone; landing is a **pre-auth surface** only.

---

## 1. Product one-liner

**CareerOS** is an evidence-first job-search operating system: it discovers relevant roles, filters and scores them against *your* career inventory, explains fit, and prepares claim-validated ATS resumes (DOCX/PDF). You always submit applications yourself.

It is **not** a job board, **not** an auto-apply bot, and **not** a generic ChatGPT wrapper.

---

## 2. Who it is for (current reality)

| Segment | Reality today |
|---|---|
| **Primary operator** | One power user (full inventory seeded, Ireland / UX–product–design targeting historically). |
| **Invited beta guests** | Friends with an invite or allowlisted email; isolated workspace; bring their own API keys (BYOK). |
| **Public internet** | **Not open.** No self-serve signup. Landing should invite curiosity → request access / sign in if invited. |

**Positioning tension to resolve on the landing:**  
Product *feels* personal and sharp (operator-grade), but multi-user work is shipping invite-only. Landing copy should say “invite-only beta” or “built for serious searchers — access by invite,” not “create free account.”

---

## 3. End-to-end experience map (authenticated)

```
Sign in (Google or magic link)
  → [new guests] Onboarding (basics → resumes → API keys → gap questions)
  → Dashboard (daily batch pulse)
  → Discover / Import jobs
  → Score + Approve queue
  → Generate / Studio resume
  → Track applications
  → Settings (markets, eligibility, BYOK keys, invites for operator)
```

### Route inventory (user-facing)

| Route | Purpose |
|---|---|
| `/login` | Auth only — Google + magic link. **Should be chrome-free** (no app sidebar). |
| `/dashboard` | Daily batch pulse, stats, CTAs: Discover, Approve, Import. |
| `/jobs` | All scored listings. |
| `/jobs/new` | Paste JD and/or URL import. |
| `/jobs/[id]` | Fit score, breakdown, JD edit, rescore, CV generate, ATS keyword helpers, mark applied. |
| `/approve` | Queue of fits awaiting attention; prepare resume packs. |
| `/profiles` | Career profiles + experiences / projects / skills / evidence. |
| `/resume-studio` | Version lineage, composition preview, critic, themes, export. |
| `/applications` | Notion-style tracker (tags, reorder, filters). |
| `/settings` | Profile, markets, salary floor, BYOK keys, operator invites. |
| `/onboarding` | Completeness meter + setup wizard for new users. |

---

## 4. What is actually built (feature inventory)

### 4.1 Auth & tenancy

- Supabase Auth: **Google OAuth** + **email magic link**.
- Access control: allowlisted emails **or** pending invite rows.
- Operator aliases (multiple emails) map to **one** career profile so existing inventory is not duplicated.
- Guests get **isolated** Prisma `userId` data — no shared jobs/applications.
- Ownership checks on by-id job / application / resume download paths.
- **Sign out** in app sidebar (and mobile top bar). Auth surfaces must not show the app nav.
- Dev bypass (`DEV_BYPASS_AUTH`) can still skip login locally — must be off for real auth UX.

### 4.2 Onboarding (guests)

- Name, age 18+, markets, roles, permission, positioning.
- Completeness meter (0–100) with weighted slots.
- Upload 1–5 resumes (txt/md/paste today; PDF paste-fallback messaging).
- Optional ChatGPT career-history `.md` → draft inventory (headings/bullets only — **no invented metrics**).
- BYOK key step with human tooltips.
- Adaptive questions for remaining gaps.
- Core pages gated until onboarding is complete (operator exempt).

### 4.3 Job discovery

- One-click **Run daily discovery**.
- Sources: Greenhouse boards, Lever, Ashby, Remotive, Arbeitnow, Ireland employer watchlist (operator-oriented), optional **Adzuna** (BYOK).
- Soft **board presence** check via Brave/SerpAPI (search index only — **no scraping** LinkedIn/Indeed/Glassdoor HTML).
- Markets / target role titles come from **user settings** (not hardcoded for guests).
- Daily Discover caps for guests; public boards still work without Adzuna.

### 4.4 Scoring & filters

- Deterministic hard filters (seniority extremes, geo/eligibility heuristics, salary soft floor).
- Weighted heuristic score + optional **LLM judge**.
- LLM routing (BYOK-aware): prefer OpenAI / Gemini over Groq when present (avoids free-tier stalls).
- Soft flags (rate limits, fetch fallbacks, board presence, etc.).
- Approve queue prioritises unscored / meaningful fits.

### 4.5 Resume systems

- **Compose / export:** ATS-oriented DOCX + PDF; claim validation against evidence.
- **Resume Engine V3:** inventory-ranked experience, title policy, no-repetition rules.
- **Resume Studio V4:** composition document, themes, critic scores, human Accept/Reject intelligence review (no silent auto-apply of invented claims).
- **ATS keyword fit:** coverage analysis + optional LLM edit suggestions; user picks what to apply.
- File naming uses the signed-in person’s name (not a hardcoded identity).

### 4.6 Applications tracker

- Auto-create row from job “applied.”
- Editable company/role/tags/actions/dates; drag reorder; filters.
- Manual blank rows supported.

### 4.7 Settings & BYOK

Keys users can attach (with importance badges + plain-language tooltips):

| Key | Importance |
|---|---|
| Groq **or** Gemini **or** OpenAI | ≥1 required for full AI scoring / suggestions |
| Adzuna app id + key | Recommended for richer Discover |
| Brave / SerpAPI | Optional board-presence |

Guests **never** inherit the operator’s server `.env` keys. Operator may still use env when no BYOK row is saved.

Operator-only: **invite beta emails** from Settings.

---

## 5. Visual & interaction system (existing)

Use this as the default landing palette unless redesigning deliberately.

| Token | Value / note |
|---|---|
| Canvas | `#0f0f0d` dark |
| Ink | `#e8e6e1` |
| Muted ink | `#9a968c` / `#6b675e` |
| Accent | Lime `#c4f542` (CTAs, active nav) |
| Panels | `#171714` / `#1e1e1a`, border `#2a2a24` |
| Warn / danger / info | Gold / coral / blue |
| Display font | **Fraunces** (headlines) |
| UI font | **IBM Plex Sans** |
| Meta font | **IBM Plex Mono** (labels, scores) |
| Layout | Wide app shell (~1600px), left sidebar for authenticated product |
| Atmosphere | Soft radial accent washes — not purple SaaS gradients |

**Interaction principles already in the product**

- Evidence before generation.
- Soft floors / review queues over silent auto-reject where possible.
- Estimates labelled — human verifies before CV use.
- One primary CTA group per dense screen (Discover / Approve / Import).

**Anti-patterns to avoid on a landing**

- Purple-on-white AI startup clichés.
- Fake “agents collaborating” illustrations.
- Claiming auto-apply, scraping LinkedIn, or “guaranteed interviews.”
- Showing any private operator email, phone, or personal URLs on public surfaces.

---

## 6. Trust & honesty constraints (non-negotiable for landing copy)

| Claim you can make | Claim you must not make |
|---|---|
| Discovers jobs from public ATS boards + optional aggregators | “Scrapes LinkedIn / Indeed / Glassdoor” |
| Scores fit against *your* evidence | “Autonomous agent applies for you” |
| Generates ATS resumes with claim checks | “Invented metrics / inflated titles OK” |
| Invite-only multi-user beta with BYOK | “Free unlimited AI for everyone on our keys” |
| You submit applications | “One-click apply to 100 jobs” |

---

## 7. UX gaps relevant to landing → auth → app

These are the frictions a landing redesign should account for:

1. **No marketing landing yet** — `/` currently routes to login (signed-out) or dashboard (signed-in). Landing is greenfield.
2. **Invite-only** — Unauthorized Google/email must fail gracefully (“ask for an invite”), not look like a broken login.
3. **Auth chrome** — Login must be a standalone surface (brand + sign-in only). App sidebar belongs *after* auth.
4. **Onboarding cliff** — First-time guests face a real setup (resumes + keys). Landing should set expectation: “10–15 minutes to wire your profile and keys.”
5. **Operator vs guest** — Landing can speak to both: “Built by a job seeker who needed this” *and* “Invite a friend into their own workspace.”
6. **Production deploy lag** — Local and Vercel can diverge until changes are pushed; Sign out / chrome-free login require the latest deploy on production.
7. **Mobile** — App sidebar is desktop-first; landing should be excellent on mobile even if the app nav is not yet.

---

## 8. Suggested landing IA (for the forthcoming brief)

Not built — recommended structure only:

1. **Hero** — Brand **CareerOS** dominant; one headline; one sentence; primary CTA **Request invite / Sign in**; secondary **See how scoring works**.
2. **Problem** — Job search tool sprawl + hallucinated CV generators + noisy boards.
3. **How it works** — Discover → Filter/Score → Resume → Track (4 steps, one job each).
4. **Evidence ethos** — Short panel on claim validation / no invented metrics.
5. **Invite-only beta** — Clear access model; CTA to sign in if already invited.
6. **Footer** — Minimal; no private contact details.

**Hero budget:** brand, one headline, one supporting sentence, one CTA group, one real visual (product UI crop of Dashboard or Approve — not abstract blobs).

---

## 9. Sample messaging directions (optional)

**Headline options (honest):**

- “Job search, with evidence.”
- “Discover, score, and prepare — without inventing your career.”
- “Your inventory. Your keys. Your applications.”

**Supporting:**

- “CareerOS matches roles to what you can prove, then drafts ATS-ready materials you still send yourself.”

**CTA:**

- Primary: “Sign in”
- Secondary: “Request an invite” (mailto or waitlist form — not built yet)

---

## 10. Technical snapshot (for designers who care)

| Layer | Stack |
|---|---|
| App | Next.js 15 App Router, React 19, Tailwind 4 |
| Data | Prisma → Supabase Postgres |
| Auth | Supabase (Google + magic link) |
| AI | Groq / Gemini / OpenAI via BYOK routing |
| Export | `docx` + `pdfkit` |

---

## 11. Explicit exclusions

- Portfolio **case-study** microsite (separate Vite app) — out of scope for this landing.
- Auto-apply, embeddings/RAG job search, production cron discovery, native mobile apps — **not shipped**.

---

## 12. Acceptance checks for the landing deliverable

- [ ] No private emails, phones, or personal portfolio URLs in public copy.
- [ ] No sidebar / app nav on the pre-auth surface.
- [ ] Invite-only access model is obvious in one sentence.
- [ ] Feature claims match Section 4 only.
- [ ] Visual system either matches Section 5 or documents deliberate departures.
- [ ] Primary CTA lands on `/login` (or future `/` landing with Sign in).
- [ ] Works on mobile viewport without relying on desktop sidebar.

---

*End of audit. Next artifact expected from collaborator: detailed landing-page build prompt / wireframe brief consuming this inventory.*
