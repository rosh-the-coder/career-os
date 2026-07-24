# ChatGPT prompts — CareerOS resume variants

Use these prompts in ChatGPT (it knows you well). Paste the **job description** at the end of each prompt.  
Return copy must stay **truthful** to the evidence inventory in `ROSHAN_AUTOMATED_JOB_FINDER_BUILD_SPEC.md` and your reference CVs in `data/resume-references/`.

**Contact (keep consistent):**  
Roshan Najar · County Dublin, Ireland · +353 838501604 · theonlyroshn@gmail.com  
Links: LinkedIn · https://theonlyrosh.com/ · GitHub https://github.com/rosh-the-coder

**Hard rules for ChatGPT:**
- Single-column ATS structure matching the reference PDFs
- Sections in order: PROFILE → SKILLS → SELECTED PROJECTS → PROFESSIONAL EXPERIENCE → EDUCATION → TECHNICAL STACK
- No invented metrics, tools, titles, or dates
- Do not claim Senior AI / ML engineer / data scientist
- Irish AI Creative / South Dublin Auction House: Mar 2026 – 17 Jul 2026 (ended via layoff) — frame as expansion into AI workflows/automation, not as “failed video editor”
- Aethelgard: in development, not live revenue
- Prefer 4–6 bullets per role on one-page; projects first for design-engineering profiles
- Mirror job-description language only where truthful
- Output as clean Markdown ready to paste into CareerOS

---

## Shared context block (prepend to every prompt)

```text
You are rewriting my ATS resume for a specific role. Follow my reference CV standards exactly.

Verified highlights you MAY use:
- RedVelvetVault (Mar–Dec 2025): React, TypeScript, Firebase, Unity WebGL, Zustand, Tailwind; usability testing 50+ users; 81% intuitive; 85% would recommend
- Dublin Gold Testing B2B Growth Engine: Python, Pandas, Streamlit, Apify, SendGrid; 911 locations → 290 targets; 160 emails; 0 bounces; estimated time savings (label as estimates)
- Aethelgard Art Co.: AI image pipeline, Playwright drafts, human-in-the-loop — NOT live/revenue yet
- Two Blokes Trading: 30+ podcasts, 250+ shorts, 300+ assets; YT 2.9K→8.2K (+183%); views 34.9K→165.5K (+374%) in ~10 months @ ~2 days/week
- Independent Product Designer (from Oct 2024): React interfaces, design systems, accessibility, stakeholder workshops
- Arcop Associates intern (Jul 2022–Mar 2023): drawings, 3D viz, documentation
- Education: MSc Creative Digital Media & UX (TU Dublin); Exec PG UI/UX IIT Roorkee; B.Arch Manipal
- Stack: React, TypeScript, Next.js, Tailwind, Figma, Firebase, Python, Cursor, Gemini/OpenAI, Playwright, etc.

Work authorization note (do not put on CV unless asked): Stamp 1G Ireland, valid to Sep 2027, renewable to Sep 2028; can work full-time now; may need future Critical Skills support.

Update dates that are stale on old CVs: Independent is no longer “Present” if overlapping incorrectly; Irish AI Creative ended 17 Jul 2026; Two Blokes dates should not say Present if that work has paused — use verified ranges only.
```

---

## 1) UX Engineer (default)

```text
[PASTE SHARED CONTEXT]

Write a one-page ATS CV as **UX Engineer**.
Positioning: bridge interaction design and frontend implementation; accessible, responsive, production-ready UI.
Lead with RedVelvetVault + Independent product work; include Dublin Gold Testing dashboard only if relevant.
Skills should emphasise React, TypeScript, Figma, accessibility, design systems, prototyping, usability testing.
Match tone/structure of my Product Designer + Design Engineer reference PDFs, but title the document UX Engineer.

JOB DESCRIPTION:
[PASTE JOB]
```

---

## 2) Design Engineer (digital only)

```text
[PASTE SHARED CONTEXT]

Write a one-page ATS CV as **Design Engineer** (software/product — NOT mechanical/CAD).
Use the PROFILE and SKILLS style from ROSHAN_NAJAR_-_Design_Engineer.pdf.
Emphasise React/TypeScript production implementation, component architecture, Figma→code, API/real-time, AI-assisted workflows (Cursor).
Selected project: RedVelvetVault with Design Engineer role bullets.
Include Independent + Two Blokes + Arcop as in the reference, with truthful updates.

JOB DESCRIPTION:
[PASTE JOB]
```

---

## 3) Product Designer

```text
[PASTE SHARED CONTEXT]

Write a one-page ATS CV as **Product Designer**.
Match ROSHAN_NAJAR_-_Product_Designer_CV.pdf structure (including education module list if space).
Lead UX research, interaction design, accessibility, prototyping; keep light engineering proof (React/TS) without overselling as pure engineer.
RedVelvetVault as Product Designer & Developer with the 50+/81%/85% metrics.

JOB DESCRIPTION:
[PASTE JOB]
```

---

## 4) AI Product Design Engineer / Applied AI

```text
[PASTE SHARED CONTEXT]

Write a one-page ATS CV as **AI Product Design Engineer** (or Applied AI / Workflow Automation if the JD is automation-heavy).
Match ROSHAN_NAJAR_-_AI Product Design Engineer.pdf tone: AI-native, 0→1, Cursor+ChatGPT as collaborators — without claiming ML research.
If JD is automation/API: elevate Dublin Gold Testing; if product/prototype: elevate RedVelvetVault + Aethelgard (with “in development” honesty).

JOB DESCRIPTION:
[PASTE JOB]
```

---

## 5) AI Creative Technologist

```text
[PASTE SHARED CONTEXT]

Write a one-page ATS CV as **AI Creative Technologist**.
Primary evidence: Irish AI Creative (Mar–Jul 2026) expansion into generative workflows + internal tools; Aethelgard pipeline; Two Blokes content systems; RedVelvetVault as product proof.
Do NOT position me primarily as Video Editor. Video/motion is supporting capability only.
Never invent social metrics — use placeholders labelled ESTIMATE if needed.

JOB DESCRIPTION:
[PASTE JOB]
```

---

## After ChatGPT returns copy

1. Paste Markdown into CareerOS Resume Studio (or save under `data/resume-references/generated/`).
2. Run claim validation — reject any invented numbers/tools.
3. Export DOCX + PDF from CareerOS.
4. Apply manually (Model A).
