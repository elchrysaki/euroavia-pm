# Verification Checklist — Pre-Delivery Gate

Pre-delivery verification gate U0-U9. A component that fails this gate MUST NOT be delivered.

---

## U0 — Context Scan (BLOCKING — must be done FIRST)

- [ ] Page was READ before any styling began (Step 0.5 Phase 1)
- [ ] Existing palette, button styles, and container hierarchy were identified
- [ ] Component role was classified using Decision Matrix (Step 0.5 Phase 2)
- [ ] User was ASKED before choosing style (if ambiguous) or choice was justified by existing siblings
- [ ] Max 2 accent colors on the page — no 3rd accent introduced without approval
- [ ] New component matches sibling components of same role
- [ ] Phase 0 golden examples in `references/00-golden-examples.md` were consulted as reference
- [ ] Visual overrides applied via inline `style={{}}`, NOT CSS classes (Prettier rule)

---

## U1 — Shadow Depth (CRITICAL)

- [ ] Shadow layer count: Standard >= 5, Advanced >= 8, Hero >= 11. COUNT them.
- [ ] Shadow uses ONLY dark `rgba(0,0,0,...)` for ALL drop shadows (non-inset)
- [ ] NO colored drop shadows: no purple, amber, blue `0 Xpx Ypx rgba(color)` underneath elements
- [ ] Graduated blur progression: near shadows tight (2-4px), far shadows wide (16-32px)
- [ ] Started from golden-example, reference pattern, or Phase 0 component — NOT invented

---

## U2 — Light Source Consistency (CRITICAL)

- [ ] Single light direction (135deg) consistent across ALL components on the page
- [ ] Light and shadow are SEPARATE systems (not mixed in one confused stack)
- [ ] No pure white above 0.10: every `rgba(255,255,255,X)` with X>0.10 must be swapped to `rgba(255,240,220,X)` or warmer
- [ ] Edge catches at opacity 0.03-0.08 only. Glass/specular overlays max 0.20 with warm tint
- [ ] Surface gradient present for curvature (`linear-gradient(145deg, ...)`)

---

## U3 — 4-Layer Construction (HIGH)

- [ ] Physical object named explicitly ("machined aluminum", "Bakelite switch")
- [ ] 4-layer construction present: Chassis + Depth + Lighting + Detail
- [ ] Assembly order respected: depth BEFORE hardware
- [ ] Screws/rivets sit ON a surface with depth, not on flat div

---

## U4 — Hardware Placement (HIGH)

- [ ] Hardware placement realistic (screws at 4 corners if rectangle)
- [ ] Hardware uses radial gradients for beveled sphere effect (see SteelMountPlate)
- [ ] Torx/Phillips slots oriented consistently

---

## U5 — Interaction States (HIGH)

- [ ] hover, active, disabled, focus-visible all implemented
- [ ] Hover lifts (`hover:-translate-y-px`) with expanded shadow via React state
- [ ] Active depresses (`active:translate-y-px`) with compressed shadow
- [ ] Shadow stack CHANGES between states (not same for all)

---

## U6 — Physical Purpose (HIGH)

- [ ] Every CSS effect maps to a physical phenomenon (shadow=depth, gradient=curvature, highlight=reflection)
- [ ] No decorative-only effects — each layer represents a real physical property

---

## U7 — Typography as Surface (HIGH)

- [ ] Body text >= 13px, titles >= 14px, labels >= 12px, NOTHING below 10px
- [ ] Primary text opacity >= 0.85, secondary >= 0.5
- [ ] Labels use silkscreen (`text-shadow`) or engraved (clip + gradient) — NOT plain text
- [ ] Typography is a SURFACE treatment, not floating text
- [ ] Embossed/engraved text has enough contrast to be readable (min opacity 0.35 for tertiary, 0.5 for secondary)

---

## U8 — Accessibility (MEDIUM)

- [ ] WCAG contrast ratio OK for all text
- [ ] `focus-visible` present on all interactive elements
- [ ] Touch targets >= 44px
- [ ] `prefers-reduced-motion` respected
- [ ] `will-change` on animated elements
- [ ] `pointer-events-none` on texture overlays
- [ ] No `filter: blur()` in animations (use `opacity` + `transform` only)

---

## U9 — Benchmark Lessons (see `references/16-benchmark-lessons.md`)

- [ ] Display wells use inset shadows for depth, NOT borders (Section 16.13)
- [ ] Display wells have borderRadius: 0 (sharp CRT corners) + overflow: hidden (Section 16.12)
- [ ] All 5 display well overlays present: glass reflection, left-edge specular, content depth gradient, scanlines, color bleed (Section 16.17)
- [ ] Device cards have fixed dimensions (same across all variants) (Section 16.6)
- [ ] Component size proportional to content density (Section 16.11)
- [ ] Screw spacing >= 8px from any content element (Section 16.14)
- [ ] No unexplained light bars or glowing lines on chassis (Section 16.15)
- [ ] Glass reflection overlay present and visible on all display wells (Section 16.16)
- [ ] Color bleed = inset box-shadow in content color, NOT colored border (Section 16.1)
- [ ] Emboss labels >= 0.50 primary, >= 0.45 secondary, >= 0.35 tertiary (Section 16.3)

---

## Contrast Separation (CRITICAL — cross-cutting)

- [ ] Container/well backgrounds are DARKER than card backgrounds (>= #12 hex delta)
- [ ] Cards inside dark wells have reinforced top/left borders (opacity >= 0.09)
- [ ] No two nested elements share the same brightness level
