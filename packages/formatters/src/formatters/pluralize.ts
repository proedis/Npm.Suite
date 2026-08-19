import { normalizeNumber } from '../utils/normalize';


/* --------
 * Exported Types
 * -------- */

/**
 * One of the two forms of a pluralized label: a plain suffix appended after the count, or a function
 * taking full control of the rendered string.
 */
export type PluralizeVariation = string | ((value: number) => string);


/* --------
 * Main Function
 * -------- */

/**
 * Render a count together with the right singular or plural wording.
 *
 * The suffix form covers the common case — the count, a space, the word. The function form is for
 * everything the common case cannot express: a different word order, a language with more than two
 * plural forms, a value formatted some other way.
 *
 * Only an exact `1` counts as singular: `0` and any decimal take the plural, which is what English
 * and Italian both want.
 *
 * @param value The count, coerced through the same rules as every other formatter
 * @param ifSingular The wording for exactly one
 * @param ifPlural The wording for anything else
 *
 * @example
 * pluralize(1, 'file', 'files');    // '1 file'
 * pluralize(3, 'file', 'files');    // '3 files'
 * pluralize(0, 'file', 'files');    // '0 files'
 * pluralize(null, 'file', 'files'); // '0 files'
 *
 * @example
 * // the function form, when the count is not simply a prefix
 * pluralize(3, (n) => `only ${n} left`, (n) => `${n} in stock`);
 */
export function pluralize(
  value: string | number | null | undefined,
  ifSingular: PluralizeVariation,
  ifPlural: PluralizeVariation
): string {
  /** Normalize the number value */
  const count = normalizeNumber(value, 0);

  /** Get the right suffix creator choosing from singular/plural variation */
  const variation = count === 1 ? ifSingular : ifPlural;

  /** Return formatted string */
  return typeof variation === 'string' ? `${count} ${variation}` : variation(count);
}


/* --------
 * Formatter Instantiation
 * -------- */

/**
 * Build a pluralizer that already knows its two forms, leaving only the count to pass.
 *
 * @param ifSingular The wording for exactly one
 * @param ifPlural The wording for anything else
 *
 * @example
 * const files = pluralize.create('file', 'files');
 *
 * files(1);   // '1 file'
 * files(12);  // '12 files'
 */
pluralize.create = (
  ifSingular: PluralizeVariation,
  ifPlural: PluralizeVariation
) => (
  (value: string | number | null | undefined): string => pluralize(value, ifSingular, ifPlural)
);
