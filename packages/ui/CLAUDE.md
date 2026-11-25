# CLAUDE.md — `@proedis/ui`

## Why this package exists

Five layout primitives were **the same file twice** across two frontends — `Grid`, `Container`,
`Divider`, `Spacer` and `AspectRatio`, identical apart from the import path of `cn`. `Stack` was the
same API in both, except one of the two had rewritten the responsive helpers *inside the component*
while a `lib/responsive.ts` with the same functions sat two folders away **in the same repository**.
Copy-paste does not only degrade between repositories.

The boundary used to be "how many design tokens does a component need to know", and it put anything
with an appearance outside the package. That line moved on purpose, once — and the reason is worth
keeping, because it is the kind of decision that gets reversed by accident later.

It moved when the package became **the layer a new Proedis frontend starts from** rather than the
layer under someone else's design system. Before, `theme.css` named colours that no component here
read, so "appearance" genuinely lived elsewhere. Now `IconBox` reads six colour families and
`Surface` reads `card` / `card-foreground`, and the tokens they need were **already declared and
already measured**: the fifteen tokens the reference implementations read are exactly what `ui.css`
and `theme.css` declare between them, with nothing missing.

So the boundary is now the section, and the sections are folders of `src`, each one a published
subpath or a family of them, ordered by what they may depend on (see *Structure*):

- **`core`**: no JSX at all. `cn`, the shared props, the polymorphic props, the responsive machinery,
  the tones.
- **`layout`**: answers *where things are*. `Box`, `Stack`, `Grid`, `Cluster`, `Center`, `Container`,
  `Split`, `Spacer`, `Sticky`, `AspectRatio`, `Bleed`, `SafeArea`. No colour, no opinion.
- **`primitives`**: the small pieces with a look of their own that the components above share:
  `BusyVeil`, `Divider`, `Label`, `LoadingBar`, `ScrollArea`, `Skeleton`, `Spinner`, `VisuallyHidden`.
- **`display`**: answers *what things look like*. `Badge`, `BadgeCounter`, `Heading`, `IconBox`,
  `Item`, `LabeledContent`, `Surface`, and `Person` on Base UI.
- **`actions`**, **`feedback`**, **`forms`**, **`overlays`**, **`data`**: the components with behaviour,
  on Base UI, one subpath each.
- **`hooks`**: client-only, `'use client'`.

⚠️ What is still outside, and this is the line that has **not** moved: anything that carries a
**brand**. A palette, a font choice, a shadow language, a component whose variants only make sense
inside one product. `IconBox` is in because a framed icon is a shape every application needs and its
tones are the token vocabulary; a `PinCard` is out because it is a product.

## What does NOT go in here

- Anything with a brand in it. The defaults in the stylesheet are neutral *by design*, and they are
  not a palette to grow: a consumer replaces them.
- Icons themselves. `IconBox` frames one and knows how big the glyph should be; it never imports
  one, which is what keeps an icon library out of the dependency tree. `Spinner` exists for the same
  reason: both reference implementations reach for `lucide-react`'s `Loader2` for a rotating ring.
- A **behavioural** runtime dependency in the sections the root barrel exports. `ScrollArea` is native
  overflow precisely because the Radix version would put a UI framework into this package. The
  dependency budget of the root (core, layout, primitives, the static display components) is `clsx`,
  `tailwind-merge` and `cva`, and `release:verify` fails when the root entry reaches an optional peer.
  Anything with a portal, a focus trap or a state machine goes in `display/person` or in the sections
  from `actions` on, on Base UI as an **optional** peer, and nowhere else: that line moved by decision
  when the interactive components of the Proedis design systems came here, with their logic shared and
  their look left to each product's skin.
- Inline styles for anything a class can express. See the invariant below.
- **A hook or a helper that knows nothing of this package.** It goes to `@proedis/react`, which this
  package depends on: `useMediaQuery`, `usePrefersReducedMotion`, `useDelayedBusy`,
  `useOverflowItems` and `inertValue` moved there, and the tier uses its `useForkRef`, `useSyncedRef`
  and `useEnhancedEffect` instead of writing its own. The test is whether the code would mean the same
  in a product that does not use this package. `useBreakpoint` and `useIsMobile` stay, because they
  speak the vocabulary of the Tailwind breakpoints this package declares. ⚠️ Only `hooks/`,
  `display/person` and the sections from `actions` on import `@proedis/react`: the root barrel keeps
  the budget above, which is why `inertValue` left `core`.

## Structure

```
src/
  ui.css             # sources, token contract, defaults, custom utilities
  theme.css          # ui.css + the full semantic vocabulary for the layer above
  index.ts           # the root barrel: core + layout + primitives + the static display components
  core/              # cn, the shared props, the polymorphic props, the responsive machinery and the
                     # spacing scale, the control sizes, the tones
  layout/            # the twelve primitives that answer *where*
  primitives/        # the small pieces with a look, shared by everything above
  internal/          # private: glyphs, presence, focus, the control heights. Never a subpath
  display/           # one folder per subpath: what things look like
  actions/           # one folder per subpath: buttons, menus, tabs, toggles, tooltips
  feedback/          # one folder per subpath: alert, empty state, notifications
  forms/             # one folder per subpath: form, field and every control
  overlays/          # one folder per subpath: dialog, drawer, alert dialog, popover
  data/              # one folder per subpath: table, filters, selector, detail
  hooks/             # client-only: useBreakpoint and useIsMobile, on @proedis/react's useMediaQuery
types.check.tsx      # the type level test, outside src so nothing publishes it
```

**The order of the sections is the direction of every import**: `core`, `layout`, `primitives`,
`internal`, `actions`, `display`, `feedback`, `forms`, `overlays`, `data`. A section imports only from
the ones before it, and `hooks` only from `core`. `display` sits after `actions` because `Person`
renders a `Tooltip`; the static display components import nothing from actions.

| Subpath | Rule | Test for a new file |
| --- | --- | --- |
| `@proedis/ui/core` | **no JSX at all** | is it a type, a helper or a class builder? |
| `@proedis/ui/layout` | answers *where things are* | would it still make sense with no colours? |
| `@proedis/ui/primitives` | a piece with a look, no behaviour, shared by the sections above | do two components above need it? |
| `@proedis/ui/display/<name>` | answers *what things look like*, static but for `person` | does it read the token contract and do nothing? |
| `@proedis/ui/<section>/<name>` | behaviour on Base UI, `'use client'`, **one subpath per component** | does it need a portal, a focus trap or a state machine? Which of actions, feedback, forms, overlays, data does it belong to? |
| `@proedis/ui/hooks` | client-only, `'use client'` | does it touch `window`? |

The subpaths above `primitives` have no barrel per section: each one brings only its own optional peers
(`@base-ui/react`, dayjs for the date picker, the filters and the selector, `@tanstack/react-table` for
the table), and a barrel would make every consumer install all of them. A component made of others
imports them by relative path (`../../actions/button/IconButton`): with `preserveModules` a shared module
is emitted once and both subpaths reuse it. A context two subpaths share lives in the one lower down
(`forms/field/fieldContext.ts` is provided by `form`), so the dependency goes one way.

**Four rules of the root `eslint.config.mjs` hold the structure**, and they are why it does not erode:

- `suite/ui-sections`: `import/no-restricted-paths` with one zone per section, so an import against
  the order fails; and one `import/order` for the whole package, with a group per section, so a
  cross-section dependency is visible at the top of a file. The resolver is told about `.ts` and
  `.tsx`, or the zones resolve nothing and pass in silence.
- `suite/ui-layout`: in every section but `layout`, and in `hooks`, a class string holding `flex`,
  `inline-flex`, `grid`, `inline-grid` or a `gap-*` is an error. **Every container of every component
  is a layout primitive**: `Stack`, `Cluster` or `Grid`, with their props. A Base UI part takes one
  through `render={<Stack as={…} … />}`. Every internal container carries a `data-slot` of its own,
  so no `stack`, `cluster` or `grid` slot reaches the DOM of a component, and a primitive named that
  way writes no layout attribute (`layout/layoutAttributes.ts`): its `data-mode` or `data-inline`
  would read like the component's contract. The exceptions are rare and each one says why on an
  `eslint-disable-next-line`: today twelve, all a layout the primitives cannot express (named grid
  tracks and subgrids, tracks counted from the data, `gap-x` apart from `gap-y`, a display switched by
  a container query).
- `suite/ui-control-height` (in the same block, with an exemption for its one source): an
  `h-control-*` written anywhere but `internal/control.ts` is an error. **Two controls of the same size
  have the same height**: every control composes its size from `CONTROL_HEIGHT`, so a new one cannot be
  a step off the others. `min-h-control-*` is not matched, a label lined up with a field reads the
  height without being a control. One exception, on its line: the `field` shape of `Skeleton`, in
  `primitives`, which comes before `internal` and reads the same variable.
- The outline selectors (`OUTLINE_SELECTORS`, in every block above and in `suite/ui-outline` for
  `layout`): an outline width with a variant and no style on the same variant, in the same string, is
  an error. See the invariant on the outline of the focus. Proved on the code it was written for: the
  20 files as they were before the fix give exactly their 31 widths, and nothing else.

The private modules, shared by relative import and never exported by a barrel:

- `internal/glyphs` (the marks more than one component draws: the four of a tone, the error mark,
  the tick and the dash, the eye, the lens, the x), `internal/presence` (`isPresent`: whether a slot
  renders anything, where the empty string counts as nothing, so no part is drawn around it),
  `internal/focus` (`FOCUSABLE`, the elements that take the focus with Tab, every entry excluding
  `:disabled`, and `canTakeFocus`, which refuses an element under an `inert` ancestor).
- `actions/list-panel` (the look of the list under Select, MultiSelect, Combobox and the filters of
  FiltersBar, the chips and their "+N", the tooltip listing hidden values), `actions/roving` (the
  arrows of a group of buttons, written by hand because Base UI's ToggleGroup skips an `aria-disabled`
  item), `actions/anchor` (closing a floating layer when its control leaves the view),
  `actions/menu/menuPanel` and `actions/menu/SharedMenu` (the panel of Menu, and one menu for many
  triggers, used by the rows of Table).
- `forms/text-control` (the frame and the states of every bordered text control), `forms/choice` (the
  row, the marks and the description of Checkbox, Radio and Switch), `forms/list-field` (what the fields
  that open a list share beyond its look: the messages and the `status` text of a list fed by a server,
  the "Retry" item, the press on the frame), `forms/calendar` (the month grid and the date text rules,
  used by DatePicker and by the date filter of FiltersBar).
- `overlays/overlay-shell` (container, veil, header, body with scroll shades, footer, error box,
  waiting veil, jolt, nesting level, and `useFocusOffVeil`, which hands the focus on when a wait ends
  with the overlay open), `overlays/dialog/dialogParts` (the discard prompt that `dirty` opens and the
  Cancel that goes through the overlay's gate, shared by Dialog and Drawer; apart from `overlay-shell`
  because it renders an AlertDialog, which imports the shell).
- `data/table/tableCells` and `data/table/tableParts` (the renderers of the column kinds, the classes
  of rows, cells and header, the column widths, the placeholder rows of a first load, the scroll shades
  and the one tooltip of the truncated cells, shared by Table and ModalSelector).

A control marks the element that takes its field's focus with `data-field-control`: the frame lights
from it, the error summary focuses it.

Three choices of tranche 3 that look improvable and are not:

- **The nesting of dialogs is a context of ours** (`OverlayLevelContext`), not Base UI's `data-nested`:
  a dialog opened from inside another must be rendered inside it, and then sits lower over a lighter
  veil. The discard prompt of `dirty` is rendered inside its dialog for that reason.
- **The jobs panel of the notifications is a list of ours**, not a second Base UI toast viewport: its
  rows would be dialogs that Esc closes, swipe, and stop at three. The confirmation is Base UI's toast.
- **Tabs take their tabs as data** (`items`), not as children: "More" measures them, reorders them and
  draws them again as menu items, which children wrapped in fragments would not allow.

Choices of tranche 4 that look improvable and are not:

- **Every slice of the table's state is controlled or internal, and one `onStateChange(state, change)`
  reports them.** A page keeps in its address only what it wants, and the change says which slice
  moved. What follows from the props (a page past the last one after a filter, the first page after a
  new `filterKey`, an "all" selection left empty) is adjusted during render; the effects only notify,
  because `react-hooks/set-state-in-effect` is right about the cascade.
- **The selection lives outside TanStack Table.** The engine can only choose rows it has loaded; "every
  row of the filter but a few" (`{ all, excludedIds }`) is the case a server list needs.
- **The roving tab index of the grid is written on the DOM after each render**, not through props: the
  controls inside the cells (links, checkboxes, the ⋯, a custom cell) are not ours to render.
- **The lists of FiltersBar are one list of ours** (`FilterList`, `aria-activedescendant` from the
  search or the list), not Base UI's Select or Combobox: the same list is the second step of "More
  filters", inside a Popover, where an engine with its own trigger and popup does not fit. Base UI's
  submenu would open beside the panel instead of replacing it.
- **FiltersBar measures a hidden copy of its row** (`inert`, `aria-hidden`), and keeps the count it
  shows while a list is open: a button never moves under the pointer. When the list that closed takes
  its button into "More filters", the focus follows it there.
- **ModalSelector is a `listbox` drawn as a `<table>`**, with the search as its `combobox`: the focus
  never leaves the search. It takes the Table's pieces, not the Table: no sorting, pages, columns or
  row actions in a selector, where one narrows instead of browsing.
- **A Dialog gives the first focus to a field of its toolbar before one of its body**: a search on top
  is the field a selector opens on.

Choices of the detail and the sections that open (M3-01 of Cantieri Digitali Next) that look
improvable and are not:

- **`Detail.Grid` is a grid of its own, not `Form.Section`.** It is a `<dl>`, and the spans are scoped to
  nothing: a `Detail.Item` is always in one. Same six columns, same `@max-lg` rule, same three tracks
  per row (the third empty), so a detail and its form line up; `DETAIL_SPAN` extends `FIELD_SPAN`
  rather than repeating it.
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
- **`CheckboxGrid` is sections, each with a grid of its own, not one treegrid.** The headers are an
  `Accordion` (`inset`, controlled from `openGroups` or the search), so they are headings and Tab
  stops; the rule under the last group is the grid's own (`*:last:border-b`), not the accordion's; the body of an open group is
  a `grid` with its own moving tab index, on the boxes themselves so the state is what gets announced.
  Base UI has no grid, so that index is written here. A closed group has no parent boxes on purpose
  (design system, proposal R1-1): to act on a group, open it. The box is `CHECKBOX_BOX` from
  `choice/choice.tsx`, the same recipe as `Checkbox` without the alignment on a label and without its
  focus, which the cell carries. The marks of change come from `savedValue`, not from a flag the
  caller keeps. The search is the caller's (`visibleItems`): the labels are nodes,
  and only the caller knows their text. The grid template is an inline style, a free measure: its
  number of columns comes from the data.

**A link is an address, and the router arrives once** (Marco, 2026-11-25: `{ href, go }` at every call
site was verbose for what is a string nine times in ten). `LinkTarget` is `string | LinkDestination`;
`linkProps(target, navigate)` and `resolveLink` in `core/link.ts` resolve either. The `navigate` comes from
`LinkProvider` in `@proedis/ui/actions/link`, a context of `@proedis/react`, and it lives in `actions`
because that is the lowest section rendering a link and `core` holds no React: every component that
renders one (Button, Menu, Person, the cells of the table, the notifications) reads it with
`useLinkNavigate()` at its top, outside any condition. Without a provider a string is a plain anchor, a
page load; a `LinkDestination`'s own `go` always wins. Verified on the site: a string navigates with the
document kept, the long form runs its `go`.

**`ProgressBar` and `Meter` are one implementation on two primitives** (Marco, 2026-11-25: a real
component, not a bar with `min`, `max` and `value`). What a screen reader hears is the only difference,
`progressbar` or `meter`, so the choice is in the name, and a Meter is never indeterminate by its type.
Three choices that look improvable and are not:

- **The numbers are formatted here, with Base UI's rule** (with `format` the value, without it the
  percentage of the range), because the bounds, the bubble and the copy on the fill need the same string
  Base UI writes for `aria-valuetext`. The written value is `aria-hidden`: the root already says it.
  Base UI's own text for an indeterminate bar is English, so it is replaced by `indeterminateLabel`, or
  dropped.
- **Inside, the value is written twice**, centred on the whole track: once in the ink of the track, once in
  the ink of the fill inside the fill, as wide as the track (`10000 / percentage` %, an inline style, a free
  measure). The fill clips the second, so the text changes colour where the fill passes and reads at any
  value. `inside` needs `lg` or `xl`, a union of the props: a smaller track does not compile with it.
- **The bubble of `floating` moves by its own share** (`inset-inline-start: p%` and `translateX(-p%)`), so it
  is centred in the middle and flush with the bar at both ends, with no measurement. After the bar, the
  value column holds an invisible copy of the largest value, so the bar does not move as the number grows.

Two engines under one look, on purpose: `Select` and `MultiSelect` run on Base UI's `Select` up to
`searchThreshold` and on its `Combobox` past it, because a Select cannot hold a search. Never switch
engine while a list is open.

Three things every component with behaviour does, on top of "Writing a new component" below:

- **No user-facing string**, not even a default `aria-label`: texts come in as props (`label`,
  `labels`, `loadingLabel`, a `title` function for anything with a count).
- **Every part has its `data-slot`, every resolved variant and state its `data-*`.** That is the
  surface a product's skin targets with unlayered rules, so a rename is a major.
- **A component that can be a trigger takes its ref, and spreads the rest of its props.** A tooltip or
  a menu anchors to the element its trigger renders, and a trigger also hands down its handlers and
  `aria-*`, which a closed list of props drops. The same spread is what lets a form library reach
  `onBlur`. The package is React 19 only (`>=19.0.0 <20.0.0`), where `ref` is an ordinary prop: a
  component that spreads its props onto its element forwards the ref with them, and new code takes it
  that way. The `forwardRef` already in the components with behaviour dates from when the range started at 18,
  where a function component given to `render` received no ref; it still works on 19 and is not
  rewritten for its own sake.
- **When the root is not the control, the two get different props.** A `Checkbox` is a row (`<label>`)
  around a box that takes the focus; a `TextInput` is a frame around an `<input>`. `className` and the
  shared props go on the root, where the layout is; the native props, the `ref` and every `aria-*` go
  on the control, where the focus is. `TextInput`, `Checkbox`, `Radio` and `Switch` follow it.
- **A name the component cannot do without is in the type, not in a comment.** An icon-only `Toggle`
  or `SegmentedControl.Item` without `aria-label`, a `ToggleGroup` or `SegmentedControl` with neither
  `aria-label` nor `aria-labelledby`, a `SegmentedControl` with neither `value` nor `defaultValue` (it
  is never empty): each is a union that does not compile, asserted in `types.check.tsx`.
- **A layout prop whose right value depends on the width is `Responsive<T>`**, as in the primitives,
  built with `responsiveClasses` and declared with every prefix in the `@source inline(...)` block of
  `theme.css`. Today: `Field` `span` and `breakBefore`, the `orientation` of the two groups (through
  `choiceGroupClasses` in `choice/choice.tsx`, where each orientation sets everything the other one
  does), `Button` `block`. The `data-*` of such a prop reports the value at `base`. A prop of meaning
  (`variant`, `tone`, `mode`, the `width` of `TextInput`) or one Base UI already flips (`side`,
  `align`) is not responsive. And every component that renders a root of its own takes `BaseProps`,
  through `splitBaseProps(props)` and its classes before `className`. ⚠️ The overlays rendered in a
  portal (`Dialog`, `AlertDialog`, `Drawer`, `Popover`, `Menu`, `Tooltip`, the selector's dialog) are
  exempt, decided on 2026-11-20: `hideBelow` on a panel that floats above the page hides nothing a
  layout placed, and a component that hides its own trigger has the trigger to say so. The rest of
  the contract (slots, `data-*`, the ref and the native props of the trigger) applies to them.

Three things taken from the `form-control` of PinTips, shaped to this package (the rest of it was
weighed and left out: shortcut props, a `role="alert"` error, a state icon on the border):

- **A form's state flows to its overlay, and nowhere else upward.** `Form` takes `submitting` and
  `dirty` from the caller (never a state of its own) and reports them to the `FormHost` it sits in:
  `Dialog`, `Drawer` and `Popover` keep the report with `useHostedFormState` and derive their `busy`
  (`'submit'` while sent) and `dirty` from it, a prop of the caller still winning (`busy="load"`). The
  host also carries the overlay's `requestClose`, which is how `Form.Cancel` leaves through the gate
  (`forms` comes before `overlays`, so the form reaches the overlay through a context it owns, never an
  import). `Form.Submit` reads the state from the form around it or, in a footer outside the
  `<form>`, from the host; its `loadingLabel` is required because it may spin at any time. In a page
  `Form.Cancel` is a `type="reset"`, which a form library turns into its own reset.
- **Every control declares its binding** (`core/binding.ts`): `TextInput.binding` & co., through
  `bindable`, the kind of its value (`text`, `number`, `date`, `option`, `options`, `boolean`, `files`)
  and how a form's value becomes its props, the empty value included (`''`, `null`, `[]`), so a bound
  control is controlled from its first render. `bind` is a method, not a property, so a binding of a
  precise value fits where any binding is asked for. This is what lets `@proedis/form` import no
  control, hence none of their optional peers. A new control declares its binding in the same commit.
- **`FieldShell` is the one frame**, the package's and an application's. TextInput, NumberInput,
  Select, MultiSelect, the two Combobox, DatePicker and the field of ModalSelector render it with a slot
  of their own (`data-slot`, which also names `<slot>-leading` and `<slot>-trailing`), and the suite
  rule `suite/ui-field-shell` keeps it so: the classes, sizes, gap and states of `text-control` may be
  imported by `field-shell` and by `textarea` alone. Textarea is the one control that is its own frame,
  because the handle that resizes it belongs to the textarea. The focus stays a matter of CSS
  (`data-field-control`), never a `focused` prop; `invalid` and `disabled` add to the field and never
  take it away. ⚠️ Three things measured while moving the controls onto it. The children sit in the row
  directly, with no content wrapper, so a control keeps the markup it had; the icons of the two slots are
  quiet, the rest keeps its colours. The states are written after the props it is handed, because
  NumberInput renders it through Base UI's `render`, whose own `data-readonly=""` would otherwise replace
  ours. And a control whose context reaches into the slots wraps the frame, not its children:
  `TextInput.Action` sits in `trailing`, and inside the frame it read the default context, an `sm` field
  drawing an `md` action and a disabled one showing it. The frame fills its row; DatePicker and
  NumberInput say `w-auto` / `min-w-auto`.
- **`Field` is props, and the state flows down only.** `label`, `description`, `hint`, `error`,
  `errorSummary`, `status` with `message`, `required`, `optional`, `icon`, `counter`; the control is
  the one child. The parts (`Field.Label` & co.) are gone, and so is the registry they used to tell the
  field it was required or invalid from an effect: four of the five pieces of state travelled upward,
  which is why nobody could read a `<Field>` and say what it was. The registry left keeps only what a
  control must tell its field (`setNativeLabel`) and what the form reaches the field by; the field
  registers its own error with the form summary.
  ⚠️ Three rows, decided by Marco: the label, with its `description` under it and above the control
  (a `Label`, so the description is never inside the name); the control; one line under it, the `hint`
  or, in its place, the message of a status. **The hint and every message have the same height**, and
  that is a requirement, not a nicety: one size and line height (`MESSAGE`, `text-xs leading-snug`), the
  mark in `StatusGlyph`, a box exactly one line tall. Measured on the four of them: the line 16.5px, the
  field 98.25px, the field under it not moving by a pixel. The line is drawn only when it says
  something, so a field with no hint opens a line at its first error; a hint reserves it.
  `status` is `error` (from `error`, which wins), `warning` or `success`: only `error` makes the control
  `aria-invalid` and keeps the double border; the other two colour the frame (`data-status` on
  `FieldShell` and `Textarea`) and the line with the ink of their tone. Tones like `primary` were asked
  for and left out on purpose: a field has a status, not a brand colour.
- **`optional`** takes its word from the caller, and is not shown with `required`.
- **`Field` `orientation`** is ignored in a `Form.Section` (`FormSectionContext`), whose rows of
  three tracks keep the labels aligned. Out of one, the label takes a third of the field
  (`grid-cols-field-horizontal`, a percentage and not a fraction, so a counter in the third column
  does not move the control). Each orientation places every part again (`ORIENTATION_LAYOUT`), so
  a map that comes back to `vertical` leaves nothing of the other layout.

Two choices of the responsive pass that look improvable and are not:

- **A single `span` keeps the rule of the section, a map turns it off.** One value collapses below
  32rem of the section (`@max-lg`, a container query), which is what keeps a form right in a drawer
  on a wide window. A map speaks of the window, like every `Responsive` here: the container sizes of
  Tailwind carry the same names for other widths (`@sm` is 384px, `sm` 640px), and two scales under
  one vocabulary would be read wrong. Who passes a map has taken the decision at every width.
- **`size` takes one value, and touch is a token.** The height of a control is a matter of the
  pointer, not of the width: `(pointer: coarse)` raises `--spacing-control-*` one step in the `theme`
  layer of `theme.css`, so a product's own declaration still wins, on every device.
- **Every control takes the three sizes of `ControlSize`**, `sm`, `md` and `lg`, and that is a rule
  Marco set as non negotiable: a field, a select, a date picker, a segmented control, a toggle, an icon
  button and a button of one size, side by side, have one height. `Toggle`, `SegmentedControl` and
  `DatePicker` gained `lg` for it. Two things are taller on purpose and documented as such: the strip
  of `Tabs` (navigation, its tabs read the same heights inside a padded rail) and a read only
  `MultiSelect` whose chips wrap.

The line between `layout` and `primitives` is intent, not a token count: `Stack` is in layout even
though `divided` reads `--border`, because a hairline is an aid to its geometry; `Divider` is a
primitive because a hairline is all it is. When the answer is genuinely unclear, ask which section a
consumer would look in.

The root barrel re-exports the first three so `@proedis/ui` alone is enough to start, and
deliberately **not** `hooks`: everything reachable from `.` must stay renderable from a React Server
Component. A subpath import is the way to say which tier you are in, not a requirement.

Both stylesheets are published entry points, listed in `proedisMetadata.styles`, and the **first**
entry is the one reachable from the package name alone. That first entry is **`theme.css`**, so
`@import '@proedis/ui'` gives the whole vocabulary and `@import '@proedis/ui/ui.css'` is the explicit
opt-out for a project that only wants the layout tier. `theme.css` imports `./ui.css` itself, so the
five shared tokens are declared in exactly one place.

⚠️ That order was the other way round for one commit, and the reason it changed is worth keeping:
`IconBox` reads `primary`, `secondary`, `success`, `warning`, `destructive` and `info`, which live in
`theme.css`. Under the old default a consumer who imported the package name got a components tier with
**nine classes that had no CSS behind them** — measured, not supposed — and lost every colour in
silence. A default that can be wrong in the invisible direction is the wrong default: now the
narrower stylesheet is the one you have to ask for.

## Invariants

- **Every context comes from a builder of `@proedis/react`, never from `React.createContext`.**
  `optionalContextBuilder(name, default)` where the component works without the provider (a control
  outside a `Field`, a dialog not nested, a `Checkbox` outside a group), and that is twenty of the
  twenty-one: the default is part of the component's contract. `contextBuilder(name)` where a missing
  provider is a mistake, and so far only `Notifications`: `JobsButton` outside its provider used to
  render nothing, a failure nobody would see, and now throws with the provider's name. A new context
  picks one of the two by that question, and the name it passes is what DevTools shows.

- **The React Compiler memoises this package, at build time.** `proedisMetadata.reactCompiler` runs
  it over every component while rollup builds, so the published code carries its own memoisation and
  a consumer configures nothing (`target: '19'`, the cache imported from `react/compiler-runtime`,
  which React itself ships: that import is why the React range starts at 19). Hence the house rule "memoise by default" does **not** apply here:
  `useMemo` / `useCallback` written by hand are noise, kept only where a stable identity is part of a
  contract (a context value read by other subpaths, a callback handed to an effect elsewhere).
  ⚠️ What replaces the discipline is the report: the compiler skips any function it cannot prove
  safe and leaves it unmemoised, so the build prints `react compiler: N functions compiled, M
  skipped` and one warning per skip. **M stays 0.** The rules of React are what keep it there: no
  ref read or written while rendering, no prop or state mutated. Verified when it landed: 193
  functions compiled, 0 skipped, and the jsdom cases of the bug fixes green on the compiled output
  under React 19.2.5 in the workspace and under 18.3.1 from the packed tarball outside it. Re-verified
  with `target: '19'` when the range was narrowed: the packed tarball installed outside the workspace
  against React 19.0.0 and 19.2.5.
- **Classes, never inline styles, for anything a class can express.** An inline style beats a class,
  so `<Stack gap={4} className={'gap-8'} />` would stop working — and that override, resolved by
  `tailwind-merge` inside `cn`, is what makes these primitives bearable to use. Inline `style` is
  reserved for values Tailwind cannot express as a utility: the `grid-template-columns` of `Grid`,
  the `aspect-ratio`, the `minHeight`/`maxWidth` of `Center`, the sticky edge.
- **No arbitrary value in a class. Ever.** `size-[18px]`, `text-[13px]`, `max-w-[96rem]` were all
  here and all wrong: a length invented at the call site has no name, so it is invisible to a theme
  and to every consumer who wants to retune it. An arbitrary value is the *last* resort, reached only
  once it is established that no token, no scale step and no new declared token can express the
  value. The three were replaced by `size-4.5` (a real spacing step, which now follows a rescaled
  `--spacing`), `text-xs` and `max-w-8xl` (a container step this package declares). Arbitrary
  *variants* are a different thing and stay allowed: `[&_svg]:`, `[&>*]:`, `data-[state=open]:` are
  selectors, not invented design values.

  ⚠️ This one is **enforced** rather than remembered, by the `proedis/tailwind` block of
  `eslint-config-proedis`: a `no-restricted-syntax` selector over string literals and template
  elements, matching `-[…]` **not** followed by a colon, which is what separates a value from a
  variant. It is in the React preset only, so a project with no JSX does not carry it. Where an
  arbitrary value is genuinely the last resort, disable it on the line with the reason written next
  to it.
- **The scale is a union type, not `number`.** The classes are declared once in the stylesheet, so a
  value outside the scale builds a class with no CSS behind it — a silent visual defect with no error
  anywhere. `SpacingValue`, `SpacingToken` and `ColumnsValue` must stay in sync with the
  `@source inline` lists; changing one without the other reintroduces exactly that bug.
- **The spacing scale by name is read through the keys of each property, never `--spacing-*`.**
  `xs` to `2xl` are `--space-*` on `:root` (Tailwind's steps 1, 2, 4, 6, 8, 12 as multiples of
  `--spacing`, so `md` is 1rem), and `@theme inline` points `--gap-*`, `--padding-*`, `--margin-*`,
  `--inset-*` and `--height-*` at them. `--spacing-md` would have been one line and breaks Tailwind:
  the width utilities read `--spacing-*` before `--container-*`, so `max-w-md` turns from 28rem into
  1rem, here and in every application. Measured with the compiler, side by side: with the per-property
  keys every utility Tailwind had keeps its value, the names are only added. Those keys are in
  Tailwind's source from 4.1.5 to the installed version but not in its documented namespaces:
  re-check them when bumping Tailwind. `inline` is what makes a subtree that redeclares `--space-md`
  change only what is inside it, since the class carries `var(--space-md)` itself.
- **A default is a variable of the theme, read only when the prop is undeclared.** `Stack` writes
  `gap-stack` (`gap: var(--stack-gap, var(--space-md))`), `<Stack gap={'lg'}>` writes `gap-lg`: the
  same for `Cluster`, `Grid`, `Split`, `Item`, `Heading` (`--*-gap`), and for the chrome of `Surface`
  (`--surface-radius`, `--surface-padding`, `--surface-shadow`, `--surface-border-color`). The fallback sits in the class, not on `:root`, so it is resolved where the
  component is and a region redeclaring the scale moves the defaults inside it. The classes are written
  once, in `layout/defaultGap.ts`, the section where layout classes live; `Item` and `Heading` import
  them from there and pass `gap={0}` to their Stack, the class winning through `cn`. `Heading` writes
  `data-gap` only when the gap is declared.
- **Every variable of the package is overridden in a plain `:root` after the import, never in
  `@theme`.** Measured with Tailwind's compiler and a browser: from `:root` every variable changes; from
  `@theme`, `@theme inline` or `@layer base` the colours, `--space-*`, `--radius-scale` and `--z-*` are
  ignored, because the package's defaults are unlayered and an unlayered rule beats any layer, and a
  control height from `@theme` is lost under a coarse pointer. Breakpoints are the reverse (`@theme`
  only). The documentation states this rule on every component page; keep it true if the defaults ever
  move into a layer.
- **`Stack`, `Grid` and `Split` default their gap to `md`, `Cluster` to `sm`.** A Stack with no gap
  used to be a Stack whose children touch, so every structural Stack inside the package declares
  `gap={0}`: 119 of them, inserted by the TypeScript AST right after the tag name so a later spread or
  prop still wins, and verified on the markup snapshots. `Item` (3) and `Heading` (0.5) keep a number:
  that gap is their own geometry, not a layout choice of the page.
- **`@theme inline` to override, plain `@theme` to add.** With `inline` the emitted utility
  references the raw variable (`border-color: var(--border)`), so a consumer's later `:root` wins by
  cascade. Without it the utility would reference `var(--color-border)` and every override would
  silently do nothing. Verified in both directions. The one plain `@theme` block in the stylesheet is
  the opposite job: `--container-8xl: 96rem` **adds** a step to a Tailwind namespace rather than
  overriding a token a component reads, and there `inline` would substitute the value straight into
  `max-w-8xl` and emit no variable at all, leaving nothing to override. Overriding is `inline`,
  extending is not.
- **The package name alone resolves to both halves.** `exports['.']` carries a `style` condition
  next to `import` / `require`, so `@import '@proedis/ui'` gets the stylesheet and
  `import { Stack } from '@proedis/ui'` gets the module — one name, two resolvers, which is how
  `tailwindcss` ships its own `index.css`. Condition order is load-bearing: `types` first, `style`
  ahead of the runtime entries.
- **`@source "."` resolves against the stylesheet, not the consumer.** That is what makes the single
  `@import` enough: the package registers itself as a scan source wherever it is installed. It works
  in the source layout and in the built one because the stylesheet always ships next to the code it
  describes — keep it that way.
- **Two directives, two problems.** `@source "."` covers the classes written literally in the
  components; `@source inline(...)` covers the ones built from props at runtime, which no scanner can
  find. Neither replaces the other.
- **`divided` resets the other axis, per breakpoint.** A stack whose direction changes at `lg` keeps
  its `base` divider rule in effect, so both rules would be drawn from `lg` on. The reset is not
  belt-and-braces.
- **`min-h-0 min-w-0` on `ScrollArea` is load-bearing.** A flex child refuses to shrink below its
  content, so without it the scroll never engages and the parent grows instead.
- **Every token declared is used, with one stated exception.** Three colour families
  (`background`/`foreground`, `muted`/`muted-foreground`) plus `border`, and every one of them is
  read by a component that ships here **except `--background`**: nothing in this package paints a
  canvas. It stays because `--foreground` is meaningless without naming what it sits on — the pair is
  a contract, and declaring half of it is the real defect.

  The other admitted case is a **configuration**: the eight `--radius-*` steps and `--container-8xl`
  exist because they *are* the knob a consumer turns, not because a component reads them, and a
  scale with holes in it is not a scale. What stays forbidden is the third thing: a token declared
  "for later", which is a promise the package has no way to keep.
- **`--input` is gone, and must not come back as a surface.** It had exactly one reader, the icon box
  of `LabeledContent` (`bg-input/50`), which now reads `bg-muted`. The name was wrong: in the
  convention it comes from, `--input` is the *border* colour of a form control, not a fill, so a
  package with no form controls in it had no business declaring one. A recessed surface is `--muted`.
- **The radius scale is a multiplier, not an anchor.** All eight steps are declared, `xs` included,
  as `calc(<Tailwind's own value> * var(--radius-scale))`. At the default `1` every step equals what
  the Tailwind docs state, so `rounded-md` is `0.375rem` — while one declaration still moves the
  whole corner language. The shadcn/ui shape (`lg` anchored to a `--radius` length, the rest
  `± 2px`) was tried first and removed: it shifts every name one step off the documented value, its
  `md` being Tailwind's `lg`, and it left `xs` undeclared in the middle of a rebased scale. **Do not
  reintroduce it.** The cost accepted in exchange is eight hardcoded copies of Tailwind's numbers:
  re-check them against upstream when bumping Tailwind. This is the one place where the scale is a
  contract for consumers rather than a token a component reads — only `xl` is used here, by
  `LabeledContent`.
- **The defaults reference Tailwind's palette**, not `oklch(...)` literals: the shade names stay
  self-documenting and a themed palette is followed for free. Verified that the referenced
  `--color-*` variables are not pruned.

- **The vocabulary lives in `theme.css`, and the token invariant is per file.** `ui.css`
  declares what the `layout` tier reads; `theme.css` declares the rest of the vocabulary, most of
  which now *does* have a reader here — `IconBox` reads six of its colour families, and every
  component in `primitives`, `display` and the sections above may read any of them. The four with no reader yet (`popover`,
  `accent`, `input`, `ring`) are the original case: named once so a fourth application does not invent
  them. That is not the invariant loosening, it is the
  two files having different jobs: measured across the three Proedis frontends on Tailwind 4, the same
  26 token vocabulary is declared in all three and diverges exactly where each improvised — one has
  `--warning` without `--color-warning`, so `bg-warning` does not exist there and its charts read
  `var(--warning)` by hand. No component could have prevented that. Naming it once can.
  ⚠️ Do **not** add a token to `theme.css` that has no reader in the layer above either, and do not
  add `--chart-*` or `--sidebar-*`: the reasons are written in the file.
- **`hideBelow` / `hideFrom` are `not-lg:hidden` and `lg:hidden`, and nothing else.** One class each,
  no display to restore. Above the breakpoint the `not-*` rule matches nothing, so the element keeps
  whatever display it has — `flex`, `grid`, `contents`, the browser default — and the helper never has
  to be told which.

  The obvious implementation is the pair `hidden lg:flex`, and it is a trap worth remembering because
  it fails **silently**: `flex flex-col gap-4` plus `lg:contents` resolves to
  `flex-col gap-4 hidden lg:contents`, so above `lg` the element is `display: contents` and the
  `flex-col` and `gap-4` it still carries are inert. A stack that loses its gap at one breakpoint,
  with nothing reported anywhere. Measured, not reasoned about. `not-*` removes the argument that
  could be wrong, and costs 5 safelist entries instead of one per display per breakpoint.
- **`Box` is the bottom of the package and emits no display of its own.** It was `Show`, a wrapper
  hardcoded to `display: contents`, and that component turned out to be a special case of a more
  useful one: once every primitive took the shared props, what was left of it was "an element with the
  shared props", which is exactly `Box`. It emits **no class at all** when it has nothing to say — not
  even `class=""` — so it composes with whatever the caller writes.
  ⚠️ `contents` therefore became a **literal class the caller writes**, `<Box className={'contents'}>`,
  which is right by the `BaseProps` criterion: a literal class is found by the scanner for free. It is
  also still the only correct place for `contents` — on a primitive that owns a layout it would leave
  that component's own `gap` and alignment inert, silently, for the reason above.
  Hiding stays CSS either way, so the children remain **mounted**: for a subtree with a cost, use
  `useIsMobile` and render nothing.
- **The shared props live in `core/base.ts`, and `Box` carries no style props.** Adding a shared prop
  is a change to that one file rather than to twenty-two components, which is the whole point of the
  helper; what is *not* the point is a component with style props. In a Tailwind codebase `className`
  plus the conflict resolution in `cn` already **is** the style-prop system, so a `Box` carrying `p`,
  `m`, `w`, `bg` would duplicate it with a narrower API and an appetite for safelist entries —
  `p` / `px` / `py` made responsive alone is 324 entries, against the 341 this stylesheet safelists
  in total for every responsive prop it has.

  Two things earn a place in `BaseProps`, and nothing else does: a prop a consumer **could not write
  as a literal class** (anything built from a value at runtime, invisible to the scanner), or one that
  **needs knowledge the component has and the caller does not** (its own axis, its own padding, its
  own display). Written as a criterion rather than a list, because a list gets extended and a
  criterion does not.
- **`Split` takes its rail as a prop, and the width travels as a custom property.** The prop is what
  lets `side={'end'}` put the rail *after* the content in the DOM, so the reading and tab order match
  the eye; two children in a fixed order could only be reordered visually. The custom property is
  what makes `collapseBelow` possible: a media query cannot live in an inline style, so the responsive
  half has to be a class, and a class cannot carry an arbitrary length. `*:min-w-0` is load-bearing —
  a grid item refuses to shrink below its content, so a wide table in the flexible pane would push
  the frame past the viewport.
- **`Bleed`'s default is a copy of `Container`'s padding, and they move together.** `px-4 sm:px-6
  lg:px-8` against `-mx-4 sm:-mx-6 lg:-mx-8`. CSS cannot derive one from the other, and a bleed that
  undoes the wrong amount is off by a few pixels at one breakpoint only, which is the kind of defect
  that survives review.
- **`as` is a type parameter, not `React.ElementType`.** Every primitive declares
  `StrictXProps` for what it understands and `XProps<E extends React.ElementType = '<tag>'> =
  PolymorphicProps<E, StrictXProps>` for the whole surface. The shape it replaced was wrong in both
  directions at once: `React.ComponentProps<'div'>` next to an `as?: React.ElementType` **rejected**
  `<Stack as={'a'} href={'/x'} />`, because `href` is not a div attribute, and **accepted**
  `<Stack as={'span'} onScroll={…} />`, where it means nothing.
  Three parts of that are load-bearing. The **default type argument** is what keeps `XProps` usable
  with no argument, so a consumer or a wrapper writing `StackProps` is unaffected — drop it and every
  one of them breaks. The **one cast** at the destructure (`props as StackProps<'div'>`) is what keeps
  the body from having to reason about an unresolved `E` it does not care about; it is contained to
  that line and the call site is where the checking happens. And `React.ComponentProps<E>` is
  deliberate rather than `ComponentPropsWithRef` / `ComponentPropsWithoutRef`: those are exactly the
  aliases whose meaning moved between `@types/react` 18 and 19, and this one was already the
  package's, so the refactor changed no surface.
  ⚠️ A new primitive extends `BaseProps` unless the shared props contradict what it is for, which so
  far is only `VisuallyHidden` — it keeps its content in the accessibility tree, so a prop that takes
  it out with `display: none` has no business being there. That is why `PolymorphicProps` constrains
  `Own` to `object` rather than to `BaseProps`: a constraint that forces a wrong API on one component
  is worse than a rule written down.
- **A component with parts is a compound, reached through the dot.** `Surface`, `Surface.Header`,
  `Surface.Section`, `Surface.SectionGroup`, `Surface.Footer`: the parts are assigned as properties of
  the root and are **not** exported as flat values, so one import gets the whole anatomy. Their
  **types** are exported flat (`StrictHeadingTitleProps`, `HeadingTitleProps<E>`), because a type
  cannot be reached through a value namespace and a wrapper needs them. A part that **is** another
  component declares no own-props type of its own: `SurfaceHeaderProps` is an alias of `ItemProps`,
  since the header is an `Item`. Each part carries its own `displayName` in dotted form
  (`'Surface.Header'`) so the React tree reads like the JSX.
  Verified that this survives the polymorphic generics: `<Surface.Header as={'a'} href={…} />` infers
  `E` through the property access, and the negative case still fails. ⚠️ The cost is real and it is
  tree-shaking: a part reachable from the root object cannot be dropped when unused. These parts are
  a few lines each, and the ergonomics were chosen over the bytes on purpose.
- **Variants go through `cva`, per-breakpoint classes do not.** A matrix of props → classes is a
  `cva` call; the responsive builders in `core/responsive.ts` stay hand-written maps, because `cva`
  has no notion of a breakpoint and expressing one would mean enumerating six prefixed variants per
  value. The import idiom is `import { cva, type VariantProps } from 'class-variance-authority'` — the
  inline type specifier, which is what keeps `import/order` and the house rule (type imports last)
  from contradicting each other.
  ⚠️ Two things about `cva` here. Defaults live in `defaultVariants`, never in the destructure, so
  there is one source. And a variant that has to **override** another (a `rounded-*` of a caller
  beating the radius a variant sets) is appended outside the `cva` call, where `tailwind-merge` resolves it on
  an order the file controls — inside one call the winner is the order of the config keys, which is a
  subtlety nobody should need to know to read the file.
- **An outline width carries its style, on the same variant.** In Tailwind 4 `outline-none` sets
  `--tw-outline-style: none`, and `outline-2` writes `outline-style: var(--tw-outline-style)`, so
  `outline-none focus-visible:outline-2` draws nothing: the width arrives, the style stays `none`.
  Every width is therefore paired, `focus-visible:outline-2 focus-visible:outline-solid`, and the same
  for `has-focus-visible:`, `has-[…]:` and `focus:`. It shipped that way from the first component
  until the radius work measured `outline-style: none` on a focused Button: for the whole 2.0 line the
  focus of every control was its 20% halo alone. A variant that switches the outline off on purpose
  (`in-data-[variant=card]:focus-visible:outline-none` on the circle of a card Radio) comes later in
  the CSS at the same specificity, and still wins. ⚠️ Enforced by the outline selectors of the root
  ESLint config, which ask for the pair **in the same string**: the style may sit before or after the
  width, and `outline-none` on the same variant counts. It stays a rule of the suite, not of
  `proedis/tailwind`: in an application without `outline-none` a lone width is correct, since
  `--tw-outline-style` starts at `solid`, and the shared block would report it.
- **Every label of the package is `Label`: a root, and the name inside it.** `Field.Label`, the text of
  a Checkbox, a Radio and a Switch (`regular` emphasis), the name in a `Detail` (a quiet one, rendered as
  the `<dt>`) and the label of `LabeledContent` are all one component, so one slot, `label`, catches all
  of them, and the context comes from the parent (`[data-slot=checkbox] [data-slot=label]`). Two parts
  keep a slot of their own because a parent places them by it: `field-label` (the grid of `Field`) and
  `labeled-content-label`; both are the root of a `Label`, with its `label-text` inside.
  ⚠️ Two elements, and the reason is measured. The root carries `className`, `as` and the shared props;
  the name is `label-text`, a `<label>` when `htmlFor` points it at a control (or `textAs`, which is how
  `Field` puts Base UI's label there), a `<span>` otherwise. The `description` prop renders beside the
  name and never inside it: the old `Label` was a `<label>` with the description as a child, and the
  option rows (a `<label>` around box, text and description) gave a checkbox the name "Weigh at the
  pick-upThe bins of the round are weighed one by one…", read once more through `aria-describedby`. An
  option is now named by its name alone (`aria-labelledby`, from `textId`), while the row stays a
  `<label>`, so a press on the description still presses the box. A `Label.Description` part was tried
  for one commit and removed: one component with a `description` prop is the shape every caller wants,
  and the two elements make it safe anyway.
  ⚠️ `regular` keeps the line of its size, 20px, with no `leading-snug`: the box, the circle and the
  track are centred on that line (`mt-0.5`, 16 on 20), measured at 0px off. The emphasis classes sit on
  the root, so `leading`, a glyph in a box of `h-lh`, reads the size and the line of the name: measured
  centred on the first line, 16px at `default` and `regular`, 14px at `quiet`, with the description
  lined up under the name. The root of a `Field` label is a column, so the orientations move it with
  `justify-*`, never with `items-*` or a `display`: `items-center` on a column centres across, and
  `block` would put the description on the line of the name.
- **A line height goes AFTER the size, never before it.** A Tailwind size carries a line height of
  its own, so `tailwind-merge` treats `text-base` as conflicting with `leading-*` and keeps only the
  later one. `cva('leading-tight …', { variants: { size: { md: 'text-base' } } })` therefore emits
  `text-foreground text-base font-semibold` — the `leading-tight` **gone**, silently, and the text
  rendering at the size's default line height.

  Measured, and it had already shipped: `Label` carried `cn('leading-snug', EMPHASIS[emphasis])` for
  two commits with the `leading-snug` doing nothing. Both are fixed by putting the line height after
  the size, and both now have a render assertion per size — which is the only way this defect is
  visible, since the code reads correctly either way.
- **A chrome variant carries a `default` value of its own.** `elevation` and `radius` on `Surface`
  accept `default` and resolve it to the same classes as the step it equals, so a bare `<Surface />`
  emits `data-elevation="default"` rather than `data-elevation="soft"`.

  The point is what it makes targetable. Reporting the resolved step means "a card nobody had an
  opinion about" and "a card that deliberately asked for `soft`" are the same attribute, so an
  application restyling the first also restyles the second. With `default` as a value,
  `[data-elevation='default']` is exactly the set an application wants to own.

  There is a second reason, and it is the stronger one: **it decouples an application's selector from
  this package's choice.** A rule written against `[data-elevation='soft']` silently stops matching the
  day the default here changes to `flat`; a rule written against `[data-elevation='default']` keeps
  meaning "the ones we did not decide".

  ⚠️ It is deliberately **not** on every variant, and the audit that fixed the list ran over all 22
  components. Three questions, all three have to be yes:

  1. Is the default a **choice among named options** rather than a step of a themeable scale? A scale
     already has a better lever — `--spacing`, `--radius-scale`, the `--text-*` steps — and one
     declaration there beats enumerating components.
  2. Would an application plausibly write a rule for **the unspecified case**?
  3. Would that rule survive this package changing its mind about which option the default is?

  The ones that pass: `Surface.elevation`, `Surface.radius`, `Container.size`, `Label.emphasis`, and
  `Button.radius`, `Accordion.radius`, `IconBox.radius` and `LoadingBar.radius`, whose `default` is not
  a step at all but the theme's corner (`rounded-button`, `rounded-accordion`, `rounded-icon-box`,
  `rounded-loading-bar`).

  What fails, and why it is worth knowing rather than re-deriving: `IconBox`'s `fill` / `tone` / `size` and `Spinner.size` and every `Heading` size are **steps**, so they fail (1) and
  `data-size="md"` is worth more than `data-size="default"` because it says what the thing is;
  `gap` on `Heading` and `Item` is a step of `--spacing`, same reason; `Divider.orientation`,
  `ScrollArea.orientation`, `Sticky.position`, `Split.side`, `SafeArea.sides`, `Item.direction` and
  `Grid.fill` are **what the caller meant**, not a house look, so they fail (2) — nobody restyles "the
  dividers we did not give an orientation". Every boolean is out by construction: `data-inset` is
  present or absent and there is no third state to name.

  And the two keys must share one class constant, or `default` and the step it equals will drift into
  two appearances.
- **Every variant is reported as a `data-*` attribute, and that is the theming surface.** Tailwind
  emits its utilities inside `@layer utilities` — measured, not assumed — so a plain **unlayered** rule
  in a consumer's stylesheet beats them with no specificity contest and no `!important`:

  ```css
  [data-slot='icon-box'][data-size='sm'] { width: 2.25rem; height: 2.25rem; }
  ```

  This is why a component reports its **resolved** variants rather than the raw props: an attribute
  that disappears when the prop is omitted cannot be targeted, and the default case is the one an
  application most wants to retune. The resolved values come from a `DEFAULT_VARIANTS` constant used
  both by `cva`'s `defaultVariants` and by the destructure — one source, two readers.

  ⚠️ What this replaces, and the reason to prefer it: a **per-component variable set**
  (`--icon-box-sm-size`, `--icon-box-sm-radius`, …) is five sizes × three properties for `IconBox`
  alone, hundreds across a tier, and every one of them cuts the component out of the scales it obeys
  today — `size-8` is `calc(var(--spacing) * 8)` and `rounded-xl` follows `--radius-scale`, so a
  project that retunes either is followed for free. A private pixel value follows nothing. Per
  component variables stay right where there is **no scale to lean on**: `--split-rail` is the one in
  the package, because the width of a navigation rail is not a step of anything.
- **A responsive prop costs breakpoints × values in the safelist.** The declared scale is now 341
  entries, up from 216: responsive `align` and `justify` alone are 66. Every new responsive prop pays
  that multiplication, and the payment is not optional — a class built from a prop at runtime is
  invisible to the scanner, so a missing safelist entry is a silently absent style. Before adding
  one, check whether the consumer could write it literally in `className` instead, where `@source "."`
  finds it for free.
- **A floating list has one corner, and its items are concentric with it.** `rounded-list-panel` is
  `var(--list-panel-radius, var(--radius-md))` on the panel of a menu and of every list (Select, Combobox,
  the filters), `rounded-list-item` the same less the 4px of the panel's padding, so the two stay
  concentric whatever the theme declares. `Menu.radius` sets it per menu through `list-panel-radius-*`,
  and a context carries it to the submenus, which render in a portal the panel's variable does not reach.
  The items take the pointer cursor (Marco, 2026-11-25), `not-allowed` when disabled.
- **A control's corner is a variable, and a button's falls back to it.** `rounded-control` is
  `var(--control-radius, var(--radius-md))`, `rounded-button` is `var(--button-radius, <the control's>)`,
  both in an `@theme inline` block of `theme.css` so the fallback is resolved where the control is. The
  insides of a rail (the segmented items and indicator) read `rounded-control-inner`, the control's corner
  less the 2px of the rail's padding, so the two stay concentric whatever the theme declares. At the
  defaults every value is the one it replaced: 6px and 4px, measured. `cn` knows the three names
  (`radius` in its twMerge theme), or a `rounded-full` in a `className` would not replace them.
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
- **`muted` is the neutral tone and writes with the standard ink** on its solid and soft fills (Marco,
  2026-11-25): `bg-muted text-foreground`, where grey on grey read as a disabled control. Its plain row
  keeps the quiet ink. In the neutral defaults it looks like `secondary`, and that is intended:
  `primary` and `secondary` are the application's own colours, `muted` is the package's grey.
- **One table paints every tone, in `core/tone.ts`.** `TONE_CLASSES` and the `TONE_COMPOUNDS` built
  from it are what every `fill × tone` component reads, so a `success` badge and a `success` icon box
  are the same green at the same strength. Two hand-maintained 21-row tables is the shape of the
  problem this package exists to prevent — and it is exactly what the references have: one carries five
  sets of CSS custom properties with `color-mix` expressions, the other four hand-written variants, and
  they agree on none of them.
  The classes stay **literal strings** in a file the scanner reads, so nothing needs a safelist entry: a
  component builds its variants *from* the table rather than interpolating class names at runtime.
  ⚠️ `IconBox` was refactored onto it and its 15 render cases plus the 35 slot cases stayed green
  unchanged, which is what says the extraction was behaviour-neutral rather than hopeful.
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
- **`useMediaQuery` is the primitive; the breakpoint pair is vocabulary on top of it.** The
  subscription used to be duplicated inside `useBreakpoint`, which is how a generic query stayed
  unreachable. The primitive now lives in `@proedis/react`, with `usePrefersReducedMotion`, whose
  server snapshot of **`true`** is documented there.

## Writing a new component

The shape is the same in all of them, and every step of it is load-bearing. In order:

1. **Declare what the component owns, then compose the element onto it.**
   ```ts
   export interface StrictThingProps extends BaseProps { … }

   export type ThingProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictThingProps>;
   ```
   Two names, and the second one carries the default type argument so `ThingProps` keeps working with
   no argument. Do **not** put `as` in the own props: it is `PolymorphicProps`' job now.

   A component that owns its internal structure and has no `as` — `AspectRatio`, `Divider`,
   `LabeledContent` — declares `React.ComponentProps<'div'>` directly and is right to, because then
   the type is not a claim about an element it might not render. `Omit<…, 'children'>` when it owns
   its children too, as `Divider` does. And a component for which the shared props are contradictory
   skips `BaseProps`: so far only `VisuallyHidden`.

2. **Sign it generic, and cast once at the destructure.**
   ```tsx
   export function Thing<E extends React.ElementType = 'div'>(props: ThingProps<E>): React.ReactNode {
     const { as: Component = 'div', className, …, ...others } = props as ThingProps<'div'>;
   ```
   `...others` rather than `rest`, because `rest` is what comes back from the helper on the next line.
   The cast is the whole concession the generic asks for: inside the body `E` is unresolved and the
   body does not care, it reads its own props and forwards the others.

3. **Split the shared props out.**
   ```ts
   const { baseClasses, rest } = splitBaseProps(others);
   ```

4. **Build the classes from `core/responsive`, never by hand.** `gapClasses`, `alignClasses`,
   `justifyClasses`, `directionClasses`, `columnsClasses`, `divideClasses`, or
   `responsiveClasses(value, build)` for a new one. A prop that takes one value per breakpoint is
   `Responsive<T>` and goes through the same machinery, so the cascade order is right without anyone
   thinking about it.

5. **Render one element**, with the three parts in this order:
   ```tsx
   return <Component data-slot={'thing'} className={cn(own, baseClasses, className)} {...rest} />;
   ```
   ⚠️ The order in that `cn` **is** the contract: the component's own classes, the shared ones, then
   `className` last so a consumer's override wins over both. Reversing the last two silently takes
   away the override that makes these primitives bearable to use.

6. **Report every variant as a `data-*` attribute.** This is not optional and it is not decoration:
   it is the only theming surface a consumer has that does not require touching a call site or
   wrapping the component. A component that does not report what it is can only be restyled one
   element at a time.

   ```tsx
   <Component
     data-slot={'thing'}
     data-size={size}                    // a closed set: always, resolved default included
     data-flush={flush || undefined}     // a boolean: present when true, HTML-style
     className={cn(own, baseClasses, className)}
     {...rest}
   />
   ```

   | Kind of prop | Reported | Why |
   | --- | --- | --- |
   | closed set of values | always, **resolved** | an attribute that vanishes with the prop cannot be targeted, and the default is the case most worth retuning |
   | a variant that passes the three questions | with a `default` member | so "no opinion" is targetable apart from an explicit step, and survives this package changing its mind — see the invariant above |
   | boolean | only when `true` | the HTML idiom, and `[data-flush]` reads better than `[data-flush='false']` |
   | `Responsive<T>` | **never** | one attribute cannot hold `{ base: 2, lg: 6 }`; the per-breakpoint classes are the surface |
   | a free measure | **never** | `railWidth`, `maxHeight`, `ratio` are inline lengths — an inline style already beats any rule, so the prop is the surface |

   ⚠️ "Resolved" is the load-bearing word, and it is why the defaults live in a `DEFAULT_VARIANTS`
   constant handed to both `cva`'s `defaultVariants` and the destructure. One source, two readers: a
   component cannot report a variant it does not know it has, and `cva` resolves its defaults where the
   caller cannot see them.

   Every **part** of a compound gets its own slot too (`surface-header`, `label-description`,
   `icon-box-halo`), so the inside of a component is reachable from a consumer's stylesheet as well as
   its root.

7. `Thing.displayName = 'Thing';`, then a `export * from './Thing';` in the barrel of its section
   (`layout/index.ts` or `primitives/index.ts`), alphabetical, one blank line between entries. A
   component above the primitives gets a folder of its own with an `index.ts`, and its subpath joins
   `proedisMetadata.exports`, which the rollup input and the published `exports` map both read.

Then the four things that are easy to forget and fail quietly:

- **A class built from a prop at runtime needs a safelist entry**, in `@source inline(...)`, and its
  values need to be a **union type**. Both, always: the type without the safelist ships a class with
  no CSS, the safelist without the type lets a caller ask for one.
- **A class written literally needs nothing** — `@source "."` finds it. Prefer that: it is free, while
  a responsive prop pays breakpoints × values.
- **A token the stylesheet does not declare is a boundary question, not a `:root` line.** If the
  component needs a colour that is not in `ui.css`, either it belongs in `theme.css` and the
  component belongs in another package, or the answer is no. See the token invariants above.
- **No arbitrary value.** The `proedis/tailwind` ESLint rule reports it, so this one cannot be
  forgotten, only argued with — and the argument has to be that no token, no scale step and no new
  declared token can express the value.

Verifying it means, in this order: `npx tsc -p tsconfig.json`, `npx eslint packages/ui`,
`npx tsc -p tsconfig.types-check.json` for the type level assertions in `types.check.tsx`, the
Tailwind compile check (every class the component writes producing CSS, the safelist with **zero**
candidates), and at least one `renderToStaticMarkup` case per behaviour that is not obvious from the
source. There is no test runner here and there is not going to be one, so the compile check is the
only thing standing between a typo in a class name and a consumer.

`types.check.tsx` deserves a note, because it is the only test in the repository that can check what
it checks: the polymorphic props change **nothing** at runtime, so a render case passes either way.
Every `@ts-expect-error` in it is an assertion in the negative direction — if the line below one ever
starts compiling, `tsc` fails on the unused directive, which is what makes a widened type surface loud
instead of silent. Add a pair of cases there for any new prop whose type is the point: one that must
compile, one that must not. And check that the negative one **does** fail before believing it, by
making it valid for a moment: a type test that cannot fail is worth nothing.

## Verification

No test runner in this repository. What follows is a **log**, not a description of the package as it
stands: each entry records what was run at the moment the work it names landed, counts included. The
numbers in it are therefore smaller than today's by construction, and the live figures belong in the
invariants above, which is where to correct them. As of the Badge commit the stylesheet safelists
**341 entries** and the two tiers hold 23 components.

Re-run the whole list before touching anything the invariants call load-bearing.

What was actually run when the package was written:

- `npx tsc -p tsconfig.json` and `npx eslint packages/ui` — clean.
- **The Tailwind floor, measured** when the peer was settled at `^4.1.5`: the built `theme.css`
  compiled from an entry CSS with 4.0.0, 4.0.17, 4.1.0, 4.1.4, 4.1.5 and 4.3.5, then every candidate
  the scanner finds in the built JavaScript passed to each version's compiler, plus the classes of
  `@source inline`. 4.0.x fails to compile (`@source inline` is 4.1); 4.1.0 and 4.1.4 generate 918 of
  919 classes, the missing one being `h-lh`; 4.1.5 and 4.3.5 generate the same 919. Re-run it before
  using a utility newer than the floor: the build does not notice, a consumer on the floor would.
- **The stylesheet compiled by real Tailwind** (4.3.0, through `compile()` with the package imported
  from an app entry CSS), asserting: `@source "."` registered with the package's own base; the whole
  declared scale emitted from the safelist with **zero** candidates, and everything outside it absent
  (`gap-13`, `gap-11`, `grid-cols-13`, `3xl:gap-4`); the contract emitting raw-variable references;
  the defaults resolving against Tailwind's palette rather than being pruned; `scrollbar-thin`
  emitted; and **all 60 utilities the components write producing CSS** — which is the check that
  would catch a token declared in a component but missing from the contract.
- All eleven primitives **rendered** through `renderToStaticMarkup`, twenty cases: the responsive
  stack emitting `divide-y divide-x-0 lg:divide-x lg:divide-y-0`, the grid mode, `as`, and
  `gap={4} className={'gap-8'}` resolving to `gap-8` alone.

What was run when the vocabulary, the six new primitives and the responsive alignment were added:

- `tsc` and `eslint` clean, `yarn release:build` over all 15 projects, `yarn release:verify` green on
  all 14 artifacts — which is what checks that both stylesheets reach both output directories, since
  `.css` is a declared asset.
- **The safelist, with zero candidates**, so nothing can arrive from a scan: 30 `items-*`, 36
  `justify-*`, 12 `contents`/`hidden`, 12 `split-cols`, 108 `gap-*`, 72 `grid-cols-*`, 18 `-mx-*`,
  all present; `gap-13`, `gap-11`, `grid-cols-13`, `-mx-13`, `3xl:gap-4`, `items-normal`,
  `justify-normal`, `2xl:split-cols-start` all absent. 327 rules in total.
- **72 candidates extracted from the strings the components write**, every one producing CSS except
  the eight that are `data-slot` values rather than classes. That is the check that catches a token
  used in a component and missing from the contract.
- **The whole vocabulary emitting** — 24 utilities across `theme.css` — with `.bg-primary` referencing
  the raw `var(--primary)`, a consumer's `:root` landing **last** of the three declarations, and the
  referenced Tailwind palette variables surviving upstream pruning.
- **24 render cases** through `renderToStaticMarkup` against the **built** CJS: the responsive stack
  with align and justify following its direction, `Split` putting the rail after the content under
  `side={'end'}` and writing `--split-rail: 320px` from a number, `Box`'s visibility bands, `Bleed`'s two
  modes, `Label` in both emphases, and `gap={4} className={'gap-8'}` still resolving to `gap-8` alone.
- `'use client'` present in the new hooks, in both output formats.
- **The type level test**, `npx tsc -p tsconfig.types-check.json`: the element deciding the
  attributes in both directions (`as={'a'} href` compiling, `as={'span'} href` not), the scales still
  rejecting a value outside them, `hideBelow={'base'}` rejected because `base` has no media query,
  `StackProps` with no type argument still usable by a wrapper, a custom component reached through
  `as` demanding its own required props, and `VisuallyHidden` refusing the shared props. Each negative
  case was confirmed to actually fail by making it valid for a moment: `tsc` reports
  `TS2578: Unused '@ts-expect-error' directive`.
- **The emitted declarations compiled against `@types/react` 18.3.31 and 19.2.18**, from a directory
  outside the workspace holding only the packed tarball and its own dependencies, `skipLibCheck: false`
  — which is what the React range asked for while it started at 18. Since the package is React 19
  only, `@types/react` 19 is the one that has to hold. Both exit
  0, negative assertion included, so the generic surface resolves identically through the `.d.ts` on
  both type majors.
- **43 cases for the shared props**: `hideBelow` and `hideFrom` on each of the sixteen primitives that
  take them, including all three render branches of `Divider` and both of `LabeledContent`; the
  component's own display surviving above the breakpoint in flex and in grid mode; `Box` with a
  `contents` class; a `className` of `not-lg:contents` still overriding the prop; and `VisuallyHidden`
  carrying no shared props at all.

What was run when the appearance tier opened (`Tone`, `Spinner`, `IconBox`, the `data-*` surface):

- **The layer measurement that the whole theming story rests on**: Tailwind emits its utilities inside
  `@layer utilities`, so an unlayered rule in a consumer's stylesheet beats them regardless of
  specificity. Compiled the package's stylesheet with an application rule next to it and confirmed the
  utility lands in the layer while the application rule lands outside it.
- **Nine classes with no CSS behind them, found by the gate rather than by a consumer.** `IconBox`
  writes `bg-primary`, `bg-success/10` and seven more, all declared in `theme.css` only, while the
  package name resolved to `ui.css`. Fixed by making the full sheet the default; the check that caught
  it is the one that extracts every string the components write and asserts each produces CSS.
- **An audit of all nineteen components against the `data-*` rule**, and it found what it was meant
  to: only the two new ones reported anything. Seventeen were fixed in one pass, and the result is
  **33 render cases** asserting that every closed-set variant is reported with its resolved default,
  that every boolean appears only when true, and that the four components with nothing to report
  (`Box`, `Spacer`, `Cluster`, `AspectRatio`) carry their slot and nothing else.
- **118 candidates** extracted from the strings the two tiers write, every one producing CSS. The
  extractor was tightened in the same pass: it had been counting import specifiers, `data-slot` values
  and `aria-*` attributes as classes, and the tier split had silently cut its coverage from both
  directories to one — 12 components had stopped being checked without the report changing shape.

⚠️ One trap in writing any of this, which cost a wrong conclusion before it was caught: **Tailwind
escapes its selectors**, so the CSS holds `.sm\:gap-4`, `.gap-0\.5` and `.\32 xl\:items-end` — a
colon, a dot, and a hex escape with a trailing space for a leading digit. Searching the raw output for
`.sm:gap-4` finds nothing and reports every prefixed and every fractional utility as missing. Undo the
three escapes before matching, or the harness lies in the direction of a false alarm.

Then the three things a fixture could not show, run against the **built** package installed into a
throwaway app, with the production tooling — `@tailwindcss/node`'s resolver and the `@tailwindcss/oxide`
scanner, which is what the Vite and PostCSS plugins use:

1. **The bare specifier resolves — the package name alone.** `@import '@proedis/ui'` is resolved
   to the stylesheet through the `style` condition of the generated `exports` map, while the same
   specifier still resolves to `cjs/index.js` under `require` and `esm/index.js` under a native
   `import`. `@source "."` comes back pointing at `build/esm` — the *installed* location, not the
   consumer's. One test covers Vite and Next both: the two plugins share that resolver.
2. **The scanner does walk into the installed package.** All seven classes written inside the
   components — `flex`, `flex-col`, `bg-border`, `max-w-7xl`, `scrollbar-thin`, `divide-border`,
   `text-muted-foreground` — were found among the candidates, out of an explicit `@source` inside
   `node_modules`.
3. **`'use client'` survives the build** — after the fix below. It did not, before.

And the chain end to end, with a consumer override in place: `--border` declared three times in
cascade order (package default → `.dark` → the consumer's, last), `.bg-border` referencing the raw
variable, `gap-4` arriving from the scan and `lg:gap-6` from the safelist despite being written
nowhere, `scrollbar-thin` emitted.

What was run during the 2.0 revision (the sections, the layout through the primitives, the fixes the
documentation site surfaced):

- **The move onto the primitives, section by section.** 232 containers became `Stack`, `Cluster` or
  `Grid`. Before each section moved, its components were rendered into markup snapshots on the built
  package (433 scenes in eleven sets, deterministic over two runs) and compared after, ignoring only
  class and attribute order: zero differences beyond the layout attributes, and no `stack`, `cluster`
  or `grid` slot leaked into a component.
- **A jsdom harness over the built package**, one case per behaviour fixed, run in the workspace and
  against packed tarballs installed outside it under React 19.0.0 and 19.2.5. It lives outside the
  repository, like the snapshots, and `menuscroll` fails its own precondition there (jsdom lays out
  nothing). Each fix of the last round was run against the build of the commit before it too, to see
  the case fail: the focus cases 9 of 14 on the old build, `focusRowId` 2 of 4.
- **The breakpoint variables**, through Tailwind's own `compile()`: with `md` moved to 50rem, all five
  `--breakpoint-*` in the output and `--breakpoint-md: 50rem`, against none before.
- **Every new negative case of `types.check.tsx`** (`dirty` without `discard`, a third `EmptyState`
  action) made valid for a moment to watch `tsc` fail on it.
- **The React Compiler** at 201 functions compiled, 0 skipped; `release:verify` green on 14 artifacts,
  with the root entry reaching no optional peer.
- **The documentation site** (`apps/ui-docs`) as a consumer of the source: 72 pages, 350 live
  examples, every slots table compared with the live DOM of its examples, every claim about types
  proved with a probe in both directions, and a sweep of every page with no console error and no
  horizontal overflow at 375px.

What was run for the spacing scale by name and the control heights:

- **Tailwind's compiler, side by side** with and without the stylesheet, on 4.3.5 and on 4.1.5: the
  per-property keys produce `gap-md`, `p-md`, `-mx-md`, `top-md`, `h-md` on `var(--space-*)`, and every
  utility that existed (`w-md`, `max-w-md`, `basis-md`, `inset-shadow-xs` and the rest) keeps its value.
  `--spacing-md`, tried first, turned `max-w-md` into 1rem. The built `ui.css`, compiled with no class
  scanned, emits every safelisted name and breakpoint.
- **The markup snapshots** (433 scenes) before and after, ignoring only the `gap-0` now written on the
  structural Stacks: zero differences, with the default gap moved to `md` and every height composed
  from `CONTROL_HEIGHT`.
- **The heights measured in the browser**, one row per size with a field, a select, a date picker, a
  segmented control, a toggle, an icon button and a button: 32, 36 and 40px for every one of them,
  `lg` included where it is new. A region redeclaring `--space-md` measured 8px where the page measured
  16px, on the same markup.
- **`types.check.tsx`**: names on every spacing prop, responsive names, `lg` on every control; an
  unknown step, an unknown responsive step and an `xl` control size each made valid for a moment to
  watch `tsc` fail.
- **The lint rule** run on a probe file: `h-control-md` in a string and in a template is reported,
  `min-h-control-md` is not.

What was run for the radius of the controls and the finish of the button:

- **The markup snapshots** (433 scenes) on the build of the commit before and on this one, compared by
  class token and attribute: `rounded-md` became `rounded-button` (662) or `rounded-control` (173),
  `rounded-sm` became `rounded-control-inner` (18), every button gained its `tone-*` (757) and
  `data-radius` (757), every solid one `button-finish` in place of `border-transparent` (198). Nothing
  else moved. The jsdom harness: 45 of 47 green, the same two as the run before (`menuscroll`'s
  precondition, and a hand-written copy in `overflowlist` that predates the `gap-0` of the structural
  Stacks).
- **Tailwind's compiler** on the built `theme.css`: the three radius utilities, `button-finish` and the
  seven `tone-*` emitted, with their fallbacks; `rounded-full` after `rounded-button`.
- **In the browser**: the controls at 6px, the segmented items and indicator at 4px, every `radius`
  step at its scale value; with the finish declared, a 16px corner, the border at 22% black, the inset
  line, the gradient and a glow per tone; with it undeclared, the border the colour of the fill and
  every part transparent; the keyboard focus adding its 7px halo to the list with the glow still in it.
  React Compiler at 202 functions, 0 skipped.
- **`types.check.tsx`**: `radius={'full'}` compiles, `radius={12}` does not, made valid for a moment to
  watch `tsc` fail.

What was run for `Field` as props:

- **The documentation converted by the TypeScript AST** (a codemod over the JSX, the parts read and
  rewritten as attributes with their source text): 193 fields in 93 files, 295 parts, none skipped;
  three conditional parts and the JSDoc blocks by hand. `tsc` and `eslint` clean on the site.
- **In the browser**: the hint, the error, the warning and the success of one field measured at the same
  line height (16.5px), the field at the same height (98.25px) and the next field at the same top in all
  four; the control named by the label alone and described by the description and the line;
  `aria-invalid` with the error only; the border in the colour of each status. A form submitted with
  three errors focusing its summary, a link of the summary focusing its field.

What was run for the one `FieldShell`:

- **The markup snapshots**, compared scene by scene, element by element, attributes and classes as
  sets with React's ids normalised: the controls kept their markup. What moved: the public `FieldShell`
  lost `field-shell-content`; the `leading` / `trailing` of TextInput gained the quiet icon classes;
  DatePicker and NumberInput carry `w-auto` / `min-w-auto`, their computed defaults. The first pass
  showed the two defects named in the invariant (the action of `TextInput`, the states under Base UI),
  both fixed before the commit. The jsdom harness at 45 of 47, the same two.
- **In the browser**: 32, 36 and 40px for every frame of every size, 56 only for a read only
  MultiSelect whose chips wrap; a press on the padding of TextInput, NumberInput, Combobox and DatePicker
  focusing the control (new on the last three, which had no press handler), and on Select and
  MultiSelect still opening the list; the frame lit on the focus of its input.
- **The lint rule** on a probe importing `TEXT_CONTROL_FRAME` outside `field-shell`: reported.

What was run for the one `Label`:

- **The markup snapshots** against the build before it, with React's ids normalised: every change is
  a label. The slots moved one for one, 26 `detail-label`, 14 `checkbox-label`, 8 `radio-label`,
  5 `switch-label` and the `label-text` of `Label` became 55 `label`; the 9 descriptions became
  `label-description`; `field-required` and `field-optional` became `label-required` and
  `label-optional`. Nothing else in the 433 scenes, and the jsdom harness at the same 45 of 47.
- **In the browser**: a checkbox with a description named by its text alone and described by the
  description, a press on the description still toggling it; every label of the Field, Form, Radio,
  Switch, Detail and LabeledContent pages rendered as `label` (or `field-label`) with the sizes of
  before, the Detail name 0.5px taller (it joins the `leading-snug` LabeledContent already had).
- **`types.check.tsx`**: `description` on a `Label` does not compile, made valid for a moment to watch
  `tsc` fail.

What was run when `Label` took its description back as a prop, with a leading glyph:

- **The markup snapshots** against the build of the first pass: `checkbox-text`, `radio-text`,
  `switch-text` gone (the `Label` root is the text block), 69 `label-text`, one more `label-description`
  (the harness case that passes `description` to a `Label`, ignored by the first pass). Nothing else;
  the jsdom harness at 45 of 47, the same two.
- **In the browser**: an option named by its name alone, described by its description, toggled by a
  press on the description, the box 0px off the centre of the 20px line; a vertical `Field` label 19.25px
  tall and 4px over its control as before; a horizontal one 36px tall with its text 0px off the centre of
  the control; the glyph 0px off the centre of the first line.
- **`types.check.tsx`**: a label with `description`, `textId` and `leading` compiles; an emphasis that is
  not a register and an `href` on a root rendered as a span do not, each made valid for a moment.

What was run for the outline of the focus:

- **In the browser, with the keyboard**: a focused Button measured `outline-style: none` before and
  `solid 2px` after; a card Radio puts its 2px outline on the card and none on the circle; a field's
  frame keeps its 1px outline on focus (it had no `outline-none`, and worked before too).
- **The markup snapshots**, against the build of the radius commit: 3,100 `outline-solid` classes
  added across the five variants, nothing removed, no other attribute moved. Tailwind's compiler
  places `in-data-[variant=card]:focus-visible:outline-none` after `focus-visible:outline-solid`.

What was run for the `Accordion`:

- **In the browser**, on its page: the four variants, `contained` with a 1px border and an 8px corner,
  `filled` with the open item on `--muted` and the closed ones transparent, `separated` 8px apart with
  the open item on `--card` with a `--border` border and the closed ones on `--muted` with a
  transparent one; `radius` at 0, 6, 8 and 16px; the variables declared on one root moving that one
  only (16px apart, 16px corner, a primary border). The panel through Base UI's sequence on opening
  (starting style, the measured height, then `auto`) and on closing (the height, ending style, 0,
  unmounted), and the reduced motion rule in the compiled CSS. `multiple={false}` leaving one item
  open; a `disabled` item not opening; the name of a trigger made of title and summary. Under the
  real pointer, the hovered header as wide as its item in every variant (inside the 1px border of
  `separated`, at 16px with `2xl`), the open one squared at the bottom by the clip, and the sticky header
  of a CheckboxGrid keeping its `card` under the hover. 76 pages of the site loaded with no error.
- **CheckboxGrid on it**: two groups open together, the header of an open group sticky at 32px under
  the columns on the card, the trigger padded 24px, the body with no padding, a rule under every group
  the last included; with a search, a group closed and opened again through the search's own state.
- **The Customization of every page**, now a `contained` Accordion: one border, rules inside, none
  doubled.
- React Compiler at 203 functions, 0 skipped; `tsc`, `types.check.tsx`, the whole lint, the build and
  `release:verify` on 15 artifacts green; `actions/accordion` in `exports` and `typesVersions`,
  `actions/collapsible` in neither.

## Two defects the build surfaced

Running it, rather than reasoning about it, found both:

- **The stylesheet was not published.** `proedisMetadata.assets` only tells `release:verify` what to
  require; the copy itself lives in each package's own `build` script — the CLI does exactly that for
  its `.ejs` templates. Fixed by chaining `cpy 'src/**/*.css'` into both output directories.
- **`'use client'` was stripped.** Rollup hoists module-level directives out and does not re-emit
  them, and the shared config already *silenced the warning* about it — so the loss was invisible.
  Fixed with a `preserveModuleDirectives()` output plugin in `rollup.config.mjs`, which reads the
  directive back from the module's source. Additive: a package whose sources carry no directive is
  untouched.

One cosmetic consequence worth knowing: the CJS chunk opens with `'use client';'use strict';`. Both
belong to the directive prologue, so both still take effect.
