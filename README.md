# Faisal Nasir — portfolio website

A static portfolio that does not describe five GitHub projects, it runs them.
Each project is a small animated system faithful to the architecture in its own
README, and the visitor can drive it: place an order, fail a payment, ask a
question, broadcast an alert.

Built from `requirements.md` (behaviour), `design.md` (visual and technical
decisions) and PRD v2 (the only source of facts).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script                  | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Development server                                         |
| `npm run build`         | Runs the content check, then the static export into `out/` |
| `npm run lint`          | ESLint                                                     |
| `npm run typecheck`     | `tsc --noEmit`                                             |
| `npm test`              | Vitest unit and component tests                            |
| `npm run test:e2e`      | Playwright, against the built `out/`                       |
| `npm run bundle-check`  | First-load and per-screen gzip budgets                     |
| `npm run content-check` | Placeholder, slug-set and resume checks on their own       |

`npm run test:e2e` and `npm run bundle-check` both read `out/`, so run
`npm run build` first.

## Layout

```
src/
  app/                     routes, metadata, sitemap, robots, OG image
  components/
    layout/ hero/ ui/      shell, hero, buttons
    projects/ sections/    project sections, case studies, page sections
    screens/engine/        the one screen engine: types, scheduler, geometry, primitives
    screens/<project>/     one scene + scenarios per project
  content/                 every factual string on the site
  lib/                     fonts, metadata, skills index, resume gate
  styles/                  tokens.css, globals.css
scripts/                   content-check.ts, bundle-check.ts
tests/unit tests/e2e       Vitest and Playwright
docs/readme-trace.md       every on-screen element traced to its README
```

## Content

`src/content/*` is the only place facts live. Components contain no factual
copy, so summaries, stack lists and dates can be edited without touching a
component. `scripts/content-check.ts` runs from `prebuild`. It always fails if the project
slug set is not exactly the five in the requirements, and it fails on a
surviving `TODO_` placeholder when `NODE_ENV=production` — so placeholders warn
while you develop and block the production build. CI enforces that gate on
`main` only, which keeps pull requests green until the inputs below land.

## Still needed

These placeholders block a production build until they are filled in:

| Placeholder                    | What it needs                                                          |
| ------------------------------ | ---------------------------------------------------------------------- |
| `TODO_TAGLINE`                 | One sentence under the name, or a decision to drop the slot            |
| `TODO_NAME_AR`, `TODO_NAME_HE` | The preferred spelling of the name in Arabic and Hebrew                |
| `TODO_DATES`                   | Start (and end) dates for the TA and Hasoub roles                      |
| `public/resume.pdf`            | The resume to link; while it is missing every resume control is hidden |

Set `NEXT_PUBLIC_SITE_URL` to the deployment origin so canonical URLs, the
sitemap and the Open Graph tags point at the right host.

## Deviations from the design document

Two, both deliberate, both narrower than what the design proposed:

- **No animation library.** The design named Motion. The screen engine turned
  out to need one `requestAnimationFrame` loop and a typed step timeline, and
  packet positions are computed from polyline arithmetic in
  `screens/engine/geometry.ts` rather than `SVGPathElement.getPointAtLength`.
  That is testable without a DOM, renders correctly during the static export,
  and keeps first-load JavaScript down, so the dependency was dropped rather
  than shipped unused.
- **Shared-element transition via the View Transitions API.** The design named
  Motion's `layoutId`, which does not survive an App Router route change in a
  static export. `TransitionLink` wraps the navigation in
  `document.startViewTransition` and the screen carries a matching
  `view-transition-name` on both the section and the case-study page. Browsers
  without the API navigate normally; reduced motion collapses it to a 150ms
  crossfade.

## Deployment

`output: "export"` produces a fully static `out/` with no server runtime. CI
runs lint, type-check, unit tests, the production build with its content check,
Playwright and Lighthouse on every pull request.
