# CLAUDE.md — `@proedis/ui-core`

## Why this package exists

Five layout primitives were **the same file twice** across two frontends — `Grid`, `Container`,
`Divider`, `Spacer` and `AspectRatio`, identical apart from the import path of `cn`. `Stack` was the
same API in both, except one of the two had rewritten the responsive helpers *inside the component*
while a `lib/responsive.ts` with the same functions sat two folders away **in the same repository**.
Copy-paste does not only degrade between repositories.

The boundary is the number of design tokens a component needs to know:

- **structure only** — `Box`, `Stack`, `Grid`, `Cluster`, `Center`, `Container`, `Split`, `Spacer`,
  `Sticky`, `AspectRatio`, `VisuallyHidden`, `Bleed`, `SafeArea`. No token, no colour, no opinion.
- **structure plus one or two tokens** — `Divider`, `ScrollArea`, `Label`, `LabeledContent`. They are
  here because the package presupposes the token contract, which is what lets a divider draw a line.
- **identity** — `Surface`, `Item`, `IconBox`, `EmptyContent`, buttons, everything above. **Not
  here**, and not later either: that is where a product looks like itself.

## What does NOT go in here

- Anything with a brand in it. The defaults in the stylesheet are neutral *by design*, and they are
  not a palette to grow: a consumer replaces them.
- Icons, buttons, cards, form controls. Form controls are the next candidate and depend on this
  layer, but they are a different package.
- A component that needs a runtime dependency. `ScrollArea` is native overflow precisely because the
  Radix version would put a UI dependency into a package that has none.
- Inline styles for anything a class can express. See the invariant below.

## Structure

```
src/
  ui-core.css        # sources, token contract, defaults, custom utilities
  theme.css          # ui-core.css + the full semantic vocabulary for the layer above
  lib/               # cn, the shared props contract, the polymorphic props, the responsive machinery
  components/        # the seventeen primitives — server-renderable, no hooks
  types.check.tsx    # the type level test, outside src so nothing publishes it
  hooks/             # client-only: useMediaQuery and the three built on it
```

`hooks` is a published subpath and the root barrel does **not** re-export it: everything reachable
from `.` must stay renderable from a React Server Component.

Both stylesheets are published entry points, listed in `proedisMetadata.styles`. The **first** entry
is the one reachable from the package name alone, so `@import '@proedis/ui-core'` stays the base
contract and taking the whole vocabulary is an explicit `@import '@proedis/ui-core/theme.css'`.
`theme.css` imports `./ui-core.css` itself, which is what keeps the five shared tokens declared in
exactly one place — the alternative was the same defaults written twice, in a package that exists
because things were written twice.

## Invariants

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
  anywhere. `SpacingValue` and `ColumnsValue` must stay in sync with the `@source inline` lists;
  changing one without the other reintroduces exactly that bug.
- **`@theme inline` to override, plain `@theme` to add.** With `inline` the emitted utility
  references the raw variable (`border-color: var(--border)`), so a consumer's later `:root` wins by
  cascade. Without it the utility would reference `var(--color-border)` and every override would
  silently do nothing. Verified in both directions. The one plain `@theme` block in the stylesheet is
  the opposite job: `--container-8xl: 96rem` **adds** a step to a Tailwind namespace rather than
  overriding a token a component reads, and there `inline` would substitute the value straight into
  `max-w-8xl` and emit no variable at all, leaving nothing to override. Overriding is `inline`,
  extending is not.
- **The package name alone resolves to both halves.** `exports['.']` carries a `style` condition
  next to `import` / `require`, so `@import '@proedis/ui-core'` gets the stylesheet and
  `import { Stack } from '@proedis/ui-core'` gets the module — one name, two resolvers, which is how
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

- **The vocabulary lives in `theme.css`, and the token invariant is per file.** `ui-core.css`
  declares what the primitives here read; `theme.css` declares what the layer above needs, and its
  tokens have no reader in this package **by design**. That is not the invariant loosening, it is the
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
- **The shared props live in `lib/base.ts`, and there is deliberately no `Box`.** Adding one is a
  change to that file rather than to sixteen components, which is the whole point of the helper; what
  is *not* the point is a component with style props. In a Tailwind codebase `className` plus the
  conflict resolution in `cn` already **is** the style-prop system, so a `Box` carrying `p`, `m`, `w`,
  `bg` would duplicate it with a narrower API and an appetite for safelist entries — `p` / `px` / `py`
  made responsive alone is 324 rules, more than this stylesheet declares in total. A generic `Box`
  also cannot own `hideBelow` correctly the moment a consumer changes its display through
  `className`, which is the second reason these props belong to components that own their display.

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
- **A responsive prop costs breakpoints × values in the safelist.** The declared scale is now 327
  rules, up from 216: responsive `align` and `justify` alone are 66. Every new responsive prop pays
  that multiplication, and the payment is not optional — a class built from a prop at runtime is
  invisible to the scanner, so a missing safelist entry is a silently absent style. Before adding
  one, check whether the consumer could write it literally in `className` instead, where `@source "."`
  finds it for free.
- **`useMediaQuery` is the primitive; the other three are vocabulary on top of it.** The subscription
  used to be duplicated inside `useBreakpoint`, which is how a generic query stayed unreachable.
  ⚠️ `usePrefersReducedMotion` passes a server snapshot of **`true`**, alone among these hooks: the
  two possible mistakes are not equivalent, and guessing "animate" plays the animation the preference
  exists to prevent to the person who asked for it not to.

## Writing a new component

The shape is the same in all seventeen, and every step of it is load-bearing. In order:

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

4. **Build the classes from `lib/responsive`, never by hand.** `gapClasses`, `alignClasses`,
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

6. `Thing.displayName = 'Thing';`, then a `export * from './Thing';` in `components/index.ts`,
   alphabetical, one blank line between entries.

Then the four things that are easy to forget and fail quietly:

- **A class built from a prop at runtime needs a safelist entry**, in `@source inline(...)`, and its
  values need to be a **union type**. Both, always: the type without the safelist ships a class with
  no CSS, the safelist without the type lets a caller ask for one.
- **A class written literally needs nothing** — `@source "."` finds it. Prefer that: it is free, while
  a responsive prop pays breakpoints × values.
- **A token the stylesheet does not declare is a boundary question, not a `:root` line.** If the
  component needs a colour that is not in `ui-core.css`, either it belongs in `theme.css` and the
  component belongs in another package, or the answer is no. See the token invariants above.
- **No arbitrary value.** The `proedis/tailwind` ESLint rule reports it, so this one cannot be
  forgotten, only argued with — and the argument has to be that no token, no scale step and no new
  declared token can express the value.

Verifying it means, in this order: `npx tsc -p tsconfig.json`, `npx eslint packages/ui-core`,
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

No test runner in this repository. What was actually run when the package was written:

- `npx tsc -p tsconfig.json` and `npx eslint packages/ui-core` — clean.
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
  `justify-normal`, `2xl:split-cols-start` all absent. 328 rules in total.
- **72 candidates extracted from the strings the components write**, every one producing CSS except
  the eight that are `data-slot` values rather than classes. That is the check that catches a token
  used in a component and missing from the contract.
- **The whole vocabulary emitting** — 24 utilities across `theme.css` — with `.bg-primary` referencing
  the raw `var(--primary)`, a consumer's `:root` landing **last** of the three declarations, and the
  referenced Tailwind palette variables surviving upstream pruning.
- **24 render cases** through `renderToStaticMarkup` against the **built** CJS: the responsive stack
  with align and justify following its direction, `Split` putting the rail after the content under
  `side={'end'}` and writing `--split-rail: 320px` from a number, `Show`'s three bands, `Bleed`'s two
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
  — which is what the repository's React range asks for whenever a public signature moves. Both exit
  0, negative assertion included, so the generic surface resolves identically through the `.d.ts` on
  both type majors.
- **43 cases for the shared props**: `hideBelow` and `hideFrom` on each of the sixteen primitives that
  take them, including all three render branches of `Divider` and both of `LabeledContent`; the
  component's own display surviving above the breakpoint in flex and in grid mode; `Show` staying
  `contents`; a `className` of `not-lg:contents` still overriding the prop; and `VisuallyHidden`
  carrying no shared props at all.

⚠️ One trap in writing any of this, which cost a wrong conclusion before it was caught: **Tailwind
escapes its selectors**, so the CSS holds `.sm\:gap-4`, `.gap-0\.5` and `.\32 xl\:items-end` — a
colon, a dot, and a hex escape with a trailing space for a leading digit. Searching the raw output for
`.sm:gap-4` finds nothing and reports every prefixed and every fractional utility as missing. Undo the
three escapes before matching, or the harness lies in the direction of a false alarm.

Then the three things a fixture could not show, run against the **built** package installed into a
throwaway app, with the production tooling — `@tailwindcss/node`'s resolver and the `@tailwindcss/oxide`
scanner, which is what the Vite and PostCSS plugins use:

1. **The bare specifier resolves — the package name alone.** `@import '@proedis/ui-core'` is resolved
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
