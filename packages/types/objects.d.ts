/* --------
 * Utilities Type
 * -------- */
type ObjectKey = string | number | symbol;

type GenericObject = Record<ObjectKey, unknown>;

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
