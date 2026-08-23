# Design — CatchingJobs (Pullum Ltd)

Locked design system for Catchingjobs.co.uk. Future Hallmark runs and AI agents read this file first; public pages and UI components defer to it. Amend intentionally — the file is the rule.

---

## System

- **Brand**: Catchingjobs.co.uk (Operated by Pullum Ltd)
- **Genre**: Editorial / Utilitarian Agricultural Trade
- **Primary Macrostructures**: Stat-Led (`h4-stat-led`), Marquee Hero (`h1-marquee`), Tabular Spec (`f3-tabular-spec-sheet`)
- **Theme**: Custom — Earth Exponential (`custom-earth-terracotta`) & Hum (`theme: hum` - Playful, Vibrant, Alive)
- **Axes**:
  - **Paper band**: Light Cream (`--color-paper` L = 96–97%) with Warm Tinted Paper 2 (`--color-paper-2` L = 92–94%)
  - **Display style**: Plus Jakarta Sans (600/700 rounded humanist display) & Instrument Serif (roman classical)
  - **Accent hue**: Multi-Accent (Pear-Yellow `#F5C842` / Sky-Cyan `#38BDF8` / Coral-Red `#F43F5E` / Mint `#10B981`) paired with near-black ink (`oklch(20% 0.012 250)`)

---

## Component Boundaries (Critical Architecture)

1. **Public Marketing & Regional Landers** (`src/pages/landers/*`, `src/pages/Index.tsx`, `src/pages/landers/HallmarkBrandDemo.tsx`):
   - **MUST** enforce the Hallmark OKLCH design tokens and anti-AI-slop typography below.
   - Zero faux UI chrome, zero hyperbolic slop copy, zero italic headers.
2. **Internal Portals, Auth & Dashboards** (`src/pages/admin/*`, `src/pages/portals/*`, `src/pages/wizard/*`):
   - **MUST** use **shadcn/ui** components (`@/components/ui/`) with standard dashboard variables.
   - Do NOT mix Hallmark editorial styling into internal operational tables or kanban boards.

---

## Tokens (Canonical Source of Truth)

```css
:root {
  /* Hallmark · Earth Exponential OKLCH Palette */
  --color-paper: oklch(96% 0.02 80);        /* Warm bone/linen background canvas */
  --color-paper-2: oklch(92% 0.03 80);      /* Tinted container / card background */
  --color-ink: oklch(25% 0.03 120);         /* Deep charcoal earth ink (primary) */
  --color-ink-2: oklch(45% 0.04 120);       /* Muted agricultural graphite ink */
  --color-rule: oklch(80% 0.03 80);         /* Subtle hairline dividing rule */
  --color-accent: oklch(55% 0.12 40);       /* Rich terracotta / harvest amber */
  --color-accent-ink: oklch(98% 0.01 80);   /* Contrast ink on accent fill */
  --color-focus: oklch(65% 0.15 45);        /* High-visibility focus ring */

  /* Typography Stack */
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  /* Spacing Scale (4-pt grid) */
  --space-3xs: 2px;
  --space-2xs: 4px;
  --space-xs:  8px;
  --space-sm:  12px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;

  /* Motion & Easing */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 180ms;
  --dur-base: 240ms;
  --dur-slow: 320ms;

  /* Radii */
  --radius-card: 0px;    /* Utilitarian crisp slab borders */
  --radius-pill: 9999px; /* Status tags & badges */
  --radius-input: 2px;   /* Clean input containers */
}
```

---

## Typography & Copy Rules

1. **Upright Display Headlines**:
   - `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, and `.font-display` must always render with `font-style: normal`.
   - Never use italic display fonts or italicized emphasis tags (`<em>`) inside headings.
2. **Utilitarian Agricultural Copy**:
   - Write factual, direct, and authoritative copy centered on real agricultural logistics.
   - Mention legitimate compliance credentials: **Lantra Level 2 Animal Welfare**, **GLAA Licensed**, **AHVLA Certified**, **Weekly Friday Payroll**, and **Door-to-door crew transport**.
   - No hyperbolic marketing buzzwords (*"seamless synergy"*, *"revolutionary platform"*, *"10x faster"*).

---

## CTA Voice & Interactive States

- **Primary Action**: Solid Dark Ink (`bg-[var(--color-ink)]`) or Terracotta Accent (`bg-[var(--color-accent)]`), sharp corners (`rounded-none` or `rounded-sm`), uppercase tracking-wide label.
- **Secondary Action**: Outlined Hairline (`border border-[var(--color-ink)] bg-[var(--color-paper)]`), transitions to `bg-[var(--color-rule)]` on hover.
- **8-State Coverage**: All interactive inputs and buttons must implement styling for: `default`, `hover`, `:focus-visible`, `:active`, `disabled`, `loading`, `error`, and `success`.
- **Touch Target Floor**: All clickable controls must maintain >= 48px touch targets.

---

## Motion Stance

- **Motion-on stance**: Subtle microinteractions using `--ease-out` (<= 240ms).
- **Accessible motion**: Enforce `@media (prefers-reduced-motion: reduce)` with <= 150ms simple opacity crossfades.

---

## Exports & Integrations

- **Tailwind CSS v4**: Bound in `src/index.css` under `@theme`.
- **shadcn/ui**: Integrated for dashboard sidebars, dialogs, and kanban cards without polluting public lander tokens.
