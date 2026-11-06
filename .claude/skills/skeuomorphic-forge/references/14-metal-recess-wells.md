# 14 — Metal Recess & Well Effects

> How to make elements look SUNK INTO metal — not sitting on a flat div.
> This file exists because Claude always uses 2-3 inset shadows (too shallow).
> **Minimum: 6 layers for any recess. 10+ for instrument wells. Display/readout wells carry the §16.2 machined rim as the FRONTMOST inset layer (see §14.2 ZONE 0).**

---

## 14.1 — Why Recesses Fail

| What Claude does                            | Why it looks wrong                                    | What to do instead                                               |
| ------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `inset 0 2px 4px rgba(0,0,0,0.3)` (1 layer) | No depth — looks like a CSS input field               | 6+ layer graduated inset stack                                   |
| Same background for surface and well        | Well melts into surface — invisible                   | Well background 2-3 stops DARKER (#050505 vs #1a1a1a)            |
| No bottom highlight                         | Well looks like a dark rectangle, not a physical hole | `inset 0 -1px 0 rgba(255,255,255,0.05)` = light hitting far wall |
| No lateral shadows                          | No sense of wall thickness                            | `inset ±3px 0 6px rgba(0,0,0,0.5)` = left/right walls            |
| Sharp edges on recess                       | Metal wells have radiused inner edges                 | `border-radius: 4-8px` on the well                               |
| No outer lip highlight                      | No transition from surface to hole                    | `0 1px 0 rgba(255,255,255,0.06)` = outer catch at surface plane  |
| No inner machined top-lip                   | Well reads FLAT on top — #1 recurring failure         | `inset 0 1px 0 rgba(255,250,240,0.22)` = warm machined rim, §16.2 floor 0.20 (NOT the 0.06 outer catch) |

---

## 14.2 — The 4-Zone Anatomy of a Metal Recess

Every physical recess has 5 zones (ZONE 0-4). EACH zone needs its own CSS treatment. The most-often-missed is **ZONE 0, the inner machined rim** (see below the diagram):

```
              SURFACE (parent element background)
                 |
   ─────────────[LIP]──────────────  ← outer catch: `0 1px 0 rgba(255,255,255,0.06)`
   |                                |
   |  WALL (top)                    |  ← top attack: `inset 0 4px 10px rgba(0,0,0,0.9)`
   |  ████████████████████████████  |
   |  █                          █  |
   |  █  WALL    FLOOR    WALL   █  |  ← lateral: `inset ±3px 0 6px rgba(0,0,0,0.5)`
   |  █  (left)          (right) █  |
   |  █                          █  |
   |  ████████████████████████████  |
   |  WALL (bottom) + HIGHLIGHT     |  ← bottom catch: `inset 0 -1px 0 rgba(255,255,255,0.05)`
   |                                |
   ─────────────────────────────────
                 |
              FLOOR (well background, MUCH darker)
```

**ZONE 0 — the inner machined rim (frontmost, the #1 missing zone).** Before ZONE 1's dark
top-attack, a real milled edge catches the overhead light as a thin warm line at the top INNER
lip. It must be the FRONTMOST inset layer so the dark attack can't swallow it:
`inset 0 1px 0 rgba(255,250,240,0.22)` — warm near-white, **§16.2 floor 0.20 (range 0.20-0.25),
NON-NEGOTIABLE**. This is DISTINCT from ZONE 4's outer `0 1px 0 rgba(255,255,255,0.06)` surface
catch (which sits OUTSIDE the hole). Omit the machined rim and the well reads flat on top — the
#1 recurring skeuomorphic failure. Never drop it to edge-catch values (0.03-0.08).

---

## 14.3 — Standard Recess (7 layers) — For small wells, input fields, status displays

```css
.standard-recess {
  background: linear-gradient(180deg, #080808 0%, #0c0c0c 100%);
  border-radius: 6px;
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* ZONE 1: Top attack — light blocked by upper lip */
    inset 0 3px 6px rgba(0, 0, 0, 0.7),
    /* primary depth */ inset 0 1px 2px rgba(0, 0, 0, 0.5),
    /* sharp contact */ /* ZONE 2: Lateral walls — thickness of the recess */ inset 2px 0 4px rgba(0, 0, 0, 0.4),
    /* left wall shadow */ inset -2px 0 4px rgba(0, 0, 0, 0.4),
    /* right wall shadow */ /* ZONE 3: Bottom catch — light hitting far wall */ inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    /* bottom edge highlight */ /* ZONE 4: Outer lip — surface-to-recess transition */ 0 1px 0 rgba(255, 255, 255, 0.06); /* outer surface catch */
}
```

---

## 14.4 — Deep Instrument Well (10 layers) — For gauges, displays, meters

```css
.instrument-well {
  background: linear-gradient(160deg, #050505 0%, #080808 40%, #060606 100%);
  border-radius: 8px;
  padding: 8px;
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* TOP ATTACK — progressive depth (3 layers) */
    inset 0 4px 10px rgba(0, 0, 0, 0.95),
    /* deep primary */ inset 0 2px 4px rgba(0, 0, 0, 0.8),
    /* medium attack */ inset 0 1px 2px rgba(0, 0, 0, 0.6),
    /* sharp contact */ /* LATERAL — wall thickness (2 layers) */ inset 3px 0 6px rgba(0, 0, 0, 0.5),
    /* left wall */ inset -3px 0 6px rgba(0, 0, 0, 0.5),
    /* right wall */ /* AMBIENT — general darkening (1 layer) */ inset 0 0 12px rgba(0, 0, 0, 0.4),
    /* ambient occlusion */ /* BOTTOM — far wall light (2 layers) */ inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    /* sharp bottom catch */ inset 0 -2px 4px rgba(255, 255, 255, 0.02),
    /* soft reflected light */ /* OUTER — surface transition (1 layer) */ 0 1px 0 rgba(255, 240, 220, 0.06); /* warm outer lip */
}
```

---

## 14.5 — Ultra Deep Well (13 layers) — For CRT displays, deep bezels

Adapted from production code (ref 11, pattern 52):

```css
.ultra-deep-well {
  background-color: #030303;
  border-radius: 10px;
  padding: 4px 4px 14px; /* asymmetric bottom = physical depth zone */
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* TOP ATTACK — 3 progressive depths */
    inset 0 4px 10px rgba(0, 0, 0, 1),
    /* maximum depth */ inset 0 2px 4px rgba(0, 0, 0, 0.9),
    /* strong mid */ inset 0 1px 2px rgba(0, 0, 0, 0.7),
    /* sharp contact */ /* BOTTOM CATCH — 2 layers */ inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    /* sharp edge */ inset 0 -1px 3px rgba(255, 255, 255, 0.012),
    /* soft glow */ /* LATERAL WALLS — 2 layers */ inset 2px 0 4px rgba(0, 0, 0, 0.5),
    /* left wall */ inset -2px 0 4px rgba(0, 0, 0, 0.5),
    /* right wall */ /* AMBIENT — 2 layers */ inset 0 0 10px rgba(0, 0, 0, 0.35),
    /* inner ambient */ inset 0 0 18px rgba(0, 0, 0, 0.1),
    /* outer ambient */ /* EXTERNAL — 3 layers (surface continuation) */ 0 1px 0 rgba(255, 255, 255, 0.04),
    /* top lip catch */ 0 -1px 0 rgba(0, 0, 0, 0.4),
    /* bottom lip shadow */ 0 2px 4px rgba(0, 0, 0, 0.25); /* ground shadow */
}
```

---

## 14.6 — Gorge / Channel (Narrow groove cut into metal)

A linear recess — deeper than it is wide. Used for dividers, tracks, slider channels.

### Horizontal gorge

```css
.horizontal-gorge {
  height: 8px;
  border-radius: 4px; /* full radius = rounded channel */
  background: linear-gradient(180deg, #050505 0%, /* dark top (in shadow) */ #0a0a0a 40%, /* floor */ #0f0f0f 100% /* lighter bottom (catches light) */);
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* Gorge depth */
    inset 0 2px 4px rgba(0, 0, 0, 0.8),
    /* top lip shadow */ inset 0 1px 1px rgba(0, 0, 0, 0.6),
    /* sharp contact */ /* Bottom highlight */ inset 0 -1px 0 rgba(255, 255, 255, 0.08),
    /* far wall catch */ /* Outer lip */ 0 1px 0 rgba(255, 255, 255, 0.06),
    /* surface transition */ 0 -1px 0 rgba(0, 0, 0, 0.3); /* top lip shadow on surface */
}
```

### Vertical gorge

```css
.vertical-gorge {
  width: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #050505 0%, #0a0a0a 40%, #0f0f0f 100%);
  box-shadow:
    inset 2px 0 4px rgba(0, 0, 0, 0.8),
    /* left wall (in shadow) */ inset 1px 0 1px rgba(0, 0, 0, 0.6),
    inset -1px 0 0 rgba(255, 255, 255, 0.08),
    /* right wall (catches light) */ 0 0 0 1px rgba(0, 0, 0, 0.2);
}
```

---

## 14.7 — Punched Hole (Circular cutout through metal)

For LED wells, screw holes, speaker ports, ventilation.

### Small hole (LED well, 10-16px)

```css
.led-hole {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #1a1a1a 0%, /* slight highlight top-left */ #0a0a0a 40%, /* dark interior */ #000000 100% /* deepest center */);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.8),
    /* top lip */ inset 0 -1px 1px rgba(255, 255, 255, 0.06),
    /* bottom catch */ 0 1px 0 rgba(255, 255, 255, 0.08); /* outer rim highlight */
}
```

### Large hole (instrument port, 40-80px)

```css
.instrument-port {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #151515 0%, #0a0a0a 50%, #040404 100%);
  box-shadow:
    /* Inner lip bevel */
    inset -1px -1px 2px rgba(255, 255, 255, 0.12),
    /* bottom-right catch */ inset 1px 1px 2px rgba(0, 0, 0, 0.8),
    /* top-left shadow */ /* Depth */ inset 0 0 6px rgba(0, 0, 0, 0.7),
    inset 0 0 12px rgba(0, 0, 0, 0.5),
    /* Bottom wall catch */ inset 0 -3px 6px rgba(255, 255, 255, 0.03),
    /* Outer rim */ 0 1px 0 rgba(255, 255, 255, 0.08),
    0 -1px 0 rgba(0, 0, 0, 0.3);
}
```

---

## 14.8 — LCD/Display Well (Recessed screen)

Combines deep well with screen characteristics (faint backlight bleed, dark glass feel).

```css
.display-well {
  background: radial-gradient(ellipse at center, #0d1117 0%, /* slightly lighter center = backlight */ #060608 60%, /* dark edges */ #020204 100% /* deepest corners */);
  border-radius: 6px;
  padding: 12px;
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* Recess depth */
    inset 0 3px 8px rgba(0, 0, 0, 0.9),
    inset 0 1px 2px rgba(0, 0, 0, 0.7),
    inset 2px 0 4px rgba(0, 0, 0, 0.5),
    inset -2px 0 4px rgba(0, 0, 0, 0.5),
    /* Screen edge reflection */ inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    /* very subtle inner border */ /* Bottom catch (screen glass reflects some light) */ inset 0 -1px 2px rgba(255, 255, 255, 0.03),
    /* Outer bezel transition */ 0 1px 0 rgba(255, 255, 255, 0.06),
    0 2px 4px rgba(0, 0, 0, 0.3);
  /* Optional: faint backlight color bleed */
  /* Add: inset 0 0 20px rgba(accent_color, 0.02) for display color bleed */
}
```

---

## 14.9 — Color Bleed from Content

When a display well has active content (LED, CRT, indicator), the light bleeds into the recess walls:

```css
/* Green LED well with bleed */
.led-well-active {
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* Standard recess layers */
    inset 0 3px 6px rgba(0, 0, 0, 0.7),
    inset 0 1px 2px rgba(0, 0, 0, 0.5),
    inset 2px 0 4px rgba(0, 0, 0, 0.4),
    inset -2px 0 4px rgba(0, 0, 0, 0.4),
    /* COLOR BLEED — content light reflecting off walls */ inset 0 0 12px rgba(0, 255, 60, 0.03),
    /* green ambient bleed */ inset 0 0 6px rgba(0, 255, 60, 0.05),
    /* tighter bleed */ /* Standard bottom/outer */ inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    0 1px 0 rgba(255, 255, 255, 0.06);
}

/* Amber CRT well with bleed */
.crt-well-active {
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    inset 0 4px 10px rgba(0, 0, 0, 0.9),
    inset 0 2px 4px rgba(0, 0, 0, 0.7),
    inset 3px 0 6px rgba(0, 0, 0, 0.5),
    inset -3px 0 6px rgba(0, 0, 0, 0.5),
    /* Amber bleed from CRT content */ inset 0 0 16px rgba(255, 180, 60, 0.04),
    inset 0 0 8px rgba(255, 180, 60, 0.06),
    inset 0 -1px 0 rgba(255, 240, 220, 0.05),
    0 1px 0 rgba(255, 240, 220, 0.06);
}
```

---

## 14.10 — Surface-to-Well Transition Patterns

### Beveled transition (angled inner edge)

```css
.beveled-well {
  position: relative;
  background: #060606;
  border-radius: 8px;
  box-shadow: /* ... standard recess ... */;
}

/* Beveled inner edge using gradient pseudo-element */
.beveled-well::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  /* Top/left inner bevel = bright (angled surface catches light) */
  border-top: 2px solid rgba(255, 250, 240, 0.22); /* §16.2 machined rim: warm, floor 0.20 */
  border-left: 1px solid rgba(255, 255, 255, 0.04);
  /* Bottom/right inner bevel = dark (angled away from light) */
  border-bottom: 2px solid rgba(0, 0, 0, 0.5);
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
```

### Rolled edge (soft transition)

```css
.rolled-edge-well {
  background: #060606;
  border-radius: 12px; /* larger radius = softer roll */
  box-shadow:
    /* ZONE 0: machined rim — frontmost warm inset lip, §16.2 floor 0.20 (the #1 missing layer) */
    inset 0 1px 0 rgba(255, 250, 240, 0.22),
    /* Soft rolled edge — multiple low-opacity layers */
    inset 0 1px 1px rgba(0, 0, 0, 0.3),
    inset 0 2px 3px rgba(0, 0, 0, 0.3),
    inset 0 4px 6px rgba(0, 0, 0, 0.3),
    inset 0 6px 10px rgba(0, 0, 0, 0.3),
    inset 0 8px 14px rgba(0, 0, 0, 0.2),
    /* Each layer at SAME opacity but increasing blur = smooth gradient descent */ inset 0 -1px 2px rgba(255, 255, 255, 0.04),
    0 1px 0 rgba(255, 255, 255, 0.06);
}
```

---

## 14.11 — Quick Reference: Layer Count by Component

| Component                  | Min layers | Background                     | Template section |
| -------------------------- | ---------- | ------------------------------ | ---------------- |
| Input field / small status | 6          | `#080808` → `#0c0c0c`          | §14.3            |
| Gauge/meter well           | 9          | `#050505` → `#080808`          | §14.4            |
| CRT/deep display           | 12         | `#030303`                      | §14.5            |
| Slider channel             | 5          | gradient `#050505` → `#0f0f0f` | §14.6            |
| LED hole                   | 4          | radial `#1a1a1a` → `#000`      | §14.7            |
| Large port                 | 7          | radial `#151515` → `#040404`   | §14.7            |
| LCD display                | 8+         | radial `#0d1117` → `#020204`   | §14.8            |

**RULE: Never use fewer layers than listed above. Claude's default 2-3 layers is ALWAYS wrong for skeuomorphic.**

**RULE (§16.2): the FRONTMOST inset layer of every display/readout well is the machined rim `inset 0 1px 0 rgba(255,250,240,0.22)` (floor 0.20, range 0.20-0.25). The counts above are pre-rim minimums — add +1 for it. Without it the well reads flat on top (the #1 recurring failure). This is NOT the faint 0.06 outer surface catch.**
