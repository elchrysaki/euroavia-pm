# Light Physics, Composition, Interaction & Typography (Sections 15-18)

## 15. Light Physics

Physical light behavior translated to CSS. Every skeuomorphic component must respect these rules for the chosen light source direction (default: top-left, 135deg).

### 15.1 Sphere lighting

A sphere has one bright specular point offset toward the light source, gradual falloff, and a core shadow on the opposite side. The specular is NOT centered — it's offset 30-35% from top-left.

```css
.sphere {
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #666 0%, #333 45%, #1a1a1a 100%);
}
```

### 15.2 Cylinder lighting

Cylinders have a vertical specular band (not a point). The band follows the curve facing the light.

```css
.cylinder {
  background: linear-gradient(90deg, #1a1a1a 0%, #444 25%, #666 35%, #444 50%, #1a1a1a 100%);
}
```

### 15.3 Flat surface with bevel

Flat surfaces show uniform color with edge highlights/shadows along the bevel.

```css
.flat-beveled {
  background: #2a2a2e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}
```

### 15.4 Shadow direction consistency

ALL shadows in a composition must share the same light direction:

- Light from top-left (135deg): shadows fall bottom-right
- `box-shadow` offset: positive X, positive Y
- `text-shadow` offset: positive X, positive Y
- Gradients: lighter at top-left, darker at bottom-right
- Specular highlights: positioned top-left on curved surfaces
  **NEVER mix shadow directions** — this destroys all illusion of physicality.

### 15.5 Material reflectance models

Different materials reflect light differently:
| Material | Specular | Diffuse | Model |
|----------|----------|---------|-------|
| Chrome | Sharp, high contrast | Almost none | Mirror-like reflection, multiple gradient stops |
| Brushed metal | Elongated/directional | Low | Anisotropic highlight, conic gradient |
| Matte plastic | Soft, wide | High | Broad radial gradient, low opacity |
| Glass | Sharp + broad | Low | Two specular layers (sharp point + soft halo) |
| Rubber | Almost none | Very high | Nearly flat, minimal gradient |
| Leather | Soft, irregular | High | Subtle gradient + texture overlay |
| Wood | Moderate, directional | High | Follows grain direction |

### 15.6 Ambient occlusion

Where two surfaces meet, light is occluded. This manifests as darker shadows in crevices.

```css
/* Between panel and sub-panel */
.sub-panel {
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3); /* AO around edges */
}
/* In recessed wells */
.well {
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5); /* AO at top of recess */
}
```

### 15.7 Color temperature and distance

Objects further from the light source receive cooler (bluer) light. Close objects: warm highlights. Far objects: neutral/cool shadows. This applies to large compositions with multiple depth levels.

---

## 16. Composition & Assembly Rules

### 16.1 Assembly order (back to front)

Build complex panels in this order:

1. **Backplate** — main chassis material
2. **Sub-panels** — recessed or raised grouping areas
3. **Wells** — deep inset areas for displays and meters
4. **Hardware** — screws, rivets, brackets, hinges
5. **Instruments** — knobs, sliders, switches, LEDs
6. **Displays** — CRT, VFD, 7-segment, meters
7. **Labels** — silkscreened or engraved text
8. **Overlays** — noise texture, scanlines, specular reflections

### 16.2 Z-index management

```css
/* Suggested z-index scale for panel assembly */
--z-backplate: 0;
--z-subpanel: 1;
--z-well: 2;
--z-hardware: 3;
--z-instrument: 4;
--z-display: 5;
--z-label: 6;
--z-overlay: 10;
```

### 16.3 Grouping logic

Controls that work together should share a visual group:

- Recessed sub-panel with shared border
- Common label above the group
- Consistent spacing within group, larger spacing between groups

### 16.4 Visual hierarchy through depth

```
Deepest (back) ──────────────────────── Nearest (front)
  Wells → Sub-panels → Backplate → Raised knobs → Labels → Overlays
```

Each depth level should have progressively:

- Lighter specular (closer to viewer = more light)
- Sharper shadows (closer to surface = tighter shadow)
- More detail (closer = finer textures visible)

### 16.5 Panel sizing guidelines

| Panel Type     | Min Width | Min Height | Padding | Corner Radius |
| -------------- | --------- | ---------- | ------- | ------------- |
| Full faceplate | 400px     | 200px      | 24px    | 8-12px        |
| Sub-panel      | 120px     | 80px       | 12px    | 4-6px         |
| Display well   | 80px      | 40px       | 4-8px   | 2-4px         |
| Control group  | 100px     | 60px       | 8px     | 4px           |

---

## 17. Interaction Patterns

### 17.1 Button states (full matrix)

```
Rest → Hover → Focus → Active → Disabled
```

| State    | Visual                   | Shadow               | Transform         |
| -------- | ------------------------ | -------------------- | ----------------- |
| Rest     | Base gradient            | Cast shadow          | none              |
| Hover    | Lighter gradient         | Larger shadow        | translateY(-1px)  |
| Focus    | Focus ring (2px outline) | Same as hover        | none              |
| Active   | Darker gradient          | Minimal/inset shadow | translateY(1-2px) |
| Disabled | Desaturated, low opacity | Minimal              | none              |

### 17.2 Toggle states

```
Off (recessed) ↔ On (raised + indicator glow)
```

The toggle track changes from inset to raised. The thumb moves with spring animation. Indicator LED activates (Section 4 glow) in On state.

### 17.3 Knob interaction

- **Click+drag vertical**: standard (up = increase)
- **Sensitivity**: 1° per 2px mouse movement
- **Visual feedback**: rotation + value tooltip
- **Limits**: defined by arc endpoints (typically 270° range from 7 o'clock to 5 o'clock)
- **Reset**: double-click returns to default

### 17.4 Slider interaction

- **Click+drag horizontal/vertical**
- **Track fill changes color** to indicate value
- **Thumb shadow reduces** when pressed (closer to track surface)
- **Snap points** (optional): subtle detent at key values

### 17.5 Focus management (accessibility)

```css
.component:focus-visible {
  outline: 2px solid #4488ff;
  outline-offset: 2px;
  /* Don't use box-shadow for focus — it conflicts with decorative shadows */
}
@media (prefers-reduced-motion: reduce) {
  .component {
    transition-duration: 0.01s !important;
  }
}
```

### 17.6 Haptic feedback (micro-interactions)

For extra realism, add micro-animations on state changes:

```css
/* Click feedback — brief scale pulse */
@keyframes click-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.97);
  }
  100% {
    transform: scale(1);
  }
}
/* Use sparingly — only on buttons and switches */
```

---

## 18. Typography on Physical Surfaces

### 18.1 Silkscreened text (most common)

Printed directly onto metal/plastic surface. Sharp, clean, no depth.

```css
.silkscreen {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}
```

### 18.2 Engraved text

Cut into the surface. Shows shadow at top edge, highlight at bottom.

```css
.engraved {
  color: transparent;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  -webkit-background-clip: text;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### 18.3 Embossed text

Raised from the surface. Shows highlight at top edge, shadow at bottom.

```css
.embossed-text {
  color: rgba(255, 255, 255, 0.05);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.15),
    0 -1px 0 rgba(0, 0, 0, 0.3);
}
```

### 18.4 Stamped / debossed text

Pressed into soft material (leather, rubber). Similar to engraved but softer shadows.

```css
.stamped {
  color: rgba(0, 0, 0, 0.2);
  text-shadow:
    0 -1px 0 rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.08);
  letter-spacing: 0.05em;
}
```

### 18.5 Backlit text

Illuminated from behind. Text appears to glow through a cutout in the surface.

```css
.backlit {
  color: var(--glow-color, #00ff41);
  text-shadow:
    0 0 4px currentColor,
    0 0 8px rgba(var(--glow-rgb), 0.5),
    0 0 16px rgba(var(--glow-rgb), 0.2);
}
```

### 18.6 Text application rules

| Surface         | Method                   | Font Weight |
| --------------- | ------------------------ | ----------- |
| Brushed metal   | Silkscreened             | 500-600     |
| Cast iron       | Engraved                 | 700         |
| Plastic (matte) | Silkscreened or embossed | 500         |
| Rubber          | Stamped                  | 600         |
| Leather         | Stamped (gold foil)      | 500         |
| Glass/display   | Backlit                  | 400         |
| Wood            | Engraved or burned       | 600         |

---
