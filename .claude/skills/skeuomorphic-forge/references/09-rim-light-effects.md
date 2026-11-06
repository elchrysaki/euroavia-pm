# Section 25 — Rim Light Effects

Edge-concentrated light effects for dark UI components. Simulates a backlight or ambient light source bleeding around the edges of opaque objects — commonly seen on dark cards, panels, and containers in modern dark-mode interfaces.

---

## 25.0 — Why Rim Light Fails (Common Mistakes)

> Claude ALWAYS gets rim light wrong. This section exists to prevent the 7 most common errors.

| What Claude does                                    | Why it looks wrong                                                                            | What to do instead                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `border: 1px solid rgba(255,255,255,0.15)`          | Uniform border = picture frame, not light. Real rim light varies in intensity along each edge | Use `::before` / `::after` with `radial-gradient` at edge centers for concentrated falloff     |
| Single `box-shadow: 0 0 20px rgba(255,255,255,0.1)` | Uniform glow all around = neon sign, not rim light. Real light has a SOURCE and fades         | 4-layer box-shadow: top strongest, sides weaker, bottom weakest (see §25.2)                    |
| `opacity: 0.3+` on highlights                       | Too bright = glowing radioactive element. Rim light is SUBTLE                                 | Max opacity 0.2 for rim elements. Usually 0.05-0.15                                            |
| Same intensity on all 4 edges                       | No light source direction — physically impossible                                             | Top edge 3-4x brighter than bottom. Left/right intermediate                                    |
| Rim light WITHOUT underlying depth/shadow           | Element looks like a flat glowing rectangle, not a 3D object                                  | Build the shadow stack FIRST (5+ layers), THEN add rim light ON TOP                            |
| `box-shadow: 0 0 Xpx` only (no pseudo-elements)     | Blur is too uniform — can't create concentrated hotspots at edge centers                      | Combine box-shadow (overall glow) + `::before`/`::after` radial-gradients (concentrated spots) |
| White `rgba(255,255,255,...)` everywhere            | Cold, sterile, blafard look — no warmth                                                       | Use `rgba(255,240,220,...)` for warm scenes, tint to match page accent                         |

### Before / After — The 3-Step Fix

**WRONG (what Claude defaults to):**

```css
.card {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1); /* flat border */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.08); /* uniform glow */
}
```

**CORRECT (physically-based rim light):**

```css
.card {
  background: linear-gradient(145deg, #1e1e1e, #141414);
  border: none;
  position: relative;
  box-shadow:
    /* 1. DEPTH FIRST — the card must sit in space */
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    0 16px 32px rgba(0, 0, 0, 0.15),
    /* 2. DIRECTIONAL rim — top strongest, bottom weakest */ 0 -1px 3px rgba(255, 240, 220, 0.08),
    /* top rim (strongest) */ 1px 0 2px rgba(255, 240, 220, 0.04),
    /* right rim (weaker) */ -1px 0 2px rgba(255, 240, 220, 0.04),
    /* left rim (weaker) */ 0 1px 2px rgba(255, 240, 220, 0.02); /* bottom rim (weakest) */
}

/* 3. CONCENTRATED HOTSPOT — light peaks at top-center */
.card::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 10%;
  right: 10%;
  height: 1px;
  background: radial-gradient(ellipse at center, rgba(255, 240, 220, 0.25) 0%, transparent 70%);
  pointer-events: none;
}
```

### Mandatory Rim Light Checklist

Before delivering ANY rim light implementation:

- [ ] Shadow stack built FIRST (5+ layers of depth shadows)
- [ ] Top edge is 2-4x brighter than bottom edge
- [ ] At least ONE pseudo-element with `radial-gradient` for concentrated hotspot
- [ ] No highlight opacity exceeds 0.25 (the hottest spot may use exactly 0.25, never more)
- [ ] Highlight colors are WARM (`rgba(255,240,220,...)`) not pure white (unless cold theme)
- [ ] `pointer-events: none` on all pseudo-element overlays

---

## 25.1 Rim Light Physics

Rim light (also called edge light or backlight) occurs when a light source behind or above an object illuminates its contour. In CSS, this creates the illusion that the component exists in a dark environment with subtle ambient lighting.

**Physical properties to simulate:**

| Property               | Physical behavior                                                | CSS technique                                                                        |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Top edge glow**      | Light catches the top rim                                        | `box-shadow` outer (positive Y, white, low opacity) + `::before` radial gradient     |
| **Bottom edge glow**   | Reflected/ambient light on bottom                                | `box-shadow` outer (negative Y, white, very low opacity) + `::after` radial gradient |
| **Edge concentration** | Light is brightest at center of each edge, fading toward corners | `radial-gradient` positioned at edge center                                          |
| **Falloff**            | Light intensity decreases with distance from edge                | Multiple shadow layers with increasing blur and decreasing opacity                   |

**Critical rule:** Rim light is ALWAYS subtler than direct light. Maximum opacity for rim highlight elements: 0.2 (20%). Going higher creates an unrealistic "glowing border" effect rather than ambient rim light.

---

## 25.2 Dark Card with Rim Light — Box-Shadow + Pseudo-Elements

Production pattern for dark cards with top and bottom rim light accents. Uses a 4-layer box-shadow system + pseudo-element radial gradients for concentrated edge highlights.

### Card foundation

```css
.card {
  position: relative;
  background-image: linear-gradient(0deg, rgba(19, 19, 19, 1), rgba(17, 17, 17, 1));
  border-radius: 12px;
  padding: 20px;
}
```

### Box-shadow rim light system (4 layers)

```css
.card {
  box-shadow:
    /* 1. Top rim glow — ambient light catching top edge */
    0 -4px 8px 6px rgba(255, 255, 255, 0.05),
    /* 2. Inner top highlight — subtle surface reflection */ inset 0 -4px 8px -8px rgba(255, 255, 255, 0.15),
    /* 3. Inner top shadow — depth from top surface */ inset 0 8px 8px 2px rgba(0, 0, 0, 0.03),
    /* 4. Bottom cast shadow — card floating above surface */ 0 4px 8px 6px rgba(0, 0, 0, 0.6);
}
```

**Shadow anatomy:**

| Layer | Direction              | Color | Opacity | Role                                                        |
| ----- | ---------------------- | ----- | ------- | ----------------------------------------------------------- |
| 1     | Outer, upward (-4px)   | White | 0.05    | Top rim glow — the primary rim light effect                 |
| 2     | Inset, downward (-4px) | White | 0.15    | Inner top reflection — light entering the surface           |
| 3     | Inset, downward (8px)  | Black | 0.03    | Top edge shadow — provides depth contrast against highlight |
| 4     | Outer, downward (4px)  | Black | 0.6     | Ground shadow — card elevation                              |

**Key insight:** Layer 1 (outer white upward) and Layer 4 (outer black downward) create the rim light illusion — the top glows while the bottom casts a dark shadow, simulating light coming from above/behind.

### Top rim highlight (::before)

Concentrated bright spot at the top center edge:

```css
.card::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 50%;
  z-index: 1;
  width: 40%;
  height: 1px;

  background:
    /* Sharp center highlight */
    radial-gradient(circle at center top, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)),
    /* Wider soft glow */ radial-gradient(circle at center top, rgba(255, 255, 255, 0.05) 10%, rgba(255, 255, 255, 0) 50%);

  filter: blur(0px);
  mix-blend-mode: screen;
  pointer-events: none;
}
```

**Dual radial gradient:** Two overlapping `radial-gradient` at the same position create a bright core (0.2) with a soft halo (0.05) — mimicking how real light has a bright center and soft falloff.

### Bottom rim highlight (::after)

Subtle reflected light at the bottom edge:

```css
.card::after {
  content: "";
  position: absolute;
  bottom: 0px;
  left: 20%;
  z-index: 1;
  width: 70%;
  height: 1px;

  background:
    radial-gradient(circle at center bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)), radial-gradient(circle at center bottom, rgba(255, 255, 255, 0.05) 10%, rgba(255, 255, 255, 0) 50%);

  filter: blur(0px);
  mix-blend-mode: screen;
  pointer-events: none;
}
```

**Asymmetry:** Top is 40% width at center, bottom is 70% width offset left (20%). This asymmetry is intentional — the bottom reflected light is wider but positioned differently than the top direct light, adding physical realism.

### Width scaling for different card sizes

```css
.card-small {
  max-width: 200px;
} /* Default pseudo-element widths work */
.card-medium {
  max-width: 400px;
} /* ::before/::after scale proportionally */
.card-large {
  max-width: 600px;
}
.card-xlarge {
  max-width: 700px;
}
```

The percentage-based widths (40%, 70%) and positions (50%, 20%) scale automatically with card width.

---

## 25.3 Rim Light Variations

### Colored rim light (accent color)

Replace white with a tinted color for branded rim light:

```css
.card-accent {
  box-shadow:
    0 -4px 8px 6px rgba(59, 130, 246, 0.08),
    /* Blue top glow */ inset 0 -4px 8px -8px rgba(59, 130, 246, 0.2),
    inset 0 8px 8px 2px rgba(0, 0, 0, 0.03),
    0 4px 8px 6px rgba(0, 0, 0, 0.6);
}

.card-accent::before {
  background: radial-gradient(circle at center top, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0));
}
```

### Full-perimeter rim light

For objects lit from all sides (e.g., floating in space):

```css
.card-full-rim {
  box-shadow:
    0 -4px 8px 6px rgba(255, 255, 255, 0.04),
    0 4px 8px 6px rgba(255, 255, 255, 0.02),
    -4px 0 8px 6px rgba(255, 255, 255, 0.02),
    4px 0 8px 6px rgba(255, 255, 255, 0.02),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 8px 24px rgba(0, 0, 0, 0.4);
}
```

### Animated rim light (hover glow intensification)

```css
.card-animated {
  transition: box-shadow 0.3s ease;
}

.card-animated:hover {
  box-shadow:
    0 -4px 12px 8px rgba(255, 255, 255, 0.1),
    /* Intensified top glow */ inset 0 -4px 8px -8px rgba(255, 255, 255, 0.25),
    inset 0 8px 8px 2px rgba(0, 0, 0, 0.03),
    0 4px 12px 8px rgba(0, 0, 0, 0.7);
}
```

---

## 25.4 Rim Light Recipes Quick Reference

### Recipe 1: Standard dark card with rim light (Tailwind + inline)

```css
class="relative rounded-xl bg-[#131313] p-5"
style="
  box-shadow:
    0 -4px 8px 6px rgba(255,255,255,0.05),
    inset 0 -4px 8px -8px rgba(255,255,255,0.15),
    inset 0 8px 8px 2px rgba(0,0,0,0.03),
    0 4px 8px 6px rgba(0,0,0,0.6);
"
```

### Recipe 2: Minimal rim light (shadow only, no pseudo-elements)

```css
style="
  box-shadow:
    0 -3px 6px 4px rgba(255,255,255,0.04),
    0 3px 6px 4px rgba(0,0,0,0.5);
"
```

### Decision matrix

| Need                            | Technique                                | Section |
| ------------------------------- | ---------------------------------------- | ------- |
| Standard dark card with top rim | 4-layer box-shadow + ::before/::after    | 25.2    |
| Colored/branded rim light       | Tinted rgba in shadow + pseudo-elements  | 25.3    |
| Floating object (all-side rim)  | 4-direction outer shadows + inset border | 25.3    |
| Hover glow intensification      | Transition on box-shadow values          | 25.3    |

### Opacity guidelines

| Element                      | Min  | Recommended | Max  |
| ---------------------------- | ---- | ----------- | ---- |
| Outer rim shadow (white)     | 0.02 | 0.04–0.06   | 0.10 |
| Inner rim highlight          | 0.08 | 0.12–0.15   | 0.20 |
| Pseudo-element radial center | 0.10 | 0.15–0.20   | 0.25 |
| Pseudo-element radial halo   | 0.02 | 0.04–0.05   | 0.08 |

Going above these maximums creates a "neon border" effect rather than subtle rim light. Rim light should be barely perceptible — the viewer should feel it rather than see it.

---

## 25.5 Radial Point-Source Rim Light — mask-composite Border Technique

Physically-correct point-source lighting on component borders using `radial-gradient` instead of `conic-gradient`. Simulates a single light bulb whose intensity falls off with distance (inverse-square law), not angular spread.

### Why radial, not conic

| Property                           | `conic-gradient`                      | `radial-gradient`                         |
| ---------------------------------- | ------------------------------------- | ----------------------------------------- |
| **Attenuation model**              | Angular (uniform at same angle)       | Distance-based (physically correct)       |
| **Stops needed for smooth result** | 20-30 to avoid banding                | 3 suffice                                 |
| **Corner wrapping**                | Wraps poorly around `border-radius`   | Follows curvature naturally               |
| **Resize behavior**                | Shifts center, requires recalculation | Stable — source is pinned to edge         |
| **Use case**                       | Rotating/scanning lights, bezels      | Point source (lamp, LED, backlight spill) |

**Anti-pattern:** Using `conic-gradient` for a stationary point source. Conic models angular sweep (lighthouse), radial models distance falloff (light bulb). Choosing wrong model = 30 stops for a result that still looks wrong at corners.

### Architecture — 2-layer pseudo-element system

Both `::before` and `::after` use the same `radial-gradient` positioned at the light source, but at different scales and sharpness:

| Layer            | Pseudo     | Padding | Inset             | Gradient radius | Blur        | Blend mode | Role                       |
| ---------------- | ---------- | ------- | ----------------- | --------------- | ----------- | ---------- | -------------------------- |
| **Sharp edge**   | `::before` | `1px`   | `0`               | Small (6–15%)   | `0`         | normal     | Crisp 1px specular rim     |
| **Diffuse halo** | `::after`  | `2px`   | `-1px` (overflow) | Large (15–25%)  | `blur(6px)` | `screen`   | Soft glow bleeding outward |

**Critical CSS mechanism:** `mask-composite: exclude` on both layers. The inner area is masked out, leaving ONLY the border region visible. This is what makes the gradient act as a border highlight rather than a surface fill.

### Layer 1 — Sharp specular rim (::before)

```css
.rim-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  padding: 1px;
  border-radius: inherit; /* follows parent curvature */

  background: radial-gradient(circle at 0% 50%, /* light source: left center */ rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.3) 6%, transparent 15%);

  /* Mask trick: exclude inner rect, keep only the 1px border ring */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  /* Optional: add a crisp drop-shadow for extra punch */
  filter: drop-shadow(3px 0 4px rgba(255, 255, 255, 0.08));
  pointer-events: none;
}
```

**3-stop gradient anatomy:**

- `0%` — Maximum brightness at light source position (0.85)
- `6%` — Rapid falloff to mid intensity (0.30) — simulates inverse-square
- `15%` — Fully transparent — light doesn't reach opposite side

### Layer 2 — Diffuse halo (::after)

```css
.rim-card::after {
  content: "";
  position: absolute;
  inset: -1px; /* bleeds 1px outside the card */
  z-index: 0;
  padding: 2px;
  border-radius: inherit;

  background: radial-gradient(circle at 0% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 10%, transparent 20%);

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  filter: blur(6px);
  mix-blend-mode: screen;
  pointer-events: none;
}
```

**Note:** The 0.85 center intensity in Layer 1 is inside a `mask-composite` border — only a 1px ring is visible. The effective perceived brightness of the rim stays within the 0.20–0.25 range from §25.0. This is NOT an exception to the opacity rule.

**Key differences from Layer 1:**

- `inset: -1px` — overflows parent bounds, creating glow bleed
- `padding: 2px` — thicker visible border ring
- `blur(6px)` — soft atmospheric scatter
- `mix-blend-mode: screen` — adds light without darkening background
- Gradient radius `20%` (vs 15%) — wider, softer falloff

### Light source positions

Move the `radial-gradient` center to change where the light appears:

| Position        | `circle at` | Physical analog             |
| --------------- | ----------- | --------------------------- |
| Left center     | `0% 50%`    | Side-mounted panel LED      |
| Top-left corner | `0% 0%`     | Overhead directional light  |
| Top center      | `50% 0%`    | Ceiling-mounted downlight   |
| Bottom center   | `50% 100%`  | Underglow / reflected light |
| Right center    | `100% 50%`  | Stage wing light            |

### Warm industrial variant (amber point source)

For the Retro-Industrial / Aerospace aesthetic:

```css
/* Layer 1 — sharp amber rim */
background: radial-gradient(circle at 0% 50%, hsl(35 100% 60% / 0.75) 0%, hsl(35 100% 50% / 0.25) 6%, transparent 15%);

/* Layer 2 — diffuse amber halo */
background: radial-gradient(circle at 0% 50%, hsl(35 100% 55% / 0.5) 0%, hsl(35 80% 45% / 0.12) 10%, transparent 22%);
```

### React inline-style implementation (no CSS classes needed)

```tsx
function RadialRimCard({ children, lightPos = "0% 50%", color = "255,255,255" }) {
  const sharedMask = {
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude" as const
  };

  return (
    <div style={{ position: "relative", borderRadius: 12 }}>
      {/* Sharp rim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          padding: 1,
          borderRadius: "inherit",
          background: `radial-gradient(circle at ${lightPos}, rgba(${color},0.85) 0%, rgba(${color},0.3) 6%, transparent 15%)`,
          filter: "drop-shadow(3px 0 4px rgba(255,255,255,0.08))",
          pointerEvents: "none" as const,
          ...sharedMask
        }}
      />
      {/* Halo */}
      <div
        style={{
          position: "absolute",
          inset: -1,
          zIndex: 0,
          padding: 2,
          borderRadius: "inherit",
          background: `radial-gradient(circle at ${lightPos}, rgba(${color},0.6) 0%, rgba(${color},0.15) 10%, transparent 20%)`,
          filter: "blur(6px)",
          mixBlendMode: "screen" as const,
          pointerEvents: "none" as const,
          ...sharedMask
        }}
      />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
```

### Combining with box-shadow rim light

The radial point-source technique can layer on top of the 25.2 box-shadow system. Use box-shadow for ambient full-edge glow AND pseudo-elements for directional point-source accent:

```css
.card-combined {
  /* Ambient full-rim from 25.2 */
  box-shadow:
    0 -3px 6px 4px rgba(255, 255, 255, 0.04),
    0 3px 6px 4px rgba(0, 0, 0, 0.5);
}
/* + ::before/::after from 25.5 for directional accent */
```

### Decision matrix (updated)

| Need                               | Technique                                    | Section         |
| ---------------------------------- | -------------------------------------------- | --------------- |
| Standard dark card with top rim    | 4-layer box-shadow + ::before/::after        | 25.2            |
| Colored/branded rim light          | Tinted rgba in shadow + pseudo-elements      | 25.3            |
| Floating object (all-side rim)     | 4-direction outer shadows + inset border     | 25.3            |
| Hover glow intensification         | Transition on box-shadow values              | 25.3            |
| **Point-source directional light** | **radial-gradient + mask-composite exclude** | **25.5**        |
| **Warm industrial accent LED**     | **Amber radial-gradient variant**            | **25.5**        |
| **Combined ambient + directional** | **box-shadow (25.2) + radial pseudo (25.5)** | **25.2 + 25.5** |
