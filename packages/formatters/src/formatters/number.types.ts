export interface NumberFormatterConfiguration {
  /** Define decimals separator, default to `.` */
  decimalSeparator?: string;

  /**
   * Set if decimal count could be
   * flexible starting
   * from `minPrecision` to `precision`
   */
  flexibleDecimals?: boolean;

  /**
   * Set the minimum decimal count,
   * This option will be considered
   * only when `flexibleDecimals` is true
   */
  minPrecision?: number;

  /**
   * Define the format pattern to use
   * to display formatted number.
   * Pattern string could use some placeholder:
   *  - `%n` to define the number
   *  - `%m` to define the minus symbol (if negative)
   *  - `%s` to define the suffix
   *  - `%p` to define the prefix
   *
   * The default pattern is
   * `%p %m %n %s`
   *
   * _Attention_: multiple consecutive spacings
   * are replaced with one single space
   */
  pattern?: string;

  /**
   * Set the number precision.
   * This option will also be used
   * as `maxPrecision` number when formatting
   * with `flexibleDecimals` to true
   */
  precision?: number;

  /** Append a prefix to formatted number */
  prefix?: string;

  /** Prepend a suffix to format number */
  suffix?: string;

  /** Define the thousand separators, default to `,` */
  thousandSeparator?: string;
}
