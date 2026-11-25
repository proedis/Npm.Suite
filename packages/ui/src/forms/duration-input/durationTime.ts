/* --------
 * Constants Definition
 * -------- */

const SECONDS_PER_MINUTE = 60;

const SECONDS_PER_HOUR = 3_600;

const SECONDS_PER_DAY = 86_400;

/** `[-][d.]hh:mm:ss[.fffffff]`, the format of a .NET `TimeSpan` and of `@proedis/modeler`'s */
const TIME_SPAN = /^(-)?(?:(\d+)\.)?(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;


/* --------
 * Types Definition
 * -------- */

/** A duration split into what a DurationInput shows: the hours are not capped at a day */
export interface DurationParts {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}


/* --------
 * Helpers
 * -------- */

/** Whole seconds into hours, minutes and seconds. A negative duration has no parts: it is read as 0 */
export function splitDuration(totalSeconds: number): DurationParts {
  const total = Math.max(0, Math.round(totalSeconds));

  return {
    hours  : Math.floor(total / SECONDS_PER_HOUR),
    minutes: Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: total % SECONDS_PER_MINUTE
  };
}

/** Hours, minutes and seconds into whole seconds */
export function joinDuration(parts: DurationParts): number {
  return (parts.hours * SECONDS_PER_HOUR) + (parts.minutes * SECONDS_PER_MINUTE) + parts.seconds;
}

/**
 * A `TimeSpan` as an API sends it into the seconds of a DurationInput, or `null` when the text is not one:
 * `'01:30:00'` is 5400, `'1.02:00:00'` 93600. The fraction of a second is dropped.
 *
 * ```ts
 * <DurationInput value={durationFromTimeSpan(dto.duration)} onValueChange={(seconds) => …} />
 * ```
 *
 * With a model of `@proedis/modeler`, `TimeSpan.fromSeconds(seconds)` and `timeSpan.totalSeconds` are the
 * same bridge.
 */
export function durationFromTimeSpan(text: string | null | undefined): number | null {
  const match = text ? TIME_SPAN.exec(text.trim()) : null;

  if (!match) {
    return null;
  }

  const [ , sign, days, hours, minutes, seconds ] = match;

  if (Number(minutes) > 59 || Number(seconds ?? 0) > 59) {
    return null;
  }

  const total = (Number(days ?? 0) * SECONDS_PER_DAY)
    + (Number(hours) * SECONDS_PER_HOUR)
    + (Number(minutes) * SECONDS_PER_MINUTE)
    + Number(seconds ?? 0);

  return sign ? -total : total;
}

/**
 * The seconds of a DurationInput as a `TimeSpan` an API reads: 5400 is `'01:30:00'`, a day or more carries
 * its days, 93600 is `'1.02:00:00'`. `null` stays `null`.
 */
export function durationToTimeSpan(totalSeconds: number | null | undefined): string | null {
  if (totalSeconds === null || totalSeconds === undefined || !Number.isFinite(totalSeconds)) {
    return null;
  }

  const sign = totalSeconds < 0 ? '-' : '';
  const total = Math.abs(Math.round(totalSeconds));
  const days = Math.floor(total / SECONDS_PER_DAY);
  const { hours, minutes, seconds } = splitDuration(total % SECONDS_PER_DAY);
  const pad = (value: number): string => String(value).padStart(2, '0');

  return `${sign}${days > 0 ? `${days}.` : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
