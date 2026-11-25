/**
 * @proedis/ui
 *
 * The interface layer every Proedis frontend starts from: the class machinery, the layout
 * primitives, the components on top of them, and the stylesheet behind all of it.
 *
 * This barrel re-exports the sections a page can render on a server and that need no optional peer:
 *
 * | Section | Also at | What is in it |
 * | --- | --- | --- |
 * | core | `@proedis/ui/core` | `cn`, the shared props, the polymorphic props, the responsive machinery, the tones. **No JSX** |
 * | layout | `@proedis/ui/layout` | `Box`, `Stack`, `Grid`, `Container`, `Split`, …: *where things are* |
 * | primitives | `@proedis/ui/primitives` | `Divider`, `Label`, `ScrollArea`, `Spinner`, … |
 * | display | `@proedis/ui/display/<name>` | `Badge`, `Heading`, `IconBox`, `Item`, `Surface`, …: *what things look like* |
 *
 * So `@proedis/ui` alone is enough to start; a subpath says which section an import comes from. What
 * is **not** here, on purpose: `@proedis/ui/hooks`, and every component with behaviour (`Person` and
 * the subpaths of actions, feedback, forms, overlays and data), which run on Base UI and are client
 * only. Everything reachable from this entry point stays renderable from a React Server Component,
 * and `release:verify` fails if it ever reaches an optional peer.
 *
 * ⚠️ Import the stylesheet into your Tailwind entry CSS, or none of this has any CSS behind it:
 *
 * ```css
 * @import 'tailwindcss';
 * @import '@proedis/ui';            // the full vocabulary, theme.css
 * @import '@proedis/ui/ui.css';     // …or only the five tokens of the layout
 * ```
 */

export * from './core';

export * from './layout';

export * from './primitives';

export * from './display/badge';

export * from './display/badge-counter';

export * from './display/badge-dot';

export * from './display/heading';

export * from './display/icon-box';

export * from './display/item';

export * from './display/labeled-content';

export * from './display/surface';
