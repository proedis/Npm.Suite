import type { ValueOf } from '@proedis/types';


/* --------
 * Internal Types
 * -------- */

/** The three states a Deferred object moves through, one way only */
const STATE = {
  pending : 'pending',
  resolved: 'resolved',
  rejected: 'rejected'
} as const;

type DeferredState = ValueOf<typeof STATE>;


/* --------
 * Class Definition
 * -------- */

/**
 * A promise whose `resolve` and `reject` are handed to you instead of being trapped inside an
 * executor function.
 *
 * The shape to reach for when the thing that settles the promise is not the thing that created it:
 * an initialization step awaited by several callers, a socket message answering an earlier
 * request, a queue drained by a background loop.
 *
 * Settling is one way — a second `resolve` or `reject` throws rather than being silently ignored,
 * because in practice a double settle means two code paths both believed they owned the outcome.
 *
 * @example
 * class Bootstrapper {
 *
 *   private readonly _ready = new Deferred<void>();
 *
 *   public get ready(): Promise<void> {
 *     return this._ready.promise;
 *   }
 *
 *   public onConfigurationLoaded(): void {
 *     this._ready.resolve();
 *   }
 *
 * }
 */
export default class Deferred<T> {


  // ---- //
  // Private properties
  // ---- //

  /** Current state of the Deferred Object */
  private _state: DeferredState = STATE.pending;

  /** A container for the Promise resolve function */
  private _resolve: ((value: T | PromiseLike<T>) => void) | undefined;

  /** A container for the Promise reject function */
  private _reject: ((reason?: any) => void) | undefined;


  // ---- //
  // Public properties
  // ---- //

  /**
   * The underlying promise, safe to hand out and to await any number of times.
   *
   * It is created — and its two settle functions captured — while the instance is being built, so
   * it is never `undefined` by the time anybody can reach it.
   */
  public promise: Promise<T> = new Promise((resolve, reject) => {
    this._resolve = resolve;
    this._reject = reject;
  });


  // ---- //
  // Public methods
  // ---- //

  /**
   * Fulfill the underlying promise.
   *
   * @param value The value to resolve the promise with
   * @throws {Error} When the object has already been resolved or rejected
   */
  public resolve(value: T): void {
    if (this._state !== STATE.pending) {
      throw new Error(`A Deferred object could not be settled twice, it is already ${this._state}`);
    }

    this._state = STATE.resolved;

    this._resolve!(value);
  }


  /**
   * Reject the underlying promise.
   *
   * @param reason The rejection reason, ideally an `Error`
   * @throws {Error} When the object has already been resolved or rejected
   */
  public reject(reason?: any): void {
    if (this._state !== STATE.pending) {
      throw new Error(`A Deferred object could not be settled twice, it is already ${this._state}`);
    }

    this._state = STATE.rejected;

    this._reject!(reason);
  }


  // ---- //
  // Public getters
  // ---- //

  /** Whether the object has not been settled yet */
  public get isPending(): boolean {
    return this._state === STATE.pending;
  }


  /** Whether the object has been resolved */
  public get isFulfilled(): boolean {
    return this._state === STATE.resolved;
  }


  /** Whether the object has been rejected */
  public get isRejected(): boolean {
    return this._state === STATE.rejected;
  }

}
