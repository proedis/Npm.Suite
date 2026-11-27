---
name: proedis-ui-theming
description: "Theme and restyle Proedis UI (@proedis/ui): give a product its colours, corners, spacing, control heights, fonts and dark mode by redeclaring the tokens of the package in plain CSS after its import, and restyle one variant of one component through its data-slot and data-* attributes. Use it when a project on @proedis/ui needs a brand, a denser area, taller controls, a dark theme, or a component that looks different, before reaching for className on every call site."
---

# Theming Proedis UI

Written for `@proedis/ui` 2. Components read a contract of semantic tokens, never a colour, with neutral defaults: an
application works before deciding anything. A product redeclares the tokens it cares about, and every component
follows.

## Where a value goes

**Plain CSS, on `:root`, after the import; `.dark` for the dark values. Never `@theme`.** The package's defaults are
unlayered, so a value written in `@theme`, `@theme inline` or `@layer base` loses to them and half of it is ignored
with no error. (Breakpoints are the one exception: they are Tailwind's, and they go in `@theme`.)

```css
@import 'tailwindcss';
@import '@proedis/ui';

:root {
  --primary: var(--color-emerald-600);
  --primary-foreground: white;
  --radius-scale: 1.25;
  --space-md: 1.25rem;
}

.dark {
  --primary: var(--color-emerald-400);
  --primary-foreground: var(--color-emerald-950);
}
```

## What to turn

- **A tone** is four variables: `--{tone}`, `--{tone}-foreground`, and the soft pair `--{tone}-soft`,
  `--{tone}-soft-foreground`. Seven tones: `primary`, `secondary`, `muted`, `success`, `warning`, `destructive`,
  `info`. Declare the surface and its ink together; the soft pair derives itself from the tone until you declare it.
  Any CSS colour works, a Tailwind colour through its variable included.
- **Corners**: `--radius-scale` multiplies every `rounded-*` step (1 is Tailwind's own scale). The corner of every
  control is `--control-radius`, a button can differ with `--button-radius`, the overlays share `--overlay-radius`.
  Write `rounded-sm`, never the bare `rounded`, which does not follow the scale.
- **Spacing**: `--space-xs` to `--space-2xl`, the names every `gap` and spacing prop takes. Redeclared on a wrapper,
  they make that region denser without a prop changed inside it.
- **Control heights**: `--spacing-control-sm`, `-md`, `-lg`, shared by every control of that size, so a field, a
  select and a button stay aligned. Under a coarse pointer each grows one step; redeclare them inside your own
  `@media (pointer: coarse)` to keep a different step for touch.
- **Fonts**: `--font-sans` for the text, `--font-heading` for the titles (the text family until declared), on `:root`.
  Load four weights, 400 to 700, or one variable font.
- **Dark mode is the class `.dark`** on any ancestor: it redeclares the tokens for its subtree and switches on the
  `dark:` variant. Set it from `prefers-color-scheme` before the first paint, or a dark page flashes white.

## Restyling one component

Every part carries a `data-slot`, and every resolved variant and state a `data-*`. Utilities live in a layer, so an
unlayered rule in your stylesheet wins with no `!important` and no call site touched:

```css
[data-slot='badge'][data-fill='soft'] {
  font-weight: 600;
}
```

The variables and the slots of a component are listed on its page, under Customization and Slots. In order of reach:
`className` for one element, a `data-*` rule for every instance of a variant, your own wrapper when the app simply has
other defaults, the token contract for the whole interface.

## Pitfalls

- **`@import '@proedis/ui/ui.css'` alone** is the layout tier: every tone of every component has no CSS behind it,
  silently. Import the package name.
- **A `className` on every button is a theme nobody can change.** Redeclare the token once.
- **Half a pair** (a `--warning` with no `--warning-foreground`) leaves every caller guessing the ink.
- **No arbitrary values** to get a length the scale lacks: retune the scale, or add a token with the component that
  reads it.

## Looking things up

When the Proedis UI MCP server is connected (`@proedis/mcp`): `get_item_theming` gives the variables a component reads
with their light and dark defaults, and its slots with their attributes; `get_item_doc` on `Theming` and
`Customization` for the whole contract. Without it: https://platform.container.proedis.com/llms/ui-foundations-theming.md.
