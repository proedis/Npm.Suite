export * from './describe-field';

export * from './field-descriptor.types';

export * from './unwrap-schema';

/**
 * `zod-internals` is deliberately NOT re-exported in full: it holds this package's structural view
 * of Zod's `def`, which is implementation and moves with Zod. Only `ZodTypeLike` crosses the
 * boundary, because four public signatures accept it — it is what lets a caller hand over a schema
 * without this package ever importing Zod at runtime.
 */
export type { ZodTypeLike } from './zod-internals';
