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
- Money is stored as integer cents, never floats.
- Functional over polished UI: no styling work unless asked.
- If something is ambiguous, ask instead of assuming.

## Domain

_To be filled in after scoping: entities, key flows, what is explicitly out of scope._
