# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Faisal Nasir's personal portfolio, live at https://www.faisalnasir.dev (served by Vercel). It is a single-page TanStack Start (React 19, SSR) app that was generated with Lovable and is still connected to it.

## Lovable sync — read before touching git

See [AGENTS.md](AGENTS.md). The `main` branch syncs both ways with the Lovable editor:

- Never rewrite pushed history (no force push, no rebase/amend/squash of pushed commits) — it destroys the project history on Lovable's side.
- Every push to `main` shows up in the Lovable editor and deploys, so keep the branch working.

## Commands

```sh
npm i            # package-lock.json is what CI uses; bun.lock is kept for Lovable
npm run dev      # vite dev server
npm run build    # production build (client + SSR + nitro) into .output/
npm run build:dev  # same build in development mode (unminified, easier to debug)
npm run preview  # serve the production build
npm run lint     # eslint, with prettier as an eslint rule
npm run format   # prettier --write .
npx tsc --noEmit # type-check (there is no typecheck script); passes cleanly, keep it that way
```

There is no test runner and there are no tests. `npx tsc --noEmit` plus eslint on the changed files is the whole verification loop.

Things that look broken but are known state:

- `npm run lint` fails on a clean checkout. The real errors are prettier formatting in `src/routes/index.tsx`, `src/routes/__root.tsx` and `src/lib/portfolio-data.ts`, while `src/components/ui/` only adds expected `react-refresh/only-export-components` warnings; the rest is noise from a stale, gitignored `.next/` directory if one exists locally (eslint only ignores `dist`, `.output`, `.vinxi`). Lint just the files you changed, e.g. `npx eslint src/routes/index.tsx`.
- `.github/workflows/ci.yml` is left over from the previous Next.js version of the site. It calls npm scripts that no longer exist (`typecheck`, `test`, `content-check`, `bundle-check`, `test:e2e`) plus Playwright and Lighthouse CI, which are not installed, so it cannot pass as written.
- `npm run build` writes `.output/` and `.wrangler/`, and neither is in `.gitignore` (which still lists Next.js paths). Don't commit them.

## Architecture

**Build config is hidden in a preset.** [vite.config.ts](vite.config.ts) only calls `defineConfig` from `@lovable.dev/vite-tanstack-config`, which already registers TanStack Start, React, Tailwind v4, tsconfig paths, the `@/` alias, nitro and env injection. Adding any of those plugins by hand duplicates them and breaks the app; pass extra options through `defineConfig({ vite: { ... } })` instead. Nitro's default target in the preset is Cloudflare, which is why a local build emits wrangler files even though production runs on Vercel.

**Request path.** The server entry is [src/server.ts](src/server.ts) (wired up via `tanstackStart.server.entry` in the vite config), which wraps TanStack Start's own server entry. Error handling is layered on purpose:

1. [src/start.ts](src/start.ts) — request middleware that turns thrown non-HTTP errors into the static HTML from [src/lib/error-page.ts](src/lib/error-page.ts). It also re-adds the CSRF middleware for server functions, which Start only installs automatically when `src/start.ts` is absent.
2. [src/server.ts](src/server.ts) — catches what the middleware cannot: h3 swallows in-handler throws into a JSON 500 (`{"unhandled":true,"message":"HTTPError"}`), so the wrapper detects that body and swaps in the error page.
3. [src/lib/error-capture.ts](src/lib/error-capture.ts) — imported for its side effect of patching `console.error`, so the original error (stack and cause chain) can be recovered after h3 has discarded it.
4. `ErrorComponent` in [src/routes/__root.tsx](src/routes/__root.tsx) — the client-side boundary, which reports to the Lovable editor through [src/lib/lovable-error-reporting.ts](src/lib/lovable-error-reporting.ts) (a no-op outside the editor preview).

**Routing.** File-based, under `src/routes/` (conventions in [src/routes/README.md](src/routes/README.md)). `src/routeTree.gen.ts` is generated — never edit it. [src/routes/__root.tsx](src/routes/__root.tsx) owns the HTML shell, the global `<head>` (fonts, favicon, default meta) and the React Query provider; the `QueryClient` is created per router in [src/router.tsx](src/router.tsx) and passed down as route context. This is not Next.js: no `src/pages/`, no `app/layout.tsx`, no `server-only` package (eslint blocks that import — use `*.server.ts`).

**The site itself** is one route, [src/routes/index.tsx](src/routes/index.tsx), holding every section (nav, hero, projects, about, skills, contact) plus its small helper components. All copy and links come from [src/lib/portfolio-data.ts](src/lib/portfolio-data.ts) — change content there, not in the JSX. The two portrait photos are `src/assets/faisal-front.png` and `faisal-side.png`, imported through the `@/assets/` alias, not served from `public/`. The case-study URLs in that file point at `/projects/<slug>/`, routes that existed in the old Next.js site and have no counterpart here, so they currently 404.

**Styling.** Tailwind v4 with no config file: the design tokens live in [src/styles.css](src/styles.css) as CSS variables in `:root` / `.dark`, registered through `@theme inline`. Colors must be `oklch`. Beyond the shadcn defaults the site adds `ink`, `primary-glow`, the `bg-grid` / `bg-hero-glow` utilities, and the `rise`, `float-*` and `reveal` animation classes (`reveal` elements start hidden and get `is-in` from the `useReveal` `IntersectionObserver` in `index.tsx`, so any new `.reveal` element must be on the page when that hook runs or it stays invisible; all of these are disabled under `prefers-reduced-motion`). Fonts are DM Sans (body), Space Grotesk (`font-display`) and JetBrains Mono (`font-mono`), loaded from Google Fonts in `__root.tsx`.

**`src/components/ui/`** is the full shadcn/ui set (new-york style, config in [components.json](components.json)). The page uses none of it yet; treat it as a vendored library and add components with the shadcn CLI.

## Conventions

- TypeScript is strict, with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature` turned on.
- Prettier: 100 columns, double quotes, semicolons, trailing commas.
- [bunfig.toml](bunfig.toml) refuses package versions published less than 24 hours ago. Ask the user before adding a package to `minimumReleaseAgeExcludes`.
- Favicons are `public/favicon.svg` and `public/favicon.ico`, linked from `__root.tsx`.
