# Aging, Safety, Tokens & Additional Palettes (Sections 19-22)

## 19. Aging & Patina Effects

### 19.1 Scratched metal

```css
.scratched::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(73deg, transparent 30%, rgba(255, 255, 255, 0.03) 30.5%, transparent 31%), linear-gradient(108deg, transparent 50%, rgba(255, 255, 255, 0.02) 50.3%, transparent 50.6%),
    linear-gradient(25deg, transparent 70%, rgba(255, 255, 255, 0.03) 70.2%, transparent 70.4%);
}
```

### 19.2 Oxidized / tarnished

```css
.oxidized {
  background: linear-gradient(135deg, #5a6855 0%, #4a5845 50%, #3d4b38 100%);
  /* Greenish tint over original metal color */
}
```

### 19.3 Faded paint

```css
.faded {
  filter: saturate(0.7) brightness(1.05);
  /* Or apply as modifier to existing background */
}
```

### 19.4 Worn edges

```css
.worn-edge {
  border-radius: 6px;
  /* Slightly uneven via clip-path or border-image with worn texture */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    /* exposed metal at edge */ 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

## 20. Safety & Industrial Colors

### 20.1 Standard safety colors (ANSI Z535 / ISO 3864)

```css
--safety-red: #c8102e; /* Danger, stop, fire */
--safety-orange: #ff6900; /* Warning, hazard */
--safety-yellow: #ffd100; /* Caution */
--safety-green: #00843d; /* Safety, first aid, go */
--safety-blue: #0057b8; /* Information, mandatory */
--safety-purple: #6b2d8b; /* Radiation hazard */
```

### 20.2 Industrial panel conventions

| Element              | Color                         | Purpose             |
| -------------------- | ----------------------------- | ------------------- |
| Power button         | Red ring or LED               | Emergency stop      |
| Status LED (OK)      | Green                         | Operating normally  |
| Status LED (warning) | Amber/yellow                  | Attention needed    |
| Status LED (error)   | Red                           | Fault condition     |
| Status LED (standby) | Blue                          | Powered, inactive   |
| Selector ring        | Chrome/silver                 | Neutral, mechanical |
| Label text           | White on dark, black on light | Readability         |

---

## 21. Design Tokens

### Shadow scale

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.15);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.25);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.35);
--shadow-inset-sm: inset 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-inset-md: inset 0 2px 6px rgba(0, 0, 0, 0.3);
--shadow-inset-lg: inset 0 3px 8px rgba(0, 0, 0, 0.5);
```

### Material colors

```css
--metal-dark: #1a1a1e;
--metal-mid: #2a2a2e;
--metal-light: #3a3a40;
--metal-highlight: rgba(255, 255, 255, 0.08);
--metal-shadow: rgba(0, 0, 0, 0.4);
```

### Glow intensities

```css
--glow-subtle: 0 0 4px;
--glow-medium: 0 0 8px, 0 0 16px;
--glow-strong: 0 0 4px, 0 0 8px, 0 0 16px, 0 0 32px;
```

### Animation timing

```css
--ease-mechanical: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-snap: cubic-bezier(0.68, -0.55, 0.27, 1.55);
--duration-fast: 0.08s; /* button press */
--duration-normal: 0.15s; /* toggle, LED */
--duration-slow: 0.3s; /* flip, slide */
--duration-sweep: 0.8s; /* gauge needle */
```

### Depth levels

```css
--depth-well: -3; /* display recesses */
--depth-inset: -1; /* pressed buttons, tracks */
--depth-surface: 0; /* panel surface */
--depth-raised: 1; /* buttons, cards */
--depth-floating: 2; /* tooltips, dropdowns */
--depth-overlay: 3; /* modals, popovers */
```

---

## 22. Additional Color Palettes

### Copper / steampunk

```css
--copper-dark: #6b3a1a;
--copper-mid: #b87333;
--copper-light: #da9a5b;
--copper-highlight: #f0c090;
--patina-green: #4a7b5a;
```

### Vintage cream / bakelite

```css
--bakelite-dark: #4a3b2a;
--bakelite-mid: #8b7355;
--bakelite-light: #c8b090;
--cream: #f5f0e0;
--aged-white: #e8e0d0;
```

### Neon / cyberpunk

```css
--neon-pink: #ff00ff;
--neon-cyan: #00ffff;
--neon-green: #00ff41;
--neon-yellow: #ffff00;
--cyber-dark: #0a0a1a;
--cyber-grid: rgba(0, 255, 255, 0.05);
```

### Soviet military

```css
--od-green: #4a5a3a;
--od-dark: #2a3520;
--od-light: #6a7a58;
--soviet-red: #cc2200;
--label-stencil: rgba(255, 255, 255, 0.7);
```
