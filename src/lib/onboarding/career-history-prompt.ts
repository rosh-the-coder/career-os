/**
 * Prompt users paste into ChatGPT / Claude to produce CareerOS-friendly career history markdown.
 * Keep honest: no invented metrics.
 */
export const CAREER_HISTORY_PROMPT = `You are helping me prepare a structured career-history export for CareerOS (a job-search OS).

Write a Markdown document I can save as career-history.md. Use ONLY facts I provide or that are clearly in materials I paste. Do NOT invent employers, titles, dates, metrics, or skills.

Structure exactly like this:

# Career summary
2–4 sentences: how I want employers to understand me (seniority band, focus areas, what I am / am not aiming for).

# Target roles
- Comma-separated or bullet list of job titles I want

# Roles to avoid
- Titles or work types I do not want (even if they appear in my history)

# Target markets
- Countries / cities / regions I am actually searching (e.g. Ireland, Delhi NCR, Remote Europe)

# Work eligibility
- Plain-language note: what I can work under today (citizen, open work permit, Stamp 1G, visa sponsorship needed, etc.). Not legal advice — just facts.

# Home location
- City / region for my CV header

# Experience
## {Official title} — {Company}
- Start–end (or Present), location if relevant
- Bullet achievements with REAL metrics only when I have evidence
- Prefer outcomes over duties

(Repeat ## blocks for each role)

# Projects
## {Project name}
- What it was, my role, stack, outcome
- Metrics only if verified

# Skills
Comma-separated skills grouped loosely (design, engineering, research, tools…)

# Notes
Anything else CareerOS should know (constraints, preferences). No fabricated claims.

If I paste resumes or LinkedIn text below, extract and normalize into the structure above. Flag uncertain items with (unverified) instead of guessing numbers.

---
MY MATERIALS:
`;
