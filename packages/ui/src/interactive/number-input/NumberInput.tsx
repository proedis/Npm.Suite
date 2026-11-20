'use client';

import * as React from 'react';

import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';

import { useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';

import { useFieldControl } from '../field/fieldContext';
import { TEXT_CONTROL_FRAME, TEXT_CONTROL_SIZES, TEXT_CONTROL_TEXT, textControlState } from '../text-control/textControl';

import { acceptsTyping, cleanPaste, separatorsOf, widthClass } from './numberText';

import type { BaseProps } from '../../core/base';

import type { TextControlSize } from '../text-control/textControl';

import type { NumberRules } from './numberText';


/* --------
 * Types Definition
 * -------- */

export interface StrictNumberInputProps extends BaseProps {
  /** The value: a number, or `null` for empty. Empty is not zero */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;

  /** Defaults to 0: negatives are asked for */
  min?: number;

  /** No maximum when absent */
  max?: number;

  /** What an arrow adds or takes away. Defaults to 1; Shift with an arrow is ten steps */
  step?: number;

  /** Decimals admitted and shown. Defaults to 0 */
  decimals?: number;

  /** The language of separators and grouping, the same the value is read with elsewhere */
  locale?: string;

  /** The unit after the value: kg, €, %. A long one widens the field by a step */
  suffix?: React.ReactNode;

  /** The same three heights as a TextInput. Defaults to `md` */
  size?: TextControlSize;

  /** The error state. Inside a field with a `Field.Error` it is on already */
  invalid?: boolean;

  readOnly?: boolean;
  disabled?: boolean;

  /**
   * How a screen reader names the kind of control ("number field"). Base UI writes it in English;
   * without this prop the attribute is removed rather than left in the wrong language.
   */
  roleDescription?: string;

  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/** `loadingLabel` is required with `loading`: the spinner takes the place of the unit */
export type NumberInputLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

export type NumberInputProps = StrictNumberInputProps & NumberInputLoadingProps;


/* --------
 * Constants Definition
 * -------- */

const SUFFIX_GAP: Readonly<Record<TextControlSize, string>> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5'
};


/* --------
 * Helpers
 * -------- */

/** Text replacing the selection, announced to React as typed */
function insertText(input: HTMLInputElement, text: string): void {
  input.setRangeText(text, input.selectionStart ?? input.value.length, input.selectionEnd ?? input.value.length, 'end');
  input.dispatchEvent(new Event('input', { bubbles: true }));
}


/* --------
 * Component Definition
 * -------- */

/**
 * The field for a number: a text field with the value on the right, next to its unit. No buttons:
 * the value is typed, or moved with the arrow keys.
 *
 * ```tsx
 * <Field span={2}>
 *   <Field.Label>Weight</Field.Label>
 *   <NumberInput value={weight} onValueChange={setWeight} max={5000} decimals={2} suffix={'kg'} locale={'it-IT'} />
 *   <Field.Description>Up to 5,000 kg</Field.Description>
 * </Field>
 * ```
 *
 * On Base UI's `NumberField`, with what the design system wants different:
 *
 * - the format arrives on leaving the field or with Enter, never while typing, grouped always;
 * - a typed character that would not make a number does not enter: the group separator, a second
 *   decimal separator, a digit past `decimals`, a minus when negatives are not allowed. The numpad
 *   decimal key writes the decimal separator of the language;
 * - a paste is taken whole or not at all, after dropping spaces and the field's own unit;
 * - a value out of range stays as it is, in error: never corrected in silence;
 * - the wheel does not change the value, Home and End move the caret, Alt does not make a smaller
 *   step.
 *
 * The width follows the largest number admitted, from 96 to 160px: half a number is another number.
 *
 * Slots: `number-input` (the frame, with `data-size` and the states), `number-input-control`,
 * `number-input-suffix`, `number-input-spinner`.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    className,
    decimals = 0,
    defaultValue,
    disabled = false,
    id,
    invalid = false,
    loading = false,
    loadingLabel,
    locale,
    max,
    min = 0,
    name,
    onValueChange,
    placeholder,
    readOnly = false,
    roleDescription,
    size = 'md',
    step = 1,
    suffix,
    value,
    ...others
  } = props;

  const { baseClasses } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  const inputRef = React.useRef<HTMLInputElement | null>(null);


  // ----
  // Memoized Data
  // ----
  const rules = React.useMemo<NumberRules>(() => ({
    separators   : separatorsOf(locale),
    decimals,
    allowNegative: min < 0
  }), [ locale, decimals, min ]);

  const format = React.useMemo<Intl.NumberFormatOptions>(() => ({
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    /* `true` leaves a four digit number ungrouped in Italian: 1248,50 */
    useGrouping          : 'always' as unknown as boolean
  }), [ decimals ]);

  const unitText = typeof suffix === 'string' ? suffix : undefined;


  // ----
  // Handlers
  // ----
  const setRefs = useForkRef(inputRef, ref);

  const handleBeforeInput = (event: React.FormEvent<HTMLInputElement> & { data?: string | null }): void => {
    const inserted = event.data;
    const input = event.currentTarget;

    if (!inserted) {
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = input.value.slice(0, start) + inserted + input.value.slice(end);

    if (!acceptsTyping(next, inserted, rules)) {
      event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const clean = cleanPaste(event.clipboardData.getData('text'), unitText, rules);

    if (clean !== null && !readOnly) {
      insertText(event.currentTarget, clean);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement> & { preventBaseUIHandler?: () => void }): void => {
    const input = event.currentTarget;

    /* Home and End move the caret: Base UI would write the bounds */
    if (event.key === 'Home' || event.key === 'End') {
      event.preventBaseUIHandler?.();
      return;
    }

    /* The numpad's decimal key writes the decimal separator of the language, not its own character */
    if (event.code === 'NumpadDecimal') {
      event.preventDefault();

      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const next = input.value.slice(0, start) + rules.separators.decimal + input.value.slice(end);

      if (!readOnly && acceptsTyping(next, rules.separators.decimal, rules)) {
        insertText(input, rules.separators.decimal);
      }

      return;
    }

    /*
     * Enter counts as leaving the field: it formats and checks, then the form does what it does.
     * Base UI commits only on blur, so the field blurs and takes the focus back.
     */
    if (event.key === 'Enter') {
      input.blur();
      input.focus();
    }
  };


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const isInvalid = invalid || field.invalid;
  const hasSuffix = suffix !== null && suffix !== undefined && suffix !== false;

  return (
    <NumberFieldPrimitive.Root
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue ?? undefined}
      onValueChange={(next) => onValueChange?.(next)}
      min={min}
      max={max}
      step={step}
      smallStep={step}
      largeStep={step * 10}
      format={format}
      locale={locale}
      allowOutOfRange
      allowWheelScrub={false}
      disabled={isDisabled}
      readOnly={readOnly}
      render={<div />}
      data-slot={'number-input'}
      data-size={size}
      data-loading={loading || undefined}
      {...textControlState({ invalid: isInvalid, readOnly, disabled: isDisabled })}
      className={cn(
        TEXT_CONTROL_FRAME,
        TEXT_CONTROL_SIZES[size],
        SUFFIX_GAP[size],
        'flex cursor-text items-center',
        widthClass(max, decimals, locale, typeof unitText === 'string' && unitText.length > 2),
        baseClasses,
        className
      )}
    >
      <NumberFieldPrimitive.Input
        ref={setRefs}
        placeholder={placeholder}
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-required={field.required || undefined}
        aria-invalid={isInvalid || undefined}
        aria-roledescription={roleDescription}
        data-slot={'number-input-control'}
        data-field-control={''}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className={cn('h-full min-w-0 flex-1 bg-transparent text-right outline-none', TEXT_CONTROL_TEXT)}
      />

      {loading
        ? <Spinner data-slot={'number-input-spinner'} size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />
        : hasSuffix && <span data-slot={'number-input-suffix'} className={'shrink-0 text-muted-foreground'}>{suffix}</span>}
    </NumberFieldPrimitive.Root>
  );

});

NumberInput.displayName = 'NumberInput';
