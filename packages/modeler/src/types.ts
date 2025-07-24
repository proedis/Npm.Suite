import type { Dayjs } from 'dayjs';

import type { MantineColor } from '@mantine/core';
import type { IconName } from '@fortawesome/fontawesome-common-types';

import type { TransformOptions } from 'class-transformer';

import type { Nullable } from '@proedis/types';


/* --------
 * Useful Types
 * -------- */
export type DateTime = Dayjs;

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

export type EnumsCollections = Record<EnumName, Readonly<EnumsOf<EnumName>>>;

export type EnumSource<E extends EnumName, V extends EnumValue<E> = EnumValue<E>> = EnumDescriptor<V>;

export type EnumsColors = Partial<{
  [K in EnumName]: Partial<Record<EnumValue<K>, MantineColor>>
}>;

export type EnumsIcons = Partial<{
  [K in EnumName]: Partial<Record<EnumValue<K>, IconName>>
}>;


/* --------
 * Custom Decorator Options
 * -------- */
export type DecoratorOptions = Exclude<TransformOptions, 'toClassOnly' | 'toPlainOnly'>;
