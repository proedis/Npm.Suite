/*
 * Typing and reading a date in a field, in the order of the language: day, month and year for
 * Italian, month, day and year for American English. Pure functions on strings: the value of a date
 * with no time is `"2026-11-16"` and never a `Date`, which serialized in Italy is the day before at
 * 23:00.
 */


/* --------
 * Types Definition
 * -------- */

export type DatePart = 'day' | 'month' | 'year';

export interface DateOrder {
  readonly order: readonly DatePart[];
  readonly separator: string;
}

export type DateReading =
  | { readonly status: 'empty' }
  | { readonly status: 'incomplete'; readonly missing: DatePart }
  | { readonly status: 'impossible' }
  | { readonly status: 'valid'; readonly iso: string };


/* --------
 * Constants Definition
 * -------- */

const LENGTH: Readonly<Record<DatePart, number>> = { day: 2, month: 2, year: 4 };

/** What closes a part while typing, besides the part being full */
const CLOSERS = /[/.\-\s]/;


/* --------
 * Helpers
 * -------- */

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}


/** The order of the parts and their separator, read from `Intl` for the language */
export function dateOrderOf(locale: string | undefined): DateOrder {
  const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(new Date(2026, 10, 16));

  const order = parts
    .filter((part) => part.type === 'day' || part.type === 'month' || part.type === 'year')
    .map((part) => part.type as DatePart);

  const separator = parts.find((part) => part.type === 'literal')?.value.trim() || '/';

  return { order, separator };
}


/** Between the two dates of a period in one field: "09/11/2026 – 22/11/2026" */
export const RANGE_SEPARATOR = ' – ';

const RANGE_DASH = '–';


/**
 * The parts of one or two dates typed one after the other, with the separators written on their own.
 * The period starts its end with the first digit after a full year, so it is typed without stopping.
 * A text that starts with a dash, `-` or `–`, has no start: a period open on that side.
 */
function maskParts(raw: string, { order, separator }: DateOrder, deleting: boolean, dates: 1 | 2): string {
  const total = dates * 3;
  const parts: string[] = Array.from({ length: total }, () => '');
  const closed: boolean[] = Array.from({ length: total }, () => false);

  /* A dash, typed or written, before any digit: the period has no start */
  const openStart = dates === 2 && /^\s*[–-]/.test(raw);

  let index = openStart ? 3 : 0;

  for (const char of openStart ? raw.trimStart().slice(1) : raw) {
    if (index >= total) {
      break;
    }

    const kind = order[index % 3];

    if (/\d/.test(char)) {
      const startsAlone = parts[index] === ''
        && ((kind === 'day' && char > '3') || (kind === 'month' && char > '1'));

      parts[index] = startsAlone ? `0${char}` : parts[index] + char;

      if (parts[index].length === LENGTH[kind]) {
        closed[index] = true;
        index += 1;
      }
    }
    else if ((CLOSERS.test(char) || char === RANGE_DASH) && parts[index] !== '') {
      if (kind !== 'year' && parts[index].length === 1) {
        parts[index] = `0${parts[index]}`;
      }

      closed[index] = true;
      index += 1;
    }
  }

  const last = parts.reduce((found, part, at) => (part !== '' ? at : found), -1);

  if (last < 0) {
    return openStart && !deleting ? `${RANGE_DASH} ` : '';
  }

  const dateText = (first: number): string => parts.slice(first, Math.min(first + 3, last + 1)).filter((part) => part !== '').join(separator);

  const text = last < 3 ? dateText(0) : `${dateText(0)}${RANGE_SEPARATOR}${dateText(3)}`.trimStart();

  if (deleting || !closed[last] || last === total - 1) {
    return text;
  }

  return text + (last % 3 === 2 ? RANGE_SEPARATOR : separator);
}


/**
 * The text of the field after a keystroke: digits only, the separators written on their own.
 *
 * A part closes when it is full, when a separator, a dot, a dash or a space is typed, or at once when
 * its first digit cannot start a longer number: a `4` in the day can only be `04`. Deleting never
 * puts back the separator just removed.
 */
export function maskDate(raw: string, dateOrder: DateOrder, deleting: boolean): string {
  return maskParts(raw, dateOrder, deleting, 1);
}


/** The text of a period field after a keystroke: two dates with the same rules, and the dash between */
export function maskRange(raw: string, dateOrder: DateOrder, deleting: boolean): string {
  return maskParts(raw, dateOrder, deleting, 2);
}


/** A two digit year: up to two years ahead it is this century, beyond it the last one */
function expandYear(year: string, today: Date): number {
  if (year.length !== 2) {
    return Number(year);
  }

  const short = Number(year);
  const limit = (today.getFullYear() % 100) + 2;

  return short <= limit ? 2000 + short : 1900 + short;
}


/** Whether a day exists: the 31st of November does not */
function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}


/** The text of the field read as a date, on leaving it */
export function readDate(text: string, { order, separator }: DateOrder, today = new Date()): DateReading {
  const trimmed = text.trim();

  if (trimmed === '') {
    return { status: 'empty' };
  }

  const values = trimmed.split(separator).map((part) => part.trim());
  const byKind: Partial<Record<DatePart, string>> = {};

  order.forEach((kind, at) => {
    const part = values[at];

    if (part !== undefined && /^\d+$/.test(part)) {
      byKind[kind] = part;
    }
  });

  const missing = order.find((kind) => byKind[kind] === undefined || (kind === 'year' && byKind[kind]!.length === 3));

  if (missing) {
    return { status: 'incomplete', missing };
  }

  const year = expandYear(byKind.year!, today);
  const month = Number(byKind.month);
  const day = Number(byKind.day);

  if (!isRealDate(year, month, day)) {
    return { status: 'impossible' };
  }

  return { status: 'valid', iso: `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` };
}


/** A value as the field writes it */
export function writeDate(iso: string | null, { order, separator }: DateOrder): string {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;

  if (!match) {
    return '';
  }

  const parts: Record<DatePart, string> = { year: match[1], month: match[2], day: match[3] };

  return order.map((kind) => parts[kind]).join(separator);
}


/** The text of a period field read as its two dates: the end is what follows the dash */
export function readRange(text: string, dateOrder: DateOrder, today = new Date()): { from: DateReading; to: DateReading } {
  const dash = text.indexOf(RANGE_DASH);

  if (dash < 0) {
    return { from: readDate(text, dateOrder, today), to: { status: 'empty' } };
  }

  return {
    from: readDate(text.slice(0, dash), dateOrder, today),
    to  : readDate(text.slice(dash + 1), dateOrder, today)
  };
}


/** A period as the field writes it: the start alone, or both with the dash, or the dash and the end */
export function writeRange(range: { from: string | null; to: string | null }, dateOrder: DateOrder): string {
  const from = writeDate(range.from, dateOrder);
  const to = writeDate(range.to, dateOrder);

  return to === '' ? from : `${from}${RANGE_SEPARATOR}${to}`.trimStart();
}


/**
 * The dates in a pasted text, at most two: in the order of the language with any separator and a
 * year of two or four digits, or ISO, with or without a time. Anything else gives nothing.
 */
export function readPastedDates(text: string, dateOrder: DateOrder, today = new Date()): string[] {
  const found: string[] = [];
  const pattern = /(\d{4})-(\d{2})-(\d{2})(?:[T\s]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?|(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})/g;

  for (const match of text.matchAll(pattern)) {
    if (match[1]) {
      const reading = readDate(`${match[3]}/${match[2]}/${match[1]}`, { order: [ 'day', 'month', 'year' ], separator: '/' }, today);

      if (reading.status === 'valid') {
        found.push(reading.iso);
      }
    }
    else {
      const reading = readDate([ match[4], match[5], match[6] ].join(dateOrder.separator), dateOrder, today);

      if (reading.status === 'valid') {
        found.push(reading.iso);
      }
    }

    if (found.length === 2) {
      break;
    }
  }

  return found;
}
