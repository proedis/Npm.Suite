import type { TryParseResult } from '../types';


/* --------
 * Class Definition
 * -------- */
export class TimeSpan {


  // ----
  // Private Constants
  // ----
  private static readonly _toStringTag = 'TimeSpan';

  private static readonly _parseRegex = /^(?<sign>-)?(?:(?<days>\d+)\.)?(?<hours>[0-1]?\d|2[0-3]):(?<minutes>[0-5]\d):(?<seconds>[0-5]\d)(?:\.(?<ms>\d{1,3}))?$/;


  // ----
  // Public Constants
  // ----
  public static readonly millisecondsPerSecond = 1_000;

  public static readonly millisecondsPerMinute = TimeSpan.millisecondsPerSecond * 60;

  public static readonly millisecondsPerHour = TimeSpan.millisecondsPerMinute * 60;

  public static readonly millisecondsPerDay = TimeSpan.millisecondsPerHour * 24;

  public static readonly maxMilliseconds = Number.MAX_SAFE_INTEGER;

  public static readonly minMilliseconds = Number.MIN_SAFE_INTEGER;


  // ----
  // Public Smart Static Constructor
  // ----
  public static readonly zero = new TimeSpan(0);

  public static readonly maxValue = new TimeSpan(TimeSpan.maxMilliseconds);

  public static readonly minValue = new TimeSpan(TimeSpan.minMilliseconds);


  // ----
  // Public static parser
  // ----

  /**
   * Parses a string representing a time span into a TimeSpan object.
   *
   * @param {string} timespan - The time span string to parse. The string must match the expected time span format.
   * @return {TimeSpan} A new TimeSpan instance representing the parsed time span.
   * @throws {TypeError} If the provided parameter is not a non-empty string.
   * @throws {Error} If the provided string does not match the expected time span format.
   */
  public static parse(timespan: string): TimeSpan {
    /** Ensure the provided string is valid */
    if (timespan == null || timespan.length === 0) {
      throw new TypeError('Parameter must be a non-empty string');
    }

    /** Use the regexp to parse the received string */
    const matches = timespan.match(TimeSpan._parseRegex);

    /** Ensure match has success */
    if (!matches || !matches.groups) {
      throw new Error(`Invalid time span format: ${timespan}`);
    }

    /** Extract data from groups */
    const {
      sign,
      days = '0',
      hours = '0',
      minutes = '0',
      seconds = '0',
      ms = '0'
    } = matches.groups;

    /** Pad the milliseconds to 3 digits */
    const paddedMs = ms.padEnd(3, '0');
    const millisecondsValue = Number(paddedMs.length > 3 ? paddedMs.slice(0, 3) : paddedMs);

    /** Create the total Milliseconds number */
    const totalMilliseconds = (
      (Number(days) * TimeSpan.millisecondsPerDay) +
      (Number(hours) * TimeSpan.millisecondsPerHour) +
      (Number(minutes) * TimeSpan.millisecondsPerMinute) +
      (Number(seconds) * TimeSpan.millisecondsPerSecond) +
      millisecondsValue
    ) * (sign === '-' ? -1 : 1);

    /** Return a new TimeSpan instance */
    return new TimeSpan(totalMilliseconds);
  }


  /**
   * Attempts to parse a given string into a TimeSpan object.
   * If the parsing is successful, returns a result with success set to true and the parsed value.
   * If the parsing fails, returns a result with success set to false and a null value.
   *
   * @param {string} timespan - The string representation of the timespan to parse.
   * @return {TryParseResult<TimeSpan>} An object containing the parsing success status and the parsed TimeSpan value or null if parsing fails.
   */
  public static tryParse(timespan: string): TryParseResult<TimeSpan> {
    try {
      return {
        success: true,
        value  : TimeSpan.parse(timespan)
      };
    }
    catch (error) {
      return {
        success: false,
        value  : null
      };
    }
  }


  // ----
  // Public Static Factories
  // ----


  /**
   * Extracts time components (hours, minutes, seconds, milliseconds) from a given Date object and returns them as a TimeSpan object.
   *
   * @param {Date} date - The Date object from which time components are to be extracted.
   * @return {TimeSpan} A TimeSpan object encapsulating the extracted time components.
   */
  public static extractFromDate(date: Date): TimeSpan {
    return new TimeSpan(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  }


  /**
   * Calculates the difference between two dates and returns it as a TimeSpan.
   *
   * @param {Date} start - The start date.
   * @param {Date} end - The end date.
   * @return {TimeSpan} The time span representing the difference between the start and end dates.
   */
  public static fromDateDifference(start: Date, end: Date): TimeSpan {
    return new TimeSpan(end.valueOf() - start.valueOf());
  }


  /**
   * Converts the given number of days to a TimeSpan object.
   *
   * @param {number} days - The number of days to convert.
   * @return {TimeSpan} A TimeSpan object representing the specified number of days.
   */
  public static fromDays(days: number): TimeSpan {
    return TimeSpan.interval(days, TimeSpan.millisecondsPerDay);
  }


  /**
   * Converts the given number of hours into a TimeSpan object.
   *
   * @param {number} hours - The number of hours to be converted.
   * @return {TimeSpan} A TimeSpan object representing the specified number of hours.
   */
  public static fromHours(hours: number): TimeSpan {
    return TimeSpan.interval(hours, TimeSpan.millisecondsPerHour);
  }


  /**
   * Converts a given number of minutes into a TimeSpan object.
   *
   * @param {number} minutes - The number of minutes to be converted.
   * @return {TimeSpan} A TimeSpan object representing the equivalent duration.
   */
  public static fromMinutes(minutes: number): TimeSpan {
    return TimeSpan.interval(minutes, TimeSpan.millisecondsPerMinute);
  }


  /**
   * Creates a TimeSpan instance from the specified number of seconds.
   *
   * @param {number} seconds - The number of seconds to convert to a TimeSpan instance.
   * @return {TimeSpan} A TimeSpan instance representing the specified number of seconds.
   */
  public static fromSeconds(seconds: number): TimeSpan {
    return TimeSpan.interval(seconds, TimeSpan.millisecondsPerSecond);
  }


  /**
   * Creates a TimeSpan object from the specified number of milliseconds.
   *
   * @param {number} milliseconds - The number of milliseconds to be converted into a TimeSpan.
   * @return {TimeSpan} A TimeSpan object representing the given number of milliseconds.
   */
  public static fromMilliseconds(milliseconds: number): TimeSpan {
    return TimeSpan.intervalFromMilliseconds(milliseconds);
  }


  /**
   * Converts a numeric value and scale into a TimeSpan instance.
   *
   * @param {number} value - The numeric value representing the base time span.
   * @param {number} scale - The scale factor to multiply the value by to determine the time span in milliseconds.
   * @return {TimeSpan} The resulting TimeSpan instance.
   * @throws {Error} Throws an error if the provided value is NaN.
   */
  private static interval(value: number, scale: number): TimeSpan {
    return TimeSpan.intervalFromMilliseconds(value * scale);
  }


  /**
   * Converts a given number of milliseconds into a TimeSpan instance.
   *
   * @param {number} value - The number of milliseconds to be converted.
   * @return {TimeSpan} A new TimeSpan instance based on the provided milliseconds.
   * @throws {Error} If `value` is not a valid number.
   * @throws {Error} If `value` exceeds the maximum allowable milliseconds.
   * @throws {Error} If `value` is less than the minimum allowable milliseconds.
   */
  private static intervalFromMilliseconds(value: number): TimeSpan {
    return new TimeSpan(value);
  }


  // ----
  // Public Static Utilities
  // ----

  /**
   * Validates whether the provided milliseconds value is within the acceptable range.
   * Throws an error if the value is not a valid number or falls outside the allowed range.
   *
   * @param {number} milliseconds - The time span value in milliseconds to validate.
   * @return {number} The validated milliseconds value if it is within the acceptable range.
   * @throws {Error} If the provided value is not a number or is outside the valid range.
   */
  private static validateMilliseconds(milliseconds: number): number {
    if (Number.isNaN(milliseconds)) {
      throw new Error('Invalid time span. NaN has been received instead of a number');
    }

    if (milliseconds < TimeSpan.minMilliseconds || milliseconds > TimeSpan.maxMilliseconds) {
      throw new Error('Time is too long');
    }

    return milliseconds;
  }


  /**
   * Converts the given time parameters (hours, minutes, seconds, and milliseconds)
   * into a total time expressed in milliseconds.
   *
   * @param {number} hours - The number of hours to be converted.
   * @param {number} minutes - The number of minutes to be converted.
   * @param {number} seconds - The number of seconds to be converted.
   * @param {number} milliseconds - The number of additional milliseconds to be included.
   * @return {number} The total time in milliseconds.
   * @throws {Error} If the resulting total milliseconds exceed the maximum limit.
   */
  private static timeToMilliseconds(hours: number, minutes: number, seconds: number, milliseconds: number): number {
    return ((hours * 60 * 60) + (minutes * 60) + seconds * this.millisecondsPerSecond) + milliseconds;
  }


  /**
   * Compares two TimeSpan instances to determine their relative order.
   *
   * @param {TimeSpan} t1 - The first TimeSpan instance to compare.
   * @param {TimeSpan} t2 - The second TimeSpan instance to compare.
   * @return {number} Returns 1 if t1 is greater than t2, -1 if t1 is less than t2, and 0 if they are equal.
   */
  public static compare(t1: TimeSpan, t2: TimeSpan): number {
    if (t1._milliseconds > t2._milliseconds) {
      return 1;
    }

    if (t1._milliseconds < t2._milliseconds) {
      return -1;
    }

    return 0;
  }


  /**
   * Checks if the given value is an instance of TimeSpan or a compatible object.
   *
   * @param {unknown} value - The value to check.
   * @return {boolean} Returns true if the value is an instance of TimeSpan or meets the criteria of a TimeSpan-compatible object; otherwise, returns false.
   */
  public static isTimeSpan(value: unknown): value is TimeSpan {
    if (value == null) {
      return false;
    }

    if (value instanceof TimeSpan) {
      return true;
    }

    return (
      typeof value === 'object' && 'totalMilliseconds' in value &&
      (value as any)[Symbol.toStringTag] === this._toStringTag
    );
  }


  // ----
  // Private Properties
  // ----
  private readonly _milliseconds: number;


  // ----
  // Constructor
  // ----
  public constructor(milliseconds: number);
  public constructor(hours: number, minutes: number, seconds: number);
  public constructor(hours: number, minutes: number, seconds: number, milliseconds: number);
  public constructor(hoursOrMilliseconds: number, minutes?: number, seconds?: number, milliseconds?: number) {
    if (minutes == null) {
      this._milliseconds = TimeSpan.validateMilliseconds(hoursOrMilliseconds);
    }
    else {
      this._milliseconds = TimeSpan.validateMilliseconds(
        TimeSpan.timeToMilliseconds(hoursOrMilliseconds, minutes ?? 0, seconds ?? 0, milliseconds ?? 0)
      );
    }
  }


  // ----
  // Symbols Identifier
  // ----
  public get [Symbol.toStringTag](): string {
    return TimeSpan._toStringTag;
  }


  public [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') {
      return this.toString();
    }

    if (hint === 'number') {
      return this._milliseconds;
    }

    return this._milliseconds;
  }


  // ----
  // Formatters
  // ----
  public toString(): string {
    return (this._milliseconds < 0 ? '-' : '') +
      this.numberToPaddedString(this.days, 2, false, ':') +
      this.numberToPaddedString(this.hours, 2, true, ':') +
      this.numberToPaddedString(this.minutes, 2, true, ':') +
      this.numberToPaddedString(this.seconds, 2, true, '.') +
      this.numberToPaddedString(this.milliseconds, 3, true);
  }


  /**
   * Returns the numerical representation of the object's current millisecond value.
   *
   * @return {number} The millisecond value of the object.
   */
  public valueOf(): number {
    return this._milliseconds;
  }


  /**
   * Converts a number into a zero-padded string with optional suffix and handles special cases for empty values.
   *
   * @param {number} value - The number to convert into a padded string.
   * @param {number} length - The desired length of the resulting string, including padding.
   * @param {boolean} eventIfEmpty - Determines whether to return a string of '0's if the value is 0.
   * @param {string} [suffix] - An optional string to append at the end of the result.
   * @return {string} A string representation of the padded number with optional suffix or a string of '0's if conditions are met.
   */
  private numberToPaddedString(value: number, length: number, eventIfEmpty: boolean, suffix?: string): string {
    if (value === 0 && !eventIfEmpty) {
      return '';
    }

    return String(Math.abs(value)).padStart(length, '0') + (suffix ?? '');
  }


  // ----
  // Public Getters
  // ----

  /**
   * Retrieves the total number of days represented by the current TimeSpan instance.
   *
   * @return {number} The total number of whole days, calculated based on the milliseconds in the TimeSpan.
   */
  public get days(): number {
    return this.getSafeTruncatedValue(this.totalDays);
  }


  /**
   * Calculates the total number of days represented by the current time span.
   * The calculation is based on the total milliseconds divided by the number of milliseconds in a day.
   *
   * @return {number} The total number of days as a floating-point number.
   */
  public get totalDays(): number {
    return this._milliseconds / TimeSpan.millisecondsPerDay;
  }


  /**
   * Gets the total number of whole hours in the current TimeSpan instance.
   * The value is calculated based on the total milliseconds.
   *
   * @return {number} The total whole hours as a number.
   */
  public get hours(): number {
    return this.getSafeTruncatedValue(this.totalHours % 24);
  }


  /**
   * Calculates the total number of hours represented by the TimeSpan instance.
   *
   * @return {number} The total hours as a decimal number.
   */
  public get totalHours(): number {
    return this._milliseconds / TimeSpan.millisecondsPerHour;
  }


  /**
   * Gets the total whole minutes represented by the current instance of TimeSpan.
   * The result is calculated by dividing the total milliseconds by the number of milliseconds in a minute.
   *
   * @return {number} The number of whole minutes as an integer.
   */
  public get minutes(): number {
    return this.getSafeTruncatedValue(this.totalMinutes % 60);
  }


  /**
   * Calculates the total number of hours represented by the current time span.
   * This is derived by dividing the total milliseconds by the number of milliseconds in an hour.
   *
   * @return {number} The total hours as a floating-point number.
   */
  public get totalMinutes(): number {
    return this._milliseconds / TimeSpan.millisecondsPerMinute;
  }


  /**
   * Retrieves the total number of whole seconds represented by the TimeSpan.
   *
   * @return {number} The total whole seconds, derived by dividing the internal millisecond count by the number of milliseconds per second.
   */
  public get seconds(): number {
    return this.getSafeTruncatedValue(this.totalSeconds % 60);
  }


  /**
   * Calculates the total number of seconds represented by the current time span.
   * The value is derived from dividing the total milliseconds by the
   * number of milliseconds per second.
   *
   * @return {number} The total seconds as a floating-point number.
   */
  public get totalSeconds(): number {
    return this._milliseconds / TimeSpan.millisecondsPerSecond;
  }


  /**
   * Retrieves the milliseconds component of the time.
   *
   * @return {number} The current value of the milliseconds.
   */
  public get milliseconds(): number {
    return this.getSafeTruncatedValue(this._milliseconds % 1_000);
  }


  /**
   * Gets the total number of milliseconds.
   *
   * @return {number} The total milliseconds value.
   */
  public get totalMilliseconds(): number {
    return this._milliseconds;
  }


  /**
   * Safely truncates a given number by removing its decimal part.
   * Ensures that if the result is -0, it is converted to 0.
   *
   * @param {number} value - The number to be truncated.
   * @return {number} The truncated value or 0 if the result is -0.
   */
  private getSafeTruncatedValue(value: number): number {
    const truncatedValue = Math.trunc(value);
    return truncatedValue === -0 ? 0 : truncatedValue;
  }


  // ----
  // Public Utilities
  // ----

  /**
   * Compares the current object with another object to determine their relative order.
   * @param {unknown} other - The object to compare with the current instance.
   * @return {number} A negative number if the current object is less than the other object, zero if they are equal, or a positive number if the current object is greater than the other object.
   */
  public compareTo(other: unknown): number;
  public compareTo(other: TimeSpan): number;
  public compareTo(other: TimeSpan | unknown): number {
    if (other == null) {
      return 1;
    }

    if (!TimeSpan.isTimeSpan(other)) {
      throw new Error('Invalid time span');
    }

    return TimeSpan.compare(this, other);
  }


  /**
   * Compares the current TimeSpan instance with another instance to determine equality.
   *
   * @param {TimeSpan} other - The TimeSpan instance to compare with the current instance.
   * @return {boolean} Returns true if the current instance is equal to the specified instance; otherwise, false.
   */
  public equals(other: unknown): boolean;
  public equals(other: TimeSpan): boolean;
  public equals(other: TimeSpan | unknown): boolean {
    if (other == null) {
      return false;
    }

    if (!TimeSpan.isTimeSpan(other)) {
      return false;
    }

    return this._milliseconds === other._milliseconds;
  }


  /**
   * Negates the current TimeSpan instance by reversing its duration.
   *
   * @return {TimeSpan} A new TimeSpan instance with the negated duration.
   */
  public negate(): TimeSpan {
    return new TimeSpan(-this._milliseconds);
  }


  /**
   * Calculates the duration as a positive TimeSpan value.
   *
   * @return {TimeSpan} A TimeSpan instance representing the absolute duration.
   */
  public duration(): TimeSpan {
    return new TimeSpan(this._milliseconds >= 0 ? this._milliseconds : -this._milliseconds);
  }


  // ----
  // Public Modifiers
  // ----

  /**
   * Adds the given TimeSpan to the current instance and returns a new TimeSpan.
   *
   * @param {TimeSpan} timespan - The TimeSpan to be added to the current instance.
   * @return {TimeSpan} A new TimeSpan that represents the sum of the current instance and the given TimeSpan.
   * @throws {Error} Throws an error if the resulting time exceeds the maximum allowed duration.
   */
  public add(timespan: TimeSpan): TimeSpan {
    return new TimeSpan(this._milliseconds + timespan._milliseconds);
  }


  /**
   * Adds the specified duration, in milliseconds, to the given date.
   *
   * @param {Date} date - The date to which the duration will be added.
   * @return {Date} A new Date object representing the result of adding the duration to the input date.
   */
  public addTo(date: Date): Date {
    return new Date(date.valueOf() + this._milliseconds);
  }


  /**
   * Adds a specified number of days to the current TimeSpan instance.
   *
   * @param {number} days - The number of days to add to the TimeSpan.
   * @return {TimeSpan} A new TimeSpan instance representing the result of the addition.
   */
  public addDays(days: number): TimeSpan {
    return new TimeSpan(this._milliseconds + (days * TimeSpan.millisecondsPerDay));
  }


  /**
   * Adds the specified number of hours to the current TimeSpan instance and returns a new TimeSpan.
   *
   * @param {number} hours - The number of hours to add. Can be positive or negative.
   * @return {TimeSpan} A new TimeSpan instance with the added hours.
   */
  public addHours(hours: number): TimeSpan {
    return new TimeSpan(this._milliseconds + (hours * TimeSpan.millisecondsPerHour));
  }


  /**
   * Adds the specified number of minutes to the current TimeSpan instance.
   *
   * @param {number} minutes - The number of minutes to add.
   * @return {TimeSpan} A new TimeSpan instance with the updated duration.
   */
  public addMinutes(minutes: number): TimeSpan {
    return new TimeSpan(this._milliseconds + (minutes * TimeSpan.millisecondsPerMinute));
  }


  /**
   * Adds the specified number of seconds to the current TimeSpan instance.
   *
   * @param {number} seconds - The number of seconds to add. Can be a positive or negative value.
   * @return {TimeSpan} A new TimeSpan object representing the updated time span after the seconds are added.
   */
  public addSeconds(seconds: number): TimeSpan {
    return new TimeSpan(this._milliseconds + (seconds * TimeSpan.millisecondsPerSecond));
  }


  /**
   * Adds the specified number of milliseconds to the current TimeSpan instance.
   *
   * @param {number} milliseconds - The number of milliseconds to add.
   * @return {TimeSpan} A new TimeSpan instance that represents the result of the addition.
   */
  public addMilliseconds(milliseconds: number): TimeSpan {
    return new TimeSpan(this._milliseconds + milliseconds);
  }


  /**
   * Subtracts the specified TimeSpan from the current TimeSpan.
   *
   * @param {TimeSpan} timespan - The TimeSpan to subtract from the current TimeSpan.
   * @return {TimeSpan} A new TimeSpan representing the difference between the two TimeSpans.
   * @throws {Error} Throws an error if the resulting TimeSpan exceeds the allowable range.
   */
  public subtract(timespan: TimeSpan): TimeSpan {
    return new TimeSpan(this._milliseconds - timespan._milliseconds);
  }


  /**
   * Subtracts a predefined time period (in milliseconds) from the provided date.
   *
   * @param {Date} date - The date from which the predefined time will be subtracted.
   * @return {Date} A new Date object representing the resulting date and time after subtraction.
   */
  public subtractFrom(date: Date): Date {
    return new Date(date.valueOf() - this._milliseconds);
  }

}
