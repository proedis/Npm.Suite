import type { BindingKind } from '@proedis/ui';
import type { FieldDescriptor } from '@proedis/zod';


/* --------
 * Types Definition
 * -------- */

/** What a schema says about one field, split between the field around a control and the control */
export interface SchemaProps {
  /** For the `Field`: its label and whether it is required */
  readonly field: { label?: string; required?: boolean };

  /** For the control, by the kind of its value: bounds, a step, a number of files */
  readonly control: Readonly<Record<string, unknown>>;

  /** The longest text the schema accepts, for the counter of a text */
  readonly maxLength?: number;
}


/* --------
 * Constants Definition
 * -------- */

/** String formats that reject the empty string by themselves */
const FORMATS_REJECTING_EMPTY = new Set([ 'email', 'url', 'uuid', 'cuid', 'cuid2', 'ulid', 'datetime' ]);


/* --------
 * Helpers
 * -------- */

/** A date of the schema as the `YYYY-MM-DD` a DatePicker takes, read in local time like the date it stands for */
function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Whether the asterisk tells the truth, from what the control holds when it is empty. `describeField`
 * calls a field required when it is neither optional, nor nullable, nor defaulted, and for a text that
 * is not enough: a cleared text control holds `''`, which `z.string()` accepts, and an asterisk on it
 * promises a refusal that never comes. A text is required when it rejects the empty string: a minimum
 * length, or a format. A choice or a date that is empty holds `null`, which a plain `z.string()` does
 * refuse. A boolean is required only as a literal, `z.literal(true)`: a box that must be ticked.
 */
function isRequired(descriptor: FieldDescriptor, kind: BindingKind): boolean {
  if (!descriptor.required) {
    return false;
  }

  switch (descriptor.kind) {
    case 'string':
      return kind !== 'text'
        || (descriptor.minLength ?? 0) >= 1
        || (descriptor.format !== undefined && FORMATS_REJECTING_EMPTY.has(descriptor.format));
    case 'boolean':
      return false;
    case 'literal':
      return true;
    case 'array':
      return (descriptor.minItems ?? 0) >= 1;
    default:
      return true;
  }
}


/* --------
 * Mapping
 * -------- */

/**
 * The props a schema gives a field and its control, for the kind of value the control declares.
 *
 * Only what the control can use: a length to a text, bounds and a step to a number, two dates to a
 * date, a number of files to an upload. An explicit prop of the caller always wins over these.
 */
export function schemaProps(descriptor: FieldDescriptor | null, kind: BindingKind): SchemaProps {
  if (!descriptor) {
    return { field: {}, control: {} };
  }

  const field = { label: descriptor.label, required: isRequired(descriptor, kind) };

  switch (kind) {
    case 'text':
      return { field, control: {}, maxLength: descriptor.maxLength };

    case 'number':
      return {
        field,
        control: {
          min : descriptor.min,
          max : descriptor.max,
          step: descriptor.multipleOf ?? (descriptor.integer ? 1 : undefined)
        }
      };

    case 'date':
      return {
        field,
        control: {
          min: descriptor.minDate ? toDateOnly(descriptor.minDate) : undefined,
          max: descriptor.maxDate ? toDateOnly(descriptor.maxDate) : undefined
        }
      };

    case 'files':
      return { field, control: { maxFiles: descriptor.maxItems } };

    default:
      return { field, control: {} };
  }
}
