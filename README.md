# Faisal Nasir — portfolio website

A static portfolio that does not describe its six projects, it runs them.
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
slug set is not exactly the six projects (the five in the requirements plus
the Salon Appointment System). A surviving `TODO_` placeholder only warns, because
the site hides every placeholder and can go live without them; it fails only
with `CONTENT_GATE=strict`, which CI sets on `main` to track the inputs below.

### Hiding, showing and editing a project

Everything is in `src/content/projects.ts`. After a change, run `npm run build`
and deploy `out/`.

- **Hide:** set `visible: false` on the project. It leaves the whole site: its
  section, its `/projects/<slug>/` page, its hero-map node, the sitemap, the
  Skills captions and the project counts in the copy.
- **Show again:** set it back to `visible: true`. Nothing is lost while it is
  hidden.
- **Edit:** change `title`, `github`, `systemSummary`, `summary`, `stack`,
  `stackTable`, `howItWorks` or `highlights`.
- **Reorder:** move the entry. The list order is the order on the page.
- **Private project:** leave out `github`. The project shows "Private client
  project" instead of a GitHub link. The Salon Appointment System is one: its
  facts come from its private repository's `PROJECT-OVERVIEW.md`, and the
  client is never named.

Don't delete an entry, and don't change `slug` or `screen`. The build expects
all six projects to be in the file, and it stops if every one of them is
hidden.

## Still needed

These placeholders are hidden on the site until they are filled in:

| Placeholder                    | What it needs                                                          |
| ------------------------------ | ---------------------------------------------------------------------- |
| `TODO_TAGLINE`                 | One sentence under the name, or a decision to drop the slot            |
| `TODO_NAME_AR`, `TODO_NAME_HE` | The preferred spelling of the name in Arabic and Hebrew                |
| `TODO_DATES`                   | Start (and end) dates for the TA and Hasoub roles                      |
| `public/resume.pdf`            | The resume to link; while it is missing every resume control is hidden |

Canonical URLs, the sitemap and the Open Graph tags use
`https://www.faisalnasir.dev`. Set `NEXT_PUBLIC_SITE_URL` to deploy under
another origin.

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
