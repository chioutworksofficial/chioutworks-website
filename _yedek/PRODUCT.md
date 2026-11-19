# Product

## Register

brand

## Users

German, Turkish, English, and Greek-speaking business owners and decision-makers evaluating a solo consultant for automation, web development, AI integration, and digital strategy work. They land on this page from a referral, a proposal link, or a search for a specific service, and they're sizing up whether this person is credible enough to hire before ever talking to them. Mobile and desktop both matter; many arrive from a phone after a LinkedIn or email link.

## Product Purpose

Chioutworks Sinematik is Chousein Chiout's personal brand and service showcase. It exists to convert a cold visitor into a qualified lead: it explains what the six services are, proves competence through portfolio/case work, and ends in a contact action. Success is a visitor who understands the offer within one scroll and either books a call or sends an inquiry.

## Brand Personality

Premium and cinematic trust. Three words: **confident, crafted, cinematic**. The name itself ("Sinematik") is the brief — this should feel like a film's opening sequence translated into a service page: darker staged moments, deliberate light/shadow, camera-like scroll motion, not a flat SaaS brochure. Reference lane: agency/studio showreel sites (spotlight gradients, staged reveals, film-strip/camera-move transitions) rather than Apple-style product-page minimalism or dashboard/glass-panel futurism.

## Anti-references

- Generic SaaS landing page cliches: identical icon+heading+text card grids, hero-metric stat rows, tiny uppercase eyebrows on every section, numbered 01/02/03 scaffolding on every section.
- Flat, static sections with no sense of depth or staged lighting — the opposite of "sinematik."
- Glassmorphism as decoration without purpose (the codebase already has a deliberate `.liquid-glass` system; don't add more glass panels beyond what that system does with intent).
- Gradient text for emphasis, side-stripe borders on cards.
- Cold/neon futuristic dashboard aesthetic — this is a warm cream-and-lime brand, not a dark SaaS tool.

## Design Principles

1. **Stage every section like a scene, not a block.** Depth (layered shadow, gradient light, parallax) and a staged reveal on scroll are the default, not an occasional flourish.
2. **One accent, used with intent.** Lime (`--color-lime-300/400`) is the single moment of color against the cream/ink system — reserve it for the true focal point per section, not decoration everywhere.
3. **Motion has a camera behind it.** Prefer moves that read as camera pans, dolly-ins, or focus pulls (subtle scale + perspective + parallax) over generic fade-ups.
4. **Never break what's proven.** Preserve the Hero, Navbar, and PortfolioSection untouched — Portfolio is explicitly out of scope for this redesign (it already showcases project work well). Preserve the i18n pattern (`T[lang]` in `src/translations.ts`), preserve the existing token system in `src/styles/theme.css` — extend it, don't fork it.
5. **Cinematic never costs clarity.** Every staged effect must still resolve to readable copy and an obvious next action; this is a lead-gen page first, a showreel second.

## Accessibility & Inclusion

WCAG AA as the floor: body text ≥4.5:1 contrast, large text ≥3:1, visible focus states on every interactive element. Full `prefers-reduced-motion` support is required — every parallax/tilt/staged-reveal effect needs a crossfade-or-instant fallback, not just a disabled flourish. Multilingual content (TR/EN/DE/EL) must not break layout or truncate at any length variation.
