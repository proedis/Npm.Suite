/* --------
 * Field Kinds
 * -------- */

/**
 * The shape of a value, reduced to what a form control needs to know.
 *
 * Deliberately coarse: a control does not care that a string is branded or piped through three
 * transforms, it cares whether it renders a text box, a number box or a date picker.
 */
export type FieldKind =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'literal'
  | 'file'
  | 'array'
  | 'object'
  | 'unknown';


/**
 * The semantic format of a string field, as declared by `z.email()`, `z.uuid()`, `z.url()` and the
 * other top-level string formats. Left open: Zod keeps adding them.
 */
export type FieldFormat = 'email' | 'url' | 'uuid' | 'cuid' | 'cuid2' | 'ulid' | 'datetime' | (string & {});


/* --------
 * Descriptor
 * -------- */
export interface FieldOption {
  /** The key the value was declared under. Equal to `value` for a value-only enum */
  key: string;

  /** The value to submit */
  value: string | number;
}


/**
 * Everything a control can learn about one field without being told twice.
 *
 * Absent constraints are `undefined`, never `null`: Zod's own accessors return `null` for "no
 * bound", which reads as a value when spread onto component props.
 */
export interface FieldDescriptor {
  /** What kind of control this field wants */
  kind: FieldKind;

  /** The `.describe()` text, the closest thing Zod has to a label */
  label?: string;

  /** `true` when the schema accepts `undefined` */
  optional: boolean;

  /** `true` when the schema accepts `null` */
  nullable: boolean;

  /**
   * `true` when a value must be provided: not optional, not nullable, and with no default.
   *
   * This is the flag a control turns into its required marker, and the reason `optional` and
   * `nullable` are also exposed: "clearable" and "required" are not the same question.
   */
  required: boolean;

  /** `true` for a `z.readonly()` schema */
  readOnly: boolean;

  /** The declared default, when the schema has one */
  defaultValue?: unknown;

  /** The semantic string format, when declared */
  format?: FieldFormat;

  /** The regular expression a string must match, when declared */
  pattern?: RegExp;

  /** Minimum string length */
  minLength?: number;

  /** Maximum string length */
  maxLength?: number;

  /** Minimum numeric value */
  min?: number;

  /** Maximum numeric value */
  max?: number;

  /** `true` for `z.number().int()` */
  integer?: boolean;

  /** The step a numeric value must be a multiple of */
  multipleOf?: number;

  /** Earliest accepted date */
  minDate?: Date;

  /** Latest accepted date */
  maxDate?: Date;

  /** The declared values, for an enum or a literal */
  options?: FieldOption[];

  /** Minimum number of elements, for an array */
  minItems?: number;

  /** Maximum number of elements, for an array */
  maxItems?: number;

  /** The descriptor of an array's element, so a list control can drive its own inputs */
  items?: FieldDescriptor;
}
