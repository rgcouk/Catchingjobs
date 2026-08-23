# Hallmark Study: AxionPay — Digital Payments Website

**Source Reference:** `https://dribbble.com/shots/27671167-AxionPay-Digital-Payments-Website`  
**Designer / Attribution:** yscale studio  
**Classification:** Designer Presentation Work / Public Inspiration (Soft-refusal applied)  
**Date:** 2026-08-23

---

## 1. Executive Summary & Refusal Notice

> **Attestation & Soft-Refusal Policy (`study.md` § Refusal):**  
> *Dribbble shots represent individual designers' signature presentation work. In accordance with Hallmark protocols, we extract design DNA only (macrostructure, tokens, typography roles, and layout archetypes) rather than copying signature decorative illustrations or pixel-for-pixel assets.*

A dark-mode high-contrast **Bento Grid / Workbench** macrostructure pairing obsidian background tones with neon emerald telemetry metrics and direct API code blocks.

---

## 2. Structured Design DNA (Schema)

```json
{
  "source_mode": "url",
  "source_url": "https://dribbble.com/shots/27671167-AxionPay-Digital-Payments-Website",
  "source": "public-reference",
  "refusal": "soft-refusal (signature work)",
  "remote_safety": {
    "public_web_url": true,
    "scheme": "https",
    "ip_literal_detected": false,
    "redirects_checked": "true",
    "fetched": ["html", "presentation-metadata"],
    "scripts_ignored": true,
    "prompt_injection_detected": false
  },
  "macrostructure": "Bento Grid",
  "macrostructure_alt": "Workbench",
  "hero": {
    "archetype": "H2-Split",
    "knobs": {
      "ratio": "7/5",
      "right side": "interactive-payment-card-and-live-telemetry-layer",
      "divider": "negative space"
    }
  },
  "pitch": {
    "archetype": "F1-Bento-grid",
    "knobs": {
      "tiles": "6",
      "spans": "irregular (2x2 primary stat, 2x1 FX ticker, 1x1 security shield, 1x2 payment rail flow)",
      "accent": "corner-metric-and-live-indicator"
    }
  },
  "nav": {
    "archetype": "N5-Floating pill",
    "knobs": {
      "backdrop": "frosted glass blur",
      "action": "contained high-contrast pill button",
      "border": "hairline oklch(30% 0.03 260 / 0.4)"
    }
  },
  "footer": {
    "archetype": "Ft3-Index columns",
    "knobs": {
      "columns": "4",
      "heading style": "monospace",
      "bullet": "none"
    }
  },
  "display_role": "heavy geometric modern sans",
  "display_face": "Clash Display / Syne / Plus Jakarta Sans (candidate)",
  "body_role": "neutral grotesque",
  "body_face": "Geist / Inter (candidate)",
  "label_role": "monospace",
  "label_face": "Geist Mono / JetBrains Mono (candidate)",
  "pairing_logic": "three families (geometric display + neutral grotesque body + monospace tabular labels)",
  "paper_band": "dark <30",
  "paper_value": "oklch(14% 0.02 260) (#0c0e14)",
  "paper_hue": "neutral-cool",
  "accent_hue_band": "green",
  "accent_value": "oklch(82% 0.22 145) (#34f58c)",
  "accent_footprint": "recurring 5-15%",
  "density": "medium",
  "asymmetry": "asymmetric-grid",
  "treatments": [
    "dark-elevation-lightness",
    "hairline-rules",
    "tabular-financial-telemetry",
    "glass-backdrop-blur",
    "pill-badges"
  ],
  "reveal": "fade-up",
  "motion_library": "framer-motion",
  "anti_patterns": [
    "purple-gradient-hero",
    "generic-3-column-uniform-feature-grid",
    "floating-3d-crypto-coins-slop",
    "transition-all"
  ]
}
```

---

## 3. Deep-Dive Design DNA Breakdown

### A. Color Palette & Token Architecture
- **Paper (Background Substrate):** Deep cool obsidian dark mode `oklch(14% 0.02 260)` (`#0c0e14`).
- **Elevated Surfaces / Containers:** Layered slate card backgrounds `oklch(19% 0.025 260)` (`#161922`) bordered with hairline rules `oklch(28% 0.03 260 / 0.5)`.
- **Primary Ink:** Crisp Chalk `oklch(98% 0.005 260)` (`#f8fafc`) for headings and metrics.
- **Secondary Ink:** Muted Slate `oklch(70% 0.02 260)` (`#94a3b8`) for body descriptions.
- **Accent (Brand Anchor):** Electric Mint/Neon Green `oklch(82% 0.22 145)` (`#34f58c`) at ~7% footprint across primary action pills, success indicators, and positive currency differentials.

### B. Typography Roles & Pairing
- **Display Role (Headings):** Heavy geometric modern sans (tight letter spacing `-0.03em`, 700/800). Candidates: **Clash Display**, **Syne**, or **Plus Jakarta Sans**.
- **Body Role (Prose):** Neutral grotesque (15–16px, relaxed leading 1.6). Candidates: **Geist** or **Inter**.
- **Metadata / Telemetry Role:** Monospace with tabular numbers (`font-variant-numeric: tabular-nums`). Candidates: **Geist Mono** or **JetBrains Mono**.
