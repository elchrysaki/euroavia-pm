# Section 23 — Glass Effects

Comprehensive glass simulation techniques for CSS. Covers frosted, refractive, tinted, spherical, cracked, and dark glassmorphism — from simple backdrop-filter cards to multi-layer sphere constructions with 15+ radial gradients.

---

## 23.1 Glass Physics Primer

Real glass has 4 optical properties that CSS must simulate:

| Property         | Physical behavior                    | CSS technique                                                                                     |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Transparency** | Light passes through with absorption | `background: hsla(..., 0.1-0.4)` or `rgba()`                                                      |
| **Refraction**   | Light bends at surface boundary      | `backdrop-filter: blur()`, SVG `feDisplacementMap`, duplicate-background + clip-path              |
| **Reflection**   | Specular highlights on surface       | `background-image: linear-gradient()` or `radial-gradient()` with white/high-opacity stops        |
| **Caustics**     | Focused light patterns below/behind  | Separate element with `filter: blur()` + radial gradient, or `::before`/`::after` pseudo-elements |

**Light consistency rule:** Glass highlights and caustics must align with the global light source direction established for the component.

---

## 23.2 Frosted Glass — Clip-Path + Blur (No Backdrop-Filter)

Technique that works without `backdrop-filter` by duplicating the background image and applying `filter: blur()` to a clipped region. Broader browser support than `backdrop-filter`.

**When to use:** When `backdrop-filter` is unavailable, or when the frosted region must be a precise geometric shape (clip-path supports complex polygons).

### Construction

```css
/* Container: sets the background */
body {
  background-image: url("scene.jpg");
  background-size: cover;
  background-position: center;
}

/* Glass layer: duplicates the background + blurs + clips */
.glass {
  height: 100%;
  width: 100%;
  background-image: url("scene.jpg"); /* SAME image as parent */
  background-size: cover;
  background-position: center;
  clip-path: inset(10em); /* Defines glass region */
  filter: blur(20px); /* Frosted blur amount */
}
```

### Edge treatment — drop-shadow border

The blurred region needs edge definition. A `drop-shadow` on a parent wrapper simulates the glass panel edge, and a `::before` pseudo-element adds a subtle border highlight:

```css
.drop-shadow {
  filter: drop-shadow(0px 20px 10px rgba(0, 0, 0, 0.3));
}

.drop-shadow::before {
  content: "";
  position: absolute;
  top: 10em;
  height: calc(100% - 20em);
  width: calc(100% - 20em);
  border-top: 2px solid rgba(225, 225, 225, 0.2);
  border-left: 1px solid rgba(225, 225, 225, 0.1);
  border-right: 1px solid rgba(225, 225, 225, 0.3);
  z-index: 2;
}
```

**Key insight:** The border sides have different opacities (left 0.1, right 0.3, top 0.2) simulating light direction — the lit side is brighter.

### Responsive scaling

```css
@media (max-width: 980px) {
  .glass {
    clip-path: inset(5em);
  }
}
```

### Tuning parameters

| Parameter            | Low               | Medium                   | High                   |
| -------------------- | ----------------- | ------------------------ | ---------------------- |
| `filter: blur()`     | 5px (light haze)  | 15-20px (standard frost) | 40px+ (deep ice)       |
| `clip-path: inset()` | 2em (thin border) | 5-10em (typical panel)   | 15em+ (small viewport) |
| Shadow opacity       | 0.15 (subtle)     | 0.30 (standard)          | 0.50 (dramatic)        |

---

## 23.3 Frosted Glass Card — Backdrop-Filter

The simplest and most common glass effect. A semi-transparent surface with `backdrop-filter: blur()` and a multi-layer `box-shadow` for depth.

### Construction

```css
.frosted-glass {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px); /* Safari */
  box-shadow:
    0 0.3px 0.7px rgba(0, 0, 0, 0.126),
    0 0.9px 1.7px rgba(0, 0, 0, 0.179),
    0 1.8px 3.5px rgba(0, 0, 0, 0.224),
    0 3.7px 7.3px rgba(0, 0, 0, 0.277),
    0 10px 20px rgba(0, 0, 0, 0.4);
  transition: 0.5s ease;
}
```

**Shadow stack anatomy (5 layers, progressive depth):**

| Layer | Offset  | Blur  | Opacity | Role                   |
| ----- | ------- | ----- | ------- | ---------------------- |
| 1     | 0 0.3px | 0.7px | 0.126   | Contact shadow (sharp) |
| 2     | 0 0.9px | 1.7px | 0.179   | Near shadow            |
| 3     | 0 1.8px | 3.5px | 0.224   | Mid shadow             |
| 4     | 0 3.7px | 7.3px | 0.277   | Far shadow             |
| 5     | 0 10px  | 20px  | 0.4     | Ambient shadow (soft)  |

Each layer roughly doubles the offset and blur of the previous one. Opacity increases with distance — farther shadows are darker because ambient occlusion accumulates.

### Hover state — deepened shadow

```css
.frosted-glass:hover {
  box-shadow:
    0 0.7px 1px rgba(0, 0, 0, 0.157),
    0 1.7px 2.6px rgba(0, 0, 0, 0.224),
    0 3.5px 5.3px rgba(0, 0, 0, 0.28),
    0 7.3px 11px rgba(0, 0, 0, 0.346),
    0 20px 30px rgba(0, 0, 0, 0.5);
}
```

On hover, all offsets and blurs increase ~1.5x — the panel appears to lift off the surface.

---

## 23.4 Dark Glassmorphism with Glow + Shine System

Advanced dark glass panel with animated conic-gradient shine lines, noise-masked glow bleed, and layered pseudo-elements. Production-grade menu/modal pattern.

### Foundation — dark glass panel

```css
:root {
  --hue1: 255;
  --hue2: 222;
  --border: 1px;
  --border-color: hsl(var(--hue2), 12%, 20%);
  --radius: 22px;
  --ease: cubic-bezier(0.5, 1, 0.89, 1);
}

.glass-panel {
  border-radius: var(--radius);
  border: var(--border) solid var(--border-color);
  padding: 1em;
  background:
    linear-gradient(235deg, hsl(var(--hue1) 50% 10% / 0.8), hsl(var(--hue1) 50% 10% / 0) 33%), linear-gradient(45deg, hsl(var(--hue2) 50% 10% / 0.8), hsl(var(--hue2) 50% 10% / 0) 33%),
    linear-gradient(hsl(220deg 25% 4.8% / 0.66));
  backdrop-filter: blur(12px);
  box-shadow:
    hsl(var(--hue2) 50% 2%) 0px 10px 16px -8px,
    hsl(var(--hue2) 50% 4%) 0px 20px 36px -14px;
}
```

**Background stack (3 layers):**

1. Top-right tinted gradient (hue1, 235deg) — directional color bleed
2. Bottom-left tinted gradient (hue2, 45deg) — complementary color bleed
3. Base dark layer (near-black, 66% opacity) — the glass tint

### Shine system — conic gradient border light

The shine simulates light catching the glass edge. Uses `mask-composite: subtract` to restrict the gradient to the border area only:

```css
.shine {
  pointer-events: none;
  position: absolute;
  right: calc(var(--border) * -1);
  top: calc(var(--border) * -1);
  width: 75%;
  aspect-ratio: 1;
  border: 1px solid transparent;
  border-radius: inherit;
  z-index: 1;

  background: conic-gradient(from -45deg at center in oklch, transparent 12%, hsl(var(--hue), 80%, 60%), transparent 50%) border-box;

  /* Restrict to border only */
  mask: linear-gradient(transparent), linear-gradient(black);
  mask-clip: padding-box, border-box;
  mask-composite: subtract;
}

/* Brighter inner line */
.shine::after {
  content: "";
  inset: -2px;
  z-index: 2;
  background: conic-gradient(from -45deg at center in oklch, transparent 17%, hsl(var(--hue), 80%, 85%), /* Higher lightness = brighter */ transparent 33%);
}
```

**Two shine elements** — one top-right (`--conic: -45deg`), one bottom-left (`--conic: 135deg`) with different hues for dual-tone edge lighting.

### Glow system — noise-masked color bleed

The glow adds a diffuse color halo around corners, masked with a noise texture for organic variation:

```css
.glow {
  pointer-events: none;
  position: absolute;
  inset: calc(var(--radius) * -2);
  width: 75%;
  aspect-ratio: 1;
  border: calc(var(--radius) * 1.25) solid transparent;
  border-radius: calc(var(--radius) * 2.5);

  /* Noise mask — breaks up the glow into organic speckles */
  mask: url("noise-texture.png");
  mask-mode: luminance;
  mask-size: 29%;

  filter: blur(12px) saturate(1.25) brightness(0.5);
  mix-blend-mode: plus-lighter;
  z-index: 3;
}

.glow::before {
  content: "";
  position: absolute;
  inset: 0;
  border: inherit;
  border-radius: inherit;
  background: conic-gradient(from -45deg at center in oklch, transparent 0%, hsl(var(--hue), 95%, 60%), transparent 50%) border-box;
  mask: linear-gradient(transparent), linear-gradient(black);
  mask-clip: padding-box, border-box;
  mask-composite: subtract;
  filter: saturate(2) brightness(1);
}

/* Sharper bright glow — accentuates the shine */
.glow-bright {
  border-width: 5px;
  border-radius: calc(var(--radius) + 2px);
  inset: -7px;
  filter: blur(2px) brightness(0.66);
}
```

### Animated reveal — flicker-on glow

```css
@keyframes glow {
  0% {
    opacity: 0;
  }
  3% {
    opacity: 1;
  }
  10% {
    opacity: 0;
  }
  12% {
    opacity: 0.7;
  }
  16% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

@keyframes glowoff {
  to {
    opacity: 0;
  }
}

/* Staggered delays for organic reveal */
.panel.open .shine {
  animation: glow 2s var(--ease) both;
}
.panel.open .glow {
  animation: glow 1s var(--ease) 0.2s both;
}
.panel.open .glow-bright {
  animation: glow 1.5s var(--ease) 0.1s both;
}
```

The flicker pattern (on → off → partial → full) simulates a neon tube or fluorescent light warming up.

### Input field inside glass panel

```css
.glass-panel input {
  border: 1px solid hsl(var(--hue2) 13% 18.5% / 0.5);
  background: linear-gradient(to bottom, hsl(var(--hue1) 20% 20% / 0.1) 50%, hsl(var(--hue1) 50% 50% / 0.8) 180%);
  background-size: 100% 300%;
  background-position: 0% 0%;
  border-radius: calc(var(--radius) * 0.333);
  transition: all 0.3s var(--ease);
}

.glass-panel input:focus {
  border-color: hsl(var(--hue1) 20% 70% / 0.5);
  background-position: 0% 50%; /* Slides gradient up on focus */
}
```

### List items with animated @property background

```css
@property --item-opacity {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

.glass-panel li {
  --item-hue: var(--hue2);
  border: 1px solid transparent;
  border-radius: calc(var(--radius) * 0.333);
  background: linear-gradient(90deg in oklch, hsl(var(--item-hue) 29% 13% / var(--item-opacity)), hsl(var(--item-hue) 30% 15% / var(--item-opacity)) 24% 32%, hsl(var(--item-hue) 5% 7% / 0) 95%)
    border-box;
  transition:
    all 0.3s ease-in,
    --item-opacity 0.3s ease-in;
}

/* Border via mask-composite subtract */
.glass-panel li::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: inherit;
  background: linear-gradient(90deg in oklch, hsl(var(--item-hue) 15% 16% / var(--item-opacity)), hsl(var(--item-hue) 40% 24% / var(--item-opacity)) 20% 32%, hsl(var(--item-hue) 2% 12% / 0) 95%)
    border-box;
  mask: linear-gradient(transparent), linear-gradient(to right, black, transparent);
  mask-clip: padding-box, border-box;
  mask-composite: subtract;
}

.glass-panel li:hover {
  --item-opacity: 0.5;
  transition:
    all 0.1s ease-out,
    --item-opacity 0.1s ease-out;
  color: white;
}
```

---

## 23.5 Glass Icon / Tile — Box-Shadow Stack + Backdrop-Filter

Large glass icon with 10-layer box-shadow creating convex curvature illusion. Suitable for app icons, tiles, and featured cards.

### Construction

```css
.glass-icon {
  width: 15.5em;
  height: 15.5em;
  border-radius: 3.25em;
  background-image: linear-gradient(hsla(0, 0%, 0%, 0.2), hsla(0, 0%, 0%, 0));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### Shadow stack anatomy (10 layers)

```css
.glass-icon {
  box-shadow:
    /* 1. Top edge catch — dark line at top from light above */
    0 -0.125em 0.25em hsla(0, 0%, 0%, 0.2),
    /* 2. Bottom rim glow — colored light bleeding from under */ 0 0.25em 0.25em hsla(var(--h), var(--s), var(--l), 0.5),
    /* 3. Border ring — solid colored outline */ 0 0 0 0.25em hsla(var(--h), var(--s), var(--l), 0.5),
    /* 4. Inner top glow — light entering from top */ 0 0.375em 0.5em hsla(var(--h), var(--s), var(--l), 0.5) inset,
    /* 5. Inner bottom catch — secondary internal reflection */ 0 -0.125em 0.375em hsla(var(--h), var(--s), var(--l), 0.4) inset,
    /* 6. Deep inner glow — ambient colored light inside glass */ 0 -1.25em 2em 0.5em hsla(var(--h), var(--s), var(--l), 0.3) inset,
    /* 7. Top internal reflection — convex surface simulation */ 0 1.25em 0 hsla(var(--h), var(--s), var(--l), 0.3) inset,
    /* 8. Cast shadow — ground shadow below icon */ 0 5em 3em hsla(0, 0%, 0%, 0.4);
}
```

### Caustic reflection (::before)

The light pool below the glass icon — focused light passing through:

```css
.glass-icon::before {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  width: 9em;
  height: 3em;
  transform: translateX(-50%);
  background: radial-gradient(100% 100% at center, hsla(var(--h), var(--s), 80%, 0.25), hsla(var(--h), var(--s), 80%, 0) 50%);
}
```

### Glass glyph pieces (inner decorative elements)

Each piece is a rotated square with directional gradient + matching shadow direction:

```css
.glass-glyph-piece {
  width: 2.25em;
  height: 2.25em;
  border-radius: 0.25em;
  position: absolute;
  bottom: 50%;
  right: 50%;
  transform: rotate(45deg) translate(-0.25em, -0.25em);
  transform-origin: 100% 100%;

  /* Gradient direction matches rotation */
  background-image: linear-gradient(-45deg, hsla(var(--h), var(--s), var(--l), 0.8), hsla(var(--h), var(--s), var(--l), 0.2) 67%);

  box-shadow:
    /* Inner specular highlight */
    -0.125em -0.125em 0.25em hsla(var(--h), var(--s), var(--l), 0.5) inset,
    /* Inner depth shading */ 0.3em 0.3em 0 hsla(var(--h), var(--s), var(--l), 0.2) inset,
    /* Cast shadow */ 0.375em 0.375em 0.5em hsla(0, 0%, 0%, 0.3),
    /* Colored glow (caustic from piece) */ 0.5em 0.5em 0.75em hsla(var(--h), var(--s), 80%, 0.7);
}

/* Each rotation (90deg increments) flips the gradient + shadow direction */
.glass-glyph-piece:nth-child(2) {
  background-image: linear-gradient(-135deg, ...);
  box-shadow:
    -0.125em 0.125em... inset,
    0.3em -0.3em... inset,
    0.375em -0.375em...,
    0.5em -0.5em...;
  transform: rotate(135deg) translate(-0.25em, -0.25em);
}
/* :nth-child(3) = 225deg, :nth-child(4) = 315deg — same pattern */
```

### HSL variable system for tinting

```css
:root {
  --h: 33; /* Hue — amber by default */
  --s: 90%; /* Saturation */
  --l: 90%; /* Lightness */
}
```

Change `--h` to shift the entire glass color: 0=red, 120=green, 200=blue, 280=purple.

---

## 23.6 Glass Sphere — Multi-Gradient Radial Construction

Pure CSS glass sphere using 15+ stacked `radial-gradient` layers for light, shadow, specular highlights, and refraction patterns. No backdrop-filter — entirely gradient-based.

**When to use:** Decorative glass orbs, marble effects, crystal ball UI elements, glass bead indicators.

### Sphere body

```css
.sphere {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  position: relative;
}

/* The sphere ::before is the main visible element */
.sphere::before {
  content: "";
  width: 300px;
  height: 300px;
  border-radius: 50%;
  position: absolute;
  background-color: rgb(148, 147, 143); /* Base glass tint */
}
```

### Gradient stack (15 layers)

The background-image stack on `::before` builds the sphere optics:

```css
.sphere::before {
  background-image:
    /* === SPECULAR HIGHLIGHT (top) === */
    /* 1. Primary shine — small bright point */
    radial-gradient(circle, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1) 25%, transparent 50%),
    /* === LIGHT REFRACTION (bottom half) === */ /* 2-5. Small refracted light spots */ radial-gradient(ellipse, rgba(210, 210, 210, 0.7), transparent 50%),
    radial-gradient(ellipse, rgba(210, 210, 210, 0.7), transparent 50%),
    radial-gradient(ellipse, rgba(255, 255, 255, 0.7), transparent 50%),
    radial-gradient(ellipse, rgba(255, 255, 255, 0.7), transparent 50%),
    /* 6-9. Large refracted light areas */ radial-gradient(ellipse, rgba(255, 255, 255, 0.4), transparent 50%),
    radial-gradient(ellipse, rgba(255, 255, 255, 0.5), transparent 50%),
    radial-gradient(ellipse, rgba(255, 255, 255, 0.7), transparent 50%),
    radial-gradient(ellipse, rgba(255, 255, 255, 0.5), transparent 50%),
    /* === SHADOW REGIONS === */ /* 10-11. Shadow crescent (opposite light source) */ radial-gradient(ellipse, rgba(0, 0, 0, 0.1), transparent 60%),
    radial-gradient(ellipse, rgba(0, 0, 0, 0.2), transparent 60%),
    /* 12-13. Dark rim areas */ radial-gradient(ellipse, rgba(57, 57, 57, 0.5), transparent 50%),
    radial-gradient(ellipse, rgba(57, 57, 57, 0.5), transparent 50%),
    /* 14-15. Mid-tone transitional areas */ radial-gradient(ellipse, rgba(109, 109, 109, 0.1), transparent 50%),
    radial-gradient(ellipse, rgba(121, 121, 121, 0.2), transparent 50%);
}
```

### Gradient positioning map

Each gradient has a specific size and position to simulate real light behavior:

```css
.sphere::before {
  background-size:
    /* Shine */
    100px 100px,
    /* Light small */ 100px 100px,
    100px 100px,
    100px 100px,
    100px 100px,
    /* Light large */ 200px 200px,
    200px 200px,
    200px 200px,
    200px 200px,
    /* Dark */ 100px 100px,
    120px 120px,
    120px 120px,
    120px 120px,
    120px 120px,
    120px 120px;

  background-position:
    /* Shine */
    58% -5%,
    /* Light small */ -15% 90%,
    -5% 100%,
    5% 110%,
    20% 120%,
    /* Light large */ -70% 170%,
    -35% 210%,
    -10% 215%,
    80% 225%,
    /* Dark */ -35% 25%,
    -10% -30%,
    135% 15%,
    80% -45%,
    15% 40%,
    75% 80%;

  background-repeat: no-repeat;
}
```

**Pattern:** Light spots cluster in the bottom half (refracted light exits below center). Dark spots cluster in the upper-left quadrant (shadow side opposite the light source).

### Rim shadow (inset box-shadow, 7 layers)

```css
.sphere::before {
  box-shadow:
    /* 1. Sharp rim — edge catch from light */
    inset -5px 5px 8px 0px rgba(0, 0, 0, 0.15),
    /* 2. Wide rim shadow — atmospheric occlusion */ inset -30px 15px 20px -10px rgba(0, 0, 0, 0.2),
    /* 3. Deep ambient — overall concavity */ inset -10px 10px 30px 5px rgba(0, 0, 0, 0.2),
    /* 4. Soft edge shadow */ inset -10px 10px 10px -5px rgba(0, 0, 0, 0.1),
    /* 5. Bright rim highlight (opposite side) */ inset 12px -20px 5px -21px rgba(255, 255, 255, 0.8),
    /* 6. Secondary rim highlight */ inset 10px -30px 20px -20px rgba(255, 255, 255, 0.5),
    /* 7. Internal depth tint */ inset 50px -50px 20px -10px rgba(108, 108, 108, 0.15);
}
```

### Specular highlight (::after)

The sharp specular reflection on the upper surface:

```css
.sphere::after {
  content: "";
  width: 60px;
  height: 80px;
  border-radius: 40px 0 0 0 / 15px 0 0 0;
  position: absolute;
  transform: perspective(100px) scaleY(0.5) rotateX(-5deg) rotateY(-15deg) rotateZ(25deg);
  background-color: white;
  background-image: linear-gradient(to right, transparent 20%, rgba(255, 255, 255, 0.5) 50%, transparent 100%), linear-gradient(to top, transparent 70%, rgba(0, 0, 0, 0.4) 80%, transparent 90%);
  filter: blur(0.5px);
}
```

**Key:** The `perspective(100px)` + multiple rotations give the highlight a 3D warp, making it appear to sit on a curved surface rather than flat.

### Refraction distortion (body element)

The body element (behind `::before`) creates the neck/stem distortion effect seen through the sphere:

```css
.sphere-body {
  width: 200px;
  height: 300px;
  border-radius: 50% 50% 30% 30%;
  background-image: radial-gradient(ellipse at top center, rgba(255, 255, 255, 1), transparent 50%);
  background-size: 150px 300px;
  background-position: 10px 0px;
  background-repeat: no-repeat;
  box-shadow:
    -5px -60px 20px 5px rgba(0, 0, 0, 0.4),
    inset 0px 50px 20px -15px rgba(0, 0, 0, 0.4);
}
```

---

## 23.7 Glass Bead / Marble — Layered Div Construction

Alternative to the all-gradient approach. Uses multiple overlapping `<div>` elements, each responsible for one optical layer. Easier to animate and modify individually.

### Layer architecture

```
div.outer.shadow      — z:-1  Ground shadow (blurred, perspective-rotated)
div.glass.bead        — z:2   Base sphere (colored, semi-transparent)
div.rim.shadow        — z:3   Rim shadows + highlights (inset box-shadow)
div.inner.shadow      — z:3   Internal color shadow (blurred)
div.inner.shadow.two  — z:3   Deeper color concentration
div.inner.highlight   — z:4   Specular highlight spots (white, blurred)
div.crop              — z:4   Clip mask (crops excess from inner layers)
div.outer.highlight   — z:1   Caustic light below sphere
```

### Base bead

```css
.glass.bead {
  position: absolute;
  z-index: 2;
  width: 450px;
  height: 450px;
  background: var(--base-color); /* e.g. #ffc3d98a — semi-transparent pink */
  border-radius: 50%;
}
```

### Rim shadow (4-layer inset)

```css
.rim.shadow {
  position: absolute;
  z-index: 3;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  box-shadow:
    inset -20px -15px 20px rgba(255, 255, 255, 0.308),
    inset -1px -1px 40px rgb(255, 255, 255),
    inset 20px 20px 30px var(--darker-shadow),
    inset 10px 10px 10px var(--darkest-shadow);
}
```

### Inner shadows (blurred color concentration)

```css
.inner.shadow {
  position: absolute;
  left: 5px;
  top: 2px;
  z-index: 3;
  width: 360px;
  height: 360px;
  background: var(--base-shadow); /* e.g. #ff93b9 */
  border-radius: 50%;
  filter: blur(40px);
}

.inner.shadow.two {
  left: 100px;
  top: 100px;
  width: 150px;
  height: 150px;
  background: var(--darkest-shadow); /* e.g. #f01260f3 */
  filter: blur(50px);
}
```

### Specular highlights (white spots)

```css
.inner.highlight.one {
  position: absolute;
  z-index: 4;
  left: 70px;
  top: 140px;
  width: 25px;
  height: 30px;
  background: var(--lightest); /* white */
  border-radius: 50%;
  transform: rotate(30deg);
  filter: blur(8px);
}

.inner.highlight.two {
  left: 120px;
  top: 50px;
  width: 30px;
  height: 80px;
  background: var(--lightest);
  border-radius: 50%;
  transform: rotate(50deg);
  filter: blur(8px);
}
```

### Clipping mask

```css
.crop {
  position: absolute;
  z-index: 4;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  box-shadow: -200px -200px 20px 0 var(--lightest);
  /* The huge offset shadow creates a mask that clips
     the inner highlights to stay within the sphere bounds */
}
```

### Caustic + ground shadow

```css
/* Caustic — focused light below */
.outer.highlight {
  position: absolute;
  top: 400px;
  left: 160px;
  z-index: 1;
  width: 200px;
  height: 100px;
  background: #ffe7f0;
  filter: blur(30px);
  border-radius: 50%;
  transform: rotateX(50deg); /* Flattens into an ellipse on the ground */
}

/* Ground shadow */
.outer.shadow {
  position: absolute;
  top: 300px;
  left: 30px;
  z-index: -1;
  width: 400px;
  height: 400px;
  background: linear-gradient(180deg, #ff4184d7 20%, #fd2d765b, var(--lightest));
  filter: blur(60px);
  border-radius: 50%;
  transform: rotateX(50deg);
}
```

### CSS variable system

```css
:root {
  --base-color: #ffc3d98a; /* Sphere body — semi-transparent */
  --base-shadow: #ff93b9; /* Inner shadow color */
  --darker-shadow: #f01260f3; /* Deep shadow */
  --darkest-shadow: #fd4686; /* Core shadow */
  --base-highlight: #ff86b1; /* Highlight tint */
  --lighter-highlight: #ffc8dc; /* Lighter tint */
  --lightest: #ffffff; /* Pure white */
}
```

---

## 23.8 SVG Filter Glass — Displacement, RGB Split, Warp

Advanced glass effects using SVG filters applied via `backdrop-filter: url(#filter)`. Creates physical glass distortions impossible with CSS alone: refraction warp, chromatic aberration, and displacement mapping.

### SVG filter definitions

Define these in the HTML (or inline SVG) — they become referenceable by CSS:

**Standard glass distortion:**

```xml
<svg class="filter" xmlns="http://www.w3.org/2000/svg">
  <filter id="filter">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01"
                  numOctaves="4" seed="2" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise"
                       scale="15" xChannelSelector="R"
                       yChannelSelector="G" />
  </filter>
</svg>
```

**Warp glass (stronger distortion):**

```xml
<svg class="filter" xmlns="http://www.w3.org/2000/svg">
  <filter id="warp">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02"
                  numOctaves="3" seed="5" result="warpNoise" />
    <feDisplacementMap in="SourceGraphic" in2="warpNoise"
                       scale="25" xChannelSelector="R"
                       yChannelSelector="B" />
  </filter>
</svg>
```

**Chromatic RGB split:**

```xml
<svg class="filter" xmlns="http://www.w3.org/2000/svg">
  <filter id="rgb-split">
    <feOffset in="SourceGraphic" dx="2" dy="0" result="red" />
    <feOffset in="SourceGraphic" dx="-2" dy="0" result="blue" />
    <feOffset in="SourceGraphic" dx="0" dy="0" result="green" />
    <feColorMatrix in="red" type="matrix"
      values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
      result="redOnly" />
    <feColorMatrix in="green" type="matrix"
      values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
      result="greenOnly" />
    <feColorMatrix in="blue" type="matrix"
      values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
      result="blueOnly" />
    <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
    <feBlend in="rg" in2="blueOnly" mode="screen" />
  </filter>
</svg>
```

### CSS application

```css
/* Standard frosted glass with distortion */
.glass-distort {
  backdrop-filter: url(#filter) saturate(var(--saturation, 1));
}

/* Warped thick glass */
.glass-warp {
  backdrop-filter: url(#warp) saturate(var(--saturation, 1));
}

/* Chromatic aberration glass */
.glass-rgb {
  backdrop-filter: url(#rgb-split) saturate(var(--saturation, 1));
}
```

### Glass element styling (shared)

```css
.glass-effect {
  height: calc(var(--height) * 1px);
  width: calc(var(--width) * 1px);
  border-radius: calc(var(--radius) * 1px);
  z-index: 999999;
  background: light-dark(hsl(0 0% 100% / var(--frost, 0.5)), hsl(0 0% 0% / var(--frost, 0.5)));
  box-shadow:
    /* Inner edge highlights (2 layers) */
    0 0 2px 1px light-dark(color-mix(in oklch, canvasText, #0000 85%), color-mix(in oklch, canvasText, #0000 65%)) inset,
    0 0 10px 4px light-dark(color-mix(in oklch, canvasText, #0000 90%), color-mix(in oklch, canvasText, #0000 85%)) inset,
    /* External depth shadows (5 layers) */ 0px 4px 16px rgba(17, 17, 26, 0.05),
    0px 8px 24px rgba(17, 17, 26, 0.05),
    0px 0 8px rgba(17, 17, 26, 0.05),
    0px 8px 24px rgba(17, 17, 26, 0.2),
    0px 16px 56px rgba(17, 17, 26, 0.05),
    /* Internal depth shadows (3 layers) */ 0px 4px 16px rgba(17, 17, 26, 0.05) inset,
    0px 8px 24px rgba(17, 17, 26, 0.05) inset,
    0px 16px 56px rgba(17, 17, 26, 0.05) inset;
}
```

**Shadow anatomy: 10 total layers** — 2 inner edge highlights + 5 external progressive shadows + 3 internal depth shadows.

### Tuning parameters

| Parameter             | Effect                                | Range                         |
| --------------------- | ------------------------------------- | ----------------------------- |
| `--frost`             | Glass opacity (0 = clear, 1 = opaque) | 0.0 - 1.0                     |
| `--saturation`        | Color intensity through glass         | 0.5 - 2.0                     |
| `--height`, `--width` | Glass element dimensions              | px values                     |
| `--radius`            | Border radius                         | px values                     |
| `baseFrequency` (SVG) | Distortion pattern density            | 0.005 (subtle) - 0.05 (heavy) |
| `scale` (SVG)         | Distortion intensity                  | 5 (slight) - 40 (extreme)     |

### Light/dark mode support

The `light-dark()` function automatically adapts the glass:

- **Light mode:** White-tinted glass, shadows use `color-mix` with 85-90% transparency
- **Dark mode:** Black-tinted glass, shadows use `color-mix` with 65-85% transparency

```css
:root {
  color-scheme: light dark;
}
[data-theme="light"] {
  color-scheme: light only;
}
[data-theme="dark"] {
  color-scheme: dark only;
}
```

---

## 23.9 Glass Select / Dropdown — Full Glass UI Component

Production pattern for a glass-styled `<select>` element with frosted glass options panel, using `appearance: base-select` (Chrome 2026+) with graceful fallback.

### Glass select foundation

```css
select {
  width: 460px;
  padding: 15px 0;
  border-radius: 30px;
  background: linear-gradient(0deg, #fff9 0px, #fff3 10px, #fff0, #fff0, #fff3 calc(100% - 10px), #fff9 100%), #9991;
  border: solid 2px #fff9;
  box-shadow:
    2px 2px 4px 0 #0006,
    -1px -1px 1px 0 #0002;
  color: #fff;
  font-size: 20px;
  text-shadow: 0px 0px 6px #000;
  cursor: pointer;
  outline: none;
}
```

**Background stack:**

1. Vertical gradient with bright edges (#FFF9) fading to transparent center — simulates glass edge catch
2. Base tint (#9991) — semi-transparent gray

### Hover state

```css
select:hover {
  background: linear-gradient(0deg, #fff9 0px, #fff3 10px, #fff0, #fff0, #fff3 calc(100% - 10px), #fff9 100%), #fff4; /* Brighter base — glass catches more light */
}
```

### Open state — expanded glass panel

```css
select:open {
  background: linear-gradient(0deg, #fff 0px, #fff3 25px, #fff0, #fff0, #fff3 calc(100% - 25px), #fff 100%), #fff4;
  max-height: 75vh;
  backdrop-filter: url(#glass);
}
```

### Foreground blur edges (scroll fade)

```css
.foregroundBlur {
  position: absolute;
  left: 2px;
  right: 2px;
  z-index: 5;
  height: 30px;
}

#fTop {
  top: 2px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  mask: linear-gradient(black, black, transparent);
  backdrop-filter: blur(8px);
}

#fBottom {
  bottom: 2px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  mask: linear-gradient(transparent, black, black);
  backdrop-filter: blur(8px);
}
```

### Glass option cards

```css
select option {
  height: 120px;
  margin: 10px;
  padding-right: 25px;
  border-radius: 18px;
  border: solid 1px #0002;
  background-color: #0001;
  color: #ffffff;
  text-shadow: 0px 0px 4px #0008;
  box-shadow: 0px 0px 1px #0004;
  cursor: pointer;
  overflow-y: clip;
  outline: none;
}

option:hover,
option:focus {
  border: solid 1px #0004;
  background-color: #0003;
}
```

---

## 23.10 Glass Recipes Quick Reference

### Recipe 1: Simple frosted card (Tailwind)

```
backdrop-blur-xl bg-white/10 border border-white/20
shadow-[0_0.3px_0.7px_rgba(0,0,0,0.13),0_0.9px_1.7px_rgba(0,0,0,0.18),0_1.8px_3.5px_rgba(0,0,0,0.22),0_3.7px_7.3px_rgba(0,0,0,0.28),0_10px_20px_rgba(0,0,0,0.4)]
```

### Recipe 2: Dark glass panel (Tailwind)

```
backdrop-blur-md bg-[hsl(220_25%_5%/0.66)]
border border-[hsl(222_12%_20%)]
shadow-[hsl(222_50%_2%)_0px_10px_16px_-8px,hsl(222_50%_4%)_0px_20px_36px_-14px]
```

### Recipe 3: Glass sphere base (inline style needed)

```css
style="
  border-radius: 50%;
  background: var(--base-color);
  box-shadow:
    inset -20px -15px 20px rgba(255,255,255,0.3),
    inset -1px -1px 40px white,
    inset 20px 20px 30px var(--shadow),
    inset 10px 10px 10px var(--dark-shadow);
"
```

### Recipe 4: Glass icon with caustic (inline style needed)

```css
style="
  border-radius: 3.25em;
  backdrop-filter: blur(12px);
  box-shadow:
    0 -0.125em 0.25em rgba(0,0,0,0.2),
    0 0.25em 0.25em hsla(var(--h),var(--s),var(--l),0.5),
    0 0 0 0.25em hsla(var(--h),var(--s),var(--l),0.5),
    0 0.375em 0.5em hsla(var(--h),var(--s),var(--l),0.5) inset,
    0 -0.125em 0.375em hsla(var(--h),var(--s),var(--l),0.4) inset,
    0 -1.25em 2em 0.5em hsla(var(--h),var(--s),var(--l),0.3) inset,
    0 1.25em 0 hsla(var(--h),var(--s),var(--l),0.3) inset,
    0 5em 3em rgba(0,0,0,0.4);
"
```

### Decision matrix

| Need                       | Technique                          | Section |
| -------------------------- | ---------------------------------- | ------- |
| Simple frosted panel       | Backdrop-filter blur               | 23.3    |
| No backdrop-filter support | Clip-path + duplicate background   | 23.2    |
| Dark UI menu/modal         | Dark glassmorphism + glow          | 23.4    |
| App icon / tile            | Box-shadow stack + backdrop-filter | 23.5    |
| Decorative sphere/orb      | Multi-gradient radial              | 23.6    |
| Animated marble/bead       | Layered div construction           | 23.7    |
| Physical refraction/warp   | SVG displacement filter            | 23.8    |
| Chromatic aberration       | SVG RGB split filter               | 23.8    |
| Glass form controls        | Glass select/dropdown              | 23.9    |
| Light + dark mode glass    | `light-dark()` + `color-scheme`    | 23.8    |
