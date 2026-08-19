import dayjs from 'dayjs';

import type { Dayjs } from 'dayjs';

import type { TransformOptions } from 'class-transformer';

import type { Nullable } from '@proedis/types';


/* --------
 * Useful Types
 * -------- */

/**
 * A point in time, as produced by the `AsDayJs` decorator.
 *
 * The name carries both a type and a value, the way `dayjs` itself does: as a **type** it is a Day.js
 * instance, as a **value** it is the factory that builds one.
 *
 * @example
 * class Ticket extends ModelerObject {
 *   @AsDayJs()
 *   public createdAt!: DateTime;
 * }
 *
 * const now: DateTime = DateTime();
 */
export type DateTime = Dayjs;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DateTime = dayjs;

/** A point in time that may be absent */
export type NullableDateTime = Nullable<DateTime>;

export type InvalidTryParseResult = { success: false, value: null };

export type ValidTryParseResult<T> = { success: true, value: T };

export type TryParseResult<T> =
  | InvalidTryParseResult
  | ValidTryParseResult<T>;


/* --------
 * Enum Descriptor Interface
 * -------- */
export interface EnumDescriptor<V extends string> {
  /** The enumerator system int value */
  intValue: number;

  /** The SharedObject Label to Display */
  label: string;

  /** The enumerator value to pass to API endpoint */
  value: V;
}


/* --------
 * Overridable Types
 * -------- */
export interface ModelerOverride {

}

export type ComposedEnums = ModelerOverride extends { enums: infer E }
  ? E
  : ({ [key: string]: string });

export type EnumName = Extract<keyof ComposedEnums, string>;

export type EnumValue<E extends EnumName> = ComposedEnums[E];

export type EnumsOf<E extends EnumName> = EnumDescriptor<EnumValue<E>>[];

/**
 * Color and icon tokens are defined by the consuming application, not by this package.
 * They used to be typed as '@mantine/core' MantineColor and '@fortawesome' IconName:
 * that pulled a UI kit and an icon set into the public type surface of a data modeling
 * package, and since both were only devDependencies the emitted .d.ts referenced two
 * modules that were never installed alongside it.
 *
 * Override them from the application the same way 'enums' is overridden:
 *
 *   declare module '@proedis/modeler' {
 *     interface ModelerOverride {
 *       enums: MyEnums;
 *       color: MantineColor;
 *       icon: IconName;
 *     }
 *   }
 */
export type EnumColor = ModelerOverride extends { color: infer C } ? C : string;

export type EnumIcon = ModelerOverride extends { icon: infer I } ? I : string;

export type EnumsCollections = Record<EnumName, Readonly<EnumsOf<EnumName>>>;

export type EnumSource<E extends EnumName, V extends EnumValue<E> = EnumValue<E>> = EnumDescriptor<V>;

export type EnumsColors = Partial<{
  [K in EnumName]: Partial<Record<EnumValue<K>, EnumColor>>
}>;

export type EnumsIcons = Partial<{
  [K in EnumName]: Partial<Record<EnumValue<K>, EnumIcon>>
}>;


/* --------
 * Custom Decorator Options
 * -------- */

/**
 * The `Transform` options a Proedis decorator accepts.
 *
 * `toClassOnly` and `toPlainOnly` are removed on purpose: each decorator declares both directions
 * itself, and overriding either one from the outside makes the plain-to-class transform run on the way
 * out as well. This used to be written with `Exclude`, which operates on unions and therefore removed
 * nothing at all from an object type.
 */
export type DecoratorOptions = Omit<TransformOptions, 'toClassOnly' | 'toPlainOnly'>;
