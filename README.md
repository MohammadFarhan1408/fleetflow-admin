# fleetflow-admin

FleetFlow operations web console (Next.js App Router). It is a client of [fleetflow-api](../fleetflow-api), which owns every business rule and data contract.

Read [CLAUDE.md](CLAUDE.md) first. The design contract is [design.md](design.md), the architecture is [architecture.md](architecture.md), and the current phase is in [phases.md](phases.md).

## Requirements

- Node.js 26 (`.nvmrc`)
- npm

## Setup

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The design token showcase is at <http://localhost:3000/dev/tokens>. It returns 404 when `NEXT_PUBLIC_APP_ENV=production`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | Generates Next route types, then runs `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run format:check` | Prettier check (`npm run format` to write) |
| `npm run lint:tokens` | Fails on raw colours, arbitrary values on design utilities, or spacing off the design.md scale |
| `npm test` | Vitest component and unit tests |
| `npm run test:e2e` | Playwright (Chromium) with axe; builds and starts the app on port 3100 |
| `npm run api:schema:sync` | Copies `../fleetflow-api/openapi/schema.yaml` into `openapi/fleetflow-api.yaml` (the pinned copy) |
| `npm run api:types` | Regenerates `src/generated/api.d.ts` from the pinned schema. Never edit that file by hand |

## Updating the API contract

1. `npm run api:schema:sync`
2. `npm run api:types`
3. Fix every compile error (`npm run typecheck`), and record the schema version in [memory.md](memory.md).
4. Commit the schema and the generated types together. CI fails if they drift apart.
