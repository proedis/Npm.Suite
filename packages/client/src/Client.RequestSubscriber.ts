import { Subscriber } from 'rxjs';
import type { Observer } from 'rxjs';


export default class RequestSubscriber<Response> extends Subscriber<Response> {

  // ----
  // Private Properties
  // ----
  private _abortController: AbortController = new AbortController();

  private _completed: boolean = false;


  // ----
  // RequestSubscriber Constructor
  // ----
  constructor(
    observer: Observer<Response>,
    request: (abortController: AbortController) => Promise<Response>
  ) {
    super(observer);

    /** Perform the request with factory function */
    request(this._abortController)
      /** Emit the successful response to observer */
      .then((response) => {
        observer.next(response);
        observer.complete();
      })
      /** Catch request error */
      .catch((error) => {
        observer.error(error);
      })
      /** Set the Subscriber as completed */
      .finally(() => {
        this._completed = true;
      });
  }


  // ----
  // Overridden Methods
  // ----

  public unsubscribe() {
    super.unsubscribe();

    /** Send the abort signal */
    if (!this._completed) {
      this._abortController.abort();
      this._completed = true;
    }
  }
}
