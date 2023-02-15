import { BehaviorSubject } from 'rxjs';
import type { Observable, Observer, OperatorFunction, Subscription } from 'rxjs';

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
    this._subjectLogger.debug(`Emitting new data for ${this._subjectName}`, data);
    this._subject.next({ ...data });
  }


  // ----
  // Public properties
  // ----
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

}
