import type { Locale } from '../locales/generics';


export interface DurationFormatterConfiguration {
  /**
   * Override default conjunction
   * for chosen language
   * Default `null`
   */
  conjunction?: string;

  /**
   * Override default decimal separator
   * for chosen language
   * Default `null`
   */
  decimals?: string;

  /**
   * Delimiter between formatted elements.
   * Default to `, `
   */
  delimiter?: string;

  /**
   * Define the Duration Language
   * Default to `en`
   */
  locale?: Locale;

  /**
   * Set how many units show, starting from the largest one.
   * Default to `null`
   */
  largest?: number;

  /**
   * Set the precision of the lower unit
   * Default to `2`
   */
  maxDecimals?: number;

  /**
   * Strip decimals, rounding to the nearest integer
   * Default to `false`
   */
  round?: boolean;

  /**
   * Set the source unit value
   * Default to `ms`
   */
  sourceUnit?: DurationUnit;

  /**
   * Set units to display
   * Default to `['y', 'mo', 'w', 'd', 'h', 'm', 's']`
   */
  units?: DurationUnit[];
}


/**
 * Duration abbreviation will be used to define
 * with type of unit must be displayed when
 * formatting a number into a duration string
 */
export type DurationUnit = 'y' | 'mo' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms';
