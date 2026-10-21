# Bike Studio: custom bike shop MVP

A prototype online shop for building a custom bike. You pick a bike type, start from a pre-built model, swap
components one by one and watch an SVG preview and the IVA-inclusive price update live. Then you leave your details
to place the order.

It targets the Spanish market (EUR, 21% IVA) in Spanish and English. It was built to share with stakeholders and
gather feedback, so the code is meant to grow: business rules are isolated from the framework, and external services
sit behind ports.

> **Status:** working MVP. Catalogue data, warranty and shipping copy, prices and the brand name are placeholders.
> There is no admin panel, no real payment and no persistence yet (see [Out of scope](#out-of-scope)).

## What it does

| Area | Behaviour |
|---|---|
| Locales | `/` redirects to `/es` or `/en` based on `Accept-Language` (default `es`). The language switcher keeps the current page. |
| Home | Hero explaining the shop, CTA to the configurator, footer with trust signals (warranty, shipping and returns, secure payment badges). |
| Configurator | Choose one of 4 types (road, mountain, gravel, city), each with a pre-built bike. 10 component categories, 8 required and 2 optional. Out-of-stock options are disabled and required categories can't be cleared. |
| Preview | Layered inline SVG: each category draws its own layer, using the component's colour and variant. |
| Pricing | Net prices in integer cents plus a tax rate per component. Tax is rounded half up per line, and an IVA breakdown is shown. |
| Order | Order form with server-side validation (Zod) and localized errors. The server re-validates and re-prices the configuration, saves the order as a `lead` and shows a reference. |

## Quick start

Requirements: Node.js 24 or later, and Docker (for Postgres, which only `/api/health` uses today).

```bash
npm run setup   # npm install + create .env.local from .env.example + start Postgres
npm run dev     # starts Postgres (predev) and Next.js on http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm test` / `test:watch` | Vitest unit tests |
| `npm run lint` / `typecheck` | ESLint; `next typegen` + `tsc --noEmit` |
| `npm run db:up` / `db:down` / `db:reset` / `db:psql` | Manage the Postgres container |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle migrations and studio |

Before every commit: `npm test && npm run lint && npm run typecheck && npm run build`.

## Stack

Next.js 16 (App Router, Cache Components, `proxy.ts`), React 19, TypeScript (strict), Tailwind CSS 4, Zod 4,
Vitest. Postgres 18 with Drizzle ORM is wired in but not used by the shop yet.

> Next.js 16 differs from older versions in several places (`proxy.ts` replaces `middleware.ts`, `next/root-params`,
> Cache Components). Check `node_modules/next/dist/docs/` before changing framework code. [AGENTS.md](AGENTS.md)
> has the project rules.

## Architecture

Ports and adapters, with business rules in plain TypeScript. Dependencies point inwards: `app` → `features` →
`domain`. Only `server/container.ts` knows which adapter implements each port.

```
src/
  domain/            Pure TypeScript, no framework or DB imports, unit-tested
    shared/          Money: integer cents, currency, half-up tax
    catalogue/       Entities, CatalogueRepository port, queries
    configuration/   Selection rules: fromPrebuilt, select, validate
    pricing/         Price lines, IVA breakdown, totals
    orders/          Order, OrderRepository port, placeOrder use case
    payments/        PaymentGateway port (interface only)
  adapters/          Port implementations
    catalogue/       Static catalogue data (in code)
    orders/          In-memory order repository
  server/
    container.ts     Composition root: wires adapters to ports (server-only)
  i18n/              Locales and negotiation, market config, formatters, es/en dictionaries
  features/          UI per feature
    configurator/    Client configurator: options, live price summary
    bike-preview/    toBikeVisual (pure) + geometry + one SVG renderer per category
    order-form/      Zod schema, form state, client form (useActionState)
  components/        Shared UI: header, language switcher, hero, footer, trust signals
  app/[lang]/        Thin routes: home, type picker, configure page, Server Action
  proxy.ts           Locale redirect
  db/                Drizzle client (unused by features for now)
```

### Domain model

It follows the original entity diagram, plus a few additions:

- **BikeType**, **Bike** (a pre-built bike per type) and **BikeComponent**, linked by **TypeComponent** (which
  components fit a type) and **PrebuiltComponent** (what a pre-built bike is made of).
- **ComponentCategory** groups alternatives (frame, fork, wheels…) and holds the `mandatory` flag.
- `BikeComponent` has `netPrice` (Money), `taxRateBps` (2100 = 21%), `stock` (0 = unavailable) and `visual`
  (colour and variant for the preview). Names are `{ es, en }`.
- A **Configuration** is `{ bikeTypeId, selections: categoryId → componentId }`. It is valid when every
  component exists, sits in its category, fits the type and is in stock, and when every mandatory category is filled.
- An **Order** stores the customer, the configuration and a server-computed quote, with status `lead`.

### Request flow

1. `src/proxy.ts` redirects locale-less paths. It skips `/api`, `_next` and files with an extension.
2. Pages under `app/[lang]/` are prerendered for each locale and bike type. They read the locale with
   `next/root-params`, load the dictionary and the catalogue through the container, and render.
3. The browser receives only the catalogue slice for the chosen type. It calls the same domain functions
   (`select`, `priceConfiguration`, `toBikeVisual`) to update the preview and the price instantly. Prices in the
   browser are for display only.
4. On submit, the Server Action validates the form with Zod and calls `placeOrder`. `placeOrder` re-validates and
   re-prices from catalogue ids, then saves the order. The action returns error codes and the browser translates
   them, because root params aren't available in Server Actions.

### Testing

- Every domain function has unit tests written before the code (red, green, refactor), in `foo.test.ts` next to
  `foo.ts`.
- Adapters are tested for real, with no mocks: catalogue integrity checks (references, every pre-built bike is
  valid, every text exists in both languages) and the in-memory repository.
- i18n has tests for locale negotiation, formatting and identical keys across dictionaries.
- Database code will get integration tests. Drizzle is never mocked.

## Forking and evolving it

1. Fork the repository on GitHub, clone your fork and run `npm run setup`.
2. Read [AGENTS.md](AGENTS.md). It holds the conventions and the domain summary, and AI coding agents load it
   automatically.
3. Work in small, reviewable steps and keep the gate green
   (`npm test && npm run lint && npm run typecheck && npm run build`).

### Workflow: Research → Plan → Implement

Each task gets a folder under `specs/` (see [`specs/001-custom-bike-shop/`](specs/001-custom-bike-shop/) for the
MVP). With Claude Code, the `/research`, `/plan` and `/implement` skills in `.claude/skills/` drive each phase.
Each phase needs explicit approval before the next one starts. Without an agent, follow the same steps by hand:
write `research.md` (facts), then `plan.md` (steps, each with its test), then implement test-first.

### Common extensions

| You want to… | Change |
|---|---|
| Add a bike type, component or pre-built bike | Data only: `src/adapters/catalogue/catalogue-data.ts`. The catalogue tests check integrity. |
| Add a component category | Data in `catalogue-data.ts`, plus one renderer in `src/features/bike-preview/layers.tsx`. Optionally set its slot in `drawOrder` in `bike-visual.ts`. |
| Add a language | Add it to `locales` in `src/i18n/config.ts`, `LocalizedText` in `src/domain/catalogue/catalogue.ts`, `intlLocales` in `src/i18n/market.ts`, a new `src/i18n/dictionaries/<lang>.json`, and the `<lang>` loader in `src/i18n/dictionaries.ts`. TypeScript and the dictionary test flag anything missing. |
| Open another market | Extend `src/i18n/market.ts` (country, currency, Intl locales) and the postal-code rule in `src/features/order-form/order-form-schema.ts`. |
| Plug in a payment provider | Implement `PaymentGateway` (`src/domain/payments/payment-gateway.ts`) in `src/adapters/payments/`, wire it in `src/server/container.ts`, and call it after `placeOrder`. |
| Persist orders or the catalogue in Postgres | Add tables in `src/db/schema.ts`, then run `npm run db:generate && npm run db:migrate`. Write a Drizzle adapter for `OrderRepository` or `CatalogueRepository` under `src/adapters/`, swap it in the container, and add integration tests. The domain stays the same. |
| Add compatibility rules (e.g. disc brakes need disc wheels) | Extend `validate` and `select` in `src/domain/configuration/configuration.ts`, test-first. |

## Out of scope

Admin panel, real payments, persistence, authentication, compatibility rules across components, stock decrements
and an order detail page. These are the natural next steps.

## Known limitations

- Orders live in memory and are lost when the server restarts.
- An unknown bike type URL (e.g. `/es/configurator/unicycle`) shows the not-found page with status 200 and
  `noindex`. This is how Next.js 16 handles `notFound()` in a partially prerendered page.
- All city frames share the step-through geometry in the preview.
