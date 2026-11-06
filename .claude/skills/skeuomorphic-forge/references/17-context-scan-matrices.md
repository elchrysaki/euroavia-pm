# Context Scan — Decision Matrices

Extracted from SKILL.md STEP 0.5 Phase 2 & Phase 3. Use these matrices when classifying a component's role and choosing its visual tier.

---

## Button Decision Matrix

| Role                 | Visual weight                        | Shadow tier         | Gradient                              | Size                                  | When to use                               |
| -------------------- | ------------------------------------ | ------------------- | ------------------------------------- | ------------------------------------- | ----------------------------------------- |
| **CTA / Hero**       | Maximum — eye-catching, unique color | Advanced (8+)       | Bold themed gradient + shimmer/LED    | Large (48-56px height, 16px+ padding) | 1 per page max. Primary conversion action |
| **Primary action**   | High — solid, visible                | Standard (5+)       | Surface gradient matching page accent | Medium (40-44px height)               | Main actions: Save, Submit, Confirm       |
| **Secondary action** | Medium — understated solid           | Standard (5)        | Subtle surface gradient               | Medium (36-40px)                      | Alternative actions: Cancel, Back, Edit   |
| **Tertiary / Ghost** | Low — border only, no fill           | Minimal (2-3 inset) | None — transparent with border        | Small-Medium (32-40px)                | Minor actions: filters, toggles, options  |
| **Destructive**      | High — danger color                  | Standard (5+)       | Red gradient `#4a1010 → #2a0808`      | Medium (40-44px)                      | Delete, Remove, Reset                     |
| **Navigation**       | Low — text-like                      | None or minimal     | None                                  | Inline                                | Links, breadcrumbs, pagination            |

---

## Container Decision Matrix

| Role                  | Background                        | Shadow type              | Borders                                    | When to use                         |
| --------------------- | --------------------------------- | ------------------------ | ------------------------------------------ | ----------------------------------- |
| **Page section well** | `#08-#0e` (darkest)               | Inset 4-6 layers         | Subtle top border `rgba(255,255,255,0.04)` | Grouping related content            |
| **Card (floating)**   | `#1c-#28` (lighter than well)     | Drop shadow Standard 5+  | Top/left bevel, bottom/right dark          | Individual items inside wells       |
| **Nested card**       | `#14-#1c` (between well and card) | Drop shadow 3-5 layers   | Subtle border                              | Sub-items inside cards              |
| **Modal / overlay**   | `#1a-#22`                         | Hero 11+ (max drama)     | Strong bevel all sides                     | Overlays, dialogs, important panels |
| **Header / toolbar**  | Match page bg or slightly lighter | Standard 5 bottom shadow | Bottom border only                         | Navigation, controls                |

---

## PHYSICAL SIZE RULE — Cards as Hardware Panels

A skeuomorphic card represents a physical device (screen, gauge, instrument panel). Physical devices have FIXED dimensions — a CRT screen doesn't shrink when it shows less text.

**When rendering multiple instances of the same component** (e.g., 3 status cards with different states), ALL instances MUST have identical dimensions. Use explicit `width` + `height` (or `minWidth` + `minHeight`) in the container style.

```tsx
// CORRECT — fixed dimensions, content fills the space
<div style={{ width: 320, height: 280, overflow: "hidden" }}>
  {/* content adapts inside fixed frame */}
</div>

// WRONG — card shrinks/grows with content
<div style={{ padding: 16 }}>
  {/* variable height = not a physical device */}
</div>
```

**When rendering multiple variants** (e.g., 3 status cards: connected/disconnected/connecting), determine the dimensions from the variant with the MOST content. All other variants use the same dimensions — empty space stays empty, the chassis doesn't shrink.

**Disabled/inactive states** must also have the SAME dimensions as active states. A physical button doesn't get smaller when it's off.

**Content centering rule**: The main content (input, readout, display) must be visually CENTERED in the chassis. Labels and silkscreen marks are secondary — they don't push the primary content to the bottom or side. Use `display: flex; align-items: center; justify-content: center` on the chassis, with labels positioned absolutely or in thin header/footer zones. A frequency input with "3000 Hz" shoved to the bottom of a tall panel looks wrong — center it.

**When to apply**: any card/panel that represents a physical device, any button with active/disabled states. Not applicable to layout containers or flowing content.

---

## Special Elements

| Type            | Shadow tier          | Reference file          | Notes                            |
| --------------- | -------------------- | ----------------------- | -------------------------------- |
| Gauge / meter   | Advanced 8+          | `01-shadows-materials`  | Circular gradient, rim light     |
| CRT display     | Hero 11+ or Ultra 31 | `11-retro-industrial`   | Phosphor glow, scanlines         |
| Toggle / switch | Standard 5           | `02-hardware-animation` | Track recess + thumb raised      |
| Knob / dial     | Advanced 8+          | `08-metal-effects`      | Conic gradient, pointer          |
| LED indicator   | Standard 5           | `11-retro-industrial`   | Radial gradient, pulse animation |

---

## Phase 3 — When to ASK Before Choosing

**If the style choice is not obvious from context, ASK the user.** Present options based on the scan.

### When to ask:

| Situation                                 | Question format                                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New button, no clear role                 | "This button could be: (A) Primary action [amber gradient], (B) CTA hero [themed, with effects], (C) Ghost/subtle. Which fits?"                                           |
| New section, ambiguous hierarchy          | "This section should be: (A) A well/recess [dark, cards float inside], (B) A card panel [raised, lighter]. Which one?"                                                    |
| Page has no established theme             | "No theme detected. I propose: (A) Warm industrial [amber], (B) Cool steel [blue-grey], (C) [other based on context]. Which direction?"                                   |
| Multiple button styles already exist      | "The page already has [X] and [Y] button styles. This new button should: (A) Match the primary style, (B) Be a different tier [explain why], (C) Something new [propose]" |
| Building something that will be prominent | "This [component] will be visually prominent. I suggest [specific style + reasoning]. OK, or do you prefer something else?"                                               |

### When NOT to ask (just adapt):

- Page has a clear established theme -> match it
- Component role is unambiguous (e.g., "add a save button" -> primary action, match existing accent)
- User explicitly stated the style they want
- It's a standard card inside an existing well -> match sibling cards
