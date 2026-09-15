# Design — CatchingJobs (Pullum Ltd)

> **LOCKED DESIGN SYSTEM — CADMIUM YELLOW V2 (ANTI-SLOP TRADE SPECIFICATION)**
> This file is the single canonical source of truth for CatchingJobs.co.uk. All AI agents, skills, and code generators must strictly adhere to these specifications. Do NOT revert to green or orange tokens.

---

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
1. **Yellow Nav Context**: `#000000` on `#FFCC00` (Header / Hero TopNav)
2. **Dark Sector Context**: `#FFCC00` on `#000000` (Turkey Sector Card, Admin / Dark mode)
3. **Scrolled Nav Context**: `#000000` on `#FFFFFF` (Scrolled Sticky Navigation)
4. **Universal Footer Context**: `#FFFFFF` on `#000000` (Platform Footer)

---

## 2. Color System (Locked 3-Tone Palette)

| Token | Hex Value | Role & Usage |
|---|---|---|
| **brand-yellow** | `#FFCC00` | Signature Cadmium Yellow — Top nav background, Hero background, active region tab, primary action hover, accent bars |
| **brand-yellow-hover** | `#E6B800` | Darkened yellow for pressed and focused states |
| **brand-broiler-gold** | `#F5E6A3` | Warm light golden-yellow card background for Broiler Chicken Catching division |
| **brand-obsidian** | `#090D14` | High-contrast dark ink for body text, headings, Turkey Sector card |
| **brand-black** | `#000000` | Universal Footer background, primary action buttons, dark division cards |
| **brand-surface** | `#FFFFFF` | Job vacancy cards, sticky scrolled nav, clean contrast surfaces |
| **brand-mist** | `#F8FAFC` | Alternating section backgrounds, data callout boxes, input backgrounds |
| **brand-border** | `#E2E8F0` | Subtle card dividers on light backgrounds |
| **brand-border-dark** | `#1E293B` | Footer dividers, dark card borders |

> [!IMPORTANT]
> **Strictly Banned Colors**: Emerald Green (`#059669`), Harvest Orange (`#EA580C`), or any off-palette blues/purples in public marketing headers and hero sections.

---

## 3. Typography Hierarchy

- **Display (Headings & Wordmarks)**: `Plus Jakarta Sans` (700 bold, 800 extrabold, 900 black, tracking `-0.03em`)
- **Body UI (Content & Descriptions)**: `Inter` (400 normal, 500 medium, 600 semibold, leading `1.55`)
- **Technical / Statutory / Data**: `JetBrains Mono` (500 medium, 600 semibold, uppercase tracking `+0.04em`)

---

## 4. Key Page Sections & Architecture (From Canonical Brand Spec)

### 4.1. Top Header Navigation
- Background: Full Cadmium Yellow (`#FFCC00`), `border-b border-black/10`.
- Left: Chicken-C Monogram (`#000000`) with `-mr-1` margin flush into `atchingJobs.`.
- Center: `Home`, `Catching Jobs ∨`, `Locations`, `About`, `Contact (01205 330190)`.
- Right: `Log In` (ghost/text link), `Quick Apply` (black pill button `bg-black text-white px-4 py-2 rounded text-xs font-bold`).

### 4.2. Hero Section
- Background: Solid Cadmium Yellow (`#FFCC00`) with subtle photo overlay (`homepage-hero.jpg` at 15–20% opacity with blend).
- Badge: `• CATCHINGJOBS.CO.UK • 18 UK LOCATIONS`.
- Headline: `UK poultry catching jobs with free home pickup.`.
- Subheadline: `CatchingJobs connects you with professional broiler chicken and commercial turkey catching teams across England. Free door-to-door heated minibus transit, guaranteed weekly Friday payroll direct to your bank.`.
- Primary CTA: `Find Catching Jobs Near You →` (Black rounded button with yellow text).
- Secondary CTA: `Apply in 60 Seconds (No CV)` (Subtle bordered pill button).
- Propositions row: `✓ Door Home Pickup` · `✓ Friday Direct Pay` · `✓ No CV Required`.
- Carousel dots: `• • •`.

### 4.3. Split Sector Cards (Broiler vs Turkey)
- **Broiler Chicken Catching Jobs**:
  - Background: Light warm golden-yellow (`#F5E6A3`).
  - Badges: `BROILER & BREEDER TEAMS` (black pill) and `Weekly Friday Payroll` (white pill).
  - Shifts: Night Shifts (20:00 – 05:00) · 5 Shifts / Week (~45 hrs) · Full PPE & Gear Provided.
  - CTA: `VIEW CHICKEN CATCHING ROLES →` (Black rounded button).
- **Commercial Turkey Catching Jobs**:
  - Background: Deep Obsidian (`#090D14`).
  - Badges: `COMMERCIAL TURKEY TEAMS` (dark pill) and `Seasonal Peak Pay` (yellow pill).
  - Shifts: Day & Night Rotation Schedules · Seasonal Piece-Rate Bonuses · Free Door-to-Door Home Pickup.
  - CTA: `VIEW TURKEY CATCHING ROLES →` (Yellow rounded button).

### 4.4. Live Catching Jobs Directory
- Background: Crisp White (`#FFFFFF`).
- Filter Tabs: `All Jobs (4)` (active black pill), `Chicken Catching (2)`, `Turkey Catching (1)`, `Driver-Catchers (1)`.
- 4 Clean White Cards: `Senior Broiler Catcher`, `Commercial Turkey Catcher`, `Minibus Driver & Catcher`, `Piece-Rate Broiler Catcher`.
- Each with shift rotations, location, free door-to-door transit guarantee, PPE status, and black `Apply Now →` button.

### 4.5. Our Locations & Regional Map
- Two-column layout:
  - Left: `SELECT REGION:` with `Lincolnshire (4 Teams)` active in `#FFCC00`, `Norfolk`, `Yorkshire`, `Shropshire`, `Suffolk`.
  - Right: Clean England interactive transit map with yellow markers, floating `✓ OPERATING TOWNS IN REGION:` strip (`Lincoln`, `Boston`, `Sleaford`, `Grantham`, `Spalding`, `Washingborough`), and buttons `Apply Chicken Squad →` & `Apply Turkey Squad →`.

### 4.6. Universal Footer
- Background: Deep Obsidian Black (`#000000`).
- Logo: White Chicken-C vector monogram + `atchingJobs.` with period.
- Operating Entity: `Pullum Ltd`, GLAA Licence `PULL0001`, Lantra Level 2 Animal Welfare.
- Navigation links, 24/7 Hotline (`01205 330 190`), and statutory zero worker deductions guarantee.
