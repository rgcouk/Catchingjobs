# Hallmark Study: Job Searching Website

**Source Reference:** `https://dribbble.com/shots/23963312-Job-Searching-Website`  
**Designer / Attribution:** Kiran (Brand & UI/UX Designer)  
**Study Mode:** URL Mode (with Dribbble presentation soft-refusal protocol applied)  
**Date:** 2026-08-23

---

## 1. Executive Summary & Refusal Notice

> **Attestation & Soft-Refusal Policy (`study.md` § Refusal):**  
> *Dribbble shots represent individual designers' signature presentation work. In accordance with Hallmark protocols, we extract design DNA only (macrostructure, tokens, typography roles, and layout archetypes) rather than copying signature decorative illustrations or pixel-for-pixel assets.*

The studied reference is a high-utility **Job Search & Career Discovery Platform**. It pairs a high-clarity **Workbench / Split Diptych** layout with an integrated multi-facet search engine, structured listing cards, and scannable metadata tags.

---

## 2. Structured Design DNA (Schema)

```json
{
  "source_mode": "url",
  "source_url": "https://dribbble.com/shots/23963312-Job-Searching-Website",
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
  "macrostructure": "Workbench",
  "macrostructure_alt": "Bento Grid",
  "hero": {
    "archetype": "H2-Split",
    "knobs": {
      "ratio": "7/5",
      "right side": "proof column / interactive preview cards",
      "divider": "negative space"
    }
  },
  "pitch": {
    "archetype": "F6-Product-grid",
    "knobs": {
      "card ratio": "4/3 landscape",
      "density": "3-up",
      "micro-action": "View →"
    }
  },
  "nav": {
    "archetype": "N1b",
    "knobs": {
      "style": "saas-three-section",
      "search_pill": "integrated",
      "backdrop": "frosted glassmorphism"
    }
  },
  "footer": {
    "archetype": "Ft3",
    "knobs": {
      "columns": "4",
      "heading style": "uppercase grotesque",
      "bullet": "none"
    }
  },
  "display_role": "soft geometric sans",
  "display_face": "Plus Jakarta Sans (Candidate)",
  "body_role": "neutral grotesque",
  "body_face": "Inter (Candidate)",
  "label_role": "monospace",
  "label_face": "Geist Mono (Candidate)",
  "pairing_logic": "two families (geometric display + grotesque body with mono tabular labels)",
  "paper_band": "light >85",
  "paper_value": "oklch(98.5% 0.005 240)",
  "paper_hue": "neutral-cool",
  "accent_hue_band": "cyan-blue",
  "accent_value": "oklch(56% 0.21 255)",
  "accent_footprint": "recurring 5-15%",
  "density": "medium",
  "asymmetry": "left-biased",
  "treatments": [
    "hairline-borders",
    "elevated-card-canvas",
    "pill-tag-badges",
    "tabular-figures"
  ],
  "reveal": "fade-up",
  "motion_library": "none",
  "anti_patterns": [
    "aurora-blob background",
    "floating-orb decoration",
    "card-in-card nesting",
    "transition-all",
    "pure-black-pure-white"
  ]
}
```

---

## 3. Detailed Axis Breakdown

### A. Macrostructure & Layout Archetype
- **Macrostructure:** **Workbench** (`05-workbench.md`), alternating into a **Catalogue / Job Card Grid** (`F6`).
- **Hero Fold:** **H2 Split Diptych** (Ratio 7/5).
  - *Left Pane:* Value proposition headline ("Find your next dream job"), supporting copy, and an embedded multi-input search widget (`C2 Inline form as CTA`: Role, Location, Job Type, Search action).
  - *Right Pane:* Floating interactive job preview cards with verified company emblems, salary badges, application status tags, and quick-save toggles.
- **Section Rhythm:**
  1. *Hero + Embedded Search Filter Bar*
  2. *Social Proof / Top Hiring Partners Strip (`T2 Logo wall hairline`)*
  3. *Featured Job Opportunities Grid (`F6 Product card grid` with 3-column responsive flow)*
  4. *Platform Metrics / Stat Strip (`T4 Numbered stat strip` — 50k+ jobs, 12k+ companies, 98% placement)*
  5. *Candidate Benefits Bento (`F1 Bento grid`)*
  6. *CTA Strip & Index Footer (`Ft3 Index style category list`)*

### B. Color Palette & Token Architecture
- **Paper Canvas:** `oklch(98.5% 0.005 240)` (`#F8FAFC`) — light, clean slate tint avoiding flat synthetic pure white.
- **Container / Card Surface:** `oklch(100% 0 0)` (`#FFFFFF`) with `1px` hairline rules `oklch(92% 0.01 240)` (`#E2E8F0`) and subtle ambient shadow.
- **Primary Ink:** `oklch(20% 0.02 260)` (`#0F172A`) — deep slate for maximum legibility.
- **Muted Ink / Secondary:** `oklch(52% 0.02 260)` (`#64748B`) — for company locations, posted dates, and secondary labels.
- **Primary Accent:** `oklch(56% 0.21 255)` (`#2563EB`) — Electric Cobalt / Royal Blue for primary search triggers, active filter pills, and verified badges (~8–10% visual footprint).
- **Secondary Status Accents:**
  - *Success / Remote Tag:* `oklch(62% 0.17 150)` (`#10B981` Emerald)
  - *Feature / Urgent Tag:* `oklch(65% 0.19 60)` (`#F59E0B` Amber)

### C. Typography System & Hierarchy
- **Display Role (Headlines):** *Soft Geometric Sans* (e.g. **Plus Jakarta Sans** / **General Sans**), `font-weight: 700`, tight letter-spacing (`letter-spacing: -0.025em`).
- **Body Role (Descriptions & Form Inputs):** *Neutral Grotesque* (e.g. **Inter** / **Geist**), `font-weight: 400–500`, relaxed line-height (`line-height: 1.6`).
- **Label / Metric Role (Tags, Salaries, Dates):** *Monospace with Tabular Figures* (e.g. **Geist Mono** / **JetBrains Mono**), `font-weight: 500`, uppercase tracking (`letter-spacing: 0.04em`, `font-variant-numeric: tabular-nums`).

### D. Anti-Patterns to Skip vs. Patterns to Retain

| Pattern | Verdict | Rationale |
|---|---|---|
| **Aurora Mesh / Purple Gradients** | ❌ **Skip** | Generic AI template tell; replace with crisp neutral slate canvas. |
| **Card-in-Card-in-Card Nesting** | ❌ **Skip** | Reduces scannability; use clean single-layer cards with hairline dividers. |
| **Bouncy Spring `transition: all`** | ❌ **Skip** | Distracting in productivity UI; use crisp exponential ease-out (`150ms ease-out`). |
| **Full-width Embedded Search Hero** | ✅ **Retain** | Core functional anchor for high-intent job seekers. |
| **Tabular Monospace Metadata Chips** | ✅ **Retain** | Immediate clarity for salary ranges, remote availability, and timestamps. |
| **Hairline Grid Hierarchy** | ✅ **Retain** | Clean structural containment without heavy drop-shadow clutter. |
