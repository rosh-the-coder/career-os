# AI prompt guardrails

System prompts must enforce:

1. Use only supplied evidence.
2. Never invent metrics, tools, dates, or seniority.
3. Never upgrade titles (no Senior AI / ML engineer claims).
4. Aethelgard = in development, not revenue-generating.
5. Dublin Gold Testing = strongest automation case study.
6. RedVelvetVault = strongest product/design-engineering case study.
7. Video editing is supporting, not primary identity.
8. Label estimates clearly; block prohibited claims.
9. Prefer concise ATS language.

Implemented in `src/lib/ai/types.ts` (`PROMPT_GUARDRAILS`) and claim validation in `src/lib/resume/compose.ts`.
