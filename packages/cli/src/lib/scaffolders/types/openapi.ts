export interface OpenApiDocument {
  openapi: string;

  components: Components;
}

export type Components = {
  schemas: Record<string, ObjectSchema | EnumSchema>
};


export type ObjectSchema = ObjectSchemaXData & {
  type: 'object';
  allOf?: ReferenceObject[];
  properties: Record<string, PropertySchema>;
};

export type EnumSchema = EnumSchemaXData & {
  type: 'string';
  enum: string[];
};


/**
 * Represents a parseable schema object extended with custom data.
 */
export type ObjectSchemaXData = SchemaXData & {
  'x-api-response-dto': true
};

export type EnumSchemaXData = SchemaXData & {
  'x-api-enum': true,
  'x-enum-described': boolean,
  'x-enum-as-flags': boolean
};

export type SchemaXData = {
  'x-element-name': string,
  'x-element-namespace': string
};


/* --------
 * Property Definition
 * -------- */
export type PropertySchema = PropertyType & SharedPropertyDescriptor;

type PropertyType =
  | ItemType
  | ArrayItemType<ItemType>;

export type ItemType =
  | ReferenceObject
  | ReferencePropertyType
  | BooleanPropertyType
  | StringPropertyType
  | DateTimePropertyType
  | TimeSpanPropertyType
  | EnumPropertyType
  | GuidPropertyType
  | NumberPropertyType;

type ArrayItemType<T> = { type: 'array', items: T };


// ----
// A reference Property is a property of the object
// that has as type another object/schema that could be
// referenced via import
// ----
export type ReferencePropertyType =
  | (ObjectSchemaXData & { type: undefined, allOf: ReferenceObject[] })
  | ReferenceObject;


// ----
// Boolean Property type
// ----
export type BooleanPropertyType = { type: 'boolean' };


// ----
// String and Formatted/Referenced String Property type
// like DateTime/Guid/Enum
// ----
export type StringPropertyType = { type: 'string' };

export type DateTimePropertyType = StringPropertyType & { format: 'date-time' };

export type TimeSpanPropertyType = StringPropertyType & { format: 'date-span' };

export type EnumPropertyType = StringPropertyType & EnumSchemaXData & {
  allOf?: ReferenceObject[],
  items?: ReferenceObject
};

export type GuidPropertyType = StringPropertyType & { format: 'uuid' };


// ----
// Numbers Property Type
// ----
type IntegerPropertyType = { type: 'integer', format: 'int32' | 'int64' };

type DecimalPropertyType = { type: 'number', format: 'float' | 'double' };

export type NumberPropertyType = IntegerPropertyType | DecimalPropertyType;


export interface SharedPropertyDescriptor {
  description?: string;

  nullable: boolean;
}

type ReferenceObject = {
  type: undefined;
  $ref: string;
};

export type PropertyDependency = {
  name: string;
  from: string | undefined;
};
