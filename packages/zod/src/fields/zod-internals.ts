/* --------
 * Internal Types
 * -------- */

/**
 * The single file that knows how a Zod schema is shaped inside.
 *
 * Everything below is a **structural** view of Zod 4's `def` plus its public convenience accessors
 * — never an `instanceof` check. That is the whole point: the Zod 3 ancestor of this code was
 * written against class identities (`type instanceof z.ZodEffects`, `.innerType()`), which made it
 * both un-portable across Zod majors and dependent on a single Zod instance at runtime. Reading
 * `def.type` as a string keeps this package free of any runtime import of Zod.
 *
 * If a future Zod renames these, this file is the only place that breaks.
 */
export interface ZodCheckDef {
  check: string;
  format?: string;
  inclusive?: boolean;
  length?: number;
  maximum?: number;
  minimum?: number;
  pattern?: RegExp;
  value?: unknown;
}

export interface ZodCheckLike {
  _zod?: { def?: ZodCheckDef };
}

export interface ZodDefLike {
  checks?: ZodCheckLike[];
  defaultValue?: unknown;
  element?: ZodTypeLike;
  entries?: Record<string, string | number>;
  format?: string;
  in?: ZodTypeLike;
  innerType?: ZodTypeLike;
  options?: ZodTypeLike[];
  out?: ZodTypeLike;
  pattern?: RegExp;
  shape?: Record<string, ZodTypeLike>;
  type: string;
  values?: unknown[];
}

export interface ZodTypeLike {
  def: ZodDefLike;
  description?: string;

  /** Public accessors Zod exposes on the relevant types. Absent ones simply stay `undefined` */
  isInt?: boolean;
  maxDate?: Date | null;
  maxLength?: number | null;
  maxValue?: number | null;
  minDate?: Date | null;
  minLength?: number | null;
  minValue?: number | null;
}


/* --------
 * Constants Definition
 * -------- */

/** Wrappers that carry their payload in `def.innerType` and change nothing about the value's kind */
export const WRAPPER_TYPES = new Set([ 'optional', 'nullable', 'default', 'prefault', 'readonly', 'nonoptional', 'catch' ]);


/* --------
 * Helpers
 * -------- */

/** Normalize Zod's "no bound" `null` into `undefined`, so the value can be spread onto props */
export function orUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}


/** Read the definition of every check declared on a schema, skipping anything unrecognizable */
export function getCheckDefs(schema: ZodTypeLike): ZodCheckDef[] {
  return (schema.def.checks ?? [])
    .map(check => check._zod?.def)
    .filter((def): def is ZodCheckDef => !!def && typeof def.check === 'string');
}


/** Find the first check of a given kind */
export function findCheck(schema: ZodTypeLike, check: string): ZodCheckDef | undefined {
  return getCheckDefs(schema).find(def => def.check === check);
}
