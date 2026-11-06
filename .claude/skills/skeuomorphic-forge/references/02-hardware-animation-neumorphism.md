# Hardware Details, Animations & Neumorphism

## 6. Hardware Details

### Screw head

```css
.screw {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #555 0%, #2a2a2a 100%);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.05);
}
.screw::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 20%;
  right: 20%;
  height: 1px;
  background: #111;
  transform: rotate(var(--screw-angle, 30deg));
}
```

### Ventilation slat

```css
.vent-slat {
  height: 3px;
  border-radius: 1px;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03),
    inset 0 1px 2px rgba(0, 0, 0, 0.8);
}
```

### Bezel ring

```css
.bezel {
  border-radius: 50%;
  background: linear-gradient(135deg, #444 0%, #222 50%, #333 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.4);
  padding: 3px;
}
```

### Rivet / stud

```css
.rivet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #666 0%, #333 80%);
  box-shadow:
    inset 0 -1px 1px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### Hinge (cylindrical)

```css
.hinge {
  width: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #444 0%, #666 30%, #555 50%, #333 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.3);
}
```

### Hardware Placement Rules (MANDATORY)

| Panel Shape          | Screw Count | Placement                               |
| -------------------- | ----------- | --------------------------------------- |
| Rectangle / square   | 4           | One per corner, inset 8-16px from edges |
| Narrow strip         | 2           | Centered vertically at each end         |
| Triangle             | 3           | One per vertex                          |
| Circle / dial bezel  | 0 or 4+     | Bezel ring suffices, or evenly spaced   |
| Large panel (>300px) | 4-6         | Corners + midpoints of long edges       |

**Rules:**

- **NEVER place a single screw on a panel** — one fastener cannot prevent rotation
- Symmetry is mandatory: if top-left has a screw, top-right must also
- Scale with panel size: small (<100px) = 2, medium (100-300px) = 4, large (>300px) = 4-6
- Vary `--screw-angle` per screw for realism

---

## 7. Animations

### Button press (mechanical)

```css
transition:
  transform 0.08s ease-out,
  box-shadow 0.08s ease-out;
transform: translateY(2px); /* :active */
```

### Toggle switch (spring)

```css
transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### LED on/off

```css
transition:
  box-shadow 0.15s ease-in-out,
  background-color 0.15s ease-in-out;
```

### Needle sweep (gauge)

```css
transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
transform-origin: bottom center;
```

### Knob rotation

```css
transition: transform 0.15s ease-out;
```

### Flip (mechanical indicator)

```css
transition: transform 0.3s ease-in-out;
transform-style: preserve-3d;
```

### Toggle spring (soft bounce)

```css
@keyframes toggle-bounce {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.92);
  }
  70% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
  }
}
```

### Rubber-band snap

```css
@keyframes snap {
  0% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(2px);
  }
  80% {
    transform: translateX(-1px);
  }
  100% {
    transform: translateX(0);
  }
}
```

---

## 8. Neumorphism (Soft UI)

### Base rules

- Background must be mid-tone (#e0e0e0 or tinted equivalent)
- Two shadows: dark (bottom-right) + light (top-left)
- NO border — depth comes entirely from shadows
- Keep color minimal; shape and shadow do the work

### Shadow calculation

```
Light shadow: -X -Y blur rgba(255,255,255, 0.7)
Dark shadow:   X  Y blur rgba(0,0,0, 0.15)
Where X/Y = 4-8px, blur = 2×offset
```

### Raised (extruded)

```css
background: #e0e0e0;
border-radius: 16px;
box-shadow:
  8px 8px 16px #bebebe,
  -8px -8px 16px #ffffff;
```

### Pressed (inset)

```css
background: #e0e0e0;
border-radius: 16px;
box-shadow:
  inset 6px 6px 12px #bebebe,
  inset -6px -6px 12px #ffffff;
```

### When NOT to use neumorphism

- On white (#fff) or black (#000) backgrounds
- For text-heavy UI — low contrast
- Small elements (<24px) — shadows blur into noise
- High-contrast requirements
