# fleetflow-admin: Design System (authoritative contract)

Status: **APPROVED** (owner). v2 "Indigo & Signal" adopted 2026-11-23 (D-ADM-15, supersedes the v1 blue/IBM Plex direction of D-ADM-5); visual sign-off at the Phase 1 shell checkpoint. It is binding: no screen may invent colors, type sizes, spacing, radii, shadows or component variants. To change anything here, follow [§12 Consistency enforcement](#12-consistency-enforcement).

Implementation: tokens live in `src/styles/tokens.css` as CSS variables, exposed to Tailwind v4 via `@theme static`. The default Tailwind colours, type sizes, font weights, radii and shadows are reset, so only these tokens generate utilities. A utility name is the token name without its namespace: `--color-surface` → `bg-surface`, `--color-text-secondary` → `text-text-secondary`, `--text-caption` → `text-caption`. Components reference **semantic** tokens only, never raw hex values or Tailwind palette classes (`bg-blue-600` generates nothing). Light and dark values sit side by side in `light-dark()`; the theme follows the OS unless `<html data-theme="light|dark">` overrides it. The dev-only showcase at `/dev/tokens` renders every token and base component.

## 1. Direction: "Indigo & Signal"
FleetFlow Admin is a **control room with a friendly face**: dispatchers, warehouse staff and finance live in it all day, so it must be calm, fast to scan and pleasant, never a template dashboard. The palette comes from the owner's reference (indigo `#4B49AC`, blues `#7DA0FA` / `#98BDFF`, periwinkle `#7978E9`) plus one logistics accent, **signal orange** (the colour of hi-vis vests, freight labels and hazard tape).

- **Indigo is the action colour**: primary buttons, active navigation, links, selection, focus. It is the only reference colour that carries white text at AA (7.4:1).
- **Signal orange marks motion and liveness**: the brand mark, route lines, live indicators, the one highlighted chart series. Never a status, never a button fill, never body text.
- **The reference blues and periwinkle are data colours**: chart series and soft tints. They fail contrast as text backgrounds (1.9 to 3.7:1 with white), so they never carry text.
- **Status colours are semantic only** (§7) and tuned to sit with indigo: success green, golden amber warning (kept away from orange), cool crimson error, blue info.
- **Surfaces**: a faint indigo-tinted canvas with white panels that lift with a hairline border and a soft shadow. Generous radii (8 to 16 px) give the friendly feel; density stays operational.
- **Spend boldness in one place per screen.** The auth screen gets the signature moment (indigo panel with an orange route line). Work areas stay quiet: the data is the hero.

Avoid: gradients, glassmorphism, decorative illustrations in work areas, oversized solid-colour KPI cards (white text on light fills fails AA), coral or red for anything that is not an error, all-caps labels, emoji as icons, animated counters, colour used for decoration, hover-only actions, and centred narrow layouts for data screens.

## 2. Colour tokens
Contrast verified 2026-11-23 for every text, UI-boundary and status pair below in both themes (WCAG 2.2 AA: text ≥ 4.5:1, UI boundaries and graphics ≥ 3:1). Light: muted on surface 5.14, muted on bg 4.77, white on primary 7.37, primary on primary-subtle 6.35, every status on its subtle ≥ 4.78, input border 3.27, accent 3.41. Dark: muted on surface 5.82, primary-fg on primary 7.55, every status on its subtle ≥ 5.72. Disabled colours are exempt. Re-verify any token change.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#F5F6FB` | `#0E0F1E` | app canvas behind panels |
| `--color-surface` | `#FFFFFF` | `#16182B` | cards, tables, panels, sidebar, header |
| `--color-surface-elevated` | `#FFFFFF` | `#1D2036` | dialogs, popovers, drawers (always with shadow-2) |
| `--color-surface-sunken` | `#EFF1F8` | `#111225` | table header, read-only inputs, wells |
| `--color-border` | `#E2E5F0` | `#2A2D47` | hairlines, dividers, card edges |
| `--color-border-strong` | `#C9CEE0` | `#3A3E5C` | emphasised separators, dropzones (decorative) |
| `--color-border-input` | `#878DAA` | `#6E7395` | input, select, checkbox boundaries (≥ 3:1) |
| `--color-text` | `#1A1C34` | `#E9EAF6` | primary text |
| `--color-text-secondary` | `#4A4F6B` | `#B3B6D1` | secondary text, lesser table cells |
| `--color-muted` | `#676C89` | `#9093B0` | captions, placeholders, meta |
| `--color-primary` | `#4B49AC` | `#A09EF5` | primary buttons, links, active nav, selection |
| `--color-primary-hover` | `#3E3C93` | `#B6B4F8` | |
| `--color-primary-fg` | `#FFFFFF` | `#12132A` | text on primary |
| `--color-primary-subtle` | `#EDEDFA` | `#25264D` | selected row, hover tint of active items |
| `--color-brand` / `-fg` | `#4B49AC` / `#FFFFFF` | `#4B49AC` / `#FFFFFF` | brand surfaces that stay deep indigo in both themes: logo tile, auth panel (7.37:1) |
| `--color-secondary` | `#EEF0F8` | `#23263D` | secondary buttons |
| `--color-secondary-hover` | `#E3E6F2` | `#2C2F4A` | |
| `--color-accent` | `#E5640F` | `#FF8A3D` | signal orange: brand mark, route lines, live indicators (graphics only) |
| `--color-success` / `-subtle` | `#137A44` / `#E5F5EC` | `#4CC985` / `#0F2A1C` | delivered, available, valid |
| `--color-warning` / `-subtle` | `#8A6300` / `#FFF4D4` | `#E8B730` / `#2B2410` | at-risk, stale, expiring |
| `--color-error` / `-subtle` | `#C3283A` / `#FDEBEE` | `#F2707E` / `#331820` | failed, blocked, destructive |
| `--color-info` / `-subtle` | `#2D63C8` / `#E8F0FE` | `#7DA0FA` / `#152442` | informational, in progress |
| `--color-neutral-status` / `-subtle` | `#5B6079` / `#EEF0F6` | `#A2A6C0` / `#20233A` | draft, inactive, unknown |
| `--color-hover` | `rgba(75,73,172,.06)` | `rgba(233,234,246,.05)` | row and menu hover overlay |
| `--color-focus` | `#4B49AC` | `#B6B4F8` | 2 px focus ring, 2 px offset |
| `--color-disabled-bg` / `-fg` | `#EFF0F5` / `#9DA1B5` | `#1C1E30` / `#5E627C` | disabled controls |
| `--color-overlay` | `rgba(18,19,40,.48)` | `rgba(0,0,0,.6)` | modal scrim |
| `--color-chart-1` … `-5` | `#4B49AC` `#7DA0FA` `#E5640F` `#7978E9` `#98BDFF` | `#A09EF5` `#7DA0FA` `#FF8A3D` `#8E8DF0` `#98BDFF` | chart series in this order (indigo, blue, orange highlight, periwinkle, light blue). Graphics only, never text |

**Themes**: light is the default. Dark (dispatch rooms, night shifts) is chosen in the user menu (`System` / `Light` / `Dark`), remembered per browser and applied before first paint. Status hues keep their meaning in both themes.

## 3. Typography
| Token | Value |
|---|---|
| Sans | **Nunito Sans** (400, 600, 700) via `next/font`. Soft, open and friendly, from the owner's reference; legible at 13 px |
| Mono | **IBM Plex Mono** (400, 500): tracking numbers, IDs, coordinates, barcodes, codes |
| Numerals | `font-variant-numeric: tabular-nums` on all tables, KPIs, times, weights, money, counts |

| Style | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|
| `display` | 26 / 34 | 700 | -0.015em | page title (one per page) |
| `h2` | 18 / 26 | 700 | -0.01em | section titles |
| `h3` | 15 / 22 | 600 | 0 | card and panel titles |
| `body` | 14 / 20 | 400 | 0 | default text |
| `body-strong` | 14 / 20 | 600 | 0 | emphasis, primary cell |
| `table` | 13 / 18 | 400 | 0 | table cells (default density) |
| `label` | 13 / 18 | 600 | 0 | form labels, button text |
| `caption` | 12 / 16 | 400 | 0.005em | meta, helper text, timestamps |
| `overline` | 12 / 16 | 600 | 0.01em, sentence case | table headers, nav group labels |
| `kpi` | 26 / 32 | 700 | -0.02em, tabular | KPI values |

No other sizes or weights. No all-caps text anywhere (labels stay sentence case).

## 4. Spacing, radius, elevation
- **Spacing scale (px)**: 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64. Tailwind keeps its 4 px spacing multiplier, because component sizes need it (`h-7` = 28 px). Padding, margin, gap and space utilities must stay on this scale, which `npm run lint:tokens` enforces in CI. Arbitrary values on design utilities (`p-[13px]`, `bg-[#…]`, `text-[12px]`) are forbidden and also fail that check.
- **Radius**: `--radius-sm` 6 px (badges, checkboxes, small controls), `--radius-md` 8 px (buttons, inputs, menus, nav items), `--radius-lg` 12 px (cards, panels, tables), `--radius-xl` 16 px (dialogs, drawers, auth panel). `--radius-full` only for avatars, switches and status dots.
- **Elevation**: `shadow-1` = `0 1px 2px rgba(26,28,52,.04), 0 2px 8px rgba(26,28,52,.04)` for cards and panels (with a hairline border) and the sticky header; `shadow-2` = `0 12px 32px rgba(26,28,52,.14), 0 2px 6px rgba(26,28,52,.06)` for overlays.
- **Borders**: 1 px `--color-border`. Focus is never shown by a border change alone; always use the focus ring.

## 5. Layout
| Element | Spec |
|---|---|
| Sidebar | 248 px expanded, 68 px collapsed (icons plus tooltips); surface colour with a hairline right border; brand at top; grouped nav (Operations, Fleet, Warehouse, Customers, Insights, Settings), showing only modules that exist and the user may open; active item = indigo fill with white text; collapse state persisted |
| Header | 60 px, surface colour, sticky with shadow-1 once scrolled; left: menu button (< 1024) and breadcrumbs or page context; right: branch switcher, realtime status (Phase 7), notifications (when the API exists), user menu |
| Page padding | 32 px (≥ 1280), 24 px (≥ 1024), 16 px (< 1024) |
| Content width | full width for tables and boards; forms max 720 px; detail pages: identity header, then the availability panel (full width), then a 12-column grid (main 8 + side 4 at ≥ 1280). A page with one main block (a vehicle) uses one full-width card with zones instead of an empty side column |
| Grid gutter | 16 px (24 px between page sections) |
| Breakpoints | `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 |
| < 1024 | sidebar becomes an overlay drawer opened from the header menu button |
| Table density | compact 32 px rows, default 40 px, comfortable 48 px; user-selectable; dispatch and warehouse default to compact |
| Dashboard | top KPI strip: up to 6 compact `KpiStat` on white panels (label, value, delta, a 32 px tinted icon chip), height ≤ 88 px. Then a 2-column grid of operational panels (status mix, active routes, exceptions, live fleet map). No hero cards, no solid-colour KPI cards |

## 6. Components (standards)
All built on shadcn/ui primitives and restyled to these tokens. Heights: **sm 28, md 32 (default), lg 40**. Every interactive element has hover, active, focus-visible, disabled and loading states.

| Component | Rules |
|---|---|
| Button | Variants: `primary`, `secondary`, `ghost`, `destructive`, `link`. One primary per view region. Icon left, 16 px. Loading = spinner replaces icon, label stays, disabled. Destructive is used only for the confirming action |
| Icon button | Square (28/32/40), `aria-label` required, tooltip on hover/focus |
| Input | 32 px, `--radius-md`, `--color-border-input`, label above (never placeholder-as-label), helper or error text below in `caption`; error = error border plus icon plus message. **Required fields carry an asterisk after the label** (error colour, `aria-hidden`; the control is `aria-required`). Optional fields carry no mark and no "optional" wording |
| Search | Input with leading search icon, clear button, 300 ms debounce, `⌘K` opens the global command palette |
| Choice cards | 2 to 4 mutually exclusive options that each need a sentence of explanation (for example customer type): cards in a radio group, 32 px icon tile, `body-strong` title, `caption` description, `--radius-lg`. Selected = `primary` border, `primary-subtle` fill and a check mark (never colour alone). One tab stop, arrow keys move the choice. Use a Select for longer or terse lists |
| Select / Combobox | Native-feeling, keyboard type-ahead; combobox for lists over 10 items with async search |
| Date picker | Own month-grid `Calendar` (no library; owner decision 2026-11-26): `grid` with weekday headers (week start from the locale), month and year in the header with previous and next buttons, one tab stop on the focused day, arrows ±1 day or ±1 week, Home/End start and end of the week, PageUp/PageDown ±1 month (Shift ±1 year), Enter or Space selects. Selected day = `primary` fill. Day buttons are at least 28 px and named with the full date. `DatePicker` is a 32 px button (calendar icon, the formatted day, or the placeholder) that opens the `Calendar` in a non-modal popover; a reset button (for example "Today") clears the value. A day is `YYYY-MM-DD`, never an instant. `datetime-local` stays native until a time picker is approved |
| Filter bar | Above every list, one 32 px row: Search (288 px), then the filters, then "Clear all" (ghost button with an x, only while a filter is applied). Pick the control by the number of choices, never a dropdown by default: **2 to 4 choices → segmented filter; yes/no → switch; date → date picker button; 5 or more → filter chip (dropdown)**. Filters live in the URL and return the list to its first page. Wraps on narrow screens; Search takes its own line below 640 px |
| Segmented filter | A radio group drawn as a 32 px track (`surface-sunken`, 1 px border) with a 24 px segment per choice, "All" first. The chosen segment is raised (`surface`, `shadow-1`, `primary` text). A caption ("Status") sits to its left. One tab stop, arrow keys move and select. Every choice is visible, so a choice is one click and the current state is readable without opening anything. Not for more than four choices |
| Filter chip | For long lists only (for example licence category, 11 choices). 32 px, `--radius-md`. Unset: dashed `border-strong` outline, plus icon and name ("+ Licence"). Set: solid `primary` outline at 40 % on `primary-subtle`, name, divider, value in `primary`, and a 32 px clear segment with an x (`aria-label="Clear Licence filter"`). Opens a non-modal popover with a caption and a radio list with a check on the choice |
| Textarea | min 3 rows, auto-grow to 10, character count when limited |
| Checkbox / Radio / Switch | 16 px controls; Switch only for immediately-applied settings, never in forms that need Save |
| Tabs | Underline style, 36 px, primary indicator; URL-synced for page-level tabs |
| Breadcrumbs | `caption` size, max 4 levels, last item not a link |
| Card | Surface, 1 px border, `--radius-lg`, `shadow-1`, 20 px padding, `h3` title row with optional actions; no coloured backgrounds |
| Table | Inside a card-style panel (`--radius-lg`); `overline` header in `--color-text-secondary` on `surface-sunken`, sticky header, 1 px row dividers, no zebra striping, hover overlay, selected = `primary-subtle`; numeric columns right-aligned and tabular; IDs in mono; row actions in a visible kebab button; long text truncated with tooltip |
| Pagination | Bottom right: "1–25 of 1,204" (when known) plus prev/next; page-size select (25/50/100) |
| Badge | 20 px height, `--radius-sm`, subtle bg plus strong fg, 12 px medium text; status badges include a 6 px dot or icon (not colour alone) |
| Status indicator | Dot (8 px) plus label for inline status; never a dot alone |
| Alert (inline) | Left 3 px bar in status colour, subtle bg, icon, title plus body, optional action |
| Toast | Bottom-right, max 3, 360 px wide; success auto-dismiss 4 s; error persists; includes an Undo action where possible |
| Dialog | `--radius-xl`; max widths 400 (confirm), 560 (form), 800 (complex); title, body, footer actions right (secondary then primary); Esc and scrim close unless the form is dirty |
| Drawer | Right side, 480 px (detail) / 720 px (wide); used for quick view and edit without losing list context |
| Page header (detail) | An identity tile (48 px, `--radius-lg`, `primary-subtle`, `primary` initials for a person or an icon for a thing) left of the `display` title; under the title the status badge and one fact (branch, make and model). Actions on the right. Nothing in the header is repeated in the cards below |
| Availability panel | The first block of a driver or vehicle page: "can I assign this on this day?". Full width, `shadow-1`, 3 px left bar in the status colour (`success` available, `warning` unavailable, `border-strong` archived), a 40 px round icon, an `h2` verdict ("Available" / "Unavailable"), one caption with the day, the reasons as warning badges (neutral when archived), "Reason given: …" when the record has one, and the "Check another day" date picker on the right. Colour, icon and words together, never colour alone |
| Facts | Labelled values in a grid (`caption` muted label above a `body` value), one or two columns, no dividers between them; an empty value is "—". Phone and email are `tel:` and `mailto:` links |
| Stat | A figure that leads: `caption` label, `display` number in tabular figures, unit in secondary text. For the one or two numbers a page is about (vehicle capacity) |
| Dropdown / Menu | 32 px items, icons 16 px, destructive items last with a separator, keyboard navigable |
| Tooltip | Delay 400 ms, `caption` text, max 280 px; never contains the only copy of critical info |
| Skeleton | Matches the final layout (table rows, cards); subtle shimmer ≤ 1.5 s cycle; disabled under reduced motion |
| Empty state | In-place (not full page): icon (24 px, muted), title (`h3`), one-sentence reason, primary action if permitted |
| Error state | Icon in error colour, title, message mapped from error code, Retry button, `request_id` in caption |
| Loading state | Skeleton for content; inline spinner (16 px) for actions; global top progress bar for route transitions |
| Charts | Series use `--color-chart-1` … `-5` in order (max 5); orange (`chart-3`) marks the one series to notice; gridlines `--color-border`; tooltips with tabular values; accessible data-table toggle |
| Map panel | Bordered panel; legend top-left; controls top-right; marker colours from GPS freshness tokens; route lines in `--color-accent`; selected marker gets a primary ring |
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

**Driver status** (API `status`, D-ADM-31): active → success · suspended → error · an archived driver shows as Archived (neutral). **Driver availability** is the Availability panel (§6): "Available" or "Unavailable" with the API's reasons (on leave, suspended, no licence on file, licence expired, login disabled, archived) as chips. The earlier `on_route`, `on_break` and `off_shift` states return when the API provides them.

**Vehicle status** (API `status`, D-ADM-28): active → success · in_maintenance → warning · out_of_service → error · an archived vehicle shows as Archived (neutral) instead. **Vehicle availability** is words, not a badge: "Available", or "Unavailable: reason, reason" from the API's `availability.reasons` (an unknown reason is shown humanized). The earlier `in_use` and `documents_expired` states return when the API provides them (in_use with dispatch, documents with Phase 2 PR 5); a documents reason then gets the `file-warning` icon.

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
- Motion budget: one orchestrated moment per screen at most (for example the auth route line drawing in once). Hover feedback is colour only; no lift-on-hover cards.

## 12. Consistency enforcement
1. Before creating a component, search `components/ui` and `components/shared`. Extend with a variant before creating a new component.
2. If a new token, size or component is truly needed: explain why existing ones fail → propose it (with a screenshot or snippet) → owner accepts → update this file **first** → implement → record in memory.md §Decisions.
3. Review checklist for UI PRs: tokens only (grep for `#`, `rgb(`, `bg-[`, `p-[`), allowed type styles only, the four states present, keyboard and focus verified, axe clean, both themes checked.
4. External design skills may critique or suggest, but **this file wins** on any conflict. How to use them is in §13.

## 13. Design workflow with Claude skills
The bar is **accurate, polished and distinctive**, never "ordinary admin template". Every UI change goes through this loop, using the Claude Code skills installed for this project. design.md wins any conflict with a skill's advice; if a skill exposes a real gap here, follow §12 to change this file.

| Step | Skill | Use it to |
|---|---|---|
| 1. Load the contract | `fleetflow-admin-ui` (project skill, always first) | Phase gate, reuse search, tokens-only, states, permissions and a11y checklist |
| 2. Shape the screen | `frontend-design` | Plan before code: the screen's one job, its one bold element, layout wireframe; reject anything that reads like a generic template |
| 3. Deepen the craft | `interface-design`, `ui-ux-pro-max` | Hierarchy, density and interaction patterns for dashboards, tables and forms |
| 4. Build | — | Tokens and existing components only (§12), all four states (§8) |
| 5. Critique and polish | `impeccable` (critique, polish, clarify, harden) | Screenshot both themes, fix hierarchy, spacing, copy and edge cases |
| 6. Audit | `accessibility` or `wcag-accessibility-audit`, `web-design-guidelines` | WCAG 2.2 AA and interface guidelines; axe in Playwright must be clean |
| 7. Test | `fleetflow-admin-testing` | Component, permission and E2E coverage |

Quality bar for every screen before it ships:
- It looks intentional in **both themes** at 1280 and 1920 px, and works at 768 px.
- One clear primary action per region; the eye lands on the data first.
- Copy is specific and in the user's words (§11); empty and error states say what to do next.
- Screenshots were reviewed (not just tests run), and the review is noted in the PR.

