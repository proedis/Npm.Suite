<div align="center">

# `@proedis/ui-core`

**The layout primitives every Tailwind interface rewrites — with responsive props over a scale the
compiler checks, and no design of their own.** 📐

[![npm](https://img.shields.io/npm/v/@proedis/ui-core.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@proedis/ui-core)
[![license](https://img.shields.io/npm/l/@proedis/ui-core.svg?style=flat-square&color=blue)](https://github.com/proedis/Npm.Suite/blob/master/LICENSE)

</div>

---

## ✨ What's in the box

Eleven primitives, the responsive machinery behind them, and the stylesheet they read. No icons, no
buttons, no cards: this is the layer *under* a design system. 🧱

| | |
| --- | --- |
| **Layout** | `Stack` · `Grid` · `Cluster` · `Center` · `Container` · `Spacer` · `Sticky` · `AspectRatio` |
| **Chrome** | `Divider` · `ScrollArea` · `LabeledContent` — the three that read a token |
| **Responsive** | `Responsive<T>`, the typed scales, and the class builders behind every prop |
| **Utilities** | `cn` — class composition where the last conflicting utility wins |
| **Hooks** | `useBreakpoint`, `useIsMobile` — the same breakpoint vocabulary, in JavaScript |

## 📦 Installation

```bash
yarn add @proedis/ui-core
```

Then import the stylesheet **into your Tailwind entry CSS**:

```css
@import 'tailwindcss';
@import '@proedis/ui-core';
```

The package name is enough — no path. `@import '@proedis/ui-core'` and
`import { Stack } from '@proedis/ui-core'` are the same specifier resolved under different
conditions: a CSS resolver asks for `style`, a bundler asks for `import`. (The explicit
`@proedis/ui-core/ui-core.css` keeps working, if you prefer to see what you are importing.)

That single line does three things: it lets Tailwind see the classes this package writes, it
registers the token contract, and it declares neutral defaults for it. Nothing else to configure —
no safelist to copy, no `@source` to add.

| Peer | Range |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` |
| `tailwindcss` | `^4.0.0` |

⚠️ The stylesheet uses Tailwind directives. Loaded as a plain `<link>` it does nothing — it has to be
imported where Tailwind compiles.

## 🚀 Quick start

```tsx
import { Cluster, Container, Divider, Stack } from '@proedis/ui-core';

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

### `Stack`

The workhorse. Children on an axis, with a responsive direction, gap and optional dividers.

| Prop | |
| --- | --- |
| `direction` | `vertical` (default) or `horizontal`. Responsive |
| `columns` | equal columns. Declaring it switches to a grid, and `direction` no longer applies. Responsive |
| `gap` | responsive |
| `divided` | a hairline between children, **following the active axis** |
| `align` / `justify` | `items-*` / `justify-*` |
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
| `LabeledContent` | a value with a quiet label: the read-only counterpart of a form field |

For a rule *between* the children of a stack use `<Stack divided>`, not `Divider`: it draws with
`divide-*`, so no separator element enters the tree and the first and last child never get one.

### `cn`

```ts
cn('flex gap-4', condition && 'gap-8', className)
```

`clsx` flattening plus `tailwind-merge` conflict resolution, which is what makes `className` an
**override** rather than an addition: `<Stack gap={4} className={'gap-8'} />` renders `gap-8`. Every
primitive here builds classes and never inline styles for exactly that reason — a style would beat
the class and the override would silently stop working.

### Hooks — `@proedis/ui-core/hooks`

```tsx
import { useBreakpoint, useIsMobile } from '@proedis/ui-core/hooks';

const isDesktop = useBreakpoint('lg');   // at or above lg
const isMobile = useIsMobile();          // below md
```

They read the widths from the `--breakpoint-*` theme variables first, so a project that moved the
scale is followed instead of drifting from it, and fall back to Tailwind's defaults. Both answer
`false` on the server and on the first client render: the layout settles after hydration rather than
mismatching it.

They live behind their own entry point on purpose — everything exported from the package root is
renderable from a React Server Component, and a barrel re-exporting a hook would take that away.
Reach for them only where CSS cannot do the job: a bottom sheet instead of a dialog, not a padding.

## 🎨 The token contract

The stylesheet declares the semantic tokens the three chrome components read, and neutral defaults
for them. Overriding is one declaration **after** the import:

```css
@import 'tailwindcss';
@import '@proedis/ui-core';

:root {
  --border: oklch(0.9 0.02 264);
  --radius: 1rem;              /* moves the whole radius scale */
}

.dark {
  --border: oklch(1 0 0 / 12%);
}
```

| Token | Read by |
| --- | --- |
| `--border` | `Divider`, and the rules `Stack divided` draws |
| `--input` | the recessed surface behind a `LabeledContent` icon |
| `--foreground` | the ink of a value |
| `--muted-foreground` | a quiet label, a divider caption, the scrollbar thumb |
| `--radius` | the whole `--radius-*` scale, derived from this one value |

Five tokens, and every one of them is used by a component that ships here — nothing is declared just
in case. The defaults reference Tailwind's **own** palette (`var(--color-zinc-200)`) rather than
hardcoding `oklch(...)`, so the shade names stay readable and a themed palette is followed for free.

⚠️ Two things this stylesheet does beyond declaring tokens, both deliberate and both worth knowing:
it sets `@custom-variant dark (&:is(.dark *))`, and it **replaces** Tailwind's `--radius-*` scale
with one derived from `--radius`. Redeclare either after the import to opt out.

## 🤝 Compatibility

| | |
| --- | --- |
| React | `>=18.0.0 <20.0.0` |
| Tailwind | `^4.0.0` — the stylesheet uses `@source`, `@theme inline`, `@utility` and `@custom-variant` |
| TypeScript | `>=5.5` |
| Runtime | ES2022. The package root is server-renderable; `/hooks` is client-only |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
