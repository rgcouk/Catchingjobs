# Pen UI implementation handoff

Updated 22 October 2026. Visual authority: `designs/catchingjobs-website.pen`, read through Pencil MCP. Existing URLs, Clerk authentication, API data and onboarding remain the functional authority.

| Page family                     | Pen reference                                | Implementation                                                                                                                             |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Jobs-first home                 | `IzO78`, `tXsh4`                             | `pages/Index.tsx`; working keyword/pickup search, location-first vacancy cards, category tiles, pickup band and region selection           |
| Shared public navigation/footer | `p5g27I`, `SB3Fv`, `Q1004P`                  | `components/layout/PublicHeader.tsx`, `PublicFooter.tsx`; orange home, white internal navigation, dark footer                              |
| Jobs and detail                 | `lcT10`, `OPhWR`, `LlxCD`, `DrGMS`           | `pages/jobs/`; functional search/filter/detail/apply, real rates and counts                                                                |
| Locations                       | `KT7IK`                                      | `pages/locations/LocationsPage.tsx`                                                                                                        |
| Sector, regional and corporate  | `XGv1c`, `mbGid`, `t3VaJ`, `CG8mX`           | `pages/landers/`; split overviews and native compositions                                                                                  |
| Authentication                  | `enTmK`, `Lfo33`, `QZVHt`, `h9FbU9`, `k6GpN` | `pages/auth/`; existing Clerk verification retained                                                                                        |
| Employee                        | `iMWp2`, `S1RUqr`                            | `pages/portal/PortalDashboard.tsx`; status cards, onboarding checklist/resources, accessible edit/view/wizard dialogs                      |
| Admin applicants/Kanban         | `SQhBD`, `D5fwP`                             | operations shell, `AdminDashboard.tsx`, `KanbanBoard.tsx`; real counts, filters, pagination, accessible inspection and mobile scrolling    |
| Moffett training                | `J3HT2l`, `A8h1h`                            | `pages/training/MoffettTrainingPage.tsx`; complete current yard artwork exported from the native canvas, working enquiry telephone actions |

Paths above are relative to `apps/web/src/`. Reused assets retain native icon geometry; modules have two columns and five rows. The exported training artwork is `public/assets/brand/illustrations/iFAVQ.png`.

## Deliberate adaptations and design gaps

- The newer jobs-first homepage takes precedence over the earlier pickup-led homepage. Desktop and mobile use the latest full-bleed aerial farm map exported directly from Pen; the location-first search submits a town/area filter to the jobs directory.
- The current hero retains its native desktop/mobile type treatment. Shared navigation uses Manrope consistently. Orange-hero routes share the hero surface; light-hero, auth, employee and error pages use white navigation with a dark logo. Brand geometry is unchanged.
- Canvas example vacancies, rates, availability, employee shifts and operational statistics are not fabricated as live data. Missing roster information remains unavailable; dispatch uses the actual telephone action. No fake document downloads or messaging success states were added.
- The START HERE index marks mobile locations, sectors, regional/corporate, verification and operations as NEEDS DESIGN. These use responsive adaptations of their approved desktop layouts, not claims of a separate approved mobile design.
- Training has approved header/intro frames only. The code implements that scope rather than inventing an unapproved full course page.
- Admin tabs without dedicated Pen pages retain their existing workflows within the updated operations shell. No new backend features or production deployment are part of this visual conversion.

## Verification

Public production-bundle browser checks cover desktop/mobile sizing, assets, navigation, reduced motion, search handoff, detail links, real 404s and hydration. Account/admin visual checks use isolated mocked Clerk/API fixtures and block backend writes. Application tests retain submission retry, verification/claim, private access and queue safeguards. Build/type/lint and regression results are reported in the task completion message.

Production and the existing staging scheduler were not changed by this UI work.

## Jobs and launch pass — 22 October

Job cards and directory filters now share real vacancy data, URL-backed role/sector/town/region filters, retry/reset states, truthful role badges and explicit employment types only when supplied. Missing roster, pay estimates and training terms are no longer fabricated by the API or detail-page defaults. CI generates framework types and runs the Chromium suite. See [launch-readiness.md](launch-readiness.md) for actual production gates. Automatic Git deployments for codex/stack-staging are disabled to prevent use of the historical shared Preview database default; manual Preview deployment must pass isolated overrides.
