---
paths:
  - "packages/ui/src/actions/**"
  - "apps/platform/src/routes/ui/actions/**"
  - "apps/platform/src/examples/actions/**"
---

# `@proedis/ui`: actions

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

Choices in this section that look improvable and are not:

- **Each `Tabs.Panel` declares its tab** (Marco, 2026-11-25, in place of an `items` array beside the
  panels): `value`, `label`, `leading`, `count`, `disabled`. Tabs reads them from its children while
  rendering (`collectTabs`, `React.Children`, fragments opened), never from a registry filled by effects,
  so the first render and a render on the server already have every tab, and "More" can measure, reorder
  and redraw them as menu items. The cost is the one children always have: a panel inside a component of
  the caller is not seen, so the panels sit straight in Tabs (written one by one or from a `map`).
- **SegmentedControl and Tabs share one look and keep two meanings** (Marco, 2026-11-25). The surfaces of
  the rail are `RAIL_SURFACE` in `actions/rail`, three variants: `contained` (the grey rail, the default of
  SegmentedControl), `elevated` (the white raised rail, the default of Tabs), `plain` (no rail, only the
  sliding fill). The geometry stays each component's. SegmentedControl is a group of `aria-pressed`
  buttons for a choice among views, Tabs a `tablist` that commands panels, and a screen reader is told the
  difference. SegmentedControl also takes `orientation`: a column of rows (`grid-flow-row auto-rows-fr`),
  each item at the height it has in a row, the arrows up and down (`handleRovingKeyDown` takes the
  orientation and does not flip a column under right to left).

- **`Accordion` replaced `CollapsibleSection`** (Marco, 2026-11-25). The section drew a rule above
  itself and one under the last, so inside a box with a border of its own (the Customization of every
  documentation page) two lines met at each edge; and it had one look. The Accordion is Base UI's, with
  four variants (`default`, `contained`, `filled`, `separated`), and **it never draws the border of
  the container it sits in**: `default` draws the rules between its items only (`divided` on its
  Stack), `contained` draws the box itself. A single section is an Accordion with one item.
- **`multiple` is `true` by default**, against Base UI's `false`: the sections of a form or a detail
  are read together, and that is what CollapsibleSection did. A list of questions says
  `multiple={false}`.
- **The body opens on its height** (`accordion-panel` in `theme.css`, on Base UI's
  `--accordion-panel-height` and its starting and ending styles), a functional animation, none under
  reduced motion. The old section did not animate because a body can be dozens of rows long; 150ms
  on a measured height costs nothing at that length.
- **No arrows between the headers.** Base UI 1.7 dropped them (`loopFocus` is deprecated and does
  nothing), the pattern leaves them optional, and every header is a stop of Tab. Do not write them
  back in the docs without writing them in the component.
- **The look of the boxed variants is the theme's**: `rounded-accordion`, `gap-accordion` and four
  `--color-accordion-*` in `@theme inline`, each with its fallback inside the class (`--radius-lg`,
  the `sm` step, `--muted`, `--card`, `--border`), so a product turns them once from `:root`.
  `radius` has a `default` member for the reason `Button.radius` has one.
- **The hover belongs to the header row, not to the button**, and it is a layer over the background
  (a one colour gradient), never the background. The button stops where the actions start, so a hover
  on it ended 8px short of the edge of a boxed item and missed its corner, in every variant: Marco
  caught it on `filled`. The layer is what keeps an opaque header opaque: the sticky headers of a
  CheckboxGrid carry `bg-card` over rows that scroll under them, and a translucent background in its
  place let them show through. `default` bleeds the row by its padding on both sides; a rounded item
  (`filled`, `separated`) clips what it holds, like the root of `contained`, so the row follows the
  inner edge of the corner, a pixel tighter inside the border of `separated`, with no radius of its own.

**A link is an address, and the router arrives once** (Marco, 2026-11-25: `{ href, go }` at every call
site was verbose for what is a string nine times in ten). `LinkTarget` is `string | LinkDestination`;
`linkProps(target, navigate)` and `resolveLink` in `core/link.ts` resolve either. The `navigate` comes from
`LinkProvider` in `@proedis/ui/actions/link`, a context of `@proedis/react`, and it lives in `actions`
because that is the lowest section rendering a link and `core` holds no React: every component that
renders one (Button, Menu, Person, the cells of the table, the notifications) reads it with
`useLinkNavigate()` at its top, outside any condition. Without a provider a string is a plain anchor, a
page load; a `LinkDestination`'s own `go` always wins. Verified on the site: a string navigates with the
document kept, the long form runs its `go`.

- **A floating list has one corner, and its items are concentric with it.** `rounded-list-panel` is
  `var(--list-panel-radius, var(--radius-md))` on the panel of a menu and of every list (Select, Combobox,
  the filters), `rounded-list-item` the same less the 4px of the panel's padding, so the two stay
  concentric whatever the theme declares. `Menu.radius` sets it per menu through `list-panel-radius-*`,
  and a context carries it to the submenus, which render in a portal the panel's variable does not reach.
  The items take the pointer cursor (Marco, 2026-11-25), `not-allowed` when disabled.

- **The finish of a solid button is four numbers at zero, derived from `--tone`.** Each `tone-*`
  utility sets `--tone` to its colour; `button-finish`, on the solid fill only, reads it for the border
  (`color-mix` with black by `--button-border-shade`), the glow (`--button-glow` of the tone in a
  shadow) and, with `--button-highlight` and `--button-gradient`, an inset line and a `::before` gradient
  that do not need it. All zero, the button renders as it did. ⚠️ Two things are load-bearing. The
  border colour comes from `button-finish`, so the solid fill must **not** carry `border-transparent`:
  it is set on `soft` and `plain` only, because a plain utility and a custom one have no order you
  can rely on, and the first version had the border shade silently doing nothing. And the shadows are
  written through `--tw-inset-shadow` and `--tw-shadow` into the same `box-shadow` list Tailwind
  composes, so `focus-visible:ring-*` still draws on top of the glow instead of replacing it.
  A size past `lg` is deliberately absent: a hero CTA is a `className`, not a control height.
  Every button also gives under the pointer, `button-press` (`scale: var(--button-press-scale, 0.98)` on
  `:active` when not disabled, none under reduced motion), which is why its transition is `transition`
  and not `transition-colors`: the scale has to animate too.

