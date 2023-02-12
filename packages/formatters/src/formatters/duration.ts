import type { DurationFormatterConfiguration, DurationUnit } from './duration.types';

import { instantiateFormatter } from '../helpers/create-formatters';

import { normalizeNumber, normalizeNumberWithPrecision } from '../utils/normalize';

import { getDurationDictionary } from '../locales/duration';


/* --------
 * Constant Definition
 * -------- */
const UNIT_MS_LENGTH: Record<DurationUnit, number> = {
  y : 31557600000,
  mo: 2629800000,
  w : 604800000,
  d : 86400000,
  h : 3600000,
  m : 60000,
  s : 1000,
  ms: 1
};


/* --------
 * Side Useful Private Types
 * -------- */
interface DurationPart {
  unitCount: number;

  unitName: DurationUnit;
}


/* --------
 * Main Function
 * -------- */

/** Format a value as a duration */
export function formatDuration(value: any, config?: DurationFormatterConfiguration): string {
  /** Get Configuration */
  const {
    conjunction = null,
    decimals = null,
    delimiter = ', ',
    locale = 'en',
    largest = null,
    maxDecimals = 2,
    round = false,
    sourceUnit = 'ms',
    units = [ 'y', 'mo', 'w', 'd', 'h', 'm', 's' ]
  } = config || {};

  /** Normalize Number */
  let _value: number = Math.abs(normalizeNumber(value));

  /** Check if it must be transformed using source unit */
  if (sourceUnit !== 'ms') {
    _value *= UNIT_MS_LENGTH[sourceUnit];
  }

  /** Get the right dictionary */
  const dictionary = getDurationDictionary(locale);

  /** Override the Decimals Separator and Conjunction if defined */
  if (typeof decimals === 'string') {
    dictionary.decimals = () => decimals;
  }

  if (typeof conjunction === 'string') {
    dictionary.conjunction = () => conjunction;
  }

  /** Build parts container */
  const parts: DurationPart[] = [];

  const { length: unitsLength } = units;

  /** Loop each unit */
  for (let i = 0; i < unitsLength; i++) {
    const unitName = units[i];
    const unitMS = UNIT_MS_LENGTH[unitName];

    const unitCount: number = i !== unitsLength - 1
      ? Math.floor(_value / unitMS)
      : Number.isFinite(maxDecimals)
        ? parseFloat(normalizeNumberWithPrecision(_value / unitMS, maxDecimals))
        : _value / unitMS;

    /** Add Unit Piece */
    parts.push({ unitCount, unitName });

    /** Remove this count */
    _value -= unitCount * unitMS;
  }

  /** Check if it must round units */
  if (round) {
    let ratioToLargerUnit;
    let previousPiece;

    for (let i = parts.length; i > 0; i--) {
      const part = parts[i];
      part.unitCount = Math.round(part.unitCount);

      previousPiece = parts[i - 1];

      ratioToLargerUnit = UNIT_MS_LENGTH[previousPiece.unitName] / UNIT_MS_LENGTH[part.unitName];

      if ((part.unitCount % ratioToLargerUnit) === 0 || (largest && ((largest - 1) < (i - ratioToLargerUnit)))) {
        previousPiece.unitCount += part.unitCount / ratioToLargerUnit;
        part.unitCount = 0;
      }
    }
  }

  /** Build the result */
  const result: string[] = [];

  for (const piece of parts) {
    if (piece.unitCount) {
      result.push(dictionary[piece.unitName](piece.unitCount));
    }

    if (result.length === largest) {
      break;
    }
  }

  /** If result has no length, return 0 */
  if (!result.length) {
    return dictionary[units[unitsLength - 1]](0);
  }

  return [
    result.slice(0, -1).join(delimiter),
    result.slice(-1)
  ].join(dictionary.conjunction(0));
}


/* --------
 * Formatter Instantiation
 * -------- */

/** Instantiate a formatter with default configuration */
formatDuration.create = instantiateFormatter<typeof formatDuration, number, DurationFormatterConfiguration>(
  formatDuration
);
