# CatchingJobs design handoff

Source: `../refined-catchingjobs.pen`, board26. Brand authority: `../../design.md`.

- `pencil-source.json`: exact `cj-*` Pencil variable values and native master inventory.
- `tokens.json`: typed tokens, typography and semantic colour aliases. The body font stack expands Pencil’s Geist alias to Geist Variable.
- `tokens.css`: equivalent CSS custom properties for a future implementation pass. This file is not imported by the application.
- `components.json`: master IDs, board map and current/legacy status. Current design availability does not imply tested runtime behavior.
- `design-system.pdf`: exported visual reference for the guide and seven system boards.

Use connected component instances in Pencil. Override page-specific content; keep layout and artwork connected to their masters. Use actual32/64px icon variants. Native full illustrations use two flat paths and exact Obsidian/ivory fills.

Full usage and implementation mapping: `../../docs/pencil-design-system.md`. Illustration assets and provenance: `../../docs/illustration-system.md`.

Do not migrate legacy imported `1:*` or generic green tokens into the brand. White on orange fails contrast; white hero display text uses the static deeper Flame backing. Small labels use Obsidian on orange/ivory or white on Obsidian.
