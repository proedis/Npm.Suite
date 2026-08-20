import { z } from 'zod';

import { applyDynamicRefine } from './refine';

import type { DynamicRefine } from './refine';


/* --------
 * Validators
 * -------- */

/**
 * A nullable string that turns an empty value into `null`.
 *
 * The validator every optional text field needs: an untouched input hands over `''`, a backend
 * column expects `null`, and `z.string().nullable()` alone happily stores the empty string. It also
 * accepts `undefined`, because a form initialized from a partial DTO has holes.
 *
 * ```ts
 * const schema = z.object({
 *   note   : nullableString().describe('Nota'),
 *   summary: nullableString(s => s.max(256)).describe('Sommario')
 * });
 * ```
 *
 * @param refine - Applied only to values that survive as strings, so `null` is never measured
 *  against a `min`.
 */
export function nullableString(refine?: DynamicRefine<z.ZodString>) {
  return z.string().nullish()
    .transform(value => (value || null))
    .superRefine((value, context) => {
      applyDynamicRefine(value, context, z.string(), refine);
    });
}


/**
 * A required UUID.
 *
 * @param message - The message shown when the value is not a UUID. Left to the caller on purpose:
 *  a library that ships copy ships it in one language, and this validator guards a *selector* far
 *  more often than a text field — "you must choose a value" is the message that belongs here, and
 *  only the application knows how to say it.
 */
export function requiredUid(message?: string) {
  return message ? z.uuid(message) : z.uuid();
}


/**
 * A nullable UUID, for an optional relation.
 *
 * @param message - See `requiredUid`.
 */
export function nullableUid(message?: string) {
  return (message ? z.uuid(message) : z.uuid()).nullable();
}
