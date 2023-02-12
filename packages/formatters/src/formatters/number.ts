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

/** Format a number using configuration */
export function formatNumber(num: number, config?: NumberFormatterConfiguration): string {
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
  const _num = normalizeNumber(num);
  const _precision = normalizeInteger(Math.abs(precision || 0), 0);
  const _minPrecision = normalizeInteger(Math.abs(minPrecision), 0);

  /** Get Data */
  const isNegative = _num < 0;
  const base = parseInt(normalizeNumberWithPrecision(Math.abs(num), _precision), 10).toString();
  const mod = base.length > 3 ? base.length % 3 : 0;

  /** Build the Formatted Number */
  let formatted = [
    getFirstCommaString(base, thousandSeparator, mod),
    getCommaSubString(base, thousandSeparator, mod),
    getDecimals(_num, decimalSeparator, _precision)
  ].join('');

  /** Check if decimals are flexible */
  if (flexibleDecimals && (precision || 0) > 0) {
    /** Build the RegEx */
    const escapedSeparator = escapeRegex(decimalSeparator);
    const regex = new RegExp(`(${escapedSeparator}0*[^0]+)(0+$)|(${escapedSeparator}0+$)|(${escapedSeparator}$)`);
    /** Replace leading 0 */
    formatted = formatted.replace(regex, '$1');
    /** If minPrecision differ from 0, check decimal count */
    if (_minPrecision !== 0) {
      const [ integer, replacedDecimals ] = formatted.split(decimalSeparator);
      const newDecimals = !replacedDecimals || replacedDecimals.length < _minPrecision
        ? (replacedDecimals ?? '').padEnd(_minPrecision, '0')
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

/** Instantiate a formatter with default configuration */
formatNumber.create = instantiateFormatter<typeof formatNumber, number, NumberFormatterConfiguration>(formatNumber);
