# fleetflow-admin: Design System (authoritative contract)

Status: **APPROVED** (owner, 2026-11-23, D-ADM-5; visual sign-off at the Phase 0 token showcase checkpoint). It is binding: no screen may invent colors, type sizes, spacing, radii, shadows or component variants. To change anything here, follow [§12 Consistency enforcement](#12-consistency-enforcement).

Implementation: tokens live in `src/styles/tokens.css` as CSS variables, exposed to Tailwind v4 via `@theme static`. The default Tailwind colours, type sizes, font weights, radii and shadows are reset, so only these tokens generate utilities. A utility name is the token name without its namespace: `--color-surface` → `bg-surface`, `--color-text-secondary` → `text-text-secondary`, `--text-caption` → `text-caption`. Components reference **semantic** tokens only, never raw hex values or Tailwind palette classes (`bg-blue-600` generates nothing). Light and dark values sit side by side in `light-dark()`; the theme follows the OS unless `<html data-theme="light|dark">` overrides it. The dev-only showcase at `/dev/tokens` renders every token and base component.

## 1. Direction
FleetFlow Admin is a **control room, not a marketing site**. Premium enterprise SaaS, closer to a well-made trading or ops terminal than a template dashboard: calm neutral surfaces, one confident brand blue, colour reserved for meaning (status, alerts), dense but legible data, crisp 1 px borders instead of heavy shadows, and modest radii.

Avoid: gradients, glassmorphism, decorative illustrations in work areas, oversized KPI cards, pill-everything shapes, emoji as icons, animated counters, colour used for decoration, hover-only actions, and centred narrow layouts for data screens.

## 2. Colour tokens
Contrast was computed for the key pairs on 2026-11-21 (WCAG 2.2 AA: text ≥ 4.5:1, UI boundaries and glyphs ≥ 3:1). Light: muted/surface 4.93, primary-fg/primary 6.67, every status/subtle pair ≥ 4.93, input border/surface 3.35. Dark: muted/surface 5.75, every status/subtle pair ≥ 5.61. **`--color-muted` must not be used on `--color-surface-sunken`** (4.28:1); use `--color-text-secondary` there. Disabled colours are exempt. Re-verify any token change.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#F5F6F8` | `#0D1015` | app background behind surfaces |
| `--color-surface` | `#FFFFFF` | `#141920` | cards, tables, panels |
| `--color-surface-elevated` | `#FFFFFF` | `#1A2029` | dialogs, popovers, drawers (always with shadow-2) |
| `--color-surface-sunken` | `#EDEFF2` | `#10141A` | table header, input bg (read-only), code wells |
| `--color-border` | `#DCE0E5` | `#29303A` | default 1 px borders, dividers |
| `--color-border-strong` | `#C3C9D1` | `#3A4350` | emphasized separators (decorative, not a control boundary) |
| `--color-border-input` | `#858D99` | `#626C7A` | input, select, checkbox boundaries (≥ 3:1 vs surface, WCAG 1.4.11) |
| `--color-text` | `#151A21` | `#E7EAEE` | primary text |
| `--color-text-secondary` | `#4A5360` | `#AAB2BD` | secondary text, table cells of lesser weight |
| `--color-muted` | `#69717D` | `#8B94A0` | captions, placeholders, meta (≥ 4.5:1 on surface) |
| `--color-primary` | `#1D55C4` | `#5B8CF0` | primary buttons, links, active nav, selection |
| `--color-primary-hover` | `#1747A6` | `#77A0F4` | |
| `--color-primary-fg` | `#FFFFFF` | `#0D1015` | text on primary |
| `--color-primary-subtle` | `#E9F0FC` | `#18263F` | selected row, active nav bg |
| `--color-secondary` | `#EDEFF2` | `#222833` | secondary buttons |
| `--color-secondary-hover` | `#E1E5EA` | `#2B3240` | |
| `--color-accent` | `#0F7F78` | `#3CC2B8` | route lines, map highlights, "live" pulses only |
| `--color-success` / `-subtle` | `#13783D` / `#E6F5EC` | `#43C47A` / `#10291B` | delivered, available, valid |
| `--color-warning` / `-subtle` | `#9A5800` / `#FFF3DE` | `#F0AC48` / `#2D2010` | at-risk, stale, expiring |
| `--color-error` / `-subtle` | `#BF2A2F` / `#FCEBEB` | `#F06B6F` / `#30161A` | failed, blocked, destructive |
| `--color-info` / `-subtle` | `#0A6C9E` / `#E5F3FA` | `#4DB3E6` / `#0F2430` | informational, in-progress |
| `--color-neutral-status` / `-subtle` | `#5A6370` / `#EEF0F3` | `#9AA3AE` / `#1E242D` | draft, inactive, unknown |
| `--color-hover` | `rgba(21,26,33,.04)` | `rgba(231,234,238,.05)` | row and menu hover overlay |
| `--color-focus` | `#1D55C4` | `#77A0F4` | 2 px focus ring, 2 px offset |
| `--color-disabled-bg` / `-fg` | `#EFF1F4` / `#9AA1AB` | `#1A1F27` / `#5C6470` | disabled controls |
| `--color-overlay` | `rgba(13,16,21,.48)` | `rgba(0,0,0,.6)` | modal scrim |

**Themes**: light is the default. Dark is supported from Phase 1 (dispatch rooms and night shifts), selected via a user preference (`system` / `light` / `dark`) stored per user. Status hues keep their meaning in both themes.

## 3. Typography
| Token | Value |
|---|---|
| Sans | **IBM Plex Sans** (400, 500, 600) via `next/font`. Technical, legible at small sizes, distinct from default SaaS fonts |
| Mono | **IBM Plex Mono** (400, 500): tracking numbers, IDs, coordinates, barcodes, codes |
| Numerals | `font-variant-numeric: tabular-nums` on all tables, KPIs, times, weights, money, counts |

| Style | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|
| `display` | 24 / 32 | 600 | -0.01em | page title (one per page) |
| `h2` | 18 / 26 | 600 | -0.005em | section titles |
| `h3` | 15 / 22 | 600 | 0 | card and panel titles |
| `body` | 14 / 20 | 400 | 0 | default text |
| `body-strong` | 14 / 20 | 500 | 0 | emphasis, primary cell |
| `table` | 13 / 18 | 400 | 0 | table cells (default density) |
| `label` | 13 / 18 | 500 | 0 | form labels, button text |
| `caption` | 12 / 16 | 400 | 0.005em | meta, helper text, timestamps |
| `overline` | 11 / 16 | 600 | 0.06em, uppercase | table headers, group labels (sparingly) |
| `kpi` | 22 / 28 | 600 | -0.01em, tabular | KPI values |

No other sizes. Never use bold (700) or light (300).

## 4. Spacing, radius, elevation
- **Spacing scale (px)**: 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64. Tailwind keeps its 4 px spacing multiplier, because component sizes need it (`h-7` = 28 px). Padding, margin, gap and space utilities must stay on this scale, which `npm run lint:tokens` enforces in CI. Arbitrary values on design utilities (`p-[13px]`, `bg-[#…]`, `text-[12px]`) are forbidden and also fail that check.
- **Radius**: `--radius-sm` 4 px (badges, checkboxes, inputs-sm), `--radius-md` 6 px (buttons, inputs, cards, menus), `--radius-lg` 8 px (dialogs, drawers, popovers). No fully rounded pills except avatars and the GPS freshness dot.
- **Elevation**: `shadow-1` = `0 1px 2px rgba(13,16,21,.06)` for sticky headers and raised cards (rare); `shadow-2` = `0 8px 24px rgba(13,16,21,.12), 0 2px 6px rgba(13,16,21,.08)` for overlays. Cards use a border, not a shadow.
- **Borders**: 1 px `--color-border`. Focus is never shown by a border change alone; always use the focus ring.

## 5. Layout
| Element | Spec |
|---|---|
| Sidebar | 240 px expanded, 56 px collapsed (icons plus tooltips); grouped nav (Operations, Fleet, Warehouse, Customers, Insights, Settings); collapse state persisted |
| Header | 52 px; breadcrumbs left; global search (⌘K), branch switcher, realtime status, notifications, user menu right |
| Page padding | 24 px (≥ 1024), 16 px (< 1024) |
| Content width | full width for tables and boards; forms max 720 px; detail pages use a 12-column grid (main 8 + side 4 at ≥ 1280) |
| Grid gutter | 16 px |
| Breakpoints | `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 |
| < 1024 | sidebar becomes an overlay drawer; header keeps search and menu |
| Table density | compact 32 px rows, default 40 px, comfortable 48 px; user-selectable; dispatch and warehouse default to compact |
| Dashboard | top KPI strip: up to 6 compact `KpiStat` (label, value, delta), height ≤ 72 px. Then a 2-column grid of operational panels (status mix, active routes, exceptions, live fleet map). No hero cards |

## 6. Components (standards)
All built on shadcn/ui primitives and restyled to these tokens. Heights: **sm 28, md 32 (default), lg 40**. Every interactive element has hover, active, focus-visible, disabled and loading states.

| Component | Rules |
|---|---|
| Button | Variants: `primary`, `secondary`, `ghost`, `destructive`, `link`. One primary per view region. Icon left, 16 px. Loading = spinner replaces icon, label stays, disabled. Destructive is used only for the confirming action |
| Icon button | Square (28/32/40), `aria-label` required, tooltip on hover/focus |
| Input | 32 px, `--radius-md`, `--color-border-input`, label above (never placeholder-as-label), helper or error text below in `caption`; error = error border plus icon plus message |
| Search | Input with leading search icon, clear button, 300 ms debounce, `⌘K` opens the global command palette |
| Select / Combobox | Native-feeling, keyboard type-ahead; combobox for lists over 10 items with async search |
| Date picker | Native `date`/`datetime-local` inputs styled to the input spec in MVP; date-range popover only if approved later |
| Textarea | min 3 rows, auto-grow to 10, character count when limited |
| Checkbox / Radio / Switch | 16 px controls; Switch only for immediately-applied settings, never in forms that need Save |
| Tabs | Underline style, 36 px, primary indicator; URL-synced for page-level tabs |
| Breadcrumbs | `caption` size, max 4 levels, last item not a link |
| Card | Surface plus 1 px border plus `--radius-md`, 16 px padding, `h3` title row with optional actions; no shadows, no coloured backgrounds |
| Table | `overline` header in `--color-text-secondary` on `surface-sunken`, sticky header, 1 px row dividers, no zebra striping, hover overlay, selected = `primary-subtle`; numeric columns right-aligned and tabular; IDs in mono; row actions in a visible kebab button; long text truncated with tooltip |
| Pagination | Bottom right: "1–25 of 1,204" (when known) plus prev/next; page-size select (25/50/100) |
| Badge | 20 px height, `--radius-sm`, subtle bg plus strong fg, 12 px medium text; status badges include a 6 px dot or icon (not colour alone) |
| Status indicator | Dot (8 px) plus label for inline status; never a dot alone |
| Alert (inline) | Left 3 px bar in status colour, subtle bg, icon, title plus body, optional action |
| Toast | Bottom-right, max 3, 360 px wide; success auto-dismiss 4 s; error persists; includes an Undo action where possible |
| Dialog | Max widths 400 (confirm), 560 (form), 800 (complex); title, body, footer actions right (secondary then primary); Esc and scrim close unless the form is dirty |
| Drawer | Right side, 480 px (detail) / 720 px (wide); used for quick view and edit without losing list context |
| Dropdown / Menu | 32 px items, icons 16 px, destructive items last with a separator, keyboard navigable |
| Tooltip | Delay 400 ms, `caption` text, max 280 px; never contains the only copy of critical info |
| Skeleton | Matches the final layout (table rows, cards); subtle shimmer ≤ 1.5 s cycle; disabled under reduced motion |
| Empty state | In-place (not full page): icon (24 px, muted), title (`h3`), one-sentence reason, primary action if permitted |
| Error state | Icon in error colour, title, message mapped from error code, Retry button, `request_id` in caption |
| Loading state | Skeleton for content; inline spinner (16 px) for actions; global top progress bar for route transitions |
| Charts | Use tokens for series: primary, accent, info, warning, neutral (max 5 series); gridlines `--color-border`; tooltips with tabular values; accessible data-table toggle |
| Map panel | Bordered panel; legend top-left; controls top-right; marker colours from GPS freshness tokens; selected marker gets a primary ring |
| Timeline | Vertical, newest first; 8 px status dot plus line; each event: status label, time (relative plus absolute on hover), actor, source; corrections styled with a warning dot plus "Corrected" tag |
| File upload | Dropzone with dashed `--color-border-strong`, accepted types and max size stated, progress bar per file, retry or remove per file, error inline |

## 7. Logistics-specific visual standards
Statuses come from the API enums. Colour mapping is fixed here and implemented once in `StatusBadge`.

**Shipment status**
| Status | Tone | Icon (lucide) |
|---|---|---|
| draft | neutral | `file-pen` |
| created | neutral | `package` |
| received_at_warehouse | info | `warehouse` |
| sorted | info | `layers` |
| assigned | info | `user-check` |
| loaded | info | `package-check` |
| out_for_delivery | primary | `truck` |
| delivered | success | `circle-check` |
| delivery_failed | error | `circle-alert` |
| returning | warning | `undo-2` |
| returned_to_sender | neutral | `corner-up-left` |
| cancelled | neutral (strikethrough-free, muted) | `ban` |

**Route status**: planned → neutral · assigned → info · loading → info · dispatched → primary · in_progress → primary (with a live dot) · completed → success · cancelled → neutral.

**Driver availability**: available → success · on_route → primary · on_break → warning · off_shift → neutral · on_leave → neutral · suspended → error.

**Vehicle availability**: available → success · in_use → primary · maintenance → warning · out_of_service → error · documents_expired → error with `file-warning`.

**Delivery exceptions**: always error tone; type label plus age ("2h 14m unresolved"). The age turns to emphasized error at SLA breach.

**Priority**: `standard` (no badge) · `express` (warning outline badge) · `same_day` (error outline badge, icon `zap`). Never use red fill for priority (it would be confused with failure).

**GPS freshness**: live < 2 min → success dot (accent pulse disabled under reduced motion) · stale 2–15 min → warning dot plus "5 min ago" · offline > 15 min → neutral hollow dot plus "Offline 42 min". Thresholds come from the API.

**ETA**: absolute time in the company timezone (`14:35`) plus relative (`in 25 min`); late = warning tone plus "+12 min"; unknown = "—" with a tooltip giving the reason.

**Tracking timeline**: see Timeline component. Public tracking page uses the same timeline with only public events.

**Driver assignment card** (dispatch board): 64 px compact card: avatar/initials, name, freshness dot, vehicle plate (mono), capacity bar (used/total weight; warning at ≥ 90 %, error above 100 %), stops count. Unavailable drivers are shown greyed with the reason, not hidden.

**Dispatch board**: three-pane layout: unassigned shipments (left, filterable list) · routes (centre columns or list, each with stops and capacity) · map (right, collapsible). Drag and drop **plus** keyboard and menu alternatives ("Assign to…"). Conflicts shown inline on the card.

**Route stop card**: sequence number (mono, in a 24 px square), stop type icon (pickup `arrow-up-from-line` / delivery `arrow-down-to-line`), address (2 lines max), time window, status badge, shipment count, ETA.

**POD preview**: thumbnail grid (photos and signature on a white tile even in dark mode), OTP verified tag, recipient name, timestamp, and a location-match indicator (success "At address" / warning "1.2 km from address"). Click opens a lightbox fed by short-lived URLs.

## 8. States
Every view: loading (skeleton), empty (contextual), error (actionable), success. After every mutation: a toast or inline confirmation naming the object ("Route R-0412 dispatched"). Long operations (import, export) show progress and finish with a notification.

## 9. UX requirements
- Clear feedback after every mutation; destructive actions confirmed (§6 Dialog).
- Filters, sort and page are preserved in the URL and restored on back navigation.
- Keyboard: every action reachable; `⌘K` command palette; `/` focuses table search; `Esc` closes overlays; dispatch board has keyboard assign.
- Forms: useful messages ("Weight must be between 0.01 and 30,000 kg"), not "Invalid input".
- Tables are not decorative: no icons in every cell, no coloured rows except selection and status badges.
- Minimize dispatcher clicks: assign in ≤ 2 interactions from the board; bulk assign supported.
- No hover-only critical actions.
- Responsive behaviour as in architecture §20.

## 10. Accessibility
WCAG 2.2 AA. Focus ring always visible on keyboard focus (2 px `--color-focus` plus 2 px offset). Hit targets ≥ 24×24 px (AA 2.5.8). Status is never conveyed by colour alone. Charts have text alternatives. `prefers-reduced-motion` disables pulses, shimmer and slide animations.

## 11. Motion & content
- Motion: 120 ms (hover/press), 180 ms (popover/dropdown), 220 ms (drawer/dialog), `cubic-bezier(.2,.0,.0,1)`. No bounce, no parallax, no animated numbers.
- Voice: plain, operational, specific. Sentence case. Use the logistics terms consistently: "shipment" (not order/parcel), "route", "stop", "driver", "vehicle", "proof of delivery (POD)", "exception". Times shown in the company timezone with the TZ abbreviation in tooltips.
- Icons: lucide-react only, 16 px in controls and 20 px in nav, `stroke-width` 1.75. No emoji anywhere in the UI.

## 12. Consistency enforcement
1. Before creating a component, search `components/ui` and `components/shared`. Extend with a variant before creating a new component.
2. If a new token, size or component is truly needed: explain why existing ones fail → propose it (with a screenshot or snippet) → owner accepts → update this file **first** → implement → record in memory.md §Decisions.
3. Review checklist for UI PRs: tokens only (grep for `#`, `rgb(`, `bg-[`, `p-[`), allowed type styles only, the four states present, keyboard and focus verified, axe clean, both themes checked.
4. External design skills (`frontend-design`, `impeccable`, `ui-ux-pro-max`) may critique or suggest, but **this file wins** on any conflict.
