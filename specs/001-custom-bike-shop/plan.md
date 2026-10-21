# Plan: custom bike shop MVP

Source: `specs/001-custom-bike-shop/research.md` (including decisions 1–11). Each step is one reviewable change. Per AGENTS.md, I stop after each step and summarise.

## Architecture (SOLID mapping)

```
src/domain/        pure TS, no Next/DB imports, test-first
  shared/          Money
  catalogue/       entities + CatalogueRepository port + query helpers
  configuration/   selection rules (per-type compatibility, mandatory categories)
  pricing/         price lines, IVA breakdown, totals
  orders/          Order, OrderRepository port, placeOrder use case
  payments/        PaymentGateway port (interface only, no adapter)
src/adapters/      port implementations: static catalogue, in-memory orders
src/server/        composition root (server-only): wires adapters to use cases
src/i18n/          locales, market config, dictionaries, formatters
src/features/      UI per feature (configurator, bike preview, order form)
src/components/    shared UI (header, footer, trust signals)
src/app/[lang]/    thin routes: validate, call domain/use cases, render
```

How this maps to SOLID:
- **D**: use cases depend on ports (`CatalogueRepository`, `OrderRepository`, `PaymentGateway`), never on adapters.
- **O**: three things can be added without touching existing code:
  - a bike type, component, or locale: data only
  - a new category: one SVG layer renderer plus data
  - a payment provider: one new adapter
- **S/I**: ports and modules stay small and single-purpose.

## Assumptions

- **A1. Catalogue model.** It mirrors the diagram's entities and joins. The static data keeps the join lists (`typeComponents`, `prebuiltComponents`) so a Drizzle adapter can replace it 1:1 later. Additions to the diagram:
  - `Bike.bikeTypeId`
  - `BikeComponent.categoryId`, `taxRateBps` (2100 = 21%), `visual` (colour/variant for the SVG)
  - a `ComponentCategory` entity
  - names as `LocalizedText` (`{ es, en }`)
- **A2. Mandatory flag** moves from component to category, following decision 11 ("mandatory categories must be filled"). One component per category; an optional category can be "none". See Q2.
- **A3. Prices.**
  - Stored net, in integer cents, plus a tax rate.
  - The gross amount is computed and rounded half-up per line.
  - Totals are sums of lines, and the breakdown groups tax by rate.
- **A4. Stock.** `stock = 0` makes a component unavailable, and it is never decremented (no persistence).
- **A5. Categories for the MVP:** frame, fork, wheels, tyres, drivetrain, brakes, handlebar, saddle (mandatory); pedals, mudguards (optional). There is one pre-built bike per type, 4 types in all.
- **A6. Server is the source of truth.** The configurator state lives client-side, but the server action re-validates and re-prices from catalogue ids. Client prices are display-only.
- **A7. URLs and redirect.**
  - URL segments are shared English (`/es/configurator/road`); see Q3.
  - `proxy.ts` redirects locale-less paths using `Accept-Language`, falling back to `es`.
  - The matcher excludes `/api`, `_next` and files with extensions, so `/api/health` stays untouched.
- **A8. Order confirmation** is shown inline (via `useActionState`) with an order reference. There is no order page, since in-memory data would force dynamic rendering.
- **A9. DB status block.** The DB status sandbox block is removed from the home page. Postgres, `src/db` and `/api/health` stay as they are, unused by features.
- **A10. Images.** The bike preview is inline SVG built from React components, so there is no `next/image` and no `images` config.

## Steps

| # | Change | Files | Test first | Verify |
|---|---|---|---|---|
| 0 | Add `zod` as a direct dependency | `package.json`, lockfile | none | `npm ls zod` shows a direct dependency |
| 1 | Money value object: create, add, apply tax rate (half-up), sum; refuses mixed currencies | `src/domain/shared/money.ts` | `money.test.ts` | `npm test` |
| 2 | Catalogue types, `CatalogueRepository` port, pure queries (components for a type grouped by category, pre-built for a type) | `src/domain/catalogue/*` | `catalogue.test.ts` (with a small fixture) | `npm test` |
| 3 | Configuration rules: `fromPrebuilt`, `select` (rejects components that are off-type, out of stock or in the wrong category), `validate` (all mandatory categories filled, everything belongs to the type) | `src/domain/configuration/configuration.ts` | `configuration.test.ts` | `npm test` |
| 4 | Pricing: lines, net subtotal, tax breakdown by rate, gross total | `src/domain/pricing/pricing.ts` | `pricing.test.ts` | `npm test` |
| 5 | Static catalogue data (4 types, 10 categories, ~3 options per category per type, 4 pre-builts) and its adapter | `src/adapters/catalogue/static-catalogue.ts`, `catalogue-data.ts` | `static-catalogue.test.ts`: referential integrity, every pre-built passes `validate`, every text has `es` and `en` | `npm test` |
| 6 | Orders domain and payment port (see notes below) | `src/domain/orders/*`, `src/domain/payments/payment-gateway.ts`, `src/adapters/orders/in-memory-order-repository.ts` | `place-order.test.ts` and `in-memory-order-repository.test.ts`, using the real in-memory adapter (no mocks) | `npm test` |
| 7 | i18n core and formatting (see notes below) | `src/i18n/*`, `src/i18n/dictionaries/{es,en}.json` | `config.test.ts` (locale negotiation), `dictionaries.test.ts` (es and en have identical key sets), `format.test.ts` (`1234,50 €` for es, `€1,234.50` for en) | `npm test` |
| 8 | Locale routing skeleton (see notes below) | `src/proxy.ts`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx` (stub); delete `src/app/layout.tsx` and `src/app/page.tsx`; `src/components/site-header.tsx` | none (wiring only; locale logic is tested in step 7) | `npm run build`; `curl -I /` gives 307 to `/es`; `/api/health` gives 200 with no redirect; `/en` renders `lang="en"` |
| 9 | Home page: hero, CTA to `/[lang]/configurator`, footer with trust signals (warranty, shipping & returns, generic secure-payment badges); polished, responsive Tailwind with theme tokens in `globals.css` | `src/app/[lang]/page.tsx`, `src/components/{hero,site-footer,trust-signals}.tsx`, `globals.css` | none (presentational) | Manual check in `es`/`en`, mobile and desktop |
| 10 | Configurator: type picker and configure page (see notes below) | `src/app/[lang]/configurator/page.tsx`, `src/app/[lang]/configurator/[type]/page.tsx`, `src/features/configurator/*` | none beyond steps 3–4 (the client only calls domain functions) | Manual check: switching options updates the total; out-of-stock options are disabled |
| 11 | Layered SVG bike preview (see notes below) | `src/features/bike-preview/*` | `bike-visual.test.ts` | `npm test`; manual: changing the frame colour or wheels updates the preview |
| 12 | Order form (see notes below) | `src/features/order-form/*`, `src/app/[lang]/configurator/[type]/actions.ts`, `src/server/container.ts` | `order-form-schema.test.ts` | `npm test`; manual: an invalid email shows a localized error; a valid submit shows a reference |
| 13 | Fill in the AGENTS.md "Domain" section: entities, key flows, what is out of scope (admin, real payments, persistence, auth) | `AGENTS.md` | none | Review |

**Step notes**

- **Step 6:**
  - `PaymentGateway` port: `createPayment(order) → PaymentSession`. Interface only; nothing calls it.
  - `OrderRepository` port.
  - `placeOrder(input, deps)` use case: re-validates and re-prices the configuration, then saves the order with status `lead`, a generated id and a timestamp.
  - In-memory adapter: a `globalThis` singleton, following the same pattern as `src/db/index.ts`.
- **Step 7:**
  - Locale settings: `locales`, `defaultLocale`, `hasLocale`, and `negotiateLocale(acceptLanguage)`, hand-rolled with no new dependency.
  - Market config: `ES → EUR`, Intl locale `es-ES`.
  - `formatMoney`.
  - `getDictionary` via `next/root-params`, as in the Next docs.
- **Step 8:**
  - `generateStaticParams` returns `es` and `en`.
  - `generateMetadata` is localized.
  - The site header includes a language switcher.
- **Step 10:**
  - The type picker lists the 4 types; each card links to `/[lang]/configurator/[type]`.
  - The configure page uses `generateStaticParams` for the 4 types and calls `notFound()` for unknown ones.
  - It passes the catalogue slice plus the configurator part of the dictionary to a client `Configurator`, which shows option lists per category and a live price summary with the IVA breakdown.
- **Step 11:**
  - Pure `toBikeVisual(configuration, catalogue)` returns an ordered layer spec.
  - A layer registry maps each category to an SVG renderer (adding a category = registering one renderer).
- **Step 12:**
  - A Zod schema for the customer fields (see Q1) plus `bikeTypeId` and the selected component ids.
  - The server action validates input, calls `placeOrder` through the composition root, and returns error *codes*. The client translates them, because root-params aren't available in Server Actions.
  - A client form uses `useActionState`.

After each step I run `npm test && npm run lint && npm run typecheck`. Steps 8 onwards also run `npm run build`.

## Simpler alternatives / tradeoffs

- **Ports for a static catalogue** are slightly more code than importing the data directly. They're kept because the catalogue is the first thing to move to Postgres or an admin panel.
- **Shareable configuration URL** (selection kept in search params) would help stakeholders send links to each other. It's not planned; it can be added later without changing the domain.
- **Gross-price storage** (Spanish shelf prices including IVA) is an alternative to A3. Net storage plus a rate scales better across markets but can produce cent-rounding differences on displayed prices.

## Success criteria

- `npm test && npm run lint && npm run typecheck && npm run build` all pass. Every function in `src/domain/` has tests written before it.
- `/` redirects to `/es` (or `/en` for an English browser), and `/api/health` still works.
- The home page shows the hero, the CTA and the footer trust signals in both languages, and the language switcher keeps the current page.
- In the configurator, a user can:
  - pick one of 4 types
  - see its pre-built bike, with the SVG preview and IVA-inclusive price
  - swap options per category, with the preview and total updating live
  - not deselect a mandatory category
  - not pick an out-of-stock option
- Submitting the order form validates on the server, shows localized errors, and stores the order in memory with a reference shown to the user.
- No new dependencies apart from `zod`, and the payment port has no adapter.

## Open questions

1. **Order form fields.** I propose name, email, phone, shipping address (street, postal code, city, province), optional notes, and a required privacy-policy consent checkbox (GDPR). Add or remove anything?
2. **Mandatory flag (A2).** Is it OK to move it from component to category? Or did the diagram's component-level `Mandatory` mean something else, such as "included and can't be removed"?
3. **URL slugs (A7).** Shared English segments (`/es/configurator`) or localized ones (`/es/configurador`)? Localized slugs need a rewrite map in `proxy.ts`.
4. **Prices (A3).** Store net plus rate, or store gross (IVA-inclusive) prices?
5. **Brand name** for the hero, header and metadata: do you have one, or should I use a neutral placeholder?
