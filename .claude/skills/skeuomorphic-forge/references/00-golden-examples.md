# Golden Examples — Production Patterns to Copy-Adapt

**READ THIS FILE FIRST before building ANY skeuomorphic component.**

All examples below are extracted from production code that works. COPY and ADAPT them — do NOT invent shadow stacks from scratch.

---

## 1. SHADOW STACKS BY TIER

### Standard (5+ layers) — Buttons, cards, toggles

From production code (not shipped with this skill):

```javascript
boxShadow: `
  inset 0 1px 0 rgba(255,255,255,0.05),   /* L: top edge catch */
  inset 0 -1px 0 rgba(0,0,0,0.3),          /* S: bottom edge shadow */
  0 2px 4px rgba(0,0,0,0.4),               /* S: close cast shadow */
  0 8px 16px rgba(0,0,0,0.3),              /* S: mid depth */
  0 16px 32px rgba(0,0,0,0.2)              /* S: ambient floor shadow */
`;
/* L = Light, S = Shadow — they are separate concerns */
```

### Advanced (8-9 layers) — Knobs, dials, meters, switch rails

From production code (not shipped with this skill) (gorge/channel effect):

```javascript
boxShadow: `
  inset 0 6px 14px rgba(0,0,0,0.98),       /* S: top gorge — deepest */
  inset 0 3px 5px rgba(0,0,0,0.85),        /* S: mid gorge */
  inset 0 -3px 5px rgba(0,0,0,0.5),        /* S: bottom step */
  inset 3px 0 6px rgba(0,0,0,0.55),        /* S: left wall */
  inset -3px 0 6px rgba(0,0,0,0.55)        /* S: right wall */
`;
/* All insets = gorge shadows. Creates a physical channel. */
/* Light goes on the KNOB that sits inside, not on the rail. */
```

From production code (not shipped with this skill) (display well — 10 layers, incl. mandatory top rim >=0.20):

```javascript
boxShadow: `
  inset 0 12px 30px rgba(0,0,0,0.95),      /* S: deep vertical shadow */
  inset 0 6px 14px rgba(0,0,0,0.85),       /* S: mid vertical depth */
  inset 0 -12px 30px rgba(0,0,0,0.8),      /* S: bottom echo */
  inset 4px 0 12px rgba(0,0,0,0.6),        /* S: left gorge wall */
  inset -4px 0 12px rgba(0,0,0,0.6),       /* S: right gorge wall */
  inset 0 0 40px rgba(0,5,15,0.3),         /* S: ambient inset well */
  inset 0 0 30px rgba(255,180,60,0.02),    /* L: warm glow trapped in well */
  inset 0 1px 0 rgba(255,250,240,0.22),    /* L: TOP machined-lip RIM — keep >=0.20 (§16.2). THIS is what makes the well read as finished, not flat. NEVER lower to edge-catch (0.03-0.08) values. */
  0 0 0 1px rgba(0,0,0,0.95),              /* S: rim line */
  0 1px 0 rgba(255,255,255,0.03)           /* L: bottom catch line */
`;
```

### Hero (13+ layers) — Full panels, chassis, faceplates

From `app/globals.css` (Soviet CRT Chassis):

```css
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.25),
  /* L: top bevel highlight */ inset 0 -1px 0 rgba(0, 0, 0, 0.8),
  /* S: bottom bevel shadow */ inset 1px 0 1px rgba(255, 255, 255, 0.1),
  /* L: left bevel catch */ inset -1px 0 1px rgba(0, 0, 0, 0.5),
  /* S: right bevel shadow */ 0 2px 4px rgba(0, 0, 0, 0.4),
  /* S: close drop */ 0 4px 8px rgba(0, 0, 0, 0.3),
  /* S: mid drop */ 0 6px 12px rgba(0, 0, 0, 0.25),
  /* S: far drop */ 0 8px 16px rgba(0, 0, 0, 0.2),
  /* S: ambient 1 */ 0 12px 24px rgba(0, 0, 0, 0.15),
  /* S: ambient 2 */ 0 16px 32px rgba(0, 0, 0, 0.1),
  /* S: ambient 3 */ 0 20px 40px rgba(0, 0, 0, 0.08),
  /* S: ambient 4 */ 0 0 60px rgba(255, 176, 0, 0.06),
  /* L: amber backlight glow */ 0 40px 60px -20px rgba(0, 0, 0, 0.5); /* S: heavy base shadow */
```

### Ultra (31 layers) — Deep chassis recess

From `assets/codepen-deep-screen.html`:

```css
box-shadow:
  /* Warm machined rim — FRONTMOST (1st layer) so the top inner lip catches light and is not occluded; §16.2 floor 0.20, inset => C1-compliant (no colored non-inset shadow) */
  inset 0 1px 0 rgba(255, 250, 240, 0.22),
  /* Micro borders — crisp edge definition */
  inset 0 1px 0 #000,
  inset 0 2px 0 #000,
  inset 0 3px 1px #000,
  inset 1px 0 0 #000,
  inset 2px 0 0 #000,
  inset -1px 0 0 #000,
  inset -2px 0 0 #000,
  /* Vertical depth (progressive falloff) */ inset 0 4px 4px rgba(0, 0, 0, 1),
  inset 0 8px 10px rgba(0, 0, 0, 1),
  inset 0 14px 18px rgba(0, 0, 0, 0.95),
  inset 0 22px 30px rgba(0, 0, 0, 0.85),
  inset 0 32px 50px rgba(0, 0, 0, 0.6),
  /* Horizontal depth (side walls) */ inset 6px 0 8px rgba(0, 0, 0, 1),
  inset 12px 0 16px rgba(0, 0, 0, 0.9),
  inset 20px 0 24px rgba(0, 0, 0, 0.6),
  inset -6px 0 8px rgba(0, 0, 0, 1),
  inset -12px 0 16px rgba(0, 0, 0, 0.9),
  inset -20px 0 24px rgba(0, 0, 0, 0.6),
  /* Bottom depth */ inset 0 -4px 4px rgba(0, 0, 0, 1),
  inset 0 -8px 10px rgba(0, 0, 0, 1),
  inset 0 -14px 18px rgba(0, 0, 0, 0.95),
  inset 0 -22px 30px rgba(0, 0, 0, 0.85),
  inset 0 -32px 50px rgba(0, 0, 0, 0.6),
  /* Corner occlusion (4-way) */ inset 10px 10px 18px rgba(0, 0, 0, 0.9),
  inset -10px 10px 18px rgba(0, 0, 0, 0.9),
  inset 10px -10px 18px rgba(0, 0, 0, 0.9),
  inset -10px -10px 18px rgba(0, 0, 0, 0.9),
  /* External — base shadow (rim moved to a frontmost inset lip above, per C1) */ 0 2px 0 rgba(255, 255, 255, 0.02),
  0 -1px 0 rgba(0, 0, 0, 0.9),
  0 -2px 4px rgba(0, 0, 0, 0.6),
  0 6px 24px rgba(0, 0, 0, 0.6),
  0 12px 48px rgba(0, 0, 0, 0.4);
```

---

## 2. COMPLETE BUTTON — Rest / Hover / Active

From `assets/agile-tech-skeuomorphic-site.html`. Copy and adapt.

```css
/* ===== REST STATE ===== */
.button {
  --bg: #080808;
  border: 0;
  border-radius: 100px;
  background-color: var(--bg);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow:
    inset 0 0.3rem 0.9rem rgba(255, 255, 255, 0.3),
    /* L: top convex highlight */ inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
    /* S: bottom edge */ inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.5),
    /* L: bottom inner reflection */ 0 3rem 3rem rgba(0, 0, 0, 0.3),
    /* S: far floor shadow */ 0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8); /* S: close cast shadow */
}
.button .wrap {
  font-size: 25px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  padding: 32px 45px;
  border-radius: inherit;
  position: relative;
  overflow: hidden;
}

/* ===== HOVER STATE — brighten highlights ===== */
.button:hover {
  box-shadow:
    inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.4),
    /* L: +0.1 opacity */ inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
    inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.7),
    /* L: +0.2 opacity */ 0 3rem 3rem rgba(0, 0, 0, 0.3),
    0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8);
}

/* ===== ACTIVE STATE — depress into surface ===== */
.button:active {
  transform: translateY(4px); /* Physical depression */
  box-shadow:
    inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.5),
    /* L: compressed highlight */ inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.8),
    /* S: +0.1 — pressed deeper */ inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.4),
    /* L: -0.3 — light compressed */ 0 3rem 3rem rgba(0, 0, 0, 0.3),
    0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8);
}
```

**Key pattern**: Hover BRIGHTENS highlights (opacity +0.1 to +0.2). Active DEPRESSES (translateY + shifts light distribution). Shadow layers stay consistent — only opacities change.

### Industrial Circuit Relay Button

From `assets/agile-tech-skeuomorphic-site.html`. Chipped/industrial aesthetic with clip-path.

```css
.btn-circuit-relay {
  padding: 28px 64px;
  font-family: var(--font-accent, sans-serif);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.8);
  background-color: #111316;
  background-image: var(--texture-anodized); /* Anodized metal texture */
  background-blend-mode: overlay;
  /* Chipped industrial edge — asymmetric corners */
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 20px) 100%, calc(100% - 50px) 100%, calc(100% - 60px) calc(100% - 10px), 20px calc(100% - 10px), 0 calc(100% - 30px), 0 10px);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.1),
    inset 0 -2px 0 rgba(0, 0, 0, 0.5);
}
.btn-circuit-relay:hover {
  background-color: #1a1c21;
  color: #fff;
}
.btn-circuit-relay:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 10px 20px rgba(0, 0, 0, 0.9),
    /* Deep press */ 0 1px 2px rgba(0, 0, 0, 0.5);
}
```

---

## 3. COMPLETE CARD WITH RIM LIGHT

Composite pattern from production. A dark card with top rim glow.

```javascript
// Card container
const cardStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: 12,
  background: 'linear-gradient(145deg, hsl(30 12% 10%) 0%, hsl(30 14% 6%) 100%)',
  padding: '24px',
  // Standard shadow stack (5 layers)
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 -1px 0 rgba(0,0,0,0.4),
    0 4px 12px rgba(0,0,0,0.5),
    0 8px 24px rgba(0,0,0,0.3),
    0 0 1px rgba(255,255,255,0.1)
  `,
  overflow: 'hidden',
};

// Rim light — ::before pseudo-element
// Position at top edge, radial gradient fading to transparent
const rimLightStyle: React.CSSProperties = {
  content: '""',
  position: 'absolute',
  top: 0,
  left: '10%',
  right: '10%',
  height: 1,
  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.25), transparent 70%)',
  pointerEvents: 'none',
};

// Bottom subtle rim — ::after
const bottomRimStyle: React.CSSProperties = {
  content: '""',
  position: 'absolute',
  bottom: 0,
  left: '20%',
  right: '20%',
  height: 1,
  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08), transparent 70%)',
  pointerEvents: 'none',
};
```

---

## 4. SCREW HEAD (7 layers + radial gradient)

From production code (not shipped with this skill):

```javascript
const screwStyle: React.CSSProperties = {
  position: 'absolute',
  width: 7,
  height: 7,
  borderRadius: '50%',
  // Radial gradient = sphere lighting. Hotspot at 32% 26% (top-left, consistent with 135deg)
  background: 'radial-gradient(circle at 32% 26%, hsl(40 15% 50%) 0%, hsl(35 18% 38%) 15%, hsl(30 20% 25%) 40%, hsl(25 22% 15%) 70%, hsl(20 20% 8%) 100%)',
  boxShadow: `
    inset 0 2px 4px rgba(0,0,0,0.95),      /* S: top shadow (screw recess) */
    inset 0 -0.5px 0 rgba(255,255,255,0.2), /* L: bottom edge catch */
    0 1px 1px rgba(0,0,0,0.9),              /* S: close cast */
    0 2px 3px rgba(0,0,0,0.6),              /* S: mid cast */
    0 3px 5px rgba(0,0,0,0.45),             /* S: far cast (§16.5: screws sit ON the surface, 7-layer min for pronounced depth) */
    0 5px 9px rgba(0,0,0,0.3),              /* S: ambient drop (§16.5) */
    0 0 0 0.5px rgba(0,0,0,0.8)             /* S: rim line */
  `,
  zIndex: 20,
};
// Torx slot: add a ::before with the slot line
// background: linear-gradient(slotAngle, transparent 38%, rgba(0,0,0,0.7) 42%, rgba(0,0,0,0.7) 58%, transparent 62%)
```

---

## 5. PHOSPHOR / CRT TEXT GLOW

From `assets/codepen-deep-screen.html`:

```css
.phosphor-title {
  font-family: "Space Mono", monospace;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #ff6b5a;
  text-shadow:
    0 0 1px rgba(255, 107, 90, 1),
    /* Core — sharp */ 0 0 6px rgba(255, 80, 60, 0.7),
    /* Mid — diffused */ 0 0 12px rgba(255, 40, 20, 0.3); /* Halo — ambient */
  animation: text-breathe 4s infinite ease-in-out;
}

@keyframes text-breathe {
  0%,
  100% {
    opacity: 0.95;
  }
  50% {
    opacity: 1;
  }
}
```

**Amber variant** (for this project's default palette):

```javascript
const phosphorStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'hsl(35 100% 65%)',
  textShadow: `
    0 0 4px currentColor,
    0 0 10px currentColor,
    0 0 20px rgba(255,180,0,0.3)
  `,
};
```

---

## 6. SILKSCREEN LABEL

From `references/05-physics-composition-interaction-typography.md`:

```javascript
const silkscreenStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  color: 'rgba(255,255,255,0.06)',
  textShadow: '0 1px 0 rgba(0,0,0,0.9), 0 0 6px rgba(255,255,255,0.05)',
};
```

---

## 7. MATERIAL SURFACE GRADIENTS

### Brushed Metal (dark, warm)

```javascript
background: `
  url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23r)' opacity='0.04'/%3E%3C/svg%3E"),
  linear-gradient(142deg, hsl(40 10% 16%) 0%, hsl(35 12% 11%) 25%, hsl(30 14% 7%) 50%, hsl(35 10% 9%) 75%, hsl(40 8% 13%) 100%)
`,
backgroundBlendMode: 'overlay, normal',
```

### Sphere / Knob (radial, light at 35% 30%)

```javascript
background: 'radial-gradient(circle at 35% 30%, hsl(40 15% 50%) 0%, hsl(35 12% 30%) 45%, hsl(30 14% 10%) 100%)',
```

### Chrome (multi-stop mirror reflection)

```css
background: linear-gradient(135deg, #e8e8ec 0%, #a0a0a8 30%, #d0d0d4 50%, #909098 70%, #c8c8cc 100%);
```

### Leather (warm brown + grain)

```css
background: linear-gradient(160deg, #6b4226 0%, #4a2d18 100%);
/* Add SVG feTurbulence grain texture overlay at 8-12% opacity */
```

### Wood grain

```css
background: repeating-linear-gradient(95deg, rgba(139, 90, 43, 0.15) 0px, transparent 3px, transparent 8px), linear-gradient(180deg, #8b5a2b 0%, #6b3a1b 100%);
```

---

## 8. WARM INDUSTRIAL PALETTE

All hues 25-40 (warm amber/brown). Default for this project.

| Token                | Value                    | Usage                          |
| -------------------- | ------------------------ | ------------------------------ |
| `--ri-chassis-dark`  | `hsl(30 14% 5%)`         | Deepest panel background       |
| `--ri-chassis-base`  | `hsl(30 12% 8%)`         | Standard panel/card background |
| `--ri-chassis-mid`   | `hsl(35 10% 12%)`        | Elevated surface               |
| `--ri-chassis-light` | `hsl(35 8% 18%)`         | Bezel outer ring               |
| `--ri-bevel`         | `hsl(40 8% 26%)`         | Chamfered edges                |
| `--ri-highlight`     | `hsl(40 12% 38%)`        | Specular spots                 |
| `--ri-amber`         | `hsl(35 100% 60%)`       | CRT text, active state         |
| `--ri-amber-dim`     | `hsl(35 60% 40%)`        | Muted accent, borders          |
| `--ri-amber-glow`    | `rgba(255,180,0,0.4)`    | Text-shadow halo               |
| `--ri-cream`         | `hsl(40 60% 72%)`        | Counter digits                 |
| `--ri-green`         | `hsl(120 80% 55%)`       | LED green                      |
| `--ri-red`           | `hsl(0 80% 55%)`         | LED red, critical              |
| `--ri-silk`          | `rgba(255,255,255,0.06)` | Silkscreen text                |
| `--ri-silk-active`   | `rgba(245,158,11,0.8)`   | Backlit label                  |

---

## 9. TYPOGRAPHY

| Context           | Font                           | Weight | Tracking      | Case      |
| ----------------- | ------------------------------ | ------ | ------------- | --------- |
| CRT/VFD readout   | `'Orbitron', sans-serif`       | 700    | `0.05em`      | uppercase |
| Terminal/status   | `'Share Tech Mono', monospace` | 400    | `0.02em`      | mixed     |
| Counter digits    | `'Orbitron', sans-serif`       | 700    | `0.1em`       | numeric   |
| Silkscreen labels | `font-mono` (system)           | 600    | `0.08-0.15em` | uppercase |
| Engraved text     | `font-mono` (system)           | 700    | `0.05em`      | uppercase |

---

## Component Lookup Table

Find the component type below. Read the listed reference files BEFORE writing code.

### Buttons & Toggles

| Component                  | Pattern # | Reference File(s)                                    |
| -------------------------- | --------- | ---------------------------------------------------- |
| Industrial push button     | 14.16     | `04-community-techniques.md` (search "14.16") + `01` |
| iOS 6 glass button         | 14.3      | `04` (search "14.3") + `07-glass-effects.md`         |
| Bevel button (3-layer)     | 14.95     | `04` (search "14.95")                                |
| Shape-shifted bevel button | 14.97     | `04` (search "14.97")                                |
| Brushed metal button       | 24.2      | `08-metal-effects.md`                                |
| Metallic conic button      | 24.3      | `08-metal-effects.md`                                |
| Power button (on/off glow) | 14.101    | `04` (search "14.101")                               |
| Membrane/jelly button      | 14.3      | `04` + `01`                                          |
| Toggle switch (spring)     | —         | `02-hardware-animation-neumorphism.md`               |
| Rocker switch              | —         | `02` + `01`                                          |
| Engraved glow button       | 14.38     | `04` (search "14.38")                                |
| Circuit relay button       | 14.53     | `04` (search "14.53")                                |

### Cards & Panels

| Component                 | Pattern #  | Reference File(s)                                 |
| ------------------------- | ---------- | ------------------------------------------------- |
| Metal panel/faceplate     | 9.1-9.6    | `03-blueprints-performance-palettes.md` + `01`    |
| Rim light card            | 14.98 / 25 | `04` (search "14.98") + `09-rim-light-effects.md` |
| Dark glass card           | 23.4       | `07-glass-effects.md`                             |
| Frosted glass card        | 23.3       | `07-glass-effects.md`                             |
| Leather panel             | 14.4       | `04` (search "14.4") + `01`                       |
| Wood panel                | 14.5       | `04` (search "14.5") + `01`                       |
| Paper/torn paper card     | 14.87      | `04` (search "14.87") + `01`                      |
| Rubber overmold           | —          | `01` (search "rubber")                            |
| Area light card           | 14.99      | `04` (search "14.99")                             |
| Layered depth shadow card | 14.100     | `04` (search "14.100")                            |

### Gauges, Meters & Displays

| Component          | Pattern # | Reference File(s)                                         |
| ------------------ | --------- | --------------------------------------------------------- |
| VU meter           | 9.12      | `03` + `05-physics-composition-interaction-typography.md` |
| Oscilloscope       | 14.60     | `04` (search "14.60") + `11-retro-industrial-patterns.md` |
| CRT display (full) | 28        | `11-retro-industrial-patterns.md`                         |
| 7-segment display  | 14.12     | `04` (search "14.12")                                     |
| Nixie tube         | 14.14     | `04` (search "14.14")                                     |
| VFD readout        | —         | `11` (search "CRT") + `01`                                |
| LED indicator      | 29        | `11-retro-industrial-patterns.md`                         |
| Bargraph meter     | —         | `03` + `01`                                               |
| Mechanical counter | 33        | `11-retro-industrial-patterns.md`                         |

### Knobs, Dials & Sliders

| Component                | Pattern # | Reference File(s)            |
| ------------------------ | --------- | ---------------------------- |
| Machined knob            | 14.10     | `04` (search "14.10") + `01` |
| Arturia multi-layer knob | 14.11     | `04` (search "14.11")        |
| Chickenhead selector     | 14.15     | `04` (search "14.15")        |
| Rotary radial menu       | 14.61     | `04` (search "14.61")        |
| Slider/range             | —         | `02` + `01`                  |
| Glass thermostat knob    | 14.93     | `04` (search "14.93")        |
| Glass slider/equalizer   | 14.94     | `04` (search "14.94")        |

### Industrial Hardware

| Component               | Pattern # | Reference File(s)                      |
| ----------------------- | --------- | -------------------------------------- |
| Bezel assembly (3-ring) | 27        | `11-retro-industrial-patterns.md`      |
| Torx/Phillips screw     | 30        | `11-retro-industrial-patterns.md`      |
| Eurorack jack           | 14.7      | `04` (search "14.7")                   |
| Patch cable             | 14.8      | `04` (search "14.8")                   |
| Footswitch (stomp)      | 14.9      | `04` (search "14.9")                   |
| Compressor faceplate    | 14.16     | `04` (search "14.16") + `03`           |
| Vent slat / rivet       | —         | `02-hardware-animation-neumorphism.md` |

### Glass & Metal Effects

| Component               | Pattern # | Reference File(s)     |
| ----------------------- | --------- | --------------------- |
| Glass sphere/bead       | 23.6-23.7 | `07-glass-effects.md` |
| Glass icon/tile         | 23.5      | `07-glass-effects.md` |
| SVG filter glass (warp) | 23.8      | `07-glass-effects.md` |
| Chrome text             | 24.4      | `08-metal-effects.md` |
| Gold text               | 24.5      | `08-metal-effects.md` |
| Metallic border         | 24.6      | `08-metal-effects.md` |
| Brushed metal texture   | 24.7      | `08-metal-effects.md` |

### Text & Light Effects

| Component                | Pattern # | Reference File(s)      |
| ------------------------ | --------- | ---------------------- |
| Neon sign flicker        | 14.102    | `04` (search "14.102") |
| Neon text (triple blend) | 14.74     | `04` (search "14.74")  |
| Bevelled text/icons      | 14.96     | `04` (search "14.96")  |
| 3D extruded text         | 14.90     | `04` (search "14.90")  |
| 3D chrome text           | 14.86     | `04` (search "14.86")  |
| Slit light system        | 14.56     | `04` (search "14.56")  |
| Pendant light            | 14.77     | `04` (search "14.77")  |
| Ambient glow orb         | 14.78     | `04` (search "14.78")  |

### Particle Effects

| Component              | Pattern # | Reference File(s)        |
| ---------------------- | --------- | ------------------------ |
| CSS starfield          | 26.2      | `10-particle-effects.md` |
| Canvas particle engine | 26.3      | `10-particle-effects.md` |
| Click-burst dust       | 26.4      | `10-particle-effects.md` |
| Fire particles         | 26.5      | `10-particle-effects.md` |
| Orbital starfield      | 26.6      | `10-particle-effects.md` |
| Black hole vortex      | 26.7      | `10-particle-effects.md` |
| WebGL GPGPU particles  | 26.8      | `10-particle-effects.md` |
| Text disintegration    | 26.9      | `10-particle-effects.md` |

### Aging, Patina & Safety

| Component                | Pattern # | Reference File(s)                    |
| ------------------------ | --------- | ------------------------------------ |
| Vintage/weathered look   | 19        | `06-aging-safety-tokens-palettes.md` |
| Industrial safety colors | 20        | `06-aging-safety-tokens-palettes.md` |
| Design tokens setup      | 21        | `06-aging-safety-tokens-palettes.md` |

**Component not in the table?** Search across all reference files:

```bash
grep -ri "keyword" references/
```

---

## 10. Anti-Patterns (Do / Don't)

| BAD                                             | WHY                                                                | GOOD                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 2-3 layer box-shadow                            | = flat design, no physical depth                                   | 5-15 layers, graduated blur                                              |
| Screws on a flat surface                        | Screws without depth = decorative contradiction                    | Build depth FIRST, add screws on top                                     |
| Screws on glass/screen                          | Physically impossible — screws fasten metal, not glass             | Screws on METAL chassis/bezel only, never on display surface             |
| Low-quality flat-circle screws                  | Single inset shadow ≠ machined screw, looks fake                   | Radial gradient sphere + 5-layer shadow + torx slot (see section 4)      |
| Cards resizing with content                     | Physical device (CRT/gauge) has fixed dimensions                   | Explicit width+height on device cards, content fills fixed frame         |
| Recess without inner rim light                  | Flat dark rectangle instead of machined cavity                     | 1px warm border at recess edge, top brighter than bottom                 |
| Shallow screen depth (1-3 inset layers)         | Screen looks like a dark div, no sense of physical cavity          | CRT/display recess needs 12+ inset layers + inner rim light             |
| Rim light with glow/blur                        | A reflection is sharp, not diffuse — glow = neon, not machined lip | Clean 1px border only, NO box-shadow bloom around it                     |
| No color bleed from screen content              | Recess looks disconnected from its display content                 | Inner rim picks up display color (amber text -> amber rim at 0.06-0.10)  |
| Embossed text too faint (opacity < 0.25)        | Invisible silkscreen/stamped labels, defeats the purpose           | Embossed text min 0.35 opacity (tertiary), 0.5 (secondary)              |
| Button/disabled state different size than active | Physical device doesn't shrink when turned off                     | Same explicit width+height for all states of same component              |
| Decorative rim light without physical reason     | Random glowing line on a button top — why is it there?             | Every light effect needs a physical source (LED slot, edge catch, etc.)  |
| Pure white `rgba(255,255,255,X)` at X>0.10      | Looks blafard/clinical, wrong light temperature on industrial metal | `rgba(255,240,220,X)` or `rgba(255,245,235,X)` — always warm above 0.10 |
| Same box-shadow for rest/hover/active           | No physical feedback, button feels dead                            | Different stacks per state (Step 6)                                      |
| `filter: blur()` in animation                   | Performance killer, causes repaint                                 | `opacity` + `transform` only                                             |
| Multiple light directions                       | Physically impossible, breaks realism                              | Single source 135deg everywhere                                          |
| Inventing a shadow stack                        | Inconsistent, likely too shallow                                   | Copy-adapt from golden-examples                                          |
| Hardware BEFORE depth                           | Cosmetic, not structural                                           | Assembly order: depth layers first                                       |
| Light mixed with shadow in one confused stack   | Muddy, unrealistic surfaces                                        | Dark for depth, warm for specular — separate                             |
| `rgba(255,255,255,0.5)` edge catch              | Glowing white line, not realistic                                  | `rgba(255,255,255,0.08)` max for edges                                   |
| Colored drop shadows `rgba(140,80,255,0.2)`     | Shadows are absence of light — always black in reality             | `rgba(0,0,0,...)` for ALL drop shadows. Color only in `inset` highlights |
| Body text < 13px / titles < 14px                | Unreadable on most screens, looks like fine print                  | Body >= 13px, titles >= 14px, labels >= 11px (see Step 6b)               |
| Container and card same brightness (#18 vs #1c) | Everything melts together, no visual hierarchy                     | Container #08-#10, card #1c-#28, minimum #12 hex delta                   |
| Always amber-on-dark industrial                 | Monotonous, every page looks identical                             | Propose 2-3 themes from the 6 palettes (see Step 6c)                     |
| Styling without reading the page first          | Random choices that clash with existing patterns                   | STEP 0.5: scan page, extract palette, match hierarchy                    |
| Choosing button style without asking            | Wrong tier: CTA where secondary needed, ghost where primary needed | Use Button Decision Matrix, ask if ambiguous                             |
| Adding a 3rd accent color silently              | Visual chaos, page loses coherence                                 | Max 2 accents per page. Ask before introducing a new one                 |
| Ignoring existing sibling components            | New card looks nothing like the 5 existing cards                   | Same role = same style. Match siblings first                             |
