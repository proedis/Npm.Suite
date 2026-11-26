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

What every component with behaviour does, on top of the recipe of the `ui-component` skill:

- **No user-facing string**, not even a default `aria-label`: texts come in as props (`label`,
  `labels`, `loadingLabel`, a `title` function for anything with a count).
- **An icon-only control shows its name as a tooltip** (Marco, 2026-11-26). A button holding only a
  glyph is an `IconButton`, whose `label` is both its `aria-label` and the content of its `Tooltip`;
  `Toggle` and `SegmentedControl.Item` do the same when they hold only an icon (`showsTooltip`). A
  glyph with an `aria-label` and no tooltip has a name for a screen reader and none for the pointer:
  the icon is then a shortcut only for who already knows it.
- **A native `<button>` is allowed inside the package where a `Button` cannot be the element**
  (Marco, 2026-11-26), and never in an application: text inside a sentence (the choose action of
  `FileUpload`), a name in a row that opens or previews something (`AttachmentList`, `Person`), the
  trigger a frame of the package draws around itself (`ModalSelectorField` inside `FieldShell`). It is
  always `type={'button'}`, carries its `data-slot` and a visible focus of its own, and it is never a
  way around the look of `Button`: what looks like a button is one.
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

## Where the rest lives

- **Writing a new component** is a procedure, and it is the `ui-component` skill
  (`.claude/skills/ui-component/SKILL.md`): the seven steps, the four things that fail quietly, the
  verification, and what a component needs outside its source (subpath, binding, README, the page).
- **The choices of one section** that look improvable and are not live in `.claude/rules/ui/`, one file
  per section (`layout` with `primitives`, `display`, `actions`, `feedback`, `forms`, `overlays`,
  `data`), loaded when a file of that section or of its documentation is touched. Read the section's
  file before changing a component in it, even when the change looks local.
- **What was run, and when**, is `VERIFICATION.md`: a log with its counts, not a description of the
  package as it stands. Re-run the whole list before touching anything the invariants call
  load-bearing.

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
- **An animation is functional or absent, and reduced motion turns it off** (Marco, 2026-11-26).
  Functional is what shows a change the eye has to follow: an overlay, a menu or a list opening and
  closing, a veil, the press of a button, a panel growing to its height, a value moving, a spinner.
  Decorative motion (content entering, movement for its own sake) does not ship here. Every transition
  and animation carries its off switch on the same element (`motion-reduce:transition-none`,
  `motion-reduce:animate-none`) or in the `prefers-reduced-motion` block of its utility in
  `theme.css`. Where the motion is the information, the reduced form keeps a still state that says
  the same thing, as `Spinner` and `LoadingBar` do.
- **Dark is a set of token values, never a variant in a component** (Marco, 2026-11-26). `.dark` in
  `ui.css` and `theme.css` redeclares the tokens and every component paints through them, so a dark
  theme, a brand wrapper or a section redeclaring one token is followed with nothing to write. A
  `dark:` class or a raw colour in a component (`bg-white`, `text-gray-500`, a hex, an `oklch()`)
  fixes an appearance no product can reach: there are none today, and the count stays at zero. The
  `dark` custom variant declared in `ui.css` is for the applications.
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

- **A control's corner is a variable, and a button's falls back to it.** `rounded-control` is
  `var(--control-radius, var(--radius-md))`, `rounded-button` is `var(--button-radius, <the control's>)`,
  both in an `@theme inline` block of `theme.css` so the fallback is resolved where the control is. The
  insides of a rail (the segmented items and indicator) read `rounded-control-inner`, the control's corner
  less the 2px of the rail's padding, so the two stay concentric whatever the theme declares. At the
  defaults every value is the one it replaced: 6px and 4px, measured. `cn` knows the three names
  (`radius` in its twMerge theme), or a `rounded-full` in a `className` would not replace them.

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

- **`useMediaQuery` is the primitive; the breakpoint pair is vocabulary on top of it.** The
  subscription used to be duplicated inside `useBreakpoint`, which is how a generic query stayed
  unreachable. The primitive now lives in `@proedis/react`, with `usePrefersReducedMotion`, whose
  server snapshot of **`true`** is documented there.
