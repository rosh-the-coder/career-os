# CareerOS — Case Storyboard

**Role of this document:** Movie script for the portfolio experience.  
**Not:** Documentation. Not a README. Not engineering proof.  
**Audience of the final page:** Senior engineers who *feel* the product before they read it.  
**Pipeline position:** Project Bible → **this storyboard** → React → Portfolio  

**Creative law:** Writing is the last thing. Scroll is the first.  
**Evidence law:** Experience may dramatize. Facts may not invent. Conceptual ratios (e.g. “20%”) are *illustrative beats*, never presented as measured KPIs.

**Sources of truth (silent, off-screen):**  
`docs/project/PROJECT_BIBLE.md` · `docs/project/portfolio/*` · `CAREEROS_PROJECT_HISTORIAN.md`

---

# How to read this script

Each beat is a **scroll section**. Build order later:

1. Sticky / scroll physics  
2. Visual hierarchy  
3. Interaction  
4. Animation timing  
5. Diagram / screen placeholders  
6. Copy last (max 1–2 lines unless marked EXPAND)

**Timing legend**

| Token | Meaning |
|---|---|
| `T+0` | Section enters viewport |
| `scrub` | Animation tied to scroll progress 0→1 |
| `hold` | Sticky pin while inner scene plays |
| `tap` | Click / pointer required |
| `auto` | Plays once on enter |
| `loop` | Subtle infinite while in view |

**Viewport budget:** Desktop-first 1440. Mobile = compressed choreography, never missing acts.

**Screenshot rule:** **No real product UI before Act 6.** Acts 1–5 are conceptual, typographic, diagrammatic, motion-only.

---

# Global experience brief

| Axis | Direction |
|---|---|
| **Genre** | Product documentary — Apple keynote × Linear docs × editorial scroll |
| **Pace** | Acts 1–3: restless. Act 4: silence. Acts 5–6: clarity. Act 7: depth on demand. Act 8–9: quiet authority. |
| **Color** | One dark field. One warm signal color for CareerOS. Fragment tools stay cold/neutral. Never purple-glow AI cliché. |
| **Type** | Display face for hero lines. Mono for system labels. Body almost absent. |
| **Sound** | Optional later. Design as if silent film first. |
| **Honesty beat** | Act 8 must refuse fake outcome charts. |

---

# Scroll spine (one glance)

```text
COLD OPEN  →  ACT1 Fragment  →  ACT2 Grind  →  ACT3 Orbits
→  ACT4 Philosophy (silence)  →  ACT5 Engine  →  ACT6 Product
→  ACT7 Engineering (expand)  →  ACT8 What changed  →  ACT9 Close
```

Total beats below: **52 sections**.

---

# COLD OPEN

---

## §00 — Title breath

| Field | Direction |
|---|---|
| **Purpose** | Brand lands before thesis. |
| **Emotion** | Stillness. Anticipation. |
| **Narrative** | One word: **CareerOS**. Subline delayed. |
| **Interaction** | Scroll only. No nav chrome yet. |
| **Animation** | `T+0` word fades in 800ms. Subline at `T+1200`: “A job-search operating system.” |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | This is a product. Not a blog post. |
| **Hierarchy** | Brand 60% viewport height. Nothing else. |
| **Sticky** | no |
| **Duration** | ~100vh |

**Placeholder:** `assets/coldopen/title.svg`

---

## §01 — Anti-promise

| Field | Direction |
|---|---|
| **Purpose** | Kill wrong expectations immediately. |
| **Emotion** | Sharp. Honest. |
| **Narrative** | Crossed-out lines, one by one: “Mass apply bot.” “AI writes my CV.” “Guaranteed interviews.” |
| **Interaction** | `scrub` — each crossed line on scroll progress. |
| **Animation** | Strike-through draws L→R. Final line holds: “Human submits.” |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Quality over volume. Control stays human. |
| **Hierarchy** | Mid type. Negative space wins. |
| **Sticky** | soft hold 0.6 scene |

**Placeholder:** `assets/coldopen/antipromise.json` (Lottie or CSS strikes)

---

# ACT 1 — The Broken Job Hunt

*Emotion spine: Frustration → Overwhelm → Recognition*

---

## §02 — Act card: The Broken Job Hunt

| Field | Direction |
|---|---|
| **Purpose** | Chapter title. |
| **Emotion** | Tension enters. |
| **Narrative** | **ACT 01** / THE BROKEN JOB HUNT |
| **Interaction** | Scroll. |
| **Animation** | Act numeral slides from left; title from right; meet center. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | We start in the mess. |
| **Sticky** | no · **Duration** | 70vh |

---

## §03 — Timeline of rejection (ambient)

| Field | Direction |
|---|---|
| **Purpose** | Feel time burning. |
| **Emotion** | Frustration. |
| **Narrative** | Almost no text. A horizontal timeline fills with anonymous application marks. |
| **Interaction** | `scrub` fills timeline. Optional hover reveals mute labels: Applied · Waiting · Ghosted. |
| **Animation** | Marks appear with soft thud. Density increases toward right edge. |
| **Screens** | none |
| **Diagram** | Timeline strip (abstract — not real data). |
| **Takeaway** | Searching became a grind. |
| **Note** | Do **not** invent real application counts. Abstract density only. |
| **Sticky** | `hold` while fill completes |

**Placeholder:** `assets/act1/rejection-timeline.webm`

---

## §04 — Tab avalanche

| Field | Direction |
|---|---|
| **Purpose** | Show fragmentation as UI chrome, not essay. |
| **Emotion** | Overwhelm. |
| **Narrative** | Browser tabs multiply. |
| **Interaction** | `scrub` or auto cascade. |
| **Animation** | Tabs spawn faster than readable. Labels blur. |
| **Screens** | none (stylized chrome) |
| **Diagram** | none |
| **Takeaway** | Attention shattered. |
| **Sticky** | no |

**Placeholder:** `assets/act1/tabs.mp4`

---

## §05 — Tool rain (interactive)

| Field | Direction |
|---|---|
| **Purpose** | The iconic Act 1 interaction. |
| **Emotion** | Comic frustration → uneasy laugh of recognition. |
| **Narrative** | Every click (or scroll step) drops another tool into the pile. |
| **Interaction** | **Primary:** click / tap = next tool. **Secondary:** scroll advances if idle. Sequence locked: Resume.io → ChatGPT → LinkedIn → Word → Notion → Email → Excel → PDF → **Repeat**. |
| **Animation** | Each tool: drop + stack with slight physics. On Repeat: stack collapses into a spinning ring, then rebuilds once. |
| **Screens** | none — brand marks as abstract tiles (generic shapes if legal-sensitive; names as typography ok). |
| **Diagram** | none |
| **Takeaway** | Job searching became fragmented. |
| **Micro** | Cursor becomes a stamp. Soft haptic-like scale pulse on each drop. |
| **Sticky** | `hold` until sequence completes once |

**Copy max:** one line under stack after complete — “Eight tools. Zero workflow.”

**Placeholder:** `assets/act1/tool-tiles/*`

---

## §06 — The same CV, wrong room

| Field | Direction |
|---|---|
| **Purpose** | Multidiscipline problem without a paragraph. |
| **Emotion** | Misrecognition. |
| **Narrative** | One silhouette walks through doors labeled UX · Frontend · AI · Design Eng · Creative. Each door stamps a different wrong label on their back. |
| **Interaction** | `scrub` through doors. |
| **Animation** | Stamp slam. Labels peel as next door opens. |
| **Screens** | none |
| **Diagram** | Door corridor |
| **Takeaway** | One profile. Many misreads. |
| **Sticky** | `hold` |

**Placeholder:** `assets/act1/wrong-room.json`

---

## §07 — Eligibility as fog

| Field | Direction |
|---|---|
| **Purpose** | Ireland / permission complexity as atmosphere, not legal lecture. |
| **Emotion** | Unease. Caution. |
| **Narrative** | JD text fades under a fog layer. Words “sponsorship”, “visa”, “years” glow then dissolve. |
| **Interaction** | Pointer moves fog aside briefly — it returns. |
| **Animation** | Fog loop + glow pulses. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Fit isn’t only skills. |
| **Copy** | Optional whisper line: “Eligibility is a gate — or a soft flag.” |
| **Sticky** | no |

---

## §08 — Act 1 seal

| Field | Direction |
|---|---|
| **Purpose** | Land the act. |
| **Emotion** | Recognition. Ready for method. |
| **Narrative** | Large: **Fragmented.** Smaller: “The work wasn’t hard. The system was.” |
| **Interaction** | Scroll releases to Act 2. |
| **Animation** | Word holds. Ambient tool-stack silhouette shrinks to a point. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | The problem is structural. |
| **Duration** | 90vh |

---

# ACT 2 — The Investigation

*Emotion spine: Curiosity → Clarity → Resolve*

---

## §09 — Act card: The Investigation

| Field | Direction |
|---|---|
| **Purpose** | Chapter turn. |
| **Emotion** | Focus. |
| **Narrative** | **ACT 02** / THE INVESTIGATION |
| **Interaction** | Scroll. |
| **Animation** | Typewriter of a single research question, then erase. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | We stop reacting. We measure the loop. |
| **Duration** | 70vh |

---

## §10 — The daily loop (interactive flow)

| Field | Direction |
|---|---|
| **Purpose** | Make the grind measurable as motion. |
| **Emotion** | Exhausted curiosity. |
| **Narrative** | Nodes light in order: Time spent → Finding → Reading → Scoring → Resume → Cover Letter → Tracking → **Repeat**. |
| **Interaction** | User can click any node to jump; auto-run if idle. Loop cycles 2×. |
| **Animation** | Energy pulse travels edges. Repeat flashes red. |
| **Screens** | none |
| **Diagram** | Circular workflow diagram |
| **Takeaway** | The loop eats the week. |
| **Sticky** | `hold` |

**Placeholder:** `assets/act2/daily-loop.svg`

---

## §11 — Where the time goes (bar morph)

| Field | Direction |
|---|---|
| **Purpose** | Setup for the 20% beat. |
| **Emotion** | Mild dread. |
| **Narrative** | Full bar = “Job search work.” Segments labeled with loop stages. |
| **Interaction** | `scrub` expands segments. |
| **Animation** | Segments jostle; mechanical ones dominate visually. |
| **Screens** | none |
| **Diagram** | 100% stacked bar (illustrative) |
| **Takeaway** | Most motion is logistics. |
| **Note** | Illustrative proportions — not tracked analytics. |

---

## §12 — The 20% reveal

| Field | Direction |
|---|---|
| **Purpose** | Thesis of Act 2. CareerOS’s reason to exist. |
| **Emotion** | Relief mixed with ambition. |
| **Narrative** | Bar collapses. Only two segments remain lit: **Judgment** · **Truthful materials**. Caption: **Only ~20% is the valuable work.** (label: *conceptual*) |
| **Interaction** | Tap the dimmed 80% to see it gray into “automate / assist.” Tap 20% to pin “human.” |
| **Animation** | Dim 80% desaturates. 20% blooms with CareerOS signal color. |
| **Screens** | none |
| **Diagram** | Split bar |
| **Takeaway** | Build for the valuable fifth. Assist the rest. Never fake the fifth. |
| **Sticky** | `hold` |
| **Hierarchy** | Biggest number moment until Act 4. |

**Microcopy under:** “Illustrative split — not a measured KPI.”

---

## §13 — What must never be automated

| Field | Direction |
|---|---|
| **Purpose** | Plant HITL early. |
| **Emotion** | Gravity. |
| **Narrative** | Three locked tiles: Final CV · Salary / immigration answers · Submit. |
| **Interaction** | User tries to drag a tile into “Automate” — it snaps back. Soft reject sound optional. |
| **Animation** | Snap-back spring. Padlock flash. |
| **Screens** | none |
| **Diagram** | Two columns: Assist vs Human |
| **Takeaway** | Control is a feature. |
| **Sticky** | no |

---

## §14 — Act 2 seal

| Field | Direction |
|---|---|
| **Purpose** | Bridge to landscape. |
| **Emotion** | Resolve. |
| **Narrative** | “So what already exists?” |
| **Interaction** | Scroll. |
| **Animation** | Question mark draws. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Investigation complete. Market next. |
| **Duration** | 60vh |

---

# ACT 3 — Existing Landscape

*Emotion spine: Mapping → Pattern recognition → Opportunity*

---

## §15 — Act card: Existing Landscape

| Field | Direction |
|---|---|
| **Purpose** | Chapter. |
| **Emotion** | Wide shot. |
| **Narrative** | **ACT 03** / EXISTING LANDSCAPE |
| **Interaction** | Scroll. |
| **Animation** | Camera pulls back (CSS scale). |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Not a comparison table. An ecosystem. |
| **Duration** | 70vh |

---

## §16 — Ecosystem map (orbit)

| Field | Direction |
|---|---|
| **Purpose** | Show slices without dunking. |
| **Emotion** | Cartographic calm. |
| **Narrative** | Bodies in orbit: Resume.io · ChatGPT · Huntr · Teal · Simplify · LinkedIn · Indeed (abstract marks + names). Empty center labeled **Workflow**. |
| **Interaction** | Drag to rotate. Hover a body → one-line slice (“writes prose”, “tracks apps”, “hosts jobs”…). |
| **Animation** | Slow orbital `loop`. Center pulse empty. |
| **Screens** | none |
| **Diagram** | Orbital ecosystem map |
| **Takeaway** | Each solves one slice. |
| **Sticky** | `hold` |
| **Legal** | Prefer text labels over scraped logos if unsure. |

**Placeholder:** `assets/act3/orbit.json`

---

## §17 — Slice labels (snap)

| Field | Direction |
|---|---|
| **Purpose** | Cement “one slice each.” |
| **Emotion** | Clarity. |
| **Narrative** | On scroll, bodies snap to a ring with category tags: Generate · Chat · Track · Apply assist · Discover. |
| **Interaction** | `scrub`. |
| **Animation** | Magnetic snap. |
| **Screens** | none |
| **Diagram** | Categorized ring |
| **Takeaway** | Specialization without ownership of the loop. |

---

## §18 — Nobody owns the workflow

| Field | Direction |
|---|---|
| **Purpose** | Act 3 thesis — huge difference from a feature table. |
| **Emotion** | Insight click. |
| **Narrative** | Center fills with a dashed outline of the Act 2 loop. Orbit bodies cannot enter the center — they bounce. |
| **Interaction** | User tries to drag a tool into center → bounce. |
| **Animation** | Bounce + dashed loop glows. |
| **Screens** | none |
| **Diagram** | Orbit + empty core |
| **Takeaway** | **Nobody owns the workflow.** |
| **Hierarchy** | Full-bleed line. |
| **Sticky** | `hold` |

---

## §19 — The missing product silhouette

| Field | Direction |
|---|---|
| **Purpose** | Foreshadow CareerOS without showing UI. |
| **Emotion** | Possibility. |
| **Narrative** | Center solidifies into an abstract OS glyph (not a screenshot). Orbit dims. |
| **Interaction** | Scroll. |
| **Animation** | Glyph assembles from the 20% segments of Act 2. |
| **Screens** | none |
| **Diagram** | Silhouette |
| **Takeaway** | Something should sit at the center. |
| **Duration** | 80vh |

---

## §20 — Act 3 seal

| Field | Direction |
|---|---|
| **Purpose** | Quiet before philosophy. |
| **Emotion** | Inhale. |
| **Narrative** | Fade to black. |
| **Interaction** | Scroll into silence. |
| **Animation** | 400ms fade. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Landscape understood. Beliefs next. |
| **Duration** | 40vh |

---

# ACT 4 — The Philosophy

*Emotion spine: Silence → Conviction*

**Creative note:** This act is mostly typography. Protect emptiness.

---

## §21 — Act card: The Philosophy

| Field | Direction |
|---|---|
| **Purpose** | Reset pace. |
| **Emotion** | Calm authority. |
| **Narrative** | **ACT 04** / THE PHILOSOPHY |
| **Interaction** | Scroll slow. |
| **Animation** | Minimal. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Words earn space now. |
| **Duration** | 60vh |

---

## §22 — Hero statement

| Field | Direction |
|---|---|
| **Purpose** | The unforgettable line. |
| **Emotion** | Conviction. |
| **Narrative** | Huge typography only: **Generate resumes that sell you truthfully.** |
| **Interaction** | Scroll. Optional: pointer parallax on letters (subtle). |
| **Animation** | Line reveals word-by-word with 120ms stagger. Hold. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Truth is the product constraint. |
| **Hierarchy** | Largest type in entire case. Max 5–7 words per line. |
| **Sticky** | `hold` 1.2 scenes |
| **Distractions** | **Forbidden.** No diagrams. No UI. No logos. |

---

## §23 — Principle: Evidence before generation

| Field | Direction |
|---|---|
| **Purpose** | Principle 1 as ritual. |
| **Emotion** | Discipline. |
| **Narrative** | Short: **Evidence before generation.** |
| **Interaction** | A claim chip tries to enter a CV frame — blocked until an “evidence” chip docks. |
| **Animation** | Block flash → dock → claim admitted. |
| **Screens** | none |
| **Diagram** | Mini gate |
| **Takeaway** | No orphan claims. |

---

## §24 — Principle: Human in the loop

| Field | Direction |
|---|---|
| **Purpose** | Principle 2. |
| **Emotion** | Trust. |
| **Narrative** | **Human in the loop.** |
| **Interaction** | Submit button visible but disabled until a human cursor icon clicks Review. |
| **Animation** | Button unlocks only after Review. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Prepare ≠ send. |

---

## §25 — Principle: Transparent scoring

| Field | Direction |
|---|---|
| **Purpose** | Principle 3. |
| **Emotion** | Clarity. |
| **Narrative** | **Transparent scoring.** |
| **Interaction** | Hover opaque score → explodes into labeled fragments (skills, seniority, eligibility…). |
| **Animation** | Score atom splits. |
| **Screens** | none |
| **Diagram** | Exploded score |
| **Takeaway** | No black-box fit. |

---

## §26 — Principle: No invented seniority

| Field | Direction |
|---|---|
| **Purpose** | Principle 4. |
| **Emotion** | Integrity. |
| **Narrative** | **No invented seniority.** |
| **Interaction** | User tries to edit a title upward — system reverts. |
| **Animation** | Rubber-band revert. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Titles stay honest. |

---

## §27 — Philosophy seal

| Field | Direction |
|---|---|
| **Purpose** | Exit silence into mechanism. |
| **Emotion** | Ready. |
| **Narrative** | Soft line: “Beliefs need an engine.” |
| **Interaction** | Scroll. |
| **Animation** | Glyph from §19 reappears, smaller. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Act 5 begins. |
| **Duration** | 50vh |

---

# ACT 5 — The Engine

*Emotion spine: Wonder → Comprehension*

**Creative note:** Apple documentation energy. Animated architecture. **Not code.** No screenshots.

---

## §28 — Act card: The Engine

| Field | Direction |
|---|---|
| **Purpose** | Chapter. |
| **Emotion** | Precision wonder. |
| **Narrative** | **ACT 05** / THE ENGINE |
| **Interaction** | Scroll. |
| **Animation** | Blueprint grid fades in. |
| **Screens** | none |
| **Diagram** | Grid |
| **Takeaway** | We show how it thinks. |
| **Duration** | 70vh |

---

## §29 — Pipeline fly-through

| Field | Direction |
|---|---|
| **Purpose** | Whole system as one motion. |
| **Emotion** | Flow. |
| **Narrative** | Stages as luminous chambers: Discover → Parse → Filter → Score → Compose → Validate → Export → Track. |
| **Interaction** | `scrub` moves a packet through chambers. Click chamber to pin name. |
| **Animation** | Packet light. Chambers illuminate in sequence. |
| **Screens** | none |
| **Diagram** | 3D-ish isometric pipeline (2.5D CSS/SVG ok) |
| **Takeaway** | One operating loop. |
| **Sticky** | `hold` |

**Placeholder:** `assets/act5/pipeline.webm`

---

## §30 — Deterministic core / AI periphery

| Field | Direction |
|---|---|
| **Purpose** | Architecture thesis without jargon dump. |
| **Emotion** | Trust in design. |
| **Narrative** | Two nested rings. Inner: Deterministic. Outer: Optional AI. Outer can glow but never pierce inner locks. |
| **Interaction** | Toggle “LLM on/off” — outer dims; inner unchanged. |
| **Animation** | Failed pierce attempt on eligibility lock (spark + reject). |
| **Screens** | none |
| **Diagram** | Nested rings |
| **Takeaway** | AI advises. Rules authorize. |
| **Sticky** | `hold` |

---

## §31 — Scoring as constellation

| Field | Direction |
|---|---|
| **Purpose** | Weights as beauty, not table. |
| **Emotion** | Intellectual pleasure. |
| **Narrative** | Nine stars sized by weight. Labels appear on hover only. |
| **Interaction** | Hover star → name + relative size. |
| **Animation** | Stars drift into place `auto`. |
| **Screens** | none |
| **Diagram** | Weighted constellation (use real `SCORE_WEIGHTS` proportions) |
| **Takeaway** | Fit is multi-factor — seniority heavy. |
| **Note** | Proportions must match code weights. |

---

## §32 — Evidence → claim → page

| Field | Direction |
|---|---|
| **Purpose** | Resume honesty as motion. |
| **Emotion** | Craft. |
| **Narrative** | Inventory crystals → ranked → composed page → validator scan beam → stamp PASS/WARN. |
| **Interaction** | `scrub`. |
| **Animation** | Scan beam. WARN pulses amber; never silent. |
| **Screens** | none (abstract page, not real CV) |
| **Diagram** | Evidence pipeline |
| **Takeaway** | Generation is constrained creativity. |

---

## §33 — Provider fallback (quiet reliability)

| Field | Direction |
|---|---|
| **Purpose** | Reliability as design, not apology. |
| **Emotion** | Calm confidence. |
| **Narrative** | Three relays: Groq → Gemini → Heuristic. Failover as baton pass. |
| **Interaction** | Tap to kill a relay — baton moves. |
| **Animation** | Baton pass. |
| **Screens** | none |
| **Diagram** | Relay chain |
| **Takeaway** | The system degrades gracefully. |

---

## §34 — Engine seal

| Field | Direction |
|---|---|
| **Purpose** | Bridge to product. |
| **Emotion** | Anticipation. |
| **Narrative** | “Now — the thing itself.” |
| **Interaction** | Scroll. |
| **Animation** | Blueprint grid dissolves into glass (hint of UI chrome). |
| **Screens** | First **hint** of UI silhouette only — still no real shot. |
| **Diagram** | none |
| **Takeaway** | Product surfaces next. |
| **Duration** | 60vh |

---

# ACT 6 — The Product

*Emotion spine: Recognition → Desire to click → Respect*

**Creative note:** **Real screenshots begin here.** Redact PII always.

---

## §35 — Act card: The Product

| Field | Direction |
|---|---|
| **Purpose** | Chapter. |
| **Emotion** | Arrival. |
| **Narrative** | **ACT 06** / THE PRODUCT |
| **Interaction** | Scroll. |
| **Animation** | Glass → real pixels crossfade. |
| **Screens** | Transition only |
| **Diagram** | none |
| **Takeaway** | From diagram to daily tool. |
| **Duration** | 70vh |

---

## §36 — Dashboard (first real screen)

| Field | Direction |
|---|---|
| **Purpose** | Ops home. |
| **Emotion** | Control. |
| **Narrative** | Caption max one line: **Pipeline at a glance.** |
| **Interaction** | Parallax depth on frame. Optional hotspot: Discover. |
| **Animation** | Frame slides up; counts tick up once (from placeholder numbers — **seeded demo counts ok if labeled demo**). |
| **Screens** | `career-os_dashboard.png` (from SCREENSHOT_SPEC S02) |
| **Diagram** | none |
| **Takeaway** | Built for daily use. |
| **Sticky** | soft |

---

## §37 — Discover → Approve (paired)

| Field | Direction |
|---|---|
| **Purpose** | HITL triage. |
| **Emotion** | Momentum with brakes. |
| **Narrative** | Split: left Discover energy / right Approve judgment. |
| **Interaction** | Drag slider compares both screens. |
| **Animation** | Slider reveal. |
| **Screens** | Approve `career-os_approve.png` · optional discover state on dashboard |
| **Diagram** | none |
| **Takeaway** | Batch in. Human chooses. |

---

## §38 — Job fit detail

| Field | Direction |
|---|---|
| **Purpose** | Transparent scoring made visible. |
| **Emotion** | “I understand why.” |
| **Narrative** | Hotspots: score atoms · soft flags · eligibility. |
| **Interaction** | Click hotspot → callout (1 line). |
| **Animation** | Hotspots pulse once. |
| **Screens** | `career-os_job_score.png` |
| **Diagram** | none |
| **Takeaway** | Explainable fit on the job itself. |

---

## §39 — Hard reject (contrast)

| Field | Direction |
|---|---|
| **Purpose** | Determinism with teeth. |
| **Emotion** | Respect for gates. |
| **Narrative** | Same chrome as §38; banner state. Caption: **Some roles end here.** |
| **Interaction** | Toggle Fit ↔ Reject on same frame morph. |
| **Animation** | Morph 400ms. |
| **Screens** | `career-os_job_reject.png` |
| **Diagram** | none |
| **Takeaway** | Filters are product, not bug. |

---

## §40 — Resume Studio

| Field | Direction |
|---|---|
| **Purpose** | Truthful materials surface. |
| **Emotion** | Craft pride. |
| **Narrative** | Hotspots: validation · selected projects · download. |
| **Interaction** | Hotspots. |
| **Animation** | Validation badge draws. |
| **Screens** | `career-os_studio.png` (**redact contact**) |
| **Diagram** | none |
| **Takeaway** | Review before the world sees it. |

---

## §41 — Export artifact

| Field | Direction |
|---|---|
| **Purpose** | Tangible output. |
| **Emotion** | Satisfaction. |
| **Narrative** | DOCX/PDF frames. Caption: **Same pipeline. Two artifacts.** |
| **Interaction** | Flip DOCX ↔ PDF. |
| **Animation** | Card flip. |
| **Screens** | `career-os_export_docx.png` · `career-os_export_pdf.png` (redacted) |
| **Diagram** | none |
| **Takeaway** | Materials you can submit. |

---

## §42 — Applications tracker

| Field | Direction |
|---|---|
| **Purpose** | Close the loop outside auto-apply fantasy. |
| **Emotion** | Operational calm. |
| **Narrative** | Caption: **Track what you sent. Submit stays outside.** |
| **Interaction** | Horizontal pan of table. |
| **Animation** | Row highlight sweep. |
| **Screens** | `career-os_applications.png` (redact) |
| **Diagram** | none |
| **Takeaway** | Ops complete. |

---

## §43 — Product seal

| Field | Direction |
|---|---|
| **Purpose** | End product gallery. |
| **Emotion** | Appetite for depth. |
| **Narrative** | “Under the glass — engineering.” |
| **Interaction** | Scroll. |
| **Animation** | Screens shrink into a stack icon. |
| **Screens** | collage fade |
| **Diagram** | none |
| **Takeaway** | Depth is optional next — Linear-style. |
| **Duration** | 60vh |

---

# ACT 7 — Engineering

*Emotion spine: Respect → Curiosity on demand*

**Creative note:** Expandable. Like Linear docs. **Not walls of text.** Default collapsed.

---

## §44 — Act card: Engineering

| Field | Direction |
|---|---|
| **Purpose** | Chapter. |
| **Emotion** | Serious play. |
| **Narrative** | **ACT 07** / ENGINEERING |
| **Interaction** | Scroll. |
| **Animation** | Mono labels flicker like a quiet terminal (tasteful, not hacker-movie). |
| **Screens** | none yet |
| **Diagram** | none |
| **Takeaway** | Depth without homework. |
| **Duration** | 60vh |

---

## §45 — Expandable: Hard filters

| Field | Direction |
|---|---|
| **Purpose** | Depth module 1. |
| **Emotion** | Precision. |
| **Narrative** | Collapsed title: **Hard filters**. One-line preview: “Eligibility before opinion.” |
| **Interaction** | Expand accordion. Inside: mini decision-tree diagram + 3 bullet facts max. |
| **Animation** | Height spring. Tree draws on expand. |
| **Screens** | optional tiny reject crop |
| **Diagram** | D-09 hard-filter tree (DIAGRAM_SPEC) |
| **Takeaway** | Rules you can defend. |

---

## §46 — Expandable: LLM judge merge

| Field | Direction |
|---|---|
| **Purpose** | Depth module 2. |
| **Emotion** | Sophisticated restraint. |
| **Narrative** | Collapsed: **LLM judge**. Preview: “Narrative yes. Eligibility no.” |
| **Interaction** | Expand → animated merge diagram. |
| **Animation** | Two streams merge; eligibility stream stays locked color. |
| **Screens** | none |
| **Diagram** | D-03 scoring pipeline |
| **Takeaway** | Hybrid done properly. |

---

## §47 — Expandable: Claim validation

| Field | Direction |
|---|---|
| **Purpose** | Depth module 3. |
| **Emotion** | Integrity. |
| **Narrative** | Collapsed: **Claim validation**. Preview: “Corpus excludes the CV itself.” |
| **Interaction** | Expand → beam scan on abstract page. |
| **Animation** | Scan. |
| **Screens** | `career-os_validation.png` optional |
| **Diagram** | D-05 evidence pipeline |
| **Takeaway** | Validators need real ground truth. |

---

## §48 — Expandable: Engines v2 → v3 → v4

| Field | Direction |
|---|---|
| **Purpose** | Depth module 4. |
| **Emotion** | Evolution pride. |
| **Narrative** | Collapsed: **Resume engines**. Preview: “Feature-flagged migration.” |
| **Interaction** | Expand → before/after morph templates → inventory → composition. |
| **Animation** | Morph stages. |
| **Screens** | none required |
| **Diagram** | D-13 before/after |
| **Takeaway** | Ship without burning the past. |

---

## §49 — Expandable: Tests as memory

| Field | Direction |
|---|---|
| **Purpose** | Depth module 5. |
| **Emotion** | Quiet confidence. |
| **Narrative** | Collapsed: **Regression memory**. Preview: “55 tests at audit · YOE negation locked.” |
| **Interaction** | Expand → test name chips. |
| **Animation** | Chips stamp in. |
| **Screens** | terminal still optional |
| **Diagram** | none |
| **Takeaway** | Edge cases become fixtures. |
| **Metric note** | Use only audited numbers. |

---

## §50 — Engineering seal

| Field | Direction |
|---|---|
| **Purpose** | Exit depth. |
| **Emotion** | Settled respect. |
| **Narrative** | “The interesting part isn’t the stack. It’s what the stack forbids.” |
| **Interaction** | Scroll. |
| **Animation** | Accordions collapse to a single line. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Constraints as craft. |
| **Duration** | 70vh |

---

# ACT 8 — Reflection

*Emotion spine: Maturity · Not confession*

**Creative note:** Not “lessons learned” listicle. **What changed how I build software.**

---

## §51 — Act card: What changed

| Field | Direction |
|---|---|
| **Purpose** | Reframe reflection. |
| **Emotion** | Gravitas. |
| **Narrative** | **ACT 08** / WHAT CHANGED HOW I BUILD |
| **Interaction** | Scroll. |
| **Animation** | Slow. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Reflection ≠ diary. |
| **Duration** | 70vh |

---

## §52 — Change 1 — Authorization ≠ generation

| Field | Direction |
|---|---|
| **Purpose** | Software creed. |
| **Emotion** | Clarity. |
| **Narrative** | Big: **Generation can be creative. Authorization must be dull.** |
| **Interaction** | Scroll. |
| **Animation** | Two words highlight in opposition. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Applied AI pattern for life. |

---

## §53 — Change 2 — Preview is not the product

| Field | Direction |
|---|---|
| **Purpose** | Honesty about Studio limitations as a *builder* lesson. |
| **Emotion** | Humility without self-flagellation. |
| **Narrative** | **If it isn’t persisted, it isn’t the workflow.** |
| **Interaction** | Ghost UI toggles that fade — labeled “local only.” |
| **Animation** | Fade. |
| **Screens** | none (conceptual) |
| **Diagram** | none |
| **Takeaway** | Design for the artifact that ships. |

---

## §54 — Change 3 — Docs drift; code decides

| Field | Direction |
|---|---|
| **Purpose** | Craft discipline. |
| **Emotion** | Slight irony. |
| **Narrative** | Two sheets: Doc weights vs Code weights — code sheet wins, docs tear. |
| **Interaction** | `scrub` tear. |
| **Animation** | Paper tear. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Single source of truth or CI will invent one for you. |

---

## §55 — Change 4 — Refuse fake outcomes

| Field | Direction |
|---|---|
| **Purpose** | Portfolio ethics as product ethics. |
| **Emotion** | Integrity. |
| **Narrative** | A glossy “+40% interviews” chart tries to animate — stamped **NO EVIDENCE**. Chart collapses. |
| **Interaction** | Tap chart to attempt inflate — reject. |
| **Animation** | Collapse. |
| **Screens** | none |
| **Diagram** | Anti-chart |
| **Takeaway** | Shipping speed is a metric. Invented lift is not. |
| **Sticky** | `hold` |

---

## §56 — Reflection seal

| Field | Direction |
|---|---|
| **Purpose** | Soft landing toward close. |
| **Emotion** | Settled. |
| **Narrative** | “Build systems that tell the truth — especially about themselves.” |
| **Interaction** | Scroll. |
| **Animation** | Line holds. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Creed sealed. |
| **Duration** | 80vh |

---

# ACT 9 — Close

---

## §57 — What it is / isn’t (final)

| Field | Direction |
|---|---|
| **Purpose** | Bookend anti-promise. |
| **Emotion** | Clean. |
| **Narrative** | Two columns, minimal: IS — personal job-search OS · evidence-first · HITL. ISN’T — mass apply · multi-tenant SaaS · visa advice. |
| **Interaction** | Scroll. |
| **Animation** | Columns slide in. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Scope is a feature. |

---

## §58 — Timeline as proof of shipping

| Field | Direction |
|---|---|
| **Purpose** | Real metric: cadence. |
| **Emotion** | Momentum respect. |
| **Narrative** | Six commit nodes Jul 24 → Aug 4. Labels short. |
| **Interaction** | Hover SHA → one-line milestone. |
| **Animation** | Nodes light in order. |
| **Screens** | none |
| **Diagram** | D-15 git timeline |
| **Takeaway** | MVP → V3/V4 in the open history. |

---

## §59 — Invitation

| Field | Direction |
|---|---|
| **Purpose** | Exit CTA without sales slime. |
| **Emotion** | Open door. |
| **Narrative** | **Explore the system.** Secondary: Architecture notes · Resume evidence (links to derived docs / demo if available). |
| **Interaction** | Two quiet buttons. |
| **Animation** | Fade. |
| **Screens** | optional live demo deep link |
| **Diagram** | none |
| **Takeaway** | Continue if curious. |

---

## §60 — End card

| Field | Direction |
|---|---|
| **Purpose** | Credits. |
| **Emotion** | Stillness. |
| **Narrative** | CareerOS · Roshan Najar · Dublin. One line: “Evidence before generation.” |
| **Interaction** | none |
| **Animation** | Brand returns as in §00. |
| **Screens** | none |
| **Diagram** | none |
| **Takeaway** | Experience complete. |
| **Duration** | 100vh |

---

# Experience architecture (for the React build)

## Sticky / pin map

| Beats | Pin behavior |
|---|---|
| §05 Tool rain | Pin until sequence completes |
| §10 Daily loop | Pin one full cycle |
| §12 20% reveal | Pin |
| §16–18 Orbit → empty center | Pin through bounce lesson |
| §22 Hero statement | Long pin |
| §29–30 Pipeline + rings | Pin |
| §55 Anti-chart | Pin |

## Scroll velocity hints

| Region | Feel |
|---|---|
| Act 1 | Faster scrub allowed; chaotic |
| Act 4 | Force slower (taller sections / scroll-jack lightly if tasteful) |
| Act 6 | Normal; screenshot reading time |
| Act 7 | User-controlled via expand |
| Act 8 | Slow |

## Visual hierarchy rules

1. One focal object per beat.  
2. If type is hero, kill chrome.  
3. Screenshots only in Act 6 (+ optional Act 7 crops).  
4. Diagrams preferred over paragraphs in Acts 2–5.  
5. Max body copy: **2 lines** unless EXPAND module.

## Microinteraction catalog

| Name | Where | Spec |
|---|---|---|
| Stamp | §05, §06 | Scale 1→1.06→1 in 120ms |
| Snap-back | §13, §26 | Spring reject |
| Baton pass | §33 | 300ms ease |
| Scan beam | §32, §47 | 600ms |
| Hotspot pulse | §38, §40 | 1.5s loop while idle |
| Accordion spring | §45–49 | height + fade 250ms |
| Chart reject | §55 | stamp + collapse 400ms |

## Asset placeholder index

```text
assets/
  coldopen/ title.svg  antipromise.json
  act1/ rejection-timeline.webm  tabs.mp4  tool-tiles/*  wrong-room.json
  act2/ daily-loop.svg
  act3/ orbit.json
  act5/ pipeline.webm
  act6/ ← real screenshots from docs/project/portfolio/SCREENSHOT_SPEC.md
  act7/ diagrams from DIAGRAM_SPEC.md
  act8/ anti-chart.json
```

## Copy budget (entire page)

| Kind | Budget |
|---|---|
| Hero lines | ~12 total across acts |
| Captions | ≤2 lines / beat |
| Expandable body | ≤80 words / module |
| No essay sections | enforced |

## Honesty checklist (before ship)

- [ ] No invented interview/offer rates  
- [ ] 20% beat labeled conceptual  
- [ ] Demo counts labeled if not live  
- [ ] PII redacted on all CV/settings shots  
- [ ] Competitor names as landscape, not smear  
- [ ] Act 6 is first real UI  

---

# Handoff note to future React build

**Do not** generate the page from `PROJECT_BIBLE.md` prose.  
**Do** implement **§00–§60** as components/sections in order.  
**Do** keep expandables collapsed by default.  
**Do** preserve Act 4 emptiness — if it feels sparse, it is correct.  
**Do not** front-load screenshots to “explain faster.” That recreates Aethelgard’s text/UI heaviness.

When this storyboard and the Bible disagree on *facts*, Bible wins.  
When they disagree on *pacing*, storyboard wins.

---

*End of CAREEROS_CASE_STORYBOARD.md — Creative Director script v1.*
