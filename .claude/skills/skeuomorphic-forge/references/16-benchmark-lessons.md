# §16 — Benchmark Lessons (7 iterations of user feedback)

> **READ THIS FILE BEFORE BUILDING ANY COMPONENT.** It contains hard-won corrections from 7 rounds
> of visual review. Every rule here was a FAILURE that was identified and corrected.
> These rules OVERRIDE anything in SKILL.md if there is a conflict.

---

## §16.1 — RIM LIGHT vs COLOR BLEED (TWO SEPARATE SYSTEMS)

These are the most confused concepts. They are physically different and must be implemented differently.

### RIM LIGHT (border)
- **What**: Ambient light catching the machined metal edge of a CNC-milled recess
- **Implementation**: `border` property (1px solid)
- **Color**: ALWAYS neutral warm `rgba(255,250,240,...)` — matches chassis palette
- **Direction**: Follows 135deg light source. Top brightest, left moderate, bottom/right minimal
- **Opacity**: Top **0.20-0.25**, Left **0.12-0.16**, Bottom/Right **0.05-0.08**
- **Same on EVERY recess** regardless of content inside

```javascript
// CORRECT — neutral warm rim light, directional
borderTop: "1px solid rgba(255,250,240,0.22)",   // BRIGHT — 135deg hits here
borderLeft: "1px solid rgba(255,250,240,0.14)",   // moderate
borderBottom: "1px solid rgba(255,250,240,0.06)", // shadow side
borderRight: "1px solid rgba(255,250,240,0.06)",  // shadow side
```

### COLOR BLEED (inset box-shadow)
- **What**: Light emitted by screen content reflecting off recess walls
- **Implementation**: `inset box-shadow` (NOT border)
- **Color**: Matches the content INSIDE the screen (green readout → green bleed)
- **Position**: Where the glowing content is located (text on right → bleed on right wall)
- **Only from content INSIDE the display well**, not labels outside it

```javascript
// "2.1 ms" green readout on right side → green bleed on RIGHT wall
boxShadow: `${DEPTH_SHADOWS}, inset -4px 0 10px rgba(60,220,120,0.05)`

// "3000" amber digits left-aligned → amber bleed on LEFT wall
boxShadow: `${DEPTH_SHADOWS}, inset 4px 0 10px rgba(255,180,60,0.05)`
```

### FORBIDDEN
- Colored borders (green/amber/red border = WRONG, borders are ALWAYS neutral warm)
- Uniform rim light on all 4 sides at same opacity (= picture frame, not machined edge)
- Color bleed based on text OUTSIDE the screen (e.g., "CONNECTED" label above the display)

---

## §16.2 — RIM LIGHT MUST BE VISIBLE (THE #1 FAILURE)

This has failed in EVERY iteration. The rim light at 0.06-0.10 opacity is INVISIBLE on dark backgrounds.

**Minimum opacities (HARD FLOOR — never go below):**
- Top edge: **0.20** (this is the most visible rim on any recess)
- Left edge: **0.12**
- Bottom/right: **0.05**

**Test**: After building, visually check in the browser. If you cannot clearly see the top rim light
as a distinct line against the dark background, it is too faint. Increase by 0.05 and check again.

---

## §16.3 — EMBOSSED TEXT CONTRAST (RECURRING REGRESSION)

Embossed/silkscreen/stamped text keeps becoming invisible. Hard minimums:

| Text role | Min opacity | Example |
|-----------|------------|---------|
| Primary label (silkscreen above well) | **0.50** | "CROSSOVER", "DSP LINK" |
| Secondary value | **0.45** | Hz unit, status labels |
| Tertiary stamp | **0.35** | Serial numbers, revision marks |

If the text uses `textShadow` for emboss effect, the BASE color opacity must still meet
these minimums. The shadow adds depth, not visibility.

---

## §16.4 — NO UNEXPLAINED LIGHT SOURCES

Every light effect MUST have a physical origin. If there's a glowing line, there must be
a physical feature that explains it (LED slot, recess edge, screen emission).

**FORBIDDEN:**
- Horizontal amber bar floating on a chassis with no physical feature (no slit, no recess)
- Decorative rim glow on a button top with no LED slot or edge to justify it
- Random colored borders that don't correspond to any physical feature

**ALLOWED:**
- LED slot = recessed channel in the metal with LED inside (needs inset shadows for the slot)
- Rim light = machined edge catching ambient light (needs the recess to exist first)
- Screen glow = display content projecting light (needs a display well with content)

**Rule**: Before adding any light effect, answer: "What physical feature is producing this light?"
If you can't answer, DON'T add it.

---

## §16.5 — SCREWS

- **On METAL only** — never on glass/screen surfaces
- **7-layer shadow** minimum (screws sit ON the surface, they need pronounced depth)
- **Proportional**: diameter = ~3-4% of panel's shortest dimension
  - 280px panel → 10px screws
  - 500px panel → 16px screws
- **Quality**: radial gradient sphere with specular hotspot at 32%/26%, torx cross slot
- **NOT oversized**: 16px screws on a 200px panel look like bolts on a watch

---

## §16.6 — PHYSICAL SIZE RULES

- **All variants of same component = IDENTICAL fixed dimensions** (width + height)
  - 3 status cards → all 280x220px, even if "disconnected" has less content
  - Active + disabled button → same minWidth + height
- **Content CENTERED in chassis** — use flex centering. Input wells and labels must be
  visually centered, not pushed to the bottom by header space.
- **Determine size from variant with MOST content**, apply to all.

---

## §16.7 — SCREEN DEPTH (TWO OVERLAY GRADIENTS)

CRT/display screens need TWO overlapping gradient overlays in OPPOSITE directions:

1. **Glass reflection** (from outside): `linear-gradient(125deg, rgba(255,245,235,0.06) 0%, transparent 50%)`
   — warm white, top-left to bottom-right, simulates ambient light on glass

2. **Content depth gradient** (from inside): `linear-gradient(270deg, rgba(CONTENT_COLOR,0.05) 0%, transparent 60%)`
   — content color, right-to-left (opposite to glass), simulates phosphor emission into cavity

Stack both as absolute-positioned overlay divs with `pointer-events: none`.

---

## §16.8 — INPUT FOCUS ANIMATION

When an input gets focus, it must come ALIVE — not just show a cursor:
- Color bleed intensifies (opacity doubles)
- Inner ambient glow appears: `inset 0 0 12px rgba(CONTENT_COLOR,0.04)`
- Text glow brightens (extra text-shadow layer)
- Rim light brightens slightly (+0.04 on top edge)
- Transition: `all 0.3s ease`

---

## §16.9 — WARM HIGHLIGHTS (NO PURE WHITE ABOVE 0.10)

Pure `rgba(255,255,255,X)` at X > 0.10 looks clinical/blafard on industrial surfaces.
Swap to warm tints:
- Edge catches (0.03-0.08): `rgba(255,255,255)` OK (imperceptible warmth at low opacity)
- Above 0.10: use `rgba(255,240,220)` or `rgba(255,250,240)` or `rgba(255,245,235)`
- Glass overlays: `rgba(255,245,235,0.06-0.08)` — warm, not cold white

---

## §16.10 — CSS INLINE RULE (PROJECT-SPECIFIC)

In this project, Prettier reformats CSS files. All visual overrides MUST be in inline `style={{}}`.
CSS classes are structural only (layout, display, transitions).

---

## §16.11 — COMPONENT SIZE PROPORTIONS (IT7 FAILURE)

The frequency input chassis was GIGANTIC compared to status cards. Components that appear
on the same page should have proportional sizes. A simple input well does not need a 280x180px
chassis — that's a rack module size. Match the visual weight to the content:

| Component type | Typical chassis size | Why |
|---|---|---|
| Simple input (1 value) | 200-240px wide, 100-140px tall | Small module, one well |
| Status card (multi-readout) | 260-300px wide, 200-240px tall | Larger module, display + LED + data |
| CTA button | 240-280px wide, 48-56px tall | Button, not a chassis |

**Rule**: Before coding, decide the chassis size based on content density. A single input field
does NOT need the same chassis size as a multi-readout status panel.

---

## §16.12 — NO VISUAL ARTIFACTS ON SCREEN EDGES (IT7 FAILURE)

Curved/warped visual effects on display well edges are caused by `border-radius` combined with
`inset box-shadow` or overlapping pseudo-elements. On display recesses:

- **border-radius**: Use 0px on the well itself (CRT screens are rectangular). If the chassis
  has rounded corners, the inner well should still be sharp-cornered.
- **Pseudo-element overlays** (glass reflection, depth gradient): Must be clipped to the well
  boundaries with `overflow: hidden` on the parent. No overflow that creates curved light artifacts.
- **Inset shadows**: Should not combine with border-radius > 2px on display wells. Sharp corners = CRT realism.

---

## §16.13 — DISPLAY WELL DEPTH TECHNIQUE (FINAL RULE after IT1-IT10)

**FINAL RULE: Do NOT use borders on display wells.** Borders make the glass look like it sticks
OUT instead of being recessed IN. Display wells are holes in the metal — depth = inset shadows only.

**Implementation:**
- `border: "none"`, `borderRadius: 0`, `overflow: "hidden"`
- 6-12 inset shadow layers for depth (per component type)
- Bottom catch light: `inset 0 -1px 0 rgba(255,250,240,0.15)` as last shadow layer
- Color bleed from content: separate inset shadow in content color

**For raised elements** (buttons, chassis, cards), borders ARE fine — this rule only applies to
recessed display wells where the visual expectation is "hole in the metal".

---

## §16.14 — SCREW SPACING (IT8 FAILURE)

Screws must have adequate clearance from content elements. In real hardware, screws are in
mounting corners with clear margins. Content (labels, LEDs, buttons) never touch or overlap screws.

**Minimum clearance**: 8px between any screw edge and any content element. If the chassis is too
small to fit 4 screws with proper clearance, use 2 screws (top-left + bottom-right) or no screws.

---

## §16.15 — NO UNEXPLAINED LIGHT BARS ON CHASSIS (IT8 FAILURE — RECURRING)

A horizontal glowing line on a metal chassis with no physical feature underneath is FORBIDDEN.
This has failed in IT6, IT7, and IT8. The rule is absolute:

**If there is no hole, slit, recess, or LED channel** underneath a light effect, the light effect
must not exist. "Amber LED slit accent line" requires an actual SLIT to be built first
(an inset recess with its own shadow stack), not just a glowing div on flat metal.

When in doubt: DON'T add decorative light lines. Keep the chassis clean.

---

## §16.16 — GLASS REFLECTION QUALITY (IT8 REGRESSION)

The glass reflection overlay on CRT/display screens must be present and visible. It disappeared
in IT8. Implementation:

```javascript
// Glass reflection — positioned OVER the display content, pointer-events: none
const GLASS_OVERLAY = {
  position: "absolute", inset: 0,
  background: "linear-gradient(125deg, rgba(255,245,235,0.07) 0%, transparent 40%)",
  pointerEvents: "none",
};
// Optional: thin left-edge specular strip
const EDGE_SPECULAR = {
  position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
  background: "linear-gradient(180deg, rgba(255,250,240,0.06) 0%, transparent 100%)",
  pointerEvents: "none",
};
```

Both overlays go INSIDE the display well div, after the content, with absolute positioning.

---

## §16.17 — AVOID OVER-SIMPLIFICATION (IT9 FAILURE)

After removing problems across iterations, the components became TOO SIMPLE — losing the richness
and detail that makes skeuomorphic design compelling. The goal is to FIX problems while KEEPING
quality details. This means:

**Must ALWAYS be present on display wells/screens:**
1. Glass reflection overlay (125deg warm gradient) — MANDATORY
2. Left-edge specular strip (3px, top-to-bottom gradient) — MANDATORY
3. Content depth gradient (270deg, content-colored, opposite to glass) — MANDATORY
4. Scanline overlay (repeating-linear-gradient 2px) — RECOMMENDED
5. Color bleed from content (inset box-shadow in content color) — MANDATORY

**Must ALWAYS be present on metal chassis:**
1. Brushed metal texture (repeating-linear-gradient grain) — MANDATORY
2. SVG feTurbulence noise texture — RECOMMENDED
3. Surface gradient (145deg warm) — MANDATORY
4. Bevel borders (top/left light, bottom/right dark) — MANDATORY

**The rule**: When fixing a visual problem, fix ONLY the specific issue. Do NOT strip out other
details in the process. "No border on display well" does NOT mean "remove all visual detail from
the display well". It means remove the specific border property while keeping glass reflection,
color bleed, scanlines, depth gradient, etc.
