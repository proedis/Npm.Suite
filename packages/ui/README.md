<div align="center">

# `@proedis/ui`

**The interface layer a Proedis frontend starts from: layout primitives with responsive props over a
scale the compiler checks, the components that read the token contract, and the machinery behind
both.** 📐

[![npm](https://img.shields.io/npm/v/@proedis/ui.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/ui)
[![license](https://img.shields.io/npm/l/@proedis/ui.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

Seventeen primitives, the machinery behind them, and the stylesheet they read, in four subpaths:

```ts
import { Stack, Divider } from '@proedis/ui';              // everything except the hooks
import { Stack } from '@proedis/ui/layout';                // …or say which tier you are in
import { Divider } from '@proedis/ui/components';
import { cn, type Responsive } from '@proedis/ui/core';
import { useIsMobile } from '@proedis/ui/hooks';           // client-only, its own entry point
```

`core` holds **no JSX**: the class machinery, the shared props and the types. `layout` answers *where
things are*, `components` answers *what they look like*, and `hooks` is the client-only half. 🧱

| | |
| --- | --- |
| **Layout** | `Box` · `Stack` · `Grid` · `Cluster` · `Center` · `Container` · `Split` · `Spacer` · `Sticky` · `AspectRatio` |
| **Visibility** | `hideBelow` / `hideFrom` on every primitive, plus `VisuallyHidden` |
| **Escapes** | `Bleed` · `SafeArea` — out of a padding, and out of the notch |
| **Components** | `Heading` · `IconBox` · `Spinner` · `Divider` · `ScrollArea` · `Label` · `LabeledContent` |
| **Responsive** | `Responsive<T>`, the typed scales, and the class builders behind every prop |
| **Utilities** | `cn` — class composition where the last conflicting utility wins |
| **Types** | `PolymorphicProps` — `as` typed by the element it renders, not by `div` |
| **Hooks** | `useMediaQuery`, `useBreakpoint`, `useIsMobile`, `usePrefersReducedMotion` |
| **Tokens** | a five token contract, or the **full vocabulary** through `theme.css` |

## 📦 Installation

```bash
yarn add @proedis/ui
```

Then import the stylesheet **into your Tailwind entry CSS**:

```css
@import 'tailwindcss';
@import '@proedis/ui';
```

The package name is enough, no path: `@import '@proedis/ui'` and
`import { Stack } from '@proedis/ui'` are the same specifier resolved under different conditions — a
CSS resolver asks for `style`, a bundler asks for `import`.

That single line does three things: it lets Tailwind see the classes this package writes, it registers
the **full token contract**, and it declares neutral defaults for all of it. Nothing else to configure:
no safelist to copy, no `@source` to add.

The full contract is the default because the `components` tier reads it — `IconBox` alone needs
`primary`, `secondary`, `success`, `warning`, `destructive` and `info`. A project that wants **only**
the layout tier and its five tokens asks for the narrower sheet by name:

```css
@import '@proedis/ui/ui.css';   /* background, foreground, muted, muted-foreground, border */
```

One or the other, never both: the full sheet imports the narrow one itself. See
[The token contract](#-the-token-contract) for what each declares.

| Peer | Range |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` |
| `tailwindcss` | `^4.0.0` |

⚠️ The stylesheet uses Tailwind directives. Loaded as a plain `<link>` it does nothing — it has to be
imported where Tailwind compiles.

## 🚀 Quick start

```tsx
import { Cluster, Container, Divider, Stack } from '@proedis/ui';

<Container size={'lg'}>
  <Stack gap={6}>
    <Cluster gap={2}>{filters}</Cluster>

    <Divider />

    <Stack direction={{ base: 'vertical', lg: 'horizontal' }} gap={{ base: 4, lg: 8 }} divided>
      {panels}
    </Stack>
  </Stack>
</Container>
```

Every spacing, direction and column prop takes **one value or one per breakpoint**, mobile first:
`base` carries no prefix and applies until a wider breakpoint overrides it.

## 📖 API

### The responsive scale is a type

```tsx
<Stack gap={4} />        // ok
<Stack gap={13} />       // does not compile
```

That is the whole reason `gap` is not a `number`. The classes these props build are declared once in
the stylesheet, so a value outside the scale would produce a class with **no CSS behind it** — a
component silently losing its gap, with no error anywhere. The scale:

| Prop | Values |
| --- | --- |
| `gap` (`SpacingValue`) | 0 · 0.5 · 1 · 1.5 · 2 · 2.5 · 3 · 3.5 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 12 · 14 · 16 |
| `columns` (`ColumnsValue`) | 1 → 12 |
| breakpoints | `base` · `sm` · `md` · `lg` · `xl` · `2xl` |

### Two props every primitive takes

```tsx
<Stack hideBelow={'lg'}>…</Stack>       // the desktop half of a layout
<Cluster hideFrom={'md'}>…</Cluster>    // the mobile half
<Grid hideBelow={'md'} hideFrom={'xl'}>…</Grid>   // only in between
```

They come from one shared contract, so they are on all of them: `Stack`, `Grid`, `Cluster`, `Center`,
`Container`, `Split`, `Spacer`, `Sticky`, `AspectRatio`, `Divider`, `ScrollArea`, `Label`,
`LabeledContent`, `Bleed`, `SafeArea` and `Box`. Not `VisuallyHidden`, where they would contradict the
component.

`hideBelow` compiles to a single `not-lg:hidden`, which applies `display: none` only inside a negated
media query — so above the breakpoint nothing touches the element and it keeps its own display,
whatever it is. That is why the same two props work identically on a flex stack, a grid and a
`contents` wrapper, and why `<Stack hideBelow={'md'} className={'…'} />` cannot end up with a display
its own classes disagree with.

⚠️ Hiding is CSS. The children stay **mounted**: their effects run, their requests fire, their markup
ships. Use `useIsMobile` and render nothing when a subtree has a cost.

`Box` is the same two props on any element and nothing else. What it is **not** is a style-prop
carrier: no `p`, `m`, `w`, `bg`, because in a Tailwind codebase `className` plus the conflict
resolution in `cn` already is that system, and duplicating it as props buys a narrower API and a much
larger safelist — `p` / `px` / `py` made responsive alone would be 324 rules, more than this package
declares in total. Two things earn a place in the shared contract: a prop a consumer could not write
as a literal class, or one that needs something the component knows and the caller does not.

### `as` is typed by the element it renders

```tsx
<Stack as={'a'} href={'/reports'} download gap={4}>…</Stack>   // an anchor's attributes, available
<Stack as={'section'} aria-label={'summary'}>…</Stack>
<Container as={MyComponent} title={'required by MyComponent'} />
```

Every primitive with an `as` is generic in it, so the props it accepts are the props of the element it
is actually rendering. `as={'span'}` refuses `href`; `as={'a'}` requires nothing but allows it; a
component reached through `as` demands its own required props.

The shape before this rejected the first line and accepted `<Stack as={'span'} onScroll={…} />`, which
is the same mistake twice: the type described a `div` while the component rendered whatever it was
told to.

Each component exports two types. `StrictStackProps` is what `Stack` itself understands, which is the one
to extend when wrapping it; `StackProps<E = 'div'>` is the whole surface. **The default type argument
means nothing changes for you**: `StackProps` with no argument is still the div-flavoured props it
always was.

```ts
import type { StrictStackProps, StackProps } from '@proedis/ui';

interface CardProps extends StrictStackProps { title: string; }        // extending the own props
const Wrapper = (props: StackProps) => <Stack {...props} />;         // still valid with no argument
```

`PolymorphicProps<E, Own>` is exported too, for a component of your own that wants the same treatment.

### `Stack`

The workhorse. Children on an axis, with a responsive direction, gap and optional dividers.

| Prop | |
| --- | --- |
| `direction` | `vertical` (default) or `horizontal`. Responsive |
| `columns` | equal columns. Declaring it switches to a grid, and `direction` no longer applies. Responsive |
| `gap` | responsive |
| `divided` | a hairline between children, **following the active axis** |
| `align` / `justify` | `items-*` / `justify-*`. Responsive, which is what lets alignment follow a `direction` that changes |
| `wrap` | let a horizontal stack wrap |
| `as` | render as something else than a `div` |

`divided` is the part worth knowing about: it emits `divide-y divide-x-0` for a vertical axis and the
mirror for a horizontal one, **per breakpoint**. A stack whose direction changes at `lg` would
otherwise keep both rules drawn from there on, because the `base` rule is still in effect.

### `Grid` vs `Stack columns`

Both make a grid, and they answer different questions.

`Grid` sizes its columns itself — `repeat(auto-fill, minmax(min(240px, 100%), 1fr))` — so a card
gallery reflows at every width with no breakpoint declared. `Stack columns={{ base: 1, md: 3 }}` is
for when the count per breakpoint *is* the design.

### The rest

| Component | |
| --- | --- |
| `Cluster` | a row that wraps: chips, tags, active filters, toolbar actions |
| `Center` | centres on both axes. `minHeight` gives it room to centre within, `maxWidth` keeps the content a readable column |
| `Container` | the centred, width-capped page wrapper. `size`, and responsive padding |
| `Spacer` | the flexible filler that pushes siblings apart. `aria-hidden`, because it carries nothing |
| `Sticky` | pins to an edge of the nearest scroll container. ⚠️ does nothing when an ancestor clips its overflow |
| `AspectRatio` | holds an image, a map, a video or an embed at a fixed ratio |
| `Divider` | a standalone hairline, optionally with a centred caption |
| `ScrollArea` | native overflow with a thin themed scrollbar. No dependency, no virtual scrollbar |
| `Split` | the two pane frame: one pane of a fixed width, one taking the rest. `collapseBelow` stacks them |
| `Box` | any element with the shared props and nothing else: the bottom of the package |
| `VisuallyHidden` | for a screen reader and not for the eye. `focusable` is the skip-link shape |
| `Bleed` | escapes the parent's horizontal padding, so a band can reach the edge inside a padded page |
| `SafeArea` | pads out of the notch and the home indicator |
| `Heading` | the typographic pair: `Heading.Title` and `Heading.Description` |
| `IconBox` | the frame around a single icon: `fill × tone × size`, plus `shape` and a `halo` |
| `Spinner` | a CSS ring, no icon library. `label` makes it announced, its absence makes it decorative |
| `Label` | the name of something, with an optional line of detail. Two emphases, `strong` and `quiet` |
| `LabeledContent` | a value with a quiet label: the read-only counterpart of a form field |

For a rule *between* the children of a stack use `<Stack divided>`, not `Divider`: it draws with
`divide-*`, so no separator element enters the tree and the first and last child never get one.

### `Heading`, the typographic pair

```tsx
<Heading>
  <Heading.Title>Mezzi in servizio</Heading.Title>
  <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
</Heading>

<Heading gap={2}>
  <Heading.Title size={'xl'}>Nessun risultato</Heading.Title>
  <Heading.Description size={'md'} lines={2}>Prova a rimuovere un filtro</Heading.Description>
</Heading>
```

| | Values |
| --- | --- |
| `Heading` | `gap`, a spacing step. Defaults to `0.5` |
| `.Title` | `size`: `sm` · `md` · `lg` · `xl`, and `lines`: `1` · `2` · `3` to clamp |
| `.Description` | `size`: `xs` · `sm` · `md`, same `lines` |

The parts are reached **through the dot** and are not flat exports, so one import gets the whole pair.
Their types are exported flat, because a type cannot be reached through a value namespace:
`StrictHeadingTitleProps` to extend, `HeadingTitleProps` to forward.

Every size is a **named step**, never a length. That is the whole point: the day a typographic scale
lands in this package, every heading in every application follows it without one call site changing —
the same way they already follow `--radius-scale`.

⚠️ `Heading.Title` renders a **`div`**, not an `h3`. The heading level of a title depends on the
document outline around it, which the component cannot see: the same card is an `h2` on its own page
and an `h3` inside a section. Pass `as={'h2'}` where the outline is known, and nothing where the text
is a label rather than a heading — a wrong level is worse for a screen reader than no level at all.

Each part carries its **own** `size` rather than inheriting one from the pair, and that is not an
oversight: sharing it downwards would need a context, which is client-only and would take the tier out
of a Server Component, or a descendant class on the parent — and a descendant selector has more
specificity than the child's own utility, so the parent would silently win over an explicit `size`.
Two explicit props beat one knob that cannot be overridden.

### `IconBox`, and the tone vocabulary

Three independent axes: **how** it is filled, **which** tone, **how big**.

```tsx
<IconBox><Truck /></IconBox>                                      // soft · muted · 40px
<IconBox fill={'solid'} tone={'destructive'}><Trash /></IconBox>
<IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox>   // an empty state
<IconBox shape={'round'} fill={'plain'}><Check /></IconBox>
```

| Axis | Values |
| --- | --- |
| `fill` | `solid` (the tone carries the surface) · `soft` (a tenth of it, plus a hairline) · `plain` (no surface, same footprint) |
| `tone` | `muted` · `secondary` · `primary` · `success` · `warning` · `destructive` · `info` |
| `size` | `sm` 32 · `md` 40 · `lg` 56 · `xl` 72 · `2xl` 88 — box, radius and glyph move together |
| `shape` | `square` (the radius its size gives it) · `round` |

`Tone` is exported from `@proedis/ui/core` and is **the** tone vocabulary of the package: every
component that offers a tone offers these seven, and each name is the name of the token pair behind it.
`destructive`, not `danger` or `error` — when a prop and its CSS variable share a name, nobody carries
a translation table. Two of the seven are surfaces rather than accents (`muted`, `secondary`), so a
tinted fill treats them as an exception: a tenth of a near-white is invisible.

The icon arrives as a **child**, which is what keeps an icon library out of this package. ⚠️ `IconBox`
is **non-interactive by design**: no hover, no press, no focus. A clickable icon is a button with an
icon in it, and it needs a focus ring and an accessible name that a frame has no business owning.

`halo` draws two concentric rings echoing the tone, for an empty state.

#### Retuning a variant, without wrapping the component

Every variant is reported as an attribute, so one rule in **your** stylesheet retunes every `IconBox`
in the application:

```css
/* your app's CSS, outside any @layer */
[data-slot='icon-box'][data-size='sm'] {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-2xl);
}
```

It wins with no `!important` and no specificity contest: Tailwind emits its utilities inside
`@layer utilities`, and an unlayered rule beats any layered one. The attributes are `data-fill`,
`data-tone`, `data-size` and `data-shape`, and they always carry the **resolved** value, defaults
included.

Two knobs sit one level above that and cost nothing: `size-*` resolves through `--spacing` and every
radius through `--radius-scale`, so a project that wants the whole interface denser or rounder turns
one variable instead of enumerating components. Reach for the attribute when *one* component in *one*
variant has to differ, and for a wrapper when your application simply has different defaults — that is
a decision of your app, not a value of the theme. They are `scale-150` and
`scale-200` of the box rather than a measured geometry, so they follow whatever the size scale says.

### `Box`, and hiding a group

`Box` renders any element with the shared props applied and no classes of its own, so it is where a
plain element goes when it needs one of them, or where a one-off arrangement lives before it deserves
a name.

To hide a **group** rather than one component, ask for `contents`:

```tsx
<Stack direction={'horizontal'} gap={4}>
  <Box className={'contents'} hideBelow={'lg'}>
    <Toolbar />
    <Filters />
  </Box>
</Stack>
```

With `display: contents` the wrapper stops existing as far as layout goes, so both children stay
direct participants of the stack, gap included, and below `lg` the whole group disappears. ⚠️ That is
right on a `Box` and wrong on a primitive that owns a layout: `contents` on a `Stack` would leave its
own `gap` and alignment inert, which is a defect nothing reports.

`VisuallyHidden` is the opposite of all of it: the content leaves the screen and **stays** in the
accessibility tree. `display: none` would remove it from that too, which is precisely not the intent.

### `Split` carries its rail as a prop

```tsx
<Split rail={<Navigation />} railWidth={'18rem'} collapseBelow={'lg'}>
  <main>…</main>
</Split>
```

The rail is a prop rather than the first child because with `side={'end'}` it has to come **after**
the content in the DOM, so the reading order and the tab order match what the eye sees. Two children
in a fixed order could only ever be reordered visually.

The width travels as a custom property that a declared utility reads, instead of an inline
`grid-template-columns`, and that indirection is what makes `collapseBelow` possible at all: a media
query cannot live in an inline style, so the responsive half has to be a class — and a class cannot
carry an arbitrary length.

### `cn`

```ts
cn('flex gap-4', condition && 'gap-8', className)
```

`clsx` flattening plus `tailwind-merge` conflict resolution, which is what makes `className` an
**override** rather than an addition: `<Stack gap={4} className={'gap-8'} />` renders `gap-8`. Every
primitive here builds classes and never inline styles for exactly that reason — a style would beat
the class and the override would silently stop working.

### Hooks — `@proedis/ui/hooks`

```tsx
import { useBreakpoint, useIsMobile, useMediaQuery, usePrefersReducedMotion } from '@proedis/ui/hooks';

const isDesktop = useBreakpoint('lg');            // at or above lg
const isMobile = useIsMobile();                   // below md
const canHover = useMediaQuery('(hover: hover)'); // any query at all
const still = usePrefersReducedMotion();          // for animation driven from JavaScript
```

`useMediaQuery` is the primitive the other three are built on, and it is exported because a named
breakpoint is not the only question worth asking: `print`, `(orientation: landscape)`,
`(prefers-contrast: more)` and a width outside the theme's scale all end there.

The breakpoint pair reads the widths from the `--breakpoint-*` theme variables first, so a project
that moved the scale is followed instead of drifting from it, and falls back to Tailwind's defaults.
Both answer `false` on the server and on the first client render: the layout settles after hydration
rather than mismatching it.

⚠️ `usePrefersReducedMotion` answers **`true`** there instead, and the asymmetry is deliberate: the
two possible mistakes are not equivalent. Guessing "reduce" and correcting costs one frame of
stillness; guessing the other way plays the animation this preference exists to prevent, to the
person who asked for it not to.

They live behind their own entry point on purpose — everything exported from the package root is
renderable from a React Server Component, and a barrel re-exporting a hook would take that away.
Reach for them only where CSS cannot do the job: a bottom sheet instead of a dialog, not a padding.

## 🎛️ Customizing a component

Five levers, and they are listed in order of **reach**: the first changes one call site, the last
changes the whole interface. Picking the right one is most of the work — reaching for a wide lever to
solve a narrow problem is how a design system stops meaning anything.

### 1. `className`, for this one element

```tsx
<Stack gap={4} className={'gap-8 rounded-lg border'} />   // renders gap-8, not gap-4
```

`className` is an **override**, not an addition: every primitive composes its classes through `cn`
(`clsx` + `tailwind-merge`) and puts yours last, so the last conflicting utility wins. This is also
why nothing here uses an inline style for something a class can express — a style would beat the class
and silently take this lever away.

### 2. `as`, to change the element

```tsx
<Stack as={'section'} aria-labelledby={'title'} />
<Container as={'main'} />
<IconBox as={'a'} href={'/reports'}><ArrowRight /></IconBox>
```

The props you may pass are the props of the element you asked for, checked by the compiler. See
[`as` is typed by the element it renders](#as-is-typed-by-the-element-it-renders).

### 3. A `data-*` rule, for every instance of one variant

Every component reports its variants as attributes, so one rule in **your** stylesheet retunes all of
them without touching a call site and without wrapping anything:

```css
/* your app's CSS, outside any @layer */
[data-slot='icon-box'][data-size='sm'] {
  width: 2.25rem;
  height: 2.25rem;
}

[data-slot='container'][data-size='xl'] { max-width: 104rem; }

[data-slot='label'][data-emphasis='quiet'] { letter-spacing: 0.02em; }
```

It wins with no `!important` and no specificity contest: Tailwind emits its utilities inside
`@layer utilities`, and an **unlayered** rule beats any layered one. Every part of a compound
component carries its own slot too (`surface-header`, `label-description`, `icon-box-halo`), so the
inside of a component is reachable as well as its root.

What is reported, and what is not:

| Kind of prop | Reported as | Example |
| --- | --- | --- |
| a closed set of values | always, with the resolved default | `data-size='md'`, `data-orientation='vertical'` |
| a boolean | only when true, HTML-style | `data-divided`, `data-inline` |
| a **responsive** value | not reported | `gap={{ base: 2, lg: 6 }}` is `gap-2 lg:gap-6` — target the classes, or write your own media query |
| a free measure | not reported | `railWidth`, `maxHeight`, `ratio` are inline lengths; pass a different value |

### 4. Your own component, when your app simply has other defaults

```tsx
export const AppIcon = (props: IconBoxProps) => <IconBox size={'sm'} tone={'primary'} {...props} />;
```

Five lines, and the right answer more often than it looks: "our application always uses this
combination" is a decision **of your application**, not a value of the theme. Every own-props type is
exported for exactly this (`StrictIconBoxProps` to extend, `IconBoxProps` to forward), and so is every
`cva` function (`iconBoxVariants`, `spinnerVariants`) if you would rather compose the classes than the
component.

### 5. The token contract, for the whole interface

```css
:root {
  --primary: oklch(0.55 0.2 264);
  --radius-scale: 1.4;     /* every corner in the interface, one declaration */
  --spacing: 0.2rem;       /* every gap, padding and box side, one declaration */
}
```

The widest lever and the cheapest: `size-8` resolves through `--spacing`, every radius through
`--radius-scale`, every colour through its token. A project that wants a denser or rounder interface
turns one variable rather than enumerating components. See
[The token contract](#-the-token-contract).

⚠️ Deliberately **not** a lever: per-component variables like `--icon-box-sm-size`. They read as more
control and give less — five sizes times three properties is fifteen names for one component, hundreds
across the package, and each one cuts that component out of the scales it obeys today. A private pixel
follows nothing. Where a value genuinely has no scale behind it the package does expose a variable —
`--split-rail`, the width of a navigation rail — and that is the whole criterion: **a scale if one
exists, a variable only if none does.**

## 🎨 The token contract

The stylesheet declares the semantic tokens the three chrome components read, and neutral defaults
for them. Overriding is one declaration **after** the import:

```css
@import 'tailwindcss';
@import '@proedis/ui';

:root {
  --background: oklch(0.99 0.005 264);
  --border: oklch(0.9 0.02 264);
  --radius-scale: 1.6;         /* moves the whole radius scale, every step at once */
}

.dark {
  --border: oklch(1 0 0 / 12%);
}
```

Three colour families and one line colour:

| Token | Read by |
| --- | --- |
| `--background` | nothing here — the canvas is yours to paint. See below |
| `--foreground` | the ink of a value |
| `--muted` | the recessed surface behind a `LabeledContent` icon |
| `--muted-foreground` | a quiet label, a divider caption, the scrollbar thumb |
| `--border` | `Divider`, and the rules `Stack divided` draws |
| `--radius-scale` | a unitless multiplier over the whole `--radius-*` scale |
| `--container-8xl` | the width of `Container size='xl'`, one step past Tailwind's own scale |
| `--text-2xs` | the step below `text-xs`, read by the description line of `Label` |

The last three are a **configuration** rather than a colour a component reads: they exist to be
turned. `--container-8xl` is there because Tailwind's container scale stops at `7xl` (80rem) and the
widest page this package offers is 96rem, the width of the `2xl` breakpoint. `--text-2xs` is there
because a three level text hierarchy does not fit in Tailwind's scale: a label, a description under
it and a value need three sizes, and the scale offers 12px and 14px with nothing between or below.
Both replaced an arbitrary value written inside a component — `max-w-[96rem]`, `text-[13px]` — which
is a length with no name: invisible to a theme, unreachable by anyone who wants it different.

`--background` is the one entry with no component behind it, and that is deliberate: `--foreground`
means nothing without naming what it sits on, so the pair is a **contract** rather than a token a
component reads. Declaring half of it would be the actual defect. Everything else on the list is
read by something that ships here — nothing is declared just in case.

The defaults reference Tailwind's **own** palette (`var(--color-zinc-100)`) rather than hardcoding
`oklch(...)`, so the shade names stay readable and a themed palette is followed for free.

⚠️ Two things this stylesheet does beyond declaring tokens, both deliberate and both worth knowing.
It sets `@custom-variant dark (&:is(.dark *))`. And it re-emits Tailwind's whole `--radius-*` scale
through `--radius-scale` — every step, `xs` included — so that one declaration moves the corner
language of the interface. At the default `1` each step is **exactly** the value Tailwind
documents: `rounded-md` is `0.375rem`. Redeclare either to opt out.

One exception to the knob, and it is Tailwind's, not ours: the bare `rounded` is a legacy alias
emitting a hardcoded `0.25rem` and does **not** follow `--radius-scale`. Write `rounded-sm` — same
value, and it does follow. Everything built from a named step, directional variants included
(`rounded-t-md`), behaves.

The scale is deliberately *not* anchored the way shadcn/ui anchors it (`lg` = a `--radius` length,
the rest derived with `± 2px`): that shifts every name one step off the documented value, so its
`md` is Tailwind's `lg`. A scale whose names lie is a defect nobody finds without opening the docs.

### The full vocabulary — `theme.css`

The contract above is what the primitives in this package read, and it is deliberately small. The
tokens an interface actually needs are more than five, and they have a habit of being invented
separately in every application: measured across the three Proedis frontends already on Tailwind 4,
the same 26 token vocabulary is declared in all three, copied from the same source, diverging exactly
where each one improvised. One declares `--warning` and never registers `--color-warning`, so
`bg-warning` does not exist there and its charts reach for `var(--warning)` by hand. One has
`success` / `warning` / `info`, one has none of them. Three different names for the heading font.

That is not a styling problem, it is one token spelt three ways, and no component here could have
prevented it. So the vocabulary is named once, in a second stylesheet:

```css
@import 'tailwindcss';
@import '@proedis/ui/theme.css';   /* the base stylesheet is inside this one */
```

| Family | Tokens |
| --- | --- |
| Raised surfaces | `--card`, `--popover`, each with its `-foreground` |
| Action | `--primary`, `--secondary`, `--accent`, each with its `-foreground` |
| States | `--destructive`, `--success`, `--warning`, `--info`, each with its `-foreground` |
| Controls | `--input` (the **border** of a form control), `--ring` (the focus ring) |

Every family is a **pair**, a surface and the ink that is legible on it, and both halves are always
declared: half a pair is what produces the token nobody can use, a `--warning` that leaves every
caller guessing whether black or white goes on top.

The state hues have a default while nothing else brand-shaped does, and that is not an inconsistency:
red for damage, amber for attention, green for success, blue for information is a convention this
package did not invent. Which is also the reason two things are **not** in here:

- **`--chart-1..5`.** A five step categorical ramp has no neutral default. Any value would be a
  palette, and this package ships none; naming them without defaulting them would be a comment
  pretending to be code.
- **`--sidebar-*`.** Eight tokens that are one component's private slots rather than a semantic
  vocabulary. They belong to whichever package ships that component.
- **The font and the text scale.** A real decision about a typographic scale, and an open one.
  `--text-2xs` above is the single step a component here needed, nothing more.

⚠️ `--input` is back in this file after being **removed** from the base contract, and the two facts
agree: there it was being used as a fill by the one component that read it, which is not what the
name means. Here it is the border colour of a form control, read by a form layer that lives in
another package. A recessed surface is `--muted`.

## 🤝 Compatibility

| | |
| --- | --- |
| React | `>=18.0.0 <20.0.0` |
| Tailwind | `^4.0.0` — the stylesheet uses `@source`, `@theme inline`, `@utility` and `@custom-variant` |
| TypeScript | `>=5.5` |
| Runtime | ES2022. The package root is server-renderable; `/hooks` is client-only |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
