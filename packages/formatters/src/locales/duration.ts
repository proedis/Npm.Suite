import { extractLocaleDictionary } from './generics';
import type { LocaleDictionaries, LocaleDictionary } from './generics';

import { pluralize } from '../formatters/pluralize';

import type { DurationUnit } from '../formatters/duration.types';


/* --------
 * Define the LocaleDictionary exported from function
 * -------- */
export type DurationLocaleDictionary = LocaleDictionary<DurationUnit | 'decimals' | 'conjunction'>;


/* --------
 * Define the different Locales Dictionaries
 * -------- */
const durationDictionaries: LocaleDictionaries<DurationLocaleDictionary> = {

  en: {
    y          : pluralize.create('year', 'years'),
    mo         : pluralize.create('month', 'months'),
    w          : pluralize.create('week', 'weeks'),
    d          : pluralize.create('day', 'days'),
    h          : pluralize.create('hour', 'hours'),
    m          : pluralize.create('minute', 'minutes'),
    s          : pluralize.create('second', 'seconds'),
    ms         : pluralize.create('millisecond', 'milliseconds'),
    decimals   : () => ',',
    conjunction: () => ' and '
  },

  it: {
    y          : pluralize.create('anno', 'anni'),
    mo         : pluralize.create('mese', 'mesi'),
    w          : pluralize.create('settimana', 'settimane'),
    d          : pluralize.create('giorno', 'giorni'),
    h          : pluralize.create('ora', 'ore'),
    m          : pluralize.create('minuto', 'minuti'),
    s          : pluralize.create('secondo', 'secondi'),
    ms         : pluralize.create('millisecondo', 'millisecondi'),
    decimals   : () => '.',
    conjunction: () => ' e '
  }

};


/* --------
 * Extract dictionary function
 * -------- */
export const getDurationDictionary = extractLocaleDictionary(durationDictionaries);
