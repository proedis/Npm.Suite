/**
 * @proedis/formatters
 *
 * Locale aware formatters for turning numbers and durations into the strings a user actually reads.
 *
 * Every formatter is callable directly, and every one of them also carries a `create` method that
 * returns a preconfigured copy — so an application declares its currency or its duration style once
 * and passes the value from then on.
 */

export * from './formatters/duration';
export * from './formatters/duration.types';

export * from './formatters/number';
export * from './formatters/number.types';

export * from './formatters/pluralize';

export type { Locale } from './locales/generics';
export type { DurationLocaleDictionary, DurationUnitLabel } from './locales/duration';

export type { FormatterFactory } from './helpers/create-formatters';
