# CatchingJobs Design System (Hallmark DNA)

## 1. Core Philosophy (Anti-AI-Slop)
We are adopting the genuine [Hallmark](https://github.com/nutlope/hallmark) design principles to ensure the CatchingJobs interface feels crafted, not generated:
- **Structural Variety**: We will avoid the generic "Hero -> 3 Features -> CTA -> Footer" template. Instead, we'll pick distinct macrostructures (e.g., *Marquee Hero* or *Stat-Led*) for different sections.
- **Honest Copy**: No fabricated metrics. We will only use real data or explicit placeholders (e.g., `— metric to confirm`).
- **Typography Purity**: No italic headers. Emphasis will be carried through weight, color, or drawn underlines. All display typography remains strictly roman.
- **Locked Tokens**: All colors and fonts must reference named tokens (e.g., `var(--color-accent)`). No mid-render improvisation of inline OKLCH/hex values.

## 2. Design System & Theming
- **Genre**: Modern-Minimal (SaaS / Utility) mixed with Playful (approachable for applicant intake).
- **Theme**: We will leverage the Hallmark catalog's high-contrast options, tuned specifically for CatchingJobs.
  - **Backgrounds**: Pure paper whites and deep, ink-like blacks to ensure maximum readability outdoors on farm sites.
  - **Accent**: A high-visibility Emerald/Phosphor Green (`#10B981` or similar token) reserved strictly for the primary "Apply" conversion actions.

## 3. Structural Implementation
### 3.1 The Intake Wizard (Mobile-First)
- **Macrostructure**: *Workbench* / *Interactive Flow*. Focused entirely on the task at hand with no distracting marketing fluff on the conversion pages.
- **Responsiveness**: Hard floor for mobile perfection. Absolutely no horizontal scroll (`overflow-x: clip`), and touch targets must be a minimum of 48x48px.
- **State Discipline**: Every interactive element (inputs, buttons, dropdowns) must explicitly handle all 8 states: default, hover, focus-visible, active, disabled, loading, error, and success.

### 3.2 Landing Pages (/chickens/, /turkeys/)
- **Macrostructure**: *Stat-Led* or *Grid-Led*. Prioritize clear requirements and earning potential over standard marketing layouts.
- **Nav Archetype**: *N5 Floating pill* or *N13 Inline ⌘K-pill* for a modern, compact navigation that gets out of the user's way on mobile devices.

## 4. Performance & Validation
- **Lightning-Fast**: Built on Vite, React, and Tailwind v4. The payload will be minimal, avoiding heavy animation libraries where native CSS transitions suffice.
- **Self-Critique Gates**: Before any UI component is merged, it must pass Hallmark's visual, microinteraction, contrast, and accessibility gates.
