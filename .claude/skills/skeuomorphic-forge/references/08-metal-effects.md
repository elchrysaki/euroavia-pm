# Section 24 — Metal Effects

Comprehensive metal simulation techniques for CSS. Covers brushed metal surfaces, chrome text, gold/silver/bronze/platinum borders, metallic buttons with conic gradients, and procedural metal textures.

---

## 24.1 Metal Physics Primer

Real metal has 3 visual properties that CSS must simulate:

| Property                   | Physical behavior                     | CSS technique                                                                                     |
| -------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Anisotropic reflection** | Light stretches along brush direction | `repeating-linear-gradient` or `repeating-radial-gradient` with fine alternating light/dark lines |
| **Specular highlight**     | Bright concentrated reflection band   | Hard gradient stop (light → dark at 47%-53%) or `conic-gradient` with white stops                 |
| **Depth/bevel**            | Raised or recessed surface edges      | Multi-layer `box-shadow` (inset + outer) with highlight on lit side, shadow on opposite           |

**Metal types and their gradient signatures:**

| Metal            | Base color      | Highlight       | Shadow          | Gradient character                        |
| ---------------- | --------------- | --------------- | --------------- | ----------------------------------------- |
| Chrome           | `#c0c0c0`       | `#ffffff`       | `#666666`       | Sharp alternating bands (6+ stops)        |
| Brushed aluminum | `hsl(0,0%,85%)` | `hsl(0,0%,95%)` | `hsl(0,0%,70%)` | Fine repeating lines + directional        |
| Gold             | `#f6d600`       | `#ffe800`       | `#8f653b`       | Warm gradient with brown shadows          |
| Silver           | `#d4d4d4`       | `#d9d9d9`       | `#bfbfbf`       | Subtle cool variation, narrow range       |
| Bronze/Copper    | `#ad3b36`       | `#d9543a`       | `#a4413c`       | Warm red-brown with orange highlights     |
| Rose Gold        | `#e5c9be`       | `#e7cac0`       | `#c5a399`       | Warm pink-beige, very narrow range        |
| Platinum         | `#e5e4e2`       | `#ffffff`       | `#e5e4e2`       | Nearly white, alternating bright/brighter |
| Black Metal      | `#76756e`       | `#e7e7e7`       | `#2d2c29`       | High contrast, dark base with bright edge |

---

## 24.2 Brushed Metal Button — Box-Shadow + Repeating Gradients

Production-grade metal button with 6-layer box-shadow bevel and repeating gradient brush texture. Two variants: radial (circular) and linear (rectangular).

### Foundation — shared metal base

```css
.metal {
  position: relative;
  outline: none;

  /* Text treatment — engraved look */
  font:
    bold 6em/2em "Helvetica Neue",
    Arial,
    sans-serif;
  text-align: center;
  color: hsla(0, 0%, 20%, 1);
  text-shadow:
    hsla(0, 0%, 40%, 0.5) 0 -1px 0,
    /* Bottom shadow — text sits in groove */ hsla(0, 0%, 100%, 0.6) 0 2px 1px; /* Top highlight — light catches top edge */

  /* Surface */
  background-color: hsl(0, 0%, 90%);

  /* 6-layer bevel system */
  box-shadow:
    inset hsla(0, 0%, 15%, 1) 0 0px 0px 4px,
    /* 1. Border — sharp dark edge */ inset hsla(0, 0%, 15%, 0.8) 0 -1px 5px 4px,
    /* 2. Soft inner shadow (bottom) */ inset hsla(0, 0%, 0%, 0.25) 0 -1px 0px 7px,
    /* 3. Bottom shadow deepening */ inset hsla(0, 0%, 100%, 0.7) 0 2px 1px 7px,
    /* 4. Top highlight — convex surface */ hsla(0, 0%, 0%, 0.15) 0 -5px 6px 4px,
    /* 5. Outer shadow (above) */ hsla(0, 0%, 100%, 0.5) 0 5px 6px 4px; /* 6. Outer highlight (below) */

  transition: color 0.2s;
}
```

**Shadow anatomy:**

- Layers 1-4 (inset): Create the beveled metal edge — dark border, soft shadow, deepened bottom, bright top
- Layers 5-6 (outer): Ground interaction — shadow above (recessed into surface) and highlight below (light reflecting off ground)

### Radial variant — circular brushed metal

```css
.metal.radial {
  width: 160px;
  height: 160px;
  line-height: 160px;
  border-radius: 80px;

  background-image:
    /* Edge highlights — 4 cardinal points (fake conical reflection) */
    radial-gradient(50% 0%, 8% 50%, hsla(0, 0%, 100%, 0.5) 0%, hsla(0, 0%, 100%, 0) 100%),
    radial-gradient(50% 100%, 12% 50%, hsla(0, 0%, 100%, 0.6) 0%, hsla(0, 0%, 100%, 0) 100%),
    radial-gradient(0% 50%, 50% 7%, hsla(0, 0%, 100%, 0.5) 0%, hsla(0, 0%, 100%, 0) 100%),
    radial-gradient(100% 50%, 50% 5%, hsla(0, 0%, 100%, 0.5) 0%, hsla(0, 0%, 100%, 0) 100%),
    /* Brush texture — 3 repeating radial layers at different frequencies */ repeating-radial-gradient(50% 50%, 100% 100%, hsla(0, 0%, 0%, 0) 0%, hsla(0, 0%, 0%, 0) 3%, hsla(0, 0%, 0%, 0.1) 3.5%),
    repeating-radial-gradient(50% 50%, 100% 100%, hsla(0, 0%, 100%, 0) 0%, hsla(0, 0%, 100%, 0) 6%, hsla(0, 0%, 100%, 0.1) 7.5%),
    repeating-radial-gradient(50% 50%, 100% 100%, hsla(0, 0%, 100%, 0) 0%, hsla(0, 0%, 100%, 0) 1.2%, hsla(0, 0%, 100%, 0.2) 2.2%),
    /* Base curvature — center-to-edge darkening */ radial-gradient(50% 50%, 200% 50%, hsla(0, 0%, 90%, 1) 5%, hsla(0, 0%, 85%, 1) 30%, hsla(0, 0%, 60%, 1) 100%);
}
```

**Brush texture construction (3 layers):**

1. Dark scratches (0.1 opacity black) — every 3-3.5% creates fine dark rings
2. Light scratches (0.1 opacity white) — every 6-7.5% creates broader light rings
3. Fine highlights (0.2 opacity white) — every 1.2-2.2% creates micro-detail

### Fake conical gradient (::before + ::after)

Real conical reflection on metal changes intensity as you move around the circumference. Simulated with rotated copies of cardinal-point radial gradients:

```css
.metal.radial::before,
.metal.radial::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  border-radius: inherit;

  background-image:
    radial-gradient(50% 0%, 10% 50%, hsla(0, 0%, 0%, 0.1) 0%, hsla(0, 0%, 0%, 0) 100%), radial-gradient(50% 100%, 10% 50%, hsla(0, 0%, 0%, 0.1) 0%, hsla(0, 0%, 0%, 0) 100%),
    radial-gradient(0% 50%, 50% 10%, hsla(0, 0%, 0%, 0.1) 0%, hsla(0, 0%, 0%, 0) 100%), radial-gradient(100% 50%, 50% 6%, hsla(0, 0%, 0%, 0.1) 0%, hsla(0, 0%, 0%, 0) 100%);
}
.metal.radial::before {
  transform: rotate(65deg);
}
.metal.radial::after {
  transform: rotate(-65deg);
}
```

**Key insight:** Three copies of the same 4-point gradient at 0deg, +65deg, and -65deg create 12 reflection zones — approximating a true conical metallic reflection.

### Linear variant — rectangular brushed metal

```css
.metal.linear {
  width: 100px;
  height: 80px;
  border-radius: 0.5em;
  font-size: 4em;

  background-image:
    /* Brush texture — horizontal lines */
    repeating-linear-gradient(left, hsla(0, 0%, 100%, 0) 0%, hsla(0, 0%, 100%, 0) 6%, hsla(0, 0%, 100%, 0.1) 7.5%),
    repeating-linear-gradient(left, hsla(0, 0%, 0%, 0) 0%, hsla(0, 0%, 0%, 0) 4%, hsla(0, 0%, 0%, 0.03) 4.5%),
    repeating-linear-gradient(left, hsla(0, 0%, 100%, 0) 0%, hsla(0, 0%, 100%, 0) 1.2%, hsla(0, 0%, 100%, 0.15) 2.2%),
    /* Curvature — vertical gradient light-dark-light */ linear-gradient(180deg, hsl(0, 0%, 78%) 0%, hsl(0, 0%, 90%) 47%, hsl(0, 0%, 78%) 53%, hsl(0, 0%, 70%) 100%);
}
```

**Curvature gradient:** The hard stop at 47%-53% creates the characteristic brushed metal specular band — bright center fading to darker edges.

### Active/pressed state — color shift to blue

```css
.metal:active {
  color: hsl(210, 100%, 40%);
  text-shadow:
    hsla(210, 100%, 20%, 0.3) 0 -1px 0,
    hsl(210, 100%, 85%) 0 2px 1px,
    hsla(200, 100%, 80%, 1) 0 0 5px,
    hsla(210, 100%, 50%, 0.6) 0 0 20px;

  box-shadow:
    inset hsla(210, 100%, 30%, 1) 0 0px 0px 4px,
    inset hsla(210, 100%, 15%, 0.4) 0 -1px 5px 4px,
    inset hsla(210, 100%, 20%, 0.25) 0 -1px 0px 7px,
    inset hsla(210, 100%, 100%, 0.7) 0 2px 1px 7px,
    hsla(210, 100%, 75%, 0.8) 0 0px 3px 2px,
    hsla(210, 50%, 40%, 0.25) 0 -5px 6px 4px,
    hsla(210, 80%, 95%, 1) 0 5px 6px 4px;
}
```

The entire bevel system shifts from neutral gray (`hsl(0,0%,...)`) to blue (`hsl(210,100%,...)`), simulating an illuminated/activated state.

---

## 24.3 Metallic Buttons — Conic Gradient Finish

Realistic metal buttons using `conic-gradient` with 28+ color stops for authentic metal surface variation. Each stop represents a different reflection angle as light wraps around the button.

### Gold button

```css
.metal-button-gold {
  width: 6.25em;
  height: 6.25em;
  border: solid 0.625em transparent; /* Border width = 10% of size */
  border-radius: 1.09em;
  padding: 3px;

  box-shadow:
    inset 0 0 0 1px #eedc00,
    /* Inner ring */ inset 0 1px 2px rgba(255, 255, 255, 0.5),
    /* Top highlight */ inset 0 -1px 2px rgba(0, 0, 0, 0.5); /* Bottom shadow */

  background:
    /* Surface — 28-stop conic gradient for realistic gold variation */
    conic-gradient(
        #edc800,
        #e3b600,
        #f3cf00,
        #ffe800,
        #ffe900,
        #ffeb00,
        #ffe000,
        #ebc500,
        #e0b100,
        #f1cc00,
        #fcdc00,
        #ffe500,
        #fad900,
        #eec200,
        #e7b900,
        #f7d300,
        #ffe800,
        #ffe300,
        #f5d100,
        #e6b900,
        #e3b600,
        #f4d000,
        #ffe400,
        #ebc600,
        #e3b600,
        #f6d500,
        #ffe900,
        #ffe90a,
        #edc800
      )
      content-box,
    /* Border fill — solid gold */ linear-gradient(#f6d600, #f6d600) padding-box,
    /* Ground shadow — radial below button */ radial-gradient(rgba(120, 120, 120, 0.9), rgba(120, 120, 120, 0) 70%) 50% bottom / 80% 7.5% no-repeat border-box;
}
```

**Conic gradient key:** The 28 stops oscillate between bright gold (`#ffe900`) and darker gold (`#e0b100`). The variation is irregular (not sinusoidal) — this irregularity creates the realistic "imperfect metal" look. Equal spacing would look artificial.

### Silver button

```css
.metal-button-silver {
  box-shadow:
    inset 0 0 0 1px #c9c9c9,
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.5);

  background:
    conic-gradient(
        #d7d7d7,
        #c3c3c3,
        #cccccc,
        #c6c6c6,
        #d3d3d3,
        #d8d8d8,
        #d5d5d5,
        #d8d8d8,
        #d3d3d3,
        #c5c5c5,
        #c0c0c0,
        #bfbfbf,
        #d0d0d0,
        #d9d9d9,
        #d1d1d1,
        #c5c5c5,
        #c8c8c8,
        #d7d7d7,
        #d5d5d5,
        #cdcdcd,
        #c4c4c4,
        #d9d9d9,
        #cecece,
        #c5c5c5,
        #c5c5c5,
        #cdcdcd,
        #d8d8d8,
        #d9d9d9,
        #d7d7d7
      )
      content-box,
    linear-gradient(#d4d4d4, #d4d4d4) padding-box,
    radial-gradient(rgba(120, 120, 120, 0.9), rgba(120, 120, 120, 0) 70%) 50% bottom / 80% 7.5% no-repeat border-box;
}
```

**Silver vs gold:** Silver has a much narrower color range (`#bfbfbf` to `#d9d9d9` = 26 lightness units) vs gold (`#e0b100` to `#ffe900` = wide hue + lightness variation). Silver is subtle; gold is dramatic.

### Bronze/Copper button

```css
.metal-button-bronze {
  box-shadow:
    inset 0 0 0 1px #bc7e6b,
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.5);

  background:
    conic-gradient(
        #d95641,
        #b14439,
        #b2453a,
        #d25645,
        #d56847,
        #d05441,
        #b85137,
        #b2453a,
        #c34f40,
        #df4647,
        #a94338,
        #c94943,
        #c85442,
        #a4413c,
        #d9543a,
        #d1564e,
        #ab4338,
        #bb4a3c,
        #dc5843,
        #b94839,
        #aa4237,
        #c24e42,
        #ce523f,
        #ab4338,
        #dd5944,
        #ca4d33,
        #ab4338,
        #cb503e,
        #d95641
      )
      content-box,
    linear-gradient(#ad3b36, #ad3b36) padding-box,
    radial-gradient(rgba(120, 120, 120, 0.9), rgba(120, 120, 120, 0) 70%) 50% bottom / 80% 7.5% no-repeat border-box;
}
```

### Rose Gold button

```css
.metal-button-rosegold {
  box-shadow:
    inset 0 0 0 1px #c7aca0,
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.5);

  background:
    conic-gradient(
        #e6c9bf,
        #d2b5aa,
        #cbaea3,
        #d4b5ab,
        #e5c3bd,
        #d9c0b4,
        #d9bcb1,
        #c5a399,
        #e3c6bc,
        #e7cac0,
        #dec0b5,
        #d3b6ab,
        #cfada1,
        #d4b6ac,
        #e2c6c0,
        #e2c6c0,
        #d2b1a6,
        #d2b1a6,
        #d1b4a9,
        #e1c4ba,
        #e5c9be,
        #dec1b6,
        #d3b6ab,
        #ceb0a6,
        #cfada3,
        #d2b5aa,
        #dabdb2,
        #e5c9be,
        #e6c9bf
      )
      content-box,
    linear-gradient(#e5c9be, #e5c9be) padding-box,
    radial-gradient(rgba(120, 120, 120, 0.9), rgba(120, 120, 120, 0) 70%) 50% bottom / 80% 7.5% no-repeat border-box;
}
```

---

## 24.4 Chrome Text — Gradient Background-Clip + Animated Shine

Metallic chrome text effect using `background-clip: text` with a multi-stop vertical gradient and an animated shine sweep.

### Base chrome text

```css
.chrome-text {
  font-family: "Russo One", sans-serif;
  font-size: 6rem;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  -webkit-font-smoothing: antialiased;

  /* Chrome gradient — 6 stops simulating curved metal reflection */
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    /* Top highlight */ #c0c0c0 30%,
    /* Upper mid-tone */ #999999 45%,
    /* Shadow band */ #ffffff 50%,
    /* Central specular (bright reflection) */ #666666 65%,
    /* Lower shadow */ #ffffff 95% /* Bottom edge catch */
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  /* 3D extrusion shadow */
  text-shadow:
    2px 2px 0px #4a4a4a,
    4px 4px 0px #3a3a3a,
    6px 6px 0px #2a2a2a,
    8px 8px 10px rgba(0, 0, 0, 0.4);

  will-change: background-position;
}
```

**Gradient anatomy:** The key is the bright band at 50% — this is where the "tube" of reflected light sits on the chrome surface. Above and below it are darker zones, then bright edges. This creates the illusion of a convex chrome letter.

### Animated shine sweep (::before)

```css
.chrome-text::before {
  content: "CODEPEN"; /* Must match parent text */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  /* Narrow bright band that sweeps across */
  background: linear-gradient(120deg, transparent 0%, transparent 6%, rgba(255, 255, 255, 0.85) 7.5%, transparent 9%, transparent 100%);
  -webkit-background-clip: text;
  background-clip: text;
  background-size: 200% 100%;
  background-position: 0 0;

  animation: chrome-shine 10s ease-in-out infinite;
}

@keyframes chrome-shine {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 300% 0;
  }
}
```

**Shine band:** Only 1.5% wide (6% → 7.5% at 0.85 opacity) — a razor-thin bright line that sweeps left-to-right. The `background-size: 200%` + `-100%` to `300%` range ensures it traverses the full text width with lead-in and lead-out.

---

## 24.5 Gold Metallic Text — Dual-Layer Gradient

Rich gold text using two overlapping `<div>` elements with different gradient angles, creating directional brushed-gold depth.

### Construction

```css
.wrapper {
  display: grid;
  grid-template-areas: "overlap";
  place-content: center;
}

.wrapper > div {
  -webkit-background-clip: text;
  background-clip: text;
  color: #363833; /* Fallback dark */
  font-family: "Poppins", sans-serif;
  font-weight: 900;
  font-size: clamp(3em, 18vw, 15rem);
  grid-area: overlap; /* Both stack on same grid cell */
  letter-spacing: 1px;
  -webkit-text-stroke: 4px transparent;
}
```

### Background layer (angled brush)

```css
div.bg {
  background-image: repeating-linear-gradient(105deg, var(--gold) 0%, var(--dark-shadow) 5%, var(--gold) 12%);
  color: transparent;
  filter: drop-shadow(5px 15px 15px black);
  transform: scaleY(1.05);
  transform-origin: top;
}
```

**Background role:** Slightly scaled up (1.05) and offset to create a shadow/depth layer behind the foreground. The 105deg angle gives a diagonal brush direction.

### Foreground layer (different angle)

```css
div.fg {
  background-image: repeating-linear-gradient(5deg, var(--gold) 0%, var(--light-shadow) 23%, var(--gold) 31%);
  color: #1e2127; /* Dark base for depth in letter strokes */
  transform: scale(1);
}
```

**Key insight:** The two layers use different gradient angles (105deg vs 5deg). This creates a cross-hatched metallic effect — the background brush goes one direction, the foreground another, mimicking how real brushed gold catches light differently at different depths.

### Variables

```css
:root {
  --gold: #ffb338;
  --light-shadow: #77571d;
  --dark-shadow: #3e2904;
}
```

---

## 24.6 Metallic Borders — Padding-Box/Border-Box Gradient Trick

Metallic gradient borders using the `padding-box` / `border-box` background technique. The inner content shows through `padding-box` while the border area shows through `border-box`.

### Gold border

```css
.border-gold {
  border: 12px solid transparent;
  border-radius: 10px;
  background:
    linear-gradient(45deg, #000, #000) padding-box,
    linear-gradient(45deg, #f6dba6, #ffebc4, #f0be79, #8f653b, #673d22, #ba7f3b, #eebc70) border-box;
}
```

### Silver border

```css
.border-silver {
  border: 12px solid transparent;
  border-radius: 10px;
  background:
    linear-gradient(45deg, #000, #000) padding-box,
    linear-gradient(45deg, #c1a4e8, #b8e2fb, #f2efe8, #f9dcdd, #e1c1e5, #bdafe3) border-box;
}
```

### Bronze/Copper border

```css
.border-bronze {
  border: 12px solid transparent;
  border-radius: 10px;
  background:
    linear-gradient(45deg, #000, #000) padding-box,
    linear-gradient(45deg, #f0cab2, #a47c6c, #7f5b4a, #ac836d, #ab836e) border-box;
}
```

### Platinum/Chrome border

```css
.border-platinum {
  border: 12px solid transparent;
  border-radius: 10px;
  background:
    linear-gradient(45deg, #000, #000) padding-box,
    linear-gradient(45deg, #e5e4e2, #ffffff, #e5e4e2, #ffffff, #e5e4e2) border-box;
}
```

### Black metal border

```css
.border-black {
  border: 12px solid transparent;
  border-radius: 10px;
  background:
    linear-gradient(45deg, #000, #000) padding-box,
    linear-gradient(45deg, #e7e7e7, #a1a19f, #706f6b, #2d2c29, #63625d, #76756e) border-box;
}
```

### Animated shine overlay

```css
.metallic-shine {
  position: relative;
  overflow: hidden;
}

.metallic-shine::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}
```

---

## 24.7 Procedural Brushed Metal Texture (Canvas/p5.js)

For cases where CSS gradients lack sufficient realism, a canvas-generated noise texture creates authentic brushed metal. Can be used as a `background-image: url(canvas.toDataURL())` for any element.

### Algorithm

```javascript
// 1. Generate Perlin noise base
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pixelDensity(1);
  var inc = 0.005; // Noise density — lower = smoother metal
  var xoff = 0;

  background("gray");
  loadPixels();
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var index = (x + y * width) * 4;
      var r = noise(xoff) * 255;
      pixels[index + 0] = r;
      pixels[index + 1] = r;
      pixels[index + 2] = r;
      pixels[index + 3] = 220; // Slight transparency
      xoff += inc;
    }
  }
  updatePixels();
  filter(BLUR, 0.8); // Soften noise into brush strokes
}
```

**Key:** The `xoff` increments only on the X axis (not reset per row), creating horizontal streak patterns — this is what makes it "brushed" rather than uniform noise.

### Post-processing (blend modes)

```javascript
function draw() {
  // Darken mid-tones
  blendMode(MULTIPLY);
  background("gray");

  // Lift shadows slightly
  blendMode(SOFT_LIGHT);
  background("#3b3b3b");

  // Add directional specular shine
  blendMode(SOFT_LIGHT);
  var b1 = color(220); // Bright
  var b2 = color(30); // Dark
  // Left half: dark→bright, Right half: bright→dark
  setGradient(0, 0, width / 2, height, b2, b1);
  setGradient(width / 2 + 1, 0, width / 2 + 1, height, b1, b2);
}
```

**Shine gradient:** Symmetric left-right gradient in `SOFT_LIGHT` mode simulates a central specular band — the same optical effect as the CSS `linear-gradient(180deg, ...)` but with noise texture.

### Tuning parameters

| Parameter             | Low                    | Medium                 | High                      |
| --------------------- | ---------------------- | ---------------------- | ------------------------- |
| `inc` (noise density) | 0.001 (smooth, satin)  | 0.005 (standard brush) | 0.02 (coarse, industrial) |
| `BLUR` filter         | 0.3 (fine brush)       | 0.8 (standard)         | 2.0 (heavy polish)        |
| Alpha channel         | 180 (very transparent) | 220 (standard)         | 255 (opaque)              |

### CSS integration

```javascript
// After rendering, export as data URL
var dataURL = canvas.toDataURL("image/png");
document.querySelector(".metal-element").style.backgroundImage = `url(${dataURL})`;
```

---

## 24.8 Metal Recipes Quick Reference

### Recipe 1: Brushed metal button (Tailwind + inline shadow)

```css
style="
  background-color: hsl(0,0%,90%);
  background-image:
    repeating-linear-gradient(90deg,
      transparent 0%, transparent 1.2%, rgba(255,255,255,0.15) 2.2%),
    linear-gradient(180deg, hsl(0,0%,78%) 0%, hsl(0,0%,90%) 47%,
      hsl(0,0%,78%) 53%, hsl(0,0%,70%) 100%);
  box-shadow:
    inset 0 0 0 4px hsla(0,0%,15%,1),
    inset 0 -1px 5px 4px hsla(0,0%,15%,0.8),
    inset 0 -1px 0 7px hsla(0,0%,0%,0.25),
    inset 0 2px 1px 7px hsla(0,0%,100%,0.7),
    0 -5px 6px 4px hsla(0,0%,0%,0.15),
    0 5px 6px 4px hsla(0,0%,100%,0.5);
"
```

### Recipe 2: Gold border (Tailwind)

```
border-[12px] border-transparent rounded-[10px]
bg-[linear-gradient(45deg,#000,#000)_padding-box,linear-gradient(45deg,#f6dba6,#ffebc4,#f0be79,#8f653b,#673d22,#ba7f3b,#eebc70)_border-box]
```

### Recipe 3: Chrome text (inline style)

```css
style="
  background: linear-gradient(180deg, #fff 0%, #c0c0c0 30%, #999 45%, #fff 50%, #666 65%, #fff 95%);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 2px 2px 0 #4a4a4a, 4px 4px 0 #3a3a3a, 6px 6px 0 #2a2a2a, 8px 8px 10px rgba(0,0,0,0.4);
"
```

### Decision matrix

| Need                                 | Technique                                | Section |
| ------------------------------------ | ---------------------------------------- | ------- |
| Brushed metal button (round)         | Repeating radial gradient + fake conical | 24.2    |
| Brushed metal button (rect)          | Repeating linear gradient + curvature    | 24.2    |
| Metallic button (gold/silver/bronze) | Conic gradient 28+ stops                 | 24.3    |
| Chrome/metallic text                 | Background-clip: text + gradient         | 24.4    |
| Gold text with depth                 | Dual-layer overlapping gradients         | 24.5    |
| Metallic border/frame                | Padding-box / border-box trick           | 24.6    |
| Ultra-realistic texture              | Canvas Perlin noise + blend modes        | 24.7    |
| Animated shine on any metal          | ::after sweep gradient                   | 24.6    |
