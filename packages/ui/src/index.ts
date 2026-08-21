/**
 * @proedis/ui
 *
 * The interface layer every Proedis frontend starts from: the class machinery, the layout
 * primitives, the components that read the token contract, and the stylesheet behind all of them.
 *
 * Three published subpaths, and the boundary between them is what each tier is allowed to know:
 *
 * | Subpath | What is in it | Rule |
 * | --- | --- | --- |
 * | `@proedis/ui/core` | `cn`, the shared props, the polymorphic props, the responsive machinery | **no JSX** |
 * | `@proedis/ui/layout` | `Box`, `Stack`, `Grid`, `Container`, `Split`, … | answers *where* |
 * | `@proedis/ui/components` | `Divider`, `Label`, `ScrollArea`, … | answers *what it looks like* |
 *
 * This barrel re-exports all three, so `@proedis/ui` alone is enough to start; reach for a subpath
 * when you want the import to say which tier you are in.
 *
 * The hooks live behind `@proedis/ui/hooks` and are **not** re-exported here on purpose: everything
 * reachable from this entry point stays renderable from a React Server Component.
 *
 * ⚠️ Import the stylesheet into your Tailwind entry CSS, or none of this has any CSS behind it:
 *
 * ```css
 * @import 'tailwindcss';
 * @import '@proedis/ui';            // the primitives and the five tokens they read
 * @import '@proedis/ui/theme.css';  // …or the full semantic vocabulary, which imports the above
 * ```
 */

export * from './core';

export * from './layout';

export * from './components';
