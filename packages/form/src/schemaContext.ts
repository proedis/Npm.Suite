import { optionalContextBuilder } from '@proedis/react';

import type { ZodTypeLike } from '@proedis/zod';


/* --------
 * Context Definition
 * -------- */

/** The schema of the bound form, when it has one: what a `BoundField` reads its props from */
export const [ BoundSchemaContext, useBoundSchema ] = optionalContextBuilder<ZodTypeLike | null>('BoundSchema', null);


/* --------
 * Schema Registry
 * -------- */

/**
 * The schema `useSchemaForm` built a form with, keyed by the form's `control`: an object react-hook-form
 * keeps for the whole life of the form. A `BoundForm` given that form finds its schema here, so the
 * schema is written once. Weak, so a form that goes away takes its entry with it.
 */
const SCHEMAS = new WeakMap<object, ZodTypeLike>();

export function registerSchema(control: object, schema: ZodTypeLike): void {
  SCHEMAS.set(control, schema);
}

export function schemaOf(control: object): ZodTypeLike | null {
  return SCHEMAS.get(control) ?? null;
}
