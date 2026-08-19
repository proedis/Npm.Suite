import type { ClassTransformOptions } from 'class-transformer';


/**
 * The serialization surface every model inherits from `ModelerObject`.
 *
 * Note that `toJSON` takes no arguments: it is the hook `JSON.stringify` invokes, and the argument it
 * receives is the property key, not a configuration object. Options belong to `toObject` and
 * `toJsonString`.
 */
export interface IModelerObject {

  toObject<R extends Record<string, any> = Record<string, any>>(): R;

  toObject<R extends Record<string, any> = Record<string, any>>(options: ClassTransformOptions | undefined): R;

  toJSON(): Record<string, any>;

  toJsonString(): string;

  toJsonString(options: ClassTransformOptions | undefined): string;

}
