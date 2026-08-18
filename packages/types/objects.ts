/* eslint-disable @typescript-eslint/no-redeclare */

/* --------
 * Utilities Type
 * -------- */

type ObjectKey = string | number | symbol;

export type AnyObject = { [key: string]: any };
export const AnyObject = Object;


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
export const RecursivePartial = Object;


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

/* --------
 * Types to Extract all Field Path from an Object
 * -------- */
/** Get a list of all object possible path */
export type ObjectPath<TObject extends AnyObject> = Path<TObject>;
export const ObjectPath = String;

/**
 * Get the value type at object paths.
 *
 * The result used to be wrapped in an 'UnpackNestedValue' mapped type, inherited from
 * react-hook-form together with the 'NestedValue' marker it was meant to unwrap. Nothing
 * ever produced a 'NestedValue', so the wrapper only performed a recursive identity
 * rebuild of every nested record: from TypeScript 5.9 that recursion exceeds the
 * instantiation depth limit (TS2321) as soon as the object type is still generic.
 */
export type ValueAtPath<TObject extends AnyObject, ValuePath extends ObjectPath<TObject>> =
  PathValue<TObject, ValuePath>;
export const ValueAtPath = Object;
