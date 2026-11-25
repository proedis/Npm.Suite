import type * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/**
 * One requirement of a password: what it is called, already translated, and how it is checked. The
 * same rules feed the checklist under a `PasswordInput` and the validation of the form, so the two
 * cannot disagree.
 */
export interface PasswordRule {
  /** Stable among the rules of one field: the key of its line */
  readonly id: string;

  /** What the user reads: "At least 12 characters" */
  readonly label: React.ReactNode;

  readonly test: (value: string) => boolean;
}

export interface PasswordCheck {
  /** Every rule passes */
  readonly ok: boolean;

  /** The ids of the rules that pass, in their order */
  readonly passed: readonly string[];

  /** The ids of the rules that fail, in their order */
  readonly failed: readonly string[];

  /** The share of the rules that pass, from 0 to 1; 1 with no rules */
  readonly score: number;
}


/* --------
 * Rules
 * -------- */

/**
 * The rules most policies are made of, each with the label the caller writes. Characters are counted
 * as the user sees them, so "è" and an emoji count one; the letters are any alphabet's.
 *
 * ```ts
 * const rules = [
 *   passwordRules.minLength(12, t('password.length', { count: 12 })),
 *   passwordRules.uppercase(t('password.uppercase')),
 *   passwordRules.digit(t('password.digit'))
 * ];
 * ```
 *
 * A rule of the application's own is an object with the same three fields.
 */
export const passwordRules = {
  minLength: (length: number, label: React.ReactNode): PasswordRule => ({
    id  : `min-length-${length}`,
    label,
    test: (value) => Array.from(value).length >= length
  }),

  maxLength: (length: number, label: React.ReactNode): PasswordRule => ({
    id  : `max-length-${length}`,
    label,
    test: (value) => Array.from(value).length <= length
  }),

  uppercase: (label: React.ReactNode): PasswordRule => ({ id: 'uppercase', label, test: (value) => /\p{Lu}/u.test(value) }),

  lowercase: (label: React.ReactNode): PasswordRule => ({ id: 'lowercase', label, test: (value) => /\p{Ll}/u.test(value) }),

  digit: (label: React.ReactNode): PasswordRule => ({ id: 'digit', label, test: (value) => /\p{Nd}/u.test(value) }),

  /** Anything that is neither a letter, nor a digit, nor a space */
  symbol: (label: React.ReactNode): PasswordRule => ({ id: 'symbol', label, test: (value) => /[^\p{L}\p{N}\s]/u.test(value) }),

  /** Not the same as another value, typed or known: the user name, the old password */
  notEqual: (other: () => string, label: React.ReactNode): PasswordRule => ({
    id  : 'not-equal',
    label,
    test: (value) => value.length > 0 && value !== other()
  })
} as const;


/* --------
 * Helpers
 * -------- */

/**
 * Runs the rules on a value. The same call validates the form, so the checklist and the error agree:
 *
 * ```ts
 * z.string().refine((value) => checkPassword(value, rules).ok, { message: t('password.weak') })
 * ```
 */
export function checkPassword(value: string, rules: readonly PasswordRule[]): PasswordCheck {
  const passed: string[] = [];
  const failed: string[] = [];

  rules.forEach((rule) => {
    (rule.test(value) ? passed : failed).push(rule.id);
  });

  return {
    ok   : failed.length === 0,
    passed,
    failed,
    score: rules.length === 0 ? 1 : passed.length / rules.length
  };
}
