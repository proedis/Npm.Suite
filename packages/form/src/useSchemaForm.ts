import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';


import type { ZodTypeLike } from '@proedis/zod';
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import { registerSchema } from './schemaContext';


/* --------
 * Types Definition
 * -------- */

/** What a schema validates and what it returns: the values a form edits, and the ones it submits */
export type SchemaInput<TSchema extends z.ZodType> = z.input<TSchema> extends FieldValues ? z.input<TSchema> : never;

export type SchemaOutput<TSchema extends z.ZodType> = z.output<TSchema>;

export type UseSchemaFormOptions<TSchema extends z.ZodType> = Omit<UseFormProps<SchemaInput<TSchema>, unknown, SchemaOutput<TSchema>>, 'resolver'>;

export type SchemaForm<TSchema extends z.ZodType> = UseFormReturn<SchemaInput<TSchema>, unknown, SchemaOutput<TSchema>>;


/* --------
 * Hook Definition
 * -------- */

/**
 * `useForm` with the schema as its resolver, and the schema remembered for a `BoundForm`.
 *
 * ```ts
 * const form = useSchemaForm(vehicleSchema, { defaultValues: { plate: '', load: null } });
 * ```
 *
 * The values the form edits are the input of the schema, the ones `onSubmit` receives its output: a
 * `nullableString` edits a string and submits `null` for an empty field. Every option of `useForm`
 * but `resolver` passes through. `defaultValues` always, empty strings included: without them
 * react-hook-form loses the controlled state of a field on its first render.
 */
export function useSchemaForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: UseSchemaFormOptions<TSchema>
): SchemaForm<TSchema> {
  const form = useForm<SchemaInput<TSchema>, unknown, SchemaOutput<TSchema>>({
    ...options,
    resolver: zodResolver(schema as never) as never
  });

  registerSchema(form.control, schema as unknown as ZodTypeLike);

  return form;
}
