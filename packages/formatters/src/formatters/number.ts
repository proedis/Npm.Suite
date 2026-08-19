import { instantiateFormatter } from '../helpers/create-formatters';

import { normalizeNumberWithPrecision, normalizeNumber, normalizeInteger } from '../utils/normalize';
import { escapeRegex } from '../utils/escape-regex';

import type { NumberFormatterConfiguration } from './number.types';


/* --------
 * Side Useful Private Functions
 * -------- */

/** Return the part of the number from start to first comma */
const getFirstCommaString = (num: string, sep: string, position: number): string => (
  position ? `${num.substring(0, position)}${sep}` : ''
);

/** Return number separated by commas */
const getCommaSubString = (num: string, sep: string, position: number): string => (
  num.substring(position).replace(/(\d{3})(?=\d)/g, `$1${sep}`)
);

/** Get Decimals part */
const getDecimals = (num: number, sep: string, precision: number): string => (
  precision
    ? `${sep}${normalizeNumberWithPrecision(Math.abs(num), precision).toString().split('.')[1]}`
    : ''
);


/* --------
 * Main Function
 * -------- */

/**
 * Format a number as a display string: thousand separators, fixed or flexible decimals, a prefix and
 * a suffix, all arranged by a pattern.
 *
 * The pattern is what makes the arrangement the caller's choice rather than the formatter's. It holds
 * four placeholders — `%p` prefix, `%m` minus sign, `%n` number, `%s` suffix — and defaults to
 * `'%p %m %n %s'`. Runs of whitespace collapse to one space and the result is trimmed, so an unused
 * placeholder leaves no gap behind.
 *
 * @param value The number to format, coerced through the usual rules
 * @param config How to render it
 *
 * @example
 * formatNumber(1234.5678, { precision: 2 });                        // '1,234.57'
 * formatNumber(1234.5, { decimalSeparator: ',', thousandSeparator: '.' }); // '1.235'
 * formatNumber(-1234.5, { precision: 2, prefix: '€' });             // '€ - 1,234.50'
 *
 * @example
 * // the default pattern puts a space around the minus sign, which is rarely what a currency wants
 * formatNumber(-1234.5, { precision: 2, prefix: '€', pattern: '%p%m%n' }); // '€-1,234.50'
 *
 * @example
 * // flexible decimals drop trailing zeros, down to minPrecision
 * formatNumber(1.5, { precision: 4, flexibleDecimals: true });                     // '1.5'
 * formatNumber(1.5, { precision: 4, flexibleDecimals: true, minPrecision: 2 });    // '1.50'
 * formatNumber(1, { precision: 4, flexibleDecimals: true, minPrecision: 2 });      // '1.00'
 */
export function formatNumber(value: number, config?: NumberFormatterConfiguration): string {
  /** Get Configuration */
  const {
    decimalSeparator = '.',
    flexibleDecimals = false,
    minPrecision = 0,
    pattern = '%p %m %n %s',
    precision,
    prefix = '',
    suffix = '',
    thousandSeparator = ','
  } = config ?? {};

  /** Normalize Number */
  const parsedValue = normalizeNumber(value);
  const parsedPrecision = normalizeInteger(Math.abs(precision || 0), 0);
  const parsedMinPrecision = normalizeInteger(Math.abs(minPrecision), 0);

  /**
   * Get Data.
   *
   * Everything below works off the normalized value, never off the raw argument: they used to differ,
   * so a value arriving as something other than a number could be normalized for the sign test and
   * left raw for the integer part.
   */
  const isNegative = parsedValue < 0;
  const base = parseInt(normalizeNumberWithPrecision(Math.abs(parsedValue), parsedPrecision), 10).toString();
  const mod = base.length > 3 ? base.length % 3 : 0;

  /** Build the Formatted Number */
  let formatted = [
    getFirstCommaString(base, thousandSeparator, mod),
    getCommaSubString(base, thousandSeparator, mod),
    getDecimals(parsedValue, decimalSeparator, parsedPrecision)
  ].join('');

  /** Check if decimals are flexible */
  if (flexibleDecimals && (precision || 0) > 0) {
    /** Build the RegEx */
    const escapedSeparator = escapeRegex(decimalSeparator);
    const regex = new RegExp(`(${escapedSeparator}0*[^0]+)(0+$)|(${escapedSeparator}0+$)|(${escapedSeparator}$)`);
    /** Replace leading 0 */
    formatted = formatted.replace(regex, '$1');
    /** If minPrecision differ from 0, check decimal count */
    if (parsedMinPrecision !== 0) {
      const [ integer, replacedDecimals ] = formatted.split(decimalSeparator);
      const newDecimals = !replacedDecimals || replacedDecimals.length < parsedMinPrecision
        ? (replacedDecimals ?? '').padEnd(parsedMinPrecision, '0')
        : replacedDecimals;
      /** Reassign formatted number */
      formatted = [ integer, newDecimals ].join(decimalSeparator);
    }
  }

  /** Return the formatted string */
  return pattern
    .replace(/%p/g, prefix)
    .replace(/%m/g, isNegative ? '-' : '')
    .replace(/%n/g, formatted)
    .replace(/%s/g, suffix)
    .replace(/\s+/g, ' ')
    .trim();
}


/* --------
 * Formatter Instantiation
 * -------- */

/**
 * Build a number formatter that carries its own defaults.
 *
 * @example
 * const currency = formatNumber.create({ precision: 2, prefix: '€', pattern: '%p%m%n' });
 *
 * currency(1234.5);                    // '€1,234.50'
 * currency(1234.5, { prefix: '$' });   // per call override
 *
 * const compact = currency.create({ thousandSeparator: '' }); // and it nests
 */
formatNumber.create = instantiateFormatter<typeof formatNumber, number, NumberFormatterConfiguration>(formatNumber);
