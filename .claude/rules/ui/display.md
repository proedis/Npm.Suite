---
paths:
  - "packages/ui/src/display/**"
  - "apps/platform/src/routes/ui/display/**"
  - "apps/platform/src/examples/display/**"
---

# `@proedis/ui`: display

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

Choices in this section that look improvable and are not:

- **An IconBox is one number per size.** `--icon-box-scale` (0.6 to 2.2, `md` 1) sets the side (the
  `size-*` step it equals), the glyph (half the side), the corner (`rounded-icon-box`, the radius step
  times the scale) and the halo (a quarter and a half of the side). Marco asked for the proportions to be
  the same at every size (2026-11-25); the table of hand-picked steps it replaced had the glyph from 58%
  of the box down to 39% and the corner from a third to more than two fifths. Measured: glyph 0.50 and
  corner 0.40 of the side at all six sizes. ⚠️ One utility per size (`icon-box-scale-xs` & co.), not a
  functional `icon-box-scale-*`: Tailwind generates a bare number only on a quarter, so 0.6 produced no
  CSS while 1 did, and the radius silently stayed the `md` one. `radius` is the step a `md` box would
  show, scaled; `none` and `full` are absolutes. The halo is two shadows of the box itself: the two
  spans it used to be sat at `-z-10` and went under the background of the first ancestor that had one,
  which is why it never showed. `soft` has no hairline any more.

- **`BadgeDot` is static and sits in the root barrel**, like `Badge`: no context, no behaviour, so a
  Server Component renders it. The pulse is Tailwind's `ping` on its `before:`, gone under reduced motion
  (the copy is hidden, not frozen mid scale). It is hidden from assistive technology unless `label`
  names it: a colour is never the only carrier of a state. The `Avatar` takes it through `indicator`,
  which renders a box of its own around the circle (`avatar-indicator-anchor`), because the circle is
  `overflow-hidden` and would clip a mark on its corner. `Avatar.radius` follows its inner line too
  (`after:rounded-*`), `default` is `--avatar-radius`, a circle undeclared.
- **`Badge` is static, and the `×` is not coming back.** Both references say a badge communicates
  rather than being clicked; one of them then puts a removable `×` button inside it. That is the `Item`
  trap again: a control inside a label needs the label not to be a control, and needs its own name,
  focus ring and keyboard path. A removable chip is a button with a badge in it.
- **`Item` owns the truncation plumbing, and it is `grow`, not `flex-1`.** `grow min-w-0` on the
  heading plus `shrink-0` on the tail is the whole reason the component exists rather than a `Cluster`
  with three children: it is what makes a long title truncate instead of pushing the actions out of
  the row, both references carry it three times per file, and a caller who forgets it breaks nothing
  until some content length nobody tested.

  ⚠️ `grow` rather than `flex-1` is what lets `direction` be **responsive for free**. `flex-1` sets
  `flex-basis: 0`, whose behaviour in an auto-height column depends on intrinsic sizing; `grow` leaves
  the basis alone and distributes only *positive* free space, of which an auto-height column has none.
  So one pair of classes is correct in a row and inert in a column, and no per-breakpoint plumbing is
  needed — which would have cost 12 safelist entries for a single prop.

  ⚠️ The plumbing lives on the parts, not on the row (Marco, 2026-11-25). `Item.Heading` **is** a
  `Heading` with `grow` (and the `min-w-0` every Heading has); `Item.Icon` is a box around any leading
  visual, `shrink-0`, centred. It used to be a descendant selector on the row,
  `[&>[data-slot=heading]]:grow`, which beat a `grow-0` on the heading (`0,2,0` against `0,1,0`) and
  left the leading visual with no slot. Only `LabeledContent` keeps the descendant rule, having no part.
  `Item.Heading` replaces the `heading` slot with `item-heading`, as `Surface.Header` replaces `item`.
- **`interactive` is an affordance and never a semantic.** Both references derive it from
  `clickable || onClick` and then put `role="button"`, `tabIndex` and a hand-written Enter/Space
  handler on a `div`. That re-implements a button badly and breaks the moment the row holds a control
  of its own, since a `button` inside a `button` is invalid — one of the two files carries a note to
  itself about exactly that. Here `interactive` gives the cursor, the hover and the focus ring, and
  the semantics stay with the caller: `as={'button'}` for a real button row, a router link around it
  for a navigational one, neither for a row whose actions are the interactive part. **Do not add a
  prop that fakes button semantics on a div.**
- **`Item` has no chrome.** Both references give it `tone: flat | boxed`, where `boxed` is
  `bg-card` + a radius + its own padding, which is a card. Composing is one element —
  `<Surface><Item /></Surface>` — against a chrome duplicated in two places that then has to be kept
  in step with the real one. `inset` stayed because row padding is a property of the row.
- **What divides two sections is a group, and the group is a `Stack`.** `Surface.SectionGroup` renders
  a `Stack` with `gap={0}` by default and every prop of it (Marco, 2026-11-25, in place of
  `Surface.Separator`, a part placed between two sections, which he read as a mechanism invented for the
  card): `divided` draws the lines, `direction` sets sections side by side, and a group without
  `divided` looks exactly like the same sections placed straight in the card. A part with a name
  rather than a bare Stack because the Stack's own default gap is `md`, and because the group writes
  `data-divided`, which the padding rule below reads.
  ⚠️ `Surface` has **no** padding of its own. The room lives in the parts (`p-surface`, one variable),
  which is what lets a section go `flush`. A part right under another in the same column does not repeat
  its top padding (a section under the header, a footer of actions under a section), except inside a
  divided group, where the line wants room on both sides: an arbitrary variant on the part,
  `[:not([data-divided])>[data-slot=surface-header]+&]:pt-0`. A group under the header keeps its full
  room on purpose: collapsing its first child would leave a horizontal group with its first section
  higher than the second.
- **The chrome of a card is the theme's, and the docs default is a hairline.** `border` (a boolean;
  undeclared, `border-surface-border`, `--surface-border-color` falling back to `--border`), `elevation`
  (`default` is `--surface-shadow`, none undeclared, then `none` and `xs` to `lg`) and `radius`
  (`default` is `--surface-radius`, `lg` undeclared). The look used to be GeoStore's, `4xl` corners,
  `shadow-sm` and `p-5`, which Marco found foreign to this package: the corner and the room are now
  those of the table's card and of a dialog.
- **`Surface.Header` is an `Item`.** Not a shortcut — the finding the tier was built on: a card header
  and a list row are the same three slots with the same truncation plumbing, and the only difference is
  the register of the title. It renders an `Item`, forwards every one of its props, and replaces only
  the `data-slot`, because a header is not a thing a consumer wants to catch with `[data-slot='item']`.
- **`LabeledContent` is a pair with the emphasis inverted, and nothing else.** A `Heading` is a loud
  title with a quiet line under it; this is a quiet name with a **loud value** under it, because there
  the value is the point. Same two elements, opposite weights, which is why it is not a `Heading` with
  props.
  ⚠️ It used to take an `icon` and render its own framed box for it — `size-9`, a radius, `bg-muted`,
  a glyph size — which is an `IconBox` written by hand before `IconBox` existed. Both are gone: the
  icon and the row belong to `Item`, whose plumbing grows a `[data-slot='labeled-content']` exactly as
  it grows a `[data-slot='heading']`. `inline` stayed, because putting the label and the value on one
  line is an arrangement of the pair itself and not of a row around it.
- **A size shared by the parts of a compound travels as variables.** `Heading` takes one `size` for
  its three texts (Marco, 2026-11-25: they are in proportion, and a size per part let a large title sit
  over a list row's description). The two obvious ways to share it are both wrong, and that is why each
  part used to carry its own: a context is client-only and takes the tier out of a Server Component, and
  a descendant class on the parent (`[&>[data-slot=heading-title]]:text-lg`) has more specificity than
  the child's own utility, so a `className` on the part would lose. The root sets variables instead
  (`heading-size-*` in `theme.css`), each part reads its own through a utility of the same group as the
  one a caller would write (`text-heading-title` is a `text-*` size, `font-heading-title` a weight), and
  `cn` knows those names, so `className={'text-2xl'}` on a part replaces it. Measured in the browser at
  the four sizes, `sm` identical to the sizes the parts had by default.

