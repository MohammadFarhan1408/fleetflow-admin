---
name: fleetflow-admin-ui
description: FleetFlow admin console UI build checklist. Use when creating or changing any page, component, form, table, chart, map or dispatch board UI in fleetflow-admin. Load before frontend-design or impeccable. Not for non-UI tasks.
---

# FleetFlow admin UI

design.md is the contract. Read only the sections you need:
- tokens §2–4, layout §5, the component spec in §6 for the component you're touching, logistics visuals §7, states §8, UX §9

Checklist:
1. **Phase gate**: is the screen in the current phase ([phases.md](../../../phases.md))? If not, stop.
2. **Reuse**: search `src/components/ui`, `src/components/shared` and the feature's `components/`. Add a variant before you create a new component.
3. **Data**: use generated API types and query factories (`features/<m>/api.ts`). Never invent fields or statuses. Filters, sort and page go in the URL (nuqs).
4. **Tokens only**: no hex, rgb, palette classes or arbitrary values. Use IBM Plex type styles from §3 only; tabular numerals for data; mono for IDs.
5. **Status display** through `StatusBadge` with the fixed mapping (§7). Never colour alone.
6. **All four states**: skeleton, contextual empty, actionable error (retry plus request_id), success feedback after mutations.
7. **Permissions**: `PermissionGate` for UX, plus graceful API 403/404/409 handling.
8. **A11y**: labels, keyboard path, focus ring, ≥ 24 px targets, reduced motion.
9. **Density**: compact tables for ops screens; no oversized cards; visible row actions.
10. **Verify**: component tests (load `fleetflow-admin-testing`), both themes, axe clean. Optionally `/impeccable critique` on the result. Its advice yields to design.md.
