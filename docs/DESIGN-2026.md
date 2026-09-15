# DESIGN.md — OpenDesign Design System Specification
**Project**: `catchingjobs-brand-2026`  
**Standard**: OpenDesign Design System v2.0

---

## Design Tokens

```css
:root {
  /* Brand Primary */
  --color-brand: #FFCC00;
  --color-brand-hover: #FFE066;
  --color-brand-glow: rgba(255, 204, 0, 0.25);
  --color-brand-muted: #E5B800;

  /* Neutrals & Surfaces */
  --color-obsidian-950: #06080E;
  --color-obsidian-900: #090D14;
  --color-obsidian-800: #121722;
  --color-obsidian-700: #1A2232;
  --color-obsidian-600: #263147;
  --color-border-dark: #1E2738;
  --color-border-light: #E2E8F0;
  --color-surface-white: #FFFFFF;
  --color-surface-subtle: #F8FAFC;

  /* Accents */
  --color-accent-emerald: #10B981;
  --color-accent-amber: #F59E0B;
  --color-accent-sky: #0EA5E9;

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Elevation */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-card: 0 4px 20px -2px rgba(9, 13, 20, 0.08);
  --shadow-card-dark: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
  --shadow-brand: 0 8px 25px -4px rgba(255, 204, 0, 0.35);

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

---

## Component Anatomy

### 1. The Monogram Wordmark (`#chicken-c-mark`)
- Monogram height: 32px to 48px.
- Docked seamlessly into bold geometric sans text "atchingJobs" with negative tracking (`letter-spacing: -0.04em; margin-right: -2px;`).
- Trailing period styled in `--color-brand` (`#FFCC00`).

### 2. High-Contrast Division Cards
- Split 2-column or 2-row layout separating **Broiler Harvesting** and **Seasonal Turkey**.
- Dark obsidian base (`#090D14`) with Cadmium Yellow typography and badges.
- Technical stat badges (`£650-£950/wk`, `40-48h/wk`, `Permanent Year-Round`) in monospaced badge capsules.
- Minimal vector background illustrations with subtle parallax or hover scale (`scale: 1.02`).

### 3. Feature Value Pillars
- White surface or elevated dark surface cards with 1px border.
- Vector icon badges (64x64px) with high-contrast dual-tone Cadmium Yellow and Deep Obsidian fills.
- Clear structural benefits: "Door-to-Door Transport", "Guaranteed Friday BACS", "Lantra Animal Welfare", "Free Quality PPE".

### 4. Interactive Regional Route Map
- Visual display of key operational regions across England:
  - Lincolnshire (Boston, Lincoln, Grantham, Spalding)
  - Norfolk & Suffolk (Norwich, King's Lynn, Diss, Bury St Edmunds)
  - Yorkshire & Humber (York, Hull, Selby)
  - West Midlands & Shropshire (Shrewsbury, Telford, Hereford)
- Live indicator of active heated minibus routes.

### 5. Instant 60-Second Application Flow
- High-conversion minimal form: Full Name, UK Mobile Number, Home Postcode, Preferred Division (Broiler / Turkey / Both).
- Immediate confirmation modal with instant SMS dispatch notification.
