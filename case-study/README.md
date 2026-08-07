# CareerOS Case Study — Preparation System

**Status:** Preparation only. Portfolio React app is **not** built yet.  
**Path:** `case-study/`  
**Future public URL (FYI):** `theonlyrosh.com/projects/careeros`

## Sources of truth

| Concern | Source |
|---|---|
| Experience / pacing | `CAREEROS_CASE_STORYBOARD.md` |
| Facts | `docs/project/PROJECT_BIBLE.md` |
| Implementation evidence | Repository code + Historian |
| Build plan | `CASE_STUDY_BUILD_BRIEF.md` |
| Components | `COMPONENT_MAP.md` |
| Copy | `COPY_MAP.md` |
| Assets | `ASSET_MANIFEST.json` |
| Screenshots | `SCREENSHOT_CAPTURE_PLAN.md` + `capture/CAPTURE_CHECKLIST.md` |
| Diagrams | `DIAGRAM_DATA/*.json` |

## Folder map

```text
case-study/
├── README.md                      ← this file
├── CASE_STUDY_BUILD_BRIEF.md
├── ASSET_MANIFEST.json
├── SCREENSHOT_CAPTURE_PLAN.md
├── COPY_MAP.md
├── COMPONENT_MAP.md
├── DIAGRAM_DATA/                  ← structured diagram JSON
├── public/assets/
│   ├── screens/                   ← real WebP captures go here
│   ├── diagrams/
│   ├── animations/
│   ├── exports/
│   └── placeholders/              ← designed SVGs until capture
├── capture/CAPTURE_CHECKLIST.md
└── app/                           ← empty until Step 3 portfolio build
```

## Capture workflow (Step 2 — human)

```bash
# 1. Seed isolated demo operator (does NOT overwrite real inventory)
npm run seed:case-study

# 2. Enable mode in .env (local only)
CAREEROS_CASE_STUDY_MODE=true
DEV_BYPASS_AUTH=true

# 3. Run app
npm run dev

# 4. Capture routes from capture/CAPTURE_CHECKLIST.md
#    Save into case-study/public/assets/screens/ with exact filenames
```

## Build workflow (Step 3 — later)

Build standalone portfolio under `case-study/app/` only after:

- [x] BUILD_BRIEF, COMPONENT_MAP, COPY_MAP, ASSET_MANIFEST, DIAGRAM_DATA
- [ ] At least first 12 real screenshots captured

## Portfolio site (Step 4 — FYI)

Copy the finished case study into `C:\My Works\Website\Website 2` and route to `/projects/careeros`. Work-section card click → case study page. Handle in that repo’s Cursor instance when ready.

## Rules

- No invented outcome metrics  
- No private email/phone/notes in screenshots  
- Screenshots only from Act 6 onward in the experience  
- Placeholders must never be blank grey rectangles  
