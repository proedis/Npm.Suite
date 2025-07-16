import { AugmentedMap, isNil } from '@proedis/utils';

import type { MantineColor } from '@mantine/core';
import type { IconName } from '@fortawesome/fontawesome-common-types';

import type { EnumName, EnumsCollections, EnumsColors, EnumsIcons, EnumsOf, EnumSource, EnumValue } from '../types';


/* --------
 * Class Definition
 * -------- */
export class Enum<C extends EnumName> {

  // ----
  // Static Properties & Methods
  // ----
  private static _defaultColor: MantineColor = 'red';

  private static _colors: EnumsColors = {};


  public static configureColors(defaultColor: MantineColor, colors: EnumsColors): typeof Enum {
    this._defaultColor = defaultColor;
    this._colors = colors;
    return this;
  }


  private static _defaultIcon: IconName = 'bug';

  private static _icons: EnumsIcons = {};


  public static configureIcons(defaultIcon: IconName, icons: EnumsIcons): typeof Enum {
    this._defaultIcon = defaultIcon;
    this._icons = icons;
    return this;
  }


  private static _labelFormatter: ((label: string) => string) | undefined;


  public static setLabelFormatter(formatter: ((label: string) => string) | undefined): typeof Enum {
    this._labelFormatter = formatter;
    return this;
  }


  private static _collections: EnumsCollections = {};


  public static configureCollections(collections: EnumsCollections): typeof Enum {
    this._collections = collections;
    return this;
  }


  public static getCollection<C extends EnumName>(name: C): EnumsOf<C> {
    /** Get the collection named as request */
    const collection = this._collections[name] as (EnumsOf<C> | undefined);

    if (!collection) {
      throw new Error(`Enums Collection for ${name} is not defined`);
    }

    return collection;
  }


  private static readonly _enumsCache = new AugmentedMap<string, Enum<any>>();


  public static getEnum<C extends EnumName>(name: C, value: EnumValue<C>): Enum<C> {
    /** Create the unique key for the enum */
    const key = `${name}--${value}`;

    /** Return cached enum or find a new one from collections */
    return this._enumsCache.getOrAdd(key, () => {
      /** Get the collection from the internal source */
      const collection = this.getCollection(name);

      /** Find the right source object from the collection */
      const source = collection.find((e) => e.value === value);

      /** If no source has been found, return null */
      if (!source) {
        throw new Error(`Enum value ${value} is not defined for collection ${name}`);
      }

      /** Return a new instance of the enum */
      return new Enum(name, source);
    });
  }


  public static isEnum(value: any): value is Enum<any> {
    return !isNil(value) && value instanceof Enum;
  }


  private static getHashCode<C extends EnumName>(name: C, value: EnumValue<C> | Enum<C>): number {
    /** Check if the value is already an Enum */
    if (Enum.isEnum(value)) {
      return value.hashCode;
    }

    /** Assert al params are strings */
    if (!name || !value) {
      return Number.MIN_SAFE_INTEGER;
    }

    return this.getEnum(name, value)?.hashCode ?? Number.MIN_SAFE_INTEGER;
  }


  // ----
  // Instance Constructor
  // ----
  constructor(
    private readonly _collectionName: C,
    private readonly _source: EnumSource<C>
  ) {
  }


  // ----
  // Well-Known Methods
  // ----
  /**
   * Returns the primitive value of the object.
   *
   * @param hint - The type hint provided to convert the object into primitive.
   * @return The primitive value of the object based on the given type hint.
   */
  [Symbol.toPrimitive](hint: string): number | EnumValue<C> {
    if (hint === 'number') {
      return this.hashCode;
    }

    return this.value;
  }


  // ----
  // Public Getters
  // ----
  public get value(): EnumValue<C> {
    return this._source.value;
  }


  public get label(): string {
    return Enum._labelFormatter ? Enum._labelFormatter(this._source.label) : this._source.label;
  }


  public get hashCode(): number {
    return this._source.intValue;
  }


  // ----
  // Checkers methods
  // ----
  public is(value: Enum<C>): boolean;
  public is(value: EnumValue<C>): boolean;
  public is(value: Enum<C> | EnumValue<C>): boolean {
    /** Compare hash code of two elements */
    return Enum.getHashCode(this._collectionName, value) === this.hashCode;
  }


  public isOneOf(...values: Enum<C>[]): boolean
  public isOneOf(...values: EnumValue<C>[]): boolean
  public isOneOf(...values: (Enum<C> | EnumValue<C>)[]): boolean {
    return values.some((value) => this.is(value as (Exclude<Enum<C> | EnumValue<C>, string>)));
  }


  public lt(value: Enum<C>): boolean;
  public lt(value: EnumValue<C>): boolean;
  public lt(value: Enum<C> | EnumValue<C>): boolean {
    return this.hashCode < Enum.getHashCode(this._collectionName, value);
  }


  public lte(value: Enum<C>): boolean;
  public lte(value: EnumValue<C>): boolean;
  public lte(value: Enum<C> | EnumValue<C>): boolean {
    return this.hashCode <= Enum.getHashCode(this._collectionName, value);
  }


  public gt(value: Enum<C>): boolean;
  public gt(value: EnumValue<C>): boolean;
  public gt(value: Enum<C> | EnumValue<C>): boolean {
    return this.hashCode > Enum.getHashCode(this._collectionName, value);
  }


  public gte(value: Enum<C>): boolean;
  public gte(value: EnumValue<C>): boolean;
  public gte(value: Enum<C> | EnumValue<C>): boolean {
    return this.hashCode >= Enum.getHashCode(this._collectionName, value);
  }


  // ----
  // Computed and Configured Data
  // ----

  public get iconName(): IconName {
    return Enum._icons[this._collectionName]?.[this.value] ?? Enum._defaultIcon;
  }


  public get color(): MantineColor {
    return Enum._colors[this._collectionName]?.[this.value] ?? Enum._defaultColor;
  }


  // ----
  // Converters
  // ----

  public toString(): string {
    return this.value;
  }


  public toJSON(): string {
    return this.toString();
  }

}
