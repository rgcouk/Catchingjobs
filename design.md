# Design — CatchingJobs (Pullum Ltd)

> **LOCKED DESIGN SYSTEM — CADMIUM ORANGE / FLAME SPECIFICATION**
> The approved pages in `designs/catchingjobs-website.pen` are the visual source of truth. Foundations and reusable assets are organised in `designs/catchingjobs-design-system.pen`. This document follows the Pencil design; the live site's routes, authentication, permissions, API contracts and candidate workflows remain the functional source of truth. The primary brand accent is Flame Orange (`#FF7605`).

---

The approved light-surface direction takes precedence over older dark-surface examples: pages that start with an orange hero use a matching orange navigation; pages with a light hero use white navigation with a dark logo. Navigation structure and typography stay consistent across pages. The updated home hero uses its native #FF7C20 farm-map scene; other surfaces retain the existing tokens. Preserve existing page content and the original Chicken-C geometry.

## 1. Brand Identity & The Chicken-C Monogram

### Vector Brand Mark

The brand mark is the custom Chicken-C vector monogram (`public/assets/chicken-c-logo.svg`, ViewBox `0 0 416 394`). The circular body of the letter "C" forms the body of the rooster, complete with a natural 3-point comb, beak, wattle, and internal circular eye aperture.

### The One-Color Rule

The vector mark, wordmark, and eye circle share identical fills. Never apply two-tone fills to the mark itself.

### The Wordmark Lockup & Spacing Rule

- **Text Assembly**: The SVG mark acts directly as the letter "C" in CatchingJobs, placed flush against `atchingJobs.`.
- **Negative Margin**: The flex container holding the SVG and text must have `gap-0`. The SVG element itself must carry a mandatory negative right margin: `-mr-1` (or `-4px`) to seamlessly bridge the rooster crest into the wordmark baseline.
- **Terminal Period**: The wordmark ends with a period: `CatchingJobs.`

### The 4 Contextual Lockups

1. **Orange Nav Context**: `#362F2B` on `#FF7605` (Header / Hero TopNav)
2. **Dark Sector Context**: `#FF7605` on `#362F2B` (Turkey Sector Card, Admin / Dark mode)
3. **White Nav Context**: `#362F2B` on `#FFFFFF`, with an orange terminal period (all non-homepage navigation)
4. **Universal Footer Context**: Original Chicken-C lockup in white on black (`#090D14`), using the shared dark footer master `Q1004P`.

---

## 2. Color System (Flame Orange & Obsidian Palette)

| Token                               | Hex Value          | Role & Usage                                                                                                                 |
| ----------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **brand-orange** / **brand-yellow** | `#FF7605`          | Signature Cadmium / Flame Orange — Top nav background, Hero background, active region tab, primary action hover, accent bars |
| **brand-orange-hover**              | `#e05500`          | Darkened flame orange for pressed and focused states                                                                         |
| **Hero fills**                      | Solid colours only | Match the native Pencil masters; no gradient substitute for the orange hero                                                  |
| **brand-broiler-gold**              | `#F5E6A3`          | Warm light golden-yellow card background for Broiler Chicken Catching division                                               |
| **brand-ivory**                     | `#FFFDF0`          | Soft warm card and modal backdrop                                                                                            |
| **brand-obsidian**                  | `#362F2B`          | Warm dark ink for body text, headings and data                                                                               |
| **brand-black**                     | `#362F2B`          | Compatibility alias for Obsidian text; use white and ivory for large surfaces                                                |
| **brand-surface**                   | `#FFFFFF`          | Job vacancy cards, sticky scrolled nav, clean contrast surfaces                                                              |
| **brand-mist**                      | `#F8FAFC`          | Alternating section backgrounds, data callout boxes, input backgrounds                                                       |
| **brand-border**                    | `#E2E8F0`          | Subtle card dividers on light backgrounds                                                                                    |
| **brand-border-dark**               | `#1E293B`          | Footer dividers, dark card borders                                                                                           |

> [!IMPORTANT]
> **Strictly Banned Colors**: Emerald Green (`#059669`) or any off-palette blues/purples in public marketing headers and hero sections.

---

## 3. Typography Hierarchy

- **Display (Headings & Wordmarks)**: `Plus Jakarta Sans` (700 bold, 800 extrabold, 900 black, tracking `-0.03em`)
- **Body UI (Content & Descriptions)**: `Geist Variable` (400 normal, 500 medium, 600 semibold, leading `1.55`)
- **Technical / Statutory / Data**: `JetBrains Mono` (500 medium, 600 semibold, uppercase tracking `+0.04em`)
- **Revised homepage menu trial only**: `Manrope` (700, 16px, uppercase, 0.4px tracking) in the revised desktop homepage navigation. This owner-requested trial does not replace the global font families or alter the logo.

---

## 4. Key Page Sections & Architecture (From Canonical Brand Spec)

### 4.1. Top Header Navigation

- Background: Signature Flame Orange (`#FF7605`), `border-b border-black/10`.
- Left: Chicken-C Monogram (`#362F2B`) with `-mr-1` margin flush into `atchingJobs.`.
- Center: `Home`, `Catching Jobs ∨`, `Locations`, `About`, `Contact (01205 330190)`.
- Right: `Log In` (text link), `Quick Apply` (white action on the orange homepage navigation; orange action on white inner-page navigation). Match `DhARr`, `SB3Fv`, and `bB8nF`; use a 4px control radius and at least a 44px hit area.

### 4.2. Hero Section

- Background: Solid Flame Orange (`#FF7605`) with the approved native home-pickup illustration. Use crisp Obsidian and ivory vector shapes, generous separation from copy, and an optional faded secondary scene. Do not use the old photo overlay. Keep the full character heads, feet and pickup doorway visible on desktop and mobile.
- Badge: `• CATCHINGJOBS.CO.UK • 18 UK LOCATIONS`.
- Headline: `UK poultry catching jobs with door-to-door home pickup.`. Match the white editorial title on a solid deeper Flame (`#E05500`) backing in `OfIS9` and `p2aGuj`; desktop 72px and mobile 42px, weight 800. Preserve the complete native pickup scene and faint full-width landscape.
- Subheadline: `CatchingJobs connects you with professional broiler chicken and commercial turkey catching teams across England. Free door-to-door heated minibus transit, guaranteed weekly Friday payroll direct to your bank.`.
- Primary CTA: `Find Catching Jobs Near You →` (White rounded button with Obsidian text).
- Secondary CTA: `Apply in 60 Seconds (No CV)` (Subtle bordered pill button).
- Propositions row: `✓ Door Home Pickup` · `✓ Friday Direct Pay` · `✓ No CV Required`.
- The canonical pickup hero is static. Exploration boards and decorative dots do not require an invented carousel or autoplay behaviour.

### 4.3. Split Sector Cards (Broiler vs Turkey)

- **Broiler Chicken Catching Jobs**:
  - Background: Ivory (`#FFFDF0`).
  - Badges: `BROILER & BREEDER TEAMS` (Obsidian pill) and `Weekly Friday Payroll` (white pill).
  - Shifts: Night Shifts (20:00 – 05:00) · 5 Shifts / Week (~45 hrs) · Full PPE & Gear Provided.
  - CTA: `VIEW CHICKEN CATCHING ROLES →` (Black rounded button).
- **Commercial Turkey Catching Jobs**:
  - Background: Ivory (`#FFFDF0`) with Obsidian text.
  - Badges: `COMMERCIAL TURKEY TEAMS` (dark pill) and `Seasonal Peak Pay` (orange pill).
  - Shifts: Day & Night Rotation Schedules · Seasonal Piece-Rate Bonuses · Free Door-to-Door Home Pickup.
  - CTA: `VIEW TURKEY CATCHING ROLES →` (Orange rounded button).

### 4.4. Live Catching Jobs Directory

- Background: Crisp White (`#FFFFFF`).
- Filter Tabs: `All Jobs (4)` (active Obsidian pill), `Chicken Catching (2)`, `Turkey Catching (1)`, `Driver-Catchers (1)`.
- 4 Clean White Cards: `Senior Broiler Catcher`, `Commercial Turkey Catcher`, `Minibus Driver & Catcher`, `Piece-Rate Broiler Catcher`.
- Each with shift rotations, location, free door-to-door transit guarantee, PPE status, and orange `Apply Now →` button.

The revised homepage alone uses reusable native job-card master `YPv9E`: location first (town 18px bold, region 13px), 32px location and chicken/turkey brand icons, 20px role title, 24px rate, native shift/hours/pay icon rows and an orange 44px `View job` action. Four desktop and two mobile linked instances are 404px high. Retain specimen-data disclaimers. This scoped canvas pattern does not replace global typography or establish live job data or application behaviour.

### 4.5. Our Locations & Regional Map

- Two-column layout:
  - Left: `SELECT REGION:` with `Lincolnshire (4 Teams)` active in `#FF7605`, `Norfolk`, `Yorkshire`, `Shropshire`, `Suffolk`.
  - Right: Clean England interactive transit map with orange markers, floating `✓ OPERATING TOWNS IN REGION:` strip (`Lincoln`, `Boston`, `Sleaford`, `Grantham`, `Spalding`, `Washingborough`), and buttons `Apply Chicken Team →` & `Apply Turkey Team →`.

### 4.6. Universal Footer

- Owner-requested shared dark footer: native reusable master `Q1004P` in `designs/catchingjobs-website.pen`. Use the same component on public desktop and mobile pages, with responsive layout overrides. Authentication and operations retain their existing shells.
- Background: owner-confirmed black (`#090D14`) on footer master `Q1004P` only; the global Obsidian / `cj-ink` token remains unchanged (`#362F2B`). Primary text and original Chicken-C lockup are white; secondary text is restrained (`#D6D1CD`). Preserve logo geometry.
- Group navigation into work, about, training and login links. Include `Pullum Ltd`, GLAA Licence `PULL0001`, Lantra Level 2 Animal Welfare, phone `01205 330190`, and the copyright/benefit strip.
- The shared master is applied to 15 public boards spanning original/revised homepages, jobs, job detail, locations, chicken, turkey, regional, corporate and desktop/mobile training. This canvas component is the implementation reference; application code has not been changed.

## 5. Illustration Family & Pencil Design System

Use the native pickup, crew and payday vector family in `designs/catchingjobs-design-system.pen`, with local supporting masters retained in `designs/catchingjobs-website.pen`. Pickup leads the homepage; the chicken-and-turkey crew pair supports team and role content; payday supports benefits. The original Chicken-C remains a separate protected logo. Cross-file masters are not automatically synchronised.

Illustrations use two flat fills: Obsidian `#362F2B` and ivory `#FFFDF0`; surrounding orange belongs to the UI. No gradients, soft shadows, glows or raster overlays. Preserve proportions, pointed feather groups, clear expressions and transparent margins. Full-canvas minimum widths: pickup 320 px, crew 240 px, payday 280 px. Below these sizes use the existing 32/64 px brand icons. SVG handoff: `designs/assets/illustration-{pickup,crew,pay}-v3.svg`; detailed rules: `docs/illustration-system.md`.

The consolidated canvas system starts at board 26 (`lyuNM`): foundations 26A (`iLHQu`), controls/states 26B (`Y4sQm`), page patterns 26C (`qiaDD`), native illustration masters 26D (`OwNNo`), icons/motion 26E (`q8yza`), employee/operations patterns 26F (`L2zCmt`), and canonical homepage hero masters 26G (`oKbf2`). Component and token handoff: `docs/pencil-design-system.md` and `designs/system/`. These are design specifications; implementation must retain existing application behaviour.

Contrast takes precedence over decorative colour pairing. Obsidian on orange is 4.91:1. White on brand orange is 2.68:1 and fails AA even for large text. White hero titles require a solid Flame `#E05500` backing (3.84:1, large bold text only); body and small labels require at least 4.5:1. Primary-action hover uses Obsidian with white text. Motion plays once, keeps copy/actions visible, and becomes static under reduced motion.

## 6. Refined icons and account interfaces

Board 22 (`c74Md`) contains the approved 24-symbol brand family. Use its exact native vectors. The family covers pickup, pay, no CV, PPE, chicken, turkey, location, team, verification, Moffett, mods, farm, driving licence, night/day shifts, hours, employment, training, immediate start, right to work, physical work, animal welfare, crew leader and biosecurity. Poultry mods always have **two columns and five rows**.

Match the original nine icons: **3px outlines at 64px, 2px at 32px, and 1.5px at 24px**. Filled silhouettes retain their approved contour geometry. Preserve bevel joins, square caps, ivory fills and orange accents. Native web assets live in `apps/web/public/assets/brand/icons/`; `BrandIcon` renders decorative or labelled variants. Pair compact job-card icons with text.

Board 22B is the separate Lucide account/employee family at 16/20/24px. Use shadcn/ui and Lucide for profile, contact details, applications, documents, upload, progress, interviews, notifications, security, settings, support, sign out, payslips, shifts, home pickup details and emergency contacts. Do not apply marketing illustration treatment to dense forms or navigation. Account actions need a real backing workflow before they can claim success.

## 7. Moffett training

Use the retained Moffett training desktop/mobile frames in `catchingjobs-website.pen` for the current composition, artwork, and background. Preserve white navigation, the ivory hero, Obsidian copy, orange enquiry action, `Big kit. Real confidence.` and `01205 330 190`. Direct edits in those page frames take precedence over earlier farm-background and standalone-machinery explorations in the archive. Keep the current foreground artwork complete, maintain readable copy, and preserve the latest native illustration edits when implementing the page.

## 8. Live-site implementation contract

- Use the existing React 19, TypeScript and Tailwind v4 application. Preserve Chicken-C geometry, shadcn/Radix accessibility, API formats and real data sources.
- Retain the home, jobs (including optional slug), locations, chicken/turkey and regional/town, corporate, Clerk login/registration/callback, employee, portal redirect and admin routes. New training content needs working navigation and real contact actions.
- Preserve email verification, authenticated application claims, employee onboarding, uploads and admin permission checks. No database resets or production applicant writes are part of visual migration.
- Job counts, rates and availability must come from actual data. Pencil specimen values are not live facts. Provide explicit loading, empty, error and retry states.
- Match the native layouts responsively: 1280px content width, 24px mobile gutters, 4/8/12/16/24/32/48/64/80/96px spacing, 4px controls, 8px cards and 44–48px action targets. Verify keyboard/focus behaviour, labels, reduced motion, assets and overflow.
- Plus Jakarta Sans, Geist Variable and JetBrains Mono are the approved families. Stale yellow, green, blue-black and Inter examples in old skills/docs do not override Pencil.
- Preserve Vercel client and SSR build contracts. A generated SSR bundle alone does not establish that production serves SSR; verify deployment configuration separately.

### Latest homepage and navigation update — 22 October 2026

Use the full-bleed aerial farm-map backgrounds from BIFM1/i10Jb, with native desktop/mobile exports LqSK5/HT8IN. The search is location-first and searches actual listed towns/areas; do not promise a postcode or distance resolver. Shared public navigation, auth and employee pages use the same menu, with a dark logo on white light-page surfaces. Regional orange heroes use orange navigation. Employment contracts, shifts, rates and training terms must be actual vacancy data or clearly awaiting confirmation.

Authentication pages use standalone full-height layouts without the public navigation header.
