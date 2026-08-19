import { BehaviorSubject } from 'rxjs';
import type { Observable, Observer, OperatorFunction, Subscription } from 'rxjs';

import { deepClone, deepFreeze } from '@proedis/utils';

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
  /**
   * Take ownership of a value on its way into the subject, and hand out something nobody can corrupt.
   *
   * Cloning comes first: whatever was passed in — the caller's initial data, the object handed to `set` —
   * stays theirs and stays mutable. Freezing comes second, and applies to the copy only.
   *
   * The freeze is what closes the other half of the problem. A BehaviorSubject *keeps* the value it
   * emitted, so `value` and what a subscriber received are the same object: without this, a subscriber
   * writing to `value.userData.name` reached straight into the client's state, bypassing `set` and
   * `transact` — nothing persisted, nothing emitted, and the next hash comparison found no change to save
   * because the change was already inside. Now that write throws, which is a bug report instead of a
   * corruption.
   *
   * ⚠️ Freezing locks properties, not the internal state of an exotic object: a `Date`, a `Map` or a `Set`
   * held inside the value can still be mutated through its own methods. Objects and arrays — which is
   * what storage data is made of — are genuinely protected.
   *
   * @param data The value entering the subject
   */
  private _seal(data: T): T {
    return deepFreeze(deepClone(data));
  }


  protected _initializeSubject(data: T) {
    /** Assert the subject is not initialized yet */
    if (this._internalSubject) {
      throw new Error(`${this._subjectName} has already been initialized`);
    }

    /**
     * Initialize the Subject.
     *
     * The initial value goes through the same treatment as every later one. It used not to, which made it
     * the one value in the store's life that was both mutable *and* shared with the caller: a client
     * built with 'initialStorage' handed that very object out until the first write replaced it.
     */
    this._internalSubject = new BehaviorSubject<T>(this._seal(data));
  }


  protected _next(data: T) {
    /** A disposed subject has no subscribers left to tell, and emitting into it would revive nothing */
    if (this._isDisposed) {
      this._subjectLogger.debug(`Skipping emission for the disposed ${this._subjectName}`);
      return;
    }

    this._subjectLogger.debug(`Emitting new data for ${this._subjectName}`, data);

    /**
     * Emit an owned, frozen copy — see {@link _seal}. This used to be a shallow spread, which isolated
     * nothing: every nested object inside the emitted value was the very same object the caller had
     * handed to `set`.
     *
     * ⚠️ Nested identities change on every emission. A consumer memoizing on a slice —
     * `useMemo(…, [ storage.userData ])` — recomputes whenever anything in the value changes, not only
     * that slice. Emissions are hash guarded upstream, so they only happen on a real change.
     */
    this._subject.next(this._seal(data));
  }


  // ----
  // Public properties
  // ----

  /** Whether this subject has been disposed, and will emit nothing further */
  public get isDisposed(): boolean {
    return this._isDisposed;
  }


  /**
   * Whether the subject exists yet, and `value` can therefore be read.
   *
   * Reading `value` before initialization throws, which is the right thing for a programming error and the
   * wrong thing for a fast path: a caller that would rather skip work when the value is already there
   * needs to ask first. It stays protected because it is an implementation detail — a consumer awaits
   * `isInitialized()` instead.
   */
  protected get _isSubjectInitialized(): boolean {
    return !!this._internalSubject;
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
