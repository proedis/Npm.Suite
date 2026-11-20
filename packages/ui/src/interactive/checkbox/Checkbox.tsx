'use client';

import * as React from 'react';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';
import { Field as FieldPrimitive } from '@base-ui/react/field';

import { cn } from '../../core/cn';

import { CHECKBOX_BOX, CHOICE_ALIGN, CHOICE_FOCUS, CHOICE_ROW, CheckGlyph, ChoiceText, DashGlyph, GROUP_FOCUS_PROPS, baseOrientation, choiceGroupClasses } from '../choice/choice';
import {
  FieldRegistryContext,
  useFieldControl,
  useIsomorphicLayoutEffect,
  useNonNativeFieldLabel
} from '../field/fieldContext';

import type { Direction, Responsive } from '../../core/responsive';


/* --------
 * Types Definition
 * -------- */

export interface CheckboxProps {
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

  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface CheckboxGroupProps {
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
  className?: string;
}

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

const CheckboxGroupContext = React.createContext<CheckboxGroupState | null>(null);

CheckboxGroupContext.displayName = 'CheckboxGroupContext';


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
 * Slots: `checkbox-group` (with `data-orientation`), and the slots of each `Checkbox`.
 */
export function CheckboxGroup(props: CheckboxGroupProps): React.ReactNode {

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
    value
  } = props;


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
  return (
    <CheckboxGroupPrimitive
      value={current}
      onValueChange={(next) => state.setValue(next)}
      disabled={disabled || field.disabled}
      aria-invalid={field.invalid || undefined}
      aria-required={field.required || undefined}
      aria-readonly={readOnly || undefined}
      {...GROUP_FOCUS_PROPS}
      data-slot={'checkbox-group'}
      data-orientation={baseOrientation(orientation)}
      data-field-control={''}
      className={cn(
        'flex',
        choiceGroupClasses(orientation),
        'has-[>[data-parent]]:*:not-data-parent:ms-6',
        className
      )}
    >
      <CheckboxGroupContext.Provider value={state}>
        {children}
      </CheckboxGroupContext.Provider>
    </CheckboxGroupPrimitive>
  );

}

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
 * Slots: `checkbox` (the row, with `data-disabled`, `data-readonly`, `data-parent`), `checkbox-box`,
 * `checkbox-indicator`, `checkbox-text`, `checkbox-label`, `checkbox-description`.
 */
export function Checkbox(props: CheckboxProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    checked,
    children,
    className,
    defaultChecked,
    description,
    disabled = false,
    id,
    indeterminate = false,
    invalid = false,
    name,
    onCheckedChange,
    parent = false,
    readOnly = false,
    required = false,
    value
  } = props;


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();
  const registry = React.useContext(FieldRegistryContext);
  const group = React.useContext(CheckboxGroupContext);
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
  useIsomorphicLayoutEffect(() => {
    if (group || !registry || !required) {
      return undefined;
    }

    registry.setRequired(true);

    return () => registry.setRequired(false);
  }, [ group, registry, required ]);

  useIsomorphicLayoutEffect(() => {
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
  const hasDescription = description !== null && description !== undefined && description !== false;
  const describedBy = [ ariaDescribedBy, hasDescription ? descriptionId : undefined ].filter(Boolean).join(' ') || undefined;
  const isIndeterminate = parentState ? parentState.indeterminate : indeterminate;
  const showRequired = required && !group;

  const box = (
    <CheckboxPrimitive.Root
      id={id}
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
      aria-label={ariaLabel}
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
      data-parent={parent || undefined}
      className={cn(CHOICE_ROW, className)}
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

  /* In a group each option is its own item, so the group's name does not become the option's name */
  return group ? <FieldPrimitive.Item disabled={isDisabled}>{row}</FieldPrimitive.Item> : row;

}

Checkbox.displayName = 'Checkbox';
