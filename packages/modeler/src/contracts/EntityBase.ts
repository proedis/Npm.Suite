import { instanceToPlain, instanceToInstance, plainToInstance } from 'class-transformer';
import type { ClassConstructor, ClassTransformOptions } from 'class-transformer';

import type { IEntityBase } from '../interfaces';


/**
 * The EntityBase Model that must be used as an
 * extensions to all models built.
 * That's because it contains base method to transform
 * the instance into a plain object or into json
 */
export abstract class EntityBase implements IEntityBase {

  /**
   * Create a new instance of the class cloning data from a source object
   * @param source
   */
  public static from<T, V extends object & { length?: never }>(this: ClassConstructor<T>, source: V): T;
  public static from<T, V extends Array<any>>(this: ClassConstructor<T>, source: V): T[];
  public static from<T, V>(this: ClassConstructor<T>, source: V | V[]): T | T[] {
    return plainToInstance(this as ClassConstructor<T>, source);
  }


  /**
   * This method will transform the class object into a new instance of
   * the same class object. This may be treated as deep cloning the objects
   * @param options
   */
  public clone(options?: ClassTransformOptions): this {
    return instanceToInstance(this, options);
  }


  /**
   * Transform the EntityBase instance (or the class that implements that)
   * into a plain object
   * @param options
   */
  public toObject(options?: ClassTransformOptions): Record<string, any> {
    return instanceToPlain(this, options);
  }


  /**
   * Transform the EntityBase instance (or the class that implements that)
   * into a JSON string
   * @param options
   */
  public toJSON(options?: ClassTransformOptions): string {
    return JSON.stringify(this.toObject(options));
  }
}
