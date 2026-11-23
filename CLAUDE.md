# fleetflow-admin: Claude Code Instructions

> **PHASE 1: CORE APPLICATION SHELL** (in progress, see phases.md). Phase 0 is complete. Business module screens start in Phase 2, except the read-only Users list approved for Phase 1 (D-ADM-11). No mock dashboards.

## Identity
| | |
|---|---|
| App | **fleetflow-admin**: FleetFlow operations web console (Next.js 16 + TypeScript 6) |
| Users | Company admins, operations managers, dispatchers, fleet managers, warehouse staff, finance, customer service |
| Purpose | Run daily logistics operations: shipments, dispatch board, routes, fleet, warehouse, exceptions, POD review, reports, settings |
| Boundaries | A **client** of fleetflow-api. Owns UI, UX, client-side validation and the BFF auth cookie handling. Does **not** own business rules, permissions or data contracts. UI permission checks are UX only |
| Related apps | `../fleetflow-api` (backend, owns contracts) and `../fleetflow-driver-app` (driver mobile app) |
| Repo | Its own git repo (`main`) |

FleetFlow is three independent repos in one workspace folder. There is no root CLAUDE.md.

## Read before working (targeted)
| Order | File | When |
|---|---|---|
| 1 | `CLAUDE.md` (this) | Always |
| 2 | [rules.md](rules.md) | Always. Read the sections relevant to the task |
| 3 | [phases.md](phases.md) | Confirm the task is in the current phase |
| 4 | [memory.md](memory.md) | Status, decisions, branch history |
| 5 | [architecture.md](architecture.md) | Relevant sections only |
| 6 | [design.md](design.md) | **Before any UI or visual work.** It is the design contract |
| 7 | [skills.md](skills.md) | **Every session**: pick the skill(s) for the task |

**API contract**: request and response shapes, enums and error codes come from fleetflow-api's OpenAPI schema (`../fleetflow-api/architecture.md` §25). Never invent fields or statuses. If something you need is missing, record it as an API request in memory.md and tell the user.

**Cross-app work**: also read the affected sibling's `CLAUDE.md`, relevant architecture sections and `memory.md`, and update every affected memory.

## Engineering standards
Work as a senior engineer, not a code generator. Correctness, security, maintainability, accessibility and readability come before speed of delivery. The enforceable detail is in [rules.md](rules.md); these are the principles behind it.

- **Verify, don't assume.** If the codebase or docs can answer a question, inspect them instead of guessing. Base decisions on the actual requirements and the existing architecture.
- **Production-ready by default.** No placeholder logic, fake data, mock dashboards, hardcoded mock responses, invented features or integrations, or unresolved TODOs in shipped code unless the owner asks for a prototype.
- **Reusable components.** Build every screen from shared components. Before writing UI, search `src/components/ui`, `src/components/shared` and `src/features/*/components`, and reuse or extend an existing component (props, variants) instead of copying markup. When the same UI pattern is needed in a second place, extract it into a shared component rather than duplicating it (rules.md §2).
- **Simple over clever.** No overengineering, premature abstraction or speculative layers. Explicit, readable code beats compact, clever code.
- **Challenge flawed approaches.** If a request or design is technically unsound, risky or unnecessary, say why and propose a better option instead of implementing it silently. Do not agree just to agree.
- **Unclear requirements.** Never invent requirements that affect architecture, security, data integrity, API contracts or user experience. If a safe, reasonable interpretation exists, state the assumption and proceed. If interpretations would lead to materially different implementations, ask concise questions first. Name the trade-offs when several solutions exist.
- **Fit the codebase.** Every change should have a clear purpose, follow existing patterns, conventions and design.md, and not rewrite working code just to make it look different.
- **Long-term view.** Write code a skilled engineer would be comfortable reviewing, securing and extending two years from now.

## Workflow (mandatory)
Do not skip investigation or verification to get to code faster.
1. Understand the request.
2. Run `git status` and `git branch --show-current`. No feature work on `main`.
3. Read the relevant docs (and design.md for UI).
4. Confirm the phase.
5. Identify impacted routes, features, components and API endpoints.
6. Search for existing components, hooks and utilities before creating any (`src/components/ui`, `src/features/*`).
7. Medium or large change: present a plan first.
8. Implement the smallest complete solution using design tokens and existing components.
9. Write or update tests (component, form, table, permission, E2E as relevant).
10. Run typecheck, lint, unit tests, and the relevant Playwright specs.
11. Review your own diff: unrelated changes, regressions, duplicated components or logic, hardcoded colors, spacing or repeated values, a11y, security, bundle impact, and unnecessary files, abstractions or dependencies.
12. Update docs and memory.md (actual results only).
13. Report: what changed, which checks ran and their results, issues found, limitations, anything left unverified or incomplete, and next steps.

## Definition of done
A task is complete only when every item holds. If one cannot be met, say so in the report instead of declaring the task done.

- [ ] The requirements are met, and nothing beyond them was invented.
- [ ] The change follows the established architecture, folder structure and design.md.
- [ ] Existing behavior is not broken, and API usage matches the generated contract.
- [ ] Existing components were reused; no duplicated components or logic; repeated values are centralized (rules.md §11).
- [ ] Security implications are considered: no tokens in browser JS, no unsafe HTML, no sensitive data in logs; client checks are treated as UX only.
- [ ] Loading, empty, error, success and disabled states are handled, and errors leave no inconsistent UI state.
- [ ] Typecheck, lint, the relevant Vitest and Playwright specs, and the build (when relevant) were actually run and pass.
- [ ] Performance (re-renders, redundant requests, bundle size) and accessibility were reviewed.
- [ ] No unnecessary dependencies, files, abstractions or code were introduced.
- [ ] The report accurately reflects what was implemented and verified.

## Architecture adherence
Do not casually change: the framework or router, the UI component system, the server-state library, form or validation libraries, the table, chart or map libraries, the auth/BFF pattern, the navigation structure, design tokens, or the testing strategy. Changes need: reason, alternatives, impact, updates to architecture/design/rules, a decision in memory.md, and **owner approval** if they alter a PROPOSED or APPROVED decision.

## Dependencies
Check whether an installed dependency or the platform already does the job (native `<input type="date">`, `Intl`, CSS). Then check maintenance, React and Next compatibility, security, bundle size (`next build` output), license, and alternatives for significant libraries. Record the choice in architecture.md §Technology and memory.md. Never add a package because generated code imported it.

## Session continuity
Docs are the source of truth. Verify; don't assume. Never claim tests passed without running them.

## Communication & docs style
Caveman (moderate) applies to chat replies only. Docs, commits and PR text are normal prose. UI copy follows design.md §Content, not caveman.
