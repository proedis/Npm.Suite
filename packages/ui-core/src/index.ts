/**
 * @proedis/ui-core
 *
 * The headless half of a Tailwind interface: the layout primitives every application rewrites, with
 * responsive props over a typed scale, plus the token contract they read.
 *
 * The hooks live behind `@proedis/ui-core/hooks` and **not** here on purpose: everything exported
 * from this entry point is renderable from a React Server Component, and a barrel that re-exported a
 * hook would take that away.
 *
 * ⚠️ Import the stylesheet into your Tailwind entry CSS, or none of this has any CSS behind it:
 *
 * ```css
 * @import 'tailwindcss';
 * @import '@proedis/ui-core/ui-core.css';
 * ```
 */

export * from './components';

export * from './lib';
