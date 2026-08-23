# Design — CatchingJobs (Pullum Ltd)

Locked design system for Catchingjobs.co.uk. Future Hallmark runs and AI agents read this file first; public pages and UI components defer to it. Amend intentionally — the file is the rule.

---

## System

- **Brand**: Catchingjobs.co.uk (Operated by Pullum Ltd)
- **Genre**: Modern-Minimal / Clean Agricultural Trade SaaS (grounded in Dribbble Design DNA References 23963312, 19351493, 16062197, 27504183)
- **Primary Macrostructures**: Bento Grid (`bento-grid`), Split Diptych Hero (`h2-split-diptych`), Numbered Stat Strip (`t4-stat-strip`), Structured Index Footer (`ft3-structured-footer`)
- **Theme**: Clean Modern Minimal Trade
- **Axes**:
  - **Paper band**: Crisp Light Slate Canvas (`--color-paper`: `#F8FAFC` / `oklch(98.5% 0.005 240)`), Pure White Surfaces (`#FFFFFF`) with precise 1px hairline borders (`#E2E8F0` / `oklch(92% 0.005 260)`).
  - **Display style**: Clean Bold Sans (`Plus Jakarta Sans`, 700 bold, tracking `-0.03em`)
  - **Body style**: Readable Neutral Sans (`Inter`, 400/500, leading relaxed `1.55`)
  - **Mono style**: Tabular Monospace (`JetBrains Mono` / `Geist Mono`, 500 medium, uppercase tracking `+0.04em`)
  - **Accent hue**: Disciplined Emerald Green (`#059669` / `oklch(62% 0.17 150)`) as primary anchor action & compliance badge, paired with Harvest Orange (`#EA580C` / `oklch(65% 0.18 45)`) for Friday payroll highlights (≤ 6% total viewport footprint).

---

## Component Boundaries (Critical Architecture)

1. **Public Marketing & Regional Landers** (`src/pages/landers/*`, `src/pages/Index.tsx`):
   - **MUST** enforce the clean minimal OKLCH / Slate tokens, hairline borders, and disciplined green/orange accents.
   - Zero faux 3D bloat, zero hyperbolic marketing slop copy, zero decorative serif headings.
2. **Internal Portals, Auth & Dashboards** (`src/pages/admin/*`, `src/pages/portals/*`, `src/pages/wizard/*`):
   - **MUST** use **shadcn/ui** components (`@/components/ui/`) with standard dashboard variables.
   - Do NOT mix public marketing styling into internal operational tables or kanban boards.

---

## Tokens (Canonical Source of Truth)

```css
:root {
  /* Clean Minimal Slate & Trade Palette */
  --color-paper: oklch(98.5% 0.005 240);     /* Crisp light slate canvas (#F8FAFC) */
  --color-surface: #FFFFFF;                  /* Elevated crisp white card surfaces */
  --color-rule: oklch(92% 0.005 260);        /* 1px hairline card borders (#E2E8F0) */
  --color-ink: oklch(20% 0.02 260);          /* High-contrast deep slate ink (#0F172A) */
  --color-ink-muted: oklch(52% 0.02 260);    /* Secondary muted slate (#64748B) */
  --color-accent-green: oklch(62% 0.17 150); /* Emerald Green (#059669) */
  --color-accent-orange: oklch(65% 0.18 45); /* Harvest Orange (#EA580C) */
  --color-focus: oklch(62% 0.17 150);

  /* Typography Stack */
  --font-display: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
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
  --dur-fast: 150ms;
  --dur-base: 220ms;

  /* Radii */
  --radius-card: 16px;   /* Clean rounded card corners */
  --radius-pill: 9999px; /* Status tags & badges */
  --radius-input: 8px;   /* Crisp form inputs */
}
```

---

## Typography & Copy Rules

1. **Clean Display Headlines**:
   - Display headlines use `Plus Jakarta Sans` in weight 700 with letter-spacing `-0.03em`.
   - Never use serif display fonts or italicized headers.
2. **Utilitarian Agricultural Copy**:
   - Write factual, direct, and authoritative copy centered on real agricultural logistics.
   - Mention legitimate compliance credentials: **Lantra Level 2 Animal Welfare**, **GLAA Licensed**, **AHVLA Certified**, **Weekly Friday Payroll**, and **Door-to-door minibus transport**.
   - No hyperbolic marketing buzzwords (*"seamless synergy"*, *"revolutionary platform"*, *"10x faster"*).

---

## CTA Voice & Interactive States

- **Primary Action**: Solid Emerald Green (`bg-[#059669] hover:bg-[#047857] text-white`), clean rounded corners (`rounded-lg`), uppercase tracking-wider font-mono text.
- **Secondary Action**: White Card Hairline (`border border-[#E2E8F0] bg-white hover:border-[#0F172A] text-[#0F172A]`).
- **8-State Coverage**: All interactive inputs and buttons must implement styling for: `default`, `hover`, `:focus-visible`, `:active`, `disabled`, `loading`, `error`, and `success`.
- **Touch Target Floor**: All clickable controls must maintain >= 44px touch targets.
