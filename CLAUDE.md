# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Faisal Nasir's portfolio. It is a statically exported Next.js 15 / React 19 site. Instead of describing six projects (five public GitHub repositories and one private client project), it runs each one as a small animated system diagram that the visitor can drive (place an order, fail a payment, ask a question, and so on). Every factual claim, and everything drawn on a screen, must be traceable to PRD v2 or to that project's own README.

Code comments cite `R<n>.<m>` (requirements.md), `design §<n>` (design.md), task numbers (tasks.md) and "PRD v2". **None of these specs are in the repo.** Keep the citations when you edit code. If a change depends on what a spec says, ask the user instead of guessing.

## Commands

```bash
npm run dev              # dev server, http://localhost:3000
npm run build            # prebuild runs scripts/content-check.ts, then static export to out/
npm run lint             # ESLint (next build skips lint, so run it separately)
npm run typecheck        # tsc --noEmit
npm test                 # Vitest, tests/unit/** only (jsdom)
npm run test:e2e         # Playwright against out/, served on :4173 — build first
npm run bundle-check     # gzip budgets against out/ — build first
npm run content-check    # placeholder / slug / resume checks on their own
npm run format           # Prettier (double quotes, trailing commas, width 100)
```

Single tests:

```bash
npx vitest run tests/unit/schedule.test.ts
npx vitest run -t "releases inventory before the order reaches FAILED"
npx playwright test tests/e2e/screens.spec.ts --project=chromium-wide -g "Order-Saga"
```

Playwright has two projects: `chromium-wide` (1440×900) and `chromium-narrow` (Pixel 7). Locally it reuses a server already running on :4173. The first run needs `npx playwright install chromium`.

Writing e2e tests:
- Wait for `hydrated(page)` from `tests/e2e/hydrated.ts` before clicking anything. Until React hydrates, buttons have no handlers.
- Take project slugs and titles from `tests/e2e/content.ts` (`visibleSlugs`, `visibleTitles`). A test about one project calls `test.skip(!onSite(slug), …)`, so hiding a project never fails the suite.
- For reduced motion, call `page.emulateMedia({ reducedMotion: "reduce" })`. `test.use({ reducedMotion })` doesn't reach `matchMedia` in this setup.

Placeholders (`TODO_*` in `src/content/*.ts`) only warn during `npm run build`; the UI hides them, so the site deploys with them. `CONTENT_GATE=strict npm run content-check` makes them fail; CI runs that on `main` only. Don't key anything on `NODE_ENV`, which Vercel's build may set by itself. Lighthouse: `npx lhci autorun` against `out/`, with every category at ≥ 0.9, LCP ≤ 2.5s and CLS ≤ 0.1. `lighthouserc.cjs` audits whichever case-study page was exported: `order-saga` if it's visible, otherwise the first one.

CI (`.github/workflows/ci.yml`, Node 20) runs, in order: lint → typecheck → unit → build → prod content gate (main only) → bundle-check → e2e → Lighthouse.

## Architecture

### Static export constraints
`next.config.mjs` sets `output: "export"`, `trailingSlash: true` and unoptimized images. There is no server runtime, so there are no API routes, server actions, middleware or on-demand dynamic routes. Case-study pages come from `generateStaticParams`. Server-only code runs only at build time; for example, `src/lib/resume.ts` uses `existsSync` to hide every resume control when `public/resume.pdf` is missing. `NEXT_PUBLIC_SITE_URL` sets the canonical, sitemap and Open Graph origin (see `src/lib/metadata.ts`).

### Content layer: `src/content/`
Facts live only here, in `site.ts`, `projects.ts`, `experience.ts` and `skills.ts`. Components contain no factual copy. Project `summary` and `stack` are quoted verbatim from the READMEs. `howItWorks` may only recombine statements already present in the file. Unfilled values are `TODO_*` strings, and components check them with `isPlaceholder()` from `site.ts`. The set of project slugs is fixed at exactly six (`EXPECTED_SLUGS` in `scripts/content-check.ts`), and the build fails if it changes.

The Salon Appointment System (`salon`) is a private client project:
- It has no `github`, so the UI shows "Private client project".
- Its facts come from `PROJECT-OVERVIEW.md` in its private repository, not a README; `docs/readme-trace.md` cites it by section.
- That document's §17 binds this site: never name the client or its business, and never invent a figure it doesn't state.
- The portfolio repo is public, so this matters.

Each project has a `visible` flag. The owner hides and shows projects by editing it; the how-to is in the README and at the top of `projects.ts`. Rules for code:
- Anything a visitor sees reads `visibleProjects`, never `projects`. That covers:
  - the Projects section, the case-study routes and the sitemap;
  - the Skills captions (`lib/skillsIndex.ts`);
  - the hero map, via `visibleHeroScene`, `visibleHeroNodes` and `visibleHeroAscii` in `hero/heroMap.ts`;
  - the counts in the copy (`countWord` in `lib/count.ts`);
  - the site description (`describeSite` in `site.ts`).
- `projects` and `projectSlugs` stay the full list, for the content check and for tests.
- `getProject` returns only visible projects.
- The build fails if every project is hidden.
- `heroAsciiFor` rebuilds the ASCII intro from its pieces. With the five public projects visible and Salon hidden, it must equal the original drawing; `tests/unit/visibility.test.ts` pins it, and the original description too.

### README fidelity
Every label, topic name, status and number drawn on a project screen must come from that project's README. `docs/readme-trace.md` maps each on-screen element to its README source. If you add or change something on a screen, update that file. Any value the README does not document (for example the tech-news-agent first-pass confidence `0.52`) must be captioned "illustrative" in the UI and marked as illustrative in the trace. Some of these rules are enforced by tests, such as the allowed Order-Saga packet labels.

### Screen engine: `src/components/screens/engine/`
One engine drives all six screens:
- `types.ts`: a `Scene` (nodes, edges, and an optional `narrow` layout) and a `Scenario` (a timeline of typed `Step`s: `packet`, `pulse`, `status`, `set`, `morph`, `say`, plus a `narration` string list).
- `schedule.ts`: a **pure** scheduler with no DOM and no React (`tick`, `endState`, `scenarioDuration`). Pausing just stops `elapsed` from growing. At most 6 packets are in flight (3 on slow devices). In reduced motion, packets are skipped and one step is applied every 150ms.
- `geometry.ts`: packet paths are polyline arithmetic, not `SVGPathElement.getPointAtLength`, so they can be tested without a DOM and rendered during the static export.
- `useScenario.ts`: one `requestAnimationFrame` loop per screen. It runs only while the screen is in view, the tab is visible and a scenario is playing. "In view" (`isInView` in `hooks.ts`) means at least 50% of the screen is visible, or, for a screen too tall for that, that it fills half the viewport. The default scenario autoplays once and never loops.
- `ScenarioScreen.tsx`: the body every screen shares (SVG stage, scenario buttons, "Show as text"). It is wrapped in `ScreenBoundary`, which falls back to `StaticScreen` (the scenario's end state) if rendering throws.
- `Screen.tsx`, for the narrow layout:
  - `NARROW_QUERY` is `(max-width: 767px) and (orientation: portrait)`. A phone held sideways gets the wide scene.
  - The static export can't know the viewport, so `ResponsiveStage` puts **both** layouts in the markup until hydration, and the `.screen__stage--wide/--narrow` rules in `globals.css` show the matching one. After hydration only the matching layout is rendered.
  - Keep that CSS query in step with `NARROW_QUERY`. Draw every stage through `ResponsiveStage`; don't render an `<svg>` for a scene directly.

Each project folder `screens/<project>/` provides `scene.ts`, `scenarios.ts` and a `*Screen.tsx`.
- **Project artwork.** The screen component passes an `overlay(state, scene)` render function for project-specific artwork. The overlay reads `state.status[nodeId]` and the `state.values[...]` written by `set` steps, whose keys are dotted, such as `inventory.processed` or `extract.strategy`.
- **Draw order.** `overlay` is painted **under** the nodes, and node boxes have an opaque fill. Artwork that sits inside a node's box (the STOMP server internals, the RAG vector dots) goes in the `foreground(state, scene)` prop instead. Such nodes set `labelAt: "top"` so their label clears the artwork.
- **Narrow layouts.** An overlay branches on `scene.viewBox[0] < 500` when narrow positions differ. Check both layouts at 390px and 1440px; `routes.spec.ts` asserts that no diagram text leaves its stage.
- **con-Detection is the exception.** It has no scenarios and runs its own frame loop, using `Screen`, `ResponsiveStage` and the engine hooks directly.

`tests/unit/scenarios.test.ts` loops over the screens that have scenarios and checks that:
- steps are in ascending `t` order;
- every edge and node a step references is declared in the scene;
- narrow-layout nodes are a subset of the wide-layout nodes;
- every scenario has narration and runs to `done`.

Register any new scenario-based screen in that test's `screens` list.

### Loading and budgets
`components/projects/ScreenMount.tsx` loads each screen with `next/dynamic`, which keeps every screen in its own chunk. SSR stays on so the first frame is in the static HTML. `ScreenId` in `content/projects.ts` maps each project to its screen. Budgets enforced by `scripts/bundle-check.ts`: first-load JS ≤ 180 KB gzipped, and each lazy chunk ≤ 60 KB gzipped.

### Accessibility and degradation
- The screen SVG is `aria-hidden`. The accessible content is the narration list, and `say` steps are announced politely as "Step N of M: …".
- An inline script in `app/layout.tsx` adds `has-js` to `<body>` before paint. CSS uses that class to show the `.js-only` controls and to collapse the phone nav behind its Menu toggle. With JavaScript off, the static first frame remains and the nav links stay visible.
- When the OS asks for reduced motion, screens show a "Play with motion" opt-in.

### Deliberate deviations from the design (don't undo them)
- **No animation library.** Motion was removed on purpose; don't add it or anything like it.
- **Shared-element transition via the View Transitions API.** `ui/TransitionLink.tsx` wraps navigation in `document.startViewTransition`. The screen carries the same `view-transition-name` on the project section and on its case-study page.

### Styling
`globals.css` imports Tailwind v4, but components use semantic classes defined in `globals.css` (`screen__strip`, `stack-16`, `t-body`, `section`, …), not Tailwind utilities. All visual values resolve to CSS custom properties in `src/styles/tokens.css`. SVG artwork uses those properties too, for example `var(--signal)`, `var(--fault)`, `var(--screen-muted)` and `var(--font-mono)`.

Phone layout rules:
- Single-column grids declare `grid-template-columns: minmax(0, 1fr)`. An `auto` track grows to a screen's widest row and pushes the whole page sideways on a phone.
- Below 768px, screen buttons wrap onto rows and the title strip stacks.
- Hover styles sit inside `@media (hover: hover)` so they don't stick after a tap.

### Conventions
- Import from `src/` through the `@/*` alias.
- ESLint ignores unused variables prefixed with `_`.
- Vitest globals are enabled. `vitest.setup.ts` stubs `matchMedia`, `IntersectionObserver` (reports as intersecting right away) and the SVG geometry APIs.
