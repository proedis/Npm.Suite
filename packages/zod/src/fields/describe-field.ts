import type { z } from 'zod';
import { findCheck, orUndefined } from './zod-internals';
import { unwrapSchema } from './unwrap-schema';


import type { FieldDescriptor, FieldKind, FieldOption } from './field-descriptor.types';
import type { UnwrappedSchema } from './unwrap-schema';
import type { ZodTypeLike } from './zod-internals';


/* --------
 * Constants Definition
 * -------- */
const KIND_BY_TYPE: Record<string, FieldKind> = {
  array  : 'array',
  bigint : 'bigint',
  boolean: 'boolean',
  date   : 'date',
  enum   : 'enum',
  file   : 'file',
  literal: 'literal',
  map    : 'object',
  number : 'number',
  object : 'object',
  record : 'object',
  string : 'string',
  tuple  : 'array'
};


/* --------
 * Helpers
 * -------- */
function toKind(type: string): FieldKind {
  return KIND_BY_TYPE[type] ?? 'unknown';
}


function toOptions(schema: ZodTypeLike): FieldOption[] | undefined {
  /** An enum keeps its declaration as an entries map, where key and value may differ */
  if (schema.def.entries) {
    return Object.entries(schema.def.entries).map(([ key, value ]) => ({ key, value }));
  }

  /** A literal keeps a values array, single-element for the common `z.literal('x')` */
  if (schema.def.values) {
    return schema.def.values
      .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
      .map(value => ({ key: String(value), value }));
  }

  return undefined;
}


interface ResolvedUnion {
  /** The first member that carries a value, or the union itself when it has none */
  schema: ZodTypeLike;

  /** `true` when one of the members was `z.null()` */
  nullable: boolean;

  /** `true` when one of the members was `z.undefined()` */
  optional: boolean;
}


/**
 * A union has no single answer, so the first member that carries a value wins.
 *
 * `z.union([ z.string(), z.null() ])` is how a nullable field is sometimes written, so the `null`
 * and `undefined` members are not merely skipped: they are folded into the nullability of the
 * result. Answering `unknown` there, or answering `string` while calling it required, are both
 * worse than answering `string` and nullable.
 */
function resolveUnion(schema: ZodTypeLike): ResolvedUnion {
  const options = schema.def.options ?? [];

  const firstValueOption = options.find(option => option.def.type !== 'null' && option.def.type !== 'undefined');

  return {
    nullable: options.some(option => option.def.type === 'null'),
    optional: options.some(option => option.def.type === 'undefined'),
    schema  : firstValueOption ?? schema
  };
}


function applyConstraints(descriptor: FieldDescriptor, schema: ZodTypeLike): FieldDescriptor {
  const { kind } = descriptor;

  if (kind === 'string') {
    descriptor.minLength = orUndefined(schema.minLength);
    descriptor.maxLength = orUndefined(schema.maxLength);
    descriptor.format = schema.def.format;
    /** A `.regex()` is a string_format check rather than a declared format */
    descriptor.pattern = schema.def.pattern ?? findCheck(schema, 'string_format')?.pattern;
  }

  if (kind === 'number') {
    descriptor.min = orUndefined(schema.minValue);
    descriptor.max = orUndefined(schema.maxValue);
    descriptor.integer = schema.isInt === true;

    const multipleOf = findCheck(schema, 'multiple_of')?.value;

    if (typeof multipleOf === 'number') {
      descriptor.multipleOf = multipleOf;
    }
  }

  if (kind === 'date') {
    descriptor.minDate = orUndefined(schema.minDate);
    descriptor.maxDate = orUndefined(schema.maxDate);
  }

  if (kind === 'enum' || kind === 'literal') {
    descriptor.options = toOptions(schema);
  }

  if (kind === 'array') {
    /** Arrays expose no length accessors: their bounds live in the checks */
    descriptor.minItems = findCheck(schema, 'min_length')?.minimum;
    descriptor.maxItems = findCheck(schema, 'max_length')?.maximum;

  }

  return descriptor;
}


/* --------
 * API
 * -------- */

/**
 * Describe a schema as a single field, without resolving any path.
 *
 * @param schema - Any Zod schema, wrappers included.
 */
export function describeSchema(schema: z.ZodType | ZodTypeLike): FieldDescriptor {

  // ----
  // Unwrap
  // ----
  const unwrapped: UnwrappedSchema = unwrapSchema(schema as ZodTypeLike);

  const union = unwrapped.schema.def.type === 'union' ? resolveUnion(unwrapped.schema) : null;

  /** A union member may itself be wrapped, and its description is as good as the union's */
  const resolved = union ? unwrapSchema(union.schema) : unwrapped;


  // ----
  // Descriptor
  // ----
  const descriptor: FieldDescriptor = {
    kind    : toKind(resolved.schema.def.type),
    label   : unwrapped.description ?? resolved.description,
    nullable: unwrapped.nullable || resolved.nullable || !!union?.nullable,
    optional: unwrapped.optional || resolved.optional || !!union?.optional,
    readOnly: unwrapped.readOnly || resolved.readOnly,
    required: false
  };

  const hasDefault = unwrapped.hasDefault || resolved.hasDefault;

  if (hasDefault) {
    descriptor.defaultValue = unwrapped.hasDefault ? unwrapped.defaultValue : resolved.defaultValue;
  }

  descriptor.required = !descriptor.optional && !descriptor.nullable && !hasDefault;


  // ----
  // Return
  // ----
  const described = applyConstraints(descriptor, resolved.schema);

  /** An array's element is described in turn, so a list control can drive its own inputs */
  if (described.kind === 'array' && resolved.schema.def.element) {
    described.items = describeSchema(resolved.schema.def.element);
  }

  return described;

}


/**
 * Describe the field a dotted path points to.
 *
 * The path walks object shapes by key and arrays by index — `'address.town.id'`, `'rows.0.quantity'`
 * — which is the same syntax every form library uses for a field name, so a call site can pass the
 * name it already has.
 *
 * @param schema - The schema of the whole form.
 * @param path - Dotted path to the field.
 * @returns The descriptor, or `null` when the path does not exist in the schema.
 */
export function tryDescribeField(schema: z.ZodType | ZodTypeLike, path: string): FieldDescriptor | null {

  // ----
  // Walk the path
  // ----
  const segments = path.split('.').filter(segment => segment.length > 0);

  let current: ZodTypeLike = schema as ZodTypeLike;

  for (const segment of segments) {
    const { schema: unwrapped } = unwrapSchema(current);
    const container = unwrapped.def.type === 'union' ? resolveUnion(unwrapped).schema : unwrapped;
    const { element, shape } = container.def;

    /** An object descends by key */
    if (shape) {
      const next = shape[segment];

      if (!next) {
        return null;
      }

      current = next;
      continue;
    }

    /** An array descends by index, and the index itself carries no schema of its own */
    if (element) {
      if (Number.isNaN(Number(segment))) {
        return null;
      }

      current = element;
      continue;
    }

    return null;
  }


  // ----
  // Describe what the path landed on
  // ----
  return segments.length ? describeSchema(current) : null;

}


/**
 * Describe the field a dotted path points to, failing loudly when it does not exist.
 *
 * Prefer this one inside a form control. A missing path means the control's `name` and the schema
 * disagree, which silently renders a field with no label, no requiredness and no bounds — a defect
 * that reaches production looking like a design choice.
 *
 * @param schema - The schema of the whole form.
 * @param path - Dotted path to the field.
 * @throws When the path does not resolve.
 */
export function describeField(schema: z.ZodType | ZodTypeLike, path: string): FieldDescriptor {
  const descriptor = tryDescribeField(schema, path);

  if (!descriptor) {
    throw new Error(`describeField(): the path '${path}' does not exist in the given schema`);
  }

  return descriptor;
}


/**
 * Describe every field of an object schema, keyed by name.
 *
 * Only the first level: a nested object is described as `{ kind: 'object' }`, and its own fields are
 * reached by calling this again or by asking for their path.
 *
 * @param schema - An object schema, wrappers and transforms included.
 * @returns The descriptors, or an empty object when the schema is not an object.
 */
export function describeShape(schema: z.ZodType | ZodTypeLike): Record<string, FieldDescriptor> {
  const { schema: unwrapped } = unwrapSchema(schema as ZodTypeLike);
  const { shape } = unwrapped.def;

  if (!shape) {
    return {};
  }

  return Object.entries(shape).reduce<Record<string, FieldDescriptor>>(
    (descriptors, [ key, fieldSchema ]) => {
      descriptors[key] = describeSchema(fieldSchema);
      return descriptors;
    },
    {}
  );
}
