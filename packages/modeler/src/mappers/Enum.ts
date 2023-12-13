import { AugmentedMap, isNil } from '@proedis/utils';

import type { MantineColor } from '@mantine/core';
import type { IconName } from '@fortawesome/fontawesome-common-types';

import type { EnumName, EnumsCollections, EnumsColors, EnumsIcons, EnumsOf, EnumSource, EnumValue } from '../types';

import type { IEnum } from '../interfaces';


/* --------
 * Class Definition
 * -------- */
export class Enum<C extends EnumName, V extends EnumValue<C> = EnumValue<C>> implements IEnum<C, V> {

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


  private static readonly _enumsCache = new AugmentedMap<string, Enum<any, any>>();


  public static getEnum<C extends EnumName, V extends EnumValue<C>>(name: C, value: V): Enum<C, V> {
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


  public static isEnum(value: any): value is Enum<any, any> {
    return !isNil(value) && value instanceof Enum;
  }


  private static getHashCode<C extends EnumName, V extends EnumValue<C>>(name: C, value: V): number {
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
    private readonly _source: EnumSource<C, V>
  ) {
  }


  // ----
  // Public Getters
  // ----
  public get value(): V {
    return this._source.value;
  }


  public get label(): string {
    return this._source.label;
  }


  public get hashCode(): number {
    return this._source.intValue;
  }


  // ----
  // Checkers methods
  // ----
  public is(value: EnumValue<C>): boolean {
    /** Compare hash code of two elements */
    return Enum.getHashCode(this._collectionName, value) === this.hashCode;
  }


  public isOneOf(...values: EnumValue<C>[]): boolean {
    return values.some((value) => this.is(value));
  }


  public lt(value: EnumValue<C>): boolean {
    return this.hashCode < Enum.getHashCode(this._collectionName, value);
  }


  public lte(value: EnumValue<C>): boolean {
    return this.hashCode <= Enum.getHashCode(this._collectionName, value);
  }


  public gt(value: EnumValue<C>): boolean {
    return this.hashCode > Enum.getHashCode(this._collectionName, value);
  }


  public gte(value: EnumValue<C>): boolean {
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
