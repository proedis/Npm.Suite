import { isNil } from '@proedis/utils';

import { Enum } from './Enum';

import type { EnumName, EnumValue } from '../types';


/* --------
 * Class Definition
 * -------- */
export class Flags<C extends EnumName> extends Array<Enum<C, EnumValue<C>>> {


  // ----
  // Static Properties & Methods
  // ----
  public static isFlag(value: any): value is Flags<any> {
    return !isNil(value) && value instanceof Flags;
  }


  public static get [Symbol.species]() {
    return Array;
  }


  // ----
  // Instance Constructor
  // ----
  constructor(private readonly _collectionName: C, source: EnumValue<C>[]) {
    super(...source.map((value) => Enum.getEnum(_collectionName, value)));
  }


  // ----
  // Private Helper
  // ----
  private _createFromEnums(enums: Enum<C, EnumValue<C>>[]): Flags<C> {
    return new Flags(this._collectionName, enums.map(e => e.value));
  }


  // ----
  // Public Getters
  // ----
  public get flags(): EnumValue<C>[] {
    return this.map((s) => s.value);
  }


  public get labels(): string[] {
    return this.map((s) => s.label);
  }


  // ----
  // Checkers Methods
  // ----

  public hasFlag(value: EnumValue<C>): boolean {
    return this.some((s) => s.is(value));
  }


  /**
   * @deprecated This function has completely been replaced from the `hasAll` method
   * @param values - The enum values to check for presence.
   */
  public is(...values: EnumValue<C>[]): boolean {
    return values.every((v) => this.some((s) => s.is(v)));
  }


  /**
   * Checks if all specified enum values are present in the current flag set.
   *
   * @param values - The enum values to check for presence.
   * @returns True if all values are present; otherwise, false.
   */
  public hasAll(...values: EnumValue<C>[]): boolean {
    return values.every(v => this.hasFlag(v));
  }


  /**
   * Checks if at least one of the specified enum values is present in the current flag set.
   *
   * @param values - The enum values to check for.
   * @returns True if at least one value is present; otherwise, false.
   */
  public hasAny(...values: EnumValue<C>[]): boolean {
    return values.some(v => this.hasFlag(v));
  }


  /**
   * Checks if none of the specified enum values are present in the current flag set.
   *
   * @param values - The enum values to verify absence for.
   * @returns True if none of the values are present; otherwise, false.
   */
  public hasNone(...values: EnumValue<C>[]): boolean {
    return !this.hasAny(...values);
  }


  /**
   * Checks if the current flag set is a strict subset of the specified values.
   *
   * @param values - The values to check against.
   * @returns True if all current flags exist within the specified values.
   */
  public isSubsetOf(...values: EnumValue<C>[]): boolean {
    const valueSet = new Set(values);
    return this.every(s => valueSet.has(s.value));
  }


  /**
   * Checks if the current flag set is a strict superset of the specified values.
   *
   * @param values - The values that must all be contained in the current flag set.
   * @returns True if all specified values are present in the current flag set.
   */
  public isSupersetOf(...values: EnumValue<C>[]): boolean {
    return values.every(v => this.hasFlag(v));
  }


  // ----
  // Modifiers
  // ----

  /**
   * Adds the specified enum value to the current flag set if not already present.
   *
   * @param value - The enum value to add.
   */
  public addFlag(value: EnumValue<C>): void {
    /** Add the value only if it is not present into the original array */
    if (!this.hasFlag(value)) {
      this.push(Enum.getEnum(this._collectionName, value));
    }
  }


  /**
   * Adds multiple enum values to the current flag set, avoiding duplicates.
   *
   * @param values - The enum values to add.
   */
  public addFlags(...values: EnumValue<C>[]): void {
    for (const v of values) {
      this.addFlag(v);
    }
  }


  /**
   * Removes the specified enum value from the current flag set.
   * All occurrences are removed if duplicates exist.
   *
   * @param value - The enum value to remove.
   */
  public removeFlag(value: EnumValue<C>): void {
    let index: number;
    while ((index = this.findIndex(s => s.is(value))) !== -1) {
      this.splice(index, 1);
    }
  }


  /**
   * Removes multiple enum values from the current flag set.
   *
   * @param values - The enum values to remove.
   */
  public removeFlags(...values: EnumValue<C>[]): void {
    for (const v of values) {
      this.removeFlag(v);
    }
  }


  /**
   * Toggles the presence of the specified enum value.
   * Adds it if not present; removes it if already present.
   *
   * @param value - The enum value to toggle.
   */
  public toggleFlag(value: EnumValue<C>): void {
    if (this.hasFlag(value)) {
      this.removeFlag(value);
    }
    else {
      this.addFlag(value);
    }
  }


  /**
   * Toggles the presence of multiple enum values.
   *
   * @param values - The enum values to toggle.
   */
  public toggleFlags(...values: EnumValue<C>[]): void {
    for (const v of values) {
      this.toggleFlag(v);
    }
  }


  /**
   * Clears all flags from the current set.
   */
  public clear(): void {
    this.splice(0, this.length);
  }


  /**
   * Replaces the current flag set with the specified values.
   *
   * @param values - The enum values to set.
   */
  public set(...values: EnumValue<C>[]): void {
    this.clear();
    this.addFlags(...values);
  }


  /**
   * Creates a new Flags instance containing only the elements that match the given predicate.
   *
   * @param predicate - A function to test each enum element.
   * @returns A new Flags instance with the filtered elements.
   */
  public where(
    predicate: (value: Enum<C, EnumValue<C>>, index: number, array: Enum<C, string>[]) => boolean
  ): Flags<C> {
    return this._createFromEnums(super.filter(predicate));
  }


  /**
   * Creates a new Flags instance excluding the specified enum values.
   *
   * @param values - Enum values to exclude from the current flag set.
   * @returns A new Flags instance without the specified values.
   */
  public except(...values: EnumValue<C>[]): Flags<C> {
    return this.where(v => !values.includes(v.value));
  }


  /**
   * Creates a new Flags instance containing only the specified enum values, if present.
   *
   * @param values - Enum values to retain.
   * @returns A new Flags instance containing only the specified values.
   */
  public only(...values: EnumValue<C>[]): Flags<C> {
    return this.where(v => values.includes(v.value));
  }


  // ----
  // Converters
  // ----
  public toString(): string {
    return this.labels.join(', ');
  }


  public toObject(): EnumValue<C>[] {
    return this.map((s) => s.value);
  }


  public toJSON(): string {
    return JSON.stringify(this.toObject());
  }

}
