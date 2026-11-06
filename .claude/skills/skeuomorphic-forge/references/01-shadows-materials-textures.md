# Shadows, Materials, Lighting, Glow & Textures

Production-proven CSS/Tailwind patterns. All patterns assume **top-left light source (135deg)** unless noted.

---

## 1. Shadows

### Raised surface (dark theme)

```css
box-shadow:
  0 2px 4px rgba(0, 0, 0, 0.3),
  0 8px 16px rgba(0, 0, 0, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

### Recessed / inset (dark theme)

```css
box-shadow:
  inset 0 2px 6px rgba(0, 0, 0, 0.5),
  inset 0 1px 2px rgba(0, 0, 0, 0.3),
  0 1px 0 rgba(255, 255, 255, 0.05);
```

### Raised surface (light theme)

```css
box-shadow:
  0 4px 8px rgba(0, 0, 0, 0.15),
  0 1px 3px rgba(0, 0, 0, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
```

### Pressed / inset (light theme)

```css
box-shadow:
  inset 0 2px 4px rgba(0, 0, 0, 0.15),
  inset 0 1px 2px rgba(0, 0, 0, 0.1),
  0 1px 0 rgba(255, 255, 255, 0.6);
```

### Deep well (display recess)

```css
box-shadow:
  inset 0 3px 8px rgba(0, 0, 0, 0.6),
  inset 0 1px 2px rgba(0, 0, 0, 0.4),
  0 1px 0 rgba(255, 255, 255, 0.03);
```

---

## 2. Materials

### Brushed metal (dark)

```css
background: linear-gradient(135deg, #2a2a2e 0%, #1a1a1d 50%, #2a2a2e 100%);
```

Pair with noise texture overlay (Section 5) for realism.

### Gunmetal

```css
background: linear-gradient(145deg, #3a3a40 0%, #25252a 100%);
```

### Cast iron

```css
background: linear-gradient(135deg, #2d2d30 0%, #1f1f22 50%, #28282b 100%);
```

Add subtle matte noise at 3-5% opacity.

### Brushed aluminum (light)

```css
background: linear-gradient(135deg, #d8d8dc 0%, #c0c0c4 50%, #d4d4d8 100%);
```

### Chrome / polished metal

```css
background: linear-gradient(135deg, #e8e8ec 0%, #a0a0a8 30%, #d0d0d4 50%, #909098 70%, #c8c8cc 100%);
```

Chrome requires multiple stops to simulate mirror-like reflection.

### Leather (warm brown)

```css
background: linear-gradient(160deg, #6b4226 0%, #4a2d18 100%);
```

Pair with SVG feTurbulence grain texture overlay at 8-12% opacity.

### Stitched leather

```css
border: 2px dashed rgba(200, 170, 130, 0.5);
border-radius: 12px;
padding: 16px;
background: linear-gradient(160deg, #5a3820 0%, #3d2412 100%);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.08),
  0 4px 12px rgba(0, 0, 0, 0.3);
```

### Wood grain

```css
background: repeating-linear-gradient(95deg, rgba(139, 90, 43, 0.15) 0px, transparent 3px, transparent 8px), linear-gradient(180deg, #8b5a2b 0%, #6b3a1b 100%);
```

### Paper / parchment

```css
background: linear-gradient(180deg, #f5f0e8 0%, #e8e0d0 100%);
```

Pair with noise texture at 4-6% for paper grain.

### Fabric / linen

```css
background:
  repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.03) 0px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.03) 0px, transparent 1px, transparent 3px), #e8e4de;
```

### Concrete / stone

```css
background: linear-gradient(150deg, #8a8a8a 0%, #6e6e6e 50%, #7a7a7a 100%);
```

Add noise at 8-10% for rough texture.

### Rubber / soft-touch

```css
background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
```

### Plastic (glossy)

```css
background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 30%, #f0f0f0 50%, #d8d8d8 100%);
box-shadow:
  0 2px 8px rgba(0, 0, 0, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.9);
```

### Plastic (matte)

```css
background: linear-gradient(135deg, #d0d0d0 0%, #b8b8b8 100%);
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
```

### Glass (dark, tinted)

```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.05) 100%);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### Glass (light, frosted)

```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.4);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

---

## 3. Lighting

### Specular highlight (dark theme)

```css
background: radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 60%);
pointer-events: none;
```

### Rim light (dark theme)

```css
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.08),
  inset 1px 0 0 rgba(255, 255, 255, 0.04);
```

### Specular highlight (light theme)

```css
background: radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%);
pointer-events: none;
```

### Beveled border (light theme)

```css
border-top: 1px solid rgba(255, 255, 255, 0.8);
border-left: 1px solid rgba(255, 255, 255, 0.6);
border-bottom: 1px solid rgba(0, 0, 0, 0.15);
border-right: 1px solid rgba(0, 0, 0, 0.1);
```

### Ambient daylight

Top-down soft light for outdoor/daylight scenes.

```css
background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 40%);
```

### Under-glow (for knobs/dials)

```css
box-shadow: 0 4px 12px rgba(var(--glow-color), 0.3);
```

Simulates light bouncing off the surface below.

### Edge catch (cylindrical objects)

```css
background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 2%, transparent 4%, transparent 96%, rgba(255, 255, 255, 0.08) 98%, transparent 100%);
```

### Backlit panel glow

```css
box-shadow:
  0 0 20px rgba(var(--glow-color), 0.15),
  0 0 40px rgba(var(--glow-color), 0.05);
```

---

## 4. Glow Effects

### Amber indicator

```css
background: radial-gradient(circle, #ffb400 0%, #ff8c00 60%, transparent 100%);
box-shadow:
  0 0 8px #ffb400,
  0 0 16px rgba(255, 180, 0, 0.4),
  0 0 32px rgba(255, 140, 0, 0.15);
```

### Green indicator

```css
background: radial-gradient(circle, #00ff41 0%, #00cc33 60%, transparent 100%);
box-shadow:
  0 0 8px #00ff41,
  0 0 16px rgba(0, 255, 65, 0.4),
  0 0 32px rgba(0, 204, 51, 0.15);
```

### Red warning

```css
background: radial-gradient(circle, #ff3333 0%, #cc0000 60%, transparent 100%);
box-shadow:
  0 0 8px #ff3333,
  0 0 16px rgba(255, 51, 51, 0.4),
  0 0 32px rgba(204, 0, 0, 0.15);
```

### Blue power

```css
background: radial-gradient(circle, #4488ff 0%, #2266dd 60%, transparent 100%);
box-shadow:
  0 0 8px #4488ff,
  0 0 16px rgba(68, 136, 255, 0.4),
  0 0 32px rgba(34, 102, 221, 0.15);
```

### CRT phosphor (green)

```css
color: #00ff41;
text-shadow:
  0 0 4px rgba(0, 255, 65, 0.8),
  0 0 8px rgba(0, 255, 65, 0.4),
  0 0 16px rgba(0, 255, 65, 0.2);
```

### Neon tube

```css
box-shadow:
  0 0 4px currentColor,
  0 0 8px currentColor,
  0 0 16px rgba(var(--neon-rgb), 0.5),
  0 0 32px rgba(var(--neon-rgb), 0.3),
  inset 0 0 4px rgba(var(--neon-rgb), 0.2);
```

---

## 5. Textures

### Noise overlay (SVG inline)

```css
.noise::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.04;
  mix-blend-mode: overlay;
}
```

### Scanlines

```css
.scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0, 0, 0, 0.15) 1px, rgba(0, 0, 0, 0.15) 2px);
}
```

### Grid dots (perforated panel)

```css
background-image: radial-gradient(circle, rgba(0, 0, 0, 0.3) 1px, transparent 1px);
background-size: 6px 6px;
```

### Carbon fiber

```css
background:
  linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.1) 75%),
  linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.1) 75%);
background-size: 4px 4px;
background-color: #1a1a1a;
```

### Diamond plate (industrial)

```css
background:
  linear-gradient(30deg, rgba(255, 255, 255, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.05) 87.5%),
  linear-gradient(150deg, rgba(255, 255, 255, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.05) 87.5%),
  linear-gradient(60deg, rgba(0, 0, 0, 0.1) 25%, transparent 25.5%, transparent 75%, rgba(0, 0, 0, 0.1) 75%);
background-size: 20px 35px;
background-color: #2a2a2e;
```

### Dot matrix (LED panel)

```css
background-image: radial-gradient(circle, currentColor 1.5px, transparent 1.5px);
background-size: 5px 7px;
```
