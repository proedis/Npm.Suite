import { isNil } from '@proedis/utils';

import { Enum } from './Enum';

import type { EnumName, EnumValue } from '../types';

import type { IFlags } from '../interfaces/IFlags';


/* --------
 * Class Definition
 * -------- */
export class Flags<C extends EnumName, V extends EnumValue<C> = EnumValue<C>> implements IFlags<C, V> {

  // ----
  // Static Properties & Methods
  // ----

  public static isFlag(value: any): value is Flags<any, any> {
    return !isNil(value) && value instanceof Flags;
  }


  // ----
  // Instance Constructor
  // ----
  constructor(
    private readonly _collectionName: C,
    source: V[]
  ) {
    this._source = source.map((value) => Enum.getEnum(_collectionName, value));
  }


  // ----
  // Internal Properties
  // ----
  private _source: Enum<C, V>[] = [];


  // ----
  // Public Getters
  // ----
  public get values(): V[] {
    return this._source.map((s) => s.value);
  }


  public get labels(): string[] {
    return this._source.map((s) => s.label);
  }


  // ----
  // Checkers Methods
  // ----

  public is(...values: EnumValue<C>[]): boolean {
    return values.every((v) => this._source.some((s) => s.is(v)));
  }


  public hasFlag(value: EnumValue<C>): boolean {
    return this._source.some((s) => s.is(value));
  }


  // ----
  // Modifiers
  // ----

  public addFlag<N extends EnumValue<C>>(value: N): N extends V ? Flags<C, V> : Flags<C, V | N> {
    /** Add the value only if it is not present into original array */
    if (!this.hasFlag(value)) {
      this._source.push(Enum.getEnum(this._collectionName, value) as any);
    }

    return this as any;
  }


  public removeFlag<N extends EnumValue<C>>(value: N): N extends V ? Flags<C, Exclude<V, N>> : Flags<C, V> {
    this._source = this._source.filter((s) => !s.is(value));
    return this as any;
  }


  // ----
  // Converters
  // ----

  public toString(): string {
    return this.labels.join(', ');
  }


  public toObject(): EnumValue<C>[] {
    return this._source.map((s) => s.value);
  }


  public toJSON(): string {
    return JSON.stringify(this.toObject());
  }

}
