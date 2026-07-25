# CatchingJobs AI Design System (Hallmark + Framer AI)

## 1. Core Philosophy (Anti-AI-Slop & Framer Dynamics)
We blend the genuine Hallmark design principles with modern, high-end AI aesthetics inspired by Framer's AI galleries.
- **Structural Variety**: Avoid generic templates. Employ distinct macrostructures like Marquee Heroes, Bento Box grids, and Stat-Led layouts.
- **Honest Copy**: Use authentic data. No fabricated metrics.
- **Typography Purity**: Strict roman typography for display. No italics. Use weight and color for emphasis.
- **Locked Tokens**: Strict adherence to defined color, spacing, and typography tokens.

## 2. Design System & Theming
- **Genre**: Modern-Minimal SaaS infused with cutting-edge AI aesthetic (Dark Mode, Glassmorphism, Neon Accents).
- **Theme**: High-contrast, deeply immersive.
  - **Backgrounds**: Deep, ink-like void blacks (`#000000` to `#0A0A0A`) with subtle noise textures or ambient glowing orbs in the background.
  - **Surfaces**: Glassmorphic cards with translucent backgrounds (e.g., `rgba(255, 255, 255, 0.05)`) and ultra-thin 1px solid borders (`rgba(255, 255, 255, 0.1)`).
  - **Accent**: High-visibility Phosphor/Emerald Green (`#10B981`) with glowing drop-shadows for primary "Apply" conversion actions and active states.

## 3. Structural Implementation
### 3.1 The Dashboard (Workbench)
- **Macrostructure**: Interactive Flow / Workbench. Focused entirely on task execution. Clean sidebar, prominent data tables, and bento-box widgets.
- **Responsiveness**: Fluid grids. Hard floor for mobile perfection with no horizontal scrolling.
- **State Discipline**: Every interactive element explicitly handles all 8 states (default, hover, focus-visible, active, disabled, loading, error, success). Hover states should feature subtle glowing borders and micro-scale animations.

### 3.2 Landing Pages
- **Macrostructure**: Grid-Led (Bento Box) and Stat-Led. Showcase the AI matching engine's power through sleek, translucent data visualizations.
- **Nav Archetype**: N13 Inline ⌘K-pill or Floating pill. Modern, compact navigation that gets out of the way.

## 4. Components & Details
- **Buttons**: Pill-shaped or slightly rounded, glowing Emerald Green for primary. Ghost/glassmorphic for secondary.
- **Inputs**: Dark inputs with a subtle inner shadow, turning Emerald on focus.
- **Cards**: Soft 16px to 24px border radii, inner padding 24px, 1px subtle stroke.
