# ATS and Evidence Fit

UI label: **Keyword and Evidence Fit** (not a vendor ATS score).

V2 overlap still available via `ats-optimize.ts`.

V3 generation uses JD corpus for ranking and skill selection. Missing JD terms (e.g. RAG, Azure) should remain visible as gaps in scoring/fit — never fabricated onto the CV.

Parser improvements in `parse-job.ts` expand requirement section headers and fall back to keyword-bearing lines when sections are empty.
