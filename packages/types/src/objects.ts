/* eslint-disable @typescript-eslint/no-redeclare */
import type { Primitive } from './generics';


/* --------
 * Internal Types
 * -------- */
type ObjectKey = string | number | symbol;


/* --------
 * Object Shapes
 * -------- */

/**
 * Any plain object, with no assumption whatsoever about its keys or its values.
 *
 * This is the deliberate escape hatch used as a generic constraint all over the suite
 * (`<T extends AnyObject>`), where the point is "some object, whichever one you pass". It is
 * **not** meant as the type of a variable you are about to read from — that is what
 * `Record<string, unknown>` is for, and it will make the compiler ask you the questions
 * `AnyObject` lets you skip.
 *
 * @example
 * function keysOf<T extends AnyObject>(source: T): (keyof T)[] {
 *   return Object.keys(source);
 * }
 */
export type AnyObject = { [key: string]: any };
export const AnyObject = Object;


/**
 * The union of every value type an object holds.
 *
 * The companion of `keyof`, and the idiomatic way to turn a `const` object used as an enum
 * into the type of its members.
 *
 * @example
 * const Role = { admin: 'admin', guest: 'guest' } as const;
 *
 * type Role = ValueOf<typeof Role>;
 * // 'admin' | 'guest'
 */
export type ValueOf<TObject> = TObject[keyof TObject];
export const ValueOf = Object;


/* --------
 * Object Manipulating
 * -------- */

/**
 * Recursively mark every property of an object as optional.
 *
 * Arrays are walked through their element type, while primitives, dates, regular expressions
 * and functions are handed back untouched — mapping over the members of a `Date` would produce
 * an object that satisfies nothing.
 *
 * The canonical use case is a settings override: the caller states the handful of leaves it
 * cares about and inherits the rest.
 *
 * @example
 * declare const defaults: ClientSettings;
 *
 * function configure(overrides: DeepPartial<ClientSettings>): ClientSettings {
 *   return mergeObjects(defaults, overrides);
 * }
 *
 * configure({ requests: { timeout: 5_000 } });
 */
export type DeepPartial<T> = T extends Primitive | Date | RegExp | ((...args: any[]) => any)
  ? T
  : T extends readonly (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;
export const DeepPartial = Object;


/**
 * @deprecated Renamed to {@link DeepPartial} in `2.0.0`, which is the name the rest of the
 * ecosystem uses. This alias forwards to it and will be removed in the next major: replace
 * `RecursivePartial<T>` with `DeepPartial<T>`.
 */
export type RecursivePartial<T> = DeepPartial<T>;
export const RecursivePartial = Object;


/* --------
 * Object Navigation
 * -------- */

/**
 * The machinery below turns an object type into the union of the dot notation paths that can
 * be walked inside it, and resolves the type sitting at the end of one of those paths.
 *
 * None of these helpers is exported: `ObjectPath` and `ValueAtPath` are the public surface, and
 * they are what the `getValueAt` / `setValueAt` utilities are typed against.
 */
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


/**
 * Every dot notation path that can be walked inside an object, as a string literal union.
 *
 * Array and tuple indexes are part of it, so a path can cross a collection. Because the result
 * is a literal union, an invalid path is a compile error and the editor autocompletes the valid
 * ones as you type.
 *
 * @example
 * type Settings = { server: { port: number }; tags: string[] };
 *
 * type Paths = ObjectPath<Settings>;
 * // 'server' | 'server.port' | 'tags' | `tags.${number}`
 */
export type ObjectPath<TObject extends AnyObject> = Path<TObject>;
export const ObjectPath = String;


/**
 * The type of the value found at a given path of an object.
 *
 * Pair it with {@link ObjectPath} to type an accessor whose return type follows the path the
 * caller asked for.
 *
 * @example
 * declare function read<T extends AnyObject, P extends ObjectPath<T>>(
 *   source: T,
 *   path: P
 * ): ValueAtPath<T, P>;
 *
 * const port = read({ server: { port: 8080 } }, 'server.port');
 * // number
 *
 * @remarks
 * The result used to be wrapped in an `UnpackNestedValue` mapped type, inherited from
 * react-hook-form together with the `NestedValue` marker it was meant to unwrap. Nothing ever
 * produced a `NestedValue`, so the wrapper only performed a recursive identity rebuild of every
 * nested record: from TypeScript 5.9 that recursion exceeds the instantiation depth limit
 * (TS2321) as soon as the object type is still generic.
 */
export type ValueAtPath<TObject extends AnyObject, ValuePath extends ObjectPath<TObject>> = PathValue<TObject, ValuePath>;
export const ValueAtPath = Object;
