import type * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/**
 * What kind of value a control holds, so a form library knows which constraints of a schema it can
 * hand it: a length to a text, bounds and a step to a number, two dates to a date, a count of items
 * to a list.
 */
export type BindingKind = 'text' | 'number' | 'date' | 'option' | 'options' | 'boolean' | 'files';

/** What a form library hands a control: the value, how to change it, and where it is submitted */
export interface BoundValue<TValue = unknown> {
  /** The value in the form, `null` or `undefined` while it is empty */
  readonly value: TValue | null | undefined;

  /** Writes a value into the form */
  readonly onChange: (value: TValue) => void;

  /** The control lost the focus: when a form validates on blur, it validates now */
  readonly onBlur: () => void;

  /** The path of the value in the form */
  readonly name: string;

  /** The element that takes the focus, for the form to focus it on an error */
  readonly ref: React.Ref<never>;
}

/**
 * How a control is bound to a form library, declared by the control itself: the one that knows the
 * shape of its value. A form library reads it from the component (`TextInput.binding`) and imports
 * no control, so it pulls none of their optional peers.
 *
 * ```ts
 * const binding: ControlBinding<string> = {
 *   kind: 'text',
 *   bind: (field) => ({ value: field.value ?? '', onChange: (event) => field.onChange(event.currentTarget.value), … })
 * };
 * ```
 */
export interface ControlBinding<TValue = unknown> {
  /** The kind of the value, or a function of the props for a control whose value depends on them */
  readonly kind: BindingKind | ((props: Readonly<Record<string, unknown>>) => BindingKind);

  /**
   * The props that bind the control to the value. It also receives the props the control was written
   * with, for a control whose value depends on them: a multiple Combobox, a DatePicker of a range.
   * A method, so a binding of a precise value fits where any binding is asked for
   */
  bind(field: BoundValue<TValue>, props: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>>;
}

/** A component that declares how it binds: every control of the package, and one of yours */
export interface Bindable {
  readonly binding?: ControlBinding<unknown>;
}


/* --------
 * Helpers
 * -------- */

/**
 * Declares how a control binds to a form, on the component itself.
 *
 * ```tsx
 * export const TimeSlots = bindable(TimeSlotsBase, {
 *   kind: 'options',
 *   bind: (field) => ({ value: field.value ?? [], onValueChange: field.onChange, onBlur: field.onBlur })
 * });
 * ```
 */
export function bindable<TComponent extends object, TValue>(
  component: TComponent,
  binding: ControlBinding<TValue>
): TComponent & { readonly binding: ControlBinding<TValue> } {
  return Object.assign(component, { binding });
}
