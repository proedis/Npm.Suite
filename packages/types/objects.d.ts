/**
 * Represent a type that must be an Object,
 * containing any key.
 * Each key could have any type of value
 */
export type AnyObject = { [key: string]: any };


/**
 * Parse an object type to make all its properties optional
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P]
};


/**
 * Remove all keys from an object T if the value type is not of type V.
 */
export type KeysMatching<T, V> = { [K in keyof T]: T[K] extends V ? K : never };
