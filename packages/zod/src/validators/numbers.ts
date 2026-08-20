import { z } from 'zod';

import { applyDynamicRefine } from './refine';

import type { DynamicRefine } from './refine';


/* --------
 * Validators
 * -------- */

/**
 * A nullable number that accepts what an input actually produces.
 *
 * A text input hands over strings, an emptied one hands over `''`, and a half-typed one hands over
 * something that is not a number at all. This validator takes all of them and answers with a number
 * or `null` — which is the alternative to `z.coerce.number()`, whose `NaN` reaches the form as a
 * validation error nobody can read.
 *
 * ```ts
 * const schema = z.object({
 *   discount: nullableNumber(n => n.min(0).max(100)).describe('Sconto')
 * });
 * ```
 *
 * @param refine - Applied only once a real number came out, so `null` is never measured against a
 *  `min`.
 */
export function nullableNumber(refine?: DynamicRefine<z.ZodNumber>) {
  return z.number().nullish().or(z.string().nullish())
    .transform<number | null>((maybeNumber) => {
      if (typeof maybeNumber === 'number') {
        return maybeNumber;
      }

      if (typeof maybeNumber !== 'string' || maybeNumber.trim() === '') {
        return null;
      }

      const parsed = Number(maybeNumber);

      return Number.isNaN(parsed) ? null : parsed;
    })
    .superRefine((value, context) => {
      applyDynamicRefine(value, context, z.number(), refine);
    });
}
