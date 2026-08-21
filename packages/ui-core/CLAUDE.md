# CLAUDE.md — `@proedis/ui-core`

## Why this package exists

Five layout primitives were **the same file twice** across two frontends — `Grid`, `Container`,
`Divider`, `Spacer` and `AspectRatio`, identical apart from the import path of `cn`. `Stack` was the
same API in both, except one of the two had rewritten the responsive helpers *inside the component*
while a `lib/responsive.ts` with the same functions sat two folders away **in the same repository**.
Copy-paste does not only degrade between repositories.

The boundary is the number of design tokens a component needs to know:

- **structure only** — `Stack`, `Grid`, `Cluster`, `Center`, `Container`, `Spacer`, `Sticky`,
  `AspectRatio`. No token, no colour, no opinion.
- **structure plus one or two tokens** — `Divider`, `ScrollArea`, `LabeledContent`. They are here
  because the package presupposes the token contract, which is what lets a divider draw a line.
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
  lib/               # cn + the responsive machinery
  components/        # the eleven primitives — server-renderable, no hooks
  hooks/             # client-only: useBreakpoint, useIsMobile
```

`hooks` is a published subpath and the root barrel does **not** re-export it: everything reachable
from `.` must stay renderable from a React Server Component.

## Invariants

- **Classes, never inline styles, for anything a class can express.** An inline style beats a class,
  so `<Stack gap={4} className={'gap-8'} />` would stop working — and that override, resolved by
  `tailwind-merge` inside `cn`, is what makes these primitives bearable to use. Inline `style` is
  reserved for values Tailwind cannot express as a utility: the `grid-template-columns` of `Grid`,
  the `aspect-ratio`, the `minHeight`/`maxWidth` of `Center`, the sticky edge.
- **The scale is a union type, not `number`.** The classes are declared once in the stylesheet, so a
  value outside the scale builds a class with no CSS behind it — a silent visual defect with no error
  anywhere. `SpacingValue` and `ColumnsValue` must stay in sync with the `@source inline` lists;
  changing one without the other reintroduces exactly that bug.
- **`@theme inline`, never plain `@theme`.** With `inline` the emitted utility references the raw
  variable (`border-color: var(--border)`), so a consumer's later `:root` wins by cascade. Without
  it the utility would reference `var(--color-border)` and every override would silently do nothing.
  Verified in both directions.
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
  a contract, and declaring half of it is the real defect. That is the whole exception; a token
  declared "for later" on any other grounds is a promise the package has no way to keep.
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
