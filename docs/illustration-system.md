# Catchingjobs illustration system

The `v3` family refines the existing generated `v2` artwork into transparent, native SVG paths. Original compositions and character poses are preserved. The Chicken-C logo is a separate protected brand asset and is unchanged.

| Asset                                       | Intended role                                         | Minimum display width |
| ------------------------------------------- | ----------------------------------------------------- | --------------------- |
| `designs/assets/illustration-pickup-v3.svg` | Homepage pickup scene; door, catcher and crew vehicle | 320 px                |
| `designs/assets/illustration-crew-v3.svg`   | Reusable chicken-and-turkey brand character pair      | 240 px                |
| `designs/assets/illustration-pay-v3.svg`    | Friday-pay benefits section                           | 280 px                |

All three use `viewBox="0 0 1536 1024"`. Preserve the aspect ratio and visible feet. The artwork has transparent margins; the minimum widths above refer to the full SVG canvas. Use the existing 32/64 px icon family for compact UI, rather than shrinking these scenes into icons.

## Visual rules

- Two flat fills only: Obsidian `#362F2B` and ivory `#FFFDF0`. The orange `#FF7605` belongs to the surrounding UI and is not baked into the files.
- Solid angular contours, simple expressions and pointed feather groups. Outlines are filled silhouettes, not live strokes; scale uniformly.
- No gradients, glows, soft shadows, embedded raster images, filters or extra decorative colours.
- Hero foreground scenes remain crisp. Any secondary background scene should use a separate faded instance, with clear separation from readable text and controls.
- Maintain generous space around poultry faces, wings, feet and the pickup doorway. Do not crop these details to accommodate text.
- Illustration choice should support the message: pickup leads the homepage, the crew pair supplies reusable personality, payday supports benefits.

## Preparation and validation

The source files are `designs/assets/illustration-{pickup,crew,pay}-v2.png`, created earlier with built-in image generation. These PNGs are preserved. The SVGs are deterministic traces of those images, not newly generated or hand-redrawn scenes; this document makes no licensing claim about outside artwork.

Tracing retained source pixels at alpha 128 or above, separated ivory at mean RGB 155 or above, removed contours smaller than 24 source pixels squared, then simplified contours with a 1.35 px polygon tolerance. Each SVG contains two compound paths with even-odd fills. Transparent halo pixels and raster colour variation are removed. Source feather groups remain, with cleaner polygon boundaries.

Rendered orange and ivory comparison images are saved beside each SVG as `illustration-{pickup,crew,pay}-v3-preview.png`. Chromium render review confirmed visible character feet, intact major shapes, transparent backgrounds and consistent two-colour rendering. The preview PNGs are review artifacts; consume the SVGs in the final design.

| Asset  | SVG size    | Contours, Obsidian / ivory |
| ------ | ----------- | -------------------------- |
| Pickup | 6,421 bytes | 7 / 54                     |
| Crew   | 5,031 bytes | 1 / 37                     |
| Payday | 5,240 bytes | 4 / 35                     |

For implementation, meaningful illustrations need descriptive alternative text; purely decorative repeated scenes should be hidden from assistive technology. Motion should be optional, play once, and remain static when reduced motion is requested.
