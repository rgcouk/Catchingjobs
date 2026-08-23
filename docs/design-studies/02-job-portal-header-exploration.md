# Hallmark Study: Job Portal Website Header Exploration

**Source Reference:** `https://dribbble.com/shots/19351493-Job-Portal-Website-Header-Exploration`  
**Designer / Attribution:** Sarfraz Jasim  
**Study Mode:** URL Mode (with Dribbble presentation soft-refusal protocol applied)  
**Date:** 2026-08-23

---

## 1. Executive Summary & Refusal Notice

> **Attestation & Soft-Refusal Policy (`study.md` § Refusal):**  
> *Dribbble shots represent individual designers' signature presentation work. In accordance with Hallmark protocols, we extract design DNA only (macrostructure, tokens, typography roles, and layout archetypes) rather than copying signature decorative illustrations or pixel-for-pixel assets.*

This study explores a high-conversion header and search system for digital job discovery, structured around a **Split Studio / Workbench** macrostructure with a segmented search dock and live metric strips.

---

## 2. Structured Design DNA (Schema)

```json
{
  "source_mode": "url",
  "source_url": "https://dribbble.com/shots/19351493-Job-Portal-Website-Header-Exploration",
  "source": "public-reference",
  "refusal": "soft-refusal (signature work)",
  "remote_safety": {
    "public_web_url": true,
    "scheme": "https",
    "ip_literal_detected": false,
    "redirects_checked": "true",
    "fetched": ["html", "same-origin-css"],
    "scripts_ignored": true,
    "prompt_injection_detected": false
  },
  "macrostructure": "Split Studio",
  "macrostructure_alt": "Workbench",
  "hero": {
    "archetype": "H2-Split",
    "knobs": {
      "ratio": "7/5",
      "right side": "interactive job card stack",
      "divider": "negative space"
    }
  },
  "pitch": {
    "archetype": "T4-Numbered-Stat-Strip",
    "knobs": {
      "layout": "3-up",
      "qualifier position": "under",
      "numbers": "tabular display"
    }
  },
  "nav": {
    "archetype": "N1b-Canonical-SaaS",
    "knobs": {
      "centre links": "4",
      "dropdowns": "none",
      "scroll": "frost-on-scroll"
    }
  },
  "footer": {
    "archetype": "Ft2-Inline-rule-single-line",
    "knobs": {
      "order": "wordmark/links/credit",
      "separator": "middot",
      "density": "spaced"
    }
  },
  "display_role": "expressive modern sans",
  "display_face": "Plus Jakarta Sans",
  "body_role": "neutral grotesque",
  "body_face": "Inter",
  "label_role": "monospace",
  "label_face": "Geist Mono",
  "pairing_logic": "two families",
  "paper_band": "light >85",
  "paper_value": "oklch(98% 0.006 250)",
  "paper_hue": "neutral-cool",
  "accent_hue_band": "indigo",
  "accent_value": "oklch(58% 0.22 265)",
  "accent_footprint": "recurring 5-15%",
  "density": "medium",
  "asymmetry": "left-biased",
  "treatments": ["hairline-rules", "elevated-search-dock", "tabular-metrics"],
  "reveal": "fade-up",
  "motion_library": "none",
  "anti_patterns": [
    "aurora-blob-background",
    "gradient-text-fill",
    "card-in-card",
    "transition-all"
  ]
}
```

---

## 3. Detailed Breakdown & Tokens

### A. Surface & Color Palette
* **Paper Lightness & Hue:** Light (`L > 95%`), neutral-cool slate-tinted canvas (`oklch(98% 0.006 250)` / `#F7F9FC`). Avoids harsh pure white `#FFFFFF` across full backgrounds.
* **Ink & Contrast:** Deep Slate Ink (`oklch(22% 0.025 260)` / `#181E29`) for display headers, balanced with a secondary muted ink (`oklch(52% 0.02 255)` / `#5B677A`) for labels and placeholder copy.
* **Anchor Accent Hue:** Electric Cobalt / Indigo (`oklch(58% 0.22 265)` / `#4F46E5`) with a secondary Emerald Green indicator (`oklch(68% 0.16 155)` / `#10B981`) for live hiring status.

### B. Typography Hierarchy
* **Display:** Plus Jakarta Sans (700 Bold, tracking `-0.03em`)
* **Body:** Inter (400 Regular, 500 Medium, leading `1.55`)
* **Metadata & Tags:** Geist Mono (500 Medium, tracking `+0.04em`, tabular numbers)

### C. Anti-Patterns to Skip
* No aurora gradient mesh backgrounds.
* No `background-clip: text` gradient fills on headlines.
* No heavy muddy drop-shadows on search docks.
