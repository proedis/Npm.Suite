---
name: proedis-ui-layout
description: "Compose screens with @proedis/ui (Proedis UI): install and import it, lay out with its primitives (Stack, Cluster, Grid, Split, Container, Center, Box) instead of hand-written flex, grid and gap classes, use the spacing scale by name and responsive maps per breakpoint, build cards and rows with Surface and Item, and import every interactive component from its own subpath. Use it whenever you write or change the markup of a React screen in a project that uses @proedis/ui, from a whole page to a toolbar."
---

# Laying out a screen with Proedis UI

Written for `@proedis/ui` 2. The package is the interface layer of the Proedis frontends: layout primitives, components
that read one token contract, interactive components on Base UI. Its rules make a screen shorter to write and to read;
code that ignores them still renders, and drifts from every other screen.

## Setup, once per application

React 19 and Tailwind CSS 4.1.5 or later. `@base-ui/react` is an optional peer, needed as soon as you use an
interactive component (nearly always); the date components want `dayjs`, the table `@tanstack/react-table`.

```bash
yarn add @proedis/ui @base-ui/react
```

One line after Tailwind, in the entry stylesheet. It brings the tokens and tells Tailwind to scan the package: nothing
else to configure.

```css
@import 'tailwindcss';
@import '@proedis/ui';
```

Import `@proedis/ui` (the full sheet), never `@proedis/ui/ui.css` alone: with the narrow sheet every tone of every
component has no CSS behind it, and nothing reports it.

## Imports

- The package root `@proedis/ui` holds the layout primitives, the primitives and the static display components. It
  stays renderable from a React Server Component.
- Every interactive component has its own subpath, by section: `@proedis/ui/actions/button`,
  `@proedis/ui/forms/text-input`, `@proedis/ui/overlays/dialog`, `@proedis/ui/data/table`. There is no barrel per
  section, on purpose: each subpath brings only its own peers.
- Static display components have subpaths too (`@proedis/ui/display/surface`, `display/item`, `display/heading`).

## The workflow

1. **Containers are primitives.** A column, a row or a grid of equal columns is a `Stack`; a row that wraps (tags,
   actions, filters) is a `Cluster`; as many columns as fit is a `Grid`; a fixed rail beside a flexible pane is a
   `Split`; the page column is a `Container`. Not `className={'flex flex-col gap-4'}` for what a primitive covers: the
   props say the same thing where a reader scans for it, and follow the theme. Four layouts are beyond the
   primitives on purpose: named grid tracks or a subgrid, columns counted from the data, a different gap across and
   along, a display switched by a container query. Write those with classes, using the theme's values, and keep a
   card a `Surface` and a row an `Item` inside them.
2. **Space by name.** `gap`, and every spacing prop, takes `xs`, `sm`, `md`, `lg`, `xl`, `2xl`. Each name is a variable
   of the theme (`--space-md`), so a product retunes every `md` at once. `Stack`, `Grid` and `Split` default to `md`,
   `Cluster` to `sm`; write `gap={0}` when the children must touch. The same names work in classes: `gap-md`, `p-md`,
   `-mx-md`, `top-md`, `h-md`.
3. **Responsive is a map, written where the component is used.** Layout props take one value or one per breakpoint,
   mobile first: `{ base, sm, md, lg, xl, '2xl' }` at 640, 768, 1024, 1280 and 1536px. Only layout props are
   responsive (`direction`, `gap`, `align`, `justify`, `columns`, a Field's `span`, a Button's `block`); a `size` or a
   `tone` is not.
4. **Meaning through `as`.** A list of rows is `as={'ul'}`, a toolbar of links `as={'nav'}`; the types follow the
   element, so `as={'a'}` accepts `href`.
5. **A card is a `Surface`, a row is an `Item`.** `Surface.Header` (an Item), `Surface.Section`, `Surface.Footer`;
   `Item.Icon` and `Item.Heading` for the leading visual and the title. They own the truncation and the padding a
   hand-written card gets wrong.
6. **Actions on a row: primary visible, secondary in the menu, three things to press at most.** The actions used on
   most rows are `IconButton`s in `Item.Actions` (their `label` is the tooltip, name the record in it); the others,
   and every destructive one, are items of a `Menu` whose `aria-label` names the record. Up to three icon buttons, or
   two and the trigger of the menu.

```tsx
import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';

export function RoundsPage(): React.ReactNode {
  return (
    <Stack gap={'lg'}>
      <Stack direction={{ base: 'vertical', md: 'horizontal' }} justify={'between'} gap={'sm'}>
        <Heading size={'lg'}>
          <Heading.Title>Rounds</Heading.Title>
          <Heading.Description>The collection rounds of this week</Heading.Description>
        </Heading>
        <Button>New round</Button>
      </Stack>

      <Stack columns={{ base: 1, sm: 2, lg: 3 }} gap={'md'}>
        <Surface>
          <Surface.Header>
            <Item.Heading>
              <Heading.Title>Chieri north</Heading.Title>
              <Heading.Description>96% of the stops covered</Heading.Description>
            </Item.Heading>
          </Surface.Header>
          <Surface.Footer>
            <Button fill={'plain'} tone={'muted'}>Open</Button>
          </Surface.Footer>
        </Surface>
      </Stack>
    </Stack>
  );
}
```

## Patterns

The documentation composes whole screens from these pieces, each with its example and the reasons behind it:
a page (header, figures, the list it is about), a list of records (rows with actions, or rows that open their
record), a record to read (Detail in a card or in a Drawer), a form in a drawer, empty and loading states. Start
from the pattern closest to the screen you are building.

## Pitfalls

- **No arbitrary values.** `size-[18px]`, `text-[13px]`, `max-w-[96rem]` have no name, so no theme can reach them.
  Use a token or a step of the scale; the React preset of `eslint-config-proedis` reports them.
- **`className` wins over a prop**: `gap={'md'} className={'gap-8'}` is a gap of 8, and whoever reads the props is
  misled. Change the prop.
- **`columns` fixes the count per breakpoint.** When the room should decide, a gallery of cards, use `Grid` with
  `minColWidth`.
- **A number in `gap` is a Tailwind step** (`gap={4}` is `gap-4`) and does not follow the theme; mixing it with names
  follows a retuned `md` only halfway.
- **Hiding by width** is `hideBelow` / `hideFrom` on any primitive (CSS: the children stay mounted). For a costly
  subtree, `useIsMobile` from `@proedis/ui/hooks` and render nothing.
- **No visible string ships in a component.** Every label, including `aria-label`, `loadingLabel` and the labels of a
  date picker, comes from you, in your language: when a prop is required, it is the text the user reads.

## Looking things up

When the Proedis UI MCP server is connected (`@proedis/mcp`): `search_docs` to find a component, `get_item_doc` for its
outline and then one section, `get_item_props` for its API. The patterns are pages too: `list_items` with group
`Patterns`, and the overview of the primitives is `ui-layout-overview`. Without it, the documentation for language models is at
https://platform.container.proedis.com/llms.txt, one Markdown file per page.
