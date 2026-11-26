---
name: ui-component
description: Write a new component of @proedis/ui, or a new part, variant or prop that changes its public surface. Covers the shape every component follows (own props, polymorphic signature, shared props, responsive classes, one element, data-* reporting, displayName and barrel), the things that fail quietly (safelist, tokens, arbitrary values), the type level test, and what a component needs outside its source (subpath, binding, README row, documentation page). Use it before writing the first line, whenever the work adds or reshapes a component under packages/ui/src.
---

# A new component of `@proedis/ui`

Before the first line:

- **Pick the section** with the table under *Structure* in `packages/ui/CLAUDE.md`: the order of the
  sections is the direction of every import, and a component in the wrong one fails `suite/ui-sections`.
- **Read the section's rule**, `.claude/rules/ui/<section>.md` (`layout` covers `primitives` too). It
  holds the choices of that section that look improvable and are not, and a new component usually
  meets one of them.
- **A component with behaviour** (from `actions` on, and `display/person`) also does everything listed
  under "What every component with behaviour does" in `packages/ui/CLAUDE.md`: no user-facing string,
  an icon-only control named by a tooltip, a native `<button>` only where a `Button` cannot be the
  element, a slot on every part, the ref and the spread on a trigger, the root and the control apart,
  a required name in the type, `Responsive<T>` only for layout props.
- **Motion and colour** follow two invariants of the whole package: an animation is functional or
  absent and reduced motion turns it off; dark is a set of token values, so no `dark:` and no raw
  colour in a component.

The "invariants above" this recipe refers to are the ones in `packages/ui/CLAUDE.md`.

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

## Outside the source

A component is not finished when it compiles. Each of these is a place a consumer or a tool reads, and
each one fails in silence when it is missing:

- **The subpath.** A component above the primitives is a folder with its `index.ts`, and its subpath is
  an entry of `proedisMetadata.exports` in `packages/ui/package.json`. Rollup derives its inputs from
  that list, and the published `exports` and `typesVersions` too: a folder missing from it is never
  built.
- **The binding of a control.** A control declares its binding in the same commit
  (`core/binding.ts`, through `bindable`: the kind of its value and how a form value becomes its props,
  the empty value included). `@proedis/form` binds controls through it and imports none of them, so a
  control without a binding cannot sit in a `BoundField`.
- **The README.** A component with behaviour gets the row of its subpath in the table under "The
  components with behaviour" in `packages/ui/README.md`, with what the subpath exports; a static one
  its entry in the API section. Every example written there is run against the build before it is
  written down.
- **The documentation page**, in the UI section of `apps/platform` (`.claude/rules/platform.md` loads
  with its first file): the page in `src/routes/ui/<section>/<name>.tsx`, its examples in
  `src/examples/<section>/<name>/`, its entry in `src/nav.ts` (`ready: false` until the page exists).
  The props come from `virtual:ui-props/<Type>`, the variables from `virtual:ui-theme/<section>/<name>`
  in the Customization section, the slots from a `SlotsInspector` over the example that shows the most
  parts. A responsive example goes in a frame (`resizable`).

## Before proposing the commit

- The checks of the recipe above, then the build of the package: `yarn workspace @proedis/ui build`
  prints `react compiler: N functions compiled, M skipped`, and **M stays 0**. A skip is a defect to
  fix, with the reason the build prints.
- The `verify-change` skill for the rest of what the change touched, the site included.
- The `convention-reviewer` agent over the diff.
