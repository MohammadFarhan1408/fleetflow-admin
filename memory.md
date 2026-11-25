# fleetflow-admin: Memory (progress ledger)

Factual record only. Update after substantial tasks, dependency or architecture changes, and merges. Never record unrun tests as passed. Newest first.

## Project status
| Field | Value |
|---|---|
| Application | fleetflow-admin (operations web console) |
| Current phase | Phase 3: Customers (IN PROGRESS, PR 3/3 addresses implemented, not committed). Phase 1 COMPLETED 2026-11-24. Phase 2 (Drivers & Fleet) is unblocked for vehicles and drivers; documents wait for API Phase 3 PR 3 |
| Current branch | `feature/admin-customer-addresses` (stacked on `chore/api-schema-phase-3-fleet`, c4edff6; not pushed) |
| Overall status | Phase 0 COMPLETED (PR #1 merged, owner checkpoint passed 2026-11-23). Phase 1 COMPLETED: auth, design v2 and the app shell (PR #2), Users list and detail with the shared data layer and the reusable Select (PR #3); owner checkpoint passed 2026-11-24. |
| Last updated | 2026-11-25 |

## Completed work
| Date | Branch | Work | Files | Tests run | Result |
|---|---|---|---|---|---|
| 2026-11-24 | feature/admin-users | Phase 1 PR 3/3: API schema synced to fleetflow-api `main` 693420c and `api:schema:sync` fixed to read `origin/main`; `/bff/api/v1/[...path]` proxy (refresh + retry, rotated cookies, ended-session clearing, blocked `auth/*`, safe segments, CSRF on mutations, `Idempotency-Key` only); typed `openapi-fetch` client with `unwrap`, `cursorFrom`; TanStack Query provider (retry rules, 401 → login with `next`); shared `DataTable`, `DataTableSkeleton`, `EmptyState`, `ErrorState`, `ForbiddenState`, `CursorPagination`, `RequirePermission`; `PERMISSIONS`; Settings → Users list (cursor + 25/50/100 page size in the URL) and detail (Access, Account, not-found); date formatters; breadcrumb links back from detail pages | src/app/bff/api/**, src/lib/api/**, src/lib/{format,permissions,routes,navigation}.ts, src/components/shared/**, src/features/users/**, src/app/(console)/settings/users/**, src/app/(console)/layout.tsx, openapi/, src/generated/, package.json, README.md, docs | typecheck, lint, format:check, lint:tokens, Vitest (101 tests: BFF proxy 10, client 7, users table 6, user detail 2, guard 2, query provider 401 redirect, formatters), `next build` (users routes partially prerendered), `next build --debug-prerender` clean, Playwright Chromium (11), full-stack against local fleetflow-api: owner flow Home → Users → detail → breadcrumb back with axe clean (list light/dark, detail), unknown ID → not found, no horizontal scroll at 390 px; dispatcher (no `users.view`): no nav item, direct URL shows the 403 state, crafted `/bff/api/v1/users/` → API `403 permission.denied` | All pass locally. Merged as PR #3 (2026-11-24). Includes the commit "feat(ui): add a reusable Select and use it for the page-size control" (`ui/select.tsx`, Radix Select restyled to the input spec); that component was covered by Vitest only, and the owner reviewed it at the Phase 1 checkpoint |
| 2026-11-23 | feature/admin-shell | Phase 1 PR 2/3 plus design v2: design.md v2 "Indigo & Signal" (palette from the owner's reference plus signal orange, Nunito Sans + Plex Mono, larger radii, soft elevation, no all-caps, §13 Claude skills workflow and quality bar); tokens.css v2 with chart and brand tokens; token-aware `cn` (fixes dropped type styles); split auth layout with the route-line panel; app shell (collapsible sidebar with remembered state, mobile drawer, sticky header, breadcrumbs, branch switcher, user menu with theme and sign out, skip link); session context and `usePermissions`; navigation config; theme preference applied before first paint; home built from `/me`; 404 and console error boundary; `lint:tokens` rejects all-caps | design.md, src/styles/tokens.css, src/lib/{cn,preferences,theme,navigation,format}.ts, src/components/shell/**, src/components/shared/{brand,page-header}.tsx, src/features/session/**, src/features/auth/components/{route-panel,auth-card}.tsx, src/app/(auth)/**, src/app/(console)/**, src/app/not-found.tsx, src/app/layout.tsx, eslint.config.mjs, scripts/lint-tokens.mjs | typecheck, lint, format:check, lint:tokens, Vitest (68 tests: cn token merging and tokens.css sync, navigation filtering/active item, user menu theme + sign out + failure, branch switcher 0/1/many/stale, plus PR 1 suites), `next build`, Playwright Chromium (11), contrast script for every v2 token pair (all AA in both themes), full-stack against local fleetflow-api: screenshots reviewed at 1440 light/dark, collapsed, 1024, 390, drawer, menu, 404, login; axe (WCAG 2.2 AA tags) on home light/dark, open menu light/dark, mobile, drawer, collapsed: no violations after fixes; saved dark theme present at first paint; skip link is the first tab stop | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-23 | feature/admin-auth | Phase 1 PR 1/3: BFF auth routes (login, logout, password reset, confirm) with httpOnly cookies, Origin + JSON CSRF check, client IP forwarding; `proxy.ts` session redirect and token refresh for page navigations (single-flight per token); `(auth)` pages (sign in, forgot password, set password for resets and invitations) with RHF + Zod; `(console)` session gate via `/me` behind Suspense; temporary signed-in landing with sign out; shared `FormField` and `Alert`; env validation; baseline security headers | src/proxy.ts, src/app/bff/auth/**, src/app/(auth)/**, src/app/(console)/**, src/features/auth/**, src/lib/{env,routes}.ts, src/lib/api/**, src/lib/server/**, src/components/shared/form-field.tsx, src/components/ui/alert.tsx, next.config.ts, tests/e2e/auth.spec.ts, vitest setup, CI env | typecheck, lint, format:check, lint:tokens, Vitest (43 tests: proxy, login/logout routes, CSRF, routes/next-path, forms), mutation check (removing single-flight fails its test), `next build`, Playwright Chromium (11 tests incl. axe on all auth pages in light + dark), full-stack manual run against local fleetflow-api (invite link → set password → notice → wrong password → sign in → cookies httpOnly/Secure/Lax with token lifetimes, none visible to JS → access cookie removed → proxy refresh rotates tokens → sign out clears cookies → `next` kept); curl: no/cross origin 403, form post 415 | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-23 | feature/admin-foundation | Phase 0 technical setup: Next 16.4.6 scaffold (Turbopack, Cache Components on), TS 6.0.3 strict + `noUncheckedIndexedAccess`; `src/styles/tokens.css` (all design.md tokens, `light-dark()`, Tailwind defaults reset); IBM Plex Sans/Mono; shadcn base primitives restyled to design.md §6 (button, input, label, checkbox, switch, badge, card, dialog, dropdown-menu, tooltip, skeleton); `/dev/tokens` showcase (404 when `NEXT_PUBLIC_APP_ENV=production`); `lint:tokens` guard; pinned API schema + generated types; Vitest/RTL; Playwright + axe; GitHub Actions CI; `.env.example`; README | package.json, tsconfig.json, next.config.ts, eslint.config.mjs, .prettierrc.json, vitest.config.mts, playwright.config.ts, src/**, scripts/lint-tokens.mjs, openapi/fleetflow-api.yaml, tests/e2e/tokens.spec.ts, .github/workflows/ci.yml, docs | typecheck, lint, format:check, lint:tokens, Vitest (3 tests), `next build`, Playwright Chromium (4 tests: axe light + dark with zero serious/critical violations, theme toggle, dialog Esc + focus return), api:types drift (none), `npm audit --audit-level=high`, manual: production build returns 404 for `/dev/tokens`, screenshots of both themes reviewed | All pass locally. CI not yet run (branch not pushed) |
| 2026-11-21 | main (uncommitted) | Workspace and documentation setup, repo initialized, Claude skills configured | CLAUDE.md, architecture.md, design.md, phases.md, rules.md, memory.md, skills.md, .claude/settings.json, .claude/skills/*, .gitignore | None (no code). Design token contrast ratios computed by script | Key pairs pass AA (see design.md §2) |

## Current work
| Task | Branch | Status | In progress | Blockers |
|---|---|---|---|---|
| Phase 1 PR 1/3: auth (BFF, proxy, auth pages, session gate) | feature/admin-auth | Merged (PR #2) | — | — |
| Phase 1 PR 2/3: design v2 + app shell | feature/admin-shell | Merged (PR #2, with PR 1) | — | — |
| Phase 1 PR 3/3: shared data components + Settings → Users list and detail (read-only), reusable `Select` | feature/admin-users | Merged (PR #3) | — | — |
| Phase 1 checkpoint (owner visual sign-off of design v2, Users, Select) | — | Passed 2026-11-24 | — | — |
| Record PR #3 and Phase 1 completion in the docs | docs/phase-1-complete | Merged (PR #4) | — | — |
| Phase 3 PR 1/3: read-only customers list and detail, PascalCase component files | feature/admin-customers | Merged (PR #5) | — | — |
| Phase 3 PR 2/3: customer create, edit and archive; toasts, `PermissionGate`, `ConfirmDialog`, idempotency keys, API field-error mapping | feature/admin-customers-manage | Merged (PR #6) | — | — |
| Contract sync to fleetflow-api `main` f56141e (Phase 3 PRs 1 and 2: uploads, fleet) | chore/api-schema-phase-3-fleet | Committed (c4edff6), not pushed | — | Push, PR |
| Phase 3 PR 3/3: customer addresses (pages) | feature/admin-customer-addresses | Implemented, checks green locally, not committed | — | Commit, push, CI; branch is stacked on the chore branch |
| Phase 2 Drivers & Fleet | — | Order approved: after Phase 3 PR 3, before Phase 4 | — | Documents need API Phase 3 PR 3 |
| Phase 4 Shipments (5 PRs) | — | Approved plan; not started | — | Admin Phase 3 PR 3 |

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
| D-ADM-20 | `DataTable` renders columns itself; TanStack Table is added when a list needs sorting, column visibility, selection or virtualization | architecture §2, §14 | Install TanStack Table now | The users API offers only cursor paging; nothing in TanStack Table would be used | 2026-11-24 | feature/admin-users | IMPLEMENTED | Column API (`id`, `header`, `cell`) maps onto TanStack column defs later |
| D-ADM-21 | BFF data proxy lives at `/bff/api/v1/[...path]`, mirroring the generated contract paths | architecture §8 said `/bff/v1` | Rewrite paths in the client | openapi-fetch uses the generated `/api/v1/...` paths unchanged with base `/bff` | 2026-11-24 | feature/admin-users | IMPLEMENTED | — |
| D-ADM-22 | `api:schema:sync` reads fleetflow-api `origin/main`, never its working tree | The API working tree was on unmerged branches twice | Copy the file | The pin must be released contract only | 2026-11-24 | feature/admin-users | IMPLEMENTED | — |
| D-ADM-23 | Address map pin confirmation moves from Phase 3 to Phase 5; Phase 3 uses optional latitude/longitude fields (both or neither) | The map tile provider is undecided (D-ADM-4) and the API has no geocoding | Decide the tile provider now and build a MapLibre pin picker in Phase 3 | MapLibre lands once, with dispatch | 2026-11-24 | docs/phase-1-complete | APPROVED (owner) | phases.md Phases 3 and 5 |
| D-ADM-25 | Toasts use Radix Toast (`radix-ui`, already installed): `ui/Toast.tsx` plus a `ToastProvider` / `useToast()` in the console layout; max 3, success 4 s, error until dismissed | rules.md §8 dependency checklist | `sonner` (new dependency) | No new dependency; styled to design.md §6 | 2026-11-25 | feature/admin-customers-manage | APPROVED (owner) | Phase 4 and later reuse it |
| D-ADM-26 | Add and edit customer screen redesign: Choice cards component (design.md §6), a live customer preview beside the form at ≥ 1280 px, required fields marked with an asterisk and no "optional" wording, phone input accepts spaces and separators and is normalized to E.164 before sending | Owner asked for a better create screen than a plain form | Native select for the type; no preview | The type needs explaining; the preview shows the record as the list will; the API only accepts E.164 | 2026-11-25 | feature/admin-customers-manage | APPROVED (owner request) | design.md §6 Input, Choice cards; `components/shared/ChoiceCardGroup` |
| D-ADM-27 | Address create and edit are pages (`/customers/[id]/addresses/new`, `.../[addressId]/edit`), not dialogs; the row menu (kebab) holds Edit and Archive | The address form has 11 fields; D-ADM-26 already made customer create and edit pages | Modal form | Same pattern as the customer form (dirty guard, deep links, room for the field groups); a modal this size is cramped at 768 and 390 | 2026-11-25 | feature/admin-customer-addresses | APPROVED (owner) | design.md §6 Table row actions |
| D-ADM-24 | design.md §7 priority mapping follows the API enum: `normal` no badge, `high` warning outline, `urgent` error outline with `zap` | design.md lists `standard`/`express`/`same_day`; the API has `normal`/`high`/`urgent` | Keep the old names | Never invent enums (rules.md §3). design.md is updated in Phase 4 PR 1 | 2026-11-24 | docs/phase-1-complete | PROPOSED | design.md §7 |
| D-ADM-10 | API schema pinned in-repo (`openapi/fleetflow-api.yaml`) and generated types committed | rules §3, §7 | Read `../fleetflow-api` at build time | CI has no sibling checkout; contract changes become explicit diffs | 2026-11-23 | feature/admin-foundation | IMPLEMENTED | Update via `api:schema:sync` + `api:types` |

## Completed work, Phase 3 PR 2 (2026-11-25, `feature/admin-customers-manage`)
- **Design:** create and edit are **pages, not modals** (owner direction 2026-11-25): `/customers/new` and `/customers/[id]/edit`, forms max 720 px (design.md §5), both behind `customers.manage` (the 403 state on a direct URL). One `CustomerForm` component serves both; it owns the save mutation (`useSaveCustomer`: POST without a customer, PATCH with one), validation, error handling, toast and navigation. "Add customer" is a link in the list header; "Edit" is a link in the detail header; Archive stays a `ConfirmDialog` naming the customer.
- **Screen design (D-ADM-26, owner asked for a better create screen):** customer type as two choice cards (new shared `ChoiceCardGroup`, radio group underneath), the name field worded for the type ("Company name" / "Full name"), a live preview card beside the form at ≥ 1280 px (hidden below, `aria-hidden`), an optional "Contact details" group with email and phone side by side, a footer row with an "Unsaved changes" signal, the name field focused on open. Required fields carry an asterisk (new `required` prop on `FormField` and `ChoiceCardGroup`); optional fields carry no mark and no "optional" wording. The phone input accepts spaces, dashes and brackets and sends E.164. design.md §6 updated first (Input, Choice cards).
- **Form behaviour:** RHF + Zod, API field errors on the fields (first one focused), unknown fields in an alert, `Idempotency-Key` per action (reused for the same body, new key when the body changes), Cancel asks "Discard your changes?" when dirty, `beforeunload` while dirty, form reset after a save. Archived customers can't be edited (the edit page says so).
- **Shared:** `ui/Toast`, `ToastProvider` / `useToast` (D-ADM-25), `PermissionGate`, `ConfirmDialog`, `useIdempotencyKey`, `applyFieldErrors`, `describeMutationError`. Error codes added to `API_ERROR_CODES` (`permission.denied`, `not_found`, `idempotency.key_reuse`, `customer.archived`).
- **Failures:** 409 `customer.archived`, 403 and 404 leave the form with an error toast (404 goes to the list, the others back to the customer or list); network and other errors stay on the form with the values kept. Never optimistic; list and detail are refetched after every write, including failed ones.
- **Assumption:** new customers default to type Business (the API requires `kind`; the owner has not specified a default).
- **Bugs found in the full-stack run and fixed (mocked tests could not see them):**
  1. A bodiless POST (archive) carried no `Content-Type`, so the BFF's CSRF guard answered 415. `apiClient` now declares JSON by default (covers every future bodiless mutation).
  2. Next keeps the previous page mounted but hidden (Activity). Two forms on the page shared hardcoded field ids, tying labels to the hidden input: ids now come from `useId()`. A kept-alive form also showed stale state after a save (previous values treated as unsaved changes; the add page showed the last customer's data): the form resets after a save, and the edit form is keyed by the customer's `updated_at`.
  - Lesson for later pages: anything that reads page-level state must assume a hidden copy of the previous route can still be mounted.
- **Checks run:** typecheck, lint, format:check, lint:tokens, Vitest (165 tests), `next build`, Playwright Chromium (11), `npm audit --audit-level=high` (4 moderate, dev-only, known). Mutation checks: each of the idempotency-key reuse, unique field ids, and the post-save reset fails its tests when removed.
- **Full stack** (production build on port 3100, local fleetflow-api, 22 checks): owner Add → detail → Edit (prefilled) → save → detail shows the new name; dirty Cancel asks, pristine Cancel leaves; Archive → Archived badge, actions gone; edit page for an archived customer blocked; archived customer hidden from the list. axe (WCAG 2.2 AA) clean on the new page (also with errors), edit page, archive confirm and discard confirm, light and dark; no horizontal scroll at 768; screenshots reviewed (light and dark at 1280, dark at 768). Dispatcher (`customers.view` only): no Add link, `/customers/new` and `/customers/:id/edit` show the 403 state with no form, no Edit/Archive on detail, a crafted `PATCH` through the BFF returns 403 `permission.denied`.
- **Known limitation:** the dirty-form guard covers Cancel and reload or tab close; clicking a sidebar link away from a dirty form navigates without a prompt (Next's App Router has no navigation interception).
- **Not done:** CI not run (branch not pushed); no committed Playwright spec for the customers flow (it needs a signed-in session, so it belongs to the full-stack suite); Next dev overlay not checked for Insights.

## Completed work, Phase 3 PR 3 (2026-11-25, `feature/admin-customer-addresses`)
- **Screens:** the customer detail page gets "Add address" (header, and in the empty state) and a row menu per address (Edit, Archive), all behind `customers.manage` and hidden for archived customers and archived addresses. `/customers/[id]/addresses/new` and `.../[addressId]/edit` use one `AddressForm` (groups: Address, Label and contact, Location). The add page loads the customer first and blocks an archived one; the edit page loads the address and blocks an archived one.
- **Form:** required fields are line 1, city and country (asterisks, no "optional" wording). Country is the existing `Select` over an ISO 3166-1 list with `Intl.DisplayNames` labels (`countries.ts`; a copy of the API's list, API request recorded). Phone shares `phoneSchema` with the customer form and is normalized to E.164. Coordinates are text while editing, both or neither, in range, and sent as numbers; clearing both sends `null` and removes the saved point. API field errors go on the fields; idempotency key per action; reset after save; edit form keyed by `updated_at`; Cancel confirm and `beforeunload`.
- **Shared extractions (second consumer):** `FormFooter` (was `CustomerFormFooter`), `useUnsavedChangesWarning`, `StatePanel`, `useCustomerWriteError` (now takes `missingHref` and handles `address.archived`), `addressTitle`, `phoneSchema`, `ConfirmDialog.returnFocusTo`.
- **Bugs found in the full-stack run and fixed (unit tests could not see them):**
  1. The first click on the submit button did nothing when the autofocused field was empty. Pressing the button blurred the field, `onTouched` validation inserted the error line, the button moved down about 20 px and the click landed beside it. `FormFooter` buttons now keep focus on mouse-down. The customer form had the same flaw and gets the fix. Regression test in `FormFooter.test.tsx`; it fails without the fix.
  2. After dismissing the archive confirmation opened from the row menu, focus fell to the page body (the menu item that opened the dialog had unmounted). `ConfirmDialog` takes `returnFocusTo`, and the row menu passes its button. Regression test in `AddressActions.test.tsx`; it fails without the fix.
- **Checks run:** typecheck, lint, format:check, lint:tokens, Vitest (199 tests, 34 new), `next build`, Playwright Chromium (11), `npm audit --audit-level=high` (4 moderate, dev-only, known; runtime 0). Mutation checks: removing the both-or-neither coordinate rule, the `updated_at` key, the `FormFooter` mouse-down handler and the `returnFocusTo` prop each fails a test.
- **Full stack** (production build on port 3100, local fleetflow-api, 38 checks, then re-run after the fixes): owner creates a customer, Add address (empty-state link, focus on line 1, no duplicate ids, required errors, keyboard type-ahead in the country list, lone latitude refused), save with coordinates, row shows them, re-opened add page is empty and clean, pristine Cancel leaves without asking, Edit via the row menu prefilled, dirty Cancel asks, clearing both coordinates shows "Not set", re-opened edit page is clean, Archive via the menu removes the row, edit page for the archived address is blocked, archived customer has no Add link and its add page is blocked, unknown customer shows not found. Dispatcher (`customers.view` only): no Add link or row actions, both address URLs show the 403 state with no form, a crafted `PATCH` through the BFF returns 403 `permission.denied`. axe (WCAG 2.2 AA) clean on the add page (with errors, light and dark), edit page (light and dark), discard dialog, archive dialog, detail page with the menu open (light and dark). No horizontal scroll at 1280, 1920, 768 and 390 (add page, both themes). Screenshots reviewed (add light 1280, add dark 390, detail dark 1280 with the menu, detail light 390). Keyboard: Enter opens the row menu, arrows and Home/End move, Enter on Archive opens the dialog, Esc returns focus to the menu button.
- **Known limitations:** at 390 px the Actions column is off-screen until the table is scrolled sideways (design.md §6 Table scrolls inside the panel; a sticky actions column was not built). The sidebar-link dirty-form gap from PR 2 also applies here. No address preview card (not requested). The country list is a copy of the API's (API request open).
- **Not done:** CI not run (branch not pushed); no committed Playwright spec for the address flow (needs a signed-in session, so it belongs to the full-stack suite); the first test in `AddressForm.test.tsx` needs a 20 s timeout because opening the 249-option list in jsdom is slow.

## Dependencies added/changed
2026-11-23, `feature/admin-foundation` (exact versions pinned in package.json):
- Runtime: next 16.4.6, react / react-dom 19.3.1, radix-ui 1.8.1, lucide-react 1.78.0, class-variance-authority 0.7.1, cn 0.5.2 (shadcn's clsx + tailwind-merge replacement), tw-animate-css 1.4.0.
- Dev: typescript 6.0.3, tailwindcss + @tailwindcss/turbopack 4.3.5, eslint 10.15.0 + eslint-config-next 16.4.6, prettier 3.10.1, shadcn 4.23.0 (CLI and `shadcn/tailwind.css` variants), vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @testing-library/jest-dom 8.0.0, @playwright/test 1.65.1, @axe-core/playwright 4.14.0, @types/node 26.6.6, @types/react / react-dom 19.3.0.
- Not installed: openapi-typescript 7.13.0 (run through `npx`, see Known issues).
- API schema pin: fleetflow-api `openapi/schema.yaml` version 0.1.0, identical to fleetflow-api `main` at 52d9ee1 (Phase 1 auth, `/me`, users, plus Phase 2 PR 1 customers and addresses). Correction 2026-11-23: an earlier note said c2017f8 (Phase 1 only); the copy was actually taken from the API working tree on `feature/api-geo-customers`.

2026-11-24, `feature/admin-users`: @tanstack/react-query 5.108.4, openapi-fetch 0.17.0 (runtime). API schema pin: fleetflow-api `main` 693420c (Phase 2 complete: customers, shipments, status machine). Checked 2026-11-24: identical to fleetflow-api `origin/main` 4d52d79 (only docs commits since).

2026-11-25, `chore/api-schema-phase-3-fleet`: no package changes. API schema pin moved to fleetflow-api `origin/main` f56141e (Phase 3 PR 1 uploads #11 and PR 2 drivers and vehicles #12). The diff is additive only: 12 new paths, no existing line removed (every old line is still present). `npm run typecheck` needed no code changes.

2026-11-23, `feature/admin-shell`: no new packages (Nunito Sans via `next/font/google`).

2026-11-23, `feature/admin-auth`: zod 4.6.7, react-hook-form 7.92.0, @hookform/resolvers 7.0.8, server-only 0.0.1 (runtime); msw 3.0.7 (dev). MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.
- Bundle: Next 16.4 `build` no longer prints per-route sizes. All client chunks for the build (showcase only, every primitive) total about 221 KB gzip. Measure the console shell against the 200 KB budget in Phase 1.

## API requests (to fleetflow-api)
| Date | Request | Why | Status |
|---|---|---|---|
| 2026-11-25 | `GET /api/v1/branches/` (public_id, code, name) | `/me` lists only the user's own branches. A `fleet.all_branches` user must choose any branch for a driver or vehicle, and the shipment form has the same need (`shipments.all_branches`) | Open (High; blocks Phase 2 PR 2) |
| 2026-11-25 | `?role=` filter on `GET /users/` (already listed below), now also needed to pick the user for a new driver | Creating a driver needs an active user with the `driver` role | Open (High; blocks Phase 2 PR 4) |
| 2026-11-25 | Type `country` on address requests and responses as a schema enum (ISO 3166-1 alpha-2) | The API validates against its own list; the admin keeps a copy of the standard list for the picker | Open (Low) |
| 2026-11-24 | `GET /api/v1/service-types/` (code, name, max weight, max dimensions, active) | The shipment form (Phase 4 PR 3) and the list filter need service types; the API accepts only the `service_type` code and exposes no list | Open (High; blocks Phase 4 PR 3) |
| 2026-11-24 | Add `code` to `/me` `branches` | Shipment rows carry `branch{public_id,code}`; `/me` branches carry `name` only, so the list and filter cannot match them up | Open (Medium) |
| 2026-11-24 | `allowed_transitions` (target statuses the current user may request) on the shipment detail | Without it the admin copies the lifecycle table and permission rules, which the API owns (Phase 4 PR 4) | Open (Medium) |
| 2026-11-24 | Customers list: `?kind=` filter, and `?search=` also matching email and phone | architecture §14 expects search across customer and phone; today `search` matches the name only | Open (Low) |
| 2026-11-24 | Add the company timezone (and currency) to `GET /me/` `company` | design.md §11 shows times in the company timezone; the admin falls back to the browser's timezone. Also needed for the minimum `scheduled_pickup_date` in the shipment form, because `shipment.past_schedule` uses the company timezone | Open (High from Phase 4 PR 3) |
| 2026-11-24 | Users list filters: `?search=` (name, email), `?is_active=`, `?role=` | Phase 11 user management; today the list can only be paged | Open (needed by Phase 11) |
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

### Received contracts from fleetflow-api (Phase 3 PRs 1 and 2, pin f56141e, 2026-11-25)

Source: `../fleetflow-api/CHANGELOG.md` (read from `origin/main`). Paths end with a slash.

- **Permissions in `/me`:** `fleet.view` (owner, admin, ops_manager, dispatcher, fleet_manager, finance, viewer), `fleet.manage` (owner, admin, ops_manager, fleet_manager), `fleet.all_branches` (owner, admin, ops_manager), `uploads.create` (owner, admin, ops_manager, fleet_manager). Without `fleet.all_branches`, another branch's driver or vehicle answers 404.
- **Drivers:** `GET|POST /drivers/`, `GET|PATCH /drivers/{public_id}/`, `POST .../status/` `{status, reason}`, `POST .../archive/`.
  - Create takes `{user_id, branch_id, phone}`. The user must be active, in the company and hold the `driver` role (invite them first through the users API).
  - Rows carry `user{public_id,full_name,email}`, `branch{public_id,code,name}`, `status` (`active`, `suspended`), `status_reason`, `archived_at` and `availability{date,available,reasons[]}`.
  - List filters: `status`, `branch`, `search`, `include_archived`, `available`, `availability_date`.
- **Leave:** `GET|POST /drivers/{id}/leave/` `{starts_on, ends_on, reason}` (inclusive, at most 366 days), `DELETE /drivers/{id}/leave/{leave_id}/`.
- **Vehicles:** `GET|POST /vehicles/`, `GET|PATCH /vehicles/{public_id}/`, `POST .../status/`, `POST .../archive/`.
  - Fields: `registration_number`, `branch_id`, `required_license_category`, `capacity_weight_kg` (at most 60000), `capacity_volume_m3` (at most 200), optional `make` and `model`. Status is `active`, `in_maintenance` or `out_of_service`.
  - List filters: `status`, `branch`, `license_category`, `search` (registration prefix), `include_archived`, `available`.
- **Uploads:** `POST /uploads/` `{purpose, content_type, size}` returns `{id, upload_url, method, headers, expires_at}` for a presigned PUT; `POST /uploads/{id}/confirm/`. Types are JPEG and PNG (at most 10 MB) and PDF (at most 20 MB). The only purpose is `fleet_document`; unattached uploads are deleted after 24 h.
- **Enums:** `DriverStatusEnum`, `VehicleStatusEnum`, `LicenseCategoryEnum`, `DriverUnavailableReasonEnum` (`archived`, `login_disabled`, `suspended`, `on_leave`), `VehicleUnavailableReasonEnum` (`archived`, `in_maintenance`, `out_of_service`), `UploadPurposeEnum`, `UploadContentTypeEnum`, `UploadStatusEnum`. Later PRs add reasons (additive).
- **Error codes:** 409 `driver.already_exists`, `driver.archived`, `driver.leave_overlap`, `driver.leave_started`, `vehicle.archived`, `vehicle.duplicate_registration`; 400 `upload.too_large`, `upload.size_mismatch`, `upload.type_mismatch`, `upload.not_found`; 409 `upload.not_confirmed`, `upload.in_use`; 503 `storage.unavailable`.
- **Not yet available:** driver and vehicle documents, expiry filters (API Phase 3 PR 3, `feature/api-fleet-documents`), shifts (PR 4).
- **API repo status docs are stale:** its memory.md still lists PR 2 (#12) as "awaiting owner merge" although `origin/main` contains it. Not edited from here.

## Branch history
### main
- 2026-11-21: Repo initialized (`git init -b main`). Baseline docs written.
- PR #1 (foundation), #2 (auth, design v2, shell) and #3 (users, data layer, Select) merged.

### feature/admin-foundation
- 2026-11-23: Branched from `main`; cherry-picked the Phase 1 contracts memory commit from `docs/api-phase-1-contracts`.
- Implemented Phase 0 technical setup (see Completed work). Merged into `main` as PR #1 (2026-11-23); owner checkpoint passed.

### feature/admin-auth
- 2026-11-23: Branched from `main` after PR #1. Phase 1 PR 1/3 implemented (see Completed work). Not pushed, CI not run.

### feature/admin-shell
- 2026-11-23: Branched from `feature/admin-auth`. Design v2 and Phase 1 PR 2/3 implemented. Merged with the auth work as PR #2 (2026-11-24).

### feature/admin-users
- 2026-11-24: Branched from `main` after PR #2. Phase 1 PR 3/3 implemented (see Completed work). Merged as PR #3 (2026-11-24).
- 2026-11-24: Added `ui/select.tsx` (Radix Select restyled to the input spec, sm/md sizes, design.md §6 Select) and replaced the native page-size `<select>` in `CursorPagination` with it. jsdom pointer-capture/scrollIntoView stubs added to `vitest.setup.ts`. typecheck, lint, lint:tokens, Vitest 101/101 pass. Merged in PR #3.

### feature/admin-customers-manage
- 2026-11-25: Branched from `main` (87e5d1d, after PR #5). Phase 3 PR 2/3 implemented (see above). Merged as PR #6 (a76a1ba).

### chore/api-schema-phase-3-fleet
- 2026-11-25: Branched from `main` (a76a1ba). Contract sync to fleetflow-api f56141e: `api:schema:sync` and `api:types`, no code changes needed. Checks run: typecheck, lint, format:check, lint:tokens, Vitest (165 pass), `next build`. Committed as c4edff6, not pushed.

### feature/admin-customer-addresses
- 2026-11-25: Branched from `chore/api-schema-phase-3-fleet` (c4edff6) because that PR is not merged yet. Phase 3 PR 3/3 implemented (see above). Not committed or pushed, CI not run.

### feature/admin-customers
- 2026-11-24: Phase 3 PR 1/3 (read-only customers) plus the PascalCase rename of component files (rules.md §6). Merged as PR #5.

### docs/phase-1-complete
- 2026-11-24: Branched from `main` (e321820). Records PR #3, the Select, the Phase 1 checkpoint and the Phase 3 and 4 plan. Docs only.

## Known issues
| Issue | Severity | Branch | Status | Resolution |
|---|---|---|---|---|
| TanStack Table v9 is a recent major; API stability unverified | Low | — | Deferred | Not installed (D-ADM-20); verify when a list first needs sorting, selection or virtualization |
| openapi-typescript 7.13.0 has a peer dependency on `typescript@^5.x`, and the app uses TS 6.0.3 | Low | feature/admin-foundation | Worked around | `api:types` runs `npx -p openapi-typescript@7.13.0 -p typescript@5.9.3`. It is not in the lockfile. Move it to devDependencies once a release supports TS 6 |
| ESLint 10 peer warnings from eslint-plugin-import 2.32.0 and eslint-plugin-jsx-a11y 6.10.2 (they list ESLint ≤ 9) | Low | feature/admin-foundation | Accepted | Next 16.4 docs state eslint-config-next supports ESLint 10 with these warnings. ESLint 9 is end-of-life. Lint runs clean |
| `npm audit` reports 4 moderate issues (minimatch via ts-morph in the shadcn CLI, dev-only) | Low | feature/admin-foundation | Accepted | Below the `--audit-level=high` gate; the runtime has 0 vulnerabilities (`--omit=dev`) |
| Map tile provider not chosen (possible paid service) | Medium | — | Open | Owner decision D-ADM-4 |
| Shared IP throttles at fleetflow-api behind the BFF | Medium | feature/admin-auth | Open | API request 2026-11-23. The BFF already forwards the client IP |
| Client IP trust depends on hosting: the BFF reads `x-real-ip` / first `x-forwarded-for` value, which is only safe behind an edge that overwrites them | Medium | feature/admin-auth | Open | Confirm when hosting is decided (NEEDS APPROVAL) |
| If fleetflow-api is unreachable during a proxy refresh, the page renders without a token and the session gate redirects to login | Low | feature/admin-auth | Accepted | Cookies are kept, so signing in again is not needed once the API is back; revisit with the shell's error states |
| Content Security Policy not set yet (baseline headers only) | Medium | feature/admin-auth | Planned | Nonce-based CSP in Phase 12 (phases.md); it must cover the inline theme script (D-ADM-16) |
| The sidebar lists only Home until modules land | Low | feature/admin-shell | By design | Settings → Users added in PR 3; each phase adds its items to `lib/navigation.ts` |
| Dev server once reported "`Date.now()` while prerendering" on `/`, `/settings/users` and `/settings/users/[id]` while routes were recompiling during edits | Low | feature/admin-users | Not reproducible | Clean on fresh dev runs, on `next build` and on `next build --debug-prerender`; watch for it when adding queries |
| Times use the browser's timezone, not the company's | Low | feature/admin-users | Open | API request 2026-11-24 (`/me` company timezone) |

## Next steps
1. Push `chore/api-schema-phase-3-fleet` (contract sync) and open its PR; commit and push `feature/admin-customer-addresses` (stacked on it) and open that PR (on owner request). Merge the chore PR first.
2. Phase 2 (Drivers & Fleet) is next: vehicles list and detail first (needs only `fleet.view`). Raise the `GET /branches/` and users `?role=` requests before the create forms.
3. Phase 4 (Shipments, 5 PRs) follows Phase 3. PR 3 (the form) needs the `service-types` API request.
4. Raise the open API requests with fleetflow-api. None of them is in its "Incoming client requests" table yet: throttle IP, `/me` timezone and branch code, users filters, service types, `allowed_transitions`, customer search.
5. Admin Phase 2 (Drivers & Fleet) runs after Phase 3 PR 3 and before Phase 4 (owner, 2026-11-25): vehicles, then drivers and leave. Documents wait for API Phase 3 PR 3. Raise the `branches` and users `role` requests first.
6. Owner decisions still open: combobox (Phase 4 PR 3), D-ADM-6 (phase reorder, still PROPOSED), D-ADM-24, map tile provider (D-ADM-4, Phase 5), Sentry, hosting.
