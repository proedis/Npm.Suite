/* eslint-disable @typescript-eslint/no-redeclare */

export type Environment = 'development' | 'production' | 'test' | 'staging';
export const Environment = String;

export type Nullable<T> = T | null;
export const Nullable = Object;

export type Nillable<T> = Nullable<T> | undefined;
export const Nillable = Object;
