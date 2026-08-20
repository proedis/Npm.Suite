import { z } from 'zod';

import { applyDynamicRefine } from './refine';

import type { DynamicRefine } from './refine';


/* --------
 * Helpers
 * -------- */

/**
 * Truncate a date to the first or the last millisecond of its day, **in the runtime's timezone**.
 *
 * The local day is the intended semantics, not an oversight: a user picking "20 August" on a date
 * picker means their own 20 August, and a range whose bounds were truncated in UTC would drop the
 * first or the last two hours of it depending on the season. The backend receives an instant and
 * stores it in UTC; the truncation belongs on the side that knows what day the user was looking at.
 */
function truncateDay(value: Date, edge: 'end' | 'start'): Date {
  const truncated = new Date(value.getTime());

  if (edge === 'start') {
    truncated.setHours(0, 0, 0, 0);
  }
  else {
    truncated.setHours(23, 59, 59, 999);
  }

  return truncated;
}


function dateOnlyValidator<TNullable extends boolean>(
  nullable: TNullable,
  edge: 'end' | 'start',
  refine?: DynamicRefine<z.ZodDate>
) {
  const base = nullable ? z.date().nullish() : z.date();

  return base
    .transform(value => (value === null || value === undefined ? null : truncateDay(value, edge)))
    .superRefine((value, context) => {
      applyDynamicRefine(value, context, z.date(), refine);
    });
}


/* --------
 * Validators
 * -------- */

/**
 * A required date truncated to the start of its day.
 *
 * @param refine - Applied to the truncated value, so a `min` compares like with like.
 */
export function requiredStartDateOnly(refine?: DynamicRefine<z.ZodDate>) {
  return dateOnlyValidator(false, 'start', refine);
}


/** A nullable date truncated to the start of its day. See `requiredStartDateOnly`. */
export function nullableStartDateOnly(refine?: DynamicRefine<z.ZodDate>) {
  return dateOnlyValidator(true, 'start', refine);
}


/**
 * A required date truncated to the **end** of its day.
 *
 * The pair of `requiredStartDateOnly` for the closing bound of a range: an interval ending at
 * midnight excludes the day the user picked, which is the off-by-one every range filter reinvents.
 *
 * @param refine - Applied to the truncated value.
 */
export function requiredEndDateOnly(refine?: DynamicRefine<z.ZodDate>) {
  return dateOnlyValidator(false, 'end', refine);
}


/** A nullable date truncated to the end of its day. See `requiredEndDateOnly`. */
export function nullableEndDateOnly(refine?: DynamicRefine<z.ZodDate>) {
  return dateOnlyValidator(true, 'end', refine);
}
