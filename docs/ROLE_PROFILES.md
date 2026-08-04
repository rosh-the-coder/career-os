# Role Profiles

Keys in `PROFILE_KEYS` (`src/lib/types.ts`):

| key | CV title (default) |
|---|---|
| ai_engineer | AI Engineer |
| applied_ai | Applied AI & Automation Builder |
| design_engineer | Design Engineer |
| product_engineer | Product Engineer |
| ux_engineer | UX Engineer |
| product_designer | Product Designer |
| frontend_engineer | Frontend Engineer |
| ux_ui_designer | UX/UI Designer |
| ai_creative | AI Creative Technologist |

Policies: `src/lib/resume/v3/role-policy.ts`

Literal “AI Engineer” JDs prefer `ai_engineer` and do **not** default to “AI Product Design Engineer”.
