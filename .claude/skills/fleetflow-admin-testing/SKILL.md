---
name: fleetflow-admin-testing
description: FleetFlow admin testing guide (Vitest, React Testing Library, MSW, Playwright, axe). Use when writing or planning tests in fleetflow-admin or deciding which scenarios a UI change needs.
---

# FleetFlow admin testing

Source of truth: architecture.md §24. Read only the table for what you changed:
§24.2 components · §24.3 forms · §24.4 tables · §24.5 dispatch board · §24.6 maps · §24.7 auth/permissions · §24.8 import/export · §24.9 E2E.

Minimum for a new screen or feature:
- loading (skeleton), empty, error (retry works) and success, rendered via MSW handlers
- permission: action hidden without the permission; API 403 handled without a fake success
- form: required, invalid, boundary, API 400 field mapping, network failure, double submit sends one request
- keyboard path for the primary action; axe has no serious or critical violations (Playwright `@axe-core/playwright`)

Conventions:
- RTL queries by role, label or text. No `container.querySelector` or class selectors.
- `userEvent.setup()` for interactions; MSW for HTTP. Type MSW handlers from `src/generated/api.d.ts`.
- Playwright: mocked suite per PR; full-stack suite (real fleetflow-api in Docker) nightly or before release.
- Never weaken assertions or skip a11y or permission tests to get green. Report actual results.
