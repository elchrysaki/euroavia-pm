# 13 — 3D Depth Techniques

> Central reference for creating physical depth and three-dimensionality in skeuomorphic UI.
> When a user says "3D effect", "depth", "relief", "raised", "recessed", or "protruding", this is the file to consult.

---

## 13.1 — Vocabulary Map

Users say many things when they want 3D. This table maps natural language to CSS techniques.

| User says                     | They mean                           | Primary technique                              | Secondary technique                  |
| ----------------------------- | ----------------------------------- | ---------------------------------------------- | ------------------------------------ |
| "3D effect"                   | Physical depth illusion             | Multi-layer shadow stack (§13.3)               | perspective + rotateX/Y (§13.4)      |
| "depth" / "profondeur"        | Element sits below/above surface    | Inset shadows (recess) or drop shadows (raise) | translateZ + preserve-3d (§13.4)     |
| "relief" / "embossed"         | Text or shape raised from surface   | Emboss/deboss text (§13.8)                     | Multi-directional border bevels      |
| "raised" / "protruding"       | Element pops out toward viewer      | Drop shadow stack 5+ layers (§13.3)            | perspective + slight rotateX (§13.4) |
| "recessed" / "inset" / "well" | Element sunk into surface           | Inset shadow stack 4+ layers                   | Inner border-bottom highlight        |
| "3D button"                   | Button with physical press feel     | Shadow state change rest→active (§13.5)        | translateY + shadow compression      |
| "flip card"                   | Card that rotates to show back      | rotateY(180deg) + backface-visibility (§13.6)  | preserve-3d container                |
| "parallax"                    | Layers move at different speeds     | translateZ + perspective (§13.11)              | scroll-driven transform              |
| "isometric"                   | 45° angled view of flat element     | rotateX + rotateY + skew (§13.7)               | preserve-3d + multiple faces         |
| "glass dome" / "bubble"       | Curved transparent surface          | Radial gradient + pseudo-element (§13.9)       | backdrop-filter blur                 |
| "3D text"                     | Text with physical thickness        | text-shadow stack (§13.8)                      | clip-path + gradient                 |
| "floating" / "levitating"     | Element hovering above surface      | Large blur drop shadow + translateY (§13.3)    | Animation: gentle bounce             |
| "pressed" / "pushed in"       | Element pushed into surface         | Inset shadows + translateY(1px) (§13.5)        | Reduced/inverted gradient            |
| "tilted" / "angled"           | Element rotated in 3D space         | perspective + rotateX/Y small angle (§13.4)    | transform-origin control             |
| "layered" / "stacked"         | Multiple planes at different depths | translateZ per layer (§13.10)                  | z-index + shadow progression         |

---

## 13.2 — The 3D Depth Spectrum

Not all "3D" is equal. Choose the right level for the component:

```
Level 1: Shadow Depth          Level 2: Surface Modeling       Level 3: CSS 3D Transforms
─────────────────────          ────────────────────────        ─────────────────────────
• box-shadow layers            • linear-gradient (curvature)   • perspective
• inset vs drop                • radial-gradient (dome)        • rotateX / rotateY / rotateZ
• graduated blur               • border bevels                 • translateZ
• NO actual 3D transforms      • ::before/::after highlights   • preserve-3d
                               • emboss/deboss text            • backface-visibility
BEST FOR:                      BEST FOR:                       BEST FOR:
buttons, cards, panels         knobs, gauges, glass            flip cards, parallax,
                               domes, curved surfaces          isometric views, 3D scenes
```

**Rule**: Levels 1-2 are always appropriate for skeuomorphic UI. Level 3 should be used sparingly — real hardware doesn't flip or rotate. Use Level 3 for special interactions (card reveals, parallax dashboards, hover tilts) not for static components.

---

## 13.3 — Multi-Layer Shadow Depth (Level 1)

The foundation of ALL skeuomorphic 3D. Shadows create depth without CSS 3D transforms.

### Principle: Graduated shadow progression

Each shadow layer simulates light being blocked at a different distance. Close shadows are tight and dark, far shadows are wide and faint.

```css
/* RAISING an element — 5-layer standard */
.raised-element {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    /* contact shadow — very tight */ 0 2px 4px rgba(0, 0, 0, 0.35),
    /* close shadow */ 0 4px 8px rgba(0, 0, 0, 0.3),
    /* near-mid */ 0 8px 16px rgba(0, 0, 0, 0.2),
    /* mid depth */ 0 16px 32px rgba(0, 0, 0, 0.1); /* ambient/far */
}

/* SINKING an element — 4-layer recess */
.recessed-well {
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.6),
    /* top lip shadow */ inset 0 -1px 3px rgba(0, 0, 0, 0.3),
    /* bottom ambient */ inset 2px 0 4px rgba(0, 0, 0, 0.4),
    /* left wall */ inset -2px 0 4px rgba(0, 0, 0, 0.4); /* right wall */
  /* Add bottom highlight to sell the recess: */
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
```

### Floating / Levitating effect

Extreme depth creates "floating" illusion:

```css
.floating-element {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.25),
    0 16px 32px rgba(0, 0, 0, 0.2),
    0 32px 64px rgba(0, 0, 0, 0.15),
    /* very far = floating high */ 0 48px 80px rgba(0, 0, 0, 0.08); /* ambient floor glow */
  transform: translateY(-4px); /* lift off surface */
}

/* Hover: float higher */
.floating-element:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 12px 24px rgba(0, 0, 0, 0.25),
    0 24px 48px rgba(0, 0, 0, 0.2),
    0 40px 80px rgba(0, 0, 0, 0.15),
    0 60px 100px rgba(0, 0, 0, 0.08);
  transform: translateY(-8px);
}
```

---

## 13.4 — CSS 3D Transforms: Perspective & Rotation (Level 3)

Use `perspective` on a parent to create a 3D rendering context. Child elements can then rotate and translate in 3D space.

### Core properties

```css
/* Parent establishes 3D context */
.scene {
  perspective: 800px; /* viewing distance — lower = more dramatic */
  perspective-origin: 50% 50%; /* vanishing point */
}

/* Child moves in 3D space */
.object {
  transform-style: preserve-3d; /* children inherit 3D context */
  transform: rotateX(5deg) rotateY(-3deg); /* tilt */
  backface-visibility: hidden; /* hide rear face if rotating */
}
```

### Subtle tilt on hover (great for cards and panels)

```css
.tiltable-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-style: preserve-3d;
}

/* Parent needs perspective */
.card-container {
  perspective: 1000px;
}

.tiltable-card:hover {
  transform: rotateX(2deg) rotateY(-3deg) translateZ(10px);
  /* Small angles = subtle tilt, not cartoon flip */
}
```

### Perspective shadow (one-sided depth)

Combine perspective with shadow for dramatic single-direction depth:

```css
.perspective-panel {
  transform: perspective(600px) rotateY(-2deg);
  box-shadow:
    4px 0 8px rgba(0, 0, 0, 0.3),
    /* shadow falls to the right */ 8px 0 16px rgba(0, 0, 0, 0.2),
    12px 0 24px rgba(0, 0, 0, 0.1);
  /* Left edge catches light */
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}
```

### perspective values guide

| Value       | Effect                          | Use for                           |
| ----------- | ------------------------------- | --------------------------------- |
| 200-400px   | Extreme distortion, fish-eye    | Dramatic reveals, hero animations |
| 600-800px   | Natural depth, noticeable 3D    | Card tilts, panel angles          |
| 1000-1500px | Subtle, barely perceptible      | Hover effects, parallax layers    |
| 2000px+     | Almost flat, minimal distortion | Very subtle ambient movement      |

---

## 13.5 — 3D Button Press Effect (Level 1+2)

The most common "3D effect" request. A button that physically presses into the surface.

### Complete implementation

```css
.press-button {
  /* Surface modeling — convex top surface */
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, /* top surface catches light */ transparent 40%, rgba(0, 0, 0, 0.15) 100% /* bottom edge in shadow */),
    linear-gradient(145deg, #2a2a2a, #1a1a1a);

  /* Raised state — shadows underneath */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    /* top edge highlight */ inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    /* bottom edge dark */ 0 2px 4px rgba(0, 0, 0, 0.4),
    /* close contact */ 0 4px 8px rgba(0, 0, 0, 0.3),
    /* near shadow */ 0 8px 16px rgba(0, 0, 0, 0.2),
    /* mid shadow */ 0 12px 24px rgba(0, 0, 0, 0.1); /* far ambient */

  /* Bevel edges — top/left lit, bottom/right shadowed */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.4);
  border-right: 1px solid rgba(0, 0, 0, 0.2);

  transition: all 0.1s ease-out;
  cursor: pointer;
}

/* HOVER — lift slightly */
.press-button:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 3px 6px rgba(0, 0, 0, 0.4),
    0 6px 12px rgba(0, 0, 0, 0.3),
    0 12px 24px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.1);
}

/* ACTIVE — press into surface */
.press-button:active {
  transform: translateY(2px);

  /* Surface flips — concave (pressed in) */
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, /* top now in shadow */ transparent 40%, rgba(255, 255, 255, 0.03) 100% /* bottom edge catches reflected light */),
    linear-gradient(145deg, #1a1a1a, #222222);

  /* Shadows compress — element is now AT the surface */
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.5),
    /* pressed-in gorge */ inset 0 1px 2px rgba(0, 0, 0, 0.4),
    /* tight top shadow */ 0 1px 2px rgba(0, 0, 0, 0.3); /* minimal contact shadow */

  /* Borders flip — bottom/right now lit */
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  border-left: 1px solid rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  border-right: 1px solid rgba(255, 255, 255, 0.02);
}
```

### Key principle: shadow tells the story

| State    | Shadow behavior                           | Physical analog                  |
| -------- | ----------------------------------------- | -------------------------------- |
| Rest     | 5-6 layers underneath, graduated          | Button raised above panel        |
| Hover    | +1px lift, shadows expand                 | Finger approaching, button lifts |
| Active   | Shadows compress to 1-2 layers, add inset | Button pushed flush into panel   |
| Disabled | Shadows at 50% opacity, no interaction    | Dead mechanism                   |

---

## 13.6 — Card Flip Effect (Level 3)

Two-sided card that rotates to reveal a back face. Requires `preserve-3d`.

```css
/* Container sets 3D context */
.flip-container {
  perspective: 1000px;
  width: 300px;
  height: 200px;
}

/* Inner wrapper rotates */
.flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flip-container:hover .flip-inner {
  transform: rotateY(180deg);
}

/* Both faces share positioning */
.flip-front,
.flip-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
}

/* Front face — normal component */
.flip-front {
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Back face — pre-rotated 180° */
.flip-back {
  background: linear-gradient(145deg, #1a2a1a, #0a1a0a);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2);
  transform: rotateY(180deg);
}
```

**Skeuomorphic integration**: Add screws at corners that DON'T flip (they stay on the mounting plate). The card flips INSIDE its bezel frame.

---

## 13.7 — Isometric Cards (Level 3)

View cards at an angle to suggest 3D depth — popular for dashboards and data displays.

```css
/* Isometric container */
.isometric-grid {
  perspective: 1200px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  transform-style: preserve-3d;
}

/* Each card tilts slightly */
.iso-card {
  transform: rotateX(10deg) rotateY(-5deg);
  transform-origin: center center;
  transition: transform 0.4s ease;

  background: linear-gradient(145deg, #252525, #1a1a1a);
  border-radius: 12px;
  box-shadow:
    /* Right face shadow (from Y rotation) */
    4px 4px 8px rgba(0, 0, 0, 0.35),
    8px 8px 16px rgba(0, 0, 0, 0.25),
    /* Bottom face shadow (from X rotation) */ 0 6px 12px rgba(0, 0, 0, 0.3),
    /* Ambient */ 0 16px 32px rgba(0, 0, 0, 0.15);
  /* Left/top edges catch light */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
}

.iso-card:hover {
  transform: rotateX(0deg) rotateY(0deg) translateZ(20px);
  /* Flatten on hover for readability, lift toward viewer */
}
```

### Isometric depth with thickness

Add visible edge faces for real thickness:

```css
.thick-card {
  position: relative;
  transform: rotateX(10deg) rotateY(-8deg);
  transform-style: preserve-3d;
}

/* Right edge face */
.thick-card::after {
  content: "";
  position: absolute;
  top: 0;
  right: -8px;
  width: 8px;
  height: 100%;
  background: linear-gradient(90deg, #1a1a1a, #111111);
  transform: rotateY(90deg);
  transform-origin: left;
  border-right: 1px solid rgba(0, 0, 0, 0.5);
}

/* Bottom edge face */
.thick-card::before {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(180deg, #181818, #0e0e0e);
  transform: rotateX(-90deg);
  transform-origin: top;
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
}
```

---

## 13.8 — Emboss & Deboss Text (Level 2)

Physical text effects without 3D transforms. Text appears carved into or raised from a surface.

### Embossed text (raised from surface)

```css
.embossed-text {
  color: transparent;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0.1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  /* Shadow below text = raised */
  text-shadow:
    0 1px 1px rgba(0, 0, 0, 0.5),
    /* contact shadow */ 0 2px 3px rgba(0, 0, 0, 0.3); /* depth shadow */
  font-weight: 700;
  letter-spacing: 0.05em;
}
```

### Debossed / engraved text (cut into surface)

```css
.engraved-text {
  color: rgba(0, 0, 0, 0.6); /* dark — inside the groove */
  text-shadow:
    0 1px 0 rgba(255, 240, 220, 0.15),
    /* highlight BELOW text = light hitting bottom edge of groove */ 0 -1px 0 rgba(0, 0, 0, 0.3); /* shadow ABOVE text = top edge casting shadow */
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

### Silkscreen printed text (painted on surface)

```css
.silkscreen-text {
  color: rgba(255, 255, 255, 0.6);
  text-shadow:
    0 0 1px rgba(0, 0, 0, 0.8),
    /* ink spread */ 0 1px 2px rgba(0, 0, 0, 0.4); /* painted shadow */
  font-family: "Arial", sans-serif;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 10px;
}
```

### Deep 3D text (multiple shadow layers for thickness)

```css
.deep-3d-text {
  color: #2a2a2a;
  text-shadow:
    0 1px 0 #1f1f1f,
    /* layer 1 */ 0 2px 0 #1a1a1a,
    /* layer 2 */ 0 3px 0 #151515,
    /* layer 3 */ 0 4px 0 #111111,
    /* layer 4 — deepest edge */ 0 5px 5px rgba(0, 0, 0, 0.4),
    /* contact shadow */ 0 8px 12px rgba(0, 0, 0, 0.3); /* ambient shadow */
  font-size: 3rem;
  font-weight: 900;
}
```

---

## 13.9 — Glass Dome / Bubble Effect (Level 2)

Curved transparent surface over content — gives the illusion of a glass cover.

```css
.glass-dome {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

/* Glass curvature — highlight at top-left */
.glass-dome::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(255, 255, 255, 0.25) 0%,
    /* bright specular hotspot */ rgba(255, 255, 255, 0.08) 30%,
    /* diffuse highlight */ transparent 60% /* fades to transparent */
  );
  pointer-events: none;
  z-index: 2;
}

/* Glass edge refraction */
.glass-dome::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  /* Inner rim highlight */
  box-shadow:
    inset 0 -4px 8px rgba(0, 0, 0, 0.4),
    /* bottom shadow inside dome */ inset 0 2px 4px rgba(255, 240, 220, 0.1); /* top warm catch */
  pointer-events: none;
  z-index: 3;
}
```

### Flat glass panel (for instrument displays)

```css
.glass-panel {
  position: relative;
  overflow: hidden;
}

.glass-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.03) 100%);
  pointer-events: none;
  z-index: 10;
}
```

---

## 13.10 — Layered Depth Composition (Level 2+3)

Stack multiple DOM layers at different visual depths. Each layer has progressively stronger shadows.

### Depth layers with translateZ

```css
.depth-scene {
  perspective: 800px;
  transform-style: preserve-3d;
}

/* Background layer — furthest back */
.layer-bg {
  transform: translateZ(-50px) scale(1.1);
  /* scale compensates for perspective shrink */
  filter: brightness(0.6);
  box-shadow: none; /* no shadow — it IS the surface */
}

/* Mid layer */
.layer-mid {
  transform: translateZ(0px);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Foreground layer — closest to viewer */
.layer-fg {
  transform: translateZ(40px);
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.4),
    /* strong close shadow */ 0 16px 32px rgba(0, 0, 0, 0.3),
    0 24px 48px rgba(0, 0, 0, 0.15); /* wide ambient */
}
```

### Shadow-only depth layers (no transforms — more compatible)

```css
/* Layer 0 — sunken surface */
.depth-0 {
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
  background: #0a0a0a;
}

/* Layer 1 — at surface */
.depth-1 {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);
  background: #181818;
}

/* Layer 2 — slightly raised */
.depth-2 {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.35),
    0 4px 8px rgba(0, 0, 0, 0.25),
    0 8px 16px rgba(0, 0, 0, 0.15);
  background: #222222;
}

/* Layer 3 — floating */
.depth-3 {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    0 16px 32px rgba(0, 0, 0, 0.2),
    0 24px 48px rgba(0, 0, 0, 0.1);
  background: #2a2a2a;
}
```

**Pattern**: Each depth level adds ~2 shadow layers AND lightens the background by ~#08-#0c hex.

---

## 13.11 — Parallax Depth Layers (Level 3)

Multiple layers moving at different speeds on scroll or mouse movement, creating depth perception.

### Scroll-driven parallax (CSS-only)

```css
.parallax-container {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 1px; /* KEY — creates depth rendering */
  perspective-origin: 50% 50%;
}

/* Far layer — moves slowly */
.parallax-far {
  transform: translateZ(-2px) scale(3);
  /* scale(3) compensates for perspective shrink at Z=-2 */
  position: absolute;
  inset: 0;
  z-index: -2;
}

/* Mid layer */
.parallax-mid {
  transform: translateZ(-1px) scale(2);
  position: absolute;
  inset: 0;
  z-index: -1;
}

/* Near layer — normal speed (no transform needed) */
.parallax-near {
  position: relative;
  z-index: 1;
}
```

### Mouse-tracked parallax (JavaScript)

```javascript
// Apply to a container with data-depth attributes on children
function initParallax(container) {
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    container.querySelectorAll("[data-depth]").forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth);
      const moveX = x * depth * 30; // pixels of movement
      const moveY = y * depth * 30;
      layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
}
```

```html
<div class="parallax-scene" onmousemove="...">
  <div data-depth="0.2" class="layer-bg"><!-- background --></div>
  <div data-depth="0.5" class="layer-mid"><!-- mid elements --></div>
  <div data-depth="1.0" class="layer-fg"><!-- foreground --></div>
</div>
```

---

## 13.12 — @property Animations for 3D (Level 2)

CSS `@property` enables smooth gradient and shadow animations that create dynamic 3D effects.

### Animated specular sweep

```css
@property --specular-x {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 30%;
}
@property --specular-y {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 20%;
}

.animated-surface {
  background: radial-gradient(circle at var(--specular-x) var(--specular-y), rgba(255, 240, 220, 0.15) 0%, transparent 50%), linear-gradient(145deg, #2a2a2a, #1a1a1a);
  transition:
    --specular-x 0.6s,
    --specular-y 0.6s;
}

.animated-surface:hover {
  --specular-x: 70%;
  --specular-y: 60%;
  /* Specular highlight smoothly moves across surface */
}
```

### Animated depth (shadow expansion)

```css
@property --shadow-depth {
  syntax: "<length>";
  inherits: false;
  initial-value: 8px;
}

.depth-animated {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 var(--shadow-depth) calc(var(--shadow-depth) * 2) rgba(0, 0, 0, 0.25),
    0 calc(var(--shadow-depth) * 2) calc(var(--shadow-depth) * 4) rgba(0, 0, 0, 0.15);
  transition: --shadow-depth 0.4s ease;
}

.depth-animated:hover {
  --shadow-depth: 16px;
  /* Shadows expand = element rises */
}
```

### Animated gradient angle (surface rotation)

```css
@property --light-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 145deg;
}

.rotating-surface {
  background: linear-gradient(var(--light-angle), rgba(255, 255, 255, 0.08) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%), #222;
  transition: --light-angle 0.8s ease;
}

.rotating-surface:hover {
  --light-angle: 215deg;
  /* Light appears to shift direction */
}
```

---

## 13.13 — Combining Techniques: Complete 3D Component

This example combines shadow depth + surface modeling + glass dome + embossed label + 3D hover tilt:

```css
/* Container with perspective context */
.instrument-pod {
  perspective: 1000px;
}

/* The gauge instrument */
.gauge {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;

  /* Level 1 — Shadow depth (8 layers = advanced) */
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    inset 2px 0 3px rgba(0, 0, 0, 0.4),
    inset -2px 0 3px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.1);

  /* Level 2 — Surface modeling */
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  /* Level 3 — Hover tilt */
  transition: transform 0.3s ease;
  transform-style: preserve-3d;
}

.gauge:hover {
  transform: rotateX(3deg) rotateY(-2deg) translateZ(5px);
}

/* Glass dome over gauge */
.gauge::before {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: radial-gradient(ellipse at 35% 25%, rgba(255, 240, 220, 0.2) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%);
  z-index: 10;
  pointer-events: none;
}

/* Rim light */
.gauge::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3), transparent 70%);
  border-radius: 50%;
  z-index: 11;
  pointer-events: none;
}

/* Embossed label on bezel */
.gauge-label {
  color: rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 0 rgba(255, 240, 220, 0.12);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 9px;
}
```

---

## 13.14 — Cross-References to Other Files

| Technique            | Also covered in                           | What that file adds                                       |
| -------------------- | ----------------------------------------- | --------------------------------------------------------- |
| Shadow stacks        | `00-golden-examples.md`                   | Production-tested stacks (5/8/13/31 layers)               |
| Surface gradients    | `01-shadows-materials-textures.md`        | 16 material gradients (chrome, leather, wood)             |
| Glass effects        | `07-glass-effects.md`                     | 10 specialized glass techniques (frosted, dark, SVG warp) |
| Metal effects        | `08-metal-effects.md`                     | 8 metal finishes (brushed, chrome, gold, conic)           |
| Rim light            | `09-rim-light-effects.md`                 | 4-layer rim light system                                  |
| 3D perspective glow  | `04-community-techniques.md` §14.78       | Animated 3D orbiting light                                |
| 3D capsule button    | `04-community-techniques.md` §14.5        | Capsule shape with perspective                            |
| Isometric cube mixin | `04-community-techniques.md` §14.91       | Full 6-face SCSS cube system                              |
| 3D toolbar button    | `04-community-techniques.md` §14.35       | Toolbar button with perspective                           |
| Perspective shadow   | `04-community-techniques.md` (line ~5800) | Curled paper / one-sided depth                            |
| Deep CRT chassis     | `assets/codepen-deep-screen.html`         | 31-layer ultra shadow stack                               |
| Power button dome    | `assets/power-button.html`                | 17-layer button with LED glow                             |
