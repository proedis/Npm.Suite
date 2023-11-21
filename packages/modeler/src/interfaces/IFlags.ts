import type { EnumName, EnumValue } from '../types';
import type { Flags } from '../mappers';


export interface IFlags<C extends EnumName, V extends EnumValue<C> = EnumValue<C>> {
  readonly values: V[];

  readonly labels: string[];

  is(...values: EnumValue<C>[]): boolean;

  hasFlag(value: EnumValue<C>): boolean;

  addFlag<N extends EnumValue<C>>(value: N): N extends V ? Flags<C, V> : Flags<C, V | N>;

  removeFlag<N extends EnumValue<C>>(value: N): N extends V ? Flags<C, Exclude<V, N>> : Flags<C, V>;

  toString(): string;

  toObject(): EnumValue<C>[];

  toJSON(): string;
}
