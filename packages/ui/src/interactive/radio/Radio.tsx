'use client';

import * as React from 'react';

import { Field as FieldPrimitive } from '@base-ui/react/field';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { optionalContextBuilder } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { CHOICE_ALIGN, CHOICE_FOCUS, CHOICE_ROW, ChoiceText, GROUP_FOCUS_PROPS, baseOrientation, choiceGroupClasses } from '../choice/choice';
import { useFieldControl, useFieldRegistryContext, useNonNativeFieldLabel } from '../field/fieldContext';
import { isPresent } from '../presence/presence';

import type { BaseProps } from '../../core/base';
import type { Direction, Responsive } from '../../core/responsive';


/* --------
 * Types Definition
 * -------- */

export type RadioVariant = 'default' | 'card';

export interface StrictRadioGroupProps extends BaseProps {
  /** The chosen option */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  /** `card` frames each option, when at least one needs a line of explanation. Defaults to `default` */
  variant?: RadioVariant;

  /**
   * Defaults to `vertical`. In a row, at most three short options. Per breakpoint too:
   * `{ base: 'vertical', md: 'horizontal' }`
   */
  orientation?: Responsive<Direction>;

  /** The error state. Inside a field with a `Field.Error` it is on already */
  invalid?: boolean;

  /** The focus moves, the choice does not; the value is submitted */
  readOnly?: boolean;

  disabled?: boolean;

  /** The name the choice is submitted under */
  name?: string;

  children?: React.ReactNode;

  /** Classes for the group, last so they win */
  className?: string;
}

/** Outside a `Field` the group needs a name of its own: `aria-label` or `aria-labelledby` */
export type RadioGroupProps = StrictRadioGroupProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictRadioGroupProps | 'ref' | 'onChange' | 'defaultValue'
>;

export interface StrictRadioProps extends BaseProps {
  /** The value of the option */
  value: string;

  /** The label, as content */
  children?: React.ReactNode;

  /** A line under the label, and the place for the reason an option is disabled */
  description?: React.ReactNode;

  disabled?: boolean;

  /** Classes for the row, last so they win */
  className?: string;
}

/** The row takes `className` and the shared props; the native props and the ref reach the circle, which takes the focus */
export type RadioProps = StrictRadioProps & Omit<React.ComponentProps<'span'>, keyof StrictRadioProps | 'ref' | 'onChange'>;

interface RadioGroupState {
  readonly variant: RadioVariant;
  readonly invalid: boolean;
  readonly readOnly: boolean;
}


/* --------
 * Context Definition
 * -------- */

const [ RadioGroupContext, useRadioGroupContext ] = optionalContextBuilder<RadioGroupState>('RadioGroup', { variant: 'default', invalid: false, readOnly: false });


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
 * Slots: `radio-group` (with `data-variant`, `data-orientation`, `data-disabled`, `data-readonly`,
 * `data-invalid`), `radio` (the row or card),
 * `radio-circle`, `radio-dot`, `radio-text`, `radio-label`, `radio-description`.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>((props, ref) => {

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
    variant = 'default',
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();


  // ----
  // Memoized Data
  // ----
  const isInvalid = invalid || field.invalid;
  const isDisabled = disabled || field.disabled;

  const state = React.useMemo<RadioGroupState>(
    () => ({ variant, invalid: isInvalid, readOnly }),
    [ variant, isInvalid, readOnly ]
  );


  // ----
  // Component Render
  // ----
  return (
    <RadioGroupPrimitive
      {...rest}
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as string)}
      disabled={isDisabled}
      readOnly={readOnly}
      name={name}
      aria-invalid={isInvalid || undefined}
      aria-required={field.required || undefined}
      {...GROUP_FOCUS_PROPS}
      data-slot={'radio-group'}
      data-variant={variant}
      data-orientation={baseOrientation(orientation)}
      data-disabled={isDisabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-field-control={''}
      className={cn(
        'flex',
        choiceGroupClasses(orientation, variant === 'card' ? 'card' : 'list'),
        baseClasses,
        className
      )}
    >
      <RadioGroupContext.Provider value={state}>
        {children}
      </RadioGroupContext.Provider>
    </RadioGroupPrimitive>
  );

});

RadioGroup.displayName = 'RadioGroup';


/* --------
 * Component Definition
 * -------- */

/**
 * An option of a `RadioGroup`. The label is its content.
 *
 * The ref and the native props reach the circle, the element that takes the focus, so an option can
 * be the trigger of a tooltip; `className` and the shared props reach the row.
 */
export const Radio = React.forwardRef<HTMLSpanElement, RadioProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { 'aria-describedby': ariaDescribedBy, children, className, description, disabled = false, value, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const group = useRadioGroupContext();
  const field = useFieldControl();
  const registry = useFieldRegistryContext();
  const descriptionId = React.useId();


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;
  const hasDescription = isPresent(description);

  const row = (
    <label
      data-slot={'radio'}
      data-variant={group.variant}
      data-disabled={isDisabled || undefined}
      data-readonly={group.readOnly || undefined}
      data-invalid={group.invalid || undefined}
      className={cn(CHOICE_ROW, group.variant === 'card' && CARD, baseClasses, className)}
    >
      <RadioPrimitive.Root
        {...rest}
        ref={ref}
        value={value}
        disabled={isDisabled}
        aria-describedby={[ ariaDescribedBy, hasDescription ? descriptionId : undefined ].filter(Boolean).join(' ') || undefined}
        data-invalid={group.invalid || undefined}
        data-slot={'radio-circle'}
        className={CIRCLE}
      >
        <RadioPrimitive.Indicator data-slot={'radio-dot'} className={DOT} />
      </RadioPrimitive.Root>

      <ChoiceText slot={'radio'} label={children} description={description} descriptionId={descriptionId} />
    </label>
  );

  /*
   * Inside a `Field` each option is its own item, so the field's label names the group and not the
   * option. Base UI's item demands a field around it: outside one, a group named by `aria-label` crashed.
   */
  return registry ? <FieldPrimitive.Item disabled={isDisabled}>{row}</FieldPrimitive.Item> : row;

});

Radio.displayName = 'Radio';
