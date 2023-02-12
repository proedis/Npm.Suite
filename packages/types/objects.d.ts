/* --------
 * Utilities Type
 * -------- */

type ObjectKey = string | number | symbol;

export type GenericObject = Record<ObjectKey, unknown>;

export type AnyObject = { [key: string]: any };


/* --------
 * Object Manipulating
 * -------- */

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P]
};


/* --------
 * Object Navigation
 * -------- */

type ArrayKey = number;
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type PathImpl<K extends string | number, V> = V extends ObjectKey ? `${K}` : `${K}` | `${K}.${Path<V>}`;
type ArrayPathImpl<K extends string | number, V> = V extends ObjectKey
  ? never
  : V extends ReadonlyArray<infer U>
    ? U extends ObjectKey ? never : `${K}` | `${K}.${ArrayPath<V>}`
    : `${K}.${ArrayPath<V>}`;

type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? { [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>; }[TupleKey<T>]
    : PathImpl<ArrayKey, V>
  : { [K in keyof T]-?: PathImpl<K & string, T[K]>; }[keyof T];

type ArrayPath<T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
  [K in TupleKey<T>]-?: ArrayPathImpl<K & string, T[K]>;
}[TupleKey<T>] : ArrayPathImpl<ArrayKey, V> : {
  [K in keyof T]-?: ArrayPathImpl<K & string, T[K]>;
}[keyof T];

type PathValue<T, P extends Path<T> | ArrayPath<T>> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? R extends Path<T[K]>
      ? PathValue<T[K], R>
      : never
    : K extends `${ArrayKey}`
      ? T extends ReadonlyArray<infer V>
        ? PathValue<V, R & Path<V>>
        : never
      : never
  : P extends keyof T
    ? T[P]
    : P extends `${ArrayKey}`
      ? T extends ReadonlyArray<infer V>
        ? V
        : never
      : never;

type NestedValue<
  TValue extends unknown[] | Record<string, unknown> | Map<unknown, unknown> = unknown[] | Record<string, unknown>
> =
  & { [$NestedValue: string]: never; }
  & TValue;

type UnpackNestedValue<T> = T extends NestedValue<infer U> ? U : T extends Date | FileList
  ? T
  : T extends Record<string, unknown> ? {
    [K in keyof T]: UnpackNestedValue<T[K]>;
  } : T;


/* --------
 * Types to Extract all Field Path from an Object
 * -------- */
/** Get a list of all object possible path */
export type ObjectPath<TObject extends AnyObject> = Path<TObject>;

/** Get the value type at object paths */
export type ValueAtPath<TObject extends AnyObject, ValuePath extends ObjectPath<TObject>> =
  UnpackNestedValue<PathValue<TObject, ValuePath>>;
