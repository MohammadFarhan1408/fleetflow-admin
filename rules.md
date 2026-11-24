# fleetflow-admin: Rules (non-negotiable)

These rules are enforceable. A change that breaks one fails review. To change a rule, follow §8.

## 1. General
- Read before writing: inspect existing code, components, tests and the relevant architecture/design sections.
- Reuse existing components, hooks, query factories and utilities. Search before creating.
- No speculative features, abstractions or scaffolding "for later". No premature optimization (measure first).
- Keep changes focused. Don't modify unrelated files or reformat untouched code.
- Don't remove working functionality without a reason and owner approval.
- Clear names; maintainable over clever. Handle failures explicitly; never swallow errors (`catch {}`).
- Never hardcode secrets or API URLs; use env vars documented in `.env.example`. Nothing secret in `NEXT_PUBLIC_*`.
- No placeholder implementations, fake logic, hardcoded mock responses or unresolved TODOs in shipped code.
- Don't rewrite working code just to restyle it. Don't create files, folders or layers just to look organized.

## 2. Frontend
- Read [design.md](design.md) before UI work. **Tokens only**: no hex or rgb values, Tailwind palette classes (`bg-blue-600`) or arbitrary values (`bg-[#…]`, `p-[13px]`) in components.
- **Reusable components are mandatory.** Before building UI, search `components/ui`, `components/shared` and `features/*/components`. Reuse an existing component, or extend it with a prop or variant, instead of creating a near-copy. Never copy-paste a component and tweak it for another screen.
- When a UI pattern is needed in a second feature, promote it to `components/shared` (architecture §4) with typed, configurable props; fix bugs in the shared component, not in each usage. Don't extract one-off markup into a "reusable" component speculatively.
- Any new component, variant or token follows design.md §12.
- Keep components focused: pages compose feature components; data fetching lives in `features/<module>/api.ts`, validation in `schemas.ts`. No giant component mixing UI, networking, validation and state.
- No new font styles, colors, spacing, radii, shadows or component heights without approval.
- lucide-react icons only. **No emoji as icons.**
- No generic "AI dashboard" look: no gradients, glassmorphism, oversized KPI cards or decorative illustrations in work areas.
- Every data view has loading, empty, error and success states (architecture §18).
- Forms: RHF plus Zod, visible labels, specific messages, pending state, idempotency key, dirty-navigation guard.
- Keyboard support and visible focus everywhere; responsive per architecture §20; reduced motion respected; no gratuitous animation.
- Test visual changes (component test, both themes, axe) and review against design.md before reporting.

## 3. Admin-specific
- Operational density matters: compact, readable tables; no huge cards for simple metrics.
- Filters are fast and URL-persisted. Actions are discoverable (visible buttons or menus, never hover-only).
- Dispatch workflows minimise clicks (assign in ≤ 2 interactions) and always offer keyboard or menu alternatives to drag and drop.
- Destructive actions require a confirmation naming the object.
- **Never invent API fields, statuses or error codes.** Use the types generated from fleetflow-api's OpenAPI schema; regenerate them, never hand-edit `src/generated/`.
- **Client permission checks are UX, not security.** Always handle API 401, 403, 404 and 409 gracefully.
- Status transitions are not optimistic. Optimistic updates only with rollback (architecture §11).
- Server data lives in TanStack Query; don't copy it into local or global state.
- No mock dashboards or fake data in shipped code. Fixtures belong in tests and MSW handlers only.

## 4. Security
- Tokens stay in httpOnly cookies via the BFF and never reach browser JavaScript. The BFF forwards only to the configured API origin.
- Client-side validation is for UX; the API is the authority.
- No `dangerouslySetInnerHTML`. CSP, HSTS and security headers per architecture §22.
- Never log tokens, OTPs, presigned URLs, full phone numbers or customer addresses (console, Sentry breadcrumbs).
- Driver locations only for permitted users; the public tracking page shows only API-approved fields.
- Uploads: client type and size checks plus the API presign flow only.
- `npm audit --audit-level=high` passes, or the exception is documented in memory.md known issues.
- Guard against XSS (render user content as text only; validate and sanitize URLs before using them in `href`/`src`), CSRF on BFF mutation routes (architecture §9), open redirects (the `next` login param accepts only same-origin relative paths), and IDOR assumptions (never treat a hidden ID or route as access control).
- Users never see stack traces, raw API errors or infrastructure details; show a user-safe message and the API `request_id` where useful.
- Never disable a security control (CSP, headers, cookie flags, validation) to make a feature work. A security vulnerability found during development blocks the affected feature until it is fixed.

## 5. Testing
- Test behavior via roles, labels and visible text (RTL), not class names or internals.
- Each feature covers loading, empty, error, permission and failure paths (architecture §24). Mock the API with MSW; don't mock our own modules unnecessarily.
- Don't delete or weaken tests or assertions to pass a build. Don't skip a11y or permission tests.
- Run the relevant Vitest and Playwright specs before reporting. Never claim a pass without running. State untested areas honestly.

## 6. Code quality
- TypeScript `strict`; no `any`, `@ts-ignore` or `eslint-disable` without an inline reason.
- Modern ES syntax (ES6+):
  - Declare components, hooks, handlers and helpers as `const` arrow functions: `const Button = ({ variant, ...props }: ButtonProps) => { … };`. Don't use `function` declarations.
  - Next.js special files (`page.tsx`, `layout.tsx` and similar) declare the component as a named `const`, then `export default` it on its own line.
  - Only generator functions (`function*`) keep the `function` keyword, because arrow functions can't be generators.
  - Use `const` by default and `let` only when you reassign. Never use `var`.
  - Use ES module `import`/`export`, destructuring with default values, rest/spread, template literals, optional chaining (`?.`) and nullish coalescing (`??`) where they make code clearer.
- File names:
  - A file that exports a React component is named after it in PascalCase (`CustomersTable.tsx`, `CustomersTable.test.tsx`), one component per file. This includes `components/ui`.
  - Everything else is kebab-case: `api.ts`, `format-address.ts`, `customers-columns.tsx` (exports a column list, not a component).
  - Next.js special files (`page.tsx`, `layout.tsx`, `error.tsx`, `route.ts`, `proxy.ts`) keep their required names.
  - `npx shadcn add` creates kebab-case files, so rename them and fix the imports.
- Split very large files along real responsibilities (a feature component over ~300 lines is a signal). Avoid deep nesting.
- Extract shared code only when reuse is real (2+ call sites). No generic wrappers around libraries "just in case".
- Before writing a hook, utility, formatter or validator, search for an existing one. When fixing a bug, fix the shared logic, not each caller. Shared rules have one source of truth.
- Meaningful names: no `data`, `item`, `temp`, `response2`, `handleStuff` or `commonHelper` when a precise name exists. Avoid non-standard abbreviations.
- Small, single-purpose functions and components; prefer early returns over deep nesting.
- Comments explain _why_ (a decision, a constraint), never narrate what the code does.
- Remove dead code, unused imports, `console.log` and obsolete logic in the code you touch.
- Errors are handled explicitly and consistently through the shared API error mapping and error states; distinguish validation, 401, 403/404, 409 conflict, network and unexpected failures. Never swallow a rejected promise.
- Performance: avoid unnecessary re-renders, redundant requests and fetching unused data; optimize only for a measured problem (architecture §21).
- Lint and format clean.

## 7. Contracts & cross-app
- fleetflow-api owns contracts. If a needed field or endpoint is missing, record an API request in memory.md and tell the user. Never fake it client-side.
- After regenerating API types, fix every compile error and note the schema version in memory.md.

## 8. Architecture & dependency changes
Stop and present: current decision, problem, proposal, alternatives, pros and cons, dependency, bundle and testing impact, effect on the other apps, and a migration plan. Get owner approval, then update architecture.md, design.md or rules.md and memory.md. Dependencies follow the checklist in CLAUDE.md §Dependencies.

## 9. Git
- Run `git status` and `git branch --show-current` first. Never develop on `main`.
- Branch prefixes: `feature/`, `fix/`, `refactor/`, `test/`, `docs/`, `chore/` (e.g. `feature/admin-dispatch-board`).
- Conventional Commits; focused commits; no unrelated changes.
- No force push, no amending unless asked, no merging without approval, no destructive commands without approval. Never overwrite uncommitted user changes.
- Record branch work in memory.md §Branch history.

## 10. Documentation
Update docs when a dependency, architecture, design token or component standard, phase, rule, API contract usage or test strategy changes, or when a major module lands. Never document unbuilt features as done or untested code as tested.

## 11. Constants & configuration
- No magic numbers or strings. A value repeated across files (route path, query key, storage or cookie key, event name, permission identifier, status label, shared UI label, error message, validation limit, pagination default) has one definition.
- Statuses, enums and error codes come from the generated API types (§3), never redeclared by hand.
- Navigation and route permissions live in `lib/navigation.ts` (architecture §5); query keys in each module's `api.ts` factories (architecture §6); other shared values in the owning feature or `lib/` module.
- Scope constants by domain. No single project-wide constants file.
- A value used once and clear inline stays inline. Don't create a constant for it.
- Environment-specific values come from env vars (architecture §23), are validated and typed at startup, and fail fast when a required one is missing.
