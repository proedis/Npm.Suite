import type { Instantiable, Nillable } from '@proedis/types';
import { isObject } from '../object';


export default class GuardAndThrow<TError extends Error> {

  private readonly _args: any[];


  constructor(
    private readonly error: Instantiable<TError>,
    ...args: ConstructorParameters<Instantiable<TError>>
  ) {
    this._args = args;
  }


  private _assert<T>(assertion: () => boolean, yieldedReturn: T) {
    if (assertion()) {
      return yieldedReturn;
    }

    throw this._buildError();
  }


  private _buildError(): TError {
    return new this.error(...this._args);
  }


  public if(value: boolean): boolean {
    return this._assert(() => !value, value);
  }


  public ifNot(value: boolean): boolean {
    return this._assert(() => value, value);
  }


  public ifNil<T>(value: Nillable<T>): T {
    return this._assert(() => value != null, value) as T;
  }


  public ifNotNil<T>(value: Nillable<T>): null {
    return this._assert(() => value == null, null);
  }


  public ifNullOrEmpty<T>(value: Nillable<T>): T {
    return this._assert(() => {
      /** Check value is null or undefined */
      if (value == null) {
        return false;
      }

      /** Check value is a string */
      if (typeof value === 'string' || Array.isArray(value)) {
        return !!value.length;
      }

      /** Check value is an object */
      if (isObject(value)) {
        return !!Object.keys(value).length;
      }

      return false;
    }, value) as T;
  }


  public ifIn<T>(value: T, collection: T[]): null {
    return this._assert(() => collection.includes(value), null);
  }


  public ifNotIn<T>(value: T, collection: T[]): T {
    return this._assert(() => !collection.includes(value), value);
  }

}
