# Design — Catchingjobs

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
modern-minimal

## Macrostructure family
Pick one base macrostructure for marketing pages, one for app pages, one for
content pages (if applicable). Pages within a family share the family's shape;
they vary only in component archetypes.

- Marketing pages: Marquee Hero + N5 Floating Pill Nav + Ft1 Mast-headed
- App pages:       Workbench + N13 Inline ⌘K-pill Nav + Ft4 Dense Colophon
- Content pages:   Long Document + N5 Floating Pill Nav + Ft6 Letter Close

## Theme
- `--color-paper`   oklch(99% 0.01 260) /* Off-white */
- `--color-paper-2` oklch(96% 0.01 260) /* Gray-cool */
- `--color-ink`     oklch(25% 0.06 260) /* Navy */
- `--color-ink-2`   oklch(45% 0.05 260) /* Slate/Light Navy */
- `--color-rule`    oklch(92% 0.01 260) /* Border */
- `--color-accent`  oklch(65% 0.2 45)   /* Orange */
- `--color-focus`   oklch(65% 0.2 45)   /* Orange */

## Typography
- Display: Lora, weight 600, normal (no italics)
- Body:    Inter, weight 400
- Mono:    JetBrains Mono, weight 500
- Display tracking: -0.02em
- Type scale anchor: --text-display = clamp(2.5rem, 5vw, 4rem)

## Spacing
4-point named scale. The values are in `index.css`. Pages must use named
classes or vars, never raw values.

## Motion
- Easings: cubic-bezier(0.16, 1, 0.3, 1) named `--ease-out`
- Reveal pattern: none (content just appears instantly)
- Reduced-motion fallback: opacity-only, ≤ 150 ms.

## Microinteractions stance
- silent success (no celebratory toasts for normal actions)
- hover delay 800 ms · focus delay 0 ms
- buttons shift color instantly on hover, no bounce scaling

## CTA voice
- Primary CTA: Solid background, sharp corners (radius-sm), short clear verb.
- Secondary CTA: Transparent background, hairline border, subtle hover.

## Per-page allowances
- Marketing pages MAY use enrichment (Tier-B SVG).
- App pages MUST NOT use enrichment — function carries the page.
- Content pages: typography only.

## What pages MUST share
- The wordmark / logotype.
- The accent colour and its placement (≤ 5 % per viewport).
- The display + body fonts.
- The CTA voice (button shape, border-radius, padding rhythm).
- Section heading rhythm (single column, no eyebrows).

## What pages MAY differ on
- Macrostructure within the page-type family
- Hero archetype (within the family's allowance).
