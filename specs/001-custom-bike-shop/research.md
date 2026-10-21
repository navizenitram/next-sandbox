# Research: custom bike shop MVP

## Task (verbatim)

We need to build and awesome website to sell custom bikes. We are building a prototype but it need to be able to scale, so take care to build it following the SOLID principles. Able to extend the features.

By now, we need a home page with the following sections:
- Hero section explaining the goal of the website
- CTA to the bike custom tool
- Trust signals in the footer.

The custom tool should be an interactive tool that by now able to request:
- What kind of bike do you want. After select the type we want to display a pre-build bike with options to custom o selecte diferent wheel, body, breaks, etc.. (explore what a bike needs)
- use the image as inspiration for data structure.
- We want also be able to show an image of the final bike
- For simplicity in this initial version add the order form in the custom tool
- No login needed by now
- We don't have decide the payment platform. So keeping in mind the port and adapter pattern to be able to use the final platform once decided. By now implement only the interface.

The market of the website is Spain but should be able to manage minimun English and Spanish and keep the code ready to open the wesite to international markets.

All this are going to need an Admin panel, payments... out of the scope for this initial concept. The goal is implement a MVP ready to share with stakeholders, get feedback before go deeper.

(Attached image: an entity diagram, transcribed under "Reference data model" below.)

## What exists today

The repo is a bare scaffold. None of the domain, UI, i18n or payments code exists yet.

| Area | Path | State |
|---|---|---|
| Root layout | `src/app/layout.tsx` | Default create-next-app layout: Geist fonts, `lang="en"` hard-coded, placeholder metadata ("Create Next App"). |
| Home page | `src/app/page.tsx` | Sandbox page showing DB status. Uses the `await connection()` inside `<Suspense>` pattern. |
| Health check | `src/app/api/health/route.ts` | Thin route handler that runs `select version()`. Calls `connection()` first. |
| DB client | `src/db/index.ts` | Drizzle + postgres.js, `import "server-only"`, global client reused in dev, throws if `DATABASE_URL` is missing. |
| DB schema | `src/db/schema.ts` | Empty (`export {}`). |
| Migrations | `drizzle/` | Only `.gitkeep`. Config in `drizzle.config.ts` reads `.env.local`. |
| Domain layer | `src/domain/` | Does not exist yet (AGENTS.md says business rules go here). |
| Tests | `vitest.config.mts` | Node env, includes only `src/**/*.test.ts` (not `.tsx`), `@` alias set to `src`, `passWithNoTests: true`. No tests exist. |
| Styles | `src/app/globals.css` | Tailwind 4 `@import "tailwindcss"`, light/dark CSS variables. |
| Static assets | `public/` | Only the default create-next-app SVGs. No bike images. |
| Specs | `specs/` | Empty. This is the first spec. |

## Stack and conventions (confirmed)

- Next.js **16.4.2**, React **19.3.0**, TypeScript strict, Node >= 24 (`package.json`).
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, Turbopack CSS rule for Tailwind. No `images` config, no i18n config.
- Direct deps: `drizzle-orm`, `postgres`, `server-only`, `next`, `react`. There is no validation, i18n or UI component library. AGENTS.md: ask before adding dependencies.
  - `zod@4.6.7` is in `node_modules` only as a transitive dependency of `eslint-config-next` (via `eslint-plugin-react-hooks`). It is not a direct dependency.
- Path alias `@/*` → `src/*` (`tsconfig.json`, `vitest.config.mts`).
- Rules from AGENTS.md that matter here:
  - DB access only from server code through `src/db`.
  - Domain logic in plain TS under `src/domain/`, written test-first, with `foo.test.ts` next to `foo.ts`.
  - Routes, pages and server actions stay thin and validate input at the boundary.
  - Never mock Drizzle. DB code gets integration tests later.
  - Schema workflow: edit `src/db/schema.ts`, then run `db:generate` and `db:migrate`. Never hand-edit `drizzle/`.
  - Pre-commit gate: `npm test && npm run lint && npm run typecheck && npm run build`.
- Commit `e9b20d1` deleted two AGENTS.md rules: "Money is stored as integer cents, never floats" and "Functional over polished UI: no styling work unless asked". So no money or styling rule is in force today.

## Next.js 16 specifics relevant to this task (from `node_modules/next/dist/docs/`)

- **i18n** (`01-app/02-guides/internationalization.md`):
  - No built-in i18n routing in the App Router.
  - The documented pattern is: a sub-path `app/[lang]/...` with the root layout under `[lang]`, a redirect in `proxy.ts` when the locale is missing, and per-locale dictionaries loaded server-side (`getDictionary`).
- **`proxy.ts` replaces `middleware.ts`**, which is deprecated in v16 (`03-file-conventions/middleware.md`, `proxy.md`). The file goes in `src/` next to `app/`.
- **`next/root-params`** (`04-functions/next-root-params.md`):
  - Exposes the `[lang]` segment to any Server Component or server utility.
  - Not available in Client Components, Server Actions or Route Handlers.
  - With Cache Components, each root param needs `generateStaticParams` returning at least one value, or the build fails. An empty array also errors (`02-guides/migrating-to-cache-components.md`).
- **Forms / Server Actions** (`02-guides/forms.md`, `server-actions.md`):
  - Server-side validation via a schema library (the docs show Zod).
  - Error display through `useActionState` in a Client Component.
- **Images** (`02-components/image.md`):
  - `images.qualities` is required starting in Next 16.
  - Remote images need `remotePatterns`.
  - Optimisation is not useful for SVG (`unoptimized`).
- **Cache Components**: request-time data must sit behind `await connection()` inside `<Suspense>` (AGENTS.md; already used in `src/app/page.tsx`).

## Reference data model (from the attached diagram)

| Entity | Fields |
|---|---|
| BikeType | ID, Description |
| TypeComponent | BikeTypeID, BikeComponentId (join: which components fit a type) |
| BikeComponent | ID, Description, Price, Stock, Tax, Mandatory |
| Bike | ID, Description (a pre-built bike) |
| PreBuildBikesComponent | BikeID, BikeComponentID (join: components of a pre-built bike) |

What the diagram does not include (facts, not proposals):
- No link from `Bike` to `BikeType`.
- No component category (wheel, brake, frame…) on `BikeComponent`, so nothing groups alternatives.
- No image field on any entity.
- No translatable text: `Description` is a single field.
- No currency on `Price`. No order or customer entities.
- `Tax` has no stated unit (rate or amount: unverified).

## Bike anatomy (domain background, general knowledge, not from the codebase)

Common configurable groups on a complete bike:
- Frame (the "body"), fork
- Wheelset (rims and hubs), tyres
- Drivetrain/groupset (shifters, derailleurs, crankset, cassette, chain)
- Brakes (rim, or mechanical/hydraulic disc)
- Handlebar, stem, saddle, seatpost, pedals
- Optional: suspension (MTB rear shock), motor and battery (e-bike), accessories (mudguards, rack, lights)

Typical bike types: road, mountain (MTB), gravel, city/urban, e-bike. Which groups are mandatory and which options are compatible differ by type. Examples: drop vs. flat bars; rim brakes are not usually compatible with disc-specific frames. The compatibility rules for this shop are **unverified** and need stakeholder input.

## How the task fits

Every part of the task is new code. Nothing existing needs refactoring apart from these:
- `src/app/page.tsx` and `src/app/layout.tsx` are placeholders. Under the documented i18n pattern they would move under `app/[lang]/`.
- `src/db/schema.ts` is empty. With decisions 1 and 4 below, the MVP adds no tables.
- `src/domain/` does not exist yet. The pricing, configuration validity and order rules would live there under AGENTS.md.
- `src/app/api/health/route.ts` sits outside any locale segment. How it interacts with a `proxy.ts` matcher is unverified.

## Decisions from the user (2026-10-21, answers to research questions)

1. **Catalogue**: static typed data in code, not Postgres.
2. **Final bike image**: layered SVG. Each component category draws its own layer, and the layers stack into one bike that updates live.
3. **Order submit**: save only. The order is stored as a lead. The payment port is defined but not called.
4. **Order storage**: in-memory adapter. Orders are lost on restart, and the MVP has no DB tables.
5. **Money**: EUR only, integer cents, currency kept on the value. Each component has a tax rate (Spanish IVA 21%). Prices are shown IVA-inclusive, with a breakdown.
6. **Locales**: `es` / `en`, default `es`, sub-path URLs (`/es/...`, `/en/...`).
7. **Trust signals (footer)**: warranty, shipping & returns, and secure payment badges (generic, no brand marks). No customer rating.
8. **Dependencies**: Zod may be proposed for validation. No i18n library; i18n follows the plain-dictionary pattern from the Next docs.
9. **Styling**: polished, responsive Tailwind. No UI library.
10. **Bike types**: Road, Mountain (MTB), Gravel, City/Urban.
11. **Compatibility rules**: per type only. A component must belong to the bike type (`TypeComponent`), and mandatory categories must be filled. No rules across components in the MVP.

## Still unverified

- Real business content (warranty length, shipping terms, prices, brand name): placeholders until stakeholders provide it.
- Postgres stays in the stack (`predev` starts it, `src/app/page.tsx` and `/api/health` use it), but with decisions 1 and 4 the MVP features don't need it.
- How `/api/health` behaves with a locale `proxy.ts` matcher.
