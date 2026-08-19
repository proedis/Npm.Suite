/**
 * @proedis/types
 *
 * Shared type primitives for the Proedis suite.
 *
 * Every exported type is paired with a runtime constant of the same name — `export type Nullable`
 * next to `export const Nullable = Object`. That is deliberate, and it is not a value you are
 * meant to use: it exists so that
 *
 *   import { Nullable } from '@proedis/types';
 *
 * stays safe at runtime. Without the constant, a consumer whose bundler strips types file by file
 * (esbuild, SWC, Babel — anything running under `isolatedModules`) keeps the import statement and
 * resolves a binding that was never emitted. TypeScript merges the type and the constant into one
 * name, so the type side is unaffected.
 *
 * Prefer `import type { … }` all the same: it makes the intent explicit and lets the import
 * disappear entirely.
 */

export * from './class';

export * from './generics';

export * from './objects';
