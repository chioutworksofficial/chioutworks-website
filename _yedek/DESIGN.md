---
name: Chioutworks Sinematik
description: Premium, cinematic personal-brand site for automation, web development, AI integration, and digital strategy services.
colors:
  cream-stage:      "#f5f5f2"
  paper-raised:     "#fbfbf8"
  stage-shadow:     "#eceee9"
  card-edge:        "#dee2de"
  pill-edge:        "#d8dcd8"
  ink:              "#262323cc"
  ink-strongest:    "#1a1818f0"
  ink-strong:       "#262323e0"
  ink-muted:        "#262323a0"
  ink-faint:        "#26232360"
  spotlight-lime:   "#bbf451"
  spotlight-lime-deep: "#9ee82a"
  lime-tint:        "#f0ffd4"
  success-signal:   "#2da44e"
  clay-accent:      "#8c5a4a"
  film-black:       "#070611"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  sm: "10px"
  md: "20px"
  lg: "28px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  section-y: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink-strongest}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  button-lime:
    backgroundColor: "{colors.spotlight-lime}"
    textColor: "#1a1a1a"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  card-scene:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.md}"
    padding: "32px"
---

# Design System: Chioutworks Sinematik

## 1. Overview

**Creative North Star: "The Screening Room"**

The site is a projection surface, not a brochure. Content arrives the way a scene arrives in a film: staged with light, given room to breathe, then held in a beat before the next cut. The base is a warm, matte cream stage — not white, not sand-default — with a single spotlight color, lime, reserved for the one thing per scene the visitor should focus on. Depth is a lighting choice (soft layered shadow, gradient falloff, a hint of parallax as the "camera" scrolls past), not a UI decoration.

This system explicitly rejects the flat SaaS-brochure look: no identical icon-card grids marching down the page, no tiny uppercase eyebrow stamped above every section, no numbered 01/02/03 scaffolding used as decoration rather than an actual sequence. It also rejects cold neon-dashboard futurism — this is a warm, matte, tactile stage, not a glass control panel.

**Key Characteristics:**
- Matte cream stage (`#f5f5f2`) with raised paper surfaces (`#fbfbf8`), never stark white
- One spotlight accent (lime `#bbf451`) used sparingly and deliberately per section
- Depth via layered shadow + soft gradient light, not flat cards
- Scroll motion reads as camera movement: dolly-in, parallax drift, focus pull — not generic fade-ups
- Dark "film-black" (`#070611`) reserved for staged, cinematic moments (video, spotlighted CTAs), not the whole page

## 2. Colors

The palette is a matte cream stage lit by a single lime spotlight, with a rare dark "sound stage" register for staged cinematic moments.

### Primary
- **Spotlight Lime** (`#bbf451`): the one accent color. Used for the true focal point of a section — a primary CTA, an active state, a single highlighted word or icon. Never more than one spotlight moment per screen.
- **Spotlight Lime Deep** (`#9ee82a`): hover/pressed state for lime elements, and gradient partner for `.text-gradient-lime` / `.glow-lime`.

### Neutral
- **Cream Stage** (`#f5f5f2`): page background. The matte floor everything sits on.
- **Paper Raised** (`#fbfbf8`): card and panel surfaces, one step lighter than the stage — reads as a lit surface, not a separate color.
- **Stage Shadow** (`#eceee9`): recessed/darker surface for nested depth (rare; reserve for genuine recession, not every alt row).
- **Card Edge** (`#dee2de`) / **Pill Edge** (`#d8dcd8`): hairline borders. Always 1px, never a colored stripe.
- **Ink Strongest** (`#1a1818f0`) / **Ink Strong** (`#262323e0`): headline and primary body text.
- **Ink Muted** (`#262323a0`) / **Ink Faint** (`#26232360`): secondary copy, captions, disabled states.
- **Film Black** (`#070611`): the "sound stage" register — video sections, night-mode CTA panels. Used only where the brief calls for a genuinely dark cinematic beat, not as a general dark-mode surface.
- **Clay Accent** (`#8c5a4a`): rare warm secondary, for illustration/texture accents only — not for interactive elements.
- **Success Signal** (`#2da44e`): status/active indicators (the `.lime-dot`), not decorative.

### Named Rules
**The One Spotlight Rule.** Lime appears once per section as the true focal point — a button, an active indicator, a single accent shape. If two elements in the same viewport are lime, pick one and drop the other to ink or neutral.

**The Matte Rule.** No pure white (`#fff`) surfaces except hover states already defined in the existing card/button system. Everything at rest sits on cream or paper, never stark white.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with system sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono

**Character:** A single confident geometric sans carries the whole system — weight and size contrast do the work of hierarchy instead of competing typefaces. Mono is reserved for small mechanical labels (eyebrows, stat units, code-like fragments), which is exactly the kind of detail that reads as "crafted" rather than "templated."

### Hierarchy
- **Display** (800, `clamp(2.75rem, 6vw, 4.5rem)`, 1.02, -0.04em): section headlines that need to land like a title card.
- **Headline** (700, `clamp(1.75rem, 3vw, 2.5rem)`, 1.1, -0.03em): sub-section and card cluster titles.
- **Title** (700, 20–24px, 1.2, -0.02em): individual card/item titles.
- **Body** (400, 16px, 1.6, -0.01em, 65–75ch max): descriptive copy, always on ink-strong or ink-muted, never ink-faint.
- **Label** (600, 11px, 0.12em, uppercase, IBM Plex Mono): short mechanical tags only — badge text, stat units. Not a per-section eyebrow kicker.

### Named Rules
**The No-Repeat-Kicker Rule.** Uppercase mono labels are for badges and stat units, not a tiny tracked eyebrow stamped above every section heading. If every section has one, cut it to a handful of deliberate uses.

## 4. Elevation

Hybrid: mostly flat matte surfaces, with layered ambient shadow used deliberately to stage a scene (a card that's "in focus" lifts; the stage around it stays flat). Depth is also carried by gradient light (radial spotlight glows, soft vignettes) and, on scroll, subtle parallax/perspective — not just `box-shadow`.

### Shadow Vocabulary
- **Card rest** (`0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)`): default card elevation, barely-there.
- **Card focus/hover** (`0 4px 12px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.07)`): the "in focus" state — used when a card is hovered, active, or is the section's spotlighted item.
- **Lime glow** (`0 0 20-40px rgba(187,244,81,0.25-0.4), 0 0 60-80px rgba(187,244,81,0.1-0.2)`): reserved for the spotlighted lime element only (`.glow-lime`).
- **Button** (`0 1px 2px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)`): interactive element rest state.

### Named Rules
**The Staged-Lift Rule.** Only the element currently "in focus" (hovered, active, or the section's one spotlighted item) gets the heavier shadow + lift. Everything else stays at rest elevation — a page where everything lifts is a page where nothing does.

## 5. Components

### Buttons
- **Shape:** 10px radius (`.btn-primary`, `.btn-secondary`, `.btn-lime`)
- **Primary:** ink-strongest background, white text, button shadow, lifts 1px + darkens on hover
- **Lime:** spotlight-lime background, near-black text, lime glow shadow, deepens to lime-deep on hover — the "this is the one action" button
- **Secondary:** paper-raised background, card-edge border, lifts to white on hover

### Cards
- **Corner Style:** 20-28px radius, generous — cinematic framing, not tight app-UI corners
- **Background:** paper-raised at rest
- **Shadow Strategy:** card-rest → card-focus/hover per the Staged-Lift Rule
- **Border:** 1px card-edge, full border only, never a colored side-stripe
- **Internal Padding:** 24-32px

### Liquid Glass (signature, use sparingly)
The existing `.liquid-glass` / `.liquid-glass-strong` system (subtle blur, inset highlight border) is the one place transparency is allowed — reserved for staged dark/video moments, not applied as decoration on ordinary cream cards.

### Navigation
Existing Navbar is out of scope for this redesign; treat its type scale and link treatment (`.nav-link`) as the reference for any new nav-adjacent element.

## 6. Do's and Don'ts

### Do:
- **Do** stage one lime spotlight per section and let everything else stay neutral (The One Spotlight Rule).
- **Do** use layered ambient shadow + gradient light to create depth, and reserve the heavier "focus" shadow for the element actually in focus (The Staged-Lift Rule).
- **Do** treat scroll motion as camera movement — parallax drift, scale/perspective on reveal, focus-pull timing — using the existing `cubic-bezier(0.22, 1, 0.36, 1)` ease already established in `hero-enter` and `progress-fill`.
- **Do** keep every animation's `prefers-reduced-motion` fallback (crossfade or instant), per PRODUCT.md's accessibility requirement.
- **Do** keep body copy on ink-strong/ink-muted at ≥4.5:1 contrast against cream/paper.

### Don't:
- **Don't** ship identical icon+heading+text card grids repeated section after section (PRODUCT.md anti-reference: "generic SaaS landing page cliches").
- **Don't** add a tiny uppercase tracked eyebrow above every section, or numbered 01/02/03 markers as decoration (PRODUCT.md anti-reference).
- **Don't** use gradient text for emphasis or a colored `border-left`/`border-right` stripe on cards (PRODUCT.md anti-reference).
- **Don't** add glassmorphism panels beyond the existing deliberate `.liquid-glass` system (PRODUCT.md anti-reference).
- **Don't** shift the whole page toward a cold neon-dashboard dark mode; `film-black` is a rare staged register, not the new base (PRODUCT.md anti-reference).
- **Don't** touch Hero, Navbar, or PortfolioSection — they're explicitly out of scope.
