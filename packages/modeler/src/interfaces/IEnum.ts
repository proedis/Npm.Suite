import type { MantineColor } from '@mantine/core';
import type { IconName } from '@fortawesome/fontawesome-common-types';

import type { EnumName, EnumValue } from '../types';


export interface IEnum<C extends EnumName, V extends EnumValue<C> = EnumValue<C>> {
  readonly value: V;

  readonly label: string;

  readonly hashCode: number;

  readonly iconName: IconName;

  readonly color: MantineColor;

  is(value: EnumValue<C>): boolean;

  isOneOf(...values: EnumValue<C>[]): boolean;

  lt(value: EnumValue<C>): boolean;

  lte(value: EnumValue<C>): boolean;

  gt(value: EnumValue<C>): boolean;

  gte(value: EnumValue<C>): boolean;

  toString(): string;

  toJSON(): string;
}
