import type { ClassTransformOptions } from 'class-transformer';


export interface IEntityBase {

  toObject<R extends Record<string, any> = Record<string, any>>(): R;

  toObject<R extends Record<string, any> = Record<string, any>>(options: ClassTransformOptions | undefined): R;

  toJSON(): string;

  toJSON(options: ClassTransformOptions | undefined): string;

}
