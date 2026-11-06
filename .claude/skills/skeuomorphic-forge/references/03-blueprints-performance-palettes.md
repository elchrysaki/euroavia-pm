# Component Blueprints, Performance, Accessibility, Responsive & Palettes

## 9. Component Blueprints

### Button (industrial)

Base: brushed metal + raised shadow + specular. Active: pressed + reduce specular.

### Toggle switch

Track: deep well. Thumb: chrome + specular + spring animation.

### Gauge / meter

Bezel: bezel ring. Face: paper or matte plastic. Needle: thin element + sweep. Markings: radial positioned text/ticks.

### LED indicator

Dome: radial-gradient (center bright, edge dark). Glow: multi-distance. Bezel: rivet-sized bezel ring.

### CRT display (full 7-layer assembly)

```
Layer 1: Monitor chassis — cast iron/plastic + raised
Layer 2: Screen bezel — thick border with beveled border
Layer 3: Glass surface — dark glass with curvature gradient
Layer 4: Phosphor layer — dark bg + CRT phosphor glow
Layer 5: Scanlines — at 50% opacity
Layer 6: Screen reflection — radial-gradient top-left
Layer 7: Dust/imperfection — noise at 1-2%
```

### Knob / dial

Base: bezel ring. Body: brushed metal + specular. Indicator: thin line or dot.

### Slider / range

Track: deep well horizontal. Thumb: chrome/rubber + specular. Fill: colored gradient.

### Progress bar

Container: deep well. Fill: gradient with glow on leading edge.

### Radio button

Outer: bezel ring small. Inner (selected): LED glow small.

### Checkbox

Box: recessed small. Check mark: colored with glow.

### Dropdown / select

Trigger: Button blueprint. Dropdown: paper/plastic + raised.

### Tab bar

Container: brushed metal strip. Active: raised. Inactive: recessed.

### Badge / notification

Circle: red warning + pulse. Text: white bold centered.

### Tooltip

Body: dark glass + raised. Arrow: CSS triangle with shadow.

---

## 10. Performance Rules

1. **Never animate `filter`** — use `opacity` and `transform`
2. **`will-change: transform`** on moving elements
3. **`will-change: box-shadow`** only if shadow changes on interaction
4. **`pointer-events: none`** on ALL overlay layers
5. **Prefer `box-shadow` over `filter: drop-shadow`**
6. **Limit blur radius** — `blur(16px)` max for `backdrop-filter`
7. **SVG noise > CSS paint** — more portable
8. **Reduce shadow layers on mobile** — halve for elements < 48px
9. **`transform: translateZ(0)`** for GPU layer on complex stacks
10. **Test with 6x CPU throttle** — simplify if janky

---

## 11. Accessibility

- **Contrast ratio** (WCAG 2.1): 4.5:1 text, 3:1 large text/UI
- **Focus indicators**: 2px outline + 2px offset. NEVER remove `:focus-visible`
- **Touch targets**: minimum 44×44px
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` — transitions to 0.01s
- **Color not sole indicator**: LED states need shape/label backup
- **Screen reader**: `aria-label` for decorative controls, `role="slider"` for knobs

---

## 12. Responsive Scaling

- **Shadow scaling**: ÷1.5-2x on screens < 768px
- **Hardware details**: hide screws/rivets on mobile
- **Reduce layers**: 5 → 3 shadow layers on mobile
- **Touch adaptation**: 48px minimum targets on touch
- **Font scaling**: `clamp(14px, 2vw, 18px)` for labels

---

## 13. Color Palettes

### Industrial Dark

```css
--bg-darkest: #050505;
--bg-dark: #0a0a0e;
--bg-mid: #1a1a1e;
--surface: #2a2a2e;
--surface-light: #3a3a40;
--text-primary: rgba(255, 255, 255, 0.85);
--text-secondary: rgba(255, 255, 255, 0.5);
```

### Military / OD

```css
--bg-darkest: #1a1c14;
--bg-dark: #252820;
--surface: #3a3d32;
--surface-light: #4a4d40;
--accent: #8b8b00;
--text: #c8c8a0;
```

### Midnight Blue

```css
--bg-darkest: #0a0c14;
--bg-dark: #10142a;
--surface: #1a2040;
--surface-light: #2a3050;
--accent: #4488ff;
--text: rgba(200, 220, 255, 0.9);
```

### Classic Light (iOS 6 era)

```css
--bg: #e8e8e8;
--surface: #f4f4f4;
--surface-dark: #c8c8c8;
--border: #b0b0b0;
--text: #333333;
--accent: #007aff;
```

### Warm Light (leather / wood)

```css
--bg: #f0e8d8;
--surface: #e8dcc8;
--border: #c8b898;
--text: #4a3520;
--accent: #8b5a2b;
```

### Neumorphic Base

```css
--bg: #e0e0e0;
--shadow-dark: #bebebe;
--shadow-light: #ffffff;
--text: #666666;
--accent: #6c5ce7;
```
