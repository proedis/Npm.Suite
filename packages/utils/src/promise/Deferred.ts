enum DeferredState {
  PENDING = 1,
  RESOLVED = 2,
  REJECTED = 3
}

export default class Deferred<T> {

  /** Current state of the Deferred Object */
  private state: DeferredState = DeferredState.PENDING;

  /** A container for the Promise resolve function */
  private _resolve: ((value: T | PromiseLike<T>) => void) | undefined;

  /** A container for the Promise reject function */
  private _reject: ((reason?: any) => void) | undefined;

  /** The internal Promise of the Deferred Object */
  public promise: Promise<T> = new Promise((resolve, reject) => {
    this._resolve = resolve;
    this._reject = reject;
  });


  /** A public function to resolve the internal promise */
  public resolve(value: T): void {
    if (this.state !== DeferredState.PENDING) {
      throw new Error('A Deferred Object could not be resolved twice');
    }

    this.state = DeferredState.RESOLVED;

    this._resolve!(value);
  }


  /** A public function to reject the internal promise */
  public reject(reason?: any): void {
    if (this.state !== DeferredState.PENDING) {
      throw new Error('A Deferred Object could not be resolved twice');
    }

    this.state = DeferredState.REJECTED;

    this._reject!(reason);
  }


  /** Check if Deferred is still Pending */
  public get isPending(): boolean {
    return this.state === DeferredState.PENDING;
  }


  /** Check if Deferred is Fulfilled */
  public get isFulfilled(): boolean {
    return this.state === DeferredState.RESOLVED;
  }


  /** Check if Deferred is Rejected */
  public get isRejected(): boolean {
    return this.state === DeferredState.REJECTED;
  }

}
