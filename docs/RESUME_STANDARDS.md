# Resume standards (from your reference PDFs)

Extracted from:
- `ROSHAN_NAJAR_-_Design_Engineer.pdf`
- `ROSHAN_NAJAR_-_Product_Designer_CV.pdf`
- `ROSHAN_NAJAR_-_AI Product Design Engineer.pdf`

## Layout CareerOS mirrors

1. **Title line:** `ROSHAN NAJAR, <Profile Role>`
2. **Contact:** County Dublin, Ireland, phone, email
3. **LINKS:** LinkedIn, Portfolio, Github (plain URLs for ATS)
4. **PROFILE** — 4–6 lines, role-specific
5. **SKILLS** — compact keyword list (no bars/icons)
6. **SELECTED PROJECTS** — RedVelvetVault first for design/UX; dates + role + bullets + link placeholders
7. **PROFESSIONAL EXPERIENCE** — Independent, Two Blokes, Arcop (+ Irish AI Creative when verified bullets ready)
8. **EDUCATION**
9. **TECHNICAL STACK** — grouped

## ATS rules

- Single column, Calibri/Helvetica, selectable text
- No photos, icons, skill bars, multi-column tables
- Truthful metrics only; label estimates
- **DOCX:** LINKS line includes full URLs (ATS-friendly plain text)
- **PDF:** LINKS shows LinkedIn / Portfolio Website / Github as clickable hyperlinks — no raw URL text

## CV ↔ JD keyword fit (in-app)

On a job detail page after generating a CV:

1. **Analyze keywords** — deterministic overlap of that CV’s text vs JD terms (matched / missing / %). Labeled keyword overlap, not a vendor ATS score.
2. **Suggest edits** — optional LLM rewrites of existing bullets only; claim-validated; max 8.
3. **Apply selected** — checkboxes create a new `ResumeVersion` (DOCX/PDF). Original kept.

Cache lives on `ResumeVersion.optimizeJson`. Code: `src/lib/resume/ats-optimize.ts`, UI: job detail **CV keyword fit** panel.

## ChatGPT rewrite prompts

See `docs/CHATGPT_RESUME_PROMPTS.md` — one prompt per profile variant.
