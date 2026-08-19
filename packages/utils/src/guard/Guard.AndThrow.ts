import type { Instantiable, Nillable } from '@proedis/types';
import isPlainObject from '../object/isPlainObject';


/**
 * The assertion side of {@link Guard}, holding the error to throw when an assertion does not hold.
 *
 * Never built directly: `Guard.andThrow(TypeError, 'message')` returns one of these, already
 * carrying the error class and the arguments it will be constructed with. The error itself is only
 * instantiated on failure, so the stack trace points at the failing check.
 *
 * Every method returns the value it validated, which is what lets a guard sit inline in an
 * assignment instead of occupying three lines above it.
 */
export default class GuardAndThrow<TError extends Error> {


  // ---- //
  // Private properties
  // ---- //

  /** The arguments the error will be constructed with, captured up front */
  private readonly _args: any[];


  // ---- //
  // Constructor
  // ---- //

  constructor(
    private readonly _error: Instantiable<TError>,
    ...args: ConstructorParameters<Instantiable<TError>>
  ) {
    this._args = args;
  }


  // ---- //
  // Private methods
  // ---- //

  /**
   * Run an assertion, returning the yielded value when it holds and throwing otherwise.
   *
   * @param assertion Predicate that must return `true` for the value to be accepted
   * @param yieldedReturn The value to hand back when the assertion holds
   */
  private _assert<T>(assertion: () => boolean, yieldedReturn: T) {
    if (assertion()) {
      return yieldedReturn;
    }

    throw this._buildError();
  }


  /** Instantiate the error, as late as possible */
  private _buildError(): TError {
    /** Bound to a local first: 'new this._error()' reads as a lowercase constructor to any linter */
    const ErrorConstructor = this._error;

    return new ErrorConstructor(...this._args);
  }


  // ---- //
  // Public methods
  // ---- //

  /**
   * Throw when the condition is `true`.
   *
   * @param value The condition to check
   * @returns The condition itself, always `false` when it does not throw
   *
   * @example
   * Guard.andThrow(RangeError, 'page out of range').if(page > lastPage);
   */
  public if(value: boolean): boolean {
    return this._assert(() => !value, value);
  }


  /**
   * Throw when the condition is `false`.
   *
   * @param value The condition to check
   * @returns The condition itself, always `true` when it does not throw
   *
   * @example
   * Guard.andThrow(Error, 'client has not been built').ifNot(this._isBuilt);
   */
  public ifNot(value: boolean): boolean {
    return this._assert(() => value, value);
  }


  /**
   * Throw when the value is `null` or `undefined`, and hand it back non nil otherwise.
   *
   * The workhorse of the whole class: it turns "this cannot be missing here, and if it is we have
   * a bug" into a single expression that also narrows the type.
   *
   * @param value The value to check
   * @returns The very same value, typed as present
   *
   * @example
   * const token = Guard.andThrow(Error, 'no access token').ifNil(storage.get('accessToken'));
   * // token is a string, not a Nillable<string>
   */
  public ifNil<T>(value: Nillable<T>): T {
    return this._assert(() => value != null, value) as T;
  }


  /**
   * Throw when the value is present, the mirror image of {@link ifNil}.
   *
   * Use it to assert that something has *not* been set yet, like a single-shot initialization
   * that must not run twice.
   *
   * @param value The value to check
   * @returns `null`, there being nothing meaningful to return
   *
   * @example
   * Guard.andThrow(Error, 'client already initialized').ifNotNil(this._instance);
   */
  public ifNotNil<T>(value: Nillable<T>): null {
    return this._assert(() => value == null, null);
  }


  /**
   * Throw when the value is nil **or** empty, and hand it back otherwise.
   *
   * Emptiness is only defined for the things that can actually be empty: a string or an array with
   * no item, a `Map` or a `Set` with no entry, a plain object with no own key. Anything else — a
   * number, a boolean, a `Date`, a class instance — has no notion of being empty and passes
   * through, `0` and `false` included.
   *
   * @param value The value to check
   * @returns The very same value, typed as present
   *
   * @example
   * const ids = Guard.andThrow(Error, 'no id to load').ifNullOrEmpty(request.ids);
   * Guard.andThrow(Error, 'empty filter').ifNullOrEmpty({});     // ❌ throws
   * Guard.andThrow(Error, 'never thrown').ifNullOrEmpty(0);      // ✅ 0 is not empty
   * Guard.andThrow(Error, 'never thrown').ifNullOrEmpty(date);   // ✅ nor is a Date
   */
  public ifNullOrEmpty<T>(value: Nillable<T>): T {
    return this._assert(() => {
      /** Check value is null or undefined */
      if (value == null) {
        return false;
      }

      /** Check value is a string or an array, the two things carrying a length */
      if (typeof value === 'string' || Array.isArray(value)) {
        return !!value.length;
      }

      /** A Map or a Set is empty when it holds no entry */
      if (value instanceof Map || value instanceof Set) {
        return !!value.size;
      }

      /**
       * A plain object is empty when it has no own key. The check is deliberately narrower than
       * 'isObject': a Date, a Map, a class instance are all objects with no enumerable own key,
       * and reporting them as empty would throw on a perfectly valid value.
       */
      if (isPlainObject(value)) {
        return !!Object.keys(value).length;
      }

      /** Anything else has no notion of emptiness: being present is enough */
      return true;
    }, value) as T;
  }


  /**
   * Throw when the value **is** one of the collection members: a deny list.
   *
   * @param value The value to check
   * @param collection The forbidden values
   * @returns The very same value, guaranteed to be none of them
   *
   * @example
   * const name = Guard.andThrow(Error, 'reserved name').ifIn(input, [ 'admin', 'root' ]);
   */
  public ifIn<T>(value: T, collection: T[]): T {
    return this._assert(() => !collection.includes(value), value);
  }


  /**
   * Throw when the value is **not** one of the collection members: an allow list.
   *
   * @param value The value to check
   * @param collection The allowed values
   * @returns The very same value, guaranteed to be one of them
   *
   * @example
   * const method = Guard.andThrow(Error, 'unsupported method').ifNotIn(input, [ 'GET', 'POST' ]);
   */
  public ifNotIn<T>(value: T, collection: T[]): T {
    return this._assert(() => collection.includes(value), value);
  }

}
