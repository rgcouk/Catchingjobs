# Hallmark Study: Job Finder — Landing Page Exploration

**Source Reference:** `https://dribbble.com/shots/16062197-Job-Finder-Landing-Page-Exploration`  
**Designer / Attribution:** Public Inspiration Collection (`rgai/7927119-inspiure`)  
**Study Mode:** URL / Public Reference Study (Soft-Refusal Policy applied)  
**Date:** 2026-08-23

---

## 1. Executive Summary & Refusal Notice

> **Attestation & Soft-Refusal Policy (`study.md` § Refusal):**  
> *Dribbble shots represent individual designers' signature presentation work. In accordance with Hallmark protocols, we extract design DNA only (macrostructure, tokens, typography roles, and layout archetypes) rather than copying signature decorative illustrations or pixel-for-pixel assets.*

A structured **Bento Grid / Split Studio** landing page exploration featuring an integrated search console, salary transparency preview cards, and a clear 4-step job seeker sequence.

---

## 2. Structured Design DNA (Schema)

```json
{
  "source_mode": "url",
  "source_url": "https://dribbble.com/shots/16062197-Job-Finder-Landing-Page-Exploration",
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
  "macrostructure_alt": "Split Studio",
  "hero": {
    "archetype": "H2-Split",
    "knobs": {
      "ratio": "7/5",
      "left_side": "headline + value proposition + multi-segment search pill console",
      "right_side": "elevated floating job card preview stack with match badges",
      "divider": "negative space"
    }
  },
  "nav": {
    "archetype": "N1b-Canonical SaaS three-section",
    "knobs": {
      "wordmark": "Catchingjobs (bold grotesque)",
      "links": ["Find Jobs", "Companies", "Salaries", "Career Advice"],
      "actions": ["Sign In", "Post a Job (accent filled)"]
    }
  },
  "pitch": {
    "archetype": "F1-Bento grid",
    "knobs": {
      "tiles": "6 tiles irregular layout",
      "features": [
        "Interactive salary distribution chart",
        "1-Click verified candidate application",
        "AI match-score percentage breakdown",
        "Trending job category chips",
        "Company culture & tech-stack insights",
        "Real-time interview status tracker"
      ]
    }
  },
  "proof": {
    "archetype": "T4-Numbered stat strip",
    "knobs": {
      "metrics": ["250,000+ Active Roles", "12,500+ Verified Companies", "94.2% Match Accuracy", "$115k Avg Starting Comp"],
      "sub_archetype": "T2-Logo wall hairline (top hiring brands in monochrome)"
    }
  },
  "workflow": {
    "archetype": "F4-Step sequence",
    "knobs": {
      "stages": ["01 Discover & Filter", "02 Match & Assess", "03 Direct Apply", "04 Track & Interview"]
    }
  },
  "footer": {
    "archetype": "Ft3-Index style category list",
    "knobs": {
      "columns": "4 columns (Candidates, Employers, Platform, Company)",
      "heading_style": "uppercase grotesque / small-caps",
      "bottom_row": "copyright + status pill + legal links"
    }
  },
  "display_role": "soft geometric sans",
  "display_face": "Plus Jakarta Sans / General Sans",
  "body_role": "neutral grotesque",
  "body_face": "Inter / Geist",
  "label_role": "uppercase grotesque / monospace",
  "label_face": "Geist Mono / JetBrains Mono",
  "pairing_logic": "two families (Geometric display + Grotesque body with Monospace metadata)",
  "paper_band": "light >85",
  "paper_value": "oklch(98.5% 0.005 240)",
  "paper_hue": "neutral-cool",
  "accent_hue_band": "indigo / cyan-blue",
  "accent_value": "oklch(58% 0.22 260)",
  "accent_footprint": "recurring 5-15%",
  "containers": {
    "card_bg": "oklch(100% 0 0)",
    "card_border": "oklch(92% 0.005 260)",
    "card_subtle": "oklch(96.5% 0.008 240)"
  },
  "semantic_tokens": {
    "badge_active_bg": "oklch(94% 0.06 150)",
    "badge_active_text": "oklch(38% 0.14 150)",
    "badge_featured_bg": "oklch(95% 0.08 85)",
    "badge_featured_text": "oklch(42% 0.16 85)"
  },
  "density": "medium",
  "asymmetry": "left-biased (hero), modular asymmetric (bento grid)",
  "treatments": [
    "frosted-glass search pill",
    "hairline-bordered cards",
    "micro-badge metadata chips",
    "tabular numeral salary ranges"
  ],
  "reveal": "fade-up",
  "anti_patterns": [
    "bouncy hover scale (scale > 1.02)",
    "transition-all",
    "decorative purple-cyan radial mesh blobs",
    "unverified generic testimonials",
    "sales-walled pricing / hidden compensation info"
  ]
}
```

---

## 3. Key Design DNA Pillars

| Pillar | Extracted Spec | Catchingjobs Adaptation Guidance |
|---|---|---|
| **Macrostructure** | **H2 Split Diptych + F1 Bento Grid** | Place the Job Finder search bar front-and-centre on the left hero fold with immediate search inputs for Role, Location, and Remote preferences. Right side showcases a real live Job Match Card sample. |
| **Color System** | **Ice Canvas + Electric Indigo Accent** | `paper`: `oklch(98.5% 0.005 240)`<br>`ink`: `oklch(22% 0.02 260)`<br>`accent`: `oklch(58% 0.22 260)` (`#3b82f6`)<br>`rule`: `oklch(92% 0.005 260)` |
| **Typography** | **Plus Jakarta Sans + Inter + Geist Mono** | Large bold headlines (`text-4xl` to `text-6xl`, tracking tight), clean body paragraphs (`text-base`, relaxed leading), and monospace badges for salary ranges. |
| **Component Kit** | **Interactive Search Console + Bento Tiles** | 1. Hero Search Bar (Role, Location, Salary, Search CTA)<br>2. Job Category Pills with active counts<br>3. Salary Transparency Preview Cards<br>4. Step Workflow ("Search → Match → Apply") |
| **Anti-AI-Slop** | **Concrete Domain Data & Crisp Restraint** | Avoid generic marketing fluff; emphasize real salaries, verified tech stack tags, direct application workflows, and tabular stats. |
