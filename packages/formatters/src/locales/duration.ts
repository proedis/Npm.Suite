import { resolveLocaleDictionary } from './generics';

import type { Locale, LocaleDictionaries } from './generics';

import type { DurationUnit } from '../formatters/duration.types';


/* --------
 * Exported Types
 * -------- */

/**
 * Render one unit of a duration.
 *
 * Both the numeric count and its already formatted string are handed over: the count decides
 * singular against plural, while the formatted string is what actually gets printed — it is the one
 * carrying the locale's decimal separator.
 */
export type DurationUnitLabel = (count: number, formattedCount: string) => string;

/** Everything needed to render a duration in one language */
export interface DurationLocaleDictionary {
  /** One label renderer per unit */
  units: Record<DurationUnit, DurationUnitLabel>;

  /** The separator between the integer and decimal part of a count */
  decimalSeparator: string;

  /** What goes between the second to last and the last part of the result */
  conjunction: string;
}


/* --------
 * Internal Helpers
 * -------- */

/**
 * Build a unit label renderer out of its singular and plural form.
 *
 * @param singular The form used when the count is exactly 1
 * @param plural The form used for every other count
 */
const unitLabel = (singular: string, plural: string): DurationUnitLabel => (
  (count, formattedCount) => `${formattedCount} ${count === 1 ? singular : plural}`
);


/* --------
 * Dictionaries
 * -------- */
const durationDictionaries: LocaleDictionaries<DurationLocaleDictionary> = {

  en: {
    units: {
      y : unitLabel('year', 'years'),
      mo: unitLabel('month', 'months'),
      w : unitLabel('week', 'weeks'),
      d : unitLabel('day', 'days'),
      h : unitLabel('hour', 'hours'),
      m : unitLabel('minute', 'minutes'),
      s : unitLabel('second', 'seconds'),
      ms: unitLabel('millisecond', 'milliseconds')
    },
    decimalSeparator: '.',
    conjunction     : ' and '
  },

  it: {
    units: {
      y : unitLabel('anno', 'anni'),
      mo: unitLabel('mese', 'mesi'),
      w : unitLabel('settimana', 'settimane'),
      d : unitLabel('giorno', 'giorni'),
      h : unitLabel('ora', 'ore'),
      m : unitLabel('minuto', 'minuti'),
      s : unitLabel('secondo', 'secondi'),
      ms: unitLabel('millisecondo', 'millisecondi')
    },
    decimalSeparator: ',',
    conjunction     : ' e '
  }

};


/* --------
 * Resolution
 * -------- */

/**
 * Get the duration translations for a locale, falling back to English.
 *
 * The returned object is the shared one, so it must never be written to: overriding an entry used to
 * be how the `conjunction` and `decimals` options were applied, and it leaked every override into
 * every later call for the lifetime of the process.
 *
 * @param locale The requested locale
 */
export function getDurationDictionary(locale: Locale): DurationLocaleDictionary {
  return resolveLocaleDictionary(durationDictionaries, locale);
}
