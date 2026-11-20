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

Twenty-seven primitives, the interactive components, the machinery behind them, and the stylesheet
they read:

```ts
import { Stack, Divider } from '@proedis/ui';              // everything except hooks and interactive
import { Stack } from '@proedis/ui/layout';                // …or say which tier you are in
import { Divider } from '@proedis/ui/components';
import { cn, type Responsive } from '@proedis/ui/core';
import { useIsMobile } from '@proedis/ui/hooks';           // client-only, its own entry point
import { Button } from '@proedis/ui/interactive/button';   // one subpath per interactive component
```

`core` holds **no JSX**: the class machinery, the shared props and the types. `layout` answers *where
things are*, `components` answers *what they look like*, and `hooks` is the client-only half. 🧱

| | |
| --- | --- |
| **Layout** | `Box` · `Stack` · `Grid` · `Cluster` · `Center` · `Container` · `Split` · `Spacer` · `Sticky` · `AspectRatio` |
| **Visibility** | `hideBelow` / `hideFrom` on every primitive, plus `VisuallyHidden` |
| **Escapes** | `Bleed` · `SafeArea` — out of a padding, and out of the notch |
| **Components** | `Surface` · `Item` · `Heading` · `Badge` · `BadgeCounter` · `IconBox` · `Spinner` · `Skeleton` · `LoadingBar` · `BusyVeil` · `Divider` · `ScrollArea` · `Label` · `LabeledContent` |
| **Responsive** | `Responsive<T>`, the typed scales, and the class builders behind every prop |
| **Utilities** | `cn` — class composition where the last conflicting utility wins |
| **Types** | `PolymorphicProps` — `as` typed by the element it renders, not by `div` |
| **Hooks** | `useMediaQuery`, `useBreakpoint`, `useIsMobile`, `usePrefersReducedMotion`, `useDelayedBusy`, `useOverflowItems` |
| **Interactive** | `Tooltip` · `Button` · `IconButton` · `Form` · `Field` · `TextInput` · `PasswordInput` · `SearchInput` · `Textarea` · `NumberInput` · `Checkbox` · `RadioGroup` · `Switch` · `Select` · `MultiSelect` · `Combobox` · `DatePicker` · `FileUpload` · `AttachmentList` · `Toggle` · `ToggleGroup` · `SegmentedControl` · `Popover` · `Menu` · `Dialog` · `AlertDialog` · `Drawer` · `Alert` · `EmptyState` · `Tabs` · `Avatar` · `AvatarGroup` · `Person` · notifications (`NotificationsProvider`, `JobsButton`), on Base UI |
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
| `tailwindcss` | `^4.1.5` |
| `@base-ui/react` | `^1.7.0`, **optional**: only for the `interactive/*` subpaths |
| `dayjs` | `^1.11.0`, **optional**: only for `interactive/date-picker`, `interactive/filters-bar` and `interactive/modal-selector`, with the locale loaded by the application |
| `@tanstack/react-table` | `^9.3.1`, **optional**: only for `interactive/table` |

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

They come from one shared contract, so they are on **every** component in the package but one:
every primitive of the layout tier (`Box`, `Stack`, `Grid`, `Cluster`, `Center`, `Container`,
`Split`, `Spacer`, `Sticky`, `AspectRatio`, `Bleed`, `SafeArea`) and every component of the other
(`Surface`, `Item`, `Heading`, `Badge`, `IconBox`, `Spinner`, `Divider`, `ScrollArea`, `Label`,
`LabeledContent`). Not `VisuallyHidden`, where they would contradict the component.

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
larger safelist — `p` / `px` / `py` made responsive alone would be 324 entries, against the 341 this
package safelists in total for every responsive prop it has.

Two things earn a place in the shared contract: a prop a consumer could not write as a literal
class, or one that needs something the component knows and the caller does not.

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
| `Surface` | the card: `Surface.Header`, `.Section`, `.Separator`, `.Footer`, plus `loading` |
| `Item` | the row: a leading visual, a block of text, a tail. `Item.Actions` and `Item.Trailing` |
| `Heading` | the three text registers: `Heading.Eyebrow`, `.Title`, `.Description` |
| `Badge` | a compact label: `fill × tone × size`, plus a leading `dot` |
| `IconBox` | the frame around a single icon: `fill × tone × size`, plus `shape` and a `halo` |
| `Spinner` | a CSS ring, no icon library. `label` makes it announced, its absence makes it decorative |
| `Label` | the name of something, with an optional line of detail. Two emphases, `strong` and `quiet` |
| `LabeledContent` | a value with a quiet label: `LabeledContent.Label` and `.Value` |

For a rule *between* the children of a stack use `<Stack divided>`, not `Divider`: it draws with
`divide-*`, so no separator element enters the tree and the first and last child never get one.

### `Surface`, the card

```tsx
<Surface elevation={'raised'}>
  <Surface.Header>
    <IconBox tone={'primary'}><Truck /></IconBox>
    <Heading>
      <Heading.Title size={'lg'}>Mezzi in servizio</Heading.Title>
      <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
    </Heading>
    <Item.Actions>{actions}</Item.Actions>
  </Surface.Header>

  <Surface.Separator />
  <Surface.Section>{content}</Surface.Section>

  <Surface.Separator type={'gap'} space={8} />
  <Surface.Section flush><DataTable /></Surface.Section>

  <Surface.Footer justify={'between'}>{pagination}</Surface.Footer>
</Surface>
```

| | |
| --- | --- |
| `Surface` | `elevation`: `default` · `flat` · `soft` · `raised` — `radius`: `default` · `none` · `lg` → `4xl` — `loading`, `loadingLabel` |
| `.Header` | **an `Item`**, with the card's padding: every `Item` prop works on it |
| `.Section` | the body. `flush` drops the padding so a table can reach the edges |
| `.Separator` | `type`: `divider` (a hairline) or `gap` (`space`, a spacing step) |
| `.Footer` | `justify`, and `muted` for a recessed row |

**The Surface has no padding and no vertical rhythm of its own.** The room lives in the parts, which
is what lets a section go `flush` without fighting a padding one level up, and the space between two
parts is a `Separator` you place. The two implementations this comes from each encoded that decision
once for the whole card — one with a `divide-y` nobody can opt out of, the other with nine descendant
margin rules — and neither could put a line in one seam and room in the next.

`Surface.Header` **is** an `Item`, which is the finding this tier was built on: a card header and a
list row are the same three slots with the same truncation plumbing, and the only difference is the
register of the title. So the header takes `direction`, `align`, `gap`, `interactive` and everything
else a row takes.

#### `default` is a value, not the absence of one

```tsx
<Surface />                        // data-elevation="default"  data-radius="default"
<Surface elevation={'soft'} />     // data-elevation="soft"      — identical on screen
```

Both render the same shadow. They are **not** the same set to a stylesheet, and that is the point:

```css
[data-slot='surface'][data-elevation='default'] { box-shadow: var(--our-house-shadow); }
```

That rule owns every card nobody had an opinion about, and leaves alone every card that deliberately
asked for `soft`. Reporting the resolved step would have made the two indistinguishable.

There is a second reason, and it is the stronger one: your rule keeps meaning "the ones we did not
decide" even if this package later changes which step the default is. A rule against
`[data-elevation='soft']` would silently stop matching.

⚠️ Only **four** props have it, and the list is deliberately short. A prop earns a `default` when its
default is a **choice among named options** (not a step of a themeable scale), when you would plausibly
write a rule for the unspecified case, and when that rule should survive this package changing its
mind:

| Has `default` | Does not, and why |
| --- | --- |
| `Surface.elevation` · `Surface.radius` · `Container.size` · `Label.emphasis` | `IconBox`'s `size` / `fill` / `tone` / `shape`, `Spinner.size`, every `Heading` size and every `gap` are **steps of a scale** — `--spacing`, `--radius-scale`, `--text-*` are the better lever, and `data-size="md"` says what the thing *is* |
| | `Divider.orientation`, `ScrollArea.orientation`, `Sticky.position`, `Split.side`, `SafeArea.sides`, `Item.direction`, `Grid.fill` are **what you meant**, not a house look: nobody restyles "the dividers we did not give an orientation" |
| | every boolean: `data-inset` is present or absent, and there is no third state to name |

### `Item`, the row

```tsx
<Item interactive inset>
  <IconBox><Truck /></IconBox>
  <Heading>
    <Heading.Eyebrow>In servizio</Heading.Eyebrow>
    <Heading.Title>FT-234-KL</Heading.Title>
    <Heading.Description>Ultimo passaggio 12:04</Heading.Description>
  </Heading>
  <Item.Actions>{actions}</Item.Actions>
  <Item.Trailing><ChevronRight /></Item.Trailing>
</Item>
```

Turn the axis and the same component is an empty state:

```tsx
<Item direction={'vertical'} gap={6} className={'text-center'}>
  <IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox>
  <Heading gap={2}>
    <Heading.Title size={'xl'}>Nessun risultato</Heading.Title>
    <Heading.Description size={'md'}>Prova a rimuovere un filtro</Heading.Description>
  </Heading>
</Item>
```

| Prop | |
| --- | --- |
| `direction` | `horizontal` (default) or `vertical`. Responsive |
| `align` | cross-axis, defaults to `center`. Responsive |
| `gap` | defaults to `3`. Responsive |
| `inset` | row padding on the item itself, so an interactive hover fills the row edge to edge |
| `interactive` | cursor, hover and focus ring. **Not** the semantics — see below |

The leading visual needs no slot: `IconBox` and `Spinner` already refuse to shrink, so anything from
this package is a direct child. What the component owns is the plumbing — `grow min-w-0` on the
heading and `shrink-0` on the tail — which is what makes a long title **truncate** instead of pushing
the actions out of the row. Both reference implementations carry it three times per file, and it is
the part that is silently wrong when a caller forgets: nothing breaks, the row just overflows at some
content length nobody tested.

⚠️ **`interactive` is the affordance, not the semantics**, and this is the one place where `Item`
deliberately does less than the implementations it comes from. They add `role="button"`, `tabIndex`
and a hand-written Enter/Space handler to a `div`, which re-implements a button badly and breaks the
moment the row contains a control of its own — a `button` inside a `button` is invalid. So:

| A row that… | is written as |
| --- | --- |
| **is** a button, with no controls inside | `<Item as={'button'} type={'button'} interactive>` |
| navigates | your router's link around it, `Item` presentational |
| has its own actions | not clickable; the actions are |

An `onClick` on a `div` is not reachable from a keyboard, and no prop here pretends otherwise.

There is no `tone` either: a boxed row is a card, and there is a component for a card —
`<Surface><Item /></Surface>` is one element instead of a chrome duplicated in two places that then
have to be kept in step. `inset` stayed, because row padding belongs to the row.

### `LabeledContent`, the pair with the emphasis inverted

```tsx
<LabeledContent>
  <LabeledContent.Label>Totale raccolto</LabeledContent.Label>
  <LabeledContent.Value>1.204 kg</LabeledContent.Value>
</LabeledContent>

<LabeledContent inline>                     {/* a settings row: name left, state right */}
  <LabeledContent.Label>Notifiche push</LabeledContent.Label>
  <LabeledContent.Value>Attive</LabeledContent.Value>
</LabeledContent>
```

A `Heading` is a loud title with a quiet line under it. This is the opposite: a quiet name with a
**loud value** under it, because here the value is the point and a label competing with it flattens the
pair. Same two elements, opposite weights — which is why it is not a `Heading` with props.

For the row with an icon, compose: `Item` grows a `LabeledContent` exactly as it grows a `Heading`.

```tsx
<Item align={'start'}>
  <IconBox><Scale /></IconBox>
  <LabeledContent>
    <LabeledContent.Label>Totale raccolto</LabeledContent.Label>
    <LabeledContent.Value>1.204 kg</LabeledContent.Value>
  </LabeledContent>
  <Item.Actions>{actions}</Item.Actions>
</Item>
```

### `Heading`, the three text registers

```tsx
<Heading>                                          {/* a list row: the default register */}
  <Heading.Eyebrow>In servizio</Heading.Eyebrow>
  <Heading.Title>FT-234-KL</Heading.Title>
  <Heading.Description>Ultimo passaggio 12:04</Heading.Description>
</Heading>

<Heading>                                          {/* the header of a card */}
  <Heading.Title size={'lg'}>Mezzi in servizio</Heading.Title>
  <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
</Heading>
```

| | Values |
| --- | --- |
| `Heading` | `gap`, a spacing step. Defaults to `0.5` |
| `.Eyebrow` | `size`: `xs` · `sm`. Uppercase, tracked, muted |
| `.Title` | `size`: `sm` · `md` · `lg` · `xl`. Weight rises with size |
| `.Description` | `size`: `xs` · `sm` · `md`. `text-pretty` by default |
| all three | `lines`: `1` · `2` · `3` to clamp |

⚠️ The default title size is **`sm`**, and it is measured rather than chosen: both reference
implementations write `text-sm font-semibold` for the title of a list row and something larger for the
title of a card header. A list row is by far the more frequent, so the frequent case writes no props
and a header states `size={'lg'}`.

The eyebrow reads as an eyebrow because of the case and the tracking, not the size — which is why it
shares `--text-2xs` with the smallest description rather than asking for a step of its own. It is
muted, not tinted: one reference colours it `text-primary`, the other mutes it, and a tinted eyebrow is
a product decision that `className={'text-primary'}` covers.

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

### `Badge`, and one table for every tone

```tsx
<Badge>Bozza</Badge>
<Badge tone={'warning'} dot>In ritardo</Badge>
<Badge tone={'destructive'} fill={'solid'} size={'sm'}>3</Badge>
```

Same three axes as `IconBox` — `fill` (`solid` · `soft` · `plain`), `tone` (the seven), `size`
(`sm` · `md` · `lg`) — and painted from the **same table**, `TONE_CLASSES` in `@proedis/ui/core`. That
is why a `success` badge and a `success` icon box are the same green at the same strength. The two
implementations this comes from each carried their own colour table and agreed with each other on none
of them.

Next to a title, which is what it was asked for:

```tsx
<Heading>
  <Stack direction={'horizontal'} align={'center'} gap={2}>
    <Heading.Title lines={1}>FT-234-KL</Heading.Title>
    <Badge tone={'warning'}>In ritardo</Badge>
  </Stack>
  <Heading.Description>Ultimo passaggio 12:04</Heading.Description>
</Heading>
```

A `Stack` and **not** a `Cluster`: a cluster wraps, so a long title would push the badge onto a second
line instead of truncating. The title carries `min-w-0` and the badge carries `shrink-0`, so the
pressure lands on the one that can absorb it.

⚠️ **Static by nature.** A badge communicates, it is not clicked, and there is no `removable` with an
`×` inside it: a control inside a label needs the label not to be a control, needs its own name, focus
ring and keyboard path. A removable chip is a **button with a badge in it**. `as={'a'}` is there for a
badge that navigates, and then the semantics are yours — the same rule as `Item`.

Not here either, each for a reason: `loading` (a badge as a live region), `pulse` (a keyframe this
stylesheet does not declare) and `count` / `iconOnly` (a second geometry where one digit is a circle).
`dot` is here because it needs none of the three.

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

`halo` draws two concentric rings echoing the tone, for an empty state. They are `scale-150` and
`scale-200` of the box rather than a measured geometry, so they follow whatever the size scale says.

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
a decision of your app, not a value of the theme.

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

### The rest of `@proedis/ui/core`

`cn` is the one most call sites touch, and it is not alone. The tier also publishes what the
components build their classes with, for a primitive of your own that wants to behave the same way:

| Export | Is |
| --- | --- |
| `splitBaseProps(props)` | pulls `hideBelow` / `hideFrom` out of a props object and hands back `{ baseClasses, rest }` |
| `responsiveClasses(value, build)` | turns a `Responsive<T>` into the per-breakpoint classes, in cascade order |
| `gapClasses`, `alignClasses`, `justifyClasses`, `directionClasses`, `columnsClasses`, `divideClasses` | the same, specialised per prop |
| `breakpointPrefix(bp)`, `responsiveEntries(value)`, `toResponsiveMap(value)` | the pieces `responsiveClasses` is made of |
| `BREAKPOINTS`, `BREAKPOINT_WIDTHS`, `mediaQuery(bp)` | the scale as data, and the media query behind a named breakpoint |
| `TONE_CLASSES`, `TONE_COMPOUNDS`, `TONES` | the one tone table, ready to hand to a `cva` call of your own |
| `LinkTarget`, `linkProps(target)` | a place to go, as `{ href, go() }`, and the two anchor attributes that follow it on a plain click only |

⚠️ A class these builders produce needs a **safelist entry** in the stylesheet to have any CSS
behind it, exactly as it does inside this package. They cover the scale declared in `ui.css` and
nothing beyond it, which is also why the value types are unions rather than `number`.

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

`useDelayedBusy(busy)` is the timing every wait shares: `{ busy, visible }`, the block at once and the
look after 300ms, held at least 400 once shown, so a fast answer flashes nothing. `useOverflowItems`
says which items of a row fit and which go into a "More" menu, from a hidden copy of the row; Tabs use
it, and a header with tabs can.

They live behind their own entry point on purpose — everything exported from the package root is
renderable from a React Server Component, and a barrel re-exporting a hook would take that away.
Reach for them only where CSS cannot do the job: a bottom sheet instead of a dialog, not a padding.

### The interactive tier — `@proedis/ui/interactive/*`

The components with behaviour: keyboard, focus, state, accessibility. Their **logic and structure**
are shared; their **look** is a neutral default every application retunes from its own stylesheet,
through the `data-slot` on every part and the `data-*` that reports every resolved variant (see
[Customizing a component](#️-customizing-a-component)). The slot names are public API.

They run on [Base UI](https://base-ui.com), an **optional** peer: a project that never imports from
these subpaths installs nothing new. One subpath per component, so each brings only its own peers, and
none of them is re-exported by the root barrel. Every module is client-only (`'use client'`).

| Subpath | Exports |
| --- | --- |
| `interactive/tooltip` | `Tooltip`, `TooltipProvider` |
| `interactive/button` | `Button`, `IconButton`, `buttonVariants` |
| `interactive/field` | `Field` (`.Label`, `.Description`, `.Error`, `.Counter`), `FIELD_SPAN`, `useFieldControl` |
| `interactive/field-shell` | `FieldShell`, the frame of every text control, for a control of your own |
| `interactive/form` | `Form` (`.Header`, `.ErrorSummary`, `.Section`, `.Footer`) |
| `interactive/text-input` | `TextInput` (`.Action`), `textInputVariants` |
| `interactive/password-input` | `PasswordInput` |
| `interactive/search-input` | `SearchInput` |
| `interactive/textarea` | `Textarea` |
| `interactive/number-input` | `NumberInput` |
| `interactive/checkbox` | `Checkbox`, `CheckboxGroup` (with a computed parent box) |
| `interactive/checkbox-grid` | `CheckboxGrid`: boxes in sections that open and close, a row of parent boxes in each open group |
| `interactive/radio` | `RadioGroup`, `Radio` (classic or `variant="card"`) |
| `interactive/switch` | `Switch` |
| `interactive/select` | `Select`, with a search past `searchThreshold` options |
| `interactive/multi-select` | `MultiSelect` |
| `interactive/combobox` | `Combobox`, one record or several (`multiple`) among results from the server |
| `interactive/date-picker` | `DatePicker`, a date or a period (`mode="range"`); needs `dayjs` |
| `interactive/file-upload` | `FileUpload`, `AttachmentList`, `validateFiles`, `acceptsFile` |
| `interactive/toggle` | `Toggle`, `ToggleGroup` |
| `interactive/segmented-control` | `SegmentedControl` (`.Item`) |
| `interactive/popover` | `Popover` (`.Submit`) |
| `interactive/menu` | `Menu` (`.Item`, `.Group`, `.Separator`, `.RadioGroup`, `.RadioItem`, `.CheckboxItem`, `.Submenu`) |
| `interactive/dialog` | `Dialog` (`.Submit`, `.Cancel`, `.Section`) |
| `interactive/alert-dialog` | `AlertDialog`, in three grades |
| `interactive/drawer` | `Drawer` (`.Submit`, `.Cancel`, `.Section`) |
| `interactive/alert` | `Alert`, `alertVariants` |
| `interactive/empty-state` | `EmptyState` |
| `interactive/detail` | `Detail` (`.Section`, `.Grid`, `.Item`), `DETAIL_SPAN`: the read-only content of a record |
| `interactive/collapsible` | `CollapsibleSection`: a section that opens and closes from its header |
| `interactive/tabs` | `Tabs` (`.Panel`), with "More" for the tabs that do not fit |
| `interactive/person` | `Avatar`, `AvatarGroup`, `Person` |
| `interactive/toast` | `createNotifications`, `NotificationsProvider`, `JobsButton` |
| `interactive/table` | `Table`, `TableFormatsProvider`, `useTableFormats`, `sortingToFields`; needs `@tanstack/react-table` |
| `interactive/filters-bar` | `FiltersBar`: search, a button per filter, "More filters", "Clear filters"; needs `dayjs` |
| `interactive/modal-selector` | `ModalSelector`, `ModalSelectorField`: one record or several from a list, in a Dialog; needs `dayjs` |

```tsx
<TooltipProvider>                                   {/* once, above everything */}
  <Form id={'signal'} onSubmit={handleSubmit}>
    <Form.ErrorSummary title={(count) => t('FORM.ERRORS', { count })} />
    <Form.Section title={'Address'} description={'Where the collection takes place'}>
      <Field span={4} breakBefore>
        <Field.Label required>Street</Field.Label>
        <TextInput width={'long'} />
        <Field.Error summary={'Street: write it in full'}>{errors.street}</Field.Error>
      </Field>
    </Form.Section>
  </Form>

  <Button form={'signal'} type={'submit'}>Save</Button>
  <IconButton label={'Delete'} icon={<Trash />} />
  <Button to={{ href: '/signals', go: () => navigate('/signals') }} fill={'plain'}>All signals</Button>
</TooltipProvider>
```

What is worth knowing before using them:

- **No text inside.** Every visible string and every accessible name comes in as a prop: `label`,
  `loadingLabel` (required with `loading`), `labels` on `PasswordInput` and `SearchInput`, the `title`
  function of `Form.ErrorSummary`.
- **An icon-only button always has a tooltip.** `IconButton` takes one required `label`, which is both
  its accessible name and its tooltip, so the two cannot disagree.
- **A button that leads somewhere is a link.** `to` takes a `LinkTarget` from `@proedis/ui/core`
  (`{ href, go() }`): the button renders an `<a href>`, a plain click calls `go()`, the middle click and
  a new tab still work. No router and no provider in the package.
- **The form does not validate.** Errors come from the caller as `Field.Error`; after a submit the focus
  goes to the summary with two or more of them, to the field with one. `noValidate` is always on.
- **The field is made of parts**, in any order: each finds its row by its slot. Inside a `Form.Section`
  fields share three tracks per row (labels, controls, messages), so the controls stay aligned when a
  label wraps. A custom control reads `required`, `invalid` and `disabled` with `useFieldControl()`.
  Out of a section, `orientation={{ base: 'vertical', md: 'horizontal' }}` puts the label beside the
  control, on a third of the width, with the messages under the control. `Field.Label optional={t('…')}`
  writes the word after the name of a field that may stay empty: the package writes no text.
- **A control of your own wears `FieldShell`**: the border, the surface, the three heights, the states
  and the focus of a TextInput, with `leading` and `trailing`. Mark its focusable element
  `data-field-control`: the frame lights when that element has the focus, a press on the frame gives
  it the focus, and the error summary of a `Form` focuses it.

  ```tsx
  <Field>
    <Field.Label>Opening hours</Field.Label>
    <FieldShell leading={<Clock />}><TimeSlots data-field-control … /></FieldShell>
  </Field>
  ```
- **Mount `TooltipProvider` once**: it groups the tooltips, so a row of icon buttons is one gesture.
- **The layout props take a value per breakpoint**, as in the layout primitives: `Field` `span` and
  `breakBefore`, the `orientation` of `CheckboxGroup` and `RadioGroup`, `Button` `block`. A single
  `span` lets the section decide below 32rem of its own width (the short fields half a row, the others
  a whole one); a map is the caller's decision at every width of the window, and the section no longer
  steps in. `hideBelow` / `hideFrom` work on the controls, `Button`, `Alert`, `EmptyState`, `Tabs`,
  `SegmentedControl`, `Toggle`, `Switch`, `Avatar`, `AvatarGroup`, `Person`, `FiltersBar` and `Table`.

  ```tsx
  <Field span={{ base: 6, md: 3, xl: 2 }}>…</Field>
  <RadioGroup variant={'card'} orientation={{ base: 'vertical', md: 'horizontal' }}>…</RadioGroup>
  <Button type={'submit'} block={{ base: true, sm: false }}>Save</Button>
  ```

- **Under a finger the controls grow one step.** With `(pointer: coarse)` the three heights become
  36, 40 and 44px, for every control and button at once: the size of a control is a matter of the
  pointer, not of the width, so `size` takes one value. An application that redeclares
  `--spacing-control-*` keeps its values on every device, and redeclares them inside its own
  `@media (pointer: coarse)` for touch.
- **Values are plain data.** A date is `"2026-11-16"`, never a `Date`; a number is `number | null`,
  where empty is not zero; a Select holds a key and a Combobox a key plus the record it shows.
- **The lists keep the user's data.** A letter on a closed Select opens it and never changes the
  value; leaving a Combobox without choosing gives the value back, and Esc never empties it.
- **What is typed is checked as typed.** NumberInput refuses what would not make a number in the
  language (in Italian a typed `1.5` is not 15) and takes a paste whole or not at all; DatePicker
  writes its separators itself and reports a half or impossible date on leaving, through
  `onValidityChange`, for the caller to word. A period is one field, `09/11/2026 – 22/11/2026`,
  typed in a row: the end starts with the first digit after the year. A click in the text opens
  the calendar and leaves the focus there to type; Alt ↓ moves into the grid.
- **Nothing is uploaded.** FileUpload checks the files and gives back the reasons as codes; the
  caller sends the ready ones when the form is confirmed.
- **Disabled stays reachable.** A disabled Toggle, segment, tab or menu item keeps its place in the
  arrow cycle and shows its reason in a tooltip; the change is cancelled instead.
- **Popover, Dialog and Drawer render no `<form>`.** A `Form` inside takes their id, and their
  `.Submit` in the footer points at it: Enter in a field submits, two forms never nest.
- **One gate to close a dialog.** The x, Cancel and Esc pass through it: nothing closes while saving,
  `dirty` opens the discard prompt first, a click outside closes only a detail and otherwise jolts the
  panel. A dialog opened from inside another, rendered inside it, sits 120px from the top over a
  lighter veil. The focus goes back to the control that opened it.
- **A menu item acts after the menu has closed**, with the focus back on its trigger, so a dialog it
  opens returns the focus there.
- **The notifications are an object you create once**: `createNotifications()` gives the `notify`
  (the confirmation) and `jobs` (the long work and the errors with no place) your modules call;
  `NotificationsProvider` draws them and `JobsButton` keeps the history.
- **The table owns no data and no address.** `Table` runs on TanStack Table 9: a real `<table>`, a
  grid with one Tab stop, sorting on two columns at most (Shift adds the second), pages, the columns
  a user hides, a selection kept outside the engine (by ids, or every row of a filter but a few), the
  ⋯ of a row with two frequent actions in view, the right click. Each slice of its state is
  controlled or internal, and one `onStateChange(state, change)` tells the page what changed, to
  write to its address or to ask the server. `sortingToFields` turns the order into the server's
  fields; the hook that loads the rows adds the id at the end, so a row never shows on two pages.
- **The values of a column read through one provider.** A column declares its kind (`code`,
  `reference`, `person`, `text`, `enum`, `status`, `date`, `datetime`, `number`, `boolean`, and
  `custom` as the way out), and `TableFormatsProvider`, mounted once with the application's
  formatters, says how dates, numbers and enum labels read. The package knows no formatter.
- **A detail lines up with its form.** `Detail.Grid` has the six columns of `Form.Section`, and a
  `Detail.Item` takes the columns of the field of its `type` (`DETAIL_SPAN`, built on `FIELD_SPAN`):
  in edit the fields take the place of the values and nothing moves. A value that is not there reads
  "—" with `labels.empty` as its name; `copyable` adds a button that copies the text of the value and
  announces it. A section that arrives from a call of its own takes `loading`, or `error` and
  `onRetry`, and the rest of the detail stays.
- **A section that closes is a heading with a button.** `CollapsibleSection` is closed by default and
  remembers nothing; `status` is a mark after the title, `meta` the summary on the right, with the
  unit, and `actions` sit outside the button. No animation of the height. `keepMounted` keeps a body
  of fields mounted while closed; `inset` runs the header edge to edge of a card.
- **A grid of boxes is one field.** `CheckboxGrid` holds item id → checked column ids, takes the rules
  between the columns as `resolve`, and the search as `visibleItems`, since only the caller knows the
  text of its labels. Every group is a `CollapsibleSection` whose summary (`labels.groupMeta`) counts
  the items ticked by hand; open, its first row carries a parent box per column, computed on the
  editable items only. Tab goes from header to header and enters each open grid once, the arrows move
  inside. `locked` columns are decided by the system, `savedValue` marks the boxes and groups that
  changed, every change is announced, `readOnly` is for consultation.
- **The filters hold no value either.** `FiltersBar` takes each filter's value and change from the
  page: a list (one value or several), a list searched on the server (the panel of the Combobox),
  a period from the calendar alone. The buttons never shrink: the ones that do not fit go into "More
  filters", counted again when the width changes or a list closes, never with a list open.
- **A choice from a list of records is a dialog.** `ModalSelector` is a Dialog `lg` with the search,
  the filters and a count line on top and a compact table under it, built from the Table's own
  pieces; the focus stays in the search and the arrows move the rows. With several values the choices
  survive a new search, and closing with choices not confirmed asks first. `ModalSelectorField` is
  the field that opens it, with the shape of the Combobox.

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
exported for exactly this: `StrictIconBoxProps` to extend, `IconBoxProps` to forward.

⚠️ The `cva` functions themselves (`iconBoxVariants`, `badgeVariants`, …) are **not** exported, and
that is on purpose: they are the implementation of a variant matrix, not a contract. Compose the
component, or reach for the `data-*` rule above when what you want is the classes.

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
| `--muted` | the `muted` tone, the hover of an interactive `Item`, a recessed `Surface.Footer` |
| `--muted-foreground` | a quiet label, a divider caption, the scrollbar thumb |
| `--border` | `Divider`, and the rules `Stack divided` draws |
| `--radius-scale` | a unitless multiplier over the whole `--radius-*` scale |
| `--container-8xl` | the width of `Container size='xl'`, one step past Tailwind's own scale |
| `--text-2xs` | the step below `text-xs`: the description line of `Label`, the smallest `Heading.Eyebrow` and `Heading.Description`, a `sm` `Badge` |

The last three are a **configuration** rather than a colour a component reads: they exist to be
turned. `--container-8xl` is there because Tailwind's container scale stops at `7xl` (80rem) and the
widest page this package offers is 96rem, the width of the `2xl` breakpoint. `--text-2xs` is there
because a three level text hierarchy does not fit in Tailwind's scale: a label, a description under
it and a value need three sizes, and the scale offers 12px and 14px with nothing between or below.
Four places read it today, which is why it is a declared step and not a one-off.
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
| Controls | `--input` (the **border** of a form control), `--input-hover`, `--placeholder`, `--ring` (the focus ring), the heights `--spacing-control-sm`, `-md`, `-lg` |
| Soft register | `--{tone}-soft` and `--{tone}-soft-foreground` for the seven tones. **Optional**: undeclared, they fall back to a tenth of the tone (half of the surface for `muted` and `secondary`) with the tone as ink, resolved where they are used, so a subtree that redefines a tone is followed |
| Layers | `--state-hover`, `--state-pressed`: the veil over a solid coloured fill |
| Tooltip | `--tooltip`, `--tooltip-foreground`, `--tooltip-muted-foreground` |
| Stacking | `--z-dialog`, `--z-popover`, `--z-toast`, `--z-tooltip`, read by the `z-dialog` … `z-tooltip` utilities |
| Switch | `--switch-off`, the track of a switch that is off: a surface, not a line |
| Overlays | `--overlay`, `--overlay-nested` (the veils under a dialog and under a dialog opened from it), `--scroll-shade` (the inner shadow of a body that scrolls), `--busy-veil` (what covers a panel that waits). Each has a default, so declaring them is optional |
| Positions written at run time | `--drawer-inset` (the room an open drawer takes, for the notifications) and `--avatar-ring` (the ring of a grouped avatar, `card` unless a container sets it) |

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
| Tailwind | `^4.1.5` — the stylesheet uses `@source`, `@source inline`, `@theme inline`, `@utility` and `@custom-variant`, and the error mark is one line tall with `h-lh` |
| TypeScript | `>=5.2.0`, the suite floor — the emitted declarations are compiled against it |
| Runtime | ES2022. The package root is server-renderable; `/hooks` and `/interactive/*` are client-only |
| Base UI | `^1.7.0`, optional, for `/interactive/*` only |
| dayjs | `^1.11.0`, optional, for `/interactive/date-picker`, `/interactive/filters-bar`, `/interactive/modal-selector` |
| TanStack Table | `^9.3.1`, optional, for `/interactive/table` only |

## 📄 License

MIT © [Proedis S.r.l.](https://proedis.net)
