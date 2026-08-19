/* --------
 * Internal Helpers
 * -------- */

/**
 * Freeze one value, recursing into what it holds.
 *
 * @param value The value to freeze
 * @param seen The references already visited, which is what terminates a cycle
 */
function freezeValue<T>(value: T, seen: WeakSet<object>): T {
  /** Primitives are already immutable, and freezing a function only stops it growing properties */
  if (value === null || typeof value !== 'object') {
    return value;
  }

  /** A reference already visited in this pass needs nothing further, cycles included */
  if (seen.has(value as object)) {
    return value;
  }

  seen.add(value as object);

  /**
   * Recurse before freezing, not after.
   *
   * Reading a property off a frozen object is fine, but the order matters for clarity: by the time this
   * object is sealed everything below it already is.
   */
  Reflect.ownKeys(value as object).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value as object, key);

    /** An accessor has nothing to descend into: invoking its getter here would be a side effect */
    if (descriptor && 'value' in descriptor) {
      freezeValue(descriptor.value, seen);
    }
  });

  return Object.freeze(value);
}


/* --------
 * Utility Definition
 * -------- */

/**
 * Freeze a value and everything reachable from it, in place.
 *
 * Reach for it to hand out a value nobody is allowed to change: an emitted state snapshot, a
 * configuration object, a cached result. On a plain object or an array the protection is real — writing
 * to a property, adding one, or calling `push` all throw in strict mode, which every module is.
 *
 * ⚠️ **What freezing cannot protect.** `Object.freeze` locks an object's *properties*, not the internal
 * state of an exotic object. A frozen `Date` still moves under `setTime`, a frozen `Map` still accepts
 * `set`, a frozen `Set` still accepts `add`, and a frozen typed array still takes index writes. Freeze a
 * structure of objects, arrays and primitives and it is genuinely immutable; freeze one holding a `Map`
 * and the map's contents are not.
 *
 * The value is frozen **in place** and returned, so this is not a copy: pair it with {@link deepClone}
 * when the source has to stay mutable.
 *
 * @param value The value to freeze
 * @returns The same value, now frozen
 *
 * @example
 * const state = deepFreeze({ user: { name: 'marco' }, tags: [ 'a' ] });
 *
 * state.user.name = 'x';   // TypeError in strict mode
 * state.tags.push('b');    // TypeError in strict mode
 *
 * @example
 * // hand out a snapshot nobody can corrupt, while keeping your own copy writable
 * emit(deepFreeze(deepClone(current)));
 */
export default function deepFreeze<T>(value: T): T {
  return freezeValue(value, new WeakSet());
}
