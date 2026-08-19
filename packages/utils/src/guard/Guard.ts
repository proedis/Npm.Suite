import type { Instantiable } from '@proedis/types';
import GuardAndThrow from './Guard.AndThrow';


/**
 * The entry point of the guard helpers: a fluent way to assert an invariant and throw a specific
 * error when it does not hold.
 *
 * Two things make it worth using over a hand written `if` / `throw`. The error class and its
 * arguments are stated once, up front, so the assertions that follow read as a single expression;
 * and every assertion returns the value it validated, which means a guard can sit inline in the
 * assignment that needed it — including the narrowing, so no non-null assertion is left behind.
 *
 * @example
 * import { Guard } from '@proedis/utils';
 *
 * class TokenStore {
 *
 *   public read(name: string): string {
 *     return Guard
 *       .andThrow(ReferenceError, `token '${name}' has never been stored`)
 *       .ifNil(this._tokens.get(name));
 *   }
 *
 * }
 */
export default class Guard {


  // ---- //
  // Public static methods
  // ---- //

  /**
   * Start a guard chain, declaring the error to throw when one of its assertions fails.
   *
   * The error is **not** built here: it is instantiated only if an assertion actually fails, so
   * the stack trace points at the failing check rather than at this call.
   *
   * @param error The error class to throw
   * @param args The arguments to construct the error with, typed against its constructor
   * @returns The assertion surface, see {@link GuardAndThrow}
   *
   * @example
   * Guard.andThrow(TypeError, 'expected a positive amount').if(amount <= 0);
   */
  public static andThrow<T extends Error>(
    error: Instantiable<T>,
    ...args: ConstructorParameters<Instantiable<T>>
  ): GuardAndThrow<T> {
    return new GuardAndThrow<T>(error, ...args);
  }

}
