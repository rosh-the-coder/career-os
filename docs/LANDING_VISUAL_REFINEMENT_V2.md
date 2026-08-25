# Landing Visual Refinement V2

**Date:** 15 August 2026  
**Scope:** Surgical visual / UX pacing pass on existing marketing landing only.

---

## Components modified

| Component | Change |
|---|---|
| `page.tsx` | Typography scale tiers, section padding rhythm, trust strip compact, resume thesis full-bleed quiet zone, beta CTA quiet-large, product-proof section inserted after operating model |
| `hero-operating-model.tsx` | Vertical operational sequence (job → fit → evidence → résumé → human review), ~7s loop, reduced-motion safe |
| `fragmented-workflow.tsx` | **New** — vertical tool chain with mono handoff labels → CareerOS consolidation |
| `operating-model-walkthrough.tsx` | Sticky shared canvas (desktop); mobile sequential crops; same job object across stages |
| `product-proof-composition.tsx` | **New** — hierarchical UI composition + 4 accessible annotations |
| `score-explainer.tsx` | Large score hero, interactive dimension bars + explanations, Rules → Reasoning → Human pipeline |
| `evidence-resume-pipeline.tsx` | Scroll-progress inventory → job → select/compose/validate → verified/blocked → preview |
| `application-lifecycle-demo.tsx` | **New** — product-accurate status progression + tracker row |
| `career-inventory-preview.tsx` | **New** — central completeness panel (replaces chip grid) |
| `byok-provider-grid.tsx` | Grouped AI / Discovery / Optional signals; shorter copy |

Unchanged: routing, CTAs, product claims, authenticated app, scoring algorithms.

---

## Interaction changes

- Hero: rAF progress loop (not slideshow)
- Fragmented workflow: intersection → consolidate toward CareerOS
- Operating model: scroll-driven stage + clickable left rail (desktop only sticky)
- Score: click/focus dimension → explanation panel
- Evidence pipeline: intersection ratio advances stages
- Application lifecycle: gentle cycle through Applied → Interviewed → Follow up → Offer
- Annotations: hover/focus/click highlight regions; details always readable on mobile

---

## Responsive

- Operating model: sticky desktop / stacked mobile
- Score: score card first, then vertical bars on narrow viewports (grid stacks)
- Inventory: single centered panel
- Product proof: secondary tracker crop hidden on small screens
- Touch targets ≥44px on primary CTAs

---

## Performance

- CSS opacity/transform + IntersectionObserver only
- No Framer/GSAP/WebGL/video
- Demo UI is reconstructed DOM, not screenshot assets

---

## Known limitations

- Product proof uses reconstructed UI fragments, not live screenshots
- Application lifecycle demo uses tracker vocab (Applied / Interviewed / Offer + Follow up next-action); not every Notion tag is animated
- Sticky walkthrough height (~160vh) may feel long on short laptops — intentional for stage pacing
- Screenshots (`landing-v2-*.webp`) not auto-captured in this pass — capture manually after `npm run dev`
