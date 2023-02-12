import { normalizeNumber } from '../utils/normalize';


/* --------
 * Main Function
 * -------- */

/** Format a number returning a string with number and singular/plural suffix */
export function pluralize(
  value: string | number | null,
  ifSingular: string | ((value: number) => string),
  ifPlural: string | ((value: number) => string)
): string {
  /** Normalize the number value */
  const _val = normalizeNumber(value, 0);

  /** Get the right suffix creator choosing from singular/plural variation */
  const suffix = _val === 1 ? ifSingular : ifPlural;

  /** Return formatted string */
  return typeof suffix === 'string' ? `${_val} ${suffix}` : suffix(_val);
}

/* --------
 * Formatter Instantiation
 * -------- */

/** Instantiate a formatter with default configuration */
pluralize.create = (
  ifSingular: string | ((value: number) => string),
  ifPlural: string | ((value: number) => string)
) => (
  (value: any) => pluralize(value, ifSingular, ifPlural)
);
