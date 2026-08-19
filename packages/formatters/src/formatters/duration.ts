import { instantiateFormatter } from '../helpers/create-formatters';

import { getDurationDictionary } from '../locales/duration';
import { normalizeNumber, normalizeNumberWithPrecision } from '../utils/normalize';

import type { DurationFormatterConfiguration, DurationUnit } from './duration.types';


/* --------
 * Constants
 * -------- */

/** How many milliseconds each unit is worth */
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

/** The units rendered when the caller does not narrow the list */
const DEFAULT_UNITS: DurationUnit[] = [ 'y', 'mo', 'w', 'd', 'h', 'm', 's' ];


/* --------
 * Internal Types
 * -------- */
interface DurationPart {
  unitCount: number;

  unitName: DurationUnit;
}


/* --------
 * Main Function
 * -------- */

/**
 * Format a numeric duration as human readable text.
 *
 * The value is split across the requested units from the largest down, each unit taking whatever is
 * left after the ones before it, and the smallest unit keeps the remainder as decimals. Only the
 * parts that come out non zero are rendered, so `formatDuration(90061000)` gives
 * `'1 day, 1 hour and 1.02 minutes'` rather than padding the list with zeros.
 *
 * @param value The duration, expressed in `sourceUnit`
 * @param config How to split, round and render it
 * @returns The formatted duration, never an empty string
 *
 * @example
 * formatDuration(90061000);                    // '1 day, 1 hour, 1 minute and 1 second'
 * formatDuration(90061000, { locale: 'it' });  // '1 giorno, 1 ora, 1 minuto e 1 secondo'
 * formatDuration(90061000, { largest: 2 });    // '1 day and 1 hour'
 * formatDuration(3.5, { sourceUnit: 'h' });    // '3 hours and 30 minutes'
 * formatDuration(0);                           // '0 seconds'
 *
 * @example
 * // the smallest requested unit keeps the remainder as decimals, unless rounding is asked for
 * const units: DurationUnit[] = [ 'd', 'h', 'm' ];
 *
 * formatDuration(90061000, { units });                 // '1 day, 1 hour and 1.02 minutes'
 * formatDuration(90061000, { units, round: true });    // '1 day, 1 hour and 1 minute'
 */
export function formatDuration(value: number, config?: DurationFormatterConfiguration): string {
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
    units = DEFAULT_UNITS
  } = config || {};

  /** Normalize Number */
  let remaining: number = Math.abs(normalizeNumber(value));

  /** Check if it must be transformed using source unit */
  if (sourceUnit !== 'ms') {
    remaining *= UNIT_MS_LENGTH[sourceUnit];
  }

  /**
   * Resolve the translations, then read the two overridable strings out of them.
   *
   * They are read into locals rather than written back into the dictionary: it is the shared object
   * for the whole process, and overriding an entry on it leaked into every later call.
   */
  const dictionary = getDurationDictionary(locale);

  const decimalSeparator = typeof decimals === 'string' ? decimals : dictionary.decimalSeparator;
  const partsConjunction = typeof conjunction === 'string' ? conjunction : dictionary.conjunction;

  /** Build parts container */
  const parts: DurationPart[] = [];

  const { length: unitsLength } = units;

  /** Loop each unit, the smallest one keeping the remainder as decimals */
  for (let i = 0; i < unitsLength; i++) {
    const unitName = units[i];
    const unitMS = UNIT_MS_LENGTH[unitName];

    const unitCount: number = i !== unitsLength - 1
      ? Math.floor(remaining / unitMS)
      : Number.isFinite(maxDecimals)
        ? parseFloat(normalizeNumberWithPrecision(remaining / unitMS, maxDecimals))
        : remaining / unitMS;

    /** Add Unit Piece */
    parts.push({ unitCount, unitName });

    /** Remove this count */
    remaining -= unitCount * unitMS;
  }

  /**
   * Round every count, carrying a full unit up into the next larger one.
   *
   * Walking from the smallest part upwards: 59.6 minutes rounds to 60, which is a whole hour, so it
   * is moved into the hour part instead of being printed as '60 minutes'. The loop starts at the last
   * index — it used to start at 'parts.length', reading one past the end and throwing a TypeError on
   * the very first iteration, which made this option unusable.
   */
  if (round) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      part.unitCount = Math.round(part.unitCount);

      /** The largest unit has nothing to carry into */
      if (i === 0) {
        break;
      }

      const largerPart = parts[i - 1];
      const ratioToLargerUnit = UNIT_MS_LENGTH[largerPart.unitName] / UNIT_MS_LENGTH[part.unitName];

      const isWholeLargerUnit = (part.unitCount % ratioToLargerUnit) === 0;
      const isBeyondRequestedUnits = !!largest && ((largest - 1) < (i - ratioToLargerUnit));

      if (isWholeLargerUnit || isBeyondRequestedUnits) {
        largerPart.unitCount += part.unitCount / ratioToLargerUnit;
        part.unitCount = 0;
      }
    }
  }

  /** Render each non zero part, stopping once the requested number of parts has been produced */
  const renderPart = (part: DurationPart): string => {
    const formattedCount = String(part.unitCount).replace('.', decimalSeparator);

    return dictionary.units[part.unitName](part.unitCount, formattedCount);
  };

  const rendered: string[] = [];

  for (const part of parts) {
    if (part.unitCount) {
      rendered.push(renderPart(part));
    }

    if (rendered.length === largest) {
      break;
    }
  }

  /** A duration that rounds down to nothing still has to say something */
  if (!rendered.length) {
    return renderPart({ unitCount: 0, unitName: units[unitsLength - 1] });
  }

  /**
   * Join with the delimiter, keeping the conjunction for the last pair only.
   *
   * The single part case is returned early on purpose: joining a list of one used to produce an empty
   * left hand side, so every one-unit duration came out with the conjunction stuck to the front —
   * ' and 1 second'.
   */
  if (rendered.length === 1) {
    return rendered[0];
  }

  return [
    rendered.slice(0, -1).join(delimiter),
    rendered[rendered.length - 1]
  ].join(partsConjunction);
}


/* --------
 * Formatter Instantiation
 * -------- */

/**
 * Build a duration formatter that carries its own defaults.
 *
 * @example
 * const formatWorkTime = formatDuration.create({ locale: 'it', units: [ 'h', 'm' ], round: true });
 *
 * formatWorkTime(9000000);                    // '2 ore e 30 minuti'
 * formatWorkTime(9000000, { largest: 1 });    // per call override
 */
formatDuration.create = instantiateFormatter<typeof formatDuration, number, DurationFormatterConfiguration>(
  formatDuration
);
