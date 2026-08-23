# Hallmark Study: Jobbers — AI Job Matching Landing Page

**Source Reference:** `https://dribbble.com/shots/27504183-Jobbers-AI-Job-Matching-Landing-Page`  
**Designer / Studio:** Haki Studio  
**Classification:** Designer Presentation Work / Public Inspiration (Soft-refusal applied)  
**Date:** 2026-08-23

---

## 1. Executive Summary & Refusal Notice

> **Attestation & Soft-Refusal Policy (`study.md` § Refusal):**  
> *Dribbble shots represent individual designers' signature presentation work. In accordance with Hallmark protocols, we extract design DNA only (macrostructure, tokens, typography roles, and layout archetypes) rather than copying signature decorative illustrations or pixel-for-pixel assets.*

A modern **Bento Grid / Workbench Hybrid** macrostructure featuring an asymmetric live UI preview hero, metric badges, skills tags, and salary benchmarks.

---

## 2. Structured Design DNA (Schema)

```json
{
  "source_mode": "url",
  "source_url": "https://dribbble.com/shots/27504183-Jobbers-AI-Job-Matching-Landing-Page",
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
    "archetype": "H8-Mockup-Split-Framed",
    "knobs": {
      "ratio": "7/5",
      "frame style": "minimal hairline glass card",
      "tilt": "0deg",
      "screenshot count": "1 live UI preview with matching score overlays"
    }
  },
  "pitch": {
    "archetype": "F1-Bento-Grid",
    "knobs": {
      "tiles": "6",
      "spans": "irregular (2x2 hero card, 1x2 analytics, 1x1 match badges)",
      "border": "hairline all"
    }
  },
  "nav": {
    "archetype": "N5-Floating-Pill",
    "knobs": {
      "position": "sticky-detached",
      "backdrop": "frosted glass blur",
      "actions": "Wordmark-left, 3 links, 1 primary action button"
    }
  },
  "footer": {
    "archetype": "Ft1-Mast-Headed",
    "knobs": {
      "style": "clean inline rule with tagline and concise link row"
    }
  },
  "display_role": "soft geometric sans",
  "display_face": "Plus Jakarta Sans / Geist Display",
  "body_role": "neutral grotesque",
  "body_face": "Inter / Geist",
  "label_role": "monospace",
  "label_face": "Geist Mono",
  "pairing_logic": "two families (geometric display + grotesque body + tabular mono labels)",
  "paper_band": "light >85",
  "paper_value": "oklch(98% 0.005 250)",
  "paper_hue": "neutral-cool",
  "accent_hue_band": "indigo",
  "accent_value": "oklch(58% 0.22 265)",
  "accent_footprint": "recurring 5-15%",
  "density": "medium",
  "asymmetry": "asymmetric-grid",
  "treatments": [
    "hairline-borders",
    "glassmorphism-cards",
    "data-metric-pills",
    "subtle-mesh-glow"
  ],
  "reveal": "fade-up",
  "motion_library": "framer-motion",
  "anti_patterns": [
    "purple-gradient-hero-blob",
    "card-in-card",
    "generic-3-column-grid",
    "transition-all",
    "vague-ai-copy"
  ]
}
```

---

## 3. Deep-Dive Design DNA Breakdown

### A. Macrostructure & Layout Sequence
- **Hero Structure:** Split layout with strong left alignment on value proposition ("Find Your AI-Matched Career") + dual inline action bar and right-side interactive match preview card.
- **Feature Flow:** 
  1. Primary Bento Tile: AI Matching Engine Preview with percentage compatibility radial/pill.
  2. Secondary Bento Tile: Salary Intelligence & Market Trends with micro bar chart.
  3. Tertiary Bento Tile: Instant 1-Click Application / Resume Scanner pill.
  4. Quaternary Bento Tile: Curated Skill Badges & Filters.

### B. Color Tokens (OKLCH System)
- `--color-paper`: `oklch(98% 0.005 250)` (`#F8FAFC`)
- `--color-surface`: `oklch(100% 0 0 / 0.8)` (`#FFFFFF`) with `backdrop-filter: blur(12px)`
- `--color-ink`: `oklch(20% 0.02 260)` (`#0F172A`)
- `--color-ink-muted`: `oklch(55% 0.02 260)` (`#64748B`)
- `--color-rule`: `oklch(91% 0.01 250)` (`#E2E8F0`)
- `--color-accent`: `oklch(58% 0.22 265)` (`#6366F1`)
- `--color-accent-success`: `oklch(72% 0.19 150)` (`#10B981`)
