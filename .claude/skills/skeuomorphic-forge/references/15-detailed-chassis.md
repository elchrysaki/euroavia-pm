# 15 — Detailed Metal Chassis Construction

> How to build realistic industrial panels that look like MACHINED EQUIPMENT — not a gray div with a grid.
> This file exists because Claude always produces the same featureless rectangle.
> **A chassis is a COMPOSITION of zones, textures, and hardware — never a single flat element.**

---

## 15.1 — Why Chassis Fail

| What Claude does                                     | Why it looks wrong                            | What to do instead                                            |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| Gray div + `border-radius: 12px`                     | Looks like a card, not metal                  | Multi-layer background + bevel borders + surface texture      |
| `radial-gradient(circle, #000 1px, transparent 1px)` | Dots look like a CSS pattern, not metal holes | Hex perforation with depth shadows + highlight rings          |
| Same surface everywhere                              | Real panels have ZONES                        | Split into bezel + sub-panel + well + grille + mounting areas |
| No edge treatment                                    | Real panels have chamfered/rolled edges       | 3-4 border layers (light top/left, dark bottom/right)         |
| Missing context                                      | Panels exist INSIDE something                 | Show mounting screws, rack rails, or enclosure edges          |
| No texture variety                                   | All one gradient                              | Different finish per zone (brushed, painted, perforated)      |

---

## 15.2 — Chassis Anatomy: 6 Zones

Every realistic chassis panel has these zones. NOT ALL need to be present, but at least 3 should be:

```
┌────────────────────────────────────────────────────────┐
│ [SCREW]          BEZEL FRAME (Zone 1)          [SCREW] │
│ ┌────────────────────────────────────────────────────┐ │
│ │          MAIN SURFACE (Zone 2 — brushed/painted)   │ │
│ │                                                    │ │
│ │  ┌──────────┐    ┌──────────────────────────────┐  │ │
│ │  │ WELL     │    │  DISPLAY AREA (Zone 4)       │  │ │
│ │  │ Zone 3   │    │  (recessed, dark, contains    │  │ │
│ │  │ (recess) │    │   instruments/readouts)       │  │ │
│ │  └──────────┘    └──────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ┌──────────────────────────────────────────────┐  │ │
│ │  │  GRILLE / VENTILATION (Zone 5 — perforated)  │  │ │
│ │  └──────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ┌──────┐  ┌──────┐  ┌──────┐  [LABELS Zone 6]   │ │
│ │  │KNOB 1│  │KNOB 2│  │KNOB 3│   GAIN  FREQ  Q   │ │
│ │  └──────┘  └──────┘  └──────┘                     │ │
│ └────────────────────────────────────────────────────┘ │
│ [SCREW]                                        [SCREW] │
└────────────────────────────────────────────────────────┘
```

---

## 15.3 — Zone 1: Bezel Frame (Outer edge of panel)

The bezel is the thick border around the panel. It should look like a separate piece of metal from the main surface.

```css
.chassis-bezel {
  position: relative;
  padding: 16px;
  border-radius: 12px;

  /* Bezel surface — slightly different finish from main panel */
  background: linear-gradient(150deg, #2a2a30 0%, #1e1e24 15%, #161618 55%, #1c1c22 80%, #222228 100%);

  /* Heavy multi-layer shadow for physical depth */
  box-shadow:
    /* Inner edge definition */
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    /* top catch */ inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    /* bottom shadow */ inset 1px 0 0 rgba(255, 255, 255, 0.06),
    /* left catch */ inset -1px 0 0 rgba(0, 0, 0, 0.3),
    /* right shadow */ /* Outer depth — panel sitting on surface */ 0 2px 4px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.1),
    /* Far ambient */ 0 24px 48px rgba(0, 0, 0, 0.08);

  /* Bevel edges — the key detail */
  border-top: 2px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom: 2px solid rgba(0, 0, 0, 0.4);
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}
```

---

## 15.4 — Zone 2: Main Surface Textures

### Brushed metal (horizontal grain)

```css
.brushed-horizontal {
  background:
    /* Grain layer — fine horizontal lines */
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 3px),
    /* Diagonal specular band */ repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 6px),
    /* Base metal gradient */ linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #222222 100%);
}
```

### Brushed metal (circular / radial grain) — for knob faceplates

```css
.brushed-radial {
  background:
    repeating-radial-gradient(circle at center, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 3px),
    radial-gradient(circle at 40% 35%, #303030 0%, #1a1a1a 60%, #141414 100%);
}
```

### Painted metal (matte finish with micro-texture)

```css
.painted-metal {
  background:
    /* SVG noise for micro-texture */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"),
    /* Matte gradient — very subtle */ linear-gradient(145deg, #1e1e1e 0%, #181818 100%);
  background-blend-mode: overlay, normal;
}
```

### Anodized aluminum (colored metal)

```css
.anodized-dark-blue {
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 3px), linear-gradient(145deg, #1a1a2e 0%, #12122a 50%, #1a1a30 100%);
}
```

---

## 15.5 — Zone 5: Perforated Metal / Speaker Grille

### Hex pattern (most realistic for audio equipment)

```css
.hex-perforation {
  --hole: 3px;
  --gap: 8px;
  --metal: #1a1a1a;
  --hole-color: #080808;

  position: relative;
  background-color: var(--metal);
  background-image: radial-gradient(circle, var(--hole-color) var(--hole), transparent var(--hole)), radial-gradient(circle, var(--hole-color) var(--hole), transparent var(--hole));
  background-size:
    calc(var(--gap) * 2) calc(var(--gap) * 1.732),
    calc(var(--gap) * 2) calc(var(--gap) * 1.732);
  background-position:
    0 0,
    var(--gap) calc(var(--gap) * 0.866);

  /* Depth — holes go INTO the metal */
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04);
}

/* Add a highlight ring around each hole using pseudo-element */
.hex-perforation::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, transparent calc(var(--hole) - 1px), rgba(255, 255, 255, 0.06) var(--hole), transparent calc(var(--hole) + 1px)),
    radial-gradient(circle, transparent calc(var(--hole) - 1px), rgba(255, 255, 255, 0.06) var(--hole), transparent calc(var(--hole) + 1px));
  background-size:
    calc(var(--gap) * 2) calc(var(--gap) * 1.732),
    calc(var(--gap) * 2) calc(var(--gap) * 1.732);
  background-position:
    0 0,
    var(--gap) calc(var(--gap) * 0.866);
  pointer-events: none;
}
```

### Slot ventilation (elongated holes)

```css
.slot-ventilation {
  --slot-w: 24px;
  --slot-h: 3px;
  --gap-x: 28px;
  --gap-y: 8px;

  background-color: #1a1a1a;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent calc((var(--gap-y) - var(--slot-h)) / 2),
    #080808 calc((var(--gap-y) - var(--slot-h)) / 2),
    #080808 calc((var(--gap-y) + var(--slot-h)) / 2),
    transparent calc((var(--gap-y) + var(--slot-h)) / 2),
    transparent var(--gap-y)
  );
  background-size: var(--gap-x) var(--gap-y);

  /* Slot depth shadows */
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.6),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 2px;
}
```

---

## 15.6 — Panel Joints & Seams

Where two metal panels meet. Creates visual subdivision without being separate DOM elements.

### Horizontal seam (between top and bottom panels)

```css
.panel-seam-h {
  position: relative;
}

.panel-seam-h::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  height: 2px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.4) 5%, rgba(0, 0, 0, 0.4) 95%, transparent 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05),
    /* bottom catch */ 0 -1px 0 rgba(0, 0, 0, 0.3); /* top shadow */
}
```

### Vertical seam

```css
.panel-seam-v::after {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 2px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.4);
  box-shadow:
    1px 0 0 rgba(255, 255, 255, 0.05),
    /* right catch */ -1px 0 0 rgba(0, 0, 0, 0.3); /* left shadow */
}
```

### Corner bracket seam (L-shaped joint)

```css
.corner-bracket::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  border-top: 2px solid rgba(0, 0, 0, 0.3);
  border-left: 2px solid rgba(0, 0, 0, 0.3);
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.04);
}
```

---

## 15.7 — Mounting Hardware (Screws & Rivets)

### Torx screw (star drive — more realistic than Phillips for industrial)

```css
.torx-screw {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: absolute;

  /* Screw head — convex dome */
  background: radial-gradient(circle at 35% 30%, #666 0%, /* specular highlight */ #444 20%, /* mid tone */ #2a2a2a 60%, /* body */ #1a1a1a 85%, /* edge shadow */ #111 100% /* rim */);

  /* Depth — screw sits in a countersink */
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    /* dome highlight */ inset 0 -1px 1px rgba(0, 0, 0, 0.5),
    /* bottom shadow */ 0 1px 2px rgba(0, 0, 0, 0.5),
    /* cast shadow */ 0 0 0 1px rgba(0, 0, 0, 0.3); /* countersink rim */
}

/* Torx star — 6-point star drive */
.torx-screw::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  clip-path: polygon(50% 0%, 65% 25%, 100% 25%, 75% 50%, 100% 75%, 65% 75%, 50% 100%, 35% 75%, 0% 75%, 25% 50%, 0% 25%, 35% 25%);
}
```

### Hex bolt

```css
.hex-bolt {
  width: 16px;
  height: 16px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: radial-gradient(circle at 40% 35%, #555 0%, #3a3a3a 50%, #222 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.5);
}
```

### Rivet (flush head)

```css
.rivet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #555 0%, #333 40%, #1a1a1a 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 1px 1px rgba(0, 0, 0, 0.4);
}
```

---

## 15.8 — Stamped Labels / Factory Markings

### Embossed label (raised from surface)

```css
.stamped-label {
  font-family: "Arial", "Helvetica Neue", sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.4);
  text-shadow: 0 1px 0 rgba(255, 240, 220, 0.12); /* highlight BELOW = raised above surface */
}
```

### Engraved label (cut into surface)

```css
.engraved-label {
  font-family: "Arial", "Helvetica Neue", sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.5);
  text-shadow:
    0 1px 0 rgba(255, 240, 220, 0.1),
    /* highlight BELOW = light hitting bottom of groove */ 0 -1px 0 rgba(0, 0, 0, 0.3); /* shadow ABOVE = top edge casting shadow */
}
```

### Painted marking (silk-screened)

```css
.silk-label {
  font-family: "Arial", sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  text-shadow:
    0 0 1px rgba(0, 0, 0, 0.8),
    /* ink spread shadow */ 0 1px 2px rgba(0, 0, 0, 0.3); /* paint thickness shadow */
}
```

---

## 15.9 — Complete Chassis Example

All 6 zones assembled into a single component:

```css
/* Zone 1: Bezel frame */
.chassis {
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background:
    /* Brushed texture */
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 3px),
    /* Base gradient */ linear-gradient(150deg, #2a2a30 0%, #1e1e24 50%, #222228 100%);
  background-blend-mode: overlay, normal;
  /* Bezel shadow stack (9 layers) */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    inset 1px 0 0 rgba(255, 255, 255, 0.05),
    inset -1px 0 0 rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.1),
    0 24px 48px rgba(0, 0, 0, 0.06);
  border-top: 2px solid rgba(255, 255, 255, 0.08);
  border-bottom: 2px solid rgba(0, 0, 0, 0.4);
}

/* Zone 2: Main surface (inner panel — different finish) */
.chassis-inner {
  background: linear-gradient(145deg, #1e1e1e 0%, #161616 100%);
  border-radius: 8px;
  padding: 16px;
  /* Sits IN the bezel — slight recess */
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    0 1px 0 rgba(255, 255, 255, 0.06);
}

/* Zone 3: Instrument well (recessed area for gauges) */
.chassis-well {
  /* Use §14.4 (9-layer deep instrument well) */
}

/* Zone 4: Display area */
.chassis-display {
  /* Use §14.8 (LCD display well) */
}

/* Zone 5: Grille section */
.chassis-grille {
  /* Use §15.5 hex perforation */
}

/* Zone 6: Labels */
.chassis-label {
  /* Use §15.8 stamped/engraved labels */
}
```

---

## 15.10 — Multi-Panel Composition Patterns

### Horizontal split (top controls, bottom display)

```css
.chassis-top-half {
  background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
  border-radius: 12px 12px 0 0;
  border-bottom: none;
}
.chassis-bottom-half {
  background: linear-gradient(145deg, #1a1a1a, #141414);
  border-radius: 0 0 12px 12px;
  border-top: none;
  /* Seam between halves */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 -1px 0 rgba(0, 0, 0, 0.3);
}
```

### Inset panel within chassis (different metal)

```css
.sub-panel {
  background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.015) 0px, rgba(255, 255, 255, 0.015) 1px, transparent 1px, transparent 2px), linear-gradient(145deg, #222222 0%, #1a1a1a 100%);
  border-radius: 6px;
  /* Sits ON the main surface — slightly raised */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
```

---

## 15.11 — Chassis Checklist (MANDATORY before delivery)

- [ ] Panel has at least 3 of 6 zones (bezel, surface, well, display, grille, labels)
- [ ] Surface texture present (brushed grain, painted noise, or anodized)
- [ ] Bevel edges on bezel frame (light top/left, dark bottom/right)
- [ ] At least 2 different surface finishes visible (not all same gradient)
- [ ] Mounting hardware present if panel is rectangular (4 corner screws minimum)
- [ ] Labels use stamped/engraved style (not plain text)
- [ ] Wells/recesses have 6+ inset shadow layers (ref §14)
- [ ] Panel has context (sits in a larger surface or has visible mounting)
- [ ] Shadow stack on bezel: minimum 8 layers
- [ ] NO `radial-gradient(circle, #000 1px, transparent 1px)` as sole perforation pattern
