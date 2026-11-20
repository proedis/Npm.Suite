'use client';

import * as React from 'react';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';
import { Field as FieldPrimitive } from '@base-ui/react/field';

import { optionalContextBuilder, useEnhancedEffect } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { CHECKBOX_BOX, CHOICE_ALIGN, CHOICE_FOCUS, CHOICE_ROW, CheckGlyph, ChoiceText, DashGlyph, GROUP_FOCUS_PROPS, baseOrientation, choiceGroupClasses } from '../choice/choice';
import { isPresent } from '../presence/presence';
import {
  useFieldControl,
  useFieldRegistryContext,
  useNonNativeFieldLabel
} from '../field/fieldContext';

import type { BaseProps } from '../../core/base';
import type { Direction, Responsive } from '../../core/responsive';


/* --------
 * Types Definition
 * -------- */

export interface StrictCheckboxProps extends BaseProps {
  /** The label of the option, as content. Without it the box needs an `aria-label` */
  children?: React.ReactNode;

  /** A line under the label, and the place for the reason an option is disabled or read only */
  description?: React.ReactNode;

  /** The value of the option inside a `CheckboxGroup` */
  value?: string;

  /** Inside a `CheckboxGroup`: this is the box that checks or clears all the others */
  parent?: boolean;

  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;

  /** Partial. Computed by the group for a parent box; set by hand anywhere else */
  indeterminate?: boolean;

  /** A single checkbox that must be ticked: the asterisk after its label, `aria-required` on the box */
  required?: boolean;

  /** The error state. Inside a field with a `Field.Error` it is on already */
  invalid?: boolean;

  /** The value cannot change here, and is still submitted and reachable */
  readOnly?: boolean;

  disabled?: boolean;

  /** The name it is submitted under */
  name?: string;

  /** Classes for the row, last so they win */
  className?: string;
}

/**
 * The row takes `className` and the shared props; everything else a `<span>` accepts goes on the box,
 * the element that takes the focus: `id`, `aria-*`, `onBlur` for a form library, a tooltip's handlers.
 */
export type CheckboxProps = StrictCheckboxProps & Omit<
  React.ComponentProps<'span'>,
  keyof StrictCheckboxProps | 'ref' | 'onChange' | 'defaultValue'
>;

export interface StrictCheckboxGroupProps extends BaseProps {
  /** The values that are checked */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;

  /**
   * Defaults to `vertical`. In a row, at most three short options. Per breakpoint too:
   * `{ base: 'vertical', md: 'horizontal' }`
   */
  orientation?: Responsive<Direction>;

  /** Every option of the group */
  disabled?: boolean;

  /** Every option of the group: reachable and submitted, not changeable */
  readOnly?: boolean;

  children?: React.ReactNode;

  /** Classes for the group, last so they win */
  className?: string;
}

/** Outside a `Field` the group needs a name of its own: `aria-label` or `aria-labelledby` */
export type CheckboxGroupProps = StrictCheckboxGroupProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictCheckboxGroupProps | 'ref' | 'onChange' | 'defaultValue'
>;

interface GroupChild {
  readonly value: string;
  readonly locked: boolean;
}

interface CheckboxGroupState {
  readonly value: readonly string[];
  readonly setValue: (value: string[]) => void;
  readonly readOnly: boolean;
  readonly register: (id: string, child: GroupChild) => () => void;
  readonly children: readonly GroupChild[];
}


/* --------
 * Context Definition
 * -------- */

const [ CheckboxGroupContext, useCheckboxGroupContext ] = optionalContextBuilder<CheckboxGroupState | null>('CheckboxGroup', null);


/* --------
 * Constants Definition
 * -------- */

const BOX = [ CHECKBOX_BOX, CHOICE_ALIGN, CHOICE_FOCUS ].join(' ');


/* --------
 * Group
 * -------- */

/**
 * Several options checked together, up to seven, all visible.
 *
 * ```tsx
 * <Field>
 *   <Field.Label required>Days</Field.Label>
 *   <CheckboxGroup value={days} onValueChange={setDays}>
 *     <Checkbox parent>Every day</Checkbox>
 *     <Checkbox value={'mon'}>Monday</Checkbox>
 *     <Checkbox value={'tue'}>Tuesday</Checkbox>
 *   </CheckboxGroup>
 *   <Field.Error>{errors.days}</Field.Error>
 * </Field>
 * ```
 *
 * In a field the label becomes the name of the group, not a clickable label. A `parent` box is
 * computed from the others: partial when some are checked, and a click checks every option that can
 * change when it is empty or partial, clears them when it is checked. Disabled and read-only options
 * keep their value. Two levels at most, and the children are indented.
 *
 * Slots: `checkbox-group` (with `data-orientation`, `data-disabled`, `data-readonly`, `data-invalid`),
 * and the slots of each `Checkbox`.
 */
export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    defaultValue = [],
    disabled = false,
    onValueChange,
    orientation = 'vertical',
    readOnly = false,
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();


  // ----
  // Internal State
  // ----
  const [ ownValue, setOwnValue ] = React.useState<string[]>(defaultValue);
  const [ registered, setRegistered ] = React.useState<ReadonlyMap<string, GroupChild>>(() => new Map());

  const current = value ?? ownValue;


  // ----
  // Memoized Data
  // ----

  /* Stable on purpose: the options register in an effect that depends on it */
  const register = React.useCallback((id: string, child: GroupChild) => {
    setRegistered((map) => new Map(map).set(id, child));

    return () => setRegistered((map) => {
      const next = new Map(map);

      next.delete(id);

      return next;
    });
  }, []);

  const state = React.useMemo<CheckboxGroupState>(() => ({
    value   : current,
    readOnly,
    children: [ ...registered.values() ],
    setValue: (next) => {
      if (value === undefined) {
        setOwnValue(next);
      }

      onValueChange?.(next);
    },
    register
  }), [ current, readOnly, registered, value, onValueChange, register ]);


  // ----
  // Component Render
  // ----
  const isDisabled = disabled || field.disabled;

  return (
    <CheckboxGroupPrimitive
      {...rest}
      ref={ref}
      value={current}
      onValueChange={(next) => state.setValue(next)}
      disabled={isDisabled}
      aria-invalid={field.invalid || undefined}
      aria-required={field.required || undefined}
      aria-readonly={readOnly || undefined}
      {...GROUP_FOCUS_PROPS}
      data-slot={'checkbox-group'}
      data-orientation={baseOrientation(orientation)}
      data-disabled={isDisabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={field.invalid || undefined}
      data-field-control={''}
      className={cn(
        'flex',
        choiceGroupClasses(orientation),
        'has-[>[data-parent]]:*:not-data-parent:ms-6',
        baseClasses,
        className
      )}
    >
      <CheckboxGroupContext.Provider value={state}>
        {children}
      </CheckboxGroupContext.Provider>
    </CheckboxGroupPrimitive>
  );

});

CheckboxGroup.displayName = 'CheckboxGroup';


/* --------
 * Component Definition
 * -------- */

/**
 * A tick that is saved with the form: a confirmation, an option. Something that takes effect at once
 * is a `Switch`.
 *
 * ```tsx
 * <Field>
 *   <Checkbox required name={'terms'}>I accept the terms</Checkbox>
 *   <Field.Error>{errors.terms}</Field.Error>
 * </Field>
 * ```
 *
 * The whole row is the target, label and description included. A single checkbox in a field has no
 * label above: its own label carries the asterisk, and the field's messages line up with it. Space
 * ticks it, Enter does not.
 *
 * Read only keeps it reachable and submitted, grey at full opacity; disabled is half opacity and out
 * of the Tab order. The description says why.
 *
 * Slots: `checkbox` (the row, with `data-disabled`, `data-readonly`, `data-invalid`, `data-parent`),
 * `checkbox-box`, `checkbox-indicator`, `checkbox-text`, `checkbox-label`, `checkbox-description`.
 *
 * The ref and the native props reach the box, the element that takes the focus, so a checkbox can be
 * the trigger of a tooltip or the target of a form library; `className` and the shared props reach the row.
 */
export const Checkbox = React.forwardRef<HTMLSpanElement, CheckboxProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-describedby': ariaDescribedBy,
    checked,
    children,
    className,
    defaultChecked,
    description,
    disabled = false,
    indeterminate = false,
    invalid = false,
    name,
    onCheckedChange,
    parent = false,
    readOnly = false,
    required = false,
    value,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();
  const registry = useFieldRegistryContext();
  const group = useCheckboxGroupContext();
  const descriptionId = React.useId();
  const childId = React.useId();


  // ----
  // Lifecycle Events
  // ----
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || (group?.readOnly ?? false);
  const isInvalid = invalid || field.invalid;
  const groupRegister = group?.register;

  /* A single checkbox is the whole field: its `required` is the field's */
  useEnhancedEffect(() => {
    if (group || !registry || !required) {
      return undefined;
    }

    registry.setRequired(true);

    return () => registry.setRequired(false);
  }, [ group, registry, required ]);

  useEnhancedEffect(() => {
    if (!groupRegister || parent || value === undefined) {
      return undefined;
    }

    return groupRegister(childId, { value, locked: isDisabled || isReadOnly });
  }, [ groupRegister, parent, value, childId, isDisabled, isReadOnly ]);


  // ----
  // Memoized Data
  // ----
  const parentState = React.useMemo(() => {
    if (!group || !parent) {
      return null;
    }

    const active = group.children.filter((child) => !child.locked).map((child) => child.value);
    const all = group.children.map((child) => child.value);
    const allActiveChecked = active.length > 0 && active.every((item) => group.value.includes(item));
    const someChecked = all.some((item) => group.value.includes(item));

    return {
      checked      : allActiveChecked,
      indeterminate: !allActiveChecked && someChecked,
      toggle       : () => {
        group.setValue(allActiveChecked
          ? group.value.filter((item) => !active.includes(item))
          : [ ...new Set([ ...group.value, ...active ]) ]);
      }
    };
  }, [ group, parent ]);


  // ----
  // Component Render
  // ----
  const hasDescription = isPresent(description);
  const describedBy = [ ariaDescribedBy, hasDescription ? descriptionId : undefined ].filter(Boolean).join(' ') || undefined;
  const isIndeterminate = parentState ? parentState.indeterminate : indeterminate;
  const showRequired = required && !group;

  const box = (
    <CheckboxPrimitive.Root
      {...rest}
      ref={ref}
      name={parent ? undefined : name}
      value={parent ? undefined : value}
      /*
       * Told it is a parent, with no `allValues` on the group, Base UI keeps it out of the group's
       * value (it would otherwise take the field's `name` as its value) and leaves its state to us.
       */
      parent={parent}
      checked={parentState ? parentState.checked : checked}
      defaultChecked={parentState ? undefined : defaultChecked}
      indeterminate={isIndeterminate}
      onCheckedChange={(next) => {
        if (parentState) {
          parentState.toggle();
          return;
        }

        onCheckedChange?.(next);
      }}
      disabled={isDisabled}
      readOnly={isReadOnly}
      aria-describedby={describedBy}
      aria-required={showRequired || undefined}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid || undefined}
      data-slot={'checkbox-box'}
      data-field-control={group ? undefined : ''}
      className={BOX}
    >
      <CheckboxPrimitive.Indicator data-slot={'checkbox-indicator'} className={'flex items-center justify-center'}>
        {isIndeterminate ? <DashGlyph /> : <CheckGlyph />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  const row = (
    <label
      data-slot={'checkbox'}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-parent={parent || undefined}
      className={cn(CHOICE_ROW, baseClasses, className)}
    >
      {box}
      <ChoiceText
        slot={'checkbox'}
        label={children}
        description={description}
        descriptionId={descriptionId}
        required={showRequired}
      />
    </label>
  );

  /*
   * In a group inside a `Field` each option is its own item, so the group's name does not become the
   * option's name. Base UI's item demands a field around it: outside one, a named group crashed.
   */
  return group && registry ? <FieldPrimitive.Item disabled={isDisabled}>{row}</FieldPrimitive.Item> : row;

});

Checkbox.displayName = 'Checkbox';
