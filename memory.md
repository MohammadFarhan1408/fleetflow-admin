# fleetflow-admin: Memory (progress ledger)

Factual record only. Update after substantial tasks, dependency or architecture changes, and merges. Never record unrun tests as passed. Newest first.

## Project status
| Field | Value |
|---|---|
| Application | fleetflow-admin (operations web console) |
| Current phase | Phase 0: Architecture & UI Foundation (docs done; technical setup not started) |
| Current branch | `main` (repo initialized, **no commits yet**) |
| Overall status | Documentation drafted, awaiting owner review. **No application code exists.** |
| Last updated | 2026-11-21 |

## Completed work
| Date | Branch | Work | Files | Tests run | Result |
|---|---|---|---|---|---|
| 2026-11-21 | main (uncommitted) | Workspace and documentation setup, repo initialized, Claude skills configured | CLAUDE.md, architecture.md, design.md, phases.md, rules.md, memory.md, skills.md, .claude/settings.json, .claude/skills/*, .gitignore | None (no code). Design token contrast ratios computed by script | Key pairs pass AA (see design.md §2) |

## Current work
| Task | Branch | Status | In progress | Blockers |
|---|---|---|---|---|
| Phase 0 documentation review | main (uncommitted) | Awaiting owner review | — | Owner decisions below |

## Decisions
| ID | Decision | Context | Alternatives | Reason | Date | Branch | Status | Impact |
|---|---|---|---|---|---|---|---|---|
| D-WS-1 | Three independent repos; no root CLAUDE.md | Owner instruction | Monorepo | Independent releases | 2026-11-21 | main | APPROVED (owner) | Cross-app = separate PRs |
| D-WS-2 | Folder names fleetflow-api / fleetflow-admin / fleetflow-driver-app | Owner choice | — | — | 2026-11-21 | main | APPROVED (owner) | — |
| D-ADM-1 | Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui | architecture §2 | Vite SPA; MUI/Mantine | BFF for httpOnly tokens; owned component code | 2026-11-21 | main | PROPOSED | — |
| D-ADM-2 | BFF proxy with httpOnly cookies | architecture §8–9 | Tokens in browser storage | XSS cannot steal tokens | 2026-11-21 | main | PROPOSED (API D-API-2 APPROVED 2026-11-22: JWT via BFF httpOnly cookies) | API auth design |
| D-ADM-3 | API types: openapi-typescript + openapi-fetch | architecture §2, §8 | orval-generated hooks | Smaller generated surface | 2026-11-21 | main | NEEDS APPROVAL | — |
| D-ADM-4 | Map: MapLibre + react-map-gl; tile provider TBD | architecture §16 | Google Maps | No per-load license | 2026-11-21 | main | NEEDS APPROVAL (tile provider may be paid) | Cost |
| D-ADM-5 | Design system: IBM Plex Sans/Mono, blue primary, light + dark | design.md | Inter/Geist; light only | Legible dense data; distinct look; night dispatch | 2026-11-21 | main | PROPOSED | — |
| D-ADM-6 | Phase reorder: Customers before Shipments; Dashboard after Dispatch | phases.md | PROJECT.md order | Real data dependency; no mock dashboards | 2026-11-21 | main | PROPOSED | — |
| D-ADM-7 | TypeScript version | TS 7.0.2 (native) published 2026-11 | TS version Next 16.4 supports | Compatibility | 2026-11-21 | main | NEEDS APPROVAL (Phase 0) | Tooling |

## Dependencies added/changed
None installed. Proposed stack: architecture.md §2.

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

### feature/admin-foundation (planned)
- Status: Not started. Planned work: Phase 0 technical setup. Implemented: none. Tests: none.

## Known issues
| Issue | Severity | Branch | Status | Resolution |
|---|---|---|---|---|
| TanStack Table v9 is a recent major; API stability unverified | Low | — | Open | Verify at Phase 0 |
| Map tile provider not chosen (possible paid service) | Medium | — | Open | Owner decision D-ADM-4 |

## Next steps
1. Owner reviews docs (especially design.md) and decides D-ADM-3, D-ADM-4, D-ADM-7, Sentry and hosting.
2. First commit of docs (owner action, or on request).
3. Create `feature/admin-foundation` and start Phase 0 technical setup once fleetflow-api exposes a schema.
