/**
 * A `Map` with the one method the built-in one is missing.
 *
 * Everything else behaves exactly like the native `Map`, constructor and iteration protocol
 * included, because that is literally what it extends.
 *
 * @example
 * const clients = new AugmentedMap<string, Client>();
 *
 * const client = clients.getOrAdd(tenantId, (id) => new Client(id));
 */
export default class AugmentedMap<Key, Value> extends Map<Key, Value> {

  /**
   * Get the value stored for a key, creating and storing it first when the key is absent.
   *
   * The whole point is that the factory runs **only** on a miss, which makes this the correct
   * shape for a lazy cache of expensive values — as opposed to the
   * `map.get(key) ?? map.set(key, build()).get(key)` dance, where `build()` runs every time.
   *
   * A key explicitly stored with an `undefined` value counts as present, and gets `undefined`
   * back without the factory ever running: same semantics as `Map.has`.
   *
   * @param key The key to look up
   * @param value Factory invoked with the key, only when the key is not in the map yet
   * @returns The stored value, existing or freshly created
   *
   * @example
   * const compiled = new AugmentedMap<string, RegExp>();
   *
   * function patternOf(source: string): RegExp {
   *   return compiled.getOrAdd(source, (raw) => new RegExp(raw, 'i'));
   * }
   */
  public getOrAdd(key: Key, value: (key: Key) => Value): Value {
    /** Check if the map already contains requested key */
    if (this.has(key)) {
      return this.get(key) as Value;
    }

    /** Create the new value */
    const mapValue = value(key);

    /** Add the new value to map */
    this.set(key, mapValue);

    /** Return the value */
    return mapValue;
  }

}
