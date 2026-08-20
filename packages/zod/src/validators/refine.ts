import type { z } from 'zod';


/* --------
 * Internal Types
 * -------- */

/**
 * The refinement context, reduced to the only thing these validators use.
 *
 * Typed structurally rather than against Zod's own context type: that type is internal, it changed
 * shape between majors, and one method is all this needs.
 */
export interface IssueSink {
  addIssue: (issue: any) => void;
}


/** A refinement expressed as "take the base validator, return a stricter one" */
export type DynamicRefine<TSchema extends z.ZodType> = (base: TSchema) => TSchema;


/* --------
 * API
 * -------- */

/**
 * Run a caller-supplied refinement against a value, forwarding its issues to the current context.
 *
 * This is the bridge that lets a nullable validator stay strict on the values that *are* there:
 * `nullableString(s => s.max(256))` must reject a 300-character string and accept `null`, which
 * plain `z.string().max(256).nullable()` cannot express — the max would apply to the union, and a
 * transform to `null` would be validated as a string.
 *
 * The base validator is rebuilt and parsed on its own, and every issue it produces is added to the
 * outer context, so error messages and paths come out identical to a direct validation.
 *
 * @param value - The value to validate. Skipped when nullish, which is the point of "nullable".
 * @param context - The refinement context handed over by `superRefine`.
 * @param base - The validator the refinement starts from.
 * @param refine - The refinement. Nothing happens when it is not provided.
 */
export function applyDynamicRefine<TSchema extends z.ZodType>(
  value: unknown,
  context: IssueSink,
  base: TSchema,
  refine?: DynamicRefine<TSchema>
): void {
  if (value === null || value === undefined || typeof refine !== 'function') {
    return;
  }

  const result = refine(base).safeParse(value);

  if (!result.success) {
    /** `issues`, not `errors`: Zod 4 removed the alias the Zod 3 version of this code used */
    result.error.issues.forEach(issue => context.addIssue(issue));
  }
}
