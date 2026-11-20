/*
 * What a number field accepts, decided here and not by Base UI's parser, which is lenient on purpose:
 * it strips every group separator, so in Italian a typed `1.5` is 15 and a pasted `1,234.56` is
 * 1.23456. The rules below are the guide's: nothing enters in pieces, nothing is rounded.
 */


/* --------
 * Types Definition
 * -------- */

export interface NumberSeparators {
  readonly group: string;
  readonly decimal: string;
}

export interface NumberRules {
  readonly separators: NumberSeparators;
  readonly decimals: number;
  readonly allowNegative: boolean;
}


/* --------
 * Helpers
 * -------- */

/** The two separators of a locale, read from `Intl` rather than assumed */
export function separatorsOf(locale: string | undefined): NumberSeparators {
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(1234567.5);

  return {
    group  : parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.'
  };
}


function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/**
 * Whether the text the field would hold after a keystroke is acceptable while typing: digits, one
 * decimal separator if the field has decimals and at most that many digits after it, a minus only in
 * first place and only below zero. The group separator is not typed: the field writes it on its own.
 *
 * The text before the keystroke may already carry group separators (a value formatted on blur and
 * focused again), so they are ignored in the existing part and refused only in what is inserted.
 */
export function acceptsTyping(next: string, inserted: string, rules: NumberRules): boolean {
  const { allowNegative, decimals, separators } = rules;

  if (inserted.includes(separators.group) && separators.group !== separators.decimal) {
    return false;
  }

  const plain = next.split(separators.group).join('');
  const sign = allowNegative ? '-?' : '';
  const fraction = decimals > 0 ? `(${escape(separators.decimal)}\\d{0,${decimals}})?` : '';

  return new RegExp(`^${sign}\\d*${fraction}$`).test(plain);
}


/**
 * A pasted text, cleaned and checked as a whole: spaces, line breaks and the field's own unit fall
 * away, the rest has to be a number written in the locale (groups of three where there are groups),
 * with no more decimals than the field takes. The clean text, or `null` and nothing enters.
 */
export function cleanPaste(raw: string, unit: string | undefined, rules: NumberRules): string | null {
  const { allowNegative, decimals, separators } = rules;

  let text = raw.replace(/\s+/g, '');

  if (unit) {
    text = text.split(unit.replace(/\s+/g, '')).join('');
  }

  const group = escape(separators.group);
  const decimal = escape(separators.decimal);
  const sign = allowNegative ? '-?' : '';
  const integer = `(\\d{1,3}(${group}\\d{3})+|\\d+)`;
  const fraction = decimals > 0 ? `(${decimal}\\d{1,${decimals}})?` : '';

  return new RegExp(`^${sign}${integer}${fraction}$`).test(text) ? text : null;
}


/**
 * The width of the field, from the largest number it admits: a number is never truncated, and the
 * field never fills its column. Without a maximum, the third step.
 */
export function widthClass(max: number | undefined, decimals: number, locale: string | undefined, longUnit: boolean): string {
  const STEPS = [ 'w-24', 'w-28', 'w-32', 'w-36', 'w-40' ];

  let step = 2;

  if (max !== undefined) {
    const { length } = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(max);

    step = length <= 6 ? 0 : length <= 9 ? 1 : length <= 10 ? 2 : length <= 12 ? 3 : 4;
  }

  return STEPS[Math.min(step + (longUnit ? 1 : 0), STEPS.length - 1)];
}
