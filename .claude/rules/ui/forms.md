---
paths:
  - "packages/ui/src/forms/**"
  - "apps/platform/src/routes/ui/forms/**"
  - "apps/platform/src/examples/forms/**"
  - "apps/platform/src/routes/ui/form-binding/**"
---

# `@proedis/ui`: forms

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

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

- **A single `span` keeps the rule of the section, a map turns it off.** One value collapses below
  32rem of the section (`@max-lg`, a container query), which is what keeps a form right in a drawer
  on a wide window. A map speaks of the window, like every `Responsive` here: the container sizes of
  Tailwind carry the same names for other widths (`@sm` is 384px, `sm` 640px), and two scales under
  one vocabulary would be read wrong. Who passes a map has taken the decision at every width.

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

Two engines under one look, on purpose: `Select` and `MultiSelect` run on Base UI's `Select` up to
`searchThreshold` and on its `Combobox` past it, because a Select cannot hold a search. Never switch
engine while a list is open.

- **The input inside a frame is exactly one line tall, and the frame keeps the press.** An `<input>`
  taller than its line centres the text on its own, and Chrome rounds that centring apart from the way
  the flex row centres the prefix, the suffix and the icons beside it: measured on the 36px frame, the
  value sat 1px under its prefix at 1x and at 2x (Marco caught it on a prefixed TextInput). The input
  therefore stretches to the frame with `frame-line`, a padding of half the room left by one line
  (`--frame-room`, written on the frame by `frame-room-*` from the control height less the border), so
  the browser has nothing to centre and a press anywhere in the frame still places the caret. A search
  row in a panel, which has no frame, uses `h-lh`. Measured after: prefix and value on the same rows at
  1x, 2x and 6x in Chrome, and in WebKit, which was already right; every visible input of the form pages
  with a content box of exactly one line. ⚠️ `h-full` must not come back on these inputs: it is what
  reintroduces the pixel.

