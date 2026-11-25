import * as React from 'react';

import { useController, useFormContext } from 'react-hook-form';

import { useForkRef } from '@proedis/react';
import { Field } from '@proedis/ui/forms/field';
import { tryDescribeField } from '@proedis/zod';


import type { Bindable, ControlBinding } from '@proedis/ui';
import type { FieldProps } from '@proedis/ui/forms/field';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { schemaProps } from './schemaProps';
import { useBoundSchema } from './schemaContext';


/* --------
 * Types Definition
 * -------- */

export interface StrictBoundFieldProps<TValues extends FieldValues> {
  /** The path of the value in the form: `plate`, `address.town`, `rows.0.qty` */
  name: FieldPath<TValues>;

  /** The control, one: it binds itself through the `binding` it declares */
  children: React.ReactElement;

  /** How to bind a control that declares no binding of its own: a control of yours, or one with a value of its own shape */
  binding?: ControlBinding<unknown>;

  /** An error of yours, in place of the one of the form: an answer of the server you keep apart */
  error?: React.ReactNode;
}

export type BoundFieldProps<TValues extends FieldValues = FieldValues> = StrictBoundFieldProps<TValues>
  & Omit<FieldProps, keyof StrictBoundFieldProps<TValues>>;


/* --------
 * Helpers
 * -------- */

/** A handler the caller wrote on the control runs first, then the form's: neither replaces the other */
function composeHandlers(
  own: Readonly<Record<string, unknown>>,
  bound: Readonly<Record<string, unknown>>
): Record<string, unknown> {
  const composed: Record<string, unknown> = {};

  for (const [ key, handler ] of Object.entries(bound)) {
    const mine = own[key];

    if (key.startsWith('on') && typeof handler === 'function' && typeof mine === 'function') {
      composed[key] = (...args: unknown[]) => {
        mine(...args);
        handler(...args);
      };
    }
  }

  return composed;
}

/** The values of an object that are set: an `undefined` from the schema must not hide a default of the control */
function defined(values: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([ , value ]) => value !== undefined));
}


/* --------
 * Component Definition
 * -------- */

/**
 * A `Field` of `@proedis/ui` bound to a value of the form around it, with its control.
 *
 * ```tsx
 * <BoundField name={'plate'} span={2}>
 *   <TextInput width={'code'} />
 * </BoundField>
 * ```
 *
 * The name is the whole contract. From it the field reads its value and its error from the form, and,
 * when the form has a schema, its label, whether it is required, and the bounds of its control: the
 * length of a text (its counter), the bounds and the step of a number, the first and the last day of a
 * date, the number of files of an upload. Every prop of `Field` is accepted, and wins over the schema.
 *
 * The control binds itself: every control of `@proedis/ui` declares how (`TextInput.binding`), so the
 * field hands it the value, the change, the blur and the ref in the shape it takes. A prop written on
 * the control wins over the schema's; a handler written on it runs before the form's.
 *
 * It must sit inside a `BoundForm`, and throws otherwise: outside one there is no value to bind.
 */
export function BoundField<TValues extends FieldValues = FieldValues>(props: BoundFieldProps<TValues>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    binding: bindingProp,
    children,
    counter,
    counterExceeded,
    disabled,
    error,
    label,
    name,
    required,
    ...fieldProps
  } = props;


  // ----
  // Internal Hooks
  // ----
  const form = useFormContext<TValues>() as ReturnType<typeof useFormContext<TValues>> | null;

  if (!form) {
    throw new Error(`BoundField "${name}" must sit inside a BoundForm: outside one there is no value to bind`);
  }

  const { field, fieldState } = useController({ name, control: form.control });
  const schema = useBoundSchema();

  const descriptor = React.useMemo(() => (schema ? tryDescribeField(schema, name) : null), [ schema, name ]);

  const control = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  const controlProps = control.props;
  const binding = bindingProp ?? (control.type as Bindable).binding;

  const handleRef = useForkRef(
    controlProps.ref as React.Ref<unknown> | undefined,
    field.ref as React.Ref<unknown>
  );

  if (!binding) {
    throw new Error(
      `BoundField "${name}": the control declares no binding. Pass one with the binding prop, or declare it with bindable() from @proedis/ui`
    );
  }


  // ----
  // Derived Props
  // ----
  const kind = typeof binding.kind === 'function' ? binding.kind(controlProps) : binding.kind;
  const derived = schemaProps(descriptor, kind);

  const bound = binding.bind({
    value   : field.value,
    onChange: field.onChange,
    onBlur  : field.onBlur,
    name    : field.name,
    ref     : field.ref as React.Ref<never>
  }, controlProps);

  /* The schema's bounds, then what the caller wrote on the control, then the binding, with the handlers of both */
  const boundControl = React.cloneElement(control, {
    ...defined(derived.control),
    ...controlProps,
    ...bound,
    ...composeHandlers(controlProps, bound),
    ref: handleRef
  });

  /* A text the schema limits counts its characters, unless the caller writes the counter */
  const length = typeof field.value === 'string' ? field.value.length : 0;
  const countsItself = counter === undefined && kind === 'text' && derived.maxLength !== undefined;


  // ----
  // Component Render
  // ----
  return (
    <Field
      {...fieldProps}
      name={name}
      label={label ?? derived.field.label}
      required={required ?? derived.field.required}
      disabled={disabled ?? field.disabled}
      error={error !== undefined ? error : fieldState.error?.message}
      counter={countsItself ? `${length} / ${derived.maxLength}` : counter}
      counterExceeded={countsItself ? length > (derived.maxLength ?? Infinity) : counterExceeded}
    >
      {boundControl}
    </Field>
  );

}

BoundField.displayName = 'BoundField';
