<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16 App Router, TypeScript strict, Tailwind 4
- PostgreSQL 18 (docker compose) via Drizzle ORM + postgres.js
- DB access only from server code through `src/db` (`server-only`)
- Cache Components is on: request-time data goes behind `await connection()` inside `<Suspense>`

## Commands

- `npm run dev` starts Postgres and Next
- `npm test && npm run lint && npm run typecheck && npm run build` must pass before any commit
- Schema changes: edit `src/db/schema.ts`, then `npm run db:generate` and `npm run db:migrate`.
  Never hand-edit generated files in `drizzle/`.

## Workflow: Research → Plan → Implement

Work is done through `/research`, `/plan` and `/implement`, one spec folder per task under `specs/`.
Never skip a phase or start the next one without explicit approval.

## Testing

- Business rules live in plain TypeScript under `src/domain/`, with no framework or DB imports.
- Every domain function has unit tests (Vitest), written before the implementation: red, green, refactor.
- Tests sit next to the code: `foo.ts` → `foo.test.ts`.
- Route handlers and pages stay thin: they validate input, call domain code and render.
- Do not mock Drizzle or the database. DB-dependent code is covered by integration tests, added later.

## How to work in this repo

- One small, reviewable change at a time. Stop after each step and summarise what changed and why.
- Do not add dependencies without asking first.
- Validate all input at the server boundary (route handlers, server actions).
- If something is ambiguous, ask instead of assuming.

## Domain

Custom bike shop MVP for the Spanish market (`es`/`en`, EUR). Spec: `specs/001-custom-bike-shop/`.

### Entities (`src/domain/`)

- **Catalogue** (`catalogue/`): `BikeType`, `ComponentCategory` (holds the `mandatory` flag), `BikeComponent`
  (net price in integer cents, `taxRateBps` where 2100 = 21%, `stock`, `visual` for the preview),
  `Bike` (a pre-built bike, one per type), and the joins `TypeComponent` and `PrebuiltComponent`. Names are `{ es, en }`.
- **Configuration** (`configuration/`): `{ bikeTypeId, selections: categoryId → componentId }`, at most one component
  per category. A component must fit the type, be in stock and match the category. Every mandatory category is filled.
- **Money and pricing** (`shared/money.ts`, `pricing/`): tax is rounded half up per line. Totals are sums of lines,
  and tax is broken down by rate. Prices are shown with IVA included.
- **Order** (`orders/`): customer, configuration, a server-computed quote, and status `lead`.

### Ports and adapters

- `CatalogueRepository` → static data in `src/adapters/catalogue/`.
- `OrderRepository` → in memory (`src/adapters/orders/`). Orders are lost on restart.
- `PaymentGateway` → interface only. No adapter exists and nothing calls it.
- Adapters are wired only in `src/server/container.ts`.

### Key flows

1. `/` redirects to `/es` or `/en` (`src/proxy.ts`, `Accept-Language`, default `es`).
2. Home → configurator → pick a type → start from its pre-built bike → swap components. The SVG preview and the
   price update live on the client.
3. Order form → Server Action → Zod validation → `placeOrder` re-validates and re-prices from catalogue ids → saved as
   a lead → the reference is shown. The client translates error codes, since `next/root-params` isn't available in
   Server Actions.

### Extending

- A bike type, a component or a locale: data only (catalogue data or dictionaries).
- A category: data plus one renderer in `src/features/bike-preview/layers.tsx`.
- A payment provider: one `PaymentGateway` adapter, wired in the container.

### Out of scope

Admin panel, real payments, persistence (Postgres stays in the stack but is unused by features), authentication,
compatibility rules across components, stock decrements, and an order detail page.
