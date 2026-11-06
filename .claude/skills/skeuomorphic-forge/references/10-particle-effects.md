# Section 26 — Particle Effects

Comprehensive particle system techniques for web UI. Covers CSS-only starfields, Canvas 2D particle engines, mouse-interactive particles, orbital systems, and WebGL/Three.js GPU-powered particle effects.

---

## 26.1 Particle System Fundamentals

Every particle system has 5 core components:

| Component     | Purpose                                                        | Implementation                                              |
| ------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| **Emitter**   | Where particles spawn                                          | Fixed point, mouse position, element boundary, random area  |
| **Particle**  | Individual element with position, velocity, size, color, alpha | Object/struct with x, y, vx, vy, r, color, alpha properties |
| **Physics**   | How particles move                                             | Velocity integration, gravity, attraction, noise, orbital   |
| **Lifecycle** | Birth → live → death                                           | Spawn rate, max count, alpha decay, removal on offscreen    |
| **Renderer**  | How particles are drawn                                        | CSS box-shadow, Canvas 2D arc/drawImage, WebGL points       |

**Performance tiers:**

| Tier               | Particle count | Technique                     | Use case                    |
| ------------------ | -------------- | ----------------------------- | --------------------------- |
| Decorative (< 100) | 10-100         | CSS box-shadow animation      | Subtle ambient effects      |
| Medium (100-1000)  | 100-1K         | Canvas 2D fillRect/arc        | Interactive backgrounds     |
| Heavy (1K-10K)     | 1K-10K         | Canvas 2D with cached sprites | Rich particle scenes        |
| Massive (10K+)     | 10K-500K+      | WebGL / GPGPU (Three.js)      | Hero backgrounds, immersive |

---

## 26.2 CSS-Only Starfield — SCSS Box-Shadow Mixin

Pure CSS particle starfield using SCSS-generated `box-shadow` lists. Zero JavaScript. Four parallax layers at different speeds create depth illusion.

**When to use:** Decorative backgrounds, hero sections, ambient atmosphere. No interactivity needed.

### SCSS mixin — particle generator

```scss
$color-bg: #111;
$color-particle: #fff;
$spacing: 2560px;

@function particles($max) {
  $val: 0px 0px $color-particle;
  @for $i from 1 through $max {
    $val:
      #{$val},
      random($spacing) + px random($spacing) + px $color-particle;
  }
  @return $val;
}

@mixin particles($max) {
  box-shadow: particles($max);
}
```

**How it works:** The `@for` loop generates N `box-shadow` values at random x,y positions within the `$spacing` range. Each shadow is a 0-blur dot — effectively a pixel-sized particle.

### Four parallax layers

```scss
/* Layer 1: Dense small particles — fast */
.particle-1 {
  animation: animParticle 60s linear infinite;
  @include particles(600);
  height: 1px;
  width: 1px;
}
.particle-1:after {
  position: absolute;
  content: "";
  top: $spacing; /* Duplicate set offset by $spacing */
  @include particles(600);
  height: 1px;
  width: 1px;
}

/* Layer 2: Medium particles — medium speed */
.particle-2 {
  animation: animParticle 120s linear infinite;
  @include particles(200);
  height: 2px;
  width: 2px;
}
.particle-2:after {
  @include particles(200);
  height: 2px;
  width: 2px;
  top: $spacing;
}

/* Layer 3: Sparse large particles — slow */
.particle-3 {
  animation: animParticle 180s linear infinite;
  @include particles(100);
  height: 3px;
  width: 3px;
}
.particle-3:after {
  @include particles(100);
  height: 3px;
  width: 3px;
  top: $spacing;
}

/* Layer 4: Extra-fine dust — very slow */
.particle-4 {
  animation: animParticle 600s linear infinite;
  @include particles(400);
  height: 1px;
  width: 1px;
}
.particle-4:after {
  @include particles(400);
  height: 1px;
  width: 1px;
  top: $spacing;
}
```

### Seamless loop animation

```scss
@keyframes animParticle {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY($spacing * -1);
  }
}
```

**Key insight:** Each layer has a `::after` pseudo-element with the same particle pattern offset by `$spacing`. As the element translates upward by `$spacing`, the `::after` seamlessly replaces it — creating an infinite scroll with no visible reset.

### Parallax depth table

| Layer      | Count | Size | Speed | Depth feel               |
| ---------- | ----- | ---- | ----- | ------------------------ |
| particle-1 | 600   | 1px  | 60s   | Nearest — fast, dense    |
| particle-2 | 200   | 2px  | 120s  | Mid — medium             |
| particle-3 | 100   | 3px  | 180s  | Far — slow, sparse       |
| particle-4 | 400   | 1px  | 600s  | Deepest — very slow dust |

### HTML structure

```html
<div class="animation-wrapper">
  <div class="particle particle-1"></div>
  <div class="particle particle-2"></div>
  <div class="particle particle-3"></div>
  <div class="particle particle-4"></div>
</div>
```

### Container styles

```css
.animation-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle,
.particle:after {
  background: transparent;
}
```

---

## 26.3 Canvas Particle Engine — Multi-Layer with Background Lights

Full particle engine using CreateJS (Canvas 2D) with TweenMax animation. Three particle tiers (small, medium, large) + animated background light ellipses. Composite blending for glow effect.

### Architecture

```
ParticleEngine
├── Background Lights (3 ellipses, blurred, screen blend)
├── Small particles (300, stroke-only circles, alpha 0-0.4)
├── Medium particles (100, filled+blurred circles, alpha 0-0.3)
└── Large particles (10, filled+blurred circles, alpha 0-0.2)
```

### Configuration

```javascript
// Particle tiers
this.particleSettings = [
  {
    id: "small",
    num: 300,
    fromX: 0,
    toX: totalWidth,
    ballwidth: 3,
    alphamax: 0.4,
    areaHeight: 0.5, // Concentrated in center 50%
    color: "#0cdbf3",
    fill: false // Stroke only — lightweight
  },
  {
    id: "medium",
    num: 100,
    fromX: 0,
    toX: totalWidth,
    ballwidth: 8,
    alphamax: 0.3,
    areaHeight: 1, // Full height spread
    color: "#6fd2f3",
    fill: true // Filled + blur filter
  },
  {
    id: "large",
    num: 10,
    fromX: 0,
    toX: totalWidth,
    ballwidth: 30,
    alphamax: 0.2,
    areaHeight: 1,
    color: "#93e9f3",
    fill: true
  }
];

// Background lights
this.lights = [
  { ellipseWidth: 400, ellipseHeight: 100, alpha: 0.6, offsetX: 0, offsetY: 0, color: "#6ac6e8" },
  { ellipseWidth: 350, ellipseHeight: 250, alpha: 0.3, offsetX: -50, offsetY: 0, color: "#54d5e8" },
  { ellipseWidth: 100, ellipseHeight: 80, alpha: 0.2, offsetX: 80, offsetY: -50, color: "#2ae8d8" }
];
```

### Composite operation

```javascript
this.stage.compositeOperation = "lighter";
```

**"lighter" blend mode** adds RGB values of overlapping particles — particles near each other create brighter spots, simulating light accumulation. Essential for glow particle effects.

### Weighted random distribution

```javascript
function weightedRange(to, from, decimalPlaces, weightedRange, weightStrength) {
  if (weightedRange && Math.random() <= weightStrength) {
    // Within weighted zone — higher probability
    return round(Math.random() * (weightedRange[1] - weightedRange[0]) + weightedRange[0], decimalPlaces);
  } else {
    // Full range — lower probability
    return round(Math.random() * (to - from) + from, decimalPlaces);
  }
}
```

**Purpose:** Concentrates particles toward the center of the viewport while still allowing outliers. `weightStrength: 0.8` means 80% of particles spawn in the weighted zone.

### Particle animation cycle

```javascript
function animateBall(ball) {
  var scale = range(0.3, 1);
  var xpos = range(ball.initX - ball.distance, ball.initX + ball.distance);
  var ypos = range(ball.initY - ball.distance, ball.initY + ball.distance);
  var speed = ball.speed;

  // Move + scale
  TweenMax.to(ball, speed, {
    scaleX: scale,
    scaleY: scale,
    x: xpos,
    y: ypos,
    onComplete: animateBall,
    onCompleteParams: [ball],
    ease: Cubic.easeInOut
  });

  // Fade in (first half of movement)
  TweenMax.to(ball, speed / 2, {
    alpha: range(0.1, ball.alphaMax),
    onComplete: fadeout,
    onCompleteParams: [ball, speed]
  });
}

function fadeout(ball, speed) {
  ball.speed = range(2, 10);
  TweenMax.to(ball, speed / 2, { alpha: 0 });
}
```

**Lifecycle:** Each particle drifts within its `distance` radius, fades in during the first half of movement, fades out during the second half, then picks a new target position. Creates organic "breathing" effect.

### Background light animation

```javascript
// Light 1: horizontal breathing
TweenMax.fromTo(
  lights[0].elem,
  10,
  {
    scaleX: 1.5
  },
  {
    yoyo: true,
    repeat: -1,
    ease: Power1.easeInOut,
    scaleX: 2,
    scaleY: 0.7
  }
);

// Light 2: diagonal drift
TweenMax.fromTo(
  lights[1].elem,
  12,
  {
    /* initial */
  },
  {
    delay: 5,
    yoyo: true,
    repeat: -1,
    ease: Power1.easeInOut,
    scaleY: 2,
    scaleX: 2,
    y: totalHeight / 2 - 50,
    x: totalWidth / 2 + 100
  }
);
```

---

## 26.4 Click-Burst Space Dust — Vanilla Canvas

Particles spawn at click location with random directions and colors from a palette. No external dependencies.

### Configuration

```javascript
var config = {
  particleNumber: 800,
  maxParticleSize: 10,
  maxSpeed: 40,
  colorVariation: 50
};

var colorPalette = {
  bg: { r: 12, g: 9, b: 29 },
  matter: [
    { r: 36, g: 18, b: 42 }, // darkPRPL
    { r: 78, g: 36, b: 42 }, // rockDust
    { r: 252, g: 178, b: 96 }, // solarFlare
    { r: 253, g: 238, b: 152 } // totesASun
  ]
};
```

### Particle constructor

```javascript
var Particle = function (x, y) {
  this.x = x || Math.round(Math.random() * canvas.width);
  this.y = y || Math.round(Math.random() * canvas.height);
  this.r = Math.ceil(Math.random() * config.maxParticleSize);
  this.c = colorVariation(colorPalette.matter[Math.floor(Math.random() * colorPalette.matter.length)], true);
  this.s = Math.pow(Math.ceil(Math.random() * config.maxSpeed), 0.7);
  this.d = Math.round(Math.random() * 360); // Direction in degrees
};
```

### Color variation — adds randomness to palette colors

```javascript
var colorVariation = function (color, returnString) {
  var r = Math.round(Math.random() * config.colorVariation - config.colorVariation / 2 + color.r);
  var g = Math.round(Math.random() * config.colorVariation - config.colorVariation / 2 + color.g);
  var b = Math.round(Math.random() * config.colorVariation - config.colorVariation / 2 + color.b);
  var a = Math.random() + 0.5;
  if (returnString) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  return { r, g, b, a };
};
```

### Movement model — trigonometric direction

```javascript
var updateParticleModel = function (p) {
  var a = 180 - (p.d + 90);
  p.d > 0 && p.d < 180 ? (p.x += (p.s * Math.sin(p.d)) / Math.sin(p.s)) : (p.x -= (p.s * Math.sin(p.d)) / Math.sin(p.s));
  p.d > 90 && p.d < 270 ? (p.y += (p.s * Math.sin(a)) / Math.sin(p.s)) : (p.y -= (p.s * Math.sin(a)) / Math.sin(p.s));
  return p;
};
```

### Frame loop

```javascript
var frame = function () {
  drawBg(ctx, colorPalette.bg); // Clear with bg color
  particles.map(updateParticleModel); // Move all
  particles.forEach(function (p) {
    drawParticle(p.x, p.y, p.r, p.c); // Draw all
  });
  window.requestAnimationFrame(frame);
};
```

### Click handler — burst at cursor

```javascript
document.body.addEventListener("click", function (event) {
  cleanUpArray(); // Remove offscreen particles
  initParticles(config.particleNumber, event.clientX, event.clientY);
});
```

---

## 26.5 Mouse-Attracted Fire Particles — Gravity System

Particles spawn at mouse position with random velocity, then are pulled back toward the cursor by gravity. Creates a "fire follows mouse" effect.

### Particle creation

```javascript
function newParticle() {
  type = type ? 0 : 1; // Alternate between two types
  particles.push({
    x: mouse.x,
    y: mouse.y,
    xv: type ? 18 * Math.random() - 9 : 24 * Math.random() - 12, // Velocity
    yv: type ? 18 * Math.random() - 9 : 24 * Math.random() - 12,
    c: type ? "rgb(255," + ((200 * Math.random()) | 0) + "," + ((80 * Math.random()) | 0) + ")" : "rgb(255,255,255)",
    s: type ? 5 + 10 * Math.random() : 1, // Size
    a: 1 // Alpha
  });
}
```

**Two particle types (alternating):**

- Type 0: Small white dots (size 1, wide velocity range ±12)
- Type 1: Large fire particles (size 5-15, warm orange-red, velocity ±9)

### Gravity attraction

```javascript
for (var i = 0; i < particles.length; i++) {
  var p = particles[i];
  if (!mouse.out) {
    x = mouse.x - p.x;
    y = mouse.y - p.y;
    a = x * x + y * y; // Distance squared
    a = a > 100 ? gravityStrength / a : gravityStrength / 100; // Inverse-square, clamped
    p.xv = (p.xv + a * x) * 0.99; // Apply gravity + friction
    p.yv = (p.yv + a * y) * 0.99;
  }
  p.x += p.xv;
  p.y += p.yv;
  p.a *= 0.99; // Alpha decay
}
```

**Physics model:**

1. Calculate vector from particle to mouse
2. Inverse-square gravity (clamped at distance 10 to prevent singularity)
3. Apply gravity to velocity
4. Friction (0.99 multiplier) prevents infinite acceleration
5. Alpha decays at 1% per frame — particles fade and die

### Spawn control

```javascript
// Spawn particles continuously while mouse is on canvas
spawnTimer += dt < 100 ? dt : 100;
for (; spawnTimer > 0; spawnTimer -= spawnInterval) {
  newParticle();
}

// Cap particle count
particleOverflow = particles.length - 700;
if (particleOverflow > 0) {
  particles.splice(0, particleOverflow); // Remove oldest
}
```

---

## 26.6 Starfield with Orbital Motion + Twinkle — Cached Sprite

Orbiting stars around a central point with twinkle effect. Uses a cached radial gradient sprite for performance with 1400 particles.

### Cached star sprite (performance optimization)

```javascript
var canvas2 = document.createElement("canvas");
var ctx2 = canvas2.getContext("2d");
canvas2.width = 100;
canvas2.height = 100;
var half = canvas2.width / 2;

var gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
gradient2.addColorStop(0.025, "#fff");
gradient2.addColorStop(0.1, "hsl(217, 61%, 33%)");
gradient2.addColorStop(0.25, "hsl(217, 64%, 6%)");
gradient2.addColorStop(1, "transparent");

ctx2.fillStyle = gradient2;
ctx2.beginPath();
ctx2.arc(half, half, half, 0, Math.PI * 2);
ctx2.fill();
```

**Key optimization:** Instead of drawing a radial gradient for each of 1400 stars every frame, draw it once to an offscreen canvas and use `drawImage()` — 10-50x faster.

### Star class — orbital motion

```javascript
var Star = function () {
  this.orbitRadius = random(maxOrbit(w, h));
  this.radius = random(60, this.orbitRadius) / 12;
  this.orbitX = w / 2;
  this.orbitY = h / 2;
  this.timePassed = random(0, maxStars);
  this.speed = random(this.orbitRadius) / 50000;
  this.alpha = random(2, 10) / 10;
};
```

**Orbit sizing rule:** `speed = random(orbitRadius) / 50000` — stars further from center orbit slower, matching Kepler's laws. Creates natural-looking rotation.

### Twinkle effect

```javascript
Star.prototype.draw = function () {
  var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
  var y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
  var twinkle = random(10);

  if (twinkle === 1 && this.alpha > 0) {
    this.alpha -= 0.05; // 10% chance to dim
  } else if (twinkle === 2 && this.alpha < 1) {
    this.alpha += 0.05; // 10% chance to brighten
  }

  ctx.globalAlpha = this.alpha;
  ctx.drawImage(canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
  this.timePassed += this.speed;
};
```

### Frame loop — trail effect

```javascript
function animation() {
  // Semi-transparent fill creates motion trails
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "hsla(217, 64%, 6%, 1)";
  ctx.fillRect(0, 0, w, h);

  // Stars drawn additively for glow
  ctx.globalCompositeOperation = "lighter";
  for (var i = 1; i < stars.length; i++) {
    stars[i].draw();
  }

  window.requestAnimationFrame(animation);
}
```

**Trail technique:** `globalAlpha = 0.8` on the background fill means 20% of the previous frame persists — creating soft motion trails behind moving stars.

---

## 26.7 Black Hole Vortex — Orbital Collapse/Expand System

2500 orbiting particles with three interactive states: normal orbit, collapse (hover), and expansion (click). Stars leave motion trails via semi-transparent background clearing.

### Star class — orbital with state management

```javascript
class Star {
  constructor() {
    // Weighted random orbit — majority near center
    const rands = [Math.random() * (maxorbit / 2) + 1, Math.random() * (maxorbit / 2) + maxorbit];
    this.orbital = rands.reduce((p, c) => p + c, 0) / rands.length;

    this.x = centerx;
    this.y = centery + this.orbital;
    this.yOrigin = centery + this.orbital;

    this.speed = ((Math.floor(Math.random() * 2.5) + 1.5) * Math.PI) / 180;
    this.rotation = 0;
    this.startRotation = ((Math.floor(Math.random() * 360) + 1) * Math.PI) / 180;

    // Collapse bonus — prevents particles from going inside the hole
    this.collapseBonus = this.orbital - maxorbit * 0.7;
    if (this.collapseBonus < 0) this.collapseBonus = 0;

    // Transparency increases with distance from center
    this.color = "rgba(255,255,255," + (1 - this.orbital / 255) + ")";

    // Three target positions
    this.hoverPos = centery + maxorbit / 2 + this.collapseBonus;
    this.expansePos = centery + (this.id % 100) * -10 + (Math.floor(Math.random() * 20) + 1);
    this.originalY = this.yOrigin;
  }
}
```

### Three states

```javascript
draw() {
  if (!expanse && !returning) {
    // NORMAL ORBIT
    this.rotation = this.startRotation + (currentTime * this.speed);
    if (!collapse) {
      // Return to orbit
      if (this.y > this.yOrigin) this.y -= 2.5;
      if (this.y < this.yOrigin - 4)
        this.y += (this.yOrigin - this.y) / 10;
    } else {
      // COLLAPSE (hover) — pull toward center
      if (this.y > this.hoverPos)
        this.y -= (this.hoverPos - this.y) / -5;
      if (this.y < this.hoverPos - 4)
        this.y += 2.5;
    }
  } else if (expanse && !returning) {
    // EXPANSION (click) — fly outward
    this.rotation = this.startRotation + (currentTime * (this.speed / 2));
    if (this.y > this.expansePos)
      this.y -= Math.floor(this.expansePos - this.y) / -80;
  } else if (returning) {
    // RETURNING — slowly drift back to original orbit
    this.rotation = this.startRotation + (currentTime * this.speed);
    if (Math.abs(this.y - this.originalY) > 2) {
      this.y += (this.originalY - this.y) / 50;
    } else {
      this.y = this.originalY;
    }
  }
}
```

### Rotation rendering with trail

```javascript
// Draw line from previous position to current (creates streak)
context.save();
context.fillStyle = this.color;
context.strokeStyle = this.color;
context.beginPath();
var oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
context.moveTo(oldPos[0], oldPos[1]);
context.translate(centerx, centery);
context.rotate(this.rotation);
context.translate(-centerx, -centery);
context.lineTo(this.x, this.y);
context.stroke();
context.restore();
```

### Trail effect via semi-transparent clear

```javascript
function loop() {
  context.fillStyle = "rgba(25,25,25,0.2)"; // 80% opacity clear
  context.fillRect(0, 0, cw, ch); // Previous frame shows through

  for (var i = 0; i < stars.length; i++) {
    stars[i].draw();
  }
  requestAnimationFrame(loop);
}
```

---

## 26.8 WebGL GPGPU Cursor Particles — Three.js

GPU-powered particle system using Three.js with GPGPU computation. Handles 512x512 = 262,144 particles at 60fps. Particles respond to cursor position with configurable noise, decay, and color.

### Setup

```javascript
import { particlesCursor } from "threejs-toys";

const pc = particlesCursor({
  el: document.getElementById("app"),
  gpgpuSize: 512, // 512x512 = 262K particles
  colors: [0x00ff00, 0x0000ff],
  color: 0xff0000,
  coordScale: 0.5, // Position noise scale
  noiseIntensity: 0.001, // Perlin noise strength
  noiseTimeCoef: 0.0001, // Noise animation speed
  pointSize: 5, // Particle size in pixels
  pointDecay: 0.0025, // How fast particles fade
  sleepRadiusX: 250, // Idle particle spread X
  sleepRadiusY: 250, // Idle particle spread Y
  sleepTimeCoefX: 0.001, // Idle animation speed X
  sleepTimeCoefY: 0.002 // Idle animation speed Y
});
```

### Dynamic parameter changes on click

```javascript
document.body.addEventListener("click", () => {
  pc.uniforms.uColor.value.set(Math.random() * 0xffffff);
  pc.uniforms.uCoordScale.value = 0.001 + Math.random() * 2;
  pc.uniforms.uNoiseIntensity.value = 0.0001 + Math.random() * 0.001;
  pc.uniforms.uPointSize.value = 1 + Math.random() * 10;
});
```

### Tuning parameters

| Parameter        | Low                 | Medium            | High              |
| ---------------- | ------------------- | ----------------- | ----------------- |
| `gpgpuSize`      | 64 (4K particles)   | 256 (65K)         | 512 (262K)        |
| `pointSize`      | 1 (dust)            | 3-5 (standard)    | 10+ (large orbs)  |
| `pointDecay`     | 0.001 (long trails) | 0.0025 (standard) | 0.01 (quick fade) |
| `noiseIntensity` | 0.0001 (subtle)     | 0.001 (flowing)   | 0.01 (chaotic)    |
| `coordScale`     | 0.1 (tight cluster) | 0.5 (standard)    | 2.0 (wide spread) |

---

## 26.9 Three.js Text Particle Disintegration — BAS

Text geometry broken into individual face triangles that fly apart along cubic bezier curves. Uses Three.js BAS (Buffer Animation System) for GPU-accelerated per-face animation.

### Geometry preparation

```javascript
function createTextAnimation() {
  var geometry = generateTextGeometry("TEXT", {
    size: 14,
    height: 0,
    font: "droid sans",
    weight: "bold",
    anchor: { x: 0.5, y: 0.5, z: 0.0 }
  });

  // Separate shared vertices so each face animates independently
  THREE.BAS.Utils.separateFaces(geometry);

  return new TextAnimation(geometry);
}
```

### Per-face animation attributes

```javascript
var bufferGeometry = new THREE.BAS.ModelBufferGeometry(textGeometry);
var aAnimation = bufferGeometry.createAttribute("aAnimation", 2); // delay, duration
var aCentroid = bufferGeometry.createAttribute("aCentroid", 3); // face center
var aControl0 = bufferGeometry.createAttribute("aControl0", 3); // bezier control 1
var aControl1 = bufferGeometry.createAttribute("aControl1", 3); // bezier control 2
var aEndPosition = bufferGeometry.createAttribute("aEndPosition", 3); // final position
```

### Animation calculation per face

```javascript
for (i = 0; i < faceCount; i++) {
  var centroid = THREE.BAS.Utils.computeCentroid(textGeometry, face);

  // Delay based on X position — left letters animate first
  var delayX = Math.max(0, (centroid.x / size.width) * maxDelayX);
  var delayY = Math.max(0, (1.0 - centroid.y / size.height) * maxDelayY);
  var duration = THREE.Math.randFloat(minDuration, maxDuration);

  // Bezier control points — random curves upward
  var c0x = centroid.x + THREE.Math.randFloat(40, 120);
  var c0y = centroid.y + size.height * THREE.Math.randFloat(0.0, 12.0);
  var c0z = THREE.Math.randFloatSpread(120);
  // ... c1 mirrors with negative X offset
}
```

### Custom vertex shader

```glsl
// Vertex shader (via BAS material)
float tDelay = aAnimation.x;
float tDuration = aAnimation.y;
float tTime = clamp(uTime - tDelay, 0.0, tDuration);
float tProgress = ease(tTime, 0.0, 1.0, tDuration);

vec3 tPosition = transformed - aCentroid;
tPosition *= 1.0 - tProgress;              // Scale down from centroid
tPosition += aCentroid;
tPosition += cubicBezier(tPosition, aControl0, aControl1, aEndPosition, tProgress);
transformed = tPosition;
```

### Timeline control

```javascript
var tl = new TimelineMax({
  repeat: -1,
  repeatDelay: 0.25,
  yoyo: true // Reassembles after disintegrating
});
tl.fromTo(textAnimation, 4, { animationProgress: 0.0 }, { animationProgress: 1.0, ease: Power1.easeInOut }, 0);
```

---

## 26.10 Particle Recipes Quick Reference

### Recipe 1: CSS starfield background (no JS)

```html
<div class="animation-wrapper">
  <div class="particle particle-1"></div>
  <div class="particle particle-2"></div>
  <div class="particle particle-3"></div>
</div>
```

SCSS mixin generates box-shadow particles. Use 3-4 layers for parallax depth.

### Recipe 2: Canvas click-burst (vanilla JS, ~50 lines)

```javascript
// Minimal burst: spawn N particles at click, move by direction, draw as circles
canvas.onclick = (e) => {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      r: Math.random() * 3 + 1,
      a: 1
    });
  }
};
// In frame loop: move, fade (a *= 0.98), draw arc, remove if a < 0.01
```

### Recipe 3: Mouse-follow fire (vanilla JS, ~40 lines)

```javascript
// Spawn at mouse, apply inverse-square gravity toward mouse, decay alpha
// Key: gravity = strength / distanceSquared, friction = 0.99, alpha *= 0.99
```

### Decision matrix

| Need                                 | Technique                               | Section |
| ------------------------------------ | --------------------------------------- | ------- |
| Static ambient starfield (no JS)     | CSS box-shadow + SCSS mixin             | 26.2    |
| Rich multi-layer particles with glow | Canvas + CreateJS + composite "lighter" | 26.3    |
| Click-triggered particle burst       | Vanilla Canvas, color palette           | 26.4    |
| Mouse-following fire/attraction      | Gravity system, spawn on move           | 26.5    |
| Orbiting starfield with twinkle      | Cached sprite + orbital math            | 26.6    |
| Interactive vortex/black hole        | Orbital collapse/expand states          | 26.7    |
| Massive GPU particles (100K+)        | Three.js GPGPU                          | 26.8    |
| Text disintegration/reassembly       | Three.js BAS per-face animation         | 26.9    |

### Performance guidelines

| Particle count | Renderer                    | Frame budget      |
| -------------- | --------------------------- | ----------------- |
| < 100          | CSS box-shadow              | 0ms JS (CSS only) |
| 100-500        | Canvas 2D, fillRect         | < 4ms             |
| 500-2000       | Canvas 2D, cached drawImage | < 8ms             |
| 2000-5000      | Canvas 2D, composite tricks | < 12ms            |
| 5000+          | WebGL / GPGPU               | < 4ms (GPU)       |
