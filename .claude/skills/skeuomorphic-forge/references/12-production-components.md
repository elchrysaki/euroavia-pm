# 12 — Production Component Patterns

Compact pattern catalog extracted from 11 production HTML assets.
Use the search engine to find patterns, then read the HTML asset for full implementation.

---

## 12.1 Power Button (`assets/power-button.html`)

**Physical analog**: Machined gunmetal panel with recessed push-button, Phillips screws, LED glow slot.

### Construction layers (back → front)

| Layer             | Element       | Shadow layers              | Key technique                                                                                                        |
| ----------------- | ------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Panel (chassis)   | `.panel`      | **13** (5 drop + 8 inset)  | Fusil bleu nuit gradient `#3e3e56 → #28282e`, brushed-metal micro-texture via `repeating-linear-gradient(90deg)`     |
| Screws (hardware) | `.screw`      | **9** (5 inset + 4 drop)   | Convex sphere `radial-gradient(circle at 35% 28%)`, Phillips cross via `::before` + `::after` with tapered gradients |
| Well (recess)     | `.well`       | **10** (8 inset + 2 outer) | Deep inset progression `0→1→2→5→9→14px`, side walls `±2px 0 8px`                                                     |
| Button face       | `.btn`        | **17** (11 inset + 6 drop) | Thick convex surface, specular hotspot `::before` `radial-gradient(ellipse 75% 45% at 30% 18%)`                      |
| Glow slot         | `.glow-slot`  | **6** inset                | LED strip: amber radial-gradient `#fffbf0 → #e87820 → #7a2a00` + 7-layer glow `box-shadow`                           |
| Label             | `.label-text` | 2-layer text-shadow        | Silkscreen: `color: #50506a`, shadow `0 1px 0 rgba(80,90,120,0.08)` + `0 -1px 0 rgba(0,0,0,0.70)`                    |

### Interaction: active state

17→16 layers, compressed — highlights halved, drop shadows reduced, `translateY(2px) scale(0.992)`.

### Key shadow stack — Button face (17 layers)

```css
box-shadow:
  inset 0 1px 0 rgba(100, 115, 155, 0.7),
  /* top edge — warm steel */ inset 0 3px 5px rgba(85, 100, 140, 0.22),
  /* top diffuse */ inset 0 5px 10px rgba(70, 85, 120, 0.1),
  /* deep top */ inset 1px 0 0 rgba(85, 98, 132, 0.3),
  /* left edge */ inset 3px 0 6px rgba(70, 85, 115, 0.1),
  /* left diffuse */ inset -1px 0 0 rgba(0, 0, 0, 0.75),
  /* right shadow */ inset -3px 0 7px rgba(0, 0, 0, 0.4),
  /* right deep */ inset 0 -1px 0 rgba(0, 0, 0, 0.96),
  /* bottom edge */ inset 0 -3px 6px rgba(0, 0, 0, 0.8),
  /* bottom diffuse */ inset 0 -7px 14px rgba(0, 0, 0, 0.6),
  /* bottom deep */ inset 0 0 20px rgba(0, 0, 0, 0.38),
  /* ambient */ 0 1px 1px rgba(0, 0, 0, 1),
  /* contact */ 0 3px 5px rgba(0, 0, 0, 0.97),
  /* close */ 0 6px 12px rgba(0, 0, 0, 0.88),
  /* near */ 0 12px 22px rgba(0, 0, 0, 0.68),
  /* mid */ 0 20px 36px rgba(0, 0, 0, 0.38),
  /* far */ 0 30px 55px rgba(0, 0, 0, 0.16); /* ambient floor */
```

---

## 12.2 SynthScore Analytics (`assets/synthscore-analytics.html`)

**Physical analog**: Tech dashboard panel with segmented LED bar, metallic border gauge, decorative corner brackets.

### Construction layers

| Layer           | Element            | Key technique                                                                                                                                                                |
| --------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel shell     | `.panel-texture`   | SVG noise-filter `background-image`, `radial-gradient` subtle vignette                                                                                                       |
| Title bar       | top strip          | `bg-[#121419]`, `border-b`, `box-shadow: shadow-md`                                                                                                                          |
| Corner brackets | decorative borders | `border-t border-l rounded-tl-xl` with tick marks at fixed positions                                                                                                         |
| Score display   | big number         | `text-glow-cyan`: `text-shadow: 0 0 20px rgba(34,211,238,0.7), 0 0 40px rgba(34,211,238,0.3)`                                                                                |
| Metallic border | `.metallic-border` | **Gradient padding trick**: `background: linear-gradient(180deg, #4a4d5a, #2a2c35)` + `padding: 2px` + `border-radius: 12px`                                                 |
| Inner pit       | `.inner-pit`       | `inset 0 4px 12px rgba(0,0,0,1), inset 0 1px 3px rgba(0,0,0,0.8)`                                                                                                            |
| Segment bar     | 38 segments        | **Gradient color function**: cyan→purple→orange across segments, active = `glass-segment-active`, inactive = `glass-segment-inactive` with `inset 0 2px 4px rgba(0,0,0,0.8)` |
| Peak indicator  | orange marker      | `box-shadow: 0_0_8px_rgba(251,146,60,1)`                                                                                                                                     |

### Key technique — Metallic border (gradient padding)

```css
.metallic-border {
  background: linear-gradient(180deg, #4a4d5a 0%, #2a2c35 100%);
  padding: 2px;
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.8),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}
```

---

## 12.3 Tube Compressor VU Meter (`assets/tube-compressor-vu.html`)

**Physical analog**: Machined aluminum housing with deep-set amber VU display, convex glass, animated needle.

### Construction layers

| Layer         | Element              | Shadow layers | Key technique                                                                                                                         |
| ------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Outer frame   | `.outer-frame`       | **14**        | Machined housing, brushed-metal `::before` (repeating-linear-gradient 93deg), specular top edge `::after`                             |
| Display well  | `.display-container` | **16 inset**  | Deep recess: 6 vertical layers (1→20px), 2 vertical bottom, 4 horizontal (±3px, ±6px), 2 diagonal                                     |
| Depth overlay | `.display-depth`     | —             | 3 stacked gradients: vertical vignette + horizontal vignette + radial edge darkening                                                  |
| Inner bezel   | `.inner-bezel`       | —             | 4-directional borders: top `rgba(0,0,0,0.9)`, left `rgba(0,0,0,0.7)`, bottom `rgba(255,255,255,0.03)`, right `rgba(255,255,255,0.02)` |
| Glass overlay | `.glass-overlay`     | —             | **5 gradient layers**: elliptical top highlight, corner hotspot, diagonal band, bottom reflection, left edge                          |
| Glass edge    | `.glass-edge`        | —             | **mask-composite trick**: gradient border without fill using `-webkit-mask-composite: xor`                                            |
| Needle        | `.needle`            | —             | `linear-gradient(to top)` orange with `box-shadow: 0 0 10px rgba(255,77,0,0.6)`, animated rotation                                    |
| Arc scale     | SVG path             | —             | Dashed arc `stroke-dasharray: 2,2`                                                                                                    |

### Key technique — 5-layer convex glass

```css
.glass-overlay {
  background:
    radial-gradient(ellipse 120% 45% at 50% -8%, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 55%),
    radial-gradient(ellipse 25% 20% at 18% 8%, rgba(255, 255, 255, 0.06) 0%, transparent 70%),
    linear-gradient(
      128deg,
      transparent 18%,
      rgba(255, 255, 255, 0.006) 22%,
      rgba(255, 255, 255, 0.02) 26%,
      rgba(255, 255, 255, 0.03) 30%,
      rgba(255, 255, 255, 0.02) 34%,
      rgba(255, 255, 255, 0.006) 38%,
      transparent 42%
    ),
    radial-gradient(ellipse 40% 8% at 50% 100%, rgba(255, 255, 255, 0.015) 0%, transparent 70%), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0%, transparent 1.5%);
}
```

### Key technique — mask-composite glass edge

```css
.glass-edge {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.025) 25%, transparent 50%, rgba(255, 255, 255, 0.015) 80%, rgba(255, 255, 255, 0.04) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

---

## 12.4 Skeuomorphic Switch (`assets/skeuomorphic-switch.html`)

**Physical analog**: Heavy-duty rocker switch with recessed track, grip handle, red/white LED indicators.

### Construction layers

| Layer              | Element               | Shadow layers              | Key technique                                                                                                                     |
| ------------------ | --------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Track (recess)     | `.switch-track`       | **7** (3 inset + 4 visual) | Stipple texture `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px) 8px 8px`, orange active `background-color: #e65100` |
| Handle (slider)    | `.switch-handle`      | **6**                      | Convex gradient `linear-gradient(145deg, #5a5f64 → #1a1d21)`, specular `::before` top 35%, 3 grip lines                           |
| Grip lines         | `.grip-line`          | 2                          | `width: 4px; height: 40px`, shadow + inset for channel depth                                                                      |
| LED off            | `.indicator-left.off` | 1 inset                    | Dark pit: `background: #0f0f0f`, `inset 0 2px 6px rgba(0,0,0,1)`                                                                  |
| LED active (red)   | `.indicator-left`     | **5** (1 inset + 4 glow)   | `background: #ff4500`, glow: `0 0 15px rgba(255,69,0,0.5)`                                                                        |
| LED active (white) | `.indicator-right.on` | **5** (1 inset + 4 glow)   | `background: #fff`, intense: `0 0 35px 8px rgba(255,255,255,0.5)`                                                                 |

### Transition

```css
transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1); /* physical spring feel */
```

---

## 12.5 LCD dB Display (`assets/lcd-db-display.html`)

**Physical analog**: Authentic olive LCD screen in recessed housing with scanlines and glass reflection.

### Construction layers

| Layer            | Element             | Shadow layers             | Key technique                                                                                      |
| ---------------- | ------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| Recessed housing | `.lcd-recessed`     | **3** (2 inset + 1 outer) | `background: #181818`, `border: 1px solid #111`                                                    |
| LCD screen       | `.lcd-screen-inner` | **3** inset               | Olive gradient `linear-gradient(160deg, #4e5450 → #3e4440)`, `inset 6px 6px 16px rgba(0,0,0,0.85)` |
| Scanlines        | `::after`           | —                         | `repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0-1px, transparent 1-3px)`                       |
| Glass reflection | `::before`          | —                         | `linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 100%)` top 45%                  |
| LCD number       | `.lcd-number`       | 2-layer text-shadow       | Font: `Digital-7 Mono`, 78px, dark-on-olive `color: rgba(12,14,12,0.92)`                           |
| Unit label       | `.db-label`         | 1-layer text-shadow       | `Inter 700`, 18px, `letter-spacing: 0.20em`, `color: rgba(12,14,12,0.52)`                          |

### Key technique — LCD text rendering

Dark text on olive background (NOT bright text on dark) — authentic LCD contrast:

```css
color: rgba(12, 14, 12, 0.92);
text-shadow:
  0 1px 0 rgba(255, 255, 255, 0.07),
  0 2px 5px rgba(0, 0, 0, 0.42);
```

---

## 12.6 Industrial Lever (`assets/industrial-lever.html`)

**Physical analog**: Gunmetal rotary lever with SVG Phillips screws, red/green LED indicators, recessed track, animated position change.

### Construction layers

| Layer            | Element                         | Shadow layers             | Key technique                                                                                                              |
| ---------------- | ------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Panel (form)     | `form`                          | **13** (5 drop + 8 inset) | Brushed metal micro-texture, diagonal specular band `rgba(255,255,255,0.13) at 32%`                                        |
| Lever knob       | `.lever` (checkbox)             | **11**                    | **15+ radial-gradient stops** for machined concentric rings, `background-position` shift for checked state                 |
| Lever handle     | `::before`                      | **7** (5 drop + 2 inset)  | Convex sphere `radial-gradient(42% 32% at 36% 26%)` with cast shadow, animated via `@keyframes leverAOn/Off`               |
| Track (recess)   | `::after`                       | **7** (5 inset + 2 edge)  | Deep slot `inset 0→0.12→0.28→0.55→0.85em`, animated width change                                                           |
| SVG screws       | `<svg>` × 4                     | —                         | `radialGradient` + `feDropShadow` filter, Phillips cross via `<rect>` × 2, convex highlight `<ellipse>` + `<circle>`       |
| LED green (on)   | `label:first-of-type` (checked) | **8**                     | Convex glass sphere, glow: `0 0 0.55em rgba(0,255,30,0.82)` → `3.60em rgba(0,150,0,0.18)`                                  |
| LED red (off)    | `label` (unchecked)             | **8**                     | Same structure, red tones: `0 0 0.55em rgba(255,20,20,0.75)` → `3.60em rgba(150,0,0,0.14)`                                 |
| Silkscreen label | top `div`                       | 4-layer text-shadow       | `0 1px 0 rgba(255,255,255,0.18), 0 2px 1px rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.92), 0 -2px 2px rgba(0,0,0,0.75)` |

### Key technique — CSS-only state via checkbox

No JavaScript state management — `input[type=checkbox]:checked` toggles:

- Lever position (background-position shift + keyframe animation)
- LED active/inactive (class swap via CSS adjacency `+`)
- Track width animation (`@keyframes leverBOn/Off`)

### Key technique — SVG Phillips screw

```html
<svg viewBox="0 0 22 22">
  <radialGradient cx="30%" cy="26%" r="68%">...</radialGradient>
  <filter><feDropShadow dx="2.5" dy="3.5" stdDeviation="2.8" /></filter>
  <circle r="8" fill="#0b0b18" />
  <!-- shadow disc -->
  <circle r="7" fill="url(#gradient)" />
  <!-- convex face -->
  <rect ... fill="rgba(0,0,0,0.64)" />
  <!-- vertical slot -->
  <rect ... fill="rgba(0,0,0,0.64)" />
  <!-- horizontal slot -->
  <ellipse fill="rgba(255,255,255,0.30)" transform="rotate(-38)" />
  <!-- highlight -->
  <circle fill="rgba(255,255,255,0.54)" />
  <!-- hotspot -->
</svg>
```

---

## 12.7 Credit Score Gauge (`assets/credit-score-gauge.html`)

**Physical analog**: Brushed-metal instrument panel with recessed dial well, SVG arc gauge with lit/dim segments, animated needle with glowing tip, Phillips screws.

### Construction layers

| Layer               | Element            | Shadow layers              | Key technique                                                                                                                                                                       |
| ------------------- | ------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chassis (panel)     | `.chassis`         | **16** (10 inset + 6 drop) | 7-layer background: diagonal specular band `rgba(255,255,255,0.18) at 31%`, brushed-metal `repeating-linear-gradient(90deg)`, corner radials, gunmetal gradient `#545462 → #08080e` |
| Chassis lighting    | `.chassis::before` | —                          | 5 radial-gradient edge highlights, `mix-blend-mode: overlay`, `transform: rotate(55deg)` for anisotropic reflection                                                                 |
| Chassis edge        | `.chassis::after`  | —                          | Top-left bevel `rgba(255,255,255,0.10) 0→1.5px`, bottom-right shadow `rgba(0,0,0,0.30) at 93%`                                                                                      |
| Gauge well (recess) | `.gauge-well`      | **9** (7 inset + 2 outer)  | Deep inset progression `2→7→22px`, bilateral horizontal `±5px 14px`, ambient `0 0 110px`, outer catchlight `0 1px 0 rgba(255,255,255,0.08)`                                         |
| Arc segments (dim)  | SVG `<path>`       | —                          | 4 color-coded arcs (red/yellow/green), dim state `#280a0e`→`#0c1d07`, lit state via `filter: url(#sgF)` gaussian blur                                                               |
| Arc glow cone       | SVG `<path>`       | —                          | `mix-blend-mode: screen`, `feGaussianBlur stdDeviation="7"`, `feColorMatrix` amplified alpha `2.6` for hot focal zone                                                               |
| Needle              | SVG `<g>`          | —                          | Tapered `Q`-curve path, `transition: 0.72s cubic-bezier(0.34,1.48,0.64,1)` spring overshoot, tip glow via `feGaussianBlur stdDeviation="20"`                                        |
| Pivot cap           | SVG circles        | —                          | 5 concentric rings with decreasing radii (61→49→24→21→18.5→13.5), convex specular `radialGradient cx="34%" cy="28%"`                                                                |
| Screws (hardware)   | SVG `<Screw>`      | —                          | Same as 12.1: `radialGradient cx="30%" cy="26%"`, `feDropShadow`, Phillips cross via `<rect>` × 2                                                                                   |

### Key technique — Spring-overshoot needle transition

```css
transition: transform 0.72s cubic-bezier(0.34, 1.48, 0.64, 1);
/* 1.48 > 1.0 = overshoot past target then settle back */
```

### Key technique — Hot-zone glow via feColorMatrix alpha amplification

```xml
<filter id="tW">
    <feGaussianBlur stdDeviation="20" result="b"/>
    <feColorMatrix in="b" type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.6 0"/>
</filter>
<!-- Alpha multiplied by 2.6 = intense bloom without clipping RGB -->
```

---

## 12.8 Alert Panel (`assets/autochord-alert-panel.html`)

**Physical analog**: Rack-mounted warning panel with perforated backplate, domed alarm icon with convex glass, pulsing red LED, recessed status badges.

### Construction layers

| Layer              | Element             | Shadow layers                        | Key technique                                                                                                                                 |
| ------------------ | ------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Backplate (frame)  | `.backplate`        | **5** (2 drop + 2 ambient + 1 inset) | Neumorphic shell `linear-gradient(145deg, #2e3238, #1e2226)`, `6px 6px 22px` + `0 14px 40px` depth                                            |
| Panel (body)       | `.panel`            | **2** inset                          | Vertical gradient `#1a1d20 → #0d0f11`, `inset 0 1px 0 rgba(255,255,255,0.06)` top bevel                                                       |
| Perforated dots    | `.dots`             | —                                    | `radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)`, `background-size: 6px 6px`, `opacity: 0.4`                                           |
| Noise texture      | `.noise`            | —                                    | SVG `feTurbulence baseFrequency="0.9"` inline data URI, `mix-blend-mode: overlay`, `opacity: 0.35`                                            |
| Edge vignette      | `.edge-vignette`    | **12** inset                         | 4-directional + 4-diagonal inset shadows, `12px 0 18px -4px` horizontal, `8px 8px 14px -4px` corners                                          |
| Glass reflection   | `.glass-reflection` | —                                    | `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)`                                                   |
| Icon well (recess) | `.icon-well`        | **8** (4 inset + 4 drop)             | Deep pit `inset 0 6px 14px rgba(0,0,0,0.9)`, rim catchlight `0 1px 0 rgba(255,255,255,0.06)`                                                  |
| Icon dome (glass)  | `.icon-dome`        | **8** inset                          | Convex sphere `radial-gradient(circle at 50% 60%)`, `::before` 5-layer specular highlight, `::after` red glow with `animation: dome-pulse 3s` |
| Dome ring (bezel)  | `.dome-ring`        | **8** (4 inset + 4 drop)             | Metal rim: `inset 0 1px 0 rgba(255,255,255,0.1)` top + `inset 0 -1px 0 rgba(0,0,0,0.6)` bottom                                                |
| Status badges      | inline `<div>`      | **3** (2 inset + 1 outer)            | Neomorphic pits: `inset 2px 2px 5px #050607, inset -2px -2px 5px #181b20`, colored value text with `text-shadow: 0 0 6px`                     |
| LED (red)          | `.led-red`          | **5** (1 inset + 4 glow)             | Convex lens `radial-gradient(circle at 40% 35%)`, glow `0 0 22px rgba(255,26,26,0.1)`, `animation: led-pulse 1.5s`                            |
| Red projection     | `.red-projection`   | —                                    | Ambient color wash `radial-gradient(ellipse 80% 70%, rgba(255,26,26,0.04))`, `animation: proj-pulse 3s`                                       |

### Key technique — Domed alarm icon (convex glass sphere)

```css
.icon-dome {
  background: radial-gradient(circle at 50% 60%, #1a0808 0%, #0c0305 50%, #050102 100%);
  box-shadow:
    inset 0 0 25px rgba(0, 0, 0, 0.7),
    inset 0 4px 8px rgba(0, 0, 0, 0.6),
    inset 0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(255, 26, 26, 0.05),
    inset 0 -6px 14px rgba(255, 26, 26, 0.03),
    inset 4px 0 8px rgba(0, 0, 0, 0.4),
    inset -4px 0 8px rgba(0, 0, 0, 0.4),
    0 0 8px rgba(255, 26, 26, 0.06);
}
.icon-dome::before {
  /* specular highlight */
  background:
    radial-gradient(ellipse 30% 22% at 45% 22%, rgba(255, 255, 255, 0.18) 0%, transparent 100%), radial-gradient(ellipse 55% 40% at 48% 28%, rgba(255, 255, 255, 0.06) 0%, transparent 100%),
    radial-gradient(ellipse 25% 18% at 65% 72%, rgba(255, 255, 255, 0.035) 0%, transparent 100%), radial-gradient(ellipse 12% 50% at 12% 45%, rgba(255, 255, 255, 0.03) 0%, transparent 100%),
    radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.5) 100%);
}
```

---

## 12.9 Deep Screen Phosphor (`assets/deep-screen-phosphor.html`)

**Physical analog**: Recessed CRT display cut into thick metal chassis, red phosphor text with breathing animation, convex glass overlay.

### Construction layers

| Layer                 | Element                 | Shadow layers               | Key technique                                                                                                                                |
| --------------------- | ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Chassis hole (recess) | `.chassis-hole`         | **31** (25 inset + 6 outer) | Ultra-deep cavity: 5 vertical top `1→32px`, 3 left `6→20px`, 3 right `−6→−20px`, 5 vertical bottom `−4→−32px`, 4 diagonal `±10px ±10px 18px` |
| Chassis edge light    | `.chassis-hole::before` | 1 glow                      | Red bleed at top edge: `radial-gradient(ellipse 55% 100%, rgba(255,65,45,0.45))`, `width: 76%` centered                                      |
| Chassis depth layers  | `.chassis-hole::after`  | —                           | 5-gradient directional darkness: top/bottom `rgba(0,0,0,0.8)→transparent`, left/right side shadows, radial vignette                          |
| Screen glass          | `.screen-glass`         | **9** (8 inset + 1 outline) | Asymmetric red gradient `rgba(80,8,4,0.7) → #020101`, left-heavy inset stack `24→110px` simulating tube depth                                |
| Glass overlay         | `.screen-glass::after`  | **3** inset                 | 6-layer convex glass: elliptical top highlight, corner hotspot, diagonal band, bottom reflection, left edge, rim shadows                     |
| Phosphor glow         | `.phosphor-glow`        | —                           | `radial-gradient(ellipse 50% 60%, rgba(255,80,60,0.05))`, `animation: glow-breathe 4s` with brightness modulation                            |
| Phosphor text         | `.phosphor-title`       | 3-layer text-shadow         | `color: #ff6b5a`, glow `0 0 1px → 0 0 6px → 0 0 12px`, `animation: text-breathe 4s`, `letter-spacing: 6px`                                   |
| Phosphor line         | `.phosphor-line`        | 1 glow                      | Fading bar `linear-gradient(90deg, rgba(255,80,60,0.7) → transparent)`, `box-shadow: 0 0 6px`                                                |

### Key technique — 31-layer chassis hole (ultra-deep recess)

```css
.chassis-hole {
  box-shadow:
        /* top wall (5 layers) */
    inset 0 1px 0 #000,
    inset 0 2px 0 #000,
    inset 0 3px 1px #000,
    inset 0 4px 4px rgba(0, 0, 0, 1),
    inset 0 8px 10px rgba(0, 0, 0, 1),
    inset 0 14px 18px rgba(0, 0, 0, 0.95),
    inset 0 22px 30px rgba(0, 0, 0, 0.85),
    inset 0 32px 50px rgba(0, 0, 0, 0.6),
    /* side walls (6 layers) */ inset 1px 0 0 #000,
    inset 2px 0 0 #000,
    inset -1px 0 0 #000,
    inset -2px 0 0 #000,
    inset 6px 0 8px rgba(0, 0, 0, 1),
    inset 12px 0 16px rgba(0, 0, 0, 0.9),
    inset 20px 0 24px rgba(0, 0, 0, 0.6),
    inset -6px 0 8px rgba(0, 0, 0, 1),
    inset -12px 0 16px rgba(0, 0, 0, 0.9),
    inset -20px 0 24px rgba(0, 0, 0, 0.6),
    /* bottom wall (5 layers) */ inset 0 -4px 4px rgba(0, 0, 0, 1),
    inset 0 -8px 10px rgba(0, 0, 0, 1),
    inset 0 -14px 18px rgba(0, 0, 0, 0.95),
    inset 0 -22px 30px rgba(0, 0, 0, 0.85),
    inset 0 -32px 50px rgba(0, 0, 0, 0.6),
    /* diagonal corners (4 layers) */ inset 10px 10px 18px rgba(0, 0, 0, 0.9),
    inset -10px 10px 18px rgba(0, 0, 0, 0.9),
    inset 10px -10px 18px rgba(0, 0, 0, 0.9),
    inset -10px -10px 18px rgba(0, 0, 0, 0.9),
    /* outer rim (6 layers) */ 0 1px 0 rgba(255, 255, 255, 0.05),
    0 2px 0 rgba(255, 255, 255, 0.02),
    0 -1px 0 rgba(0, 0, 0, 0.9),
    0 -2px 4px rgba(0, 0, 0, 0.6),
    0 6px 24px rgba(0, 0, 0, 0.6),
    0 12px 48px rgba(0, 0, 0, 0.4);
}
```

---

## 12.10 Folding Header (`assets/folding-header.html`)

**Physical analog**: Recessed control panel with collapsible toggle button, glowing hamburger icon with corner LED bleed, neomorphic input well.

### Construction layers

| Layer                 | Element                     | Shadow layers               | Key technique                                                                                                                                                            |
| --------------------- | --------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Outer shell           | `.skeuo-outer`              | **3** (1 drop + 2 inset)    | `background: #1e1e21`, `0 20px 40px rgba(0,0,0,0.8)` floor shadow, `inset 0 2px 3px rgba(255,255,255,0.04)` top bevel                                                    |
| Inner well (recess)   | `.skeuo-inner-well`         | **2** inset                 | Deep pit: `inset 0 4px 8px rgba(0,0,0,0.9)`, `inset 0 1px 2px rgba(0,0,0,0.8)`                                                                                           |
| Corner LED bleed      | `.skeuo-inner-well::before` | —                           | **mask-composite border glow**: `radial-gradient(circle at 0 0, rgba(255,139,61,0.85) → transparent 15%)`, `-webkit-mask-composite: xor`, `filter: drop-shadow(0 0 3px)` |
| Corner LED halo       | `.skeuo-inner-well::after`  | —                           | Same pattern + `filter: blur(6px) drop-shadow(0 0 8px)`, `mix-blend-mode: screen` for soft halo                                                                          |
| Button face           | `.skeuo-button`             | **15** (13 inset + 2 outer) | 4-directional inset: top `8px 14px -3px`, sides `±6px 10px -4px`, 4-diagonal `5px 5px 8px -3px`, bottom catchlight `inset 0 -3px 6px rgba(255,255,255,0.035)`            |
| Glow icon (hamburger) | `.glow-icon`                | —                           | 3 horizontal bars, `filter: drop-shadow(0 0 8px rgba(255,139,61,0.8)) drop-shadow(0 0 2px rgba(255,139,61,1))`                                                           |
| Chevron               | `.chevron`                  | —                           | `filter: drop-shadow(0 0 5px rgba(255,255,255,0.4))`, `transition: transform 0.3s`, `.rotated { transform: rotate(180deg) }`                                             |
| Folding content       | `.folding-content`          | —                           | `max-height: 0 → 500px`, `transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)`                                                                                      |
| Input fields          | `.input-field`              | **1** inset                 | `inset 0 4px 6px rgba(0,0,0,0.6)`, focus: border-color change + `0 0 8px rgba(255,140,66,0.2)` glow                                                                      |

### Key technique — mask-composite corner LED bleed

```css
.skeuo-inner-well::before {
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
```

### Key technique — 15-layer neomorphic button face

```css
.skeuo-button {
  box-shadow:
    inset 0 8px 14px -3px rgba(0, 0, 0, 0.75),
    /* top deep */ inset 0 4px 6px -1px rgba(0, 0, 0, 0.6),
    /* top mid */ inset 0 2px 2px rgba(0, 0, 0, 0.5),
    /* top close */ inset 6px 0 10px -4px rgba(0, 0, 0, 0.55),
    /* left deep */ inset 3px 0 4px -1px rgba(0, 0, 0, 0.35),
    /* left close */ inset -6px 0 10px -4px rgba(0, 0, 0, 0.55),
    /* right deep */ inset -3px 0 4px -1px rgba(0, 0, 0, 0.35),
    /* right close */ inset 5px 5px 8px -3px rgba(0, 0, 0, 0.4),
    /* top-left diagonal */ inset -5px 5px 8px -3px rgba(0, 0, 0, 0.4),
    /* top-right diagonal */ inset 4px -3px 6px -3px rgba(0, 0, 0, 0.15),
    /* bottom-left diagonal */ inset -4px -3px 6px -3px rgba(0, 0, 0, 0.15),
    /* bottom-right diagonal */ inset 0 -3px 6px -2px rgba(255, 255, 255, 0.035),
    /* bottom glow */ inset 0 -1px 1px rgba(255, 255, 255, 0.05),
    /* bottom edge */ 0 -1px 0 rgba(255, 255, 255, 0.05),
    /* outer top bevel */ 0 1px 0 rgba(0, 0, 0, 0.25); /* outer bottom shadow */
}
```

---

## 12.11 Horizontal Thermometer (`assets/horizontal-thermometer.html`)

**Physical analog**: Horizontal glass thermometer with spherical bulb reservoir, recessed track tube, color-reactive liquid fill with animated bubbles, flathead screws.

### Construction layers

| Layer                    | Element              | Shadow layers               | Key technique                                                                                                                                                                                         |
| ------------------------ | -------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chassis (housing)        | `.chassis`           | **12** (7 inset + 5 drop)   | Asymmetric border-radius `50px 24px 24px 50px`, brushed-metal `repeating-linear-gradient(90deg)`, vertical gradient `#22222a → #1e1e26`                                                               |
| Chassis texture          | `.chassis::before`   | —                           | SVG `feTurbulence` noise overlay, `opacity: 0.025`, `mix-blend-mode: overlay`                                                                                                                         |
| Bulb well (recess)       | `.bulb-well`         | **13** (11 inset + 2 outer) | Circular deep pit, 4-directional `±3px 0 6px`, 4-diagonal `±4px ±4px 10px`, rim `0 0 0 1px #060608` + `2px rgba(255,255,255,0.04)`                                                                    |
| Bulb (glass sphere)      | `.bulb`              | **12** (5 inset + 7 glow)   | 6-layer radial background: specular `at 32% 22%`, hotspot `at 28% 18%`, bottom reflection, edge rim, convex body, vignette; 7-layer glow via CSS vars `var(--glow)` → `var(--glow-far)` up to `120px` |
| Bulb highlight           | `.bulb::after`       | —                           | Elliptical specular `rgba(255,255,255,0.35)`, `transform: rotate(-15deg)`, `filter: blur(0.5px)`                                                                                                      |
| Track well (tube recess) | `.track-well`        | **18** (16 inset + 2 outer) | Symmetric deep tube: top `1→12→20px`, bottom `−1→−12→−20px`, sides `±4→±10px`, 4-diagonal `±5px ±5px 10px`                                                                                            |
| Track vignette           | `.track-well::after` | —                           | 2-gradient overlay: vertical `rgba(0,0,0,0.7) → transparent → rgba(0,0,0,0.7)`, horizontal edge darkening                                                                                             |
| Liquid fill              | `.liquid`            | **12** (6 inset + 6 glow)   | 2-layer background: vertical glass highlight `rgba(255,255,255,0.35) → transparent`, horizontal color gradient `var(--color-dark) → var(--color-bright)`; meniscus via `::before` edge highlight      |
| Liquid meniscus          | `.liquid::before`    | 4 glow                      | Right-edge specular `rgba(255,255,255,0.55) → transparent`, cascading glow `2→8px`                                                                                                                    |
| Liquid surface           | `.liquid::after`     | —                           | Top highlight stripe `rgba(255,255,255,0.25)`, `filter: blur(0.5px)`                                                                                                                                  |
| Bubbles                  | `.bubble`            | 2 (1 inset + 1 outer)       | `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5))`, `@keyframes bubble-rise` with `--dx/--dy` CSS vars                                                                                       |
| Glass dome               | `.glass-dome`        | **4** (3 inset + 1 outer)   | 10-layer background: top arc, corner hotspot, secondary hotspot, 2 diagonal bands, bottom reflection, side edges, center diffuse, bottom vignette                                                     |
| Glass edge               | `.glass-edge`        | —                           | **mask-composite border**: `linear-gradient(180deg, rgba(255,255,255,0.2) → 0.06)`, `-webkit-mask-composite: xor`                                                                                     |
| Flathead screws          | `.screw`             | **4** (2 inset + 2 drop)    | `conic-gradient(from 35deg)` for knurl, `::before` slot via `rgba(0,0,0,0.9)`, `::after` slot highlight `rgba(255,255,255,0.08)`                                                                      |
| Ambient light            | `.ambient`           | —                           | `filter: blur(100px)`, `opacity: 0.12`, background color matches liquid hue, `transition: background 0.6s`                                                                                            |

### Key technique — CSS-variable color-reactive system

```javascript
const getColors = (t) => {
  let h, s, l;
  if (t < 35) {
    h = 0 + t * 0.3;
    s = 80;
    l = 42 + t * 0.15;
  } // red zone
  else if (t < 65) {
    const p = (t - 35) / 30;
    h = 10.5 + p * 25;
    s = 78;
    l = 47 + p * 5;
  } // orange→yellow
  else {
    const p = (t - 65) / 35;
    h = 35.5 + p * 90;
    s = 70 + p * 10;
    l = 42 + p * 5;
  } // green→cyan
  return {
    main: `hsl(${h}, ${s}%, ${l}%)`,
    glow: `hsla(${h}, ${s + 15}%, ${l + 20}%, 0.7)`,
    glowSoft: `hsla(${h}, ${s + 10}%, ${l + 15}%, 0.35)`,
    glowFar: `hsla(${h}, ${s}%, ${l + 10}%, 0.15)`
    /* ... bright, dark, rimInner, metalLight */
  };
};
/* Applied via CSS custom properties: --color-main, --glow, --glow-soft, --glow-far */
```

### Key technique — 10-layer glass dome overlay

```css
.glass-dome {
  background:
    radial-gradient(ellipse 150% 80% at 50% -25%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 50%),
    radial-gradient(ellipse 20% 40% at 12% 5%, rgba(255, 255, 255, 0.18) 0%, transparent 70%), radial-gradient(ellipse 12% 25% at 70% 8%, rgba(255, 255, 255, 0.06) 0%, transparent 70%),
    linear-gradient(
      118deg,
      transparent 8%,
      rgba(255, 255, 255, 0.012) 14%,
      rgba(255, 255, 255, 0.04) 18%,
      rgba(255, 255, 255, 0.08) 22%,
      rgba(255, 255, 255, 0.04) 26%,
      rgba(255, 255, 255, 0.012) 30%,
      transparent 36%
    ),
    linear-gradient(112deg, transparent 33%, rgba(255, 255, 255, 0.008) 38%, rgba(255, 255, 255, 0.022) 42%, rgba(255, 255, 255, 0.008) 46%, transparent 51%),
    radial-gradient(ellipse 80% 25% at 50% 110%, rgba(255, 255, 255, 0.035) 0%, transparent 70%), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 1.5%),
    linear-gradient(270deg, rgba(255, 255, 255, 0.018) 0%, transparent 1.5%), radial-gradient(ellipse 90% 70% at 50% 42%, rgba(255, 255, 255, 0.01) 0%, transparent 65%),
    linear-gradient(180deg, transparent 15%, rgba(0, 0, 0, 0.04) 70%, rgba(0, 0, 0, 0.1) 100%);
}
```

---

## Quick Lookup — Component → Asset

| Need                  | Asset file                          | Key patterns                                         |
| --------------------- | ----------------------------------- | ---------------------------------------------------- |
| Push button with LED  | `power-button.html`                 | 17-layer button, glow slot, Phillips screws          |
| Dashboard / analytics | `synthscore-analytics.html`         | Gradient bar, metallic border, tech brackets         |
| VU meter / gauge      | `tube-compressor-vu.html`           | 16-layer well, 5-layer glass, animated needle        |
| Toggle switch         | `skeuomorphic-switch.html`          | Recessed track, grip handle, LED indicators          |
| LCD numeric display   | `lcd-db-display.html`               | Olive screen, scanlines, dark-on-olive text          |
| Rotary lever / knob   | `industrial-lever.html`             | 11-layer knob, SVG screws, CSS-only checkbox         |
| Deep CRT display      | `codepen-deep-screen.html`          | 31-layer ultra shadow stack                          |
| Button variants (15+) | `agile-tech-skeuomorphic-site.html` | Multiple button tiers, full page layout              |
| Score gauge / radial  | `credit-score-gauge.html`           | SVG arc, 16-layer chassis, brushed metal, segments   |
| Alert / warning panel | `autochord-alert-panel.html`        | Dome icon, red glow, status badges, perforated plate |
| CRT danger screen     | `deep-screen-phosphor.html`         | Red phosphor, chassis hole, breathing animation      |
| Folding / accordion   | `folding-header.html`               | Collapsible header, glowing icon, neomorphic well    |
| Horizontal bar meter  | `horizontal-thermometer.html`       | Glass bulb, recessed tube, color-reactive fill       |
