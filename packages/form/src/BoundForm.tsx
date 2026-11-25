import * as React from 'react';

import { FormProvider, useFormState } from 'react-hook-form';

import { Form } from '@proedis/ui/forms/form';


import type { FormProps } from '@proedis/ui/forms/form';
import type { ZodTypeLike } from '@proedis/zod';
import type { FieldValues, SubmitErrorHandler, UseFormReturn } from 'react-hook-form';
import { BoundSchemaContext, schemaOf } from './schemaContext';


/* --------
 * Types Definition
 * -------- */

export interface StrictBoundFormProps<TValues extends FieldValues, TSubmitted> {
  /** The form, from `useSchemaForm` or `useForm` */
  form: UseFormReturn<TValues, unknown, TSubmitted>;

  /**
   * The schema the fields read their label, requiredness and bounds from. Defaults to the one
   * `useSchemaForm` was given; with `useForm` and no schema, the fields take their props from the caller
   */
  schema?: ZodTypeLike | null;

  /** The values that passed validation, the output of the schema. Return a promise: the form is sent until it settles */
  onSubmit: (values: TSubmitted, event?: React.BaseSyntheticEvent) => unknown;

  /** Validation failed: the errors are already on the fields, the focus already on the summary or the field */
  onInvalid?: SubmitErrorHandler<TValues>;
}

export type BoundFormProps<TValues extends FieldValues, TSubmitted> = StrictBoundFormProps<TValues, TSubmitted>
  & Omit<FormProps, keyof StrictBoundFormProps<TValues, TSubmitted> | 'submitting' | 'dirty'>;


/* --------
 * Component Definition
 * -------- */

/**
 * The `Form` of `@proedis/ui`, bound to a react-hook-form form.
 *
 * ```tsx
 * const form = useSchemaForm(vehicleSchema, { defaultValues });
 *
 * <BoundForm form={form} onSubmit={save}>
 *   <Form.Section title={'Vehicle'}>
 *     <BoundField name={'plate'} span={2}><TextInput width={'code'} /></BoundField>
 *   </Form.Section>
 *   <Form.Footer>
 *     <Form.Cancel>Cancel</Form.Cancel>
 *     <Form.Submit loadingLabel={'Saving'}>Save</Form.Submit>
 *   </Form.Footer>
 * </BoundForm>
 * ```
 *
 * It submits through `handleSubmit`, so `onSubmit` receives the output of the schema, and hands the
 * form its state: `isSubmitting` spins `Form.Submit` and makes a dialog or a drawer around the form
 * wait, `isDirty` makes them ask before closing. A reset (`Form.Cancel` in a page) resets the form to its
 * default values. Every part of `Form` works inside it: `Form.Section`, `Form.ErrorSummary`, `Form.Footer`.
 */
export function BoundForm<TValues extends FieldValues, TSubmitted>(props: BoundFormProps<TValues, TSubmitted>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, form, onInvalid, onReset, onSubmit, schema: schemaProp, ...rest } = props;


  // ----
  // Internal Hooks
  // ----

  /* Subscribed here, so the form re-renders on these two and nothing else */
  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  const schema = schemaProp === undefined ? schemaOf(form.control) : schemaProp;


  // ----
  // Handlers
  // ----
  const handleSubmit = form.handleSubmit(onSubmit, onInvalid);

  const handleReset = (event: React.FormEvent<HTMLFormElement>): void => {
    onReset?.(event);

    if (event.defaultPrevented) {
      return;
    }

    /* The native reset would empty the inputs behind react-hook-form's back */
    event.preventDefault();
    form.reset();
  };


  // ----
  // Component Render
  // ----
  return (
    <FormProvider {...form}>
      <BoundSchemaContext.Provider value={schema}>
        <Form
          {...rest}
          submitting={isSubmitting}
          dirty={isDirty}
          /* Not caught: an error thrown by the caller's onSubmit must reach the console, never vanish here */
          onSubmit={(event) => handleSubmit(event)}
          onReset={handleReset}
        >
          {children}
        </Form>
      </BoundSchemaContext.Provider>
    </FormProvider>
  );

}

BoundForm.displayName = 'BoundForm';
