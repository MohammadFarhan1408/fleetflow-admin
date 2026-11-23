# fleetflow-admin: Memory (progress ledger)

Factual record only. Update after substantial tasks, dependency or architecture changes, and merges. Never record unrun tests as passed. Newest first.

## Project status
| Field | Value |
|---|---|
| Application | fleetflow-admin (operations web console) |
| Current phase | Phase 1: Core Application Shell (IN PROGRESS, PR 2/3 shell) |
| Current branch | `feature/admin-shell` (stacked on `feature/admin-auth`; neither pushed) |
| Overall status | Phase 0 COMPLETED (PR #1 merged, owner checkpoint passed 2026-11-23). Auth (PR 1) and the v2 "Indigo & Signal" design system with the app shell (PR 2) implemented; users list not started. |
| Last updated | 2026-11-23 |

## Completed work
| Date | Branch | Work | Files | Tests run | Result |
|---|---|---|---|---|---|
| 2026-11-23 | feature/admin-shell | Phase 1 PR 2/3 plus design v2: design.md v2 "Indigo & Signal" (palette from the owner's reference plus signal orange, Nunito Sans + Plex Mono, larger radii, soft elevation, no all-caps, §13 Claude skills workflow and quality bar); tokens.css v2 with chart and brand tokens; token-aware `cn` (fixes dropped type styles); split auth layout with the route-line panel; app shell (collapsible sidebar with remembered state, mobile drawer, sticky header, breadcrumbs, branch switcher, user menu with theme and sign out, skip link); session context and `usePermissions`; navigation config; theme preference applied before first paint; home built from `/me`; 404 and console error boundary; `lint:tokens` rejects all-caps | design.md, src/styles/tokens.css, src/lib/{cn,preferences,theme,navigation,format}.ts, src/components/shell/**, src/components/shared/{brand,page-header}.tsx, src/features/session/**, src/features/auth/components/{route-panel,auth-card}.tsx, src/app/(auth)/**, src/app/(console)/**, src/app/not-found.tsx, src/app/layout.tsx, eslint.config.mjs, scripts/lint-tokens.mjs | typecheck, lint, format:check, lint:tokens, Vitest (68 tests: cn token merging and tokens.css sync, navigation filtering/active item, user menu theme + sign out + failure, branch switcher 0/1/many/stale, plus PR 1 suites), `next build`, Playwright Chromium (11), contrast script for every v2 token pair (all AA in both themes), full-stack against local fleetflow-api: screenshots reviewed at 1440 light/dark, collapsed, 1024, 390, drawer, menu, 404, login; axe (WCAG 2.2 AA tags) on home light/dark, open menu light/dark, mobile, drawer, collapsed: no violations after fixes; saved dark theme present at first paint; skip link is the first tab stop | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-23 | feature/admin-auth | Phase 1 PR 1/3: BFF auth routes (login, logout, password reset, confirm) with httpOnly cookies, Origin + JSON CSRF check, client IP forwarding; `proxy.ts` session redirect and token refresh for page navigations (single-flight per token); `(auth)` pages (sign in, forgot password, set password for resets and invitations) with RHF + Zod; `(console)` session gate via `/me` behind Suspense; temporary signed-in landing with sign out; shared `FormField` and `Alert`; env validation; baseline security headers | src/proxy.ts, src/app/bff/auth/**, src/app/(auth)/**, src/app/(console)/**, src/features/auth/**, src/lib/{env,routes}.ts, src/lib/api/**, src/lib/server/**, src/components/shared/form-field.tsx, src/components/ui/alert.tsx, next.config.ts, tests/e2e/auth.spec.ts, vitest setup, CI env | typecheck, lint, format:check, lint:tokens, Vitest (43 tests: proxy, login/logout routes, CSRF, routes/next-path, forms), mutation check (removing single-flight fails its test), `next build`, Playwright Chromium (11 tests incl. axe on all auth pages in light + dark), full-stack manual run against local fleetflow-api (invite link → set password → notice → wrong password → sign in → cookies httpOnly/Secure/Lax with token lifetimes, none visible to JS → access cookie removed → proxy refresh rotates tokens → sign out clears cookies → `next` kept); curl: no/cross origin 403, form post 415 | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-23 | feature/admin-foundation | Phase 0 technical setup: Next 16.4.6 scaffold (Turbopack, Cache Components on), TS 6.0.3 strict + `noUncheckedIndexedAccess`; `src/styles/tokens.css` (all design.md tokens, `light-dark()`, Tailwind defaults reset); IBM Plex Sans/Mono; shadcn base primitives restyled to design.md §6 (button, input, label, checkbox, switch, badge, card, dialog, dropdown-menu, tooltip, skeleton); `/dev/tokens` showcase (404 when `NEXT_PUBLIC_APP_ENV=production`); `lint:tokens` guard; pinned API schema + generated types; Vitest/RTL; Playwright + axe; GitHub Actions CI; `.env.example`; README | package.json, tsconfig.json, next.config.ts, eslint.config.mjs, .prettierrc.json, vitest.config.mts, playwright.config.ts, src/**, scripts/lint-tokens.mjs, openapi/fleetflow-api.yaml, tests/e2e/tokens.spec.ts, .github/workflows/ci.yml, docs | typecheck, lint, format:check, lint:tokens, Vitest (3 tests), `next build`, Playwright Chromium (4 tests: axe light + dark with zero serious/critical violations, theme toggle, dialog Esc + focus return), api:types drift (none), `npm audit --audit-level=high`, manual: production build returns 404 for `/dev/tokens`, screenshots of both themes reviewed | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-21 | main (uncommitted) | Workspace and documentation setup, repo initialized, Claude skills configured | CLAUDE.md, architecture.md, design.md, phases.md, rules.md, memory.md, skills.md, .claude/settings.json, .claude/skills/*, .gitignore | None (no code). Design token contrast ratios computed by script | Key pairs pass AA (see design.md §2) |

## Current work
| Task | Branch | Status | In progress | Blockers |
|---|---|---|---|---|
| Phase 1 PR 1/3: auth (BFF, proxy, auth pages, session gate) | feature/admin-auth | Implemented, checks green locally | — | Push + CI run |
| Phase 1 PR 2/3: design v2 + app shell | feature/admin-shell | Implemented, checks green locally | — | PR 1 merged first (stacked branch); owner visual sign-off of v2 |
| Phase 1 PR 3/3: shared data components + Settings → Users list and detail (read-only), `/bff/v1` proxy, openapi-fetch, TanStack Query, toasts, `PermissionGate` and 403 state | feature/admin-users | Not started | — | PR 2 merged |

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
| D-ADM-11 | Read-only Users list and detail (`users.view`) pulled into Phase 1 | phases.md Phase 11 allowed pulling user management earlier (NEEDS APPROVAL) | Shell-only Phase 1; full user management | Gives DataTable and the shared states a real consumer instead of speculative code | 2026-11-23 | feature/admin-auth | APPROVED (owner) | Invite/edit stay in Phase 11 |
| D-ADM-12 | Token refresh for page navigations happens in `proxy.ts`; BFF route handlers refresh for API calls; one single-flight `refreshTokens` shared by both | architecture §8–9 | Refresh in Server Components | Server Components cannot set cookies (Next 16 + Cache Components) | 2026-11-23 | feature/admin-auth | IMPLEMENTED | — |
| D-ADM-13 | Cookie lifetimes follow each JWT's `exp` claim (read, not verified) | architecture §9 | Hardcoded 15 min / 30 d | Lifetimes are owned by fleetflow-api | 2026-11-23 | feature/admin-auth | IMPLEMENTED | — |
| D-ADM-14 | The generic `/bff/v1/[...path]` proxy ships with its first consumer (Users list, PR 3), not in the auth PR | rules.md §1 (no speculative code) | Build it in PR 1 | No caller in PR 1 | 2026-11-23 | feature/admin-auth | IMPLEMENTED (plan) | — |
| D-ADM-15 | Design system v2 "Indigo & Signal": owner's reference palette (indigo #4B49AC primary; #7DA0FA, #7978E9, #98BDFF as chart/tint colours) plus signal orange accent; Nunito Sans + IBM Plex Mono; radii 6/8/12/16; soft shadow-1 on cards; no all-caps | Owner asked for a polished, non-template UI from a reference image and allowed orange | Bold solid-colour KPI cards as in the reference (white text fails AA at 1.9–3.7:1); keep IBM Plex | Only indigo carries white text at AA; coral reads as "failed" in logistics, so it was dropped; orange is the freight vernacular | 2026-11-23 | feature/admin-shell | APPROVED (owner direction; visual sign-off pending) | Supersedes D-ADM-5 |
| D-ADM-16 | Theme preference in localStorage, applied before first paint by an inline `next/script` (`beforeInteractive`) | design.md §2 | Cookie read in the root layout (forces dynamic rendering under Cache Components) | Static shell stays prerenderable; no light flash | 2026-11-23 | feature/admin-shell | IMPLEMENTED | Phase 12 CSP must allow it (nonce or hash) |
| D-ADM-17 | `cn` from `@/lib/cn`, configured with the type and shadow tokens; raw `cn` import blocked by ESLint | Bug: `cn("text-label text-text")` dropped the type style in every component since Phase 0 | Rename tokens to avoid the `text-` clash | Keeps design.md token names; one config, guarded by a test that reads tokens.css | 2026-11-23 | feature/admin-shell | IMPLEMENTED | Re-check after `shadcn add` |
| D-ADM-18 | Dropdown menus are non-modal by default | axe `aria-hidden-focus` with Radix modal menus | Keep modal and accept the violation | WAI-ARIA menu button pattern needs no page-wide aria-hidden; Esc/Tab still close | 2026-11-23 | feature/admin-shell | IMPLEMENTED | — |
| D-ADM-19 | TanStack Query, toasts, `PermissionGate` and the 403 state move to PR 3 with their first consumer (Users list) | rules.md §1 | Ship them in the shell PR | No caller in PR 2 | 2026-11-23 | feature/admin-shell | IMPLEMENTED (plan) | — |
| D-ADM-10 | API schema pinned in-repo (`openapi/fleetflow-api.yaml`) and generated types committed | rules §3, §7 | Read `../fleetflow-api` at build time | CI has no sibling checkout; contract changes become explicit diffs | 2026-11-23 | feature/admin-foundation | IMPLEMENTED | Update via `api:schema:sync` + `api:types` |

## Dependencies added/changed
2026-11-23, `feature/admin-foundation` (exact versions pinned in package.json):
- Runtime: next 16.4.6, react / react-dom 19.3.1, radix-ui 1.8.1, lucide-react 1.78.0, class-variance-authority 0.7.1, cn 0.5.2 (shadcn's clsx + tailwind-merge replacement), tw-animate-css 1.4.0.
- Dev: typescript 6.0.3, tailwindcss + @tailwindcss/turbopack 4.3.5, eslint 10.15.0 + eslint-config-next 16.4.6, prettier 3.10.1, shadcn 4.23.0 (CLI and `shadcn/tailwind.css` variants), vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @testing-library/jest-dom 8.0.0, @playwright/test 1.65.1, @axe-core/playwright 4.14.0, @types/node 26.6.6, @types/react / react-dom 19.3.0.
- Not installed: openapi-typescript 7.13.0 (run through `npx`, see Known issues).
- API schema pin: fleetflow-api `openapi/schema.yaml` version 0.1.0, identical to fleetflow-api `main` at 52d9ee1 (Phase 1 auth, `/me`, users, plus Phase 2 PR 1 customers and addresses). Correction 2026-11-23: an earlier note said c2017f8 (Phase 1 only); the copy was actually taken from the API working tree on `feature/api-geo-customers`.

2026-11-23, `feature/admin-shell`: no new packages (Nunito Sans via `next/font/google`).

2026-11-23, `feature/admin-auth`: zod 4.6.7, react-hook-form 7.92.0, @hookform/resolvers 7.0.8, server-only 0.0.1 (runtime); msw 3.0.7 (dev). MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.
- Bundle: Next 16.4 `build` no longer prints per-route sizes. All client chunks for the build (showcase only, every primitive) total about 221 KB gzip. Measure the console shell against the 200 KB budget in Phase 1.

## API requests (to fleetflow-api)
| Date | Request | Why | Status |
|---|---|---|---|
| 2026-11-23 | Throttle admin traffic per browser, not per BFF server. The admin BFF sends the browser's IP in `X-Forwarded-For` (one value, set by the BFF). Configure `NUM_PROXIES` (or an equivalent trusted-proxy setting) for the BFF hop in each environment, and consider keying `RefreshThrottle` by token family instead of IP | `RefreshThrottle` (30/min) and `password_reset_ip` (10/h) are keyed by IP only. Behind the BFF every admin user shares the Next server's IP, so one busy company would hit the limits for everyone | Open (owner to raise with fleetflow-api) |

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
- Implemented Phase 0 technical setup (see Completed work). Merged into `main` as PR #1 (2026-11-23); owner checkpoint passed.

### feature/admin-auth
- 2026-11-23: Branched from `main` after PR #1. Phase 1 PR 1/3 implemented (see Completed work). Not pushed, CI not run.

### feature/admin-shell
- 2026-11-23: Branched from `feature/admin-auth` (stacked; merge PR 1 first). Design v2 and Phase 1 PR 2/3 implemented. Not pushed, CI not run.

## Known issues
| Issue | Severity | Branch | Status | Resolution |
|---|---|---|---|---|
| TanStack Table v9 is a recent major; API stability unverified | Low | — | Open | Verify in Phase 1 when DataTable is built (not installed in Phase 0) |
| openapi-typescript 7.13.0 has a peer dependency on `typescript@^5.x`, and the app uses TS 6.0.3 | Low | feature/admin-foundation | Worked around | `api:types` runs `npx -p openapi-typescript@7.13.0 -p typescript@5.9.3`. It is not in the lockfile. Move it to devDependencies once a release supports TS 6 |
| ESLint 10 peer warnings from eslint-plugin-import 2.32.0 and eslint-plugin-jsx-a11y 6.10.2 (they list ESLint ≤ 9) | Low | feature/admin-foundation | Accepted | Next 16.4 docs state eslint-config-next supports ESLint 10 with these warnings. ESLint 9 is end-of-life. Lint runs clean |
| `npm audit` reports 4 moderate issues (minimatch via ts-morph in the shadcn CLI, dev-only) | Low | feature/admin-foundation | Accepted | Below the `--audit-level=high` gate; the runtime has 0 vulnerabilities (`--omit=dev`) |
| Map tile provider not chosen (possible paid service) | Medium | — | Open | Owner decision D-ADM-4 |
| Shared IP throttles at fleetflow-api behind the BFF | Medium | feature/admin-auth | Open | API request 2026-11-23. The BFF already forwards the client IP |
| Client IP trust depends on hosting: the BFF reads `x-real-ip` / first `x-forwarded-for` value, which is only safe behind an edge that overwrites them | Medium | feature/admin-auth | Open | Confirm when hosting is decided (NEEDS APPROVAL) |
| If fleetflow-api is unreachable during a proxy refresh, the page renders without a token and the session gate redirects to login | Low | feature/admin-auth | Accepted | Cookies are kept, so signing in again is not needed once the API is back; revisit with the shell's error states |
| Content Security Policy not set yet (baseline headers only) | Medium | feature/admin-auth | Planned | Nonce-based CSP in Phase 12 (phases.md); it must cover the inline theme script (D-ADM-16) |
| The sidebar lists only Home until modules land | Low | feature/admin-shell | By design | Each phase adds its items to `lib/navigation.ts` |

## Next steps
1. Push `feature/admin-auth` and `feature/admin-shell`, open the PRs (auth first) and confirm CI is green (on owner request).
2. Owner visual sign-off of design v2 (auth screen, shell, `/dev/tokens`).
3. Raise the throttle API request with fleetflow-api.
4. Phase 1 PR 3/3: Users list and detail with DataTable.
4. Owner decisions still open: map tile provider (D-ADM-4, needed by Phase 5), Sentry, hosting.
