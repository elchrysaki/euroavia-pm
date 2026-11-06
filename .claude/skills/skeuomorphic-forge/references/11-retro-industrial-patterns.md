# Retro-Industrial Patterns

Production-ready patterns for vintage 1970s-1990s aerospace/automotive instrumentation UI. All patterns use **warm tones** (hue 25-40) and assume **top-left light source**.

---

## 27. 3-Ring Bezel Assembly

The signature construction for instrument displays. Three concentric rings create a machined housing around a recessed screen/readout.

### Ring 1 — Outer Chassis (Machined Aluminum)

Conic gradient with 7+ warm hue stops simulating curved metal reflection under directional light.

```css
/* Outer ring */
.bezel-outer {
  padding: 6px;
  border-radius: 12px;
  background: conic-gradient(from 0deg, hsl(35 10% 28%), hsl(40 8% 38%), hsl(35 12% 32%), hsl(30 10% 22%), hsl(35 8% 30%), hsl(40 10% 36%), hsl(35 10% 28%));
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.45),
    inset 0 1px 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 1px rgba(0, 0, 0, 0.7);
}
```

### Ring 2 — Bevel Ring (Chamfered Edge)

Transitional ring between chassis and display well. Creates the machined chamfer effect.

```css
/* Bevel ring */
.bezel-bevel {
  padding: 4px;
  border-radius: 8px;
  background: linear-gradient(154deg, hsl(35 8% 26%), hsl(30 10% 18%), hsl(25 12% 14%), hsl(30 8% 20%));
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.6),
    inset 0 -1px 2px rgba(255, 255, 255, 0.04),
    0 1px 0 rgba(255, 255, 255, 0.03);
}
```

### Ring 3 — Inner Well (CRT-Style Recess)

Deep recessed cavity where the display content lives. Ultra-dark with radial vignette.

```css
/* Inner well */
.bezel-well {
  border-radius: 6px;
  padding: 12px;
  background: radial-gradient(ellipse at 50% 30%, hsl(30 15% 7%), hsl(25 20% 3%), hsl(20 20% 1%));
  box-shadow:
    inset 0 5px 14px rgba(0, 0, 0, 0.9),
    inset 0 2px 6px rgba(0, 0, 0, 0.95),
    inset 3px 0 8px rgba(0, 0, 0, 0.4),
    inset -3px 0 8px rgba(0, 0, 0, 0.4),
    inset 0 0 1px rgba(245, 158, 11, 0.3);
}
```

### Complete Assembly (React inline style)

```tsx
const BEZEL_OUTER: React.CSSProperties = {
  padding: 6,
  borderRadius: 12,
  background: `conic-gradient(from 0deg, hsl(35 10% 28%), hsl(40 8% 38%), hsl(35 12% 32%), hsl(30 10% 22%), hsl(35 8% 30%), hsl(40 10% 36%), hsl(35 10% 28%))`,
  boxShadow: "0 4px 10px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.7)"
};

const BEZEL_BEVEL: React.CSSProperties = {
  padding: 4,
  borderRadius: 8,
  background: "linear-gradient(154deg, hsl(35 8% 26%), hsl(30 10% 18%), hsl(25 12% 14%), hsl(30 8% 20%))",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -1px 2px rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.03)"
};

const BEZEL_WELL: React.CSSProperties = {
  borderRadius: 6,
  padding: 12,
  background: "radial-gradient(ellipse at 50% 30%, hsl(30 15% 7%), hsl(25 20% 3%), hsl(20 20% 1%))",
  boxShadow: "inset 0 5px 14px rgba(0,0,0,0.9), inset 0 2px 6px rgba(0,0,0,0.95), inset 3px 0 8px rgba(0,0,0,0.4), inset -3px 0 8px rgba(0,0,0,0.4), inset 0 0 1px rgba(245,158,11,0.3)"
};

// Usage:
<div style={BEZEL_OUTER}>
  <div style={BEZEL_BEVEL}>
    <div style={BEZEL_WELL}>{/* Display content here */}</div>
  </div>
</div>;
```

---

## 28. CRT Display Construction

7-layer assembly for authentic CRT monitor/terminal display effect.

### Layer stack (bottom to top)

```tsx
// 1. Screen base — pitch black
const CRT_BASE: React.CSSProperties = {
  background: "hsl(0 0% 4%)",
  position: "relative",
  overflow: "hidden"
};

// 2. Vignette shadow — darkens edges like real CRT
const CRT_VIGNETTE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.65) 100%)",
  pointerEvents: "none"
};

// 3. Inner backlight — warm amber tint from behind
const CRT_BACKLIGHT: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse at 50% 50%, rgba(255,220,140,0.05) 0%, transparent 70%)",
  pointerEvents: "none"
};

// 4. Scanlines — horizontal CRT scan
const CRT_SCANLINES: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px)",
  pointerEvents: "none"
};

// 5. Glass reflection — top-left specular highlight
const CRT_SPECULAR: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse 60% 30% at 25% 10%, rgba(255,255,255,0.05), transparent)",
  pointerEvents: "none"
};

// 6. Color accent line — top edge CRT mask
const CRT_ACCENT = (color: string): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  left: "10%",
  right: "10%",
  height: 1,
  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
  pointerEvents: "none"
});

// 7. Content layer — actual text/numbers
const CRT_TEXT: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const
};
```

### Phosphor glow per color

```tsx
const phosphorGlow = (color: string, glowColor: string) => ({
  color,
  textShadow: `0 0 4px ${color}, 0 0 10px ${glowColor}`
});

// Amber (most common for retro-industrial)
phosphorGlow("hsl(35 100% 65%)", "rgba(255,180,0,0.4)");

// Green (classic terminal)
phosphorGlow("hsl(120 80% 60%)", "rgba(0,255,100,0.3)");

// Red (warning/critical)
phosphorGlow("hsl(0 90% 60%)", "rgba(255,50,50,0.3)");
```

---

## 29. LED Indicator System

Multi-shadow halo system for realistic LED indicators.

### LED construction

```tsx
const LED = (color: { core: string; mid: string; halo: string; bg: string }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: `radial-gradient(circle at 35% 30%, ${color.core}, ${color.mid}, ${color.bg})`,
  boxShadow: `
    0 0 2px ${color.mid},
    0 0 5px ${color.mid},
    0 0 10px ${color.halo},
    inset 0 -1px 2px rgba(0,0,0,0.5)
  `,
  animation: "led-pulse 2.4s ease-in-out infinite"
});

// Preset colors
const LED_GREEN = { core: "#80ffa0", mid: "#30cc55", halo: "rgba(48,204,85,0.4)", bg: "#1a8833" };
const LED_AMBER = { core: "#ffd080", mid: "#ffb000", halo: "rgba(255,176,0,0.4)", bg: "#b87800" };
const LED_RED = { core: "#ff8080", mid: "#ff3030", halo: "rgba(255,48,48,0.4)", bg: "#b82020" };
const LED_BLUE = { core: "#80c0ff", mid: "#3090ff", halo: "rgba(48,144,255,0.4)", bg: "#1a60b8" };
```

### Pulse animation

```css
@keyframes led-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

### LED with label (silkscreen style)

```tsx
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <div style={LED(LED_GREEN)} />
  <span
    style={{
      fontFamily: "monospace",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.06)",
      textShadow: "0 1px 0 rgba(0,0,0,0.9)"
    }}
  >
    SIGNAL
  </span>
</div>
```

---

## 30. Torx Screw

Decorative mounting hardware with realistic radial gradient and slot shadow.

```tsx
const SCREW_SIZE = 14;

const TorxScrew = () => (
  <div
    style={{
      width: SCREW_SIZE,
      height: SCREW_SIZE,
      borderRadius: "50%",
      background: `radial-gradient(circle at 32% 26%, hsl(40 15% 50%), hsl(35 18% 38%), hsl(30 20% 25%), hsl(25 22% 15%))`,
      boxShadow: `
      inset 0 2px 4px rgba(0,0,0,0.95),
      inset 0 -1px 1px rgba(255,255,255,0.08),
      0 1px 3px rgba(0,0,0,0.5)
    `,
      position: "relative"
    }}
  >
    {/* Horizontal slot */}
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "25%",
        right: "25%",
        height: 1,
        background: "rgba(0,0,0,0.8)",
        transform: "translateY(-50%)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.05)"
      }}
    />
    {/* Vertical slot */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "25%",
        bottom: "25%",
        width: 1,
        background: "rgba(0,0,0,0.8)",
        transform: "translateX(-50%)",
        boxShadow: "1px 0 0 rgba(255,255,255,0.05)"
      }}
    />
  </div>
);
```

---

## 31. SVG feTurbulence Texture Overlay

Add cast-iron or noise texture to any surface using inline SVG filter.

### Cast iron texture

```tsx
const NOISE_SVG = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="200" height="200" filter="url(#n)" opacity="0.08"/>
  </svg>
`)}`;

// Apply as background layer
const CAST_IRON: React.CSSProperties = {
  background: `url("${NOISE_SVG}"), linear-gradient(142deg, hsl(40 10% 16%), hsl(35 12% 11%), hsl(30 14% 8%))`
};
```

### Fine metal grain

```tsx
// Higher frequency = finer grain
const FINE_GRAIN_SVG = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="200" height="200" filter="url(#n)" opacity="0.04"/>
  </svg>
`)}`;
```

### Brushed metal texture (directional)

```css
/* Repeating fine lines simulating brush marks */
background: repeating-linear-gradient(155deg, transparent, rgba(255, 255, 255, 0.01) 1px, transparent 2px);
```

---

## 32. Glitch / Holographic Input

CRT-style input fields with corner brackets, scanline overlay, and data stream glitch effect.

### Structure

```html
<div class="glitch-input-wrapper">
  <div class="glitch-input-container">
    <input class="holo-input" />
    <div class="input-border" />
    <div class="input-corners">
      <span class="corner tl" />
      <span class="corner tr" />
      <span class="corner bl" />
      <span class="corner br" />
    </div>
    <div class="input-scanline" />
    <div class="input-glow" />
    <div class="input-data-stream" />
  </div>
</div>
```

### Key CSS patterns

```css
/* Base input — transparent with monospace font */
.holo-input {
  background: transparent;
  border: none;
  color: hsl(35 80% 65%);
  font-family: "Share Tech Mono", monospace;
  letter-spacing: 0.05em;
  caret-color: hsl(35 100% 60%);
}

/* Corner brackets — CRT monitor bezel accents */
.corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: hsl(35 60% 40%);
  border-style: solid;
  border-width: 0;
}
.corner.tl {
  top: 0;
  left: 0;
  border-top-width: 1px;
  border-left-width: 1px;
}
.corner.tr {
  top: 0;
  right: 0;
  border-top-width: 1px;
  border-right-width: 1px;
}
.corner.bl {
  bottom: 0;
  left: 0;
  border-bottom-width: 1px;
  border-left-width: 1px;
}
.corner.br {
  bottom: 0;
  right: 0;
  border-bottom-width: 1px;
  border-right-width: 1px;
}

/* Scanline sweep */
.input-scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 200, 100, 0.03) 50%, transparent 100%);
  animation: scanline-sweep 3s linear infinite;
  pointer-events: none;
}

@keyframes scanline-sweep {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

/* Data stream glitch bars */
.input-data-stream {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(255, 180, 50, 0.02) 8px, rgba(255, 180, 50, 0.02) 9px);
  animation: data-glitch 0.1s steps(3) infinite;
  pointer-events: none;
}

@keyframes data-glitch {
  0% {
    clip-path: inset(0 0 80% 0);
  }
  33% {
    clip-path: inset(30% 0 40% 0);
  }
  66% {
    clip-path: inset(60% 0 10% 0);
  }
  100% {
    clip-path: inset(0 0 80% 0);
  }
}
```

---

## 33. Mechanical Counter (Rolling Digits)

Odometer-style digit display with rolling animation.

### Digit well construction

```tsx
const DIGIT_WELL: React.CSSProperties = {
  background: "linear-gradient(180deg, #000 0%, #0a0a0a 50%, #000 100%)",
  position: "relative",
  overflow: "hidden",
  width: 28,
  padding: "8px 0",
  textAlign: "center"
};

// Vignette overlay (top/bottom darkness)
const DIGIT_VIGNETTE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.65) 100%)",
  pointerEvents: "none"
};

// Inner backlight (warm amber)
const DIGIT_BACKLIGHT: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse at 50% 50%, rgba(255,220,140,0.05), transparent 70%)",
  pointerEvents: "none"
};

// Digit style
const DIGIT_TEXT: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 700,
  fontSize: 20,
  color: "hsl(40 60% 72%)", // aged amber/cream
  textShadow: "0 0 6px rgba(255,200,100,0.3)",
  position: "relative",
  zIndex: 1
};
```

### Rolling animation (React)

```tsx
const rollDigit = (target: number, onComplete: () => void) => {
  let frame = 0;
  const totalFrames = 10;
  const interval = setInterval(() => {
    frame++;
    if (frame >= totalFrames) {
      clearInterval(interval);
      onComplete();
      return;
    }
    // Show random digit during roll
    setDisplayDigit(Math.floor(Math.random() * 10));
  }, 50);
  // Final frame shows target
  setTimeout(() => setDisplayDigit(target), totalFrames * 50);
};
```

---

## 34. Deep Chassis Hole (Ultra-Recess Display Mount)

Advanced variant of the 3-ring bezel that creates an **extreme depth illusion** — the display appears to sit deep inside a machined cavity. Uses 30+ box-shadow layers for omnidirectional darkness.

### Chassis hole construction

The key innovation: shadows attack from **all 8 directions** (top, bottom, left, right, and 4 diagonals) with progressive blur distances, creating a tunnel-like depth.

```css
.chassis-hole {
  position: relative;
  padding: 5px 6px 8px 6px;
  border-radius: 16px;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, #000 0%, #020202 70%, #080808 100%);
  box-shadow:
    /* === TOP EDGE (7 layers, progressive depth) === */
    inset 0 1px 0 #000,
    inset 0 2px 0 #000,
    inset 0 3px 1px #000,
    inset 0 4px 4px rgba(0, 0, 0, 1),
    inset 0 8px 10px rgba(0, 0, 0, 1),
    inset 0 14px 18px rgba(0, 0, 0, 0.95),
    inset 0 22px 30px rgba(0, 0, 0, 0.85),
    inset 0 32px 50px rgba(0, 0, 0, 0.6),
    /* === LEFT EDGE (5 layers) === */ inset 1px 0 0 #000,
    inset 2px 0 0 #000,
    inset 6px 0 8px rgba(0, 0, 0, 1),
    inset 12px 0 16px rgba(0, 0, 0, 0.9),
    inset 20px 0 24px rgba(0, 0, 0, 0.6),
    /* === RIGHT EDGE (5 layers) === */ inset -1px 0 0 #000,
    inset -2px 0 0 #000,
    inset -6px 0 8px rgba(0, 0, 0, 1),
    inset -12px 0 16px rgba(0, 0, 0, 0.9),
    inset -20px 0 24px rgba(0, 0, 0, 0.6),
    /* === BOTTOM EDGE (5 layers) === */ inset 0 -4px 4px rgba(0, 0, 0, 1),
    inset 0 -8px 10px rgba(0, 0, 0, 1),
    inset 0 -14px 18px rgba(0, 0, 0, 0.95),
    inset 0 -22px 30px rgba(0, 0, 0, 0.85),
    inset 0 -32px 50px rgba(0, 0, 0, 0.6),
    /* === DIAGONAL CORNERS (4 layers) === */ inset 10px 10px 18px rgba(0, 0, 0, 0.9),
    inset -10px 10px 18px rgba(0, 0, 0, 0.9),
    inset 10px -10px 18px rgba(0, 0, 0, 0.9),
    inset -10px -10px 18px rgba(0, 0, 0, 0.9),
    /* === EXTERNAL (lip highlight + drop shadow) === */ 0 1px 0 rgba(255, 255, 255, 0.05),
    0 2px 0 rgba(255, 255, 255, 0.02),
    0 -1px 0 rgba(0, 0, 0, 0.9),
    0 -2px 4px rgba(0, 0, 0, 0.6),
    0 6px 24px rgba(0, 0, 0, 0.6),
    0 12px 48px rgba(0, 0, 0, 0.4);
  border-top: 1px solid #000;
  border-left: 1px solid #010101;
  border-right: 1px solid #010101;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Colored rim bleed (::before)

A subtle colored glow at the top edge where the display light "bleeds" through the chassis gap.

```css
.chassis-hole::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 12%;
  width: 76%;
  height: 1px;
  z-index: 25;
  pointer-events: none;
  /* Change rgba(255,65,45,...) to match display color */
  background: radial-gradient(ellipse 55% 100% at 50% 50%, rgba(255, 65, 45, 0.45) 0%, rgba(255, 55, 35, 0.18) 45%, transparent 100%);
  box-shadow: 0 0 2px rgba(255, 60, 40, 0.15);
}
```

### Directional vignette (::after)

5-layer overlay that darkens all edges independently, creating a tunnel perspective.

```css
.chassis-hole::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 20%, transparent 45%), linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 15%, transparent 35%),
    linear-gradient(270deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 15%, transparent 35%), linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 20%, transparent 45%),
    radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.6) 100%);
}
```

### Screen glass (display inside the hole)

Multi-layer glass surface with colored gradient base, deep inset shadows, and 6-layer specular reflection.

```css
.screen-glass {
  position: relative;
  width: 420px;
  min-height: 90px;
  border-radius: 10px;
  overflow: hidden;
  /* Colored gradient base — change rgba(80,8,4) to match theme */
  background: linear-gradient(270deg, rgba(80, 8, 4, 0.7) 0%, rgba(40, 4, 2, 0.5) 40%, #020101 75%);
  box-shadow:
    0 0 0 1px rgba(255, 80, 50, 0.8),
    /* color border */ 0 0 8px 1px rgba(255, 60, 40, 0.25),
    /* outer glow */ 0 4px 12px rgba(255, 40, 20, 0.15),
    /* cast glow */ inset 0 18px 20px -10px rgba(0, 0, 0, 1),
    inset 0 -18px 20px -10px rgba(0, 0, 0, 1),
    inset 24px 0 24px -12px rgba(0, 0, 0, 1),
    inset 40px 0 35px -15px rgba(0, 0, 0, 1),
    inset 60px 0 50px -20px rgba(0, 0, 0, 0.95),
    inset 80px 0 60px -25px rgba(0, 0, 0, 0.85),
    inset 110px 0 80px -30px rgba(0, 0, 0, 0.6),
    inset -24px 0 24px -12px rgba(0, 0, 0, 1);
}

/* 6-layer glass reflection */
.screen-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 15;
  background:
    radial-gradient(ellipse 160% 45% at 50% -8%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 35%, transparent 50%),
    radial-gradient(ellipse 40% 25% at 30% 8%, rgba(255, 255, 255, 0.1) 0%, transparent 70%),
    linear-gradient(125deg, transparent 20%, rgba(255, 255, 255, 0.025) 24%, rgba(255, 255, 255, 0.05) 28%, rgba(255, 255, 255, 0.025) 32%, transparent 36%),
    radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 255, 255, 0.012) 0%, transparent 70%), radial-gradient(ellipse 50% 12% at 50% 98%, rgba(255, 255, 255, 0.03) 0%, transparent 80%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 0%, transparent 2.5%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.02),
    inset 0 -1px 0 rgba(255, 255, 255, 0.02);
}
```

### Phosphor text (content inside screen)

```css
.phosphor-title {
  font-family: "Space Mono", monospace;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 6px;
  color: #ff6b5a;
  text-shadow:
    0 0 1px rgba(255, 107, 90, 1),
    0 0 6px rgba(255, 80, 60, 0.7),
    0 0 12px rgba(255, 40, 20, 0.3);
  animation: text-breathe 4s infinite ease-in-out;
}

@keyframes text-breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}
```

**Color variants** — replace red values to theme the entire assembly:

| Theme            | Phosphor color | Glow base              | Rim bleed              |
| ---------------- | -------------- | ---------------------- | ---------------------- |
| **Red/Danger**   | `#ff6b5a`      | `rgba(255,80,60,...)`  | `rgba(255,65,45,...)`  |
| **Amber/Warm**   | `#ffb060`      | `rgba(255,160,60,...)` | `rgba(255,150,45,...)` |
| **Green/Status** | `#60ff90`      | `rgba(60,255,100,...)` | `rgba(45,255,65,...)`  |
| **Blue/Info**    | `#60a0ff`      | `rgba(60,120,255,...)` | `rgba(45,100,255,...)` |

**Full working demo**: `assets/codepen-deep-screen.html`

---

## Quick Reference — Retro-Industrial Decision Matrix

| Building...                 | Use pattern                               | Key technique                                                                               |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Instrument readout          | 27 (3-ring bezel) + 28 (CRT)              | Conic gradient chassis + scanline display                                                   |
| Deep-set display            | 34 (chassis hole) + 28 (CRT)              | 30+ shadow omnidirectional depth + glass                                                    |
| Status indicator            | 29 (LED system)                           | Multi-shadow halo + pulse animation                                                         |
| Mounting panel              | 30 (Torx screws) + file 01 raised surface | Cast iron texture + corner screws                                                           |
| Text input field            | 32 (Glitch input)                         | Corner brackets + scanline sweep                                                            |
| Numeric display             | 33 (Mechanical counter)                   | Rolling digits + digit well + vignette                                                      |
| Metal surface               | 31 (feTurbulence)                         | SVG noise overlay + warm gradient                                                           |
| Panel label                 | Section 28 phosphor glow                  | Silkscreen or phosphor text-shadow                                                          |
| Warning/alert screen        | 34 (chassis hole, red theme)              | Color-themed phosphor + rim bleed                                                           |
| Concave toggle/header       | 35 (Concave button)                       | 15-layer inset shadow + mask-composite rim light                                            |
| Equipment faceplate         | 36 (Faceplate panel)                      | 6-layer stack (dots, noise, vignette, glass, projection)                                    |
| Glass dome icon             | 36 (icon-dome)                            | 3-ring well → mid-ring → convex dome specular                                               |
| Frequency analyzer          | 37 (Analyzer screen)                      | SVG filter neon glow + Butterworth curves + FFT bars                                        |
| Anomaly warning             | 38 (Erratic curve)                        | 60-seed chaotic sine sum + fog blur + warning overlay                                       |
| 3D push button              | 39 (Glow projection button)               | 14px translateY travel + massive glow + rim light bleed                                     |
| Thick info card             | 40 (Thick card surface)                   | Top specular + bottom bevel darkness + inner recess                                         |
| Toggle / binary switch      | 41 (Trench toggle)                        | 3-layer (outer → trench → thumb) + LED indicator dot                                        |
| CNC-milled pushbutton       | 42 (Well-mounted button)                  | Button in machined well + 8-radial light projection                                         |
| Mechanical key              | 43 (Keyboard key)                         | 14-layer shadow + 4px→1px border travel + spring bezier                                     |
| OEM EQ / parametric curve   | 44 (OEM EQ curve)                         | SVG bell/shelf filters + annotated callouts + neon glow                                     |
| Flat response display       | 45 (Full-range display)                   | `<rect>` bands + log-frequency axis + bandwidth arrows                                      |
| LPF/HPF crossover screen    | 46 (LPF crossover)                        | Butterworth curve + animated FFT + cutoff dot + info panel                                  |
| Toggle with glass knob      | 47 (Glass sphere toggle)                  | 5-layer glass sphere + guide rails + electrical contacts                                    |
| Frosted glass CTA           | 48 (Red glassmorphism)                    | `backdrop-blur-2xl` + directional borders + spring bezier                                   |
| Glossy capsule button       | 49 (Glossy pill button)                   | Shell casing + glass reflections + LED backlight on press                                   |
| Plasma/liquid progress      | 50 (Plasma progress bar)                  | SVG `feDisplacementMap` turbulence + delta knob + bubbles                                   |
| Slit LED latching button    | 51 (COMPRIS slit button)                  | 7-layer slit glow + 6 bloom layers + gap/desk projection                                    |
| Well button w/ stacked wall | 52 (Stacked height wall)                  | 8-step `0 Npx 0 0` shadow + amber slit + 12-layer well                                      |
| Analog needle meter         | 53 (VU meter)                             | SVG arc + needle `transform-origin: bottom center` + hub                                    |
| Dual toggle w/ cross-light  | 54 (Cross-light toggle)                   | Bevel ring + cross-projected light + color spill gradient                                   |
| 5-layer bezel button        | 55 (FX neon ring button)                  | Backplate→outer→mid→gorge→button + neon ring 7-layer glow                                   |
| Mechanical counter display  | 56 (Alternator counter)                   | 4-ring bezel + digit columns + scanlines + separator grooves                                |
| 7-segment ghost display     | 57 (Digital display)                      | 8-layer screen + ghost segments `rgba(40,80,150,0.15)` + dual phosphor                      |
| LED matrix push button      | 58 (LED matrix button)                    | 5×7 LED grid + `@property --glow-opacity` + purple halo `mix-blend-mode: screen`            |
| Large neomorphic toggle     | 59 (DSP toggle switch)                    | 80px card + mask-composite border + handle floor shadow + blue rim glow                     |
| Full circular gauge         | 60 (Watt gauge forge)                     | Spring-damper needle physics + 5-layer glass + warn lamp + condensation droplets            |
| Minimal arc gauge           | 61 (Watt gauge simple)                    | SVG `describeArc` + thick red track (strokeWidth 55) + diamond pointer + concentric rings   |
| Start/Stop toggle button    | 62 (Start/Stop button)                    | Conic well + 4-layer orange rim glow + engraved→illuminated text + WebAudio click           |
| Trail toggle switch         | 63 (Trail toggle)                         | 7-layer incandescent trail + canvas particles + knob shadow inversion + spring bezier       |
| Gunmetal slider switch      | 64 (Gunmetal switch)                      | Plasma core inset glow + grip ridges + directional shadow flip + star Torx screws           |
| Synth LCD screen            | 65 (Synth LCD)                            | 5-layer glass (depth/fresnel/spec/caustic/rim) + conic bezel + pixel grid + 3-tier spill    |
| Deep 3D LCD display         | 66 (LCD Deep 3D)                          | Cyan radial backlight + inverted block + 3px pixel grid z-above text + glass overlay        |
| Glass power button          | 67 (Power button forge)                   | Conic bezel + glass btn + LED ring + SVG power icon neon/engrave + color-dodge glow         |
| Hardware gauge dashboard    | 68 (Gauge dashboard)                      | Asymmetric ballistic needle (attack/release) + VFD display + glass dome + red zone arc      |
| HPF crossover screen        | 69 (HPF tweeter)                          | Butterworth 24dB/oct curve + animated FFT + cutoff dot pulse + DSP info panel + zone labels |

---

## 35. Concave Button (Folding Header)

An input/trigger button that appears **pressed into** the panel rather than raised above it. Uses 15 inset box-shadow layers attacking from all directions to create a bowl-like concavity.

### Concave shadow construction

```css
.concave-button {
  background: #232128;
  border-radius: 12px;
  padding: 18px 24px;
  cursor: pointer;
  position: relative;
  box-shadow:
    /* TOP (3 progressive depths) */
    inset 0 8px 14px -3px rgba(0, 0, 0, 0.75),
    inset 0 4px 6px -1px rgba(0, 0, 0, 0.6),
    inset 0 2px 2px rgba(0, 0, 0, 0.5),
    /* LEFT (2 depths) */ inset 6px 0 10px -4px rgba(0, 0, 0, 0.55),
    inset 3px 0 4px -1px rgba(0, 0, 0, 0.35),
    /* RIGHT (2 depths) */ inset -6px 0 10px -4px rgba(0, 0, 0, 0.55),
    inset -3px 0 4px -1px rgba(0, 0, 0, 0.35),
    /* DIAGONAL CORNERS (4 layers) */ inset 5px 5px 8px -3px rgba(0, 0, 0, 0.4),
    inset -5px 5px 8px -3px rgba(0, 0, 0, 0.4),
    inset 4px -3px 6px -3px rgba(0, 0, 0, 0.15),
    inset -4px -3px 6px -3px rgba(0, 0, 0, 0.15),
    /* BOTTOM (catch light — simulates light bouncing off lip) */ inset 0 -3px 6px -2px rgba(255, 255, 255, 0.035),
    inset 0 -1px 1px rgba(255, 255, 255, 0.05),
    /* EXTERNAL (panel surface continuity) */ 0 -1px 0 rgba(255, 255, 255, 0.05),
    0 1px 0 rgba(0, 0, 0, 0.25);
  border-top: 1px solid #08070a;
  border-left: 1px solid #08070a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  transition: box-shadow 0.1s ease;
}
```

### Mask-composite rim light

The amber rim light uses the **CSS mask-composite trick** — two layers with `xor`/`exclude` compositing to create a border-only gradient.

```css
/* Sharp inner glow ring */
.inner-well::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(circle at 0 0, rgba(255, 139, 61, 0.85) 0%, rgba(255, 139, 61, 0.3) 6%, transparent 15%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 5;
  filter: drop-shadow(0 0 3px rgba(255, 139, 61, 0.6));
}

/* Blurred outer halo */
.inner-well::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 2px;
  background: radial-gradient(circle at 0 0, rgba(255, 139, 61, 0.6) 0%, rgba(255, 139, 61, 0.15) 8%, transparent 20%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 4;
  filter: blur(6px) drop-shadow(0 0 8px rgba(255, 139, 61, 0.3));
  mix-blend-mode: screen;
}
```

### Folding content animation

```css
.folding-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
}
.folding-content.open {
  max-height: 500px;
  opacity: 1;
  padding-top: 16px;
}
```

**Full working demo**: `assets/codepen-folding-header.html`

---

## 36. Faceplate Panel (Equipment Module)

Full industrial module faceplate with 6 decorative layers, machined icon dome, vertical separators, and a bottom status bar.

### 6-layer panel stack

```css
/* 1. BACKPLATE — outer chassis bevel */
.backplate {
  padding: 5px;
  border-radius: 34px;
  background: linear-gradient(145deg, #2e3238, #1e2226);
  box-shadow:
    6px 6px 22px rgba(0, 0, 0, 0.6),
    -3px -3px 10px rgba(50, 55, 65, 0.05),
    0 14px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}

/* 2. PANEL — inner faceplate */
.panel {
  position: relative;
  background: linear-gradient(180deg, #1a1d20 0%, #24282c 10%, #16191c 50%, #0d0f11 100%);
  border-radius: 30px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.6);
}

/* 3. DOT TEXTURE — perforated metal effect */
.dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: radial-gradient(rgba(0, 0, 0, 0.6) 1px, transparent 1px);
  background-size: 6px 6px;
  opacity: 0.4;
}

/* 4. NOISE OVERLAY */
.noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background-image: url("data:image/svg+xml,...feTurbulence...");
  mix-blend-mode: overlay;
  opacity: 0.35;
}

/* 5. EDGE VIGNETTE — all-border darkening */
.edge-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  box-shadow:
    /* Top edge (strongest) */
    inset 0 12px 20px -4px rgba(0, 0, 0, 0.6),
    inset 0 6px 8px -2px rgba(0, 0, 0, 0.4),
    /* Bottom edge */ inset 0 -10px 18px -4px rgba(0, 0, 0, 0.5),
    inset 0 -5px 6px -2px rgba(0, 0, 0, 0.3),
    /* Left + right edges */ inset 12px 0 18px -4px rgba(0, 0, 0, 0.45),
    inset 5px 0 6px -2px rgba(0, 0, 0, 0.25),
    inset -12px 0 18px -4px rgba(0, 0, 0, 0.45),
    inset -5px 0 6px -2px rgba(0, 0, 0, 0.25),
    /* Diagonal corners */ inset 8px 8px 14px -4px rgba(0, 0, 0, 0.3),
    inset -8px 8px 14px -4px rgba(0, 0, 0, 0.3),
    inset 8px -8px 14px -4px rgba(0, 0, 0, 0.3),
    inset -8px -8px 14px -4px rgba(0, 0, 0, 0.3);
}

/* 6. GLASS REFLECTION */
.glass-reflection {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 40%, rgba(0, 0, 0, 0.1) 100%);
}
```

### Icon glass dome (3-ring construction)

A convex glass indicator with the display icon inside.

```css
/* Ring 1 — Icon well (deep recess) */
.icon-well {
  background: #020304;
  border-radius: 50%;
  padding: 4px;
  box-shadow:
    inset 0 6px 14px rgba(0, 0, 0, 0.9),
    inset 0 2px 4px rgba(0, 0, 0, 1),
    inset 3px 0 8px rgba(0, 0, 0, 0.5),
    inset -3px 0 8px rgba(0, 0, 0, 0.5),
    inset 0 -3px 6px rgba(255, 255, 255, 0.015),
    0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Ring 2 — Machined step */
.icon-mid-ring {
  background: linear-gradient(180deg, #0a0b0d, #141618, #0a0b0d);
  border-radius: 50%;
  padding: 2px;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.7),
    inset 0 -1px 2px rgba(255, 255, 255, 0.02),
    0 1px 0 rgba(255, 255, 255, 0.03);
}

/* Ring 3 — Glass dome */
.icon-dome {
  position: relative;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 60%, #1a0808, #0c0305, #050102);
  box-shadow:
    inset 0 0 25px rgba(0, 0, 0, 0.7),
    inset 0 4px 8px rgba(0, 0, 0, 0.6),
    inset 0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(255, 26, 26, 0.05),
    inset 4px 0 8px rgba(0, 0, 0, 0.4),
    inset -4px 0 8px rgba(0, 0, 0, 0.4),
    0 0 8px rgba(255, 26, 26, 0.06);
  overflow: hidden;
}

/* Dome convex specular (5 highlights) */
.icon-dome::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  background:
    /* Primary apex */
    radial-gradient(ellipse 30% 22% at 45% 22%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%),
    /* Wider diffuse */ radial-gradient(ellipse 55% 40% at 48% 28%, rgba(255, 255, 255, 0.06) 0%, transparent 100%),
    /* Secondary catch */ radial-gradient(ellipse 25% 18% at 65% 72%, rgba(255, 255, 255, 0.035) 0%, transparent 100%),
    /* Left rim */ radial-gradient(ellipse 12% 50% at 12% 45%, rgba(255, 255, 255, 0.03) 0%, transparent 100%),
    /* Convex edge vignette */ radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.5) 100%);
}
```

### Projected color light on panel surface

```css
.color-projection {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  width: 500px;
  height: 200px;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255, 26, 26, 0.04) 0%, rgba(255, 26, 26, 0.015) 40%, transparent 70%);
  animation: proj-pulse 3s infinite ease-in-out;
}
```

### Vertical separator (machined groove)

```css
.v-separator {
  width: 2px;
  align-self: stretch;
  background: linear-gradient(180deg, transparent, #080a0c 20%, #080a0c 80%, transparent);
  box-shadow:
    1px 0 0 rgba(255, 255, 255, 0.02),
    -1px 0 0 rgba(0, 0, 0, 0.5);
  margin: 8px 0;
}
```

### Bottom status bar

```css
.bottom-groove {
  height: 2px;
  background: #080a0c;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.8),
    0 1px 0 rgba(255, 255, 255, 0.03);
}
.bottom-bar {
  background: linear-gradient(180deg, #1e2226, #12151a 40%, #0a0c0e);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

**Full working demo**: `assets/codepen-autochord-ui.html`

---

## 37. Frequency Analyzer Screen (Animated SVG)

A CRT-embedded frequency response analyzer with morphing Butterworth curves, FFT bars, neon glow, and log-frequency grid. Designed for DSP crossover visualization.

### Screen construction (chassis + bezel)

```css
.chassis {
  background: linear-gradient(180deg, #2a2c31 0%, #15171a 100%);
  padding: 2px;
  border-radius: 16px;
  box-shadow:
    0 60px 100px -20px rgba(0, 0, 0, 1),
    0 20px 40px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}
.chassis-inner {
  background: linear-gradient(135deg, #121316, #08090a);
  padding: 36px;
  border-radius: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 1);
  box-shadow: inset 0 6px 15px rgba(0, 0, 0, 0.8);
}
.screen-bezel {
  position: relative;
  background-color: #020304;
  border-radius: 10px;
  box-shadow:
    inset 0 35px 60px -10px rgba(0, 0, 0, 1),
    inset 0 0 30px 10px rgba(0, 0, 0, 1),
    inset 0 2px 2px rgba(0, 0, 0, 1),
    0 1px 0 rgba(255, 255, 255, 0.12);
  border-top: 3px solid #000;
  border-left: 3px solid #000;
  border-bottom: 1px solid #22252a;
  border-right: 1px solid #15181c;
  overflow: hidden;
}
```

### SVG neon glow filters

```xml
<!-- Blue neon for curves -->
<filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur stdDeviation="5" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>

<!-- Amber for warnings/indicators -->
<filter id="amberGlow" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="10" result="g" />
  <feMerge>
    <feMergeNode in="g" />
    <feMergeNode in="g" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### Butterworth curve math (4th order, 24dB/oct)

```tsx
const butterworth4 = (fRatio: number) => {
  const f4 = Math.pow(fRatio, 4);
  return 1 / Math.sqrt(1 + f4);
};

// HPF at fc=2000Hz
const hpfDb = (freq: number) => {
  const mag = butterworth4(2000 / freq);
  return 20 * Math.log10(Math.max(mag, 0.0001));
};

// LPF at fc=500Hz
const lpfDb = (freq: number) => {
  const mag = butterworth4(freq / 500);
  return 20 * Math.log10(Math.max(mag, 0.0001));
};
```

### Log-frequency axis helpers

```tsx
const LOG_MIN = Math.log10(20);
const LOG_MAX = Math.log10(20000);
const LOG_RANGE = LOG_MAX - LOG_MIN;

const freqToX = (hz: number, plotWidth: number, marginLeft: number) => ((Math.log10(hz) - LOG_MIN) / LOG_RANGE) * plotWidth + marginLeft;
```

### Scanline + glass overlays

```css
.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 100%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 40;
}
.glass-reflection {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(110deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.06) 30%, transparent 31%), radial-gradient(150% 100% at 50% -25%, rgba(255, 255, 255, 0.05) 0%, transparent 45%);
  pointer-events: none;
  z-index: 50;
  mix-blend-mode: screen;
}
```

**Full working demo**: `assets/codepen-curve-search.html`

---

## 38. Erratic/Anomaly Curve (Warning State)

Variant of the analyzer screen (pattern 37) showing a **chaotic, unpredictable curve** for anomaly/error states. Uses sum-of-sines with 60 random seeds for organic randomness.

### Chaotic curve generation

```tsx
// 60 random seeds for organic chaos
const seeds = Array.from({ length: 60 }, () => ({
  amp: (Math.random() - 0.5) * 2,
  freq: 0.5 + Math.random() * 3,
  phase: Math.random() * Math.PI * 2,
  drift: (Math.random() - 0.5) * 0.01
}));

// Build erratic curve: sum oscillations + spike regions
const buildErratic = (time: number) => {
  const pts = [];
  for (let i = 0; i <= 300; i++) {
    const norm = i / 300;
    let y = zeroDbY;
    // Sum chaotic oscillations
    for (const seed of seeds) {
      y += seed.amp * 18 * Math.sin(norm * seed.freq * 12 + seed.phase + time * 0.3);
    }
    // Sharp spikes at specific frequency regions
    if (norm > 0.15 && norm < 0.25) y -= 45 + Math.sin(time * 0.5) * 10;
    if (norm > 0.4 && norm < 0.48) y += 55 + Math.sin(time * 0.7) * 8;
    if (norm > 0.6 && norm < 0.65) y -= 35;
    if (norm > 0.78 && norm < 0.85) y += 40 + Math.sin(time * 0.4) * 12;
    if (norm > 0.9) y += (norm - 0.9) * 300; // High-freq rolloff
    pts.push(Math.max(60, Math.min(420, y)));
  }
  return pts;
};
```

### Fog/haze effect (SVG filters)

```xml
<!-- Heavy atmospheric fog -->
<filter id="heavyFog" x="-10%" y="-10%" width="120%" height="120%">
  <feGaussianBlur stdDeviation="12" />
</filter>

<!-- Medium blur for curve strokes -->
<filter id="fogBlur" x="-10%" y="-10%" width="120%" height="120%">
  <feGaussianBlur stdDeviation="6" result="fog" />
  <feMerge>
    <feMergeNode in="fog" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### Warning overlay construction

```xml
<!-- Semi-transparent backdrop + glowing text -->
<rect x="200" y="170" width="600" height="90" rx="8"
  fill="rgba(0,0,0,0.65)" stroke="rgba(255,68,34,0.25)" />
<text x="500" y="210" fill="#ff6644" font-size="38" font-weight="700"
  text-anchor="middle" filter="url(#warningGlow)">
  DIFFERENT CURVE
</text>
<text x="500" y="242" fill="#ff4422" font-size="17" font-weight="600"
  text-anchor="middle" opacity="0.7" filter="url(#softGlow)">
  VERIFICATION REQUIRED
</text>
```

### Color scheme (red/amber fog vs blue/cyan normal)

| State            | Curve stroke         | Fill gradient         | Ambient glow   | Badge text                         |
| ---------------- | -------------------- | --------------------- | -------------- | ---------------------------------- |
| **Normal** (37)  | `#38bdf8` cyan       | `#0ea5e9` → `#020617` | `#0a1830` blue | `DSP CROSSOVER — SCANNING`         |
| **Anomaly** (38) | `#ff6644` red-orange | `#ff4422` → `#020617` | `#100808` red  | `DSP CROSSOVER — ANOMALY DETECTED` |

**Full working demo**: `assets/codepen-different-curve.html`

---

## 39. Glow Projection Push Button

A 3D push button with **massive** color glow that bleeds onto neighboring elements. Features 14px physical travel depth, per-color specular, and rim light from adjacent button colors.

### Socket well (button housing)

```css
.socket {
  background: #050607;
  padding: 3px;
  border-radius: 20px;
  box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 1;
}
```

### Glow projection (bleeds onto neighbors)

The key effect: `::before` with `inset: -15px` + `blur(10px)` on the socket, creating a massive colored glow that extends beyond the button bounds and illuminates adjacent elements.

```css
/* Orange glow (FX button) */
.socket-fx.glow::before {
  content: "";
  position: absolute;
  inset: -15px;
  border-radius: 30px;
  background: radial-gradient(circle at center, rgba(255, 60, 0, 0.45) 0%, rgba(255, 60, 0, 0.1) 50%, transparent 80%);
  filter: blur(10px);
  pointer-events: none;
  z-index: -1;
}

/* Blue glow (MIC button) */
.socket-mic.glow::before {
  content: "";
  position: absolute;
  inset: -15px;
  border-radius: 30px;
  background: radial-gradient(circle at center, rgba(0, 130, 255, 0.45) 0%, rgba(0, 130, 255, 0.1) 50%, transparent 80%);
  filter: blur(10px);
  pointer-events: none;
  z-index: -1;
}
```

### Button OFF state (raised dark slab)

```css
.btn-base {
  width: 240px;
  height: 120px;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);
  /* Raised slab */
  background: linear-gradient(145deg, #2d2f35 0%, #16171a 100%);
  border: 1px solid #3a3d45;
  /* 14px physical travel depth */
  transform: translateY(-14px);
  box-shadow:
    0 4px 0 #0d0e10,
    0 10px 0 #08090a,
    0 14px 0 #040506,
    0 18px 30px rgba(0, 0, 0, 0.8),
    inset 2px 2px 5px rgba(255, 255, 255, 0.08),
    inset -2px -2px 8px rgba(0, 0, 0, 0.7);
}

/* Glass highlight */
.btn-base::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%);
  z-index: 1;
  pointer-events: none;
}

/* Press action */
.btn-base:active {
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 #08090a,
    inset 1px 1px 4px rgba(0, 0, 0, 0.9);
}
```

### Button ON state (orange / FX)

```css
.btn-fx.active {
  background: radial-gradient(circle at center, #ffa05d 0%, #ff4d00 45%, #9b1d00 100%);
  border: 1px solid rgba(80, 30, 0, 0.5);
  transform: translateY(-16px);
  box-shadow:
    /* Massive glow projection */
    0 0 50px rgba(255, 60, 0, 0.7),
    /* Thickness steps (side walls) */ 0 4px 0 #7a1800,
    0 8px 0 #5a1100,
    0 12px 0 #3a0a00,
    0 16px 20px rgba(0, 0, 0, 0.9),
    /* Internal lighting */ inset 0 18px 22px rgba(255, 255, 255, 0.6),
    inset 0 -12px 30px rgba(0, 0, 0, 0.8);
}

/* Specular hotspot (not flat glass) */
.btn-fx.active::before {
  background: radial-gradient(ellipse 55% 40% at 38% 20%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 200, 150, 0.05) 60%, transparent 100%);
}
```

### Button ON state (blue / MIC)

```css
.btn-mic.active {
  background: radial-gradient(circle at center, #5dc8ff 0%, #0084ff 50%, #003d7a 100%);
  border: 1px solid rgba(0, 30, 80, 0.5);
  transform: translateY(-16px);
  box-shadow:
    0 0 50px rgba(0, 130, 255, 0.7),
    0 4px 0 #002d5a,
    0 8px 0 #001a3a,
    0 12px 0 #000d1e,
    0 16px 20px rgba(0, 0, 0, 0.9),
    inset 0 18px 22px rgba(255, 255, 255, 0.5),
    inset 0 -12px 30px rgba(0, 0, 0, 0.8);
}
```

### Rim light from adjacent button

When one button is active, its color bleeds a subtle rim light onto the facing edge of the adjacent button.

```css
/* Orange rim on MIC's left edge (FX is ON) */
.btn-mic.rim-orange::after {
  content: "";
  position: absolute;
  top: 18%;
  bottom: 18%;
  left: 0;
  width: 2px;
  border-radius: 1px;
  z-index: 15;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 120, 40, 0.12) 18%, rgba(255, 120, 40, 0.55) 50%, rgba(255, 60, 0, 0.12) 82%, transparent 100%);
  box-shadow:
    0 0 3px rgba(255, 60, 0, 0.2),
    0 0 8px rgba(255, 60, 0, 0.08);
}

/* Blue rim on FX's right edge (MIC is ON) */
.btn-fx.rim-blue::after {
  content: "";
  position: absolute;
  top: 18%;
  bottom: 18%;
  right: 0;
  width: 2px;
  border-radius: 1px;
  z-index: 15;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(80, 180, 255, 0.12) 18%, rgba(80, 180, 255, 0.55) 50%, rgba(0, 130, 255, 0.12) 82%, transparent 100%);
  box-shadow:
    0 0 3px rgba(0, 130, 255, 0.2),
    0 0 8px rgba(0, 130, 255, 0.08);
}
```

### Active text glow

```css
.active .text-label {
  color: #ffffff;
  text-shadow:
    0 0 15px rgba(255, 255, 255, 0.9),
    0 0 30px rgba(255, 120, 0, 1); /* Match button color */
}
```

**Full working demo**: `assets/codepen-audio-interface-pro.html`

---

## 40. Thick Card Surface (Reports Card)

A raised card component with visible material thickness — top specular highlight, bottom bevel darkness, and a recessed inner container for content. Bridges neumorphic softness with skeuomorphic depth.

### Card surface (outer slab)

```css
.card-surface {
  background: linear-gradient(145deg, #32343a, #1a1b1f);
  border-radius: 48px;
  position: relative;
  box-shadow:
    /* Deep drop shadow */
    0 50px 100px -20px rgba(0, 0, 0, 0.9),
    /* Outline rim */ 0 0 0 1px rgba(255, 255, 255, 0.05),
    /* Bottom bevel (visible thickness) */ inset 0 -10px 15px rgba(0, 0, 0, 0.6),
    /* Top specular (light source above) */ inset 0 3px 3px rgba(255, 255, 255, 0.18);
}

/* ::after — subtle upper sheen wash */
.card-surface::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 48px;
  pointer-events: none;
  box-shadow: inset 0 25px 50px rgba(255, 255, 255, 0.04);
}
```

### Inner content recess

```css
.card-inner {
  background: #121317;
  border-radius: 40px;
  box-shadow:
    /* Depth hole */
    inset 0 12px 24px rgba(0, 0, 0, 0.7),
    /* Rim highlight (top of inner lip) */ 0 2px 2px rgba(255, 255, 255, 0.12),
    /* Outer bevel thickness */ 0 5px 8px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-right: 1px solid rgba(255, 255, 255, 0.04);
}
```

### Status pill (glossy colored badge)

```tsx
// Green status badge
const STATUS_PILL: React.CSSProperties = {
  background: "linear-gradient(to bottom right, #194a2b, #0f2218)",
  border: "1px solid rgba(58,255,116,0.3)",
  borderRadius: 16,
  padding: "12px 20px",
  boxShadow: "inset 0 2px 4px rgba(255,255,255,0.15), 0 10px 20px rgba(0,0,0,0.5)"
};

// Blue channel badge
const CHANNEL_PILL: React.CSSProperties = {
  background: "linear-gradient(to bottom right, #5fa2ff, #3b6bff)",
  color: "#0b1120",
  fontWeight: 700,
  borderRadius: 12,
  padding: "8px 16px",
  boxShadow: "inset 0 2px 3px rgba(255,255,255,0.35), 0 8px 18px rgba(0,0,0,0.45)",
  border: "1px solid rgba(255,255,255,0.2)"
};
```

**Full working demo**: `assets/codepen-reports-card.html`

---

## 41. Trench Toggle (Sliding Switch)

A large binary toggle where a beveled thumb slides inside a machined trench. 3-layer construction: outer housing → trench cavity → sliding thumb with LED indicator.

### Outer housing

```css
.toggle-outer {
  position: relative;
  width: 480px;
  height: 110px;
  padding: 3px;
  border-radius: 100px;
  background: linear-gradient(180deg, #14181c 0%, #242a31 100%);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 2px 3px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  user-select: none;
}
```

### Trench (deep cavity)

```css
.toggle-trench {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0d0f12;
  border-radius: 100px;
  box-shadow:
    inset 0 12px 20px rgba(0, 0, 0, 0.9),
    inset 0 -4px 8px rgba(255, 255, 255, 0.05);
  overflow: hidden;
}
```

### Sliding thumb

```css
.thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc(50% - 4px);
  border-radius: 100px;
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
  z-index: 10;
  /* Directional bevel borders */
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 0, 0, 0.5);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.15);
}
/* Left position */
.thumb.left {
  background: linear-gradient(165deg, #586170 0%, #3a424b 48%, #22272e 100%);
}
/* Right position (slides 100%) */
.thumb.right {
  background: linear-gradient(165deg, #4c5560 0%, #303740 50%, #1b1f25 100%);
  transform: translateX(100%);
}
```

### Color-switching glow text

```css
.glow-cyan {
  color: #cffafe;
  text-shadow:
    0 0 10px rgba(103, 232, 249, 0.7),
    0 0 20px rgba(103, 232, 249, 0.4);
}
.glow-amber {
  color: #ffedd5;
  text-shadow:
    0 0 10px rgba(251, 191, 36, 0.6),
    0 0 20px rgba(251, 191, 36, 0.3);
}
```

### LED indicator dot (recessed in thumb)

```css
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #111418;
  box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.8);
}
.dot-active {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  /* Cyan or amber depending on state */
  background: rgba(103, 232, 249, 0.8);
  box-shadow: 0 0 6px rgba(103, 232, 249, 1);
}
```

**Full working demo**: `assets/codepen-toggle-hifi.html`

---

## 42. Well-Mounted Button (Anodized with Light Projection)

A large oval button recessed in a machined well, with full lighting system: OFF state (dark anodized), ON state (lit with rim light, internal glow, and light projected onto the surrounding panel surface).

### Button well (machined recess)

```css
.button-well {
  position: relative;
  padding: 14px;
  border-radius: 9999px;
  background: linear-gradient(180deg, #040404, #080808, #060606);
  box-shadow:
    inset 0 3px 8px rgba(0, 0, 0, 0.9),
    inset 0 6px 20px rgba(0, 0, 0, 0.5),
    inset 0 -1px 2px rgba(255, 255, 255, 0.02),
    0 -1px 0 rgba(255, 255, 255, 0.05),
    0 1px 0 rgba(0, 0, 0, 0.8),
    0 4px 20px rgba(0, 0, 0, 0.6);
  border: 1px solid #060606;
  transition:
    box-shadow 0.5s ease,
    border-color 0.5s ease;
}
```

### Well-lit state (8-layer rim light on chassis lip)

```css
.button-well.well-lit {
  border-color: rgba(220, 60, 50, 0.24);
  box-shadow:
    /* Retained depth shadows */
    inset 0 3px 8px rgba(0, 0, 0, 0.9),
    inset 0 6px 20px rgba(0, 0, 0, 0.5),
    inset 0 -1px 2px rgba(255, 255, 255, 0.02),
    /* RIM LIGHT on chassis lip (8 layers, directional) */ 0 -1px 0 rgba(255, 180, 160, 0.36),
    /* top: primary catch */ 0 -2px 4px rgba(220, 50, 40, 0.28),
    0 -3px 10px rgba(200, 40, 30, 0.16),
    -1px 0 0 rgba(255, 170, 150, 0.24),
    /* left: light-side */ -2px 0 6px rgba(200, 45, 35, 0.16),
    0 1px 0 rgba(220, 60, 50, 0.16),
    /* bottom: bounce */ 0 2px 6px rgba(200, 40, 30, 0.12),
    1px 0 0 rgba(200, 50, 40, 0.08),
    /* right: weakest */ 0 4px 20px rgba(0, 0, 0, 0.6);
}
```

### Red light bouncing inside well walls (::before, 8 radial gradients)

```css
.button-well.well-lit::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  pointer-events: none;
  z-index: 1;
  background:
    /* top rim (hot spot) */
    radial-gradient(ellipse 70% 12% at 50% 0%, rgba(240, 60, 50, 0.44) 0%, rgba(220, 50, 40, 0.2) 40%, transparent 100%),
    radial-gradient(ellipse 85% 18% at 50% 2%, rgba(200, 40, 30, 0.16) 0%, transparent 100%),
    /* bottom rim */ radial-gradient(ellipse 60% 10% at 50% 100%, rgba(220, 50, 40, 0.28) 0%, transparent 100%),
    radial-gradient(ellipse 75% 15% at 50% 98%, rgba(190, 35, 25, 0.1) 0%, transparent 100%),
    /* left rim */ radial-gradient(ellipse 6% 40% at 0% 50%, rgba(230, 55, 45, 0.32) 0%, transparent 100%),
    radial-gradient(ellipse 10% 55% at 1% 50%, rgba(190, 35, 25, 0.1) 0%, transparent 100%),
    /* right rim */ radial-gradient(ellipse 5% 35% at 100% 50%, rgba(210, 45, 35, 0.24) 0%, transparent 100%),
    radial-gradient(ellipse 8% 50% at 99% 50%, rgba(180, 30, 20, 0.08) 0%, transparent 100%);
}
```

### Button ON state (multi-layer lit surface)

```css
.skeuo-on {
  background-color: #8a1515;
  background-image:
    /* Surface glow (on the button itself) */
    radial-gradient(ellipse 80% 50% at 50% 35%, rgba(255, 80, 60, 0.14) 0%, transparent 70%),
    /* Specular: top-left offset */ radial-gradient(ellipse 40% 25% at 35% 20%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 200, 200, 0.06) 50%, transparent 100%),
    /* Brush texture */ repeating-radial-gradient(ellipse at 50% 50%, transparent 0%, transparent 2.5%, rgba(255, 255, 255, 0.015) 2.8%, transparent 3.1%),
    /* Curvature */ radial-gradient(ellipse 130% 90% at 50% 38%, #cc2222 0%, #a01818 30%, #651010 65%, #350808 100%);
  box-shadow:
    /* Rim light (directional, 5 edges) */
    inset 0 1px 0 rgba(255, 220, 200, 0.18),
    inset 1px 1px 0 rgba(255, 200, 180, 0.08),
    inset 1px 0 0 rgba(255, 180, 160, 0.06),
    inset 0 -1px 0 rgba(255, 150, 130, 0.03),
    inset -1px 0 0 rgba(0, 0, 0, 0.3),
    /* Body surface glow */ inset 0 0 24px rgba(255, 60, 50, 0.14),
    inset 0 0 40px rgba(255, 40, 30, 0.06),
    /* Depth */ inset 0 -8px 20px rgba(0, 0, 0, 0.5),
    /* Projected light (close) */ 0 0 12px rgba(200, 30, 30, 0.12),
    0 0 30px rgba(180, 20, 20, 0.06);
}
```

### Surface light projection (onto panel behind)

```css
.light-projection {
  position: absolute;
  width: 550px;
  height: 350px;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 0.6s ease;
  opacity: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 40%, rgba(220, 40, 30, 0.2) 0%, rgba(200, 30, 20, 0.1) 40%, transparent 70%),
    radial-gradient(ellipse 100% 80% at 50% 38%, rgba(180, 25, 15, 0.1) 0%, transparent 80%);
  animation: projection-breathe 3s infinite ease-in-out;
}
.light-projection.active {
  opacity: 1;
}
```

**Full working demo**: `assets/codepen-bouton-skeuomorphique.html`

---

## 43. Mechanical Keyboard Key (Spring Return)

A compact rectangular button with 14-layer shadow stack, 4px bottom border simulating key travel, and spring-back animation. Pure CSS mechanical press feel.

### Key construction (OFF/resting state)

```css
.key-button {
  padding: 22px 58px;
  border-radius: 10px;
  cursor: pointer;
  /* 3-stop gradient for curvature */
  background: linear-gradient(180deg, #2e2e34 0%, #222226 35%, #161618 100%);
  /* Thick directional bevel */
  border-top: 2px solid rgba(255, 255, 255, 0.11);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(0, 0, 0, 0.4);
  border-bottom: 4px solid #050506; /* ← travel height */
  /* 14-layer shadow stack */
  box-shadow:
    /* Inner depth */
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 2px 1px rgba(255, 255, 255, 0.05),
    inset 0 6px 8px rgba(255, 255, 255, 0.02),
    inset 0 -2px 3px rgba(0, 0, 0, 0.5),
    inset 0 -5px 10px rgba(0, 0, 0, 0.3),
    inset 0 -8px 16px rgba(0, 0, 0, 0.15),
    inset 3px 0 4px rgba(0, 0, 0, 0.2),
    inset -3px 0 4px rgba(0, 0, 0, 0.2),
    /* External cast (6 progressive distances) */ 0 2px 1px rgba(0, 0, 0, 0.7),
    0 4px 6px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.5),
    0 16px 32px rgba(0, 0, 0, 0.4),
    0 24px 48px rgba(0, 0, 0, 0.25),
    0 32px 64px rgba(0, 0, 0, 0.15);
  /* Spring return animation */
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.15s ease-out,
    border-bottom-width 0.08s ease-out;
}
```

### Pressed state (mechanical travel)

```css
.key-button:active {
  transform: translateY(3px); /* physical press */
  border-bottom-width: 1px; /* border shrinks = key sinks */
  background: linear-gradient(180deg, #1a1a1e, #121214 35%, #0a0a0c);
  box-shadow:
    /* Reduced inner glow */
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 3px 6px rgba(0, 0, 0, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    inset 3px 0 4px rgba(0, 0, 0, 0.2),
    inset -3px 0 4px rgba(0, 0, 0, 0.2),
    /* Reduced cast (closer to surface) */ 0 1px 1px rgba(0, 0, 0, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3);
}
```

### Neon text activation (lit after press)

```css
.key-text.lit {
  color: #38bdf8;
  text-shadow:
    0 0 4px rgba(56, 189, 248, 0.9),
    0 0 12px rgba(56, 189, 248, 0.6),
    0 0 28px rgba(56, 189, 248, 0.3),
    0 0 50px rgba(56, 189, 248, 0.12);
}
```

**Key insight**: The `border-bottom: 4px → 1px` on `:active` combined with `translateY(3px)` creates a convincing mechanical key travel. The `cubic-bezier(0.34, 1.56, 0.64, 1)` spring overshoot makes the return feel physical.

**Full working demo**: `assets/codepen-valider-button.html`

### Variant: Thin Ledge Keypad (compact segmented / multi-state selector)

The stack above is a **raised bombe key** — right for a single, large, isolated key. For a **compact segmented control** (a radiogroup of 2-4 keys sharing ONE recessed well: source selectors, mode/level pickers like `Off/Low/Med/High`, `Absent/Aftermarket/OEM`), that bombe stack is too tall and heavy. Use a **thin ledge keycap**: a flat machined face with a single SOLID thickness band, seated in a shared recessed well that carries the depth.

Reconciles with C6 (`buttons >= 5 layers`): here the depth lives in the **shared well** (>= 5 inset layers) per C8 (depth first). Each keycap needs only 2-3 layers — a solid ledge band + a drop — because it is set INTO the well, not floating in isolation. Do NOT pad individual keycaps to 5 to satisfy a per-element count; count the well + keys as one system.

**Recessed well behind the keys** (shallow control-panel recess — NOT a deep display well):

```css
.keypad-well {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px;
  border-radius: 3px;
  background: linear-gradient(180deg, hsl(25 6% 12%), hsl(25 5% 9%));
  box-shadow:
    inset 0 1px 0 rgba(255, 250, 240, 0.22), /* warm machined rim — FRONTMOST (1er layer) so it stays visible; §16.2 floor 0.20 */
    inset 0 2px 3px hsl(0 0% 0% / 0.55), /* recess top gorge */
    inset 0 1px 1px hsl(0 0% 0% / 0.4), /* upper wall */
    inset 2px 0 2px hsl(0 0% 0% / 0.3), /* left wall */
    inset -2px 0 2px hsl(0 0% 0% / 0.3), /* right wall */
    inset 0 -2px 3px hsl(0 0% 0% / 0.45); /* bottom catch — the well carries the depth (>= 5 inset) */
}
```

**Ledge keycap — REST.** The `inset 0 -6px` is a SOLID band (no blur) = the visible key thickness; the label rides `-4px` up on the lit face.

```css
.ledge-key {
  min-height: 44px;
  border: 2px solid hsl(25 6% 17%);
  border-radius: 8px;
  background: linear-gradient(135deg, hsl(25 9% 25%), hsl(25 7% 19%)); /* 135deg */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* drop into the well */
}
.ledge-key-inner {
  border-radius: 6px;
  padding: 10px 6px;
  box-shadow:
    inset 0 -6px hsl(25 5% 11%), /* SOLID thickness band = the ledge */
    0 -2px hsl(25 9% 24%); /* top light line */
}
.ledge-key-label {
  color: rgba(255, 240, 220, 0.9); /* warm, U6 */
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5); /* engraved */
  transform: translate3d(0, -4px, 0); /* label rides up on the face */
}
```

**PRESS — flat.** Shadows collapse, the label drops flush. Cheaper and more tactile than a big translate.

```css
.ledge-key:active,
.ledge-key:active .ledge-key-inner {
  box-shadow: none;
}
.ledge-key:active .ledge-key-label {
  transform: translate3d(0, 0, 0);
}
```

**SELECTED (persistent radio state) — seated flat + accent backlight, NOT raised.** The chosen key is LIT, not popped up.

```css
.ledge-key[aria-checked="true"] {
  border-color: var(--accent-border); /* e.g. rgba(0,204,255,0.4) */
  background: linear-gradient(135deg, hsl(25 6% 12%), hsl(25 5% 8%)); /* seated dark */
  box-shadow: none;
}
.ledge-key[aria-checked="true"] .ledge-key-inner {
  box-shadow: inset 0 0 12px var(--accent-glow);
}
.ledge-key[aria-checked="true"] .ledge-key-label {
  transform: translate3d(0, 0, 0);
  color: var(--accent-text);
  text-shadow: 0 0 6px var(--accent-glow), 0 1px 0 rgba(0, 0, 0, 0.6);
}
```

**A11y (obligatoire pour un keypad copiable).** Le keycap doit porter `role="radio"` dans un conteneur `role="radiogroup"` (ou etre un `<input type="radio">` natif) pour que `aria-checked` soit valide — sinon ARIA invalide. Les etats non montres ici se reprennent du standard (SKILL.md « Etats interactifs ») et restent obligatoires : `:focus-visible { outline: 2px solid hsl(35 100% 60%); outline-offset: 2px; }` (a11y clavier, NON negociable), `:disabled / [aria-disabled="true"] { opacity: 0.5; filter: saturate(0.3); pointer-events: none; }`, hover = highlight +0.05.

**TRAP — label doubling.** Do NOT render the keycap label with `background-clip: text` / `-webkit-background-clip: text` (the chrome-text trick in `08-metal-effects.md` §24.4). On these small stacked keys it renders a DOUBLED/ghosted label. Use a solid `color` + `text-shadow` (silkscreen/engraved, or lit phosphor when selected). Reserve `background-clip: text` for large isolated display headings, never for keypad labels.

**Key insight**: bombe (this section) vs ledge are two valid keypad idioms — pick bombe for a single big key, ledge for a dense segmented control. In the ledge idiom the WELL carries the recession and the SELECTED key reads by BACKLIGHT, not by height.

**Real-world reference**: a production car-audio zone selector needed ~20 iterations to converge on exactly these choices (solid ledge band, flat press, backlit-not-raised selection, no `background-clip:text`). They are captured here so it is one-shot next time.

---

## 44. OEM EQ Curve Analyzer (Annotated Parametric Display)

Extends the frequency analyzer screen (pattern 37) with **parametric EQ modeling** — bass boost, mid scoop, presence peak, treble rolloff — and annotated callout markers. Designed for OEM factory signal analysis.

### Parametric EQ filter math

```tsx
// Bell (peaking) filter approximation
const parametricBell = (freq: number, fc: number, gainDb: number, Q: number) => {
  const ratio = freq / fc;
  const x2 = ratio * ratio;
  const bw = 1 / Q;
  const denom = (1 - x2) * (1 - x2) + bw * ratio * (bw * ratio);
  const response = (bw * ratio * (bw * ratio)) / denom;
  return gainDb * response;
};

// High shelf filter
const highShelf = (freq: number, fc: number, gainDb: number, slope: number) => {
  const rn = Math.pow(freq / fc, slope);
  return (gainDb * rn) / (1 + rn);
};
```

### Typical OEM EQ shape

```tsx
const getOemEqDb = (freq: number) => {
  let db = 0;
  // Sub-bass rolloff (HPF ~35Hz, gentle)
  const subR4 = Math.pow(freq / 35, 4);
  db += 10 * Math.log10(subR4 / (1 + subR4));
  // Bass boost: +5.5dB at 100Hz, Q=1.2
  db += parametricBell(freq, 100, 5.5, 1.2);
  // Mid scoop: -4dB at 500Hz, Q=0.8
  db += parametricBell(freq, 500, -4.0, 0.8);
  // Presence peak: +3dB at 2500Hz, Q=1.5
  db += parametricBell(freq, 2500, 3.0, 1.5);
  // Treble rolloff: -10dB above 8kHz
  db += highShelf(freq, 8000, -10, 3);
  return db;
};
```

### SVG annotation callouts

```xml
<!-- Dot marker + dashed leader line + label -->
<g opacity="0.6">
  <circle cx={freqToX(100)} cy={dbToY(5.5)} r="5" fill="#f59e0b"
    filter="url(#annotGlow)" />
  <line x1={x} y1={y-8} x2={x} y2={y-35}
    stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 2" />
  <text x={x} y={y-40} fill="#f59e0b" font-size="9" font-weight="700"
    text-anchor="middle">BASS BOOST</text>
  <text x={x} y={y-28} fill="#b37a0a" font-size="8" font-weight="600"
    text-anchor="middle">+5.5 dB @ 100 Hz</text>
</g>
```

### Blinking detection label

```xml
<text x="500" y="340" fill="#f59e0b" font-size="36" font-weight="700"
  text-anchor="middle" filter="url(#neonGlow)">
  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s"
    repeatCount="indefinite" />
  OEM EQ DETECTED
</text>
```

### Info panel (DSP-style readout)

```xml
<rect x="780" y="48" width="170" height="120" rx="4"
  fill="rgba(0,0,0,0.5)" stroke="rgba(245,158,11,0.15)" />
<!-- Key/value rows -->
<text x="795" y="110" fill="#4a5a78" font-size="9">SOURCE</text>
<text x="940" y="110" fill="#8898b8" font-size="10" text-anchor="end">Head Unit</text>
<text x="795" y="142" fill="#4a5a78" font-size="9">CORRECTION</text>
<text x="940" y="142" fill="#ef4444" font-size="10" text-anchor="end">REQUIRED</text>
```

### Color scheme: amber for OEM (vs cyan for crossover)

| Element       | Crossover (37)  | OEM EQ (44)          |
| ------------- | --------------- | -------------------- |
| Curve stroke  | `#38bdf8` cyan  | `#f59e0b` amber      |
| Fill gradient | blue tones      | amber/brown tones    |
| Ambient glow  | `#0a1830`       | `#061020`            |
| Badge         | `DSP CROSSOVER` | `DSP INPUT ANALYSIS` |

**Full working demo**: `assets/codepen-oem-eq-curve.html`

---

## 45. Full-Range / Flat Response Display

Extends the analyzer screen (pattern 37) for displaying a **flat 0dB passband** (no crossover applied). Uses a thick neon line at 0dB with endpoint markers and bandwidth arrows.

### Flat response rendering

Unlike Butterworth curves, the full-range display uses a simple horizontal rect at `zeroDbY` with neon glow filter, since `preserveAspectRatio="none"` would squish a horizontal SVG path to invisible.

```xml
<!-- Thick flat line (rect instead of path) -->
<rect x={MARGIN_L} y={zeroDbY - 3} width={PLOT_W} height="6"
  rx="3" fill="#38bdf8" filter="url(#neonGlow)" />

<!-- Endpoint markers -->
<circle cx={MARGIN_L} cy={zeroDbY} r="4" fill="#38bdf8" filter="url(#softGlow)" />
<circle cx={MARGIN_R} cy={zeroDbY} r="4" fill="#38bdf8" filter="url(#softGlow)" />
```

### Bandwidth indicator arrows

```xml
<g opacity="0.35">
  <!-- Left arrow -->
  <line x1={MARGIN_L+10} y1={y+20} x2={MARGIN_L+60} y2={y+20}
    stroke="#4ade80" stroke-width="1.5" />
  <line x1={MARGIN_L+10} y1={y+16} x2={MARGIN_L+10} y2={y+24}
    stroke="#4ade80" stroke-width="1.5" />
  <!-- Right arrow -->
  <line x1={MARGIN_R-60} y1={y+20} x2={MARGIN_R-10} y2={y+20}
    stroke="#4ade80" stroke-width="1.5" />
  <!-- Center label -->
  <text x="500" y={y+24} fill="#4ade80" font-size="10" text-anchor="middle">
    20 Hz ~ 20 kHz
  </text>
</g>
```

### Color scheme: green for full-range pass

| Element    | Crossover (37)             | Full Range (45)                          |
| ---------- | -------------------------- | ---------------------------------------- |
| Curve/line | `#38bdf8` cyan             | `#38bdf8` cyan + `#4ade80` green markers |
| Fill       | Blue gradient              | Green gradient (`#0ea5e9` → transparent) |
| Info panel | —                          | Green border `rgba(74,222,128,0.15)`     |
| Badge      | `DSP CROSSOVER — SCANNING` | `DSP CROSSOVER` (green glow)             |
| Status     | HPF/LPF values             | `BYPASS` / `BYPASS`                      |

### Info panel (bypass status)

```xml
<rect x="780" y="300" width="170" height="105" rx="4"
  fill="rgba(0,0,0,0.5)" stroke="rgba(74,222,128,0.15)" />
<text x="865" y="322" fill="#4ade80" font-size="20" font-weight="700"
  text-anchor="middle">FULL RANGE</text>
<text x="865" y="338" fill="#2a6545" font-size="10">NO CROSSOVER</text>
<!-- HPF/LPF both BYPASS -->
<text x="795" y="362" fill="#4a5a78" font-size="9">HPF</text>
<text x="940" y="362" fill="#5a6a4a" font-size="10" text-anchor="end">BYPASS</text>
```

**Full working demo**: `assets/codepen-fullrange-no-crossover.html`

---

## 46. LPF Crossover Display (Subwoofer Channel)

A complete DSP crossover screen showing a **low-pass filter** curve with animated FFT bars, cutoff frequency indicator, and DSP info panel. Extends pattern 37 (analyzer screen) with filter-specific annotations.

### Key differences from pattern 37

| Feature          | Pattern 37 (general analyzer) | Pattern 46 (LPF crossover)                     |
| ---------------- | ----------------------------- | ---------------------------------------------- |
| Curve type       | Generic Butterworth bandpass  | Specific LPF: `1 / (1 + (f/fc)^4)`             |
| FFT behavior     | Uniform random                | Passband active / stopband attenuated          |
| Cutoff indicator | Static                        | Animated drifting fc (60-120Hz) + pulsing dot  |
| Zone labeling    | —                             | PASSBAND (left) / REJECTED (right, red tint)   |
| Info panel       | —                             | Filter type, slope, order + channel assignment |

### Butterworth LPF magnitude (4th order, 24dB/oct)

```js
const ratio = freq / cutoffHz;
const r4 = Math.pow(ratio, 4);
const magLin = 1 / (1 + r4);
const magDb = 10 * Math.log10(Math.max(magLin, 1e-10));
const y = Math.min(dbToY(magDb), 455);
```

### Cutoff frequency indicator construction

```xml
<!-- Pulsing dot at -3dB intersection -->
<circle cx={cx} cy={minus3Y} r="7" fill="#ff4400"
  filter="url(#cutoffGlow)"
  style="animation: cutoff-pulse 2s ease-in-out infinite" />

<!-- "fc" label above -->
<text x={cx} y="42" fill="#ff4400" font-size="12" font-weight="700"
  text-anchor="middle"
  style="filter: drop-shadow(0 0 6px rgba(255,68,0,0.5))">fc</text>

<!-- Frequency badge below -->
<rect x={cx - 40} y="448" width="80" height="22" rx="3"
  fill="rgba(0,0,0,0.6)" stroke="rgba(255,68,0,0.2)" />
<text x={cx} y="464" fill="#ff6633" font-size="13" font-weight="700"
  text-anchor="middle">{cutoffLabel}</text>
```

### DSP info panel (SVG overlay)

```xml
<rect x="820" y="48" width="135" height="105" rx="4"
  fill="rgba(0,0,0,0.5)" stroke="rgba(56,189,248,0.15)" />
<text x="887" y="68" fill="#38bdf8" font-size="22" font-weight="700"
  text-anchor="middle">LPF</text>
<text x="887" y="84" fill="#2a4a65" font-size="10">LOW-PASS FILTER</text>
<!-- Key/value rows -->
<text fill="#4a5a78" font-size="9">TYPE</text>
<text fill="#8898b8" font-size="10" text-anchor="end">Butterworth</text>
<text fill="#4a5a78" font-size="9">SLOPE</text>
<text fill="#8898b8" font-size="10" text-anchor="end">24 dB/oct</text>
```

### Stopband red tint zone

```xml
<!-- Semi-transparent red zone right of cutoff -->
<rect x={cx} y="40" width={MARGIN_R - cx} height="415"
  fill="rgba(255,20,0,0.03)" />
```

### Animated FFT with passband/stopband behavior

```js
fftRef.current.forEach((pt) => {
  if (pt.x < cxSvg - 30) {
    // Passband: active bass energy
    pt.target = 100 + Math.random() * 220;
  } else if (pt.x < cxSvg + 80) {
    // Transition: blend
    const r = (pt.x - (cxSvg - 30)) / 110;
    pt.target = (100 + Math.random() * 220) * (1 - r) + (400 + Math.random() * 25) * r;
  } else {
    // Stopband: attenuated
    pt.target = 405 + Math.random() * 25;
  }
});
```

### Color coding

| Element           | Color                   | Purpose                   |
| ----------------- | ----------------------- | ------------------------- |
| LPF curve         | `#38bdf8`               | Main filter shape         |
| Passband fill     | `#0ea5e9` → transparent | Signal passing through    |
| Cutoff dot / line | `#ff4400`               | Critical frequency marker |
| -3dB reference    | `#ff8800`               | Half-power point          |
| Slope annotation  | `#ff6644`               | Rolloff steepness         |
| Channel badge     | `#cc8822`               | SUBWOOFER assignment      |

**Full working demo**: `assets/codepen-lpf-crossover.html`

---

## 47. Glass Sphere Toggle (Electrical Switch)

A large toggle switch with a **glass sphere knob** that slides between two electrical contacts inside a recessed track. Features guide rails, tick marks, bus bars, arc glow, and contact LEDs.

### Track construction (5 internal mechanism layers)

```
Track (pill-shaped recess)
├── Central guide rail (6px height, metal gradient)
├── Twin guide rails (±22px offset, 2px each)
├── Tick marks (11 marks, major/minor)
├── Bus bars (±34px, gradient showing current flow direction)
└── Arc glow (radial gradient near active contact)
```

### Track container

```tsx
const TRACK: React.CSSProperties = {
  position: "relative",
  width: 380,
  height: 210,
  borderRadius: 105,
  cursor: "pointer",
  background: "#131523",
  border: `5px solid rgba(${activeColor},${isOn ? 0.7 : 0.12})`,
  boxShadow: [
    "inset 0 30px 45px rgba(0,0,0,0.8)",
    "inset 0 6px 12px rgba(0,0,0,0.5)",
    "inset 4px 0 8px rgba(0,0,0,0.2)",
    "inset -4px 0 8px rgba(0,0,0,0.2)",
    "inset 0 -2px 4px rgba(255,255,255,0.01)",
    "inset 0 0 20px rgba(0,0,0,0.3)",
    // Dynamic color glow (ON state)
    `inset 0 0 25px rgba(${ac},0.15)`,
    `0 0 15px rgba(${ac},0.3)`,
    `0 0 35px rgba(${ac},0.12)`,
    `0 0 60px rgba(${ac},0.04)`,
    "0 8px 24px rgba(0,0,0,0.35)"
  ].join(", "),
  overflow: "hidden"
};
```

### Glass sphere knob (5-layer specular system)

```
Sphere (165×165 circle)
├── Base: radial-gradient(circle at 35% 30%, #495273 → #181a29 → #0e0f19)
├── Primary glass highlight (75%×55% ellipse, top-left, 13% opacity)
├── Glass sheen (35%×25% spot, 22% opacity)
├── Rim catch (45%×12% crescent, 10% opacity)
├── Bottom reflected light (subtle 3% counter-fill)
├── Neon color bleed (positioned toward active contact)
├── Edge ring (1px border 3.5% opacity)
└── Noise overlay (SVG fractalNoise, 1.8% opacity)
```

### Sphere CSS (React inline style)

```tsx
const GLASS_SPHERE: React.CSSProperties = {
  width: 165,
  height: 165,
  borderRadius: "50%",
  background: "radial-gradient(circle at 35% 30%, #495273 0%, #181a29 55%, #0e0f19 100%)",
  boxShadow: [
    "18px 18px 35px rgba(0,0,0,0.8)",
    "8px 8px 16px rgba(0,0,0,0.5)",
    "-3px -3px 12px rgba(255,255,255,0.02)",
    "inset 1px 1px 4px rgba(255,255,255,0.06)",
    "inset 3px 3px 12px rgba(255,255,255,0.03)",
    "inset 0 -5px 12px rgba(0,0,0,0.5)",
    "inset -3px 0 10px rgba(0,0,0,0.3)",
    "inset 0 0 20px rgba(0,0,0,0.15)"
  ].join(", ")
};
```

### Electrical contacts (ON/OFF terminals)

Each contact is a recessed rectangle with a center LED dot:

```tsx
// Active contact — 4-level halo glow
{
  border: `1px solid rgba(${color},0.5)`,
  boxShadow: `0 0 4px rgba(${color},0.7), 0 0 12px rgba(${color},0.35), 0 0 28px rgba(${color},0.15), 0 0 45px rgba(${color},0.06), inset 0 0 10px rgba(${color},0.25)`,
}
// Center LED dot
{
  background: `radial-gradient(circle, rgba(200,250,255,0.95) 0%, rgba(${color},0.4) 50%, transparent 100%)`,
  boxShadow: `0 0 5px rgba(${color},0.9), 0 0 10px rgba(${color},0.5)`,
  animation: "contact-pulse 2s ease-in-out infinite",
}
```

### Dual color system

| State      | Primary color             | Accent use                          |
| ---------- | ------------------------- | ----------------------------------- |
| ON (right) | `0,230,255` (cyan)        | Border, contact glow, bus bar right |
| OFF (left) | `255,160,40` (warm amber) | Border, contact glow, bus bar left  |

### Spring animation

```tsx
transition: ready ? "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
transform: `translateY(-50%) translateX(${isOn ? 170 : 0}px)`,
```

**Full working demo**: `assets/codepen-glass-sphere-toggle.html`

---

## 48. Red Glassmorphism Button (CTA Pill)

A wide **frosted-glass pill button** with red accent circle and glassmorphic hover/active states. Uses `backdrop-blur-2xl` for true frosted glass effect.

### Construction (Tailwind classes)

```
Button (pill, 90px radius)
├── Base: bg-white/[0.03] backdrop-blur-2xl
├── Directional borders: border-t-white/[0.12], border-l-white/[0.08]
├── Red circle icon: bg-gradient-to-br from-red-500/90 to-red-700/90
├── Text: text-white/90, 3xl, font-semibold
└── States: hover (scale 1.02, red border tint), active (scale 0.98, inset shadow)
```

### Key Tailwind class stack

```html
<button
  class="
  bg-white/[0.03] backdrop-blur-2xl
  border border-white/[0.03] border-t-white/[0.12] border-l-white/[0.08]
  shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
  hover:bg-white/[0.06] hover:scale-[1.02]
  hover:border-t-red-500/40 hover:border-l-red-500/20
  hover:shadow-[0_30px_50px_-10px_rgba(0,0,0,0.6),0_0_30px_rgba(239,68,68,0.15),inset_0_1px_2px_rgba(239,68,68,0.4)]
  active:scale-[0.98] active:bg-white/[0.02]
  active:shadow-[inset_4px_4px_15px_rgba(0,0,0,0.4),inset_-4px_-4px_15px_rgba(255,255,255,0.02)]
  transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
  rounded-[90px] min-w-[380px]
"
></button>
```

### Red icon circle with inner specular

```html
<div
  class="w-20 h-20 rounded-full
  bg-gradient-to-br from-red-500/90 to-red-700/90
  shadow-[0_8px_20px_rgba(239,68,68,0.4),inset_2px_2px_4px_rgba(255,255,255,0.4)]
  group-hover:shadow-[0_12px_25px_rgba(239,68,68,0.6)]
  group-hover:scale-105
  transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
></div>
```

### Glassmorphism recipe

| Property                | Value                            | Purpose                  |
| ----------------------- | -------------------------------- | ------------------------ |
| `bg-white/[0.03]`       | 3% white background              | Near-invisible tint      |
| `backdrop-blur-2xl`     | 40px blur                        | Frosted glass            |
| `border-t-white/[0.12]` | Top border 12%                   | Light source highlight   |
| `border-l-white/[0.08]` | Left border 8%                   | Secondary highlight      |
| Spring bezier           | `cubic-bezier(0.34,1.56,0.64,1)` | Overshoot on hover/press |

**Full working demo**: `assets/codepen-red-glassmorphism-button.html`

---

## 49. Glossy Pill Button with LED Backlight (Accepter)

A large **glossy capsule button** inside a dark shell casing. Features a prominent top-hemisphere glass reflection, bottom bounce light, and a green LED radial glow that activates on press.

### 4-layer construction

```
Shell casing (rounded-[60px], inset shadows)
├── Projected light (green glow onto shell, only on :active)
└── Button capsule (rounded-[60px])
    ├── Internal LED glow (radial gradient, green, opacity 0 → 1 on active)
    ├── Glassy top reflection (60% white → transparent, top 46px)
    ├── Bottom glass reflection (10% white → transparent)
    ├── Rim light (double ring: 1.5px + 1px borders with mix-blend-overlay)
    └── Text (uppercase, drop-shadow)
```

### Shell casing

```html
<div
  class="p-[14px] md:p-[18px] rounded-[60px] bg-[#1b1f26]
  shadow-[inset_0_2px_2px_rgba(255,255,255,0.08),inset_0_-6px_10px_rgba(0,0,0,0.6),0_30px_60px_rgba(0,0,0,0.55)]"
></div>
```

### Button with 3 reflection layers

```html
<!-- Glassy top reflection: white/60 to transparent -->
<div
  class="absolute top-[6px] left-[12px] right-[12px] h-[46px] rounded-[40px]
  bg-gradient-to-b from-white/60 to-transparent opacity-80
  group-active:from-green-100/80"
/>

<!-- Bottom bounce light -->
<div
  class="absolute bottom-[6px] left-[15%] right-[15%] h-[20px] rounded-[40px]
  bg-gradient-to-t from-white/10 to-transparent opacity-50
  group-active:from-green-200/30"
/>

<!-- Rim light (double ring) -->
<div
  class="absolute inset-0 rounded-[60px]
  border-[1.5px] border-white/10 border-t-white/50 border-b-black/80
  mix-blend-overlay group-active:border-t-green-300/70"
/>
```

### Active state color switch

| Element           | Rest                | Active                                                       |
| ----------------- | ------------------- | ------------------------------------------------------------ |
| Top reflection    | `from-white/60`     | `from-green-100/80`                                          |
| Bottom reflection | `from-white/10`     | `from-green-200/30`                                          |
| Rim top border    | `border-t-white/50` | `border-t-green-300/70`                                      |
| Inner LED         | `opacity-0`         | `opacity-100` (green radial)                                 |
| Shell projection  | none                | `bg-green-500/20 shadow-[0_0_40px_15px_rgba(34,197,94,0.4)]` |

**Full working demo**: `assets/codepen-glossy-accepter-button.html`

---

## 50. Plasma Progress Bar (Turbulent Displacement)

A horizontal progress bar with **SVG turbulent displacement filter** creating a liquid/plasma effect, a 4-stop color gradient (red → orange → yellow → green), scale marks with proximity glow, and a **3D delta-arrow glass knob**.

### SVG turbulent displacement filter

The key innovation: an `feDisplacementMap` driven by 4 animated `feTurbulence` layers creating flowing plasma.

```xml
<filter id="turbulent-displace">
  <!-- 4 noise layers with opposing animation offsets -->
  <feTurbulence baseFrequency="0.02" numOctaves="10" seed="1" result="noise1" />
  <feOffset in="noise1" result="off1">
    <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" />
  </feOffset>
  <feTurbulence baseFrequency="0.02" numOctaves="10" seed="1" result="noise2" />
  <feOffset in="noise2" result="off2">
    <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" />
  </feOffset>
  <!-- Two more with dx offsets (seed 2) -->
  <!-- Composite + blend + displace -->
  <feComposite in="off1" in2="off2" result="part1" />
  <feComposite in="off3" in2="off4" result="part2" />
  <feBlend in="part1" in2="part2" mode="color-dodge" result="combined" />
  <feDisplacementMap in="SourceGraphic" in2="combined" scale="30"
    xChannelSelector="R" yChannelSelector="B" />
</filter>
```

### 4-stop color gradient mapping

```js
const CONFIG = {
  gradientColors: ["#ff0044", "#ff8800", "#ffdd00", "#00ff73"],
  gradientStops: [0, 0.33, 0.66, 1]
};
// Interpolated per-pixel using lerp between adjacent stops
```

### Scale marks with proximity illumination

Each tick mark glows when the progress value is near:

```js
const dist = Math.abs(progress - tickValue);
const maxDist = 8;
const p = dist < maxDist ? Math.pow(1 - dist / maxDist, 2) : 0;
// p controls: scale (1 + p*0.6), opacity, textShadow glow radius
```

### 3D delta-arrow glass knob

```html
<div style={{
  clipPath: 'polygon(50% 0%, 100% 100%, 50% 75%, 0% 100%)',
  background: 'rgba(10,10,10,0.7)',
  backdropFilter: 'blur(12px) saturate(260%) brightness(1.25)',
}}>
  <svg viewBox="0 0 48 64">
    <!-- Right half highlight -->
    <polygon points="24,0 48,64 24,48" fill="#ffffff" opacity="0.15" />
    <!-- Left half shadow -->
    <polygon points="24,0 0,64 24,48" fill="#000000" opacity="0.2" />
    <!-- Center fold line -->
    <line x1="24" y1="0" x2="24" y2="48" stroke="rgba(255,255,255,0.15)" />
  </svg>
</div>
```

### Track construction (deep recess)

```css
.track {
  background:
    radial-gradient(circle at 0% 50%, rgba(255, 255, 255, 0.35) 0, transparent 55%), radial-gradient(circle at 100% 50%, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 0.9) 70%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.8));
  background-blend-mode: screen, normal, soft-light;
  box-shadow:
    inset 0 0 18px rgba(0, 0, 0, 1),
    0 0 18px rgba(0, 0, 0, 0.8);
}
```

### Floating bubble particles

Subtle white circles inside the fill with `mix-blend-overlay`:

```css
@keyframes floatBubble {
  0% {
    transform: translateX(0) scale(0.8);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(100px) scale(1.2);
    opacity: 0;
  }
}
```

**Full working demo**: `assets/codepen-plasma-progress-bar.html`

---

## 51. Slit LED Button with 7-Layer Bloom (COMPRIS)

A **neomorphic latching button** with a narrow LED slit at the bottom that projects light upward through 6 bloom layers + 1 gap projection + desk glow. The most advanced light simulation in the collection.

### 4-tier neomorphic construction

```
Container (neumorphic chassis: #1a1d1a → #0d0f0d)
├── Gap (dark ring #1a1a19, visible between container and button)
└── Center button (#232322)
    ├── Label (dim → lit with 5-level text-shadow)
    ├── Slit (3.5px bar, 7-layer glow when ON)
    ├── 6 bloom layers (projected from slit upward)
    ├── Gap projection (below button, into gap)
    └── Desk glow (extends below container)
```

### Container neumorphism

```css
.button-container {
  background: linear-gradient(145deg, #1a1d1a, #0d0f0d);
  box-shadow:
    -3px -3px 18px #1e211e,
    /* top-left light catch */ -2px -2px 4px #1e211e44,
    4px 4px 4px #05060544,
    /* bottom-right shadow */ 4px 4px 18px #050605;
}
```

### Slit LED — 7-layer glow stack

```css
.slit-on {
  background: linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa, #3b82f6, #1e40af);
  box-shadow:
    0 0 1px #bfdbfe,
    /* 1. white-hot core */ 0 0 2px #93c5fd,
    /* 2. bright inner halo */ 0 0 5px rgba(96, 165, 250, 0.95),
    /* 3. saturated ring */ 0 0 10px rgba(59, 130, 246, 0.8),
    /* 4. primary glow */ 0 0 18px rgba(37, 99, 235, 0.5),
    /* 5. mid spread */ 0 0 32px rgba(37, 99, 235, 0.25),
    /* 6. bloom */ 0 0 52px rgba(37, 99, 235, 0.1); /* 7. atmosphere */
  animation: slit-breathe 2.2s ease-in-out infinite;
}
```

### 6 bloom layers (bottom → top projection)

| Layer | Class           | Size                    | Blur | Purpose                       |
| ----- | --------------- | ----------------------- | ---- | ----------------------------- |
| L1    | `.bloom-core`   | 65×22px                 | 2px  | Tight core right above slit   |
| L2    | `.bloom-mid`    | 110×40px                | 6px  | Wider halo                    |
| L3    | `.bloom-atmo`   | 160×55px                | 12px | Atmospheric spread            |
| L4    | `.light-wash`   | full width × 60% height | —    | Gradient flooding bottom half |
| L5    | `.light-column` | 44×48px                 | 3px  | Vertical light beam           |
| L6    | `.rim-catch`    | 70% width × 1px         | —    | Bottom edge specular line     |

### Bloom layer example (core)

```css
.bloom-core {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 65px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(ellipse at 50% 85%, rgba(147, 197, 253, 0.3) 0%, rgba(96, 165, 250, 0.12) 40%, transparent 65%);
  filter: blur(2px);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.bloom-core.on {
  opacity: 1;
}
```

### Gap + desk projection (light escaping downward)

```css
/* Light escaping into gap below button */
.gap-proj {
  bottom: -7px;
  width: 90px;
  height: 14px;
  background: radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.22) 0%, transparent 70%);
  filter: blur(3px);
}

/* Desk glow (light hitting surface below chassis) */
.desk-glow {
  bottom: -18px;
  width: 130px;
  height: 36px;
  background: radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.14) 0%, transparent 70%);
  filter: blur(10px);
  animation: desk-breathe 2.2s ease-in-out infinite;
}
```

### Latched ON vs OFF state

| Element           | OFF                                  | ON (latched)                        |
| ----------------- | ------------------------------------ | ----------------------------------- |
| Button bg         | `#232322 → #282827`                  | `#161615 → #171716` (deeper)        |
| Button shadow     | External cast                        | Inset 2px 2px 6px (pressed in)      |
| Label color       | `rgba(160,165,158,0.35)` (dim ghost) | `rgba(170,210,255,0.92)` (lit blue) |
| Label text-shadow | 0 (none)                             | 5-level: 3→6→12→24→40px blue        |
| Slit              | `#080908` (dead)                     | Gradient + 7-layer glow             |
| Bloom layers      | `opacity: 0`                         | `opacity: 1` + animations           |
| Container         | Standard neumorphic                  | +3 subtle blue glow layers          |

### Breathing animation

```css
@keyframes slit-breathe {
  0%,
  100% {
    box-shadow: /* 7 layers at base intensity */;
  }
  50% {
    box-shadow: /* 7 layers at peak intensity (+30-50%) */;
  }
}
```

**Full working demo**: `assets/codepen-compris-slit-button.html`

---

## 52. Stacked Height Wall Button (Well-Mounted)

A **latching toggle button** recessed in a deep well with a distinctive **stacked height wall** — 8 sequential `0 Npx 0 0` box-shadows creating a visible 3D side/thickness. The wall compresses on `:active` with `translateY(5px)`.

### 12-layer well recess

```css
.well-shadow {
  box-shadow:
    /* TOP attack (3 progressive depths) */
    inset 0 4px 10px rgba(0, 0, 0, 1),
    inset 0 2px 4px rgba(0, 0, 0, 0.9),
    inset 0 1px 2px rgba(0, 0, 0, 0.7),
    /* BOTTOM rim catch */ inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 3px rgba(255, 255, 255, 0.012),
    /* LATERAL recess */ inset 2px 0 4px rgba(0, 0, 0, 0.5),
    inset -2px 0 4px rgba(0, 0, 0, 0.5),
    /* AMBIENT depth */ inset 0 0 10px rgba(0, 0, 0, 0.35),
    inset 0 0 18px rgba(0, 0, 0, 0.1),
    /* EXTERNAL panel continuity */ 0 1px 0 rgba(255, 255, 255, 0.04),
    0 -1px 0 rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.25);
  background-color: #050505;
  padding: 3px 3px 12px; /* asymmetric bottom = wall drop zone */
}
```

### 8-step stacked height wall

The illusion of a **physical button side**: 8 sequential `0 Npx 0 0 #color` shadows, each offset 1px further, creating a visible 3D thickness below the button face.

```css
.button-surface {
  box-shadow:
    /* Top highlight + glass */
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 2px 2px rgba(255, 255, 255, 0.06),
    inset 0 3px 5px rgba(255, 255, 255, 0.018),
    inset 1px 0 0 rgba(255, 255, 255, 0.07),
    /* Bottom shadow (internal) */ inset 0 -1px 0 rgba(0, 0, 0, 0.55),
    inset 0 -3px 5px rgba(0, 0, 0, 0.25),
    inset 0 -5px 10px rgba(0, 0, 0, 0.1),
    inset -1px 0 0 rgba(0, 0, 0, 0.22),
    inset 0 0 10px rgba(0, 0, 0, 0.06),
    /* === STACKED HEIGHT WALL (8 steps) === */ 0 1px 0 0 #2e2e32,
    0 2px 0 0 #2a2a2e,
    0 3px 0 0 #252528,
    0 4px 0 0 #212124,
    0 5px 0 0 #1c1c20,
    0 6px 0 0 #18181c,
    0 7px 0 0 #141418,
    0 8px 0 0 #101014,
    /* Wall terminus + cast shadow */ 0 8px 0 1px rgba(0, 0, 0, 0.9),
    0 9px 0 1px rgba(0, 0, 0, 0.6),
    0 9px 0 2px rgba(0, 0, 0, 0.3),
    0 9px 0 0 rgba(255, 255, 255, 0.025),
    /* Distance shadows */ 0 10px 4px rgba(0, 0, 0, 0.65),
    0 12px 8px rgba(0, 0, 0, 0.5),
    0 14px 16px rgba(0, 0, 0, 0.3),
    0 18px 32px rgba(0, 0, 0, 0.12);
}
```

### Active state (wall compression)

```css
.button-surface:active {
  transform: translateY(5px); /* travel distance */
  box-shadow:
    /* Pressed-in surface */
    inset 0 3px 8px rgba(0, 0, 0, 0.9),
    inset 0 1px 2px rgba(0, 0, 0, 0.7),
    inset 0 -1px 0 rgba(255, 255, 255, 0.035),
    /* Compressed wall (3 steps instead of 8) */ 0 1px 0 0 #1e1e22,
    0 2px 0 0 #18181c,
    0 3px 0 0 #131316,
    0 3px 0 1px rgba(0, 0, 0, 0.85),
    0 4px 3px rgba(0, 0, 0, 0.5),
    0 5px 6px rgba(0, 0, 0, 0.25);
}
```

### Amber slit indicator (7-layer glow)

```css
.light-on {
  background: radial-gradient(ellipse at 50% 42%, #ffcc44 0%, #ff9900 40%, #dd7700 75%, #aa5500 100%);
  box-shadow:
    0 0 2px #ffaa00,
    /* 1. hot core */ 0 0 5px rgba(255, 170, 0, 0.9),
    /* 2. bright inner */ 0 0 10px rgba(255, 140, 0, 0.6),
    /* 3. mid ring */ 0 0 18px rgba(255, 120, 0, 0.3),
    /* 4. spread */ 0 0 28px rgba(255, 100, 0, 0.12),
    /* 5. bloom */ 0 0 40px rgba(255, 80, 0, 0.04),
    /* 6. atmosphere */ inset 0 -0.5px 1px rgba(0, 0, 0, 0.18); /* 7. slit depth */
}
```

### Surface glow contamination

Radial gradient overlay on button surface simulating LED light bleeding upward:

```css
.surface-glow {
  background: radial-gradient(ellipse 65% 55% at 50% 52%, rgba(255, 140, 0, 0.14) 0%, rgba(255, 120, 0, 0.05) 40%, transparent 65%);
}
```

### Overlay layers (glass + rim light + noise)

- **btn-glass**: Multi-radial reflection (upper-left specular + lower-right rim catch + diagonal gradient)
- **btn-rim**: 5-layer inset shadow creating edge definition; rim-active adds amber tinted edges
- **btn-noise**: SVG `feTurbulence` at `opacity: 0.022` with `mix-blend-mode: overlay`
- **projected-floor**: Elliptical gradient below button (`bottom: -4px`) with `blur(4px)`
- **desk-glow**: Wider ellipse below well (`bottom: -14px`) with `blur(8px)`

**Full working demo**: `assets/codepen-well-button-stacked-wall.html`

---

## 53. VU Meter (Analog Needle)

A **skeuomorphic analog VU meter** with an arc scale, animated needle, bottom hub, and neumorphic housing. The needle swings between -20dB and +5dB with realistic inertia from `requestAnimationFrame`.

### Neumorphic outer shell

```css
.vu-meter-outer {
  background: linear-gradient(135deg, #242933, #161b22);
  padding: 30px;
  border-radius: 24px;
  box-shadow:
    30px 30px 60px #05070a,
    /* cast shadow */ -10px -10px 40px #2d333d,
    /* light catch */ inset 1px 1px 1px rgba(255, 255, 255, 0.05);
  border: 1px solid #000;
}
```

### Black bezel + screen

```css
.vu-meter-bezel {
  background: #000;
  padding: 12px;
  border-radius: 16px;
  box-shadow:
    inset 3px 3px 10px rgba(0, 0, 0, 0.9),
    inset -1px -1px 3px rgba(255, 255, 255, 0.1);
}
.vu-meter-screen {
  width: 500px;
  height: 300px;
  background: radial-gradient(circle at 50% 110%, rgba(100, 160, 255, 0.45) 0%, #000 75%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### SVG arc scale (gray + red zones)

```html
<!-- Gray arc (safe zone) -->
<path d="M 85 210 A 235 235 0 0 1 315 130" fill="none" stroke="#374151" stroke-width="1.5" />
<!-- Red arc (danger zone) -->
<path d="M 315 130 A 235 235 0 0 1 435 210" fill="none" stroke="#b91c1c" stroke-width="3" />
```

Scale marks positioned along the arc using angle-to-cartesian conversion:

```js
const x1 = 250 + 220 * Math.sin(rad);
const y1 = 350 - 220 * Math.cos(rad);
```

### Needle mechanics

```css
.needle {
  position: absolute;
  bottom: -50px;
  left: 50%;
  width: 2px;
  height: 280px;
  background: #fff;
  transform-origin: bottom center;
  box-shadow:
    0 0 15px rgba(255, 255, 255, 1),
    0 0 5px rgba(255, 255, 255, 0.8);
  transition: transform 0.05s linear;
}
```

Angle mapping: `minAngle=-60°`, `maxAngle=+50°`, `rotation = min + (value × range)`.

### Animation (realistic jitter)

```js
const animate = (time) => {
  const slowWave = Math.sin(time / 600) * 0.15;
  const mediumWave = Math.sin(time / 200) * 0.1;
  const fastJitter = (Math.random() - 0.5) * 0.04;
  const target = 0.4 + slowWave + mediumWave + fastJitter;
  setValue((prev) => prev + (target - prev) * 0.2); // exponential smoothing
  requestAnimationFrame(animate);
};
```

### Bottom hub (pivot + label)

```css
.hub {
  position: absolute;
  bottom: -55px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 100px;
  background: linear-gradient(to bottom, #2d333d, #1a1e26);
  border-radius: 75px 75px 0 0;
  box-shadow:
    0 -10px 30px rgba(0, 0, 0, 0.9),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  border: 1.5px solid #000;
}
```

### Blue light source

```css
.light-source {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 160px;
  background: radial-gradient(circle at center bottom, rgba(147, 197, 253, 0.6) 0%, transparent 65%);
  filter: blur(35px);
}
```

**Full working demo**: `assets/codepen-vu-meter.html`

---

## 54. Cross-Light Toggle (Dual Button with Color Spill)

A **dual-button toggle** (SMOOTH / HEAT) inside a chrome bevel ring and recessed track. The active button's color **spills onto the adjacent inactive button** via cross-projected light and color-spill gradient overlays.

### Layer hierarchy

```
Outer shell (noise texture + 14-layer shadow)
├── Chrome bevel ring (7-stop gradient + 10-layer shadow)
│   └── Recessed track (black, 9-layer inset shadow)
│       ├── Track glow (color-tinted inset shadows)
│       ├── Cross-light element (blurred radial gradient)
│       ├── Button LEFT (SMOOTH — blue when active)
│       │   ├── btn-noise + mesh-pattern + btn-glass + btn-rim
│       │   └── color-spill overlay (receives red when inactive)
│       └── Button RIGHT (HEAT — red when active)
│           ├── btn-noise + mesh-pattern + btn-glass + btn-rim
│           └── color-spill overlay (receives blue when inactive)
├── Ambient glow (blurred bar below shell)
└── Desk light (radial gradient below container)
```

### Chrome bevel ring

```css
.bevel-ring {
  background: linear-gradient(154deg, #3a3a42 0%, #28282e 18%, #44444c 36%, #222228 52%, #3c3c44 68%, #2a2a30 84%, #343438 100%);
  border-radius: 52px;
  padding: 6px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    /* top chrome catch */ inset 0 2px 2px rgba(255, 255, 255, 0.1),
    inset 0 3px 4px rgba(255, 255, 255, 0.03),
    inset 1px 0 0 rgba(255, 255, 255, 0.14),
    /* left rim */ inset 0 -1px 0 rgba(0, 0, 0, 0.7),
    /* bottom dark */ inset 0 -2px 3px rgba(0, 0, 0, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.15),
    inset -1px 0 0 rgba(0, 0, 0, 0.35),
    /* right dark */ 0 2px 4px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.35),
    0 0 1px rgba(255, 255, 255, 0.2); /* ring edge */
}
/* Specular highlights (pseudo-element) */
.bevel-ring::before {
  background: radial-gradient(ellipse 35% 18% at 20% 8%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(ellipse 22% 10% at 80% 92%, rgba(255, 255, 255, 0.04) 0%, transparent 45%);
}
```

### Cross-projected light

Active button's color projected as a blurred radial gradient positioned behind the opposite button:

```css
.cross-light {
  position: absolute;
  top: 8%;
  bottom: 8%;
  width: 80px;
  pointer-events: none;
  filter: blur(12px);
  transition: opacity 0.3s ease;
}
/* Blue projects rightward when SMOOTH active */
.cross-light-blue {
  right: 46%;
  background: radial-gradient(ellipse 100% 80% at 0% 50%, rgba(58, 117, 209, 0.28) 0%, rgba(58, 117, 209, 0.08) 40%, transparent 70%);
}
/* Red projects leftward when HEAT active */
.cross-light-red {
  left: 46%;
  background: radial-gradient(ellipse 100% 80% at 100% 50%, rgba(209, 58, 58, 0.28) 0%, rgba(209, 58, 58, 0.08) 40%, transparent 70%);
}
```

### Color spill on inactive button

A gradient overlay on the inactive button showing the neighbor's color bleeding in:

```css
/* Blue spilling from left onto inactive HEAT button */
.spill-blue-left {
  background: linear-gradient(
    90deg,
    rgba(58, 117, 209, 0.45) 0%,
    rgba(70, 140, 230, 0.3) 6%,
    rgba(58, 117, 209, 0.18) 15%,
    rgba(58, 117, 209, 0.08) 28%,
    rgba(58, 117, 209, 0.02) 42%,
    transparent 55%
  );
}
/* Red spilling from right onto inactive SMOOTH button */
.spill-red-right {
  background: linear-gradient(270deg, rgba(209, 58, 58, 0.45) 0%, rgba(230, 80, 70, 0.3) 6%, rgba(209, 58, 58, 0.18) 15%, rgba(209, 58, 58, 0.08) 28%, rgba(209, 58, 58, 0.02) 42%, transparent 55%);
}
```

### Inset shadow cross-light on inactive button

The inactive button receives additional inset shadows from the active neighbor:

```css
.btn-inactive.receiving-blue {
  box-shadow:
    /* ...standard inactive shadows... */
    inset 6px 0 20px rgba(58, 117, 209, 0.14),
    /* color bleed in */ inset 3px 0 10px rgba(58, 117, 209, 0.1);
}
.btn-inactive.receiving-red {
  box-shadow:
    /* ...standard inactive shadows... */
    inset -6px 0 20px rgba(209, 58, 58, 0.14),
    inset -3px 0 10px rgba(209, 58, 58, 0.1);
}
```

### Mesh dot pattern

```css
.mesh-pattern {
  opacity: 0.35;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0.5px, transparent 0.5px);
  background-size: 4px 4px;
  mix-blend-mode: overlay;
}
```

### Active button states (blue / red)

Both follow the same pattern: radial specular + tinted body gradient + 4 external color glow layers.

```css
.btn-active-smooth {
  background: radial-gradient(ellipse 45% 30% at 35% 18%, rgba(255, 255, 255, 0.22) 0%, transparent 48%), radial-gradient(circle at 50% 50%, #76b4ff 0%, #3a75d1 50%, #152d56 100%);
  box-shadow:
    /* inset highlights + shadows... */
    0 0 12px rgba(58, 117, 209, 0.28),
    0 4px 20px rgba(58, 117, 209, 0.22),
    0 8px 36px rgba(58, 117, 209, 0.14),
    0 14px 56px rgba(58, 117, 209, 0.06);
}
```

**Full working demo**: `assets/codepen-toggle-cross-light.html`

---

## 55. FX Button with 5-Layer Bezel + Neon Ring

A **heavy industrial button** enclosed in a 5-layer concentric bezel assembly with a **neon ring** border that glows on interaction. Features Phillips screws, silkscreen label, and projected gorge light.

### 5-layer bezel stack

```
Backplate (brushed metal + 4 corner screws)
├── Outer bezel (thick chrome, 7-stop gradient, 9px padding)
│   ├── Mid bezel (secondary chrome, 4-stop gradient, 6px)
│   │   ├── Inner gorge (deep black recess, 7px)
│   │   │   ├── Button surface (148deg gradient + layers)
│   │   │   │   ├── btn-noise (feTurbulence overlay)
│   │   │   │   ├── neon-ring (inset 7px, 7-layer glow)
│   │   │   │   ├── btn-glass (3-radial specular)
│   │   │   │   ├── btn-rim (4-edge definition)
│   │   │   │   └── "FX" text (neon color + 8-layer text-shadow)
│   │   │   └── Projected light (gorge floor glow)
│   │   └── ← mid bezel
│   └── ← outer bezel (::before = specular highlights)
├── Silk label ("Audio Control")
└── ← backplate
```

### Backplate (brushed metal)

```css
.backplate {
  background:
    url("data:image/svg+xml,...feTurbulence..."),
    /* noise texture */ linear-gradient(140deg, #2a2a30 0%, #1e1e24 30%, #161618 55%, #1c1c22 80%, #222228 100%);
  background-blend-mode: overlay, normal;
  border-radius: 36px;
  padding: 24px 28px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    /* ...13 more layers... */ 0 30px 60px rgba(79, 209, 217, 0.04); /* color bleed from neon */
}
```

### Phillips screws

```css
.screw {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: radial-gradient(circle at 33% 27%, #777 0%, #555 18%, #383838 50%, #1c1c1c 80%, #111 100%);
  /* 10-layer shadow (inset depth + external cast) */
}
/* Cross slot via ::before + ::after */
.screw::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 15%;
  right: 15%;
  height: 1.4px;
  background: linear-gradient(90deg, rgba(10, 10, 10, 0.5), #080808, rgba(10, 10, 10, 0.5));
  transform: translateY(-50%) rotate(var(--a, 30deg));
}
.screw::after {
  content: "";
  position: absolute;
  top: 15%;
  bottom: 15%;
  left: 50%;
  width: 1.4px;
  /* same gradient, perpendicular */
  transform: translateX(-50%) rotate(var(--a, 30deg));
}
/* Random angles per screw */
.s-tl {
  top: 12px;
  left: 12px;
  --a: 20deg;
}
.s-tr {
  top: 12px;
  right: 12px;
  --a: -12deg;
}
.s-bl {
  bottom: 12px;
  left: 12px;
  --a: 50deg;
}
.s-br {
  bottom: 12px;
  right: 12px;
  --a: 8deg;
}
```

### Outer bezel (heavy chrome)

```css
.outer-bezel {
  background: linear-gradient(150deg, #606068 0%, #3c3c44 15%, #6e6e76 33%, #2e2e36 50%, #5c5c66 67%, #343438 82%, #4c4c54 100%);
  border-radius: 28px;
  padding: 9px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.38),
    /* top chrome */ inset 0 2px 2px rgba(255, 255, 255, 0.14),
    inset 0 3px 5px rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.75),
    /* bottom dark */ inset 0 -2px 3px rgba(0, 0, 0, 0.45),
    inset 0 -3px 6px rgba(0, 0, 0, 0.18),
    inset 1px 0 0 rgba(255, 255, 255, 0.18),
    inset -1px 0 0 rgba(255, 255, 255, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.55),
    0 4px 8px rgba(0, 0, 0, 0.45),
    0 6px 14px rgba(0, 0, 0, 0.3),
    0 0 1px rgba(255, 255, 255, 0.28),
    0 -1px 0 rgba(0, 0, 0, 0.8);
}
/* Specular highlights (::before) */
.outer-bezel::before {
  background: radial-gradient(ellipse 48% 22% at 26% 9%, rgba(255, 255, 255, 0.3) 0%, transparent 55%), radial-gradient(ellipse 32% 14% at 74% 91%, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
}
```

### Inner gorge (deep recess with color bleed)

```css
.inner-gorge {
  background: linear-gradient(160deg, #06060a 0%, #0c0c10 30%, #050508 100%);
  border-radius: 17px;
  padding: 7px;
  box-shadow:
    inset 0 6px 16px rgba(0, 0, 0, 0.98),
    inset 0 3px 8px rgba(0, 0, 0, 0.95),
    inset 0 1px 3px rgba(0, 0, 0, 0.9),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    inset 4px 0 8px rgba(0, 0, 0, 0.7),
    inset -4px 0 8px rgba(0, 0, 0, 0.7),
    inset 0 0 20px rgba(0, 0, 0, 0.5),
    inset 0 0 12px rgba(79, 209, 217, 0.03),
    /* neon color bleed */ 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

### Neon ring

```css
.neon-ring {
  position: absolute;
  inset: 7px;
  border-radius: 7px;
  border: 1.5px solid rgba(79, 209, 217, 0.5);
  box-shadow:
    0 0 4px rgba(79, 209, 217, 0.5),
    /* 1. outer core */ 0 0 8px rgba(79, 209, 217, 0.3),
    /* 2. outer mid */ 0 0 16px rgba(79, 209, 217, 0.15),
    /* 3. outer spread */ 0 0 28px rgba(79, 209, 217, 0.06),
    /* 4. outer bloom */ inset 0 0 4px rgba(79, 209, 217, 0.35),
    /* 5. inner core */ inset 0 0 10px rgba(79, 209, 217, 0.15),
    /* 6. inner mid */ inset 0 0 20px rgba(79, 209, 217, 0.06); /* 7. inner bloom */
}
/* Intensified on :active */
.btn:active .neon-ring {
  border-color: rgba(79, 209, 217, 0.7);
  box-shadow:
    0 0 6px rgba(79, 209, 217, 0.7),
    0 0 12px rgba(79, 209, 217, 0.45),
    0 0 22px rgba(79, 209, 217, 0.25),
    0 0 36px rgba(79, 209, 217, 0.1),
    inset 0 0 6px rgba(79, 209, 217, 0.5),
    inset 0 0 14px rgba(79, 209, 217, 0.25),
    inset 0 0 28px rgba(79, 209, 217, 0.1);
}
```

### Neon text (FX label)

```css
.fx-text {
  font-weight: 900;
  font-size: 42px;
  letter-spacing: 3px;
  color: #4fd1d9;
  text-shadow:
    0 0 4px rgba(79, 209, 217, 0.95),
    /* core glow */ 0 0 10px rgba(79, 209, 217, 0.7),
    0 0 22px rgba(79, 209, 217, 0.4),
    0 0 40px rgba(79, 209, 217, 0.15),
    0 0 60px rgba(79, 209, 217, 0.06),
    0 -1px 0 rgba(0, 0, 0, 0.4),
    /* engrave top */ 0 2px 3px rgba(0, 0, 0, 0.6),
    /* engrave bottom */ 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

### Silkscreen label

```css
.silk-label {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.11);
  text-shadow:
    0 -1px 0 rgba(0, 0, 0, 0.5),
    /* top engrave */ 0 1px 0 rgba(255, 255, 255, 0.03); /* bottom catch */
}
```

**Full working demo**: `assets/codepen-fx-button-neon-ring.html`

---

## 56. Mechanical Counter Display (ALTERNATOR 175A)

A **heavy-chassis instrument** displaying a fixed value ("175A") in mechanical digit columns with scanlines, separator grooves, glass overlay, and warm backlight bleed. Features 6 Phillips screws, a label bar with red neon lines, a 4-ring bezel, and an info bar with status LEDs.

### Heavy chassis (14-layer shadow)

```css
.chassis {
  background: url("data:image/svg+xml,...feTurbulence..."), linear-gradient(142deg, #2e2e34 0%, #222228 25%, #1a1a20 50%, #20202a 75%, #26262c 100%);
  background-blend-mode: overlay, normal;
  border-radius: 28px;
  padding: 48px 52px 44px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 2px 3px rgba(255, 255, 255, 0.05),
    inset 1px 0 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.7),
    inset -1px 0 0 rgba(0, 0, 0, 0.35),
    inset 0 0 30px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.45),
    0 8px 16px rgba(0, 0, 0, 0.4),
    0 16px 32px rgba(0, 0, 0, 0.35),
    0 24px 48px rgba(0, 0, 0, 0.25),
    0 32px 64px rgba(0, 0, 0, 0.2),
    0 48px 96px rgba(0, 0, 0, 0.15),
    0 0 120px rgba(0, 0, 0, 0.5);
}
```

### 6-screw layout (4 corners + 2 mid-sides)

```css
.s-tl {
  top: 14px;
  left: 14px;
  --a: 22deg;
}
.s-tr {
  top: 14px;
  right: 14px;
  --a: -15deg;
}
.s-ml {
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  --a: 42deg;
}
.s-mr {
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  --a: -8deg;
}
.s-bl {
  bottom: 14px;
  left: 14px;
  --a: 55deg;
}
.s-br {
  bottom: 14px;
  right: 14px;
  --a: 10deg;
}
```

### Label bar with red neon lines

```css
.label-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}
.label-text {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 8px;
  color: rgba(255, 255, 255, 0.22);
  text-shadow:
    0 -1px 0 rgba(0, 0, 0, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 12px rgba(255, 60, 40, 0.15); /* red neon bleed */
}
.label-line-left {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ff2a1a 70%, #ff4030);
  box-shadow:
    0 0 8px rgba(255, 40, 20, 0.4),
    0 0 20px rgba(255, 40, 20, 0.15);
}
```

### 4-ring bezel assembly

```
Outer bezel (8-stop chrome gradient, 10px padding)
├── Mid bezel (4-stop, 6px)
│   ├── Inner bezel (deep black gorge, 8px, 6-layer inset)
│   │   └── Display well (9-layer shadow + warm backlight bleed)
│   │       ├── Noise overlay + Glass overlay
│   │       ├── Digit columns ("1", "7", "5", "A")
│   │       └── Separator grooves between columns
│   └── ← mid
└── ← outer (::before = specular highlights)
```

### Digit column with scanlines

```css
.digit-col {
  flex: 1;
  background: linear-gradient(180deg, #0a0a0c 0%, #111114 8%, #161618 20%, #1a1a1e 50%, #161618 80%, #111114 92%, #0a0a0c 100%);
  min-height: 220px;
  overflow: hidden;
}
/* Scanline overlay (::before) */
.digit-col::before {
  background: repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0, 0, 0, 0.35) 3px, rgba(0, 0, 0, 0.35) 4px);
}
/* Vignette + warm backlight (::after) */
.digit-col::after {
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.7) 100%),
    radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255, 220, 140, 0.04) 0%, transparent 70%);
}
```

### Separator grooves

```css
.sep {
  width: 3px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #000 0%, #0a0a0a 50%, #000 100%);
  box-shadow:
    -1px 0 3px rgba(0, 0, 0, 0.8),
    1px 0 3px rgba(0, 0, 0, 0.8),
    inset 0 0 4px rgba(0, 0, 0, 0.9);
}
```

### Glass + noise overlays

```css
.glass {
  background:
    radial-gradient(ellipse 50% 28% at 20% 10%, rgba(255, 255, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse 90% 35% at 40% 18%, rgba(200, 210, 255, 0.04) 0%, transparent 55%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.07) 0%, transparent 42%, rgba(0, 0, 0, 0.1) 100%);
}
.noise {
  background: url("data:image/svg+xml,...feTurbulence baseFrequency='1.4'...");
  opacity: 0.025;
  mix-blend-mode: overlay;
}
```

### Red indicator line + status LEDs

```css
.red-line {
  height: 4px;
  background: linear-gradient(90deg, transparent 0%, #ff2a1a 15%, #ff4030 50%, #ff2a1a 85%, transparent 100%);
  box-shadow:
    0 0 6px rgba(255, 40, 20, 0.5),
    0 0 14px rgba(255, 40, 20, 0.25),
    0 0 28px rgba(255, 20, 10, 0.1);
}
.led-green {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #80ffa0 0%, #30cc55 55%, #1a8833 100%);
  box-shadow:
    0 0 3px #50ff70,
    0 0 8px rgba(80, 255, 120, 0.6),
    0 0 16px rgba(40, 200, 70, 0.25);
  animation: led-p 2.4s ease-in-out infinite;
}
@keyframes led-p {
  0%,
  100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}
```

**Full working demo**: `assets/codepen-alternator-counter.html`

---

## 57. 7-Segment Ghost Display (Digital Display)

A scientific instrument readout that simulates real LCD/VFD displays where **all segment positions are faintly visible** behind the lit content. Uses an 8-layer screen construction from backplate to noise overlay.

### Screen construction hierarchy

```
backplate (brushed aluminum + screws)
└── outer-bezel (chrome gradient 3-stop)
    └── inner-bezel (deep gorge, dark bg)
        └── screen (#001a33)
            ├── scanlines (repeating-linear-gradient)
            ├── glass (4 radial gradients)
            ├── ambient-glow (radial color wash)
            └── noise (feTurbulence overlay)
```

### 8-layer screen stack

```css
/* Backplate — brushed aluminum */
.backplate {
  background: repeating-linear-gradient(90deg, transparent 0px, rgba(255, 255, 255, 0.015) 1px, transparent 2px, transparent 4px), linear-gradient(145deg, #3a3a3f 0%, #28282c 50%, #1e1e22 100%);
  border-radius: 30px;
  padding: 20px;
  box-shadow:
    0 50px 100px -20px rgba(0, 0, 0, 0.9),
    inset 0 1px 2px rgba(255, 255, 255, 0.15),
    inset 0 -1px 2px rgba(0, 0, 0, 0.8);
}

/* Outer bezel — chrome gradient */
.outer-bezel {
  background: linear-gradient(145deg, #555, #222, #444);
  border-radius: 24px;
  padding: 6px;
  box-shadow:
    inset 0 1px 3px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.8);
}

/* Inner bezel — deep gorge */
.inner-bezel {
  background: linear-gradient(180deg, #0a0a0e, #151520);
  border-radius: 20px;
  padding: 3px;
  box-shadow:
    inset 0 4px 12px rgba(0, 0, 0, 0.95),
    inset 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Screen surface */
.screen {
  background: #001a33;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
}

/* Scanlines */
.scanlines::after {
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 3px);
  pointer-events: none;
}

/* Glass reflection */
.glass::before {
  background:
    radial-gradient(ellipse 50% 20% at 25% 15%, rgba(255, 255, 255, 0.12) 0%, transparent 70%), radial-gradient(ellipse 80% 40% at 50% 5%, rgba(200, 220, 255, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 30% 20% at 75% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 60%), linear-gradient(160deg, rgba(255, 255, 255, 0.04) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
}
```

### Ghost segment layer

The key technique: render all "8888" text behind the lit value at very low opacity.

```css
.ghost-text {
  font-family: "Digital-7", monospace;
  color: rgba(40, 80, 150, 0.15); /* blue ghost segments */
  position: absolute;
  pointer-events: none;
}
.lit-text {
  font-family: "Digital-7", monospace;
  position: relative;
  z-index: 1;
}
```

### Dual-color phosphor system

```css
/* Blue — labels, description text */
.phosphor-blue {
  color: #b0e0ff;
  text-shadow:
    0 0 5px rgba(100, 180, 255, 0.8),
    0 0 15px rgba(100, 180, 255, 0.4),
    0 0 30px rgba(50, 120, 200, 0.2);
}

/* Amber — numeric values */
.phosphor-amber {
  color: #ffe880;
  text-shadow:
    0 0 5px rgba(255, 220, 100, 0.8),
    0 0 15px rgba(255, 200, 60, 0.4),
    0 0 30px rgba(200, 150, 30, 0.2);
}
```

### Status LED with pulse

```css
.status-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #80ffa0, #30cc55, #1a8833);
  box-shadow:
    0 0 3px #50ff70,
    0 0 8px rgba(80, 255, 120, 0.6);
  animation: pulse-led 2s ease-in-out infinite;
}
@keyframes pulse-led {
  0%,
  100% {
    opacity: 0.7;
    box-shadow: 0 0 3px #50ff70;
  }
  50% {
    opacity: 1;
    box-shadow:
      0 0 3px #50ff70,
      0 0 12px rgba(80, 255, 120, 0.8);
  }
}
```

### Silkscreen brand label on bezel

```css
.brand-silk {
  font-family: "Orbitron", sans-serif;
  font-size: 8px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.04);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

**Full working demo**: `assets/codepen-digital-display-7seg.html`

---

## 58. LED Matrix Push Button

A hardware push button with an embedded **5×7 LED matrix** display well and a purple glow halo. Uses CSS Houdini `@property` for smooth pseudo-element opacity transitions.

### LED matrix grid

```css
.led-grid {
  display: grid;
  grid-template-columns: repeat(5, 7px);
  grid-template-rows: repeat(7, 7px);
  gap: 4px;
}
.led-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  transition: all 0.15s ease;
}
.led-dot.off {
  background: #1a1a2e;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
}
.led-dot.on {
  background: radial-gradient(circle at 35% 35%, #c084fc, #7c3aed);
  box-shadow:
    0 0 3px #a855f7,
    0 0 8px rgba(168, 85, 247, 0.5);
}
```

### `@property` for pseudo-element transition

CSS custom properties don't normally animate on pseudo-elements. Register them with `@property`:

```css
@property --glow-opacity {
  syntax: "<number>";
  initial-value: 0;
  inherits: false;
}

.button-wrapper {
  --glow-opacity: 0;
  transition: --glow-opacity 0.3s ease;
}
.button-wrapper:hover {
  --glow-opacity: 0.85;
}
.button-wrapper:active {
  --glow-opacity: 1;
}

/* Purple halo on ::after */
.button-wrapper::after {
  content: "";
  position: absolute;
  inset: -15px;
  border-radius: 30px;
  background: radial-gradient(ellipse 80% 100% at 25% 50%, rgba(168, 85, 247, 0.65), transparent 70%);
  mix-blend-mode: screen;
  opacity: var(--glow-opacity);
  pointer-events: none;
}
```

### Frame-based LED animation (vanilla JS)

```js
const frames = [
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0]
  // ... more arrow/pattern frames
];
let frameIndex = 0;
setInterval(() => {
  const f = frames[frameIndex % frames.length];
  dots.forEach((dot, i) => {
    dot.classList.toggle("on", f[i] === 1);
    dot.classList.toggle("off", f[i] === 0);
  });
  frameIndex++;
}, 220);
```

### Button 3-state depth

```css
/* Default — raised */
.hw-button {
  transform: translateY(0);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.7),
    0 4px 8px rgba(0, 0, 0, 0.5),
    inset 0 2px 3px rgba(255, 255, 255, 0.15),
    inset 0 -3px 6px rgba(0, 0, 0, 0.4);
}
/* Hover — slightly elevated */
.hw-button:hover {
  transform: translateY(-1px);
}
/* Active — pressed */
.hw-button:active {
  transform: translateY(3px);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.6),
    inset 0 4px 10px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(0, 0, 0, 0.5);
}
```

**Full working demo**: `assets/codepen-led-matrix-push-button.html`

---

## 59. DSP Toggle Switch (Neomorphic Card)

A large (450×450px) neomorphic card with an **ON/OFF sliding toggle**. Features mask-composite gradient borders, a handle with floor shadow and lateral shadow shift, and blue glow states.

### Neomorphic card with mask-composite border

```css
.neomorphic-card {
  background: linear-gradient(145deg, #323237, #0f0f11);
  box-shadow:
    0 70px 100px -20px rgba(0, 0, 0, 0.95),
    inset 0 2px 3px rgba(255, 255, 255, 0.1),
    inset 0 -10px 20px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 80px;
}

/* Gradient border trick — mask-composite exclude */
.neomorphic-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 80px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.5) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### Switch track (recessed channel)

```css
.switch-container {
  background: linear-gradient(180deg, #050506, #121214);
  box-shadow:
    inset 0 15px 30px rgba(0, 0, 0, 0.9),
    0 1px 2px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 0, 0, 1);
  border-radius: 60px;
}
```

### Handle with floor shadow + lateral shift

```css
.switch-handle {
  background: linear-gradient(135deg, #5a5a60 0%, #2a2a2e 45%, #141416 100%);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.9),
    0 15px 40px rgba(0, 0, 0, 0.7),
    0 25px 60px rgba(0, 0, 0, 0.4),
    0 3px 6px rgba(0, 0, 0, 0.95),
    inset 0 3px 6px rgba(255, 255, 255, 0.2),
    inset -4px -4px 10px rgba(0, 0, 0, 0.6);
}

/* ON state: lateral shadow simulates directional blue light */
.active .switch-handle {
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.9),
    0 15px 40px rgba(0, 0, 0, 0.7),
    0 25px 60px rgba(0, 0, 0, 0.4),
    0 3px 6px rgba(0, 0, 0, 0.95),
    15px 5px 35px rgba(0, 0, 0, 0.85),
    /* ← lateral shift */ inset 0 3px 6px rgba(255, 255, 255, 0.2),
    inset -4px -4px 10px rgba(0, 0, 0, 0.6);
}

/* Floor shadow pseudo */
.handle-floor-shadow {
  position: absolute;
  bottom: -4px;
  left: 10%;
  right: 10%;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 80%);
  filter: blur(4px);
  z-index: -1;
}
```

### Blue rim glow (mask-composite, appears on ON)

```css
.blue-rim-glow {
  position: absolute;
  inset: -2px;
  border-radius: 60px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(0, 150, 255, 0.6), transparent, rgba(0, 80, 255, 0.4));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.active .blue-rim-glow {
  opacity: 1;
}
```

### Handle sub-layers (metallic shine, rim light, blue reflection)

```css
.metallic-shine {
  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.08) 50%, transparent 60%);
}
.rim-light {
  position: absolute;
  top: 1px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  filter: blur(0.5px);
}
.handle-blue-reflection {
  background: radial-gradient(circle at 100% 50%, rgba(0, 150, 255, 0.3), transparent 60%);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.active .handle-blue-reflection {
  opacity: 1;
}
```

### Neon text glow (ON label)

```css
.glow-text-blue {
  color: #b3e5ff;
  text-shadow:
    0 0 10px rgba(0, 150, 255, 1),
    0 0 25px rgba(0, 150, 255, 0.8),
    0 0 50px rgba(0, 100, 255, 0.5);
}
```

**Full working demo**: `assets/codepen-dsp-toggle-switch.html`

---

## 60. Watt Gauge — Forge Edition (Full Circular Gauge)

A complete industrial circular watt meter with **spring-damper needle physics**, a 5-layer glass system, warn lamp assembly, condensation droplets, and 3-tier light spill. The most complex gauge in the collection.

### Chassis construction

```css
.chassis {
  background:
    /* Brushed metal */
    repeating-linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.008) 1px, transparent 2px, transparent 4px), linear-gradient(155deg, #3a3d42 0%, #2e3035 30%, #252830 60%, #1e2028 100%);
  border-radius: 28px;
  box-shadow:
    0 70px 120px -30px rgba(0, 0, 0, 0.95),
    0 30px 50px rgba(0, 0, 0, 0.6),
    inset 1px 1px 2px rgba(255, 255, 255, 0.08),
    inset -1px -1px 2px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 0 3px #0e1014,
    0 0 0 4px rgba(255, 255, 255, 0.02);
}
```

### Conic-gradient bezel ring (SVG + CSS)

```css
.gauge-bezel {
  fill: none;
  stroke: url(#bezelGradient);
  stroke-width: 16;
}
/* In SVG defs — conic simulated with radialGradient */
```

### 5-layer glass system

```css
/* Specular highlight */
.glass-specular {
  background: radial-gradient(ellipse 50% 30% at 38% 22%, rgba(255, 255, 255, 0.18) 0%, transparent 70%);
}

/* Fresnel edge */
.glass-fresnel {
  background: radial-gradient(circle, transparent 60%, rgba(255, 255, 255, 0.04) 80%, rgba(255, 255, 255, 0.08) 95%);
}

/* Caustic (conic light refraction) */
.glass-caustic {
  background: conic-gradient(from 200deg, transparent, rgba(255, 255, 255, 0.02), transparent 30%, rgba(255, 255, 255, 0.04), transparent 70%);
}

/* Condensation droplets (9 tiny circles) */
.glass-condensation {
  background:
    radial-gradient(circle 2px at 25% 35%, rgba(255, 255, 255, 0.06), transparent), radial-gradient(circle 1.5px at 68% 42%, rgba(255, 255, 255, 0.04), transparent),
    radial-gradient(circle 2px at 42% 72%, rgba(255, 255, 255, 0.05), transparent), radial-gradient(circle 1px at 55% 28%, rgba(255, 255, 255, 0.03), transparent),
    radial-gradient(circle 1.5px at 78% 65%, rgba(255, 255, 255, 0.04), transparent), radial-gradient(circle 1px at 32% 58%, rgba(255, 255, 255, 0.03), transparent),
    radial-gradient(circle 2px at 85% 30%, rgba(255, 255, 255, 0.04), transparent), radial-gradient(circle 1px at 48% 48%, rgba(255, 255, 255, 0.02), transparent),
    radial-gradient(circle 1.5px at 20% 75%, rgba(255, 255, 255, 0.04), transparent);
}

/* Edge ring */
.glass-edge {
  box-shadow:
    inset 0 0 30px rgba(0, 0, 0, 0.3),
    inset 0 0 60px rgba(0, 0, 0, 0.15);
}
```

### Spring-damper needle physics

```js
// Constants
const SPRING = 0.12; // k — stiffness
const DAMPING = 0.16; // d — friction

// In animation loop (requestAnimationFrame):
velocity += (targetAngle - currentAngle) * SPRING;
velocity *= 1 - DAMPING; // friction
currentAngle += velocity;
```

### Boot sequence (power-on sweep)

```js
const BOOT_DURATION = 1200; // ms
const bootStart = Date.now();

function animate() {
  const elapsed = Date.now() - bootStart;
  if (elapsed < BOOT_DURATION) {
    // Sweep from 0° to ~280° then back to 0°
    const t = elapsed / BOOT_DURATION;
    const sweep = Math.sin(t * Math.PI) * 280;
    setNeedleAngle(sweep);
  } else {
    // Physics takes over
    applySpringDamper();
  }
  requestAnimationFrame(animate);
}
```

### Warn lamp assembly

```css
/* Housing */
.warn-housing {
  background: linear-gradient(180deg, #3a3d42, #252830);
  border-radius: 10px;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.5);
}

/* Recess */
.warn-recess {
  background: #0a0c10;
  border-radius: 8px;
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.9);
}

/* Lens (OFF) */
.warn-lens {
  background: radial-gradient(circle at 40% 35%, #5a3020, #2a1510);
  border-radius: 6px;
}

/* Lens (LIT) — 9-layer glow */
.warn-lens.lit {
  background: radial-gradient(circle at 40% 35%, #ffe0a0, #ff6020, #cc3010);
  box-shadow:
    0 0 4px rgba(255, 100, 20, 0.9),
    0 0 8px rgba(255, 80, 10, 0.7),
    0 0 16px rgba(255, 60, 0, 0.5),
    0 0 30px rgba(255, 40, 0, 0.35),
    0 0 50px rgba(255, 30, 0, 0.2),
    0 0 80px rgba(255, 20, 0, 0.1),
    inset 0 0 6px rgba(255, 200, 100, 0.5),
    inset 0 -2px 4px rgba(255, 120, 30, 0.4),
    inset 0 1px 2px rgba(255, 255, 200, 0.6);
}

/* Flash animation */
@keyframes warn-flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

### 3-tier light spill (projected below gauge)

```css
.spill-1 {
  bottom: -10px;
  width: 200px;
  height: 10px;
  filter: blur(8px);
  background: radial-gradient(ellipse, rgba(255, 100, 20, 0.15), transparent);
}
.spill-2 {
  bottom: -25px;
  width: 350px;
  height: 20px;
  filter: blur(18px);
  background: radial-gradient(ellipse, rgba(255, 80, 0, 0.06), transparent);
}
.spill-3 {
  bottom: -45px;
  width: 500px;
  height: 35px;
  filter: blur(35px);
  background: radial-gradient(ellipse, rgba(255, 60, 0, 0.025), transparent);
}
```

**Full working demo**: `assets/codepen-watt-gauge-forge.html`

---

## 61. Watt Gauge — Simple (Minimal Arc Gauge)

A **minimal circular gauge** using pure SVG with a thick red arc track, diamond pointer, and concentric ring decorations. No physical housing — just the gauge itself. Much simpler than pattern 60 but still visually rich.

### SVG arc helper (`describeArc`)

```js
const polarToCartesian = (cx, cy, r, degrees) => {
  const rad = (degrees * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const large = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 0 ${end.x} ${end.y}`;
};
```

### Thick red active track

```jsx
{
  /* Background track */
}
<path d={describeArc(center, center, radius, 30, 300)} fill="none" stroke="#1a1a1c" strokeWidth={55} />;

{
  /* Active red track */
}
<path d={describeArc(center, center, radius, 30, currentAngle)} fill="none" stroke="url(#redGradient)" strokeWidth={55} className="glow-red" />;
```

```css
.glow-red {
  filter: drop-shadow(0 0 10px rgba(255, 0, 80, 0.8)) drop-shadow(0 0 20px rgba(255, 0, 80, 0.4));
}
```

### Concentric ring decorations inside track

```jsx
{
  [radius - 15, radius - 5, radius + 5, radius + 15].map((r, i) => (
    <path key={i} d={describeArc(center, center, r, startAngle, currentAngle)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
  ));
}
```

### Diamond pointer (SVG polygon)

```js
const pointerTip = polarToCartesian(center, center, radius + 40, angle);
const pointerBaseL = polarToCartesian(center, center, radius + 60, angle - 4);
const pointerBaseR = polarToCartesian(center, center, radius + 60, angle + 4);
const pointerBack = polarToCartesian(center, center, radius + 75, angle);
```

```jsx
<polygon points={`${tip.x},${tip.y} ${baseL.x},${baseL.y} ${back.x},${back.y} ${baseR.x},${baseR.y}`} fill="#ff4d8d" className="glow-red" />;
{
  /* Center line for depth */
}
<line x1={tip.x} y1={tip.y} x2={back.x} y2={back.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />;
```

### Eased interpolation (simple approach)

```js
// Simpler than spring-damper — good for lightweight gauges
const timer = setInterval(() => {
  setSpeed((prev) => {
    if (Math.abs(prev - targetSpeed) < 0.5) return targetSpeed;
    return prev + (targetSpeed - prev) * 0.1; // ease factor
  });
}, 30);
```

### Outer bezel (3 concentric circles)

```jsx
<circle cx={center} cy={center} r={radius + 60}
        fill="#222" stroke="#333" strokeWidth="4" />
<circle cx={center} cy={center} r={radius + 55}
        fill="url(#outerGradient)" />
<circle cx={center} cy={center} r={radius + 40}
        fill="#141416" stroke="#000" strokeWidth="2" />
```

### Tick brightness tied to value

```jsx
<line x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke={speed >= tick.label ? "rgba(255,255,255,0.8)" /* passed — bright */ : "rgba(255,255,255,0.3)"} /* ahead — dim */ strokeWidth="2" />
```

**Full working demo**: `assets/codepen-watt-gauge-simple.html`

---

## 62. Start/Stop Toggle Button

A **mechanical toggle button** on a mounting plate with conic-gradient well, engraved→illuminated text transition, LED bar indicator, 4-layer orange rim glow, and WebAudio click sound synthesis.

### Mounting plate with screws

```css
.plate {
  background:
    /* Brushed texture */
    repeating-linear-gradient(90deg, transparent 0px, rgba(255, 255, 255, 0.003) 1px, transparent 2px, transparent 3px), linear-gradient(160deg, var(--flint-300) 0%, var(--flint-600) 100%);
  border-radius: 24px;
  padding: 55px 70px;
  box-shadow:
    0 55px 100px -20px rgba(0, 0, 0, 0.95),
    0 25px 45px rgba(0, 0, 0, 0.75),
    0 10px 15px rgba(0, 0, 0, 0.5),
    inset 1px 1px 2px rgba(255, 255, 255, 0.07),
    inset -1px -1px 2px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 0 2.5px var(--flint-800),
    0 0 0 3.5px rgba(255, 255, 255, 0.015);
}
```

### Phillips screws with random angles

```css
.torx {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--flint-200), var(--flint-700));
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    inset 0 -1px 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.5);
}
.torx::before {
  content: "";
  width: 5.5px;
  height: 1.2px;
  background: rgba(0, 0, 0, 0.65);
  transform: translate(-50%, -50%);
}
.torx::after {
  content: "";
  width: 1.2px;
  height: 5.5px;
  background: rgba(0, 0, 0, 0.65);
  transform: translate(-50%, -50%);
}
```

### Conic-gradient button well

```css
.btn-well {
  background: conic-gradient(from 0deg, var(--flint-400), var(--flint-200), var(--flint-500), var(--flint-300), var(--flint-500), var(--flint-200), var(--flint-400));
  border-radius: 26px;
  padding: 4px;
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.8);
}
.btn-recess {
  background: var(--flint-800);
  border-radius: 22px;
  padding: 6px;
  box-shadow:
    inset 0 5px 12px rgba(0, 0, 0, 0.95),
    inset 0 2px 4px rgba(0, 0, 0, 0.8),
    inset 3px 0 6px rgba(0, 0, 0, 0.4),
    inset -3px 0 6px rgba(0, 0, 0, 0.4);
}
```

### Button UP/DOWN states

```css
/* UP — raised */
.skeuo-btn {
  background: linear-gradient(170deg, #4a4f5a 0%, #3c414c 15%, #30353f 35%, #282d38 55%, #222730 75%, #1c2028 100%);
  transform: translateY(0px);
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.7),
    0 5px 8px rgba(0, 0, 0, 0.5),
    0 2px 3px rgba(0, 0, 0, 0.4),
    inset 0 2px 2px rgba(255, 255, 255, 0.18),
    inset 1px 0 1px rgba(255, 255, 255, 0.06),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* DOWN — pressed + 4-layer orange rim glow */
.skeuo-btn.pressed {
  transform: translateY(4px);
  background: linear-gradient(170deg, #2e3340 0%, #282d36 20%, #22272f 45%, #1c2028 65%, #181c24 85%, #14181f 100%);
  box-shadow:
    inset 0 4px 10px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(0, 0, 0, 0.5),
    inset 3px 0 6px rgba(0, 0, 0, 0.3),
    inset -3px 0 6px rgba(0, 0, 0, 0.3),
    /* 4-layer orange rim glow */ 0 0 0 1.5px rgba(255, 130, 20, 0.5),
    /* liseré net */ 0 0 6px rgba(255, 110, 0, 0.5),
    /* glow serré */ 0 0 6px rgba(255, 110, 0, 0.3),
    0 0 16px rgba(255, 90, 0, 0.25),
    /* halo moyen */ 0 0 35px rgba(255, 70, 0, 0.12),
    /* bloom large */ 0 0 60px rgba(255, 50, 0, 0.06);
}
```

### Engraved → Illuminated text

```css
/* OFF — barely visible engraving */
.btn-text {
  color: rgba(255, 255, 255, 0.08);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03),
    0 -1px 1px rgba(0, 0, 0, 0.8);
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 800;
  letter-spacing: 5px;
}

/* ON — amber illumination, 5-layer glow */
.pressed .btn-text {
  color: rgba(255, 170, 50, 0.95);
  text-shadow:
    0 0 3px rgba(255, 160, 30, 1),
    0 0 8px rgba(255, 120, 0, 0.8),
    0 0 18px rgba(255, 90, 0, 0.5),
    0 0 35px rgba(255, 70, 0, 0.25),
    0 0 60px rgba(255, 50, 0, 0.1);
}
```

### LED bar indicator

```css
.led-bar {
  position: absolute;
  bottom: 8px;
  left: 15%;
  right: 15%;
  height: 1px;
  background: transparent;
  transition: all 0.25s ease;
}
.pressed .led-bar {
  background: rgba(255, 180, 60, 1);
  box-shadow:
    0 0 2px rgba(255, 180, 60, 1),
    0 0 6px rgba(255, 140, 20, 0.8),
    0 0 14px rgba(255, 100, 0, 0.4),
    0 0 30px rgba(255, 80, 0, 0.15);
}
```

### WebAudio click synthesis (3 oscillators)

```js
const useClickSound = () => {
  const ctx = useRef(null);
  return useCallback((toOn) => {
    if (!ctx.current) ctx.current = new AudioContext();
    const c = ctx.current;

    // 1. Click — high-frequency snap
    const o1 = c.createOscillator(),
      g1 = c.createGain();
    o1.connect(g1);
    g1.connect(c.destination);
    o1.frequency.value = toOn ? 2400 : 1200;
    o1.type = "sine";
    g1.gain.setValueAtTime(0.06, c.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.02);
    o1.start(c.currentTime);
    o1.stop(c.currentTime + 0.02);

    // 2. Thud — low-frequency body
    const o2 = c.createOscillator(),
      g2 = c.createGain();
    o2.connect(g2);
    g2.connect(c.destination);
    o2.frequency.value = toOn ? 55 : 80;
    g2.gain.setValueAtTime(toOn ? 0.12 : 0.06, c.currentTime + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    o2.start(c.currentTime + 0.008);
    o2.stop(c.currentTime + 0.1);

    // 3. Contact snap — ON only
    if (toOn) {
      const o3 = c.createOscillator(),
        g3 = c.createGain();
      o3.connect(g3);
      g3.connect(c.destination);
      o3.frequency.value = 5000;
      g3.gain.setValueAtTime(0.02, c.currentTime + 0.012);
      g3.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.025);
      o3.start(c.currentTime + 0.012);
      o3.stop(c.currentTime + 0.025);
    }
  }, []);
};
```

### 3-tier projected light + reflect glow

```css
.glow-1 {
  bottom: -16px;
  width: 160px;
  height: 12px;
  filter: blur(7px);
}
.glow-2 {
  bottom: -30px;
  width: 280px;
  height: 25px;
  filter: blur(16px);
}
.glow-3 {
  bottom: -50px;
  width: 400px;
  height: 40px;
  filter: blur(30px);
}
.glow-reflect {
  top: -12px;
  width: 200px;
  height: 12px;
  filter: blur(8px);
}

/* Each gets orange radial-gradient when ON */
/* background: radial-gradient(ellipse, rgba(255,110,0,0.18), transparent 70%) */
```

### Silkscreen labels

```css
.silk {
  font-family: system-ui;
  font-size: 7px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.05);
}
```

### Flint color palette (CSS custom properties)

```css
:root {
  --flint-100: #5a5e68;
  --flint-200: #44474f;
  --flint-300: #353840;
  --flint-400: #282b32;
  --flint-500: #1e2028;
  --flint-600: #15171d;
  --flint-700: #0e1014;
  --flint-800: #08090c;
  --ember: #ff6a00;
  --ember-hot: #ffaa30;
  --ember-white: #fff4e0;
}
```

**Full working demo**: `assets/codepen-start-stop-button.html`

---

## 63. Trail Toggle Switch (Incandescent Trail)

A horizontal rail toggle with a **7-layer incandescent trail** that fills behind the knob when ON, plus **canvas particle emitters** for spark/ember effects. The trail uses gradient stacking with mask-image fade-ins.

### Rail (recessed channel with 8-layer inset)

```css
.rail {
  width: 390px;
  height: 142px;
  border-radius: 74px;
  background: url("data:image/svg+xml,...feTurbulence baseFrequency='2.5'...opacity='0.04'..."), radial-gradient(ellipse at 50% 60%, #0e1015 0%, #080a0d 40%, #030304 100%);
  box-shadow:
    inset 0 14px 30px rgba(0, 0, 0, 0.98),
    inset 0 6px 12px rgba(0, 0, 0, 0.85),
    inset 0 2px 4px rgba(0, 0, 0, 0.7),
    inset 0 -5px 12px rgba(0, 0, 0, 0.6),
    inset 0 -2px 4px rgba(0, 0, 0, 0.4),
    inset 8px 0 16px rgba(0, 0, 0, 0.6),
    inset -8px 0 16px rgba(0, 0, 0, 0.6),
    inset 0 -1px 1px rgba(255, 255, 255, 0.015);
  overflow: hidden;
}
```

### 7-layer incandescent trail system

Each layer is positioned `left: 0` with `width: 0%` → transitions to target width when `.is-on`:

```css
/* Layer 0: Floor shadow (cast by heat glow) */
.trail-floor-shadow {
  height: 40%;
  bottom: 0;
  filter: blur(8px);
}
.is-on .trail-floor-shadow {
  width: 65%;
}

/* Layer 1: Bloom (wide diffuse orange) */
.trail-bloom {
  background: linear-gradient(90deg, transparent 15%, rgba(80, 20, 0, 0.06) 40%, rgba(180, 50, 0, 0.12) 70%, rgba(255, 70, 0, 0.22) 100%);
  filter: blur(25px);
}
.is-on .trail-bloom {
  width: 74%;
}

/* Layer 2: Mid glow */
.trail-mid {
  background: linear-gradient(90deg, transparent 8%, rgba(200, 60, 0, 0.1) 35%, rgba(255, 80, 0, 0.4) 70%, rgba(255, 110, 10, 0.7) 100%);
  filter: blur(12px);
}
.is-on .trail-mid {
  width: 68%;
}

/* Layer 3: Visible band (main trail color) */
.trail-band {
  background: linear-gradient(180deg, rgba(255, 100, 0, 0.3) 0%, rgba(255, 120, 10, 0.85) 35%, rgba(255, 140, 20, 1) 50%, rgba(255, 110, 10, 0.8) 65%, rgba(255, 80, 0, 0.25) 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 40%, black 100%);
}
.is-on .trail-band {
  width: 63%;
}

/* Layer 4: Core incandescent (narrow hot center) */
.trail-core {
  top: 30%;
  bottom: 30%;
  background: linear-gradient(90deg, transparent 25%, rgba(255, 180, 60, 0.5) 65%, rgba(255, 210, 110, 0.9) 85%, rgba(255, 230, 150, 1) 100%);
}
.is-on .trail-core {
  width: 60%;
}

/* Layer 5: Ceiling reflection */
.trail-ceiling {
  top: 0;
  height: 28%;
  background: linear-gradient(90deg, transparent 35%, rgba(255, 150, 50, 0.06) 60%, rgba(255, 180, 80, 0.14) 80%, rgba(255, 200, 100, 0.2) 100%);
}
.is-on .trail-ceiling {
  width: 58%;
}

/* Layer 6: Knob contact shadow */
.trail-knob-shadow {
  width: 40px;
  top: 10%;
  bottom: 10%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.6), transparent);
  filter: blur(6px);
}
.is-on .trail-knob-shadow {
  right: 4%;
}
```

All layers use `transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` for spring-back motion.

### Trail texture overlay

```css
.trail-texture {
  background: url("data:image/svg+xml,...feTurbulence baseFrequency='3'...opacity='0.12'...");
  mix-blend-mode: overlay;
  -webkit-mask-image: linear-gradient(90deg, transparent 20%, black 60%, black 100%);
}
```

### Aluminum knob with directional shadow flip

```css
.knob {
  width: 180px;
  height: 130px;
  border-radius: 65px;
  background: linear-gradient(165deg, #b8bcc6 0%, #a0a4ae 10%, #868a96 22%, #6e7380 38%, #5c6170 52%, #4e5362 66%, #424754 78%, #363b48 90%, #2e3340 100%);
  box-shadow:
    18px 0 35px rgba(0, 0, 0, 0.85),
    8px 0 15px rgba(0, 0, 0, 0.65),
    inset 0 2px 2px rgba(255, 255, 255, 0.35);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ON: slide right + flip shadows + orange back-spill */
.is-on .knob {
  transform: translateX(192px);
  box-shadow:
    -18px 0 35px rgba(0, 0, 0, 0.85),
    -8px 0 15px rgba(0, 0, 0, 0.65),
    inset 0 2px 2px rgba(255, 255, 255, 0.35),
    -12px 0 25px rgba(255, 100, 0, 0.12),
    -5px 0 10px rgba(255, 120, 0, 0.08);
}
```

### Canvas particle system

```js
const spawn = () => {
  parts.push({
    x: W * 0.48 + Math.random() * W * 0.12, // near knob
    y: H * 0.2 + Math.random() * H * 0.6,
    vx: -0.2 - Math.random() * 0.6, // drift left
    vy: -0.4 - Math.random() * 1.0, // rise
    life: 1,
    decay: 0.01 + Math.random() * 0.018,
    size: 1 + Math.random() * 2.2,
    bright: 0.5 + Math.random() * 0.5
  });
};
// 3-layer particle rendering:
// Core: rgba(255,240,200,a) at r*0.35
// Mid:  rgba(255,130,30,a*0.6) at r
// Halo: rgba(255,60,0,a*0.12) at r*2.5
```

**Full working demo**: `assets/codepen-trail-toggle-switch.html`

---

## 64. Gunmetal Slider Switch (Plasma Core)

A heavy industrial slider switch with **plasma core** backlight, **grip ridges**, directional shadow flipping, and star (★) Torx screws. Minimal, brutalist design.

### Gunmetal plate with feTurbulence grain

```css
.hardware-plate {
  background: linear-gradient(135deg, #25282e 0%, #111316 100%);
  padding: 50px 70px;
  border-radius: 20px;
  box-shadow:
    0 40px 60px -10px rgba(0, 0, 0, 0.9),
    inset 1px 1px 2px rgba(255, 255, 255, 0.1),
    inset -2px -2px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #000;
}
/* Grain overlay */
.hardware-plate::before {
  background-image: url("data:image/svg+xml,...baseFrequency='1.2'...opacity='0.08'...");
  mix-blend-mode: overlay;
}
```

### CNC switch track (recessed slot)

```css
.switch-track {
  width: 320px;
  height: 120px;
  background: #030405;
  border-radius: 60px;
  padding: 8px;
  box-shadow:
    inset 0 15px 25px rgba(0, 0, 0, 1),
    inset 0 5px 10px rgba(0, 0, 0, 1),
    inset 0 -2px 4px rgba(255, 255, 255, 0.05),
    0 1px 1px rgba(255, 255, 255, 0.1);
}
```

### Plasma core (inner glow behind knob)

```css
.plasma-core {
  position: absolute;
  left: 10px;
  top: 10px;
  bottom: 10px;
  width: calc(100% - 20px);
  border-radius: 50px;
  background: #000;
}
.is-on .plasma-core {
  background: #0a0100;
  box-shadow:
    inset 30px 0 60px #ff3300,
    0 0 20px rgba(255, 51, 0, 0.4);
  transition: all 0.3s ease-out 0.1s;
}
```

### Grip ridges (machined knurling)

```css
.grip-ridge {
  width: 4px;
  height: 44px;
  background: #111316;
  border-radius: 2px;
  box-shadow:
    inset 1px 0 1px rgba(0, 0, 0, 1),
    inset -1px 0 1px rgba(255, 255, 255, 0.1),
    1px 0 1px rgba(255, 255, 255, 0.1);
}
```

### Directional shadow flip + heavy spring bezier

```css
.slider-knob {
  background: linear-gradient(145deg, #4a4f59 0%, #202328 50%, #111316 100%);
  border-radius: 52px;
  transition: transform 0.5s cubic-bezier(0.8, -0.2, 0.2, 1.2);
  /* Shadow casts RIGHT in OFF state */
  box-shadow:
    15px 0 20px rgba(0, 0, 0, 0.8),
    5px 0 10px rgba(0, 0, 0, 0.6),
    ...;
}
.is-on .slider-knob {
  transform: translateX(164px);
  /* Shadow flips to LEFT */
  box-shadow:
    -15px 0 20px rgba(0, 0, 0, 0.9),
    -5px 0 10px rgba(0, 0, 0, 0.7),
    ...;
}
```

### Star Torx screws

```css
.screw::after {
  content: "★";
  color: #050505;
  font-size: 8px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
}
/* Each corner rotated differently */
.screw-tl {
  transform: rotate(15deg);
}
.screw-tr {
  transform: rotate(-35deg);
}
.screw-bl {
  transform: rotate(85deg);
}
.screw-br {
  transform: rotate(120deg);
}
```

### Engraved labels with neon ON state

```css
.label {
  font-family: "Orbitron", sans-serif;
  font-size: 14px;
  color: #2a2d33;
  letter-spacing: 0.2em;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.1);
}
.is-on .label.on {
  color: #ff3300;
  text-shadow:
    0 0 10px rgba(255, 51, 0, 0.8),
    0 0 20px rgba(255, 51, 0, 0.4);
}
```

**Full working demo**: `assets/codepen-gunmetal-switch.html`

---

## 65. Synth LCD Screen (5-Layer Glass + Conic Bezel)

A **synthesizer memory display** with a backlit LCD screen, 5-layer glass reflection system, conic-gradient machined bezel, and 3-tier chassis light spill. The LCD uses a warm blue-gray palette (`--lcd-hi: #b8ccd8`, `--lcd-ink: #3a5a72`).

### Conic-gradient bezel (CNC-milled ring)

```css
.screen-bezel {
  background: conic-gradient(
    from 20deg,
    var(--flint-400) 0deg,
    var(--flint-200) 15deg,
    var(--flint-500) 40deg,
    var(--flint-300) 80deg,
    var(--flint-500) 120deg,
    var(--flint-200) 160deg,
    var(--flint-400) 200deg,
    var(--flint-300) 250deg,
    var(--flint-500) 300deg,
    var(--flint-200) 340deg,
    var(--flint-400) 360deg
  );
  border-radius: 42px;
  padding: 5px;
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 2px rgba(0, 0, 0, 0.8);
}
```

### LCD surface with deep inset shadows

```css
.screen-lcd {
  background: linear-gradient(178deg, var(--lcd-hi) 0%, var(--lcd-lo) 100%);
  border-radius: 28px;
  box-shadow:
    inset 0 12px 25px rgba(0, 0, 0, 0.45),
    inset 0 5px 12px rgba(0, 0, 0, 0.35),
    inset 6px 0 15px rgba(0, 0, 0, 0.12),
    inset -6px 0 15px rgba(0, 0, 0, 0.12),
    inset 0 -8px 16px rgba(255, 255, 255, 0.6),
    inset 0 -2px 4px rgba(255, 255, 255, 0.7);
}
```

### Pixel grid (LCD subpixel simulation)

```css
.screen-lcd::before {
  background:
    repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.02) 2px, rgba(0, 0, 0, 0.02) 4px),
    repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.015) 2px, rgba(0, 0, 0, 0.015) 4px);
  z-index: 5;
}
```

### 5-layer glass reflection system

```css
/* 1. Depth — overall glass thickness gradient */
.glass-depth {
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 35%, rgba(0, 0, 0, 0.04) 60%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 10;
}

/* 2. Fresnel — diagonal reflection band */
.glass-fresnel {
  top: -25%;
  left: -12%;
  width: 130%;
  height: 65%;
  background: linear-gradient(162deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 38%, transparent 42%);
  transform: rotate(-3deg);
  filter: blur(1.5px);
  z-index: 11;
}

/* 3. Specular highlight (top-left corner) */
.glass-spec {
  top: 4%;
  left: 4%;
  width: 25%;
  height: 15%;
  background: radial-gradient(ellipse at 30% 40%, rgba(255, 255, 255, 0.18) 0%, transparent 70%);
  filter: blur(3px);
  z-index: 12;
}

/* 4. Caustic (bottom-right bounce light) */
.glass-caustic {
  bottom: 4%;
  right: 6%;
  width: 35%;
  height: 8%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
  filter: blur(10px);
  z-index: 12;
}

/* 5. Rim light (top edge shine) */
.glass-rim {
  top: 0;
  left: 5%;
  right: 5%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.25) 70%, transparent);
  z-index: 13;
}
```

### 3-tier screen backlight spill

```css
/* Near halo (around screen) */
.screen-glow-near {
  width: 110%;
  height: 110%;
  background: radial-gradient(ellipse, rgba(160, 195, 215, 0.1) 0%, transparent 60%);
}
/* Mid diffusion (onto bezel) */
.screen-glow-mid {
  width: 130%;
  height: 140%;
  filter: blur(10px);
  background: radial-gradient(ellipse, rgba(160, 195, 215, 0.05) 0%, transparent 65%);
}
/* Far spill (onto chassis) */
.screen-glow-far {
  width: 160%;
  height: 180%;
  filter: blur(25px);
  background: radial-gradient(ellipse, rgba(160, 195, 215, 0.025) 0%, transparent 60%);
}
```

### 3-tier chassis floor spill

```css
.chassis-spill-1 {
  bottom: -25px;
  width: 60%;
  height: 20px;
  filter: blur(8px);
}
.chassis-spill-2 {
  bottom: -45px;
  width: 80%;
  height: 35px;
  filter: blur(18px);
}
.chassis-spill-3 {
  bottom: -75px;
  width: 110%;
  height: 55px;
  filter: blur(35px);
}
/* All: radial-gradient(ellipse, rgba(160,195,215,N), transparent) */
```

### LCD text style

```css
.lcd-text {
  color: var(--lcd-ink); /* #3a5a72 */
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.12);
  filter: brightness(0.88);
}
```

**Full working demo**: `assets/codepen-synth-lcd-screen.html`

---

## 66. Deep 3D LCD Display (Cyan Radial Backlight)

A **deeper, more vivid** LCD variant using cyan radial-gradient backlight, a heavy 3px pixel grid rendered **above** text (z-index: 15), and an **inverted block** pattern for active UI elements (dark bg, light text — simulating LCD segment inversion).

### Cyan radial backlight

```css
.lcd-display {
  background: radial-gradient(circle at 50% 50%, #8ae0ff 0%, #3a8ebd 50%, #102a3d 100%);
  border-radius: 4px;
  box-shadow:
    inset 0 10px 20px rgba(0, 0, 0, 0.8),
    inset 0 -5px 15px rgba(0, 0, 0, 0.5);
}
```

### 3px pixel grid (z-above text)

```css
.lcd-grid {
  background-image: linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 3px 3px;
  z-index: 15; /* ABOVE text (z-index: 10) — simulates physical pixels */
}
```

### Glass overlay (single brutal Fresnel)

```css
.glass-overlay {
  background: linear-gradient(110deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.02) 35%, transparent 36%);
  box-shadow:
    inset 0 2px 2px rgba(255, 255, 255, 0.3),
    /* top bevel */ inset 0 -2px 5px rgba(0, 0, 0, 0.6); /* bottom bevel */
  z-index: 20;
}
```

### Inverted block (active element)

```css
.lcd-inverted-block {
  background: #06121c; /* Crystals CLOSED — blocks backlight */
  color: #8ae0ff; /* Light passes through */
  padding: 4px 12px;
  border: 1px solid #06121c;
  box-shadow: 0 0 15px rgba(138, 224, 255, 0.3);
  text-shadow: 0 0 5px rgba(138, 224, 255, 0.8);
}
```

### LCD text with optical bleed

```css
.lcd-text {
  color: #06121c;
  text-shadow:
    0 0 10px rgba(180, 230, 255, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 10;
}
```

### Screen cutout (deep gorge)

```css
.screen-cutout {
  background: #020304;
  padding: 14px;
  border-radius: 14px;
  box-shadow:
    inset 0 25px 35px -10px rgba(0, 0, 0, 1),
    inset 0 4px 10px rgba(0, 0, 0, 1),
    0 1px 1px rgba(255, 255, 255, 0.1);
}
```

**Full working demo**: `assets/codepen-synth-lcd-deep3d.html`

---

## 67. Glass Power Button — Forge Edition

A **square glass power button** (150×150px) in a conic-gradient bezel with LED ring, SVG power icon that transitions from engraved to neon, and `color-dodge` glow layers under the glass surface.

### Conic bezel + inner chamfer

```css
.bezel {
  background: conic-gradient(from 0deg, #1e2024 0deg, #2a2d32 30deg, #18191d 60deg, #2c2f34 120deg, #1b1c20 180deg, #272a2f 240deg, #1d1e22 300deg, #1e2024 360deg);
  padding: 8px;
  border-radius: 32px;
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.7),
    inset 0 1px 1px rgba(255, 255, 255, 0.08),
    inset 0 -1px 2px rgba(0, 0, 0, 0.9);
}
.bezel-inner {
  background: linear-gradient(160deg, #111215 0%, #0a0a0d 100%);
  padding: 6px;
  border-radius: 26px;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.9),
    inset 0 -1px 1px rgba(255, 255, 255, 0.04);
}
```

### Glass button with Fresnel reflection

```css
.glass-btn {
  width: 150px;
  height: 150px;
  border-radius: 22px;
  background: linear-gradient(155deg, rgba(52, 56, 64, 0.92) 0%, rgba(16, 18, 22, 0.96) 100%);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.8),
    inset 0 2px 3px rgba(255, 255, 255, 0.18),
    inset 0 -4px 12px rgba(0, 0, 0, 0.85);
  transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* Fresnel reflection */
.glass-btn::before {
  background: linear-gradient(128deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 35%, transparent 36%);
}
/* Mechanical press */
.glass-btn:active {
  transform: translateY(6px) scale(0.985);
  box-shadow: inset 0 8px 18px rgba(0, 0, 0, 0.9);
}
```

### LED ring (peripheral border glow)

```css
.led-ring {
  position: absolute;
  inset: 2px;
  border-radius: 24px;
  border: 2px solid transparent;
  opacity: 0;
  transition: all 0.4s ease;
}
.is-on .led-ring {
  border-color: rgba(255, 40, 0, 0.5);
  box-shadow:
    0 0 8px rgba(255, 30, 0, 0.4),
    0 0 20px rgba(255, 0, 0, 0.2),
    inset 0 0 12px rgba(255, 20, 0, 0.15);
  opacity: 1;
}
```

### SVG power icon: engrave → neon

```css
/* OFF — engraved into glass surface */
.power-icon-off {
  stroke: #1a1a1a;
  filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.08));
}
/* ON — neon glow with breathing animation */
.power-icon-on {
  stroke: #fff;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 12px rgba(255, 60, 10, 0.9)) drop-shadow(0 0 28px rgba(255, 0, 0, 0.4)) drop-shadow(0 0 50px rgba(255, 20, 0, 0.15));
  animation: led-breathe 2s ease-in-out infinite alternate;
}
@keyframes led-breathe {
  0% {
    opacity: 0.88;
  }
  100% {
    opacity: 1;
  }
}
```

### Under-glass glow layers (color-dodge + screen)

```css
.glow-radial {
  background: radial-gradient(circle at 50% 50%, var(--led-core) 0%, rgba(255, 30, 0, 0.3) 25%, transparent 55%);
  mix-blend-mode: color-dodge;
}
.is-on .glow-radial {
  opacity: 0.7;
}

.glow-ambient {
  background: radial-gradient(ellipse at 50% 60%, rgba(255, 20, 0, 0.08) 0%, transparent 70%);
  mix-blend-mode: screen;
}
.is-on .glow-ambient {
  opacity: 1;
}
```

### LED color palette (CSS custom properties)

```css
:root {
  --led-core: #ff2800;
  --led-mid: rgba(255, 60, 10, 0.9);
  --led-outer: rgba(255, 0, 0, 0.4);
  --led-bleed: rgba(255, 20, 0, 0.15);
}
```

**Full working demo**: `assets/codepen-power-button-forge.html`

---

## 68. Hardware Gauge Dashboard (Asymmetric Ballistic Needle)

A complete **instrument dashboard** with a circular gauge (glass dome, SVG tick marks, color-coded zones), a **VFD digital readout**, and an industrial mode switch. The needle uses **asymmetric ballistic physics** (fast attack, slow release) with direct DOM manipulation for zero React re-renders.

### Gauge construction hierarchy

```
hardware-panel (gunmetal plate)
└── gauge-bezel (gradient ring + massive shadow)
    └── gauge-face (radial dark gradient)
        ├── GaugeFaceSVG (ticks, labels, red zone arc)
        ├── VFD display (bottom center)
        ├── needle-wrapper (direct DOM transform)
        ├── pivot (chrome hub)
        └── glass-dome (top specular + bottom shadow)
```

### Asymmetric ballistic needle (attack ≠ release)

```js
// Physics state outside React (zero re-renders)
const physics = useRef({ current: 0, velocity: 0 });

function animate() {
  const target = targetBase + (Math.random() * 6 - 3); // analog jitter
  const diff = target - physics.current;

  // ASYMMETRIC damping: attack fast (0.15), release slow (0.05)
  const damping = diff > 0 ? 0.15 : 0.05;
  physics.velocity = (physics.velocity + diff * damping) * 0.7; // spring friction
  physics.current += physics.velocity;

  // Direct DOM manipulation — bypass React
  needleRef.current.style.transform = `rotate(${angle}deg)`;
  textRef.current.innerText = physics.current.toFixed(1).padStart(5, "0");

  requestAnimationFrame(animate);
}
```

### Gauge face SVG (color-coded ticks)

```jsx
// Tick color by zone
let color = "#38bdf8";     // Cyan (normal)
if (i >= 80) color = "#eab308";  // Yellow (warning)
if (i >= 100) color = "#f43f5e"; // Red (danger)

// Each tick gets drop-shadow matching its color
<line ... stroke={color}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
```

### Red zone arc background

```jsx
<path d="M 177.78 145 A 90 90 0 0 0 186.6 69.1" fill="none" stroke="rgba(244,63,94,0.15)" strokeWidth="15" filter="blur(4px)" />
```

### Needle with red glow

```css
.needle-arm {
  width: 4px;
  height: 42%;
  background: linear-gradient(to right, #fff, #d4d4d8, #a1a1aa);
  transform-origin: bottom center;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
  filter: drop-shadow(0 15px 10px rgba(0, 0, 0, 0.6));
}
.needle-arm::after {
  background: linear-gradient(to bottom, #f43f5e, #9f1239);
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.8);
}
```

### Chrome pivot hub

```css
.pivot {
  width: 32px;
  height: 32px;
  background: radial-gradient(circle at 30% 30%, #4a4d52, #181a1d);
  border-radius: 50%;
  box-shadow:
    0 5px 10px rgba(0, 0, 0, 0.8),
    inset 1px 1px 2px rgba(255, 255, 255, 0.3);
  z-index: 45;
}
```

### Glass dome (specular + depth)

```css
.glass-dome {
  background: radial-gradient(120% 90% at 50% -10%, rgba(255, 255, 255, 0.08) 0%, transparent 45%), linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 40%, rgba(0, 0, 0, 0.5) 100%);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
  z-index: 50;
}
```

### VFD display (vacuum fluorescent)

```css
.vfd-display {
  background: #020406;
  border: 1px solid #000;
  box-shadow:
    inset 0 3px 8px rgba(0, 0, 0, 0.9),
    0 1px 0 rgba(255, 255, 255, 0.05);
  font-family: "Orbitron", monospace;
  color: #0ff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
}
.vfd-display.red {
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
}
```

### Industrial switch (mode toggle)

```css
.industrial-switch {
  background: linear-gradient(180deg, #32363b 0%, #1a1c1f 100%);
  border-radius: 12px;
  border: 1px solid #444;
  box-shadow:
    0 8px 15px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    0 0 0 2px #0a0a0c;
}
.industrial-switch:active {
  transform: translateY(4px);
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.8),
    inset 0 2px 4px rgba(0, 0, 0, 0.5);
}
```

### LED indicators

```css
.indicator-led {
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.5),
    0 0 10px currentColor;
}
/* Cyan when AVG mode */
.bg-cyan-400 {
  color: cyan;
}
/* Rose when PEAK mode */
.bg-rose-500 {
  color: #f43f5e;
}
```

**Full working demo**: `assets/codepen-hardware-dashboard.html`

---

## 69. HPF Crossover Screen — Tweeter Channel

A **DSP crossover analyzer** displaying a Butterworth 4th-order (24 dB/oct) high-pass filter curve with animated FFT spectrum, pulsing cutoff indicator, and a DSP-style info panel. Companion to pattern 46 (LPF crossover) — this shows the HPF variant for tweeter channel protection.

### Chassis + screen bezel

```css
.chassis {
  background: linear-gradient(180deg, #2a2c31 0%, #15171a 100%);
  padding: 2px;
  border-radius: 16px;
  box-shadow:
    0 60px 100px -20px rgba(0, 0, 0, 1),
    0 20px 40px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}
.chassis-inner {
  background: linear-gradient(135deg, #121316 0%, #08090a 100%);
  padding: 36px;
  border-radius: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 1);
  box-shadow: inset 0 6px 15px rgba(0, 0, 0, 0.8);
}
.screen-bezel {
  width: 750px;
  height: 400px;
  background-color: #020304;
  border-radius: 10px;
  box-shadow:
    inset 0 35px 60px -10px rgba(0, 0, 0, 1),
    inset 0 0 30px 10px rgba(0, 0, 0, 1),
    0 1px 0 rgba(255, 255, 255, 0.12);
  border-top: 3px solid #000;
  border-bottom: 1px solid #22252a;
  overflow: hidden;
}
```

### Log-frequency axis (20 Hz – 20 kHz)

```js
const LOG_MIN = Math.log10(20);
const LOG_MAX = Math.log10(20000);
const LOG_RANGE = LOG_MAX - LOG_MIN;

const freqToX = (hz) => ((Math.log10(hz) - LOG_MIN) / LOG_RANGE) * PLOT_W + MARGIN_L;
const xToFreq = (x) => Math.pow(10, ((x - MARGIN_L) / PLOT_W) * LOG_RANGE + LOG_MIN);
```

### Butterworth HPF curve (Linkwitz-Riley 4th order)

```js
// LR4: squared Butterworth 2nd order — 24 dB/oct rolloff
const buildHPF = () => {
  const pts = [];
  for (let i = 0; i <= 250; i++) {
    const x = MARGIN_L + (i / 250) * PLOT_W;
    const freq = xToFreq(x);
    const ratio = freq / cutoffHz;
    const r4 = Math.pow(ratio, 4);
    const magLin = r4 / (1 + r4); // HPF transfer function
    const magDb = 10 * Math.log10(Math.max(magLin, 1e-10));
    const y = Math.min(dbToY(magDb), 455);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts;
};
```

### dB scale mapping

```js
const zeroDbY = 150;
const dbToY = (db) => zeroDbY - db * (50 / 6); // 6 dB per 50px
const minus3Y = dbToY(-3); // -3 dB point at cutoff
```

### Animated FFT spectrum (3 zones)

```js
fftRef.current.forEach((pt) => {
  if (pt.x > cutoffX + 60) {
    // Passband (above cutoff): active signal
    pt.target = 100 + Math.random() * 220;
  } else if (pt.x > cutoffX - 40) {
    // Transition band: interpolated attenuation
    const r = (cutoffX + 60 - pt.x) / 100;
    pt.target = active * (1 - r) + attenuated * r;
  } else {
    // Stopband (below cutoff): heavily attenuated
    pt.target = 405 + Math.random() * 25;
  }
});
// Ease toward target
pt.y += (pt.target - pt.y) * 0.06;
```

### Cutoff indicator (pulsing dot + vertical line)

```css
@keyframes cutoff-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
```

```jsx
{
  /* Cutoff vertical dashed line */
}
<line x1={cx} y1="45" x2={cx} y2="450" stroke="#ff4400" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" filter="url(#softGlow)" />;

{
  /* Pulsing dot at -3dB intersection */
}
<circle cx={cx} cy={minus3Y} r="7" fill="#ff4400" filter="url(#cutoffGlow)" style={{ animation: "cutoff-pulse 2s ease-in-out infinite" }} />;

{
  /* "fc" label above */
}
<text x={cx} y="42" fill="#ff4400" fontSize="12" fontWeight="700" style={{ filter: "drop-shadow(0 0 6px rgba(255,68,0,0.5))" }}>
  fc
</text>;
```

### SVG filter stack (3 glow variants)

```jsx
{
  /* Neon glow for main curve */
}
<filter id="neonGlow">
  <feGaussianBlur stdDeviation="5" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>;

{
  /* Intense glow for cutoff dot */
}
<filter id="cutoffGlow">
  <feGaussianBlur stdDeviation="8" result="b1" />
  <feGaussianBlur stdDeviation="22" result="b2" />
  <feMerge>
    <feMergeNode in="b2" />
    <feMergeNode in="b1" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>;

{
  /* Subtle glow for labels */
}
<filter id="softGlow">
  <feGaussianBlur stdDeviation="3" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>;
```

### HPF passband fill (gradient under curve)

```jsx
<linearGradient id="passFill" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
  <stop offset="50%" stopColor="#0369a1" stopOpacity="0.06" />
  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
</linearGradient>

<path d={hpfFill} fill="url(#passFill)" style={{ mixBlendMode: 'screen' }} />
```

### DSP info panel (rounded rect overlay)

```jsx
<rect x="62" y="48" width="135" height="105" rx="4"
      fill="rgba(0,0,0,0.5)" stroke="rgba(56,189,248,0.15)" strokeWidth="1" />
{/* Content: HPF title, type, slope, order */}
<text fill="#38bdf8" fontSize="22" fontWeight="700">HPF</text>
<text fill="#8898b8" fontSize="10">Butterworth</text>
<text fill="#8898b8" fontSize="10">24 dB/oct</text>
<text fill="#8898b8" fontSize="10">4th</text>
```

### Slope annotation (dashed line along rolloff)

```jsx
<line x1={cx - 30} y1={minus3Y + 25} x2={cx - 140} y2={minus3Y + 140}
      stroke="#ff6644" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
<text fill="#ff6644" fontSize="11" fontWeight="600">24 dB/oct</text>
```

### Zone labels (REJECTED / PASSBAND)

```jsx
<text x={(MARGIN_L + cx) / 2} y="430"
      fill="#4a2020" fontSize="12" fontWeight="700" opacity="0.5">
  REJECTED
</text>
<text x={cx + (MARGIN_R - cx) / 2} y="430"
      fill="#1a4a6a" fontSize="12" fontWeight="700" opacity="0.5">
  PASSBAND
</text>
```

### Stopband tint (subtle red zone)

```jsx
<rect x={MARGIN_L} y="40" width={Math.max(cx - MARGIN_L, 0)} height="415" fill="rgba(255,20,0,0.03)" />
```

### Screen layers (ambient + scanlines + glass)

```css
.screen-ambient-glow {
  background: radial-gradient(circle at 50% 50%, #061020 0%, #010203 100%);
  z-index: 0;
}
.scanlines {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1));
  background-size: 100% 4px;
  z-index: 40;
}
.glass-reflection {
  background:
    linear-gradient(110deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0) 31%),
    radial-gradient(150% 100% at 50% -25%, rgba(255, 255, 255, 0.05) 0%, transparent 45%);
  mix-blend-mode: screen;
  z-index: 50;
}
```

**Full working demo**: `assets/codepen-hpf-crossover-tweeter.html`
