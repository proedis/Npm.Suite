'use client';

import * as React from 'react';

import { Field as FieldPrimitive } from '@base-ui/react/field';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { cn } from '../../core/cn';

import { CHOICE_ALIGN, CHOICE_FOCUS, CHOICE_ROW, ChoiceText } from '../choice/choice';
import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';


/* --------
 * Types Definition
 * -------- */

export type RadioVariant = 'default' | 'card';

export interface RadioGroupProps {
  /** The chosen option */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  /** `card` frames each option, when at least one needs a line of explanation. Defaults to `default` */
  variant?: RadioVariant;

  /** Defaults to `vertical`. In a row, at most three short options */
  orientation?: 'vertical' | 'horizontal';

  /** The error state. Inside a field with a `Field.Error` it is on already */
  invalid?: boolean;

  /** The focus moves, the choice does not; the value is submitted */
  readOnly?: boolean;

  disabled?: boolean;

  /** The name the choice is submitted under */
  name?: string;

  children?: React.ReactNode;
  className?: string;
}

export interface RadioProps {
  /** The value of the option */
  value: string;

  /** The label, as content */
  children?: React.ReactNode;

  /** A line under the label, and the place for the reason an option is disabled */
  description?: React.ReactNode;

  disabled?: boolean;

  className?: string;
}

interface RadioGroupState {
  readonly variant: RadioVariant;
  readonly invalid: boolean;
  readonly readOnly: boolean;
}


/* --------
 * Context Definition
 * -------- */

const RadioGroupContext = React.createContext<RadioGroupState>({ variant: 'default', invalid: false, readOnly: false });

RadioGroupContext.displayName = 'RadioGroupContext';


/* --------
 * Constants Definition
 * -------- */

const CIRCLE = [
  'relative inline-flex size-4 items-center justify-center rounded-full border border-input bg-card',
  'transition-colors duration-100 motion-reduce:transition-none',
  CHOICE_ALIGN,
  CHOICE_FOCUS,
  'data-checked:border-transparent data-checked:bg-primary',

  /* The chosen one does not react: a click does not change it */
  'not-data-checked:not-data-disabled:not-data-readonly:group-hover/choice:border-input-hover',

  'data-invalid:border-destructive data-invalid:inset-ring data-invalid:inset-ring-destructive',
  'data-invalid:data-checked:bg-destructive data-invalid:data-checked:inset-ring-0',

  'data-readonly:bg-muted data-readonly:data-checked:bg-muted-foreground',
  'data-disabled:opacity-50',

  /* In a card the focus is the card's */
  'in-data-[variant=card]:focus-visible:outline-none in-data-[variant=card]:focus-visible:ring-0'
].join(' ');

const DOT = 'size-1.5 rounded-full bg-primary-foreground in-data-readonly:bg-card';

/** The card: the whole frame is the target, and it carries the states of the radio inside */
const CARD = [
  'rounded-md border border-border bg-card px-1.75 py-1.25',
  'not-has-[[data-checked]]:not-data-disabled:not-data-readonly:hover:bg-accent',
  'has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary-soft',
  'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
  'has-focus-visible:ring-7 has-focus-visible:ring-ring/20',
  'data-invalid:border-destructive data-invalid:inset-ring data-invalid:inset-ring-destructive',
  'data-invalid:has-[[data-checked]]:bg-destructive-soft',
  'data-readonly:has-[[data-checked]]:border-input data-readonly:has-[[data-checked]]:bg-muted',
  'data-disabled:opacity-50'
].join(' ');


/* --------
 * Group
 * -------- */

/**
 * One choice among a few options, all visible: two to five short ones, or two to four cards when an
 * option needs explaining.
 *
 * ```tsx
 * <Field>
 *   <Field.Label required>Frequency</Field.Label>
 *   <RadioGroup value={frequency} onValueChange={setFrequency}>
 *     <Radio value={'weekly'}>Weekly</Radio>
 *     <Radio value={'monthly'} description={'On the first working day'}>Monthly</Radio>
 *   </RadioGroup>
 * </Field>
 * ```
 *
 * One Tab stop for the group; the arrows move and choose at once, skipping disabled options and
 * wrapping around. Once something is chosen there is no going back to nothing. In a field the label
 * names the group and is not clickable.
 *
 * Slots: `radio-group` (with `data-variant`, `data-orientation`), `radio` (the row or card),
 * `radio-circle`, `radio-dot`, `radio-text`, `radio-label`, `radio-description`.
 */
export function RadioGroup(props: RadioGroupProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    defaultValue,
    disabled = false,
    invalid = false,
    name,
    onValueChange,
    orientation = 'vertical',
    readOnly = false,
    value,
    variant = 'default'
  } = props;


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();


  // ----
  // Memoized Data
  // ----
  const isInvalid = invalid || field.invalid;

  const state = React.useMemo<RadioGroupState>(
    () => ({ variant, invalid: isInvalid, readOnly }),
    [ variant, isInvalid, readOnly ]
  );


  // ----
  // Component Render
  // ----
  return (
    <RadioGroupPrimitive
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as string)}
      disabled={disabled || field.disabled}
      readOnly={readOnly}
      name={name}
      aria-invalid={isInvalid || undefined}
      aria-required={field.required || undefined}
      data-slot={'radio-group'}
      data-variant={variant}
      data-orientation={orientation}
      data-field-control={''}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap',
        orientation === 'horizontal' && (variant === 'card' ? 'gap-2 *:flex-1' : 'gap-x-4 gap-y-2'),
        className
      )}
    >
      <RadioGroupContext.Provider value={state}>
        {children}
      </RadioGroupContext.Provider>
    </RadioGroupPrimitive>
  );

}

RadioGroup.displayName = 'RadioGroup';


/* --------
 * Component Definition
 * -------- */

/** An option of a `RadioGroup`. The label is its content */
export function Radio(props: RadioProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, className, description, disabled = false, value } = props;


  // ----
  // Internal Hooks
  // ----
  const group = React.useContext(RadioGroupContext);
  const field = useFieldControl();
  const descriptionId = React.useId();


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const hasDescription = description !== null && description !== undefined && description !== false;

  return (
    <FieldPrimitive.Item disabled={isDisabled}>
      <label
        data-slot={'radio'}
        data-variant={group.variant}
        data-disabled={isDisabled || undefined}
        data-readonly={group.readOnly || undefined}
        data-invalid={group.invalid || undefined}
        className={cn(CHOICE_ROW, group.variant === 'card' && CARD, className)}
      >
        <RadioPrimitive.Root
          value={value}
          disabled={isDisabled}
          aria-describedby={hasDescription ? descriptionId : undefined}
          data-invalid={group.invalid || undefined}
          data-slot={'radio-circle'}
          className={CIRCLE}
        >
          <RadioPrimitive.Indicator data-slot={'radio-dot'} className={DOT} />
        </RadioPrimitive.Root>

        <ChoiceText slot={'radio'} label={children} description={description} descriptionId={descriptionId} />
      </label>
    </FieldPrimitive.Item>
  );

}

Radio.displayName = 'Radio';
