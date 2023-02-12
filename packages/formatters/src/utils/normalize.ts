/** Assert value is a number, or fallback to base */
export function normalizeNumber(num: any, base: number = 0): number {
  /** Check num exists */
  if (num == null) {
    return base;
  }
  /** Parse as Number */
  const _num: number = typeof num !== 'number' ? Number(num) : num;
  /** Return num if valid or base */
  return !Number.isFinite(_num) ? base : _num;
}

/** Transform a value into an integer or fallback to base */
export function normalizeInteger(num: any, base: number = 0): number {
  /** Normalize value */
  const _num = normalizeNumber(num, base);
  /** Return the integer part of Number */
  return Math.trunc(_num);
}

/** Transform a number with precision */
export function normalizeNumberWithPrecision(num: any, precision: any): string {
  /** Normalize Value and Precision */
  const _num = normalizeNumber(num);
  const _precision = normalizeInteger(precision);
  /** Use POW to fix a number */
  const pow = Math.pow(10, _precision);
  return normalizeNumber((Math.round(_num * pow) / pow)).toFixed(_precision);
}
