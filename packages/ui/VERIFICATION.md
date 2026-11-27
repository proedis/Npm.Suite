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
- **The documentation site** (then `apps/ui-docs`, now the UI section of `apps/platform`) as a consumer of the source: 72 pages, 350 live
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
