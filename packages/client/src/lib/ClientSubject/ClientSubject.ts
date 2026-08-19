import { BehaviorSubject } from 'rxjs';
import type { Observable, Observer, OperatorFunction, Subscription } from 'rxjs';

import { deepClone } from '@proedis/utils';

import Logger from '../Logger/Logger';


export default abstract class ClientSubject<T> {


  // ----
  // Private instance fields
  // ----
  private readonly _subjectLogger: Logger;


  // ----
  // Protected properties
  // ----
  private _internalSubject: BehaviorSubject<T> | undefined;

  private _isDisposed: boolean = false;


  private get _subject(): BehaviorSubject<T> {
    /** Assert the subject has been initialized */
    if (!this._internalSubject) {
      throw new Error(`${this._module}Subject has not been initialized yet`);
    }

    return this._internalSubject;
  }


  private get _subjectName(): string {
    return `${this._module}Subject`;
  }


  // ----
  // Client Subject Constructor
  // ----
  protected constructor(private readonly _module: string) {
    /** Instantiate the Logger */
    this._subjectLogger = Logger.forContext(this._subjectName);
  }


  // ----
  // Protected methods
  // ----
  protected _initializeSubject(data: T) {
    /** Assert the subject is not initialized yet */
    if (this._internalSubject) {
      throw new Error(`${this._subjectName} has already been initialized`);
    }

    /** Initialize the Subject */
    this._internalSubject = new BehaviorSubject<T>(data);
  }


  protected _next(data: T) {
    /** A disposed subject has no subscribers left to tell, and emitting into it would revive nothing */
    if (this._isDisposed) {
      this._subjectLogger.debug(`Skipping emission for the disposed ${this._subjectName}`);
      return;
    }

    this._subjectLogger.debug(`Emitting new data for ${this._subjectName}`, data);

    /**
     * Take ownership of the value before it goes in.
     *
     * This used to be a shallow spread, which meant every nested object inside the subject was the very
     * same object the *caller* had handed to `set`. A caller keeping a reference to what it passed — an
     * options object, a user record it goes on to edit — was writing straight into the client's state
     * afterwards, without going through `set` or `transact`: nothing was persisted, nothing was emitted,
     * and the next hash comparison found no change to save because the change was already inside.
     *
     * A deep copy also handles a `T` that is not a plain object: spreading an array produced an object.
     *
     * ⚠️ **What this does not do** is protect the subject from its own subscribers. A BehaviorSubject
     * keeps the value it emitted, so `value` and what a subscriber received are the same object: a
     * subscriber that mutates what it got still reaches the state. Closing that requires either freezing
     * the value or cloning on every read, and each has a cost of its own — it is a separate decision, not
     * something this copy quietly covers.
     *
     * ⚠️ Nested identities change on every emission. A consumer memoizing on a slice —
     * `useMemo(…, [ storage.userData ])` — recomputes whenever anything in the value changes, not only
     * that slice. Emissions are hash guarded upstream, so they only happen on a real change.
     */
    this._subject.next(deepClone(data));
  }


  // ----
  // Public properties
  // ----

  /** Whether this subject has been disposed, and will emit nothing further */
  public get isDisposed(): boolean {
    return this._isDisposed;
  }


  public get value(): T {
    return this._subject.value;
  }


  // ----
  // Public methods
  // ----
  public getValue(): T {
    return this._subject.getValue();
  }


  // ----
  // Subject implementation
  // ----
  public subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription {
    return this._subject.asObservable().subscribe(observerOrNext);
  }


  public pipe<A>(op1: OperatorFunction<T, A>): Observable<A> {
    return this._subject.asObservable().pipe(op1);
  }


  public asObservable(): Observable<T> {
    return this._subject.asObservable();
  }


  // ----
  // Teardown
  // ----

  /**
   * Complete the underlying subject, releasing every subscription taken out on it.
   *
   * There was no way to do this at all before, which meant a subject outlived whatever owned it: a
   * client rebuilt by a hot reload, a tenant switch or a test case left the previous one alive, still
   * holding every observer that had subscribed to it. Nothing failed — the listeners simply accumulated,
   * and kept the component trees that registered them reachable.
   *
   * The subject is **completed**, not unsubscribed: a completed BehaviorSubject still hands back its last
   * value, so reading `value` after disposal keeps working, while `unsubscribe()` would make it throw.
   * Calling this twice is a no-op.
   */
  public dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._subjectLogger.debug(`Disposing ${this._subjectName}`);

    this._isDisposed = true;
    this._internalSubject?.complete();
  }

}
