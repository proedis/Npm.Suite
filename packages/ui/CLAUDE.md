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
read, so "appearance" genuinely lived elsewhere. Now `IconBox` reads six colour families and `Surface`
will read two more, and the tokens they need were **already declared and already measured**: the
fifteen tokens the reference implementations read are exactly what `ui.css` and `theme.css` declare
between them, with nothing missing.

So the boundary is now the tier, and the tiers are published subpaths:

- **`core`** — no JSX at all: `cn`, the shared props, the polymorphic props, the responsive machinery.
- **`layout`** — answers *where things are*: `Box`, `Stack`, `Grid`, `Cluster`, `Center`, `Container`,
  `Split`, `Spacer`, `Sticky`, `AspectRatio`, `Bleed`, `SafeArea`. No colour, no opinion.
- **`components`** — answers *what things look like*: `Divider`, `ScrollArea`, `Label`,
  `LabeledContent`, `VisuallyHidden`, `IconBox`, `Spinner`, and the compounds that come next.
- **`hooks`** — client-only, `'use client'`.

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
- A component that needs a **behavioural** runtime dependency. `ScrollArea` is native overflow
  precisely because the Radix version would put a UI framework into this package. The dependency
  budget is `clsx`, `tailwind-merge` and `cva`, and the third arrived by an explicit decision when the
  variant matrices started to need it — anything with a portal, a focus trap or a state machine
  belongs to a package that can afford Radix.
- Inline styles for anything a class can express. See the invariant below.

## Structure

```
src/
  ui.css             # sources, token contract, defaults, custom utilities
  theme.css          # ui.css + the full semantic vocabulary for the layer above
  index.ts           # the root barrel: core + layout + components, never hooks
  core/              # cn, the shared props, the polymorphic props, the responsive machinery
  layout/            # the twelve primitives that answer *where*
  components/        # the ones that answer *what it looks like*
  hooks/             # client-only: useMediaQuery and the three built on it
types.check.tsx      # the type level test, outside src so nothing publishes it
```

**Four published subpaths, and the boundary between them is what each tier is allowed to know.**

| Subpath | Rule | Test for a new file |
| --- | --- | --- |
| `@proedis/ui/core` | **no JSX at all** | is it a type, a helper or a class builder? |
| `@proedis/ui/layout` | answers *where things are* | would it still make sense with no colours? |
| `@proedis/ui/components` | answers *what things look like* | does it read the token contract? |
| `@proedis/ui/hooks` | client-only, `'use client'` | does it touch `window`? |

The line between `layout` and `components` is intent, not a token count: `Stack` is in layout even
though `divided` reads `--border`, because a hairline is an aid to its geometry; `Divider` is a
component because a hairline is all it is. When the answer is genuinely unclear, ask which tier a
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
  component in the `components` tier may read any of them. The four with no reader yet (`popover`,
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
  is a change to that one file rather than to sixteen components, which is the whole point of the
  helper; what is *not* the point is a component with style props. In a Tailwind codebase `className`
  plus the conflict resolution in `cn` already **is** the style-prop system, so a `Box` carrying `p`,
  `m`, `w`, `bg` would duplicate it with a narrower API and an appetite for safelist entries —
  `p` / `px` / `py` made responsive alone is 324 rules, more than this stylesheet declares in total.

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
  `Surface.Title`: the parts are assigned as properties of the root and are **not** exported as flat
  values, so one import gets the whole anatomy. Their **types** are exported flat
  (`StrictSurfaceHeaderProps`, `SurfaceHeaderProps<E>`), because a type cannot be reached through a
  value namespace and a wrapper needs them. Each part carries its own `displayName` in dotted form
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
  there is one source. And a variant that has to **override** another (`shape: 'round'` beating the
  radius that `size` sets) is appended outside the `cva` call, where `tailwind-merge` resolves it on
  an order the file controls — inside one call the winner is the order of the config keys, which is a
  subtlety nobody should need to know to read the file.
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

7. `Thing.displayName = 'Thing';`, then a `export * from './Thing';` in the barrel of its tier
   (`layout/index.ts` or `components/index.ts`), alphabetical, one blank line between entries.

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

No test runner in this repository. What was actually run when the package was written:

- `npx tsc -p tsconfig.json` and `npx eslint packages/ui` — clean.
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
  — which is what the repository's React range asks for whenever a public signature moves. Both exit
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
