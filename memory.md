# fleetflow-admin: Memory (progress ledger)

Factual record only. Update after substantial tasks, dependency or architecture changes, and merges. Never record unrun tests as passed. Newest first.

## Project status
| Field | Value |
|---|---|
| Application | fleetflow-admin (operations web console) |
| Current phase | Phase 0: Architecture & UI Foundation (technical setup implemented; awaiting owner checkpoint) |
| Current branch | `feature/admin-foundation` (not pushed) |
| Overall status | Tooled, empty Next.js app with design tokens, restyled base primitives and a dev-only token showcase. No business screens. |
| Last updated | 2026-11-23 |

## Completed work
| Date | Branch | Work | Files | Tests run | Result |
|---|---|---|---|---|---|
| 2026-11-23 | feature/admin-foundation | Phase 0 technical setup: Next 16.4.6 scaffold (Turbopack, Cache Components on), TS 6.0.3 strict + `noUncheckedIndexedAccess`; `src/styles/tokens.css` (all design.md tokens, `light-dark()`, Tailwind defaults reset); IBM Plex Sans/Mono; shadcn base primitives restyled to design.md §6 (button, input, label, checkbox, switch, badge, card, dialog, dropdown-menu, tooltip, skeleton); `/dev/tokens` showcase (404 when `NEXT_PUBLIC_APP_ENV=production`); `lint:tokens` guard; pinned API schema + generated types; Vitest/RTL; Playwright + axe; GitHub Actions CI; `.env.example`; README | package.json, tsconfig.json, next.config.ts, eslint.config.mjs, .prettierrc.json, vitest.config.mts, playwright.config.ts, src/**, scripts/lint-tokens.mjs, openapi/fleetflow-api.yaml, tests/e2e/tokens.spec.ts, .github/workflows/ci.yml, docs | typecheck, lint, format:check, lint:tokens, Vitest (3 tests), `next build`, Playwright Chromium (4 tests: axe light + dark with zero serious/critical violations, theme toggle, dialog Esc + focus return), api:types drift (none), `npm audit --audit-level=high`, manual: production build returns 404 for `/dev/tokens`, screenshots of both themes reviewed | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-21 | main (uncommitted) | Workspace and documentation setup, repo initialized, Claude skills configured | CLAUDE.md, architecture.md, design.md, phases.md, rules.md, memory.md, skills.md, .claude/settings.json, .claude/skills/*, .gitignore | None (no code). Design token contrast ratios computed by script | Key pairs pass AA (see design.md §2) |

## Current work
| Task | Branch | Status | In progress | Blockers |
|---|---|---|---|---|
| Phase 0 technical setup | feature/admin-foundation | Implemented, checks green locally | — | Push + CI run; owner visual sign-off of `/dev/tokens` |

## Decisions
| ID | Decision | Context | Alternatives | Reason | Date | Branch | Status | Impact |
|---|---|---|---|---|---|---|---|---|
| D-WS-1 | Three independent repos; no root CLAUDE.md | Owner instruction | Monorepo | Independent releases | 2026-11-21 | main | APPROVED (owner) | Cross-app = separate PRs |
| D-WS-2 | Folder names fleetflow-api / fleetflow-admin / fleetflow-driver-app | Owner choice | — | — | 2026-11-21 | main | APPROVED (owner) | — |
| D-ADM-1 | Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui | architecture §2 | Vite SPA; MUI/Mantine | BFF for httpOnly tokens; owned component code | 2026-11-21 | main | APPROVED (owner, 2026-11-23) | — |
| D-ADM-2 | BFF proxy with httpOnly cookies | architecture §8–9 | Tokens in browser storage | XSS cannot steal tokens | 2026-11-21 | main | APPROVED (owner, 2026-11-23; API D-API-2 APPROVED 2026-11-22) | API auth design |
| D-ADM-3 | API types: openapi-typescript + openapi-fetch | architecture §2, §8 | orval-generated hooks | Smaller generated surface | 2026-11-21 | main | APPROVED (owner, 2026-11-23) | Generator runs via pinned `npx` (TS 5 peer), see Known issues |
| D-ADM-4 | Map: MapLibre + react-map-gl; tile provider TBD | architecture §16 | Google Maps | No per-load license | 2026-11-21 | main | NEEDS APPROVAL (tile provider may be paid) | Cost |
| D-ADM-5 | Design system: IBM Plex Sans/Mono, blue primary, light + dark | design.md | Inter/Geist; light only | Legible dense data; distinct look; night dispatch | 2026-11-21 | main | APPROVED (owner, 2026-11-23; visual sign-off at showcase checkpoint) | — |
| D-ADM-6 | Phase reorder: Customers before Shipments; Dashboard after Dispatch | phases.md | PROJECT.md order | Real data dependency; no mock dashboards | 2026-11-21 | main | PROPOSED | — |
| D-ADM-7 | TypeScript 6.0.3 | TS 7.0.2 (native) published 2026-11 | 7.0.2; 5.9.3 | Last JS compiler; Next 16.4 and typescript-eslint support it | 2026-11-23 | feature/admin-foundation | APPROVED (owner) | Revisit TS 7 when tooling supports it |
| D-ADM-8 | Theme tokens via `light-dark()` + `color-scheme`; `data-theme` attribute overrides the OS | design.md §2 | Duplicated `.dark` token block | One line per token mirrors the design table; Lightning CSS polyfills it | 2026-11-23 | feature/admin-foundation | IMPLEMENTED (follows D-ADM-5) | Phase 1 theme preference sets `data-theme` |
| D-ADM-9 | Spacing scale enforced by `lint:tokens` instead of replacing Tailwind's spacing multiplier | design.md §4 | Custom `--spacing-*` keys only | Sizes (28/32/40 px heights, 280 px tooltip) need the multiplier | 2026-11-23 | feature/admin-foundation | IMPLEMENTED; design.md §4 updated | CI fails off-scale padding/margin/gap |
| D-ADM-10 | API schema pinned in-repo (`openapi/fleetflow-api.yaml`) and generated types committed | rules §3, §7 | Read `../fleetflow-api` at build time | CI has no sibling checkout; contract changes become explicit diffs | 2026-11-23 | feature/admin-foundation | IMPLEMENTED | Update via `api:schema:sync` + `api:types` |

## Dependencies added/changed
2026-11-23, `feature/admin-foundation` (exact versions pinned in package.json):
- Runtime: next 16.4.6, react / react-dom 19.3.1, radix-ui 1.8.1, lucide-react 1.78.0, class-variance-authority 0.7.1, cn 0.5.2 (shadcn's clsx + tailwind-merge replacement), tw-animate-css 1.4.0.
- Dev: typescript 6.0.3, tailwindcss + @tailwindcss/turbopack 4.3.5, eslint 10.15.0 + eslint-config-next 16.4.6, prettier 3.10.1, shadcn 4.23.0 (CLI and `shadcn/tailwind.css` variants), vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @testing-library/jest-dom 8.0.0, @playwright/test 1.65.1, @axe-core/playwright 4.14.0, @types/node 26.6.6, @types/react / react-dom 19.3.0.
- Not installed: openapi-typescript 7.13.0 (run through `npx`, see Known issues).
- API schema pin: fleetflow-api `openapi/schema.yaml` version 0.1.0 at fleetflow-api commit c2017f8 (Phase 1: auth, `/me`, users).
- Bundle: Next 16.4 `build` no longer prints per-route sizes. All client chunks for the build (showcase only, every primitive) total about 221 KB gzip. Measure the console shell against the 200 KB budget in Phase 1.

## API requests (to fleetflow-api)
None yet.

### Received contracts from fleetflow-api (Phase 1, branch `feature/api-auth`, 2026-11-22)

Source of truth: `../fleetflow-api/CHANGELOG.md` and `openapi/schema.yaml`. Every path ends with a trailing slash.

- **Auth:**
  - `POST /api/v1/auth/login/` → `{access, refresh}`
  - `POST /api/v1/auth/refresh/` → `{access, refresh}`. Refresh tokens rotate on every use.
  - `POST /api/v1/auth/logout/` `{refresh}` → 204. Ends only this device's session, and its access token stops working immediately.
  - `POST /api/v1/auth/password-reset/` `{email}` → 202
  - `POST /api/v1/auth/password-reset/confirm/` `{uid, token, new_password}` → 204
- **Session bootstrap:** `GET /api/v1/me/` → `user{public_id,email,full_name}`, `company{public_id,name}`, `branches[{public_id,name}]`, `roles[]`, `permissions[]`.
- **Refresh only on `401 auth.token_expired`.** `auth.token_invalid` means the session is over (logout elsewhere, password reset, or theft detection): send the user to login.
- **Refresh retries are safe for 30 s:** re-sending the same refresh token within 30 s of using it returns a fresh pair. After that, it revokes the session.
- **Other error codes:**
  - `auth.invalid_credentials` (401)
  - `auth.user_disabled` (401)
  - `auth.company_suspended` (403)
  - `auth.account_locked` and `throttled` (429; honour `Retry-After`)
  - `auth.invalid_reset_token` (400)
  - `validation.invalid` (400, field `errors`)
- **Responses carry** `X-Request-ID` (show it in support or error screens) and a standard `Date` header.
- Password reset and invite emails link to `PASSWORD_RESET_URL` (default `http://localhost:3000/reset-password`) with `?uid=…&token=…`. The admin needs a page there that posts to the confirm endpoint.

- **Users API** (`users.view` / `users.manage`):
  - `GET /api/v1/users/` (cursor-paginated, `?page_size=` ≤ 100)
  - `GET /api/v1/users/{public_id}/`
  - `POST /api/v1/users/` `{email, full_name, roles[], branches[]?}`; the new user is invited by email.
  - `PATCH /api/v1/users/{public_id}/` `{full_name?, roles?, branches?, is_active?}`
  - Guard errors to surface in the UI: `user.cannot_modify_self` (409), `user.owner_required` (403), `user.last_owner` (409), `user.email_taken` (409), `validation.invalid_reference` (400).
- **`Idempotency-Key`** (any visible ASCII up to 255 characters; a UUID is recommended):
  - Scoped to the user and kept 72 h.
  - A retry returns the original success response with `Idempotent-Replayed: true`.
  - The same key with a different body gets `422 idempotency.key_reuse`.
  - A failed request can be retried with the same key.

## Branch history
### main
- 2026-11-21: Repo initialized (`git init -b main`). Baseline docs written (uncommitted, pending owner review).
- No application implementation.

### feature/admin-foundation
- 2026-11-23: Branched from `main`; cherry-picked the Phase 1 contracts memory commit from `docs/api-phase-1-contracts`.
- Implemented Phase 0 technical setup (see Completed work). All local checks pass. Not pushed, CI not run, not merged.

## Known issues
| Issue | Severity | Branch | Status | Resolution |
|---|---|---|---|---|
| TanStack Table v9 is a recent major; API stability unverified | Low | — | Open | Verify in Phase 1 when DataTable is built (not installed in Phase 0) |
| openapi-typescript 7.13.0 has a peer dependency on `typescript@^5.x`, and the app uses TS 6.0.3 | Low | feature/admin-foundation | Worked around | `api:types` runs `npx -p openapi-typescript@7.13.0 -p typescript@5.9.3`. It is not in the lockfile. Move it to devDependencies once a release supports TS 6 |
| ESLint 10 peer warnings from eslint-plugin-import 2.32.0 and eslint-plugin-jsx-a11y 6.10.2 (they list ESLint ≤ 9) | Low | feature/admin-foundation | Accepted | Next 16.4 docs state eslint-config-next supports ESLint 10 with these warnings. ESLint 9 is end-of-life. Lint runs clean |
| `npm audit` reports 4 moderate issues (minimatch via ts-morph in the shadcn CLI, dev-only) | Low | feature/admin-foundation | Accepted | Below the `--audit-level=high` gate; the runtime has 0 vulnerabilities (`--omit=dev`) |
| Map tile provider not chosen (possible paid service) | Medium | — | Open | Owner decision D-ADM-4 |

## Next steps
1. Push `feature/admin-foundation`, open the PR and confirm CI is green (on owner request).
2. Owner checkpoint: visual review of `/dev/tokens` in light and dark.
3. Owner decisions still open: map tile provider (D-ADM-4, needed by Phase 5), Sentry, hosting.
4. Phase 1 plan: app shell, auth pages, BFF, permissions, shared components (needs fleetflow-api Phase 1, which is complete).
