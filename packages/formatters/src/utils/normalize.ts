/**
 * Coerce a value into a finite number, falling back when it cannot be one.
 *
 * The fallback covers every way a number can fail to arrive: `null`, `undefined`, a string that does
 * not parse, `NaN` and both infinities. Formatters run in a render path, where returning the fallback
 * is always better than propagating `NaN` into the output.
 *
 * @param value The value to coerce
 * @param base The value to return when coercion fails
 *
 * @example
 * normalizeNumber('12.5');      // 12.5
 * normalizeNumber(null);        // 0
 * normalizeNumber('abc');       // 0
 * normalizeNumber(undefined, 1) // 1
 * normalizeNumber(Infinity);    // 0
 */
export function normalizeNumber(value: any, base: number = 0): number {
  /** Check num exists */
  if (value == null) {
    return base;
  }

  /** Parse as Number */
  const parsed: number = typeof value !== 'number' ? Number(value) : value;

  /** Return num if valid or base */
  return !Number.isFinite(parsed) ? base : parsed;
}


/**
 * Coerce a value into a finite integer, truncating rather than rounding.
 *
 * @param value The value to coerce
 * @param base The value to fall back to when coercion fails, itself truncated
 *
 * @example
 * normalizeInteger('12.9');   // 12, truncated and not rounded
 * normalizeInteger(-12.9);    // -12, truncated towards zero
 * normalizeInteger(null);     // 0
 */
export function normalizeInteger(value: any, base: number = 0): number {
  /** Normalize value */
  const parsed = normalizeNumber(value, base);

  /** Return the integer part of Number */
  return Math.trunc(parsed);
}


/**
 * Coerce a value into a number and render it with a fixed number of decimals.
 *
 * Rounding is done by scaling through a power of ten and calling `Math.round`, then rendering with
 * `toFixed` so trailing zeros are kept. That differs from calling `toFixed` alone in two ways, both
 * of them observable:
 *
 * - the result follows the **decimal** value a reader sees rather than its binary representation:
 *   `0.615` scales to `61.50000000000001` and rounds up to `0.62`, where `(0.615).toFixed(2)` sees
 *   the true stored value `0.6149…` and gives `0.61`
 * - halves round towards **positive infinity**, not away from zero: `-2.5` becomes `-2`, where
 *   `(-2.5).toFixed(0)` gives `-3`
 *
 * @param value The value to render
 * @param precision How many decimals to keep, coerced to an integer
 * @returns The rendered number, always using `.` as the decimal separator
 *
 * @example
 * normalizeNumberWithPrecision(1.239, 2);   // '1.24'
 * normalizeNumberWithPrecision(0.615, 2);   // '0.62', where toFixed would give '0.61'
 * normalizeNumberWithPrecision(1, 2);       // '1.00', trailing zeros kept
 * normalizeNumberWithPrecision('abc', 2);   // '0.00'
 */
export function normalizeNumberWithPrecision(value: any, precision: any): string {
  /** Normalize Value and Precision */
  const parsedValue = normalizeNumber(value);
  const parsedPrecision = normalizeInteger(precision);

  /** Use POW to fix a number */
  const pow = 10 ** parsedPrecision;

  return normalizeNumber((Math.round(parsedValue * pow) / pow)).toFixed(parsedPrecision);
}
