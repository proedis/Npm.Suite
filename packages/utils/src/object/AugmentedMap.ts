export default class AugmentedMap<Key, Value> extends Map<Key, Value> {

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
