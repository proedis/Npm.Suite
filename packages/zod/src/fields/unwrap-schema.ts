import { WRAPPER_TYPES } from './zod-internals';

import type { ZodTypeLike } from './zod-internals';


/* --------
 * Types Definition
 * -------- */
export interface UnwrappedSchema {
  /** The innermost schema, with every wrapper peeled off */
  schema: ZodTypeLike;

  /** `true` when any level accepted `undefined` */
  optional: boolean;

  /** `true` when any level accepted `null` */
  nullable: boolean;

  /** `true` when any level was a `z.readonly()` */
  readOnly: boolean;

  /** The default declared by the outermost `.default()` found */
  defaultValue?: unknown;

  /** `true` when a default was declared, even when that default is `undefined` */
  hasDefault: boolean;

  /** The first `.describe()` found, walking outside in */
  description?: string;
}


/* --------
 * API
 * -------- */

/**
 * Peel every wrapper off a schema, collecting what each one contributes on the way down.
 *
 * Two Zod shapes are handled that a naive walker gets wrong:
 *
 * - **`.transform()` produces a `pipe`**, not a wrapper. The form cares about the *input* side of
 *   the pipe — what the user types — so the walk follows `def.in`. This is what makes a validator
 *   like `z.string().trim().transform(v => v || null)` still describe itself as a string.
 * - **`.describe()` lands on whichever level it was called on.** `z.string().describe('x').nullable()`
 *   and `z.string().nullable().describe('x')` are both common, so the first description found from
 *   the outside wins and the walk keeps going.
 *
 * @param schema - Any Zod schema.
 */
export function unwrapSchema(schema: ZodTypeLike): UnwrappedSchema {

  // ----
  // Internal State
  // ----
  const result: UnwrappedSchema = {
    hasDefault: false,
    nullable  : false,
    optional  : false,
    readOnly  : false,
    schema
  };


  // ----
  // Walk
  // ----
  let current: ZodTypeLike = schema;

  /** A malformed schema must not hang the render: bail out after a sane number of levels */
  for (let depth = 0; depth < 32; depth += 1) {
    if (result.description === undefined && current.description !== undefined) {
      result.description = current.description;
    }

    const { type } = current.def;

    if (WRAPPER_TYPES.has(type)) {
      if (type === 'optional') {
        result.optional = true;
      }

      if (type === 'nullable') {
        result.nullable = true;
      }

      if (type === 'readonly') {
        result.readOnly = true;
      }

      if (type === 'default' || type === 'prefault') {
        result.defaultValue = current.def.defaultValue;
        result.hasDefault = true;
      }

      /** `nonoptional` deliberately does not reset the flags: it narrows the type, not the intent */
      const inner = current.def.innerType;

      if (!inner) {
        break;
      }

      current = inner;
      continue;
    }

    if (type === 'pipe') {
      const input = current.def.in;

      if (!input) {
        break;
      }

      current = input;
      continue;
    }

    break;
  }

  result.schema = current;

  return result;

}
