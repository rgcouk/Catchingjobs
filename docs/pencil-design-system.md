# CatchingJobs Pencil design system

The approved page collection is `designs/catchingjobs-website.pen`; the reusable reference library is `designs/catchingjobs-design-system.pen`. Their START HERE boards describe the current organisation and design gaps. `design.md` follows the approved Pencil design. Board 26 contains foundations, controls, patterns, illustrations and icons; board 22 contains the expanded refined icon family. The complete pre-cleanup snapshot is `designs/catchingjobs-archive-2026-10-18.pen`; `refined-catchingjobs.pen` is the preserved original, not the working page collection.

The website file keeps local supporting masters so its pages remain independently editable. The design-system file is not an automatically linked external library: synchronise intentional component changes explicitly and recheck both files. Older IDs and exports below describe the original handoff; consult the current START HERE boards for the active inventory.

## Canvas map

| Board                       | Node     | Purpose                                                              |
| --------------------------- | -------- | -------------------------------------------------------------------- |
| 26 Start here               | `lyuNM`  | System guide and navigation                                          |
| 26A Foundations             | `iLHQu`  | Logo, palette, contrast, type, spacing and responsive rules          |
| 26B Controls and states     | `Y4sQm`  | Connected action, field, selection and feedback specimens            |
| 26C Page patterns           | `qiaDD`  | Navigation, vacancy/discovery, authentication and application states |
| 26D Illustration system     | `OwNNo`  | Native vector masters on orange and ivory                            |
| 26E Icons and motion        | `q8yza`  | Actual-size 32/64 px icon family and motion guidance                 |
| 26F Employee and operations | `L2zCmt` | Connected employee and operations patterns                           |
| 26G Homepage hero masters   | `oKbf2`  | Connected desktop and mobile pickup hero masters                     |

Homepage desktop `J1AkY` and mobile `r2nVbV` use a continuous orange navigation/hero field and the native pickup vector. Native payday artwork supports the benefits sections. Earlier illustration exploration copies, including `U6yVN2`, `Jv13e` and `GGI6u`, belong to the dated archive rather than the approved website collection.

## Foundations and token exports

`designs/system/pencil-source.json` records extracted Pencil variables and the component inventory, including legacy masters. `tokens.json` and `tokens.css` in the same directory provide the token handoff; `components.json` identifies canonical and legacy component status. They are exports, not evidence that application CSS has been migrated.

Use the `cj-*` variable family. Imported `1:*` library tokens and legacy generic green/Inter variables are not the CatchingJobs brand; do not globally replace them or treat their presence as approval. `cj-black` is an Obsidian compatibility alias.

| Pencil token                        | Value                 | Semantic use                                                  |
| ----------------------------------- | --------------------- | ------------------------------------------------------------- |
| `cj-orange`                         | `#FF7605`             | Homepage hero/navigation, primary action, selected accent     |
| `cj-ink` / `cj-black`               | `#362F2B`             | Headings, body, data and dark foreground                      |
| `cj-surface`                        | `#FFFFFF`             | Main page, cards and forms                                    |
| `cj-ivory`                          | `#FFFDF0`             | Warm supporting surfaces and footer                           |
| `cj-orange-hover`                   | `#E05500`             | Backing for large white hero titles; not small control labels |
| `cj-muted`                          | `#475569`             | Supporting text on light surfaces                             |
| `cj-border` / `cj-mist`             | `#E2E8F0` / `#F8FAFC` | Dividers and quiet interface surfaces                         |
| `cj-error` / `cj-error-surface`     | `#B91C1C` / `#FEF2F2` | Error feedback with written explanation                       |
| `cj-success` / `cj-success-surface` | `#166534` / `#F0FDF4` | Completed-action feedback                                     |

Obsidian on orange is **4.91:1**, on white **13.14:1**, and on ivory **12.86:1**. White on orange is **2.68:1**, failing AA even for large text. White on Flame `#E05500` is **3.84:1**: use only for large titles (24 px regular or approximately 19 px bold and above). Small labels and body require at least 4.5:1. Primary hover uses Obsidian with white text; `cj-orange-hover` does not imply a mandatory hover fill for every control. Colour is never the only status or selection indicator.

Typography uses Plus Jakarta Sans headings (700–800), Geist Variable body/UI (400–500), and JetBrains Mono data (500). Pencil calls Geist Variable **Geist**. Desktop heading scale: 72/48/36/24 px; mobile: 40/32/24 px; body: 18/16 px; metadata: 12 px. Display leading is 1.05–1.12, headings 1.15–1.25, body 1.5–1.6. Wordmark geometry and prescribed spacing remain unchanged.

Spacing is 4/8/12/16/24/32/48/64/80/96 px. Public containers max at 1280 px, with 80 px desktop gutters at 1440 and 24 px mobile gutters. Controls have at least 44 × 44 px hit areas (standard specimens are 48 px high), 4 px radii; cards use 8 px. Stack hero copy, action and artwork on mobile; do not shrink desktop typography or clip characters to force a fit.

## Canonical component manifest

The inventory is broader than the active handoff. Use the following native masters for current work, with connected instances and content overrides. State examples in 26B are visual specifications, not independent executable components.

| Active family                                       | Master IDs                          |
| --------------------------------------------------- | ----------------------------------- |
| Original logo lockups, orange / white               | `MdJt3`, `D3Uva`                    |
| Buttons, brand / secondary / outline                | `PLZ33`, `lvkn2`, `m2UNt`           |
| Text / select / checkbox                            | `ta4jZ`, `IbLvZ`, `TAiEd`           |
| Filter tab / status badge                           | `V1LVu`, `EfT8H`                    |
| Error / success feedback                            | `XQ61Q`, `kXGcA`                    |
| Homepage / inner-page / mobile homepage header      | `DhARr`, `SB3Fv`, `bB8nF`           |
| Homepage dropdown / homepage menu / inner-page menu | `QfYU2`, `DQWtt`, `GuyOG`           |
| Vacancy / region / job detail header                | `PA967`, `HmfKi`, `Q7596G`          |
| Quick application / login / authentication shell    | `wIEw5`, `Dmd5v`, `OWCBH`           |
| Empty / unavailable / loading                       | `p2mWd`, `Xe5dS`, `GoSJ2`           |
| Footer / employee header                            | `Q1004P`, `rgEl7`                   |
| Admin shell / sidebar / applicants table / Kanban   | `FpcuZ`, `QQtjx`, `bYSPX`, `G1jPNm` |
| Native pickup / crew / payday illustrations         | `mdpuY`, `nnALV`, `m1XTKC`          |
| Homepage pickup hero, desktop / mobile              | `OfIS9`, `p2aGuj`                   |

The first-generation icons (`OXscf`, `iehni`, `LkfjF`, `oiQrN`, `FydxL`, `Pw0KA`, `mU3Rg`, `L8mciD`, `M8DfdF`) remain for historical compatibility. Use the refined sizes below for new work. Earlier illustration masters (`xEtUV`, `xDLuJ`, `WpPwp`, `PFr1p`, `OSUwj`, `vrnwl`, `lNi6w`, `C82Ud`) and earlier hero alternatives remain exploration/reference, rather than the current illustration family. Homepage hero patterns `oxAf8`/`ywFD0` retain older structural compositions; use the connected vector masters `OfIS9`/`p2aGuj` on26G for current homepage work.

| Refined icon | 32 px   | 64 px    |
| ------------ | ------- | -------- |
| Home pickup  | `B95jt` | `u2BlGz` |
| Friday pay   | `uqZrG` | `MbkW1`  |
| No CV        | `x9fWQ` | `cFxxZ`  |
| PPE          | `cvQTl` | `E83dLJ` |
| Chicken      | `DAt7w` | `URL56`  |
| Turkey       | `PEbn6` | `bm5bq`  |
| Locations    | `mTb4h` | `IAkhP`  |
| Team         | `VluIE` | `msZ8S`  |
| Verified     | `u2Fqi` | `PAG2f`  |

## Illustration and motion

Use `designs/assets/illustration-{pickup,crew,pay}-v3.svg`, with transparent backgrounds and two flat fills: Obsidian and ivory. Orange comes from the surrounding UI. Pickup leads the homepage, the chicken-and-turkey pair supports team/role content, and payday supports benefits. Preserve heads, feet, tails and the pickup doorway; no gradients, soft shadows or added colours. The original Chicken-C is separate and must never be replaced by a character.

Minimum full-canvas widths: pickup **320 px**, crew **240 px**, payday **280 px**; each SVG has a 1536 × 1024 viewBox. Use icons below those sizes. The SVGs are cleaned deterministic traces of the existing generated PNG concepts, not hand-redrawn artwork. See `docs/illustration-system.md` for preparation and validation details.

Motion is optional: 160 ms interface feedback and approximately 650 ms scene reveals, once per entry with no idle loops. Keep readable copy, title backing and actions visible throughout. Reduced-motion mode shows the finished static scene. Implement descriptive alternative text for meaningful art and hide purely decorative repeats from assistive technology.

## Page collection and integration

| Collection       | Current page IDs                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Public discovery | Home `J1AkY`, jobs `lcT10`, detail `LlxCD`, locations `KT7IK`                                        |
| Landers          | Chicken `XGv1c`, turkey `mbGid`, regional `t3VaJ`, corporate `CG8mX`                                 |
| Authentication   | Login `enTmK`, registration `QZVHt`, verification `k6GpN`                                            |
| Operations       | Employee `iMWp2`, applicants `SQhBD`, Kanban `D5fwP`                                                 |
| Mobile           | Home `r2nVbV`, jobs `OPhWR`, detail `DrGMS`, login `Lfo33`, registration `h9FbU9`, employee `S1RUqr` |

Inner-page navigation and page backgrounds remain white/ivory with orange actions. The main recruitment audience is experienced poultry catchers and drivers. Preserve existing content and practical benefits: free home pickup, Friday payroll and no CV. Example vacancy rates, counts and operational records on the canvas are layout data, not verified live claims.

| Canvas concern                 | Existing code integration point                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original logo                  | `apps/web/src/components/brand/BrandLogo.tsx`                                                                                                           |
| Public navigation and footer   | `apps/web/src/components/layout/PublicHeader.tsx`, `PublicFooter.tsx`                                                                                   |
| Controls, dialogs and feedback | `apps/web/src/components/ui/` (retain shadcn/Radix behaviour)                                                                                           |
| Application and verification   | `components/triage/HeroTriageForm.tsx`, `PasswordlessOTPModal.tsx`                                                                                      |
| Jobs and locations             | `pages/jobs/JobsListPage.tsx`, `JobDetailsPage.tsx`, `pages/locations/LocationsPage.tsx`                                                                |
| Admin and employee             | `components/layout/AppShell.tsx`, `app-sidebar.tsx`, `components/shared/data-table.tsx`, `features/KanbanBoard.tsx`, `pages/portal/PortalDashboard.tsx` |

Paths in the last four rows are relative to `apps/web/src/`. Integrate tokens first, then shared controls/navigation, homepage artwork, and route patterns. Preserve Clerk authentication, domain behaviour, map interactions and actual data sources. During code implementation verify keyboard/focus behaviour, field errors, mobile layout, reduced motion and the relevant project checks. Canvas specimens specify visual intent; they do not establish functional or accessibility compliance of the application.
