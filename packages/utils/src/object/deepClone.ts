/* --------
 * Internal Types
 * -------- */

/**
 * References already cloned during the current pass, keyed by the source object.
 *
 * This is what makes a circular structure terminate instead of recursing forever, and it is also
 * what preserves *shared* references: an object reachable twice from the root ends up as one object
 * in the copy too, exactly as it was in the source.
 */
type CloneRegistry = WeakMap<object, any>;


/* --------
 * Internal Helpers
 * -------- */

/**
 * Clone a single value, delegating to itself for anything nested.
 *
 * @param value The value to clone
 * @param seen The registry of references already cloned in this pass
 */
function cloneValue<T>(value: T, seen: CloneRegistry): T {
  /**
   * Primitives are immutable and functions have no meaningful copy: both are handed back as they
   * are. A cloned function would be a different identity with the same body, which breaks every
   * comparison anybody could want to make on it.
   */
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return value;
  }

  if (typeof value === 'function') {
    return value;
  }

  /** A reference already cloned in this pass is reused, cycles included */
  if (seen.has(value as object)) {
    return seen.get(value as object) as T;
  }

  /** Dates and regular expressions are rebuilt, 'lastIndex' included: it is mutable state */
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    const clonedRegExp = new RegExp(value.source, value.flags);
    clonedRegExp.lastIndex = value.lastIndex;

    return clonedRegExp as T;
  }

  /** Binary data: the buffer is copied, and a view is rebuilt over the copy */
  if (value instanceof ArrayBuffer) {
    return value.slice(0) as T;
  }

  if (ArrayBuffer.isView(value)) {
    const ViewConstructor = value.constructor as any;

    return new ViewConstructor(
      cloneValue(value.buffer, seen),
      value.byteOffset,
      'length' in value ? (value as unknown as { length: number }).length : undefined
    ) as T;
  }

  /**
   * There is no honest copy of these: a promise is a pending result, and a weak collection cannot
   * even be enumerated. Rebuilding them through the generic path below would produce a broken object
   * carrying the right prototype, which is worse than sharing the original.
   */
  if (value instanceof Promise || value instanceof WeakMap || value instanceof WeakSet) {
    return value;
  }

  /** Arrays, then the keyed collections: each is registered before recursing, so cycles resolve */
  if (Array.isArray(value)) {
    const clonedArray: any[] = [];
    seen.set(value, clonedArray);

    value.forEach((item, index) => {
      clonedArray[index] = cloneValue(item, seen);
    });

    return clonedArray as T;
  }

  if (value instanceof Map) {
    const clonedMap = new Map();
    seen.set(value, clonedMap);

    value.forEach((entryValue, entryKey) => {
      clonedMap.set(cloneValue(entryKey, seen), cloneValue(entryValue, seen));
    });

    return clonedMap as T;
  }

  if (value instanceof Set) {
    const clonedSet = new Set();
    seen.set(value, clonedSet);

    value.forEach((entryValue) => {
      clonedSet.add(cloneValue(entryValue, seen));
    });

    return clonedSet as T;
  }

  /**
   * Everything else that is object shaped, class instances included.
   *
   * The copy is built on the *same prototype*, which is what keeps 'instanceof' working and every
   * method reachable — the reason this is hand written rather than delegating to 'structuredClone',
   * which returns a plain object and would quietly turn a decorated model into a bag of fields.
   *
   * Property descriptors are copied rather than read: an accessor stays an accessor instead of being
   * flattened into whatever its getter happened to return, and non enumerable keys and symbols come
   * along too.
   */
  const clonedObject = Object.create(Object.getPrototypeOf(value));
  seen.set(value, clonedObject);

  Reflect.ownKeys(value).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;

    if ('value' in descriptor) {
      descriptor.value = cloneValue(descriptor.value, seen);
    }

    Object.defineProperty(clonedObject, key, descriptor);
  });

  return clonedObject as T;
}


/* --------
 * Utility Definition
 * -------- */

/**
 * Create a deep copy of a value, sharing as little as possible with the original.
 *
 * Mutating anything reachable from the copy leaves the source untouched — which is the whole point,
 * and the part a surprising number of clone implementations get only half right:
 *
 * - plain objects, arrays, `Date`, `RegExp` (`lastIndex` included), `ArrayBuffer` and typed array
 *   views are all rebuilt
 * - the **contents** of a `Map` or a `Set` are cloned too, not just the container
 * - a class instance is rebuilt **on the same prototype**, so `instanceof` still holds and its
 *   methods are still there — unlike `structuredClone`, which hands back a plain object
 * - property descriptors are preserved, so an accessor stays an accessor and symbols and non
 *   enumerable keys survive
 * - circular and shared references are preserved: an object reachable twice from the root is one
 *   object in the copy as well, and a cycle terminates instead of overflowing the stack
 *
 * ⚠️ **What is shared, deliberately** — functions, promises, `WeakMap` and `WeakSet`. None of them
 * has a meaningful copy: a cloned function is a different identity with the same body, a promise is
 * a result already in flight, and a weak collection cannot be enumerated at all. They are handed
 * over as they are rather than rebuilt into something broken.
 *
 * @param value The value to clone
 * @returns A deep copy of the value
 *
 * @example
 * class Money { constructor(public amount: number) {} }
 *
 * const original = { total: new Money(10), tags: [ 'a' ], seen: new Map([ [ 'k', { hit: 1 } ] ]) };
 * const copy = deepClone(original);
 *
 * copy.total.amount = 99;
 * original.total.amount;          // 10, untouched
 * copy.total instanceof Money;    // true, the prototype came along
 *
 * copy.seen.get('k')!.hit = 99;
 * original.seen.get('k')!.hit;    // 1, the map contents were cloned too
 *
 * @example
 * // a cycle is handled, and its shape is preserved
 * const node: any = { name: 'root' };
 * node.self = node;
 *
 * const cloned = deepClone(node);
 * cloned.self === cloned;         // true
 * cloned.self === node;           // false
 */
export default function deepClone<T>(value: T): T {
  return cloneValue(value, new WeakMap());
}
