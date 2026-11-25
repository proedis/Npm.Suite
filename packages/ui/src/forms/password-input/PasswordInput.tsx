'use client';

import * as React from 'react';

import { Collapsible } from '@base-ui/react/collapsible';
import { Field as FieldPrimitive } from '@base-ui/react/field';

import { bindable } from '../../core/binding';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { VisuallyHidden } from '../../primitives/VisuallyHidden';

import { DoneGlyph, EyeGlyph, EyeOffGlyph } from '../../internal/glyphs';

import { useFieldControl } from '../field/fieldContext';
import { TextInput } from '../text-input/TextInput';

import { checkPassword } from './passwordRules';

import type { BoundValue } from '../../core/binding';

import type { TextInputLoadingProps, TextInputProps } from '../text-input/TextInput';

import type { PasswordRule } from './passwordRules';


/* --------
 * Types Definition
 * -------- */

export interface PasswordInputLabels {
  /** The name and tooltip of the action while the value is hidden: "Show password" */
  show: string;

  /** The name and tooltip of the action while the value is shown: "Hide password" */
  hide: string;
}

/** Read before each rule by a screen reader, since the mark alone is a picture: "Done", "Missing" */
export interface PasswordChecklistLabels {
  met: string;
  unmet: string;
}

/** The meter under the field: one segment per level, from the destructive tone to the success one */
export interface PasswordStrength {
  /** The words of the levels, weakest first: two to five, one segment each. "Weak", "Fair", "Good", "Strong" */
  readonly levels: readonly [string, string, ...string[]];

  /** The name of the meter: "Password strength" */
  readonly label: string;

  /**
   * How strong the value is, from 0 to 1. Defaults to the share of `rules` that pass: give one of your
   * own for an estimator (zxcvbn), or when there are no rules
   */
  readonly score?: (value: string) => number;
}

/**
 * The rules ask for the texts a screen reader needs to read their marks: `labels` takes `met` and
 * `unmet` as soon as `rules` is given
 */
export type PasswordInputChecklistProps =
  | { rules?: undefined; labels: PasswordInputLabels }
  | { rules: readonly PasswordRule[]; labels: PasswordInputLabels & PasswordChecklistLabels };

/** The loading pair is put back as the union of `TextInput`: an `Omit` over it flattens it */
export type PasswordInputProps = Omit<
  TextInputProps,
  'type' | 'trailing' | 'autoComplete' | 'loading' | 'loadingLabel' | 'labels'
> & TextInputLoadingProps & PasswordInputChecklistProps & {
  /**
   * Required, and only the two that mean something here: a password manager fills a sign-in field
   * and offers to generate a new one, and it can only tell which is which from this.
   */
  autoComplete: 'current-password' | 'new-password';

  /** The meter under the field. None by default */
  strength?: PasswordStrength;
};


/* --------
 * Constants Definition
 * -------- */

type StrengthTone = 'destructive' | 'warning' | 'success';

const STEP_FILL: Readonly<Record<StrengthTone, string>> = {
  destructive: 'bg-destructive',
  warning    : 'bg-warning',
  success    : 'bg-success'
};

const STEP_INK: Readonly<Record<StrengthTone, string>> = {
  destructive: 'text-destructive',
  warning    : 'text-warning-soft-foreground',
  success    : 'text-success-soft-foreground'
};


/* --------
 * Helpers
 * -------- */

/** The first level is the destructive tone, the last the success one, every level between them a warning */
function toneOf(filled: number, steps: number): StrengthTone {
  if (filled >= steps) {
    return 'success';
  }

  return filled <= 1 ? 'destructive' : 'warning';
}


/* --------
 * Parts
 * -------- */

/** The mark of a rule still to meet: an empty circle, the weight of the tick */
function PendingMark(): React.ReactNode {
  return (
    <svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={2} aria-hidden={'true'} focusable={'false'}>
      <circle cx={12} cy={12} r={7} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * A `TextInput` for a password, with an action at its end that shows and hides the value, and on demand
 * the rules it must meet and a meter of its strength.
 *
 * ```tsx
 * <PasswordInput
 *   autoComplete={'new-password'}
 *   rules={rules}
 *   strength={{ label: t('…STRENGTH'), levels: [ t('…WEAK'), t('…FAIR'), t('…GOOD'), t('…STRONG') ] }}
 *   labels={{ show: t('…SHOW'), hide: t('…HIDE'), met: t('…MET'), unmet: t('…UNMET') }}
 * />
 * ```
 *
 * The name of the action and its icon change together, so the button says what it will do next. No
 * `aria-pressed` on top: with a name that changes, a pressed state would say the same thing twice.
 *
 * `rules` opens a checklist under the field while it has the focus, and keeps it open after while a rule
 * still fails, so the reason of the error stays in sight. Each line is ticked as it is met, and turns to
 * the destructive tone when the field is invalid. The same rules validate the form through
 * `checkPassword`, so the two never disagree. In a `Field`, the list describes the control. `strength`
 * draws the meter: as many segments as levels, the destructive tone at the first, the success one at the
 * last, the word of the level beside it. Every text arrives as a prop.
 *
 * Parts with a slot, with rules or a meter: `password-input` (the column), `password-input-meter` (with
 * `data-level`, `data-tone`), `password-input-meter-step` (with `data-filled`), `password-input-meter-label`,
 * `password-input-checklist` (with `data-open`), `password-input-rule` (with `data-met`, `data-rule`).
 */
const PasswordInputBase = React.forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { defaultValue, labels, onBlur, onChange, onFocus, rules, strength, value: valueProp, ...rest } = props;


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();


  // ----
  // Internal State
  // ----
  const [ visible, setVisible ] = React.useState(false);
  const [ focused, setFocused ] = React.useState(false);
  const [ own, setOwn ] = React.useState(() => (defaultValue === undefined ? '' : String(defaultValue)));

  const value = valueProp === undefined ? own : String(valueProp);


  // ----
  // Handlers
  // ----
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(event);
    setOwn(event.currentTarget.value);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
    onFocus?.(event);
    setFocused(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    onBlur?.(event);
    setFocused(false);
  };


  // ----
  // Component Render
  // ----
  const control = (
    <TextInput
      {...(rest as TextInputProps)}
      ref={ref}
      value={valueProp}
      defaultValue={defaultValue}
      type={visible ? 'text' : 'password'}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      trailing={(
        <TextInput.Action
          label={visible ? labels.hide : labels.show}
          icon={visible ? <EyeOffGlyph /> : <EyeGlyph />}
          onClick={() => setVisible((current) => !current)}
        />
      )}
    />
  );

  if (!rules && !strength) {
    return control;
  }

  const check = checkPassword(value, rules ?? []);
  const steps = strength?.levels.length ?? 0;
  const score = strength?.score ? strength.score(value) : check.score;
  const filled = value === '' ? 0 : Math.max(1, Math.min(steps, Math.round(score * steps)));
  const tone = filled === 0 ? undefined : toneOf(filled, steps);
  const open = focused || (value !== '' && !check.ok);

  return (
    <Stack gap={0} data-slot={'password-input'} className={'w-full min-w-0'}>
      {control}

      {strength && (
        <Stack
          data-slot={'password-input-meter'}
          data-level={filled}
          data-tone={tone}
          direction={'horizontal'}
          align={'center'}
          gap={2}
          className={'mt-2'}
        >
          <Stack
            role={'meter'}
            aria-label={strength.label}
            aria-valuemin={0}
            aria-valuemax={steps}
            aria-valuenow={filled}
            aria-valuetext={filled > 0 ? strength.levels[filled - 1] : undefined}
            direction={'horizontal'}
            gap={1}
            className={'min-w-0 grow'}
          >
            {strength.levels.map((level, index) => (
              <span
                key={level}
                data-slot={'password-input-meter-step'}
                data-filled={index < filled || undefined}
                className={cn(
                  'h-1 min-w-0 flex-1 rounded-full bg-muted transition-colors duration-150 motion-reduce:transition-none',
                  index < filled && tone && STEP_FILL[tone]
                )}
              />
            ))}
          </Stack>
          <span aria-hidden data-slot={'password-input-meter-label'} className={cn('min-w-16 text-end text-xs', tone && STEP_INK[tone])}>
            {filled > 0 ? strength.levels[filled - 1] : ''}
          </span>
        </Stack>
      )}

      {rules && rules.length > 0 && (
        <Collapsible.Root open={open} data-slot={'password-input-checklist'} data-open={open || undefined}>
          <Collapsible.Panel keepMounted className={'collapsible-panel'}>
            <FieldPrimitive.Description render={<Stack as={'ul'} gap={1} className={'pt-2'} />}>
              {rules.map((rule) => {
                const met = check.passed.includes(rule.id);

                return (
                  <Stack
                    as={'li'}
                    key={rule.id}
                    data-slot={'password-input-rule'}
                    data-rule={rule.id}
                    data-met={met || undefined}
                    direction={'horizontal'}
                    align={'start'}
                    gap={1.5}
                    className={cn(
                      'text-xs transition-colors duration-150 motion-reduce:transition-none',
                      met ? 'text-success-soft-foreground' : (field.invalid ? 'text-destructive' : 'text-muted-foreground')
                    )}
                  >
                    <Stack as={'span'} gap={0} direction={'horizontal'} align={'center'} className={'h-lh shrink-0 [&_svg]:size-3.5'}>
                      {met ? <DoneGlyph /> : <PendingMark />}
                    </Stack>
                    <span className={'min-w-0'}>
                      <VisuallyHidden>{`${met ? labels.met : labels.unmet}: `}</VisuallyHidden>
                      {rule.label}
                    </span>
                  </Stack>
                );
              })}
            </FieldPrimitive.Description>
          </Collapsible.Panel>
        </Collapsible.Root>
      )}
    </Stack>
  );

});

PasswordInputBase.displayName = 'PasswordInput';

/** Bound to a form through `binding`: see `bindable` in core */
export const PasswordInput = bindable(PasswordInputBase, {
  kind: 'text',
  bind: (field: BoundValue<string>) => ({
    name    : field.name,
    ref     : field.ref,
    value   : field.value ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => field.onChange(event.currentTarget.value),
    onBlur  : field.onBlur
  })
});
