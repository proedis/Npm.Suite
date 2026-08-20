/**
 * One key whose value changed, and what it changed to.
 */
export interface ObjectMutation<TObject extends object> {
  key: keyof TObject;

  value: TObject[keyof TObject];
}


/**
 * List the keys that differ between two objects, shallowly.
 *
 * Compares by reference (`!==`), which is what makes it useful next to an immutable state update: a
 * value that was replaced shows up, a nested object that was left alone does not. Keys present in
 * only one of the two are reported as well, with the updated value — `undefined` when the key was
 * removed.
 *
 * @param original - The object before.
 * @param updated - The object after.
 * @returns One entry per changed key, in the order the keys were first seen.
 *
 * @example
 * getObjectDiff({ a: 1, b: 2 }, { a: 1, b: 3 });
 * // [ { key: 'b', value: 3 } ]
 */
export default function getObjectDiff<TObject extends object>(
  original: TObject,
  updated: TObject
): ObjectMutation<TObject>[] {
  const keys = new Set<keyof TObject>([
    ...Object.keys(original) as (keyof TObject)[],
    ...Object.keys(updated) as (keyof TObject)[]
  ]);

  const mutations: ObjectMutation<TObject>[] = [];

  keys.forEach((key) => {
    if (original[key] !== updated[key]) {
      mutations.push({ key, value: updated[key] });
    }
  });

  return mutations;
}
